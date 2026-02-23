#!/usr/bin/env python3
"""
Tidal API bridge — CLI sidecar called from Node.js server functions.

Usage:
    python tidal_bridge.py check_auth                    # Check if authenticated
    python tidal_bridge.py login_start                   # Start device OAuth, returns URL+code
    python tidal_bridge.py login_poll <device_code>      # Poll for auth completion
    python tidal_bridge.py fetch_playlist <playlist_id>
    python tidal_bridge.py similar_artists <artist1> ...
    python tidal_bridge.py track_radio <track_id1> ...

Output: JSON to stdout. Errors to stderr.
"""

import sys
import json
import os
from datetime import datetime, timezone
import tidalapi

SESSION_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tidal_session.json")


def _parse_expiry(raw) -> datetime | None:
    """Convert a stored float timestamp back to a datetime for tidalapi."""
    if not raw:
        return None
    return datetime.fromtimestamp(float(raw), tz=timezone.utc)


def save_session(session: tidalapi.Session):
    """Save session tokens for reuse."""
    data = {
        "token_type": session.token_type,
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "expiry_time": session.expiry_time.timestamp() if session.expiry_time else 0,
    }
    with open(SESSION_FILE, "w") as f:
        json.dump(data, f)


def get_session() -> tidalapi.Session:
    """
    Restore an authenticated Tidal session from saved tokens.
    Does NOT start interactive OAuth — fails with exit code 2 if no session.
    """
    session = tidalapi.Session()

    if not os.path.exists(SESSION_FILE):
        print(json.dumps({"error": "not_authenticated", "message": "No Tidal session found."}))
        sys.exit(2)

    try:
        with open(SESSION_FILE, "r") as f:
            data = json.load(f)
        session.load_oauth_session(
            token_type=data["token_type"],
            access_token=data["access_token"],
            refresh_token=data.get("refresh_token"),
            expiry_time=_parse_expiry(data.get("expiry_time")),
        )
        if session.check_login():
            return session

        # If check_login fails but we have a refresh token, tidalapi may have
        # already refreshed internally. Re-save and try once more.
        save_session(session)
        if session.check_login():
            return session

        # Session truly expired
        os.remove(SESSION_FILE)
        print(json.dumps({"error": "session_expired", "message": "Tidal session expired."}))
        sys.exit(2)

    except Exception as e:
        print(json.dumps({"error": "auth_error", "message": str(e)}))
        sys.exit(2)


def cmd_check_auth():
    """Check if we have a valid Tidal session."""
    session = tidalapi.Session()

    if not os.path.exists(SESSION_FILE):
        print(json.dumps({"authenticated": False}))
        return

    try:
        with open(SESSION_FILE, "r") as f:
            data = json.load(f)
        session.load_oauth_session(
            token_type=data["token_type"],
            access_token=data["access_token"],
            refresh_token=data.get("refresh_token"),
            expiry_time=_parse_expiry(data.get("expiry_time")),
        )
        if session.check_login():
            save_session(session)  # Persist any refreshed tokens
            print(json.dumps({"authenticated": True}))
        else:
            print(json.dumps({"authenticated": False}))
    except Exception:
        print(json.dumps({"authenticated": False}))


def cmd_login_start():
    """Start device OAuth flow — returns the verification URL and user code."""
    session = tidalapi.Session()
    link_login = session.get_link_login()

    print(json.dumps({
        "verification_uri": link_login.verification_uri,
        "verification_uri_complete": link_login.verification_uri_complete,
        "user_code": link_login.user_code,
        "device_code": link_login.device_code,
        "expires_in": link_login.expires_in,
        "interval": link_login.interval,
    }))


