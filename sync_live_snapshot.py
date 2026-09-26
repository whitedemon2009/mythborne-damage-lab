"""Merge the verified live Google Doc tabs into the simulator snapshot.

The TSV files are produced from Google Docs get_document_text readback and keep
the provider indexes so normalize_data.py can continue to cite the live source.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
SNAPSHOT = DATA / "live-snapshot.json"


def read_tail(path: Path, tab_id: str) -> list[dict]:
    paragraphs: list[dict] = []
    for raw in path.read_text().splitlines():
        if not raw:
            continue
        parts = raw.split("\t", 2)
        if len(parts) < 3:
            if not paragraphs:
                raise ValueError(f"Orphan continuation in {path}: {raw!r}")
            paragraphs[-1]["text"] += "\n" + raw
            paragraphs[-1]["endIndex"] += len(raw) + 1
            continue
        style, start, text = parts
        text = text.replace("\\n", "\n")
        start_index = int(start)
        paragraphs.append(
            {
                "text": text,
                "startIndex": start_index,
                "endIndex": start_index + len(text) + 1,
                "tabId": tab_id,
                "namedStyleType": style or "NORMAL_TEXT",
                "isListItem": False,
            }
        )
    return paragraphs


def replace_tab(snapshot: dict, key: str, paragraphs: list[dict]) -> None:
    tab = snapshot["tabs"][key]
    tab["paragraphs"] = paragraphs
    tab["revisionId"] = snapshot["revisionId"]


snapshot = json.loads(SNAPSHOT.read_text())
snapshot["revisionId"] = "ANLCKQkT1qM7IKaNFLewBfn69lzqVhc_4bdAE2pNRBWHLXZULI7S8oJoK5SgYWdcoqNb-GK8ihGYw_doTuUDjre_X-4tTnRjB7LPP4X2QWk"
snapshot["retrievedAt"] = datetime.now(timezone.utc).isoformat()
replace_tab(snapshot, "characters", read_tail(DATA / "live-characters-current.tsv", "t.0"))
replace_tab(snapshot, "memories", read_tail(DATA / "live-memories-current.tsv", "t.evg5846tuobv"))
SNAPSHOT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2))
print(
    json.dumps(
        {
            "revisionId": snapshot["revisionId"],
            "characters": len(snapshot["tabs"]["characters"]["paragraphs"]),
            "memories": len(snapshot["tabs"]["memories"]["paragraphs"]),
        },
        ensure_ascii=False,
    )
)
