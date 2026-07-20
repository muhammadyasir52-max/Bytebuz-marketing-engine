"""Build every product: KDP print interior + Etsy digital edition."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from engine import Book
from products import PRODUCTS

OUT = os.path.join(os.path.dirname(__file__), "..", "products")


def main():
    for slug, spec in PRODUCTS.items():
        pdir = os.path.join(OUT, slug)
        os.makedirs(pdir, exist_ok=True)
        for digital in (False, True):
            name = ("interior_digital_letter.pdf" if digital
                    else "interior_kdp_8.5x11.pdf")
            book = Book(os.path.join(pdir, name), spec["theme"], digital=digital)
            spec["build"](book)
            # KDP: even page count, 24-828 range; we target 100-120.
            if book.page_num % 2 == 1:
                book.notes_page()
            pages = book.page_num
            book.save()
            assert pages % 2 == 0, f"{slug}: odd page count {pages}"
            assert 24 <= pages <= 150, f"{slug}: page count {pages} out of range"
            print(f"{slug:38s} {'digital' if digital else 'kdp':7s} {pages} pages")


if __name__ == "__main__":
    main()
