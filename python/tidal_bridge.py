#!/usr/bin/env python3
"""
Tidal API bridge — CLI sidecar called from Node.js server functions.

Usage:
    python tidal_bridge.py fetch_playlist <playlist_id>
    python tidal_bridge.py similar_artists <artist1> <artist2> ...
    python tidal_bridge.py track_radio <track_id1> <track_id2> ...

Output: JSON to stdout. Errors to stderr.
"""

import sys
import json
import os
import tidalapi

SESSION_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tidal_session.json")


def get_session() -> tidalapi.Session:
    """Get or create an authenticated Tidal session."""
    session = tidalapi.Session()

    # Try to restore saved session
    if os.path.exists(SESSION_FILE):
        try:
            with open(SESSION_FILE, "r") as f:
                data = json.load(f)
            session.load_oauth_session(
                token_type=data["token_type"],
                access_token=data["access_token"],
                refresh_token=data["refresh_token"],
                expiry_time=data["expiry_time"],
            )
            if session.check_login():
                return session
            # Session expired, try refresh
            print("Session expired, refreshing...", file=sys.stderr)
        except Exception as e:
            print(f"Failed to restore session: {e}", file=sys.stderr)

    # Fresh OAuth login
    print("Starting Tidal OAuth login...", file=sys.stderr)
    session.login_oauth_simple()

    if session.check_login():
        save_session(session)
        return session
    else:
        print("Login failed!", file=sys.stderr)
        sys.exit(1)


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

    # Deduplicate by track ID
    seen = set()
    unique = []
    for t in results:
        if t["id"] not in seen:
            seen.add(t["id"])
            unique.append(t)

    print(json.dumps(unique, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tidal_bridge.py <command> [args...]", file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    if not args:
        print(f"Usage: python tidal_bridge.py {command} <args...>", file=sys.stderr)
        sys.exit(1)

    if command == "fetch_playlist":
        cmd_fetch_playlist(args[0])
    elif command == "similar_artists":
        cmd_similar_artists(args)
    elif command == "track_radio":
        cmd_track_radio(args)
    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        sys.exit(1)
