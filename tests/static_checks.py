from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    required = ["index.html", "src/shell.js", "src/shell.css", "data/shell-config.js", "data/live.example.js"]
    missing = [p for p in required if not (ROOT / p).exists()]
    if missing:
        raise SystemExit(f"missing files: {missing}")
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    for needle in ["src/shell.css", "data/shell-config.js", "data/live.example.js", "src/shell.js", "card-grid", "detail-modal"]:
        if needle not in html:
            raise SystemExit(f"index.html missing {needle}")
    combined = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in [ROOT/"index.html", ROOT/"src/shell.js", ROOT/"src/shell.css", ROOT/"data/shell-config.js", ROOT/"data/live.example.js"])
    forbidden = ["SL" + "ANE", "Sl" + "ane", "Сл" + "ейн", "/mnt/" + "sl" + "ane", "Keen" + "etic", "tail" + "ad", "yu" + "rii" + "-intel"]
    hits = [x for x in forbidden if x in combined]
    if hits:
        raise SystemExit(f"private markers found: {hits}")
    if len(re.findall(r"data/shell-config\.js", html)) != 1:
        raise SystemExit("shell config should be loaded exactly once")
    print("static checks ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
