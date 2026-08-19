"""Fetch recent posts from public Telegram channels via t.me/s/ preview.

No auth needed — this is Telegram's public web preview page.
Usage: python fetch_telegram.py
Output: ../data/raw_posts.json
"""

import json
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

CHANNELS = ["proglib_jobs", "evacuatejobs", "it_vakansii_jobs"]
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "raw_posts.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}


def fetch_channel(channel: str) -> list[dict]:
    resp = requests.get(f"https://t.me/s/{channel}", headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    posts = []
    for msg in soup.select("div.tgme_widget_message[data-post]"):
        post_id = msg["data-post"].split("/")[-1]
        text_el = msg.select_one(".tgme_widget_message_text")
        if text_el is None:
            continue
        for br in text_el.find_all("br"):
            br.replace_with("\n")
        text = text_el.get_text().strip()

        time_el = msg.select_one(".tgme_widget_message_date time")
        views_el = msg.select_one(".tgme_widget_message_views")

        posts.append(
            {
                "channel": channel,
                "post_id": post_id,
                "url": f"https://t.me/{channel}/{post_id}",
                "date": time_el["datetime"] if time_el else None,
                "views": views_el.get_text().strip() if views_el else None,
                "text": text,
            }
        )
    return posts


def main() -> None:
    all_posts = []
    for channel in CHANNELS:
        print(f"Fetching t.me/s/{channel} ...")
        posts = fetch_channel(channel)
        print(f"  {len(posts)} posts")
        all_posts.extend(posts)
        time.sleep(1)

    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(all_posts, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {len(all_posts)} posts to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
