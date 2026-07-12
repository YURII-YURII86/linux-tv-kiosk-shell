from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ID_RE = re.compile(r"^[a-z][a-z0-9-]{1,62}$")


def extract_card_blocks(text: str) -> list[str]:
    start = text.index("cards:")
    array_start = text.index("[", start)
    array_end = text.index("\n  ]", array_start)
    body = text[array_start:array_end]
    return re.findall(r"\{ id: .*? \}", body)


def main() -> int:
    config_text = (ROOT / "data/shell-config.js").read_text(encoding="utf-8")
    live_text = (ROOT / "data/live.example.js").read_text(encoding="utf-8")
    if "window.KIOSK_SHELL_CONFIG" not in config_text:
        raise SystemExit("missing KIOSK_SHELL_CONFIG assignment")
    if "window.KIOSK_LIVE" not in live_text:
        raise SystemExit("missing KIOSK_LIVE assignment")
    blocks = extract_card_blocks(config_text)
    if len(blocks) < 4:
        raise SystemExit("expected at least 4 demo cards")
    ids = []
    for block in blocks:
        match = re.search(r'id: "([^"]+)"', block)
        if not match:
            raise SystemExit(f"card id missing: {block}")
        cid = match.group(1)
        if not ID_RE.match(cid):
            raise SystemExit(f"bad card id: {cid}")
        if "title:" not in block or "valuePath:" not in block:
            raise SystemExit(f"card must include title and valuePath: {cid}")
        ids.append(cid)
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate card ids")
    for required in ["status", "ticker", "updated"]:
        if re.search(rf"\b{required}\s*:", live_text) is None:
            raise SystemExit(f"live example missing {required}")
    print("contract checks ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
