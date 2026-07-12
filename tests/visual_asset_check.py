from __future__ import annotations

import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def png_size(path: Path) -> tuple[int, int]:
    raw = path.read_bytes()
    if len(raw) < 33 or not raw.startswith(PNG_SIGNATURE):
        raise ValueError("not a valid PNG file")
    chunk_len = struct.unpack(">I", raw[8:12])[0]
    chunk_type = raw[12:16]
    if chunk_len != 13 or chunk_type != b"IHDR":
        raise ValueError("PNG IHDR chunk missing")
    width, height = struct.unpack(">II", raw[16:24])
    return int(width), int(height)


def main() -> int:
    screenshot = ROOT / "docs" / "assets" / "dashboard-demo.png"
    if not screenshot.is_file():
        raise SystemExit("missing docs/assets/dashboard-demo.png")
    width, height = png_size(screenshot)
    if width < 1000 or height < 700:
        raise SystemExit(f"screenshot too small: {width}x{height}")
    if screenshot.stat().st_size < 50_000:
        raise SystemExit("screenshot unexpectedly tiny")
    print(f"visual asset ok {width}x{height}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