def cmd_login_poll(device_code: str):
    """Poll once to check if device login is complete."""
    session = tidalapi.Session()

    # Reconstruct a minimal LinkLogin-like object for _check_link_login
    # We call the token endpoint directly since we need a single-shot check
    url = session.config.api_oauth2_token
    params = {
        "client_id": session.config.client_id,
        "client_secret": session.config.client_secret,
        "device_code": device_code,
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "scope": "r_usr w_usr w_sub",
    }

    request = session.request_session.post(url, params)
    result = request.json()

    if request.ok:
        # Success — process the token and save session
        session.process_auth_token(result, is_pkce_token=False)
        save_session(session)
        print(json.dumps({"status": "authenticated"}))
    elif result.get("error") == "expired_token":
        print(json.dumps({"status": "expired"}))
    elif result.get("error") == "authorization_pending":
        print(json.dumps({"status": "pending"}))
    else:
        print(json.dumps({"status": "error", "message": result.get("error_description", result.get("error", "Unknown error"))}))


def track_to_dict(track) -> dict:
    """Convert a tidalapi Track to a serializable dict."""
    return {
        "id": str(track.id),
        "title": track.name,
        "artist": track.artist.name if track.artist else "Unknown",
        "album": track.album.name if track.album else "Unknown",
        "duration": track.duration or 0,
    }


def cmd_fetch_playlist(playlist_id: str):
    """Fetch all tracks from a Tidal playlist."""
    session = get_session()
    playlist = session.playlist(playlist_id)
    tracks = playlist.tracks(limit=9999)
    result = [track_to_dict(t) for t in tracks]
    print(json.dumps(result, ensure_ascii=False))


def cmd_similar_artists(artist_names: list[str]):
    """Find similar artists and their top tracks for given artist names."""
    session = get_session()
    results = []

    for name in artist_names:
        try:
            search = session.search(name, models=[tidalapi.artist.Artist], limit=1)
            hit = search.get("top_hit") or search.get("artists", [])
            artist = hit[0] if isinstance(hit, list) else hit

            if not artist or not hasattr(artist, "get_similar"):
                continue

            similar = artist.get_similar()
            for sim_artist in similar[:3]:
                try:
                    top_tracks = sim_artist.get_top_tracks(limit=5)
                    results.append({
                        "source_artist": name,
                        "similar_artist": sim_artist.name,
                        "tracks": [track_to_dict(t) for t in top_tracks],
                    })
                except Exception as e:
                    print(f"Error getting top tracks for {sim_artist.name}: {e}", file=sys.stderr)
        except Exception as e:
            print(f"Error finding similar artists for {name}: {e}", file=sys.stderr)

    print(json.dumps(results, ensure_ascii=False))


def cmd_track_radio(track_ids: list[str]):
    """Get track radio (similar tracks) for given track IDs."""
    session = get_session()
    results = []

    for tid in track_ids:
        try:
            track = session.track(int(tid))
            radio = track.get_track_radio(limit=10)
            results.extend([track_to_dict(t) for t in radio])
        except Exception as e:
            print(f"Error getting radio for track {tid}: {e}", file=sys.stderr)

    seen: set[str] = set()
    unique = []
    for t in results:
        if t["id"] not in seen:
            seen.add(t["id"])
            unique.append(t)

    print(json.dumps(unique, ensure_ascii=False))


def require_args(command: str, args: list[str], usage_hint: str):
    """Exit with usage message if args are empty."""
    if not args:
        print(f"Usage: python tidal_bridge.py {command} {usage_hint}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tidal_bridge.py <command> [args...]", file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    if command == "check_auth":
        cmd_check_auth()
    elif command == "login_start":
        cmd_login_start()
    elif command == "login_poll":
        require_args(command, args, "<device_code>")
        cmd_login_poll(args[0])
    elif command == "fetch_playlist":
        require_args(command, args, "<playlist_id>")
        cmd_fetch_playlist(args[0])
    elif command == "similar_artists":
        require_args(command, args, "<name> ...")
        cmd_similar_artists(args)
    elif command == "track_radio":
        require_args(command, args, "<track_id> ...")
        cmd_track_radio(args)
    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        sys.exit(1)
