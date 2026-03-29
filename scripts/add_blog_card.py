#!/usr/bin/env python3
import argparse
import json
from datetime import date
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Append a blog card to data/blog_cards.json."
    )
    parser.add_argument(
        "--lang",
        required=True,
        choices=["en", "zh-CN"],
        help="Source language for this card.",
    )
    parser.add_argument("--title", required=True, help="Card title.")
    parser.add_argument("--excerpt", required=True, help="Card body text.")
    parser.add_argument(
        "--tags",
        default="",
        help='Comma-separated tags. Example: "devlog,website"',
    )
    parser.add_argument(
        "--date",
        default=date.today().isoformat(),
        help="Date in YYYY-MM-DD format. Defaults to today.",
    )
    return parser.parse_args()


def load_cards(path: Path) -> list[dict]:
    if not path.exists():
        return []

    data = json.loads(path.read_text(encoding="utf-8"))
    cards = data.get("cards", [])
    if not isinstance(cards, list):
        raise ValueError("Invalid format: `cards` must be a list.")
    return cards


def save_cards(path: Path, cards: list[dict]) -> None:
    payload = {"cards": cards}
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent.parent
    cards_path = repo_root / "data" / "blog_cards.json"
    cards_path.parent.mkdir(parents=True, exist_ok=True)

    cards = load_cards(cards_path)
    entry = {
        "date": args.date,
        "source_lang": args.lang,
        "title": args.title.strip(),
        "excerpt": args.excerpt.strip(),
        "tags": args.tags.strip(),
    }
    cards.insert(0, entry)
    save_cards(cards_path, cards)

    print(f"Added blog card ({args.lang}) -> {cards_path}")


if __name__ == "__main__":
    main()
