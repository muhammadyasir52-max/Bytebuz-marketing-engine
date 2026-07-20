"""
KDP interior generation engine.

Produces print-ready planner/tracker interiors that satisfy Amazon KDP
specs for 8.5x11 no-bleed paperbacks (24-150 pages: gutter >= 0.375",
outside margins >= 0.25") and a symmetric-margin variant for Etsy/Gumroad
digital downloads.

Design rules baked in (from market research, July 2026):
- Undated everywhere: buyer starts any day, book never expires.
- One visual system per book: single accent color, two font families.
- Every page carries a footer page number and section label so the book
  reads as designed, not assembled.
"""

from dataclasses import dataclass, field

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen.canvas import Canvas

PAGE_W, PAGE_H = letter  # 8.5 x 11 in

FONT = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITALIC = "Helvetica-Oblique"


@dataclass
class Theme:
    accent: HexColor
    accent_light: HexColor
    ink: HexColor = field(default_factory=lambda: HexColor("#1a1a1a"))
    grey: HexColor = field(default_factory=lambda: HexColor("#8a8a8a"))
    line: HexColor = field(default_factory=lambda: HexColor("#c9c9c9"))
    large_print: bool = False


class Book:
    """Accumulates pages, tracks page numbers, and handles mirrored margins."""

    def __init__(self, path: str, theme: Theme, digital: bool = False):
        self.c = Canvas(path, pagesize=letter)
        self.theme = theme
        self.digital = digital
        self.page_num = 0
        self.section = ""
        self._footer_pending = False
        # KDP no-bleed: gutter 0.375" min for <=150 pages. Use generous 0.75"
        # gutter / 0.5" outside so nothing gets swallowed by the spine.
        self.m_out = 0.5 * inch
        self.m_gutter = 0.5 * inch if digital else 0.75 * inch
        self.m_top = 0.6 * inch
        self.m_bot = 0.6 * inch

    # -- geometry -------------------------------------------------------
    @property
    def left(self):
        # Odd pages (1st, 3rd...) are right-hand pages: gutter on the left.
        if self.digital:
            return self.m_out
        odd = (self.page_num % 2) == 1
        return self.m_gutter if odd else self.m_out

    @property
    def right(self):
        if self.digital:
            return PAGE_W - self.m_out
        odd = (self.page_num % 2) == 1
        return PAGE_W - (self.m_out if odd else self.m_gutter)

    @property
    def top(self):
        return PAGE_H - self.m_top

    @property
    def bottom(self):
        return self.m_bot

    @property
    def width(self):
        return self.right - self.left

    # -- page lifecycle -------------------------------------------------
    def new_page(self, footer: bool = True):
        if self.page_num > 0:
            if self._footer_pending:
                self._footer()
            self.c.showPage()
        self.page_num += 1
        self._footer_pending = footer

    def _footer(self):
        c, t = self.c, self.theme
        c.setFont(FONT, 8)
        c.setFillColor(t.grey)
        y = 0.35 * inch
        c.drawCentredString(PAGE_W / 2, y, str(self.page_num))
        if self.section:
            odd = (self.page_num % 2) == 1
            if odd or self.digital:
                c.drawRightString(self.right, y, self.section.upper())
            else:
                c.drawString(self.left, y, self.section.upper())

    def save(self):
        if self._footer_pending:
            self._footer()
        self.c.save()

    # -- primitives -----------------------------------------------------
    def header(self, title: str, subtitle: str = "") -> float:
        """Page title band. Returns the y where content may start."""
        c, t = self.c, self.theme
        y = self.top
        size = 22 if t.large_print else 17
        c.setFont(FONT_BOLD, size)
        c.setFillColor(t.ink)
        c.drawString(self.left, y - size, title)
        y -= size + 6
        if subtitle:
            ssize = 12 if t.large_print else 9.5
            c.setFont(FONT, ssize)
            c.setFillColor(t.grey)
            c.drawString(self.left, y - ssize, subtitle)
            y -= ssize + 6
        c.setStrokeColor(t.accent)
        c.setLineWidth(2)
        c.line(self.left, y - 4, self.right, y - 4)
        return y - 18

    def label(self, x, y, text, size=None, bold=True, color=None):
        t = self.theme
        size = size or (12 if t.large_print else 9)
        self.c.setFont(FONT_BOLD if bold else FONT, size)
        self.c.setFillColor(color or t.ink)
        self.c.drawString(x, y, text)

    def write_line(self, x, y, width):
        self.c.setStrokeColor(self.theme.line)
        self.c.setLineWidth(0.7)
        self.c.line(x, y, x + width, y)

    def field(self, x, y, label, line_w, size=None):
        """'Label: ______' returns x after the line."""
        t = self.theme
        size = size or (12 if t.large_print else 9)
        self.c.setFont(FONT_BOLD, size)
        self.c.setFillColor(t.ink)
        self.c.drawString(x, y, label)
        lx = x + self.c.stringWidth(label, FONT_BOLD, size) + 5
        self.write_line(lx, y - 1, line_w)
        return lx + line_w

    def checkbox(self, x, y, label="", size=None):
        t = self.theme
        box = 13 if t.large_print else 10
        self.c.setStrokeColor(t.ink)
        self.c.setLineWidth(0.9)
        self.c.rect(x, y, box, box)
        if label:
            fsize = size or (12 if t.large_print else 9)
            self.c.setFont(FONT, fsize)
            self.c.setFillColor(t.ink)
            self.c.drawString(x + box + 6, y + box / 2 - fsize / 2 + 1, label)

    def paragraph(self, x, y, width, text, size=None, leading=None,
                  bold=False, color=None):
        """Simple word-wrapped paragraph. Returns y below the text."""
        t = self.theme
        size = size or (13 if t.large_print else 10.5)
        leading = leading or size * 1.45
        fname = FONT_BOLD if bold else FONT
        self.c.setFont(fname, size)
        self.c.setFillColor(color or t.ink)
        words, line = text.split(), ""
        for w in words:
            trial = (line + " " + w).strip()
            if self.c.stringWidth(trial, fname, size) > width:
                self.c.drawString(x, y, line)
                y -= leading
                self.c.setFont(fname, size)
                line = w
            else:
                line = trial
        if line:
            self.c.drawString(x, y, line)
            y -= leading
        return y

    def table(self, x, y, col_widths, row_h, n_rows, headers=None,
              header_h=None, shade_header=True, row_labels=None,
              label_size=None):
        """Ruled entry table. Returns y below the table."""
        c, t = self.c, self.theme
        total_w = sum(col_widths)
        header_h = header_h or (26 if t.large_print else 20)
        hsize = 11 if t.large_print else 8.5
        top_y = y
        if headers:
            if shade_header:
                c.setFillColor(t.accent)
                c.rect(x, y - header_h, total_w, header_h, stroke=0, fill=1)
                c.setFillColor(white)
            else:
                c.setFillColor(t.ink)
            c.setFont(FONT_BOLD, hsize)
            cx = x
            for w, h in zip(col_widths, headers):
                for i, part in enumerate(h.split("\n")):
                    yy = y - header_h / 2 - hsize * 0.35
                    if "\n" in h:
                        yy = y - header_h / 2 + (0.5 - i) * hsize * 1.1 - hsize * 0.35
                    c.drawCentredString(cx + w / 2, yy, part)
                cx += w
            y -= header_h
        grid_top = y
        c.setStrokeColor(t.line)
        c.setLineWidth(0.7)
        for r in range(n_rows):
            c.line(x, y - row_h, x + total_w, y - row_h)
            if row_labels and r < len(row_labels):
                c.setFont(FONT_BOLD, label_size or (11 if t.large_print else 8.5))
                c.setFillColor(t.ink)
                c.drawString(x + 5, y - row_h / 2 - 3, row_labels[r])
            y -= row_h
        cx = x
        for w in col_widths[:-1]:
            cx += w
            c.line(cx, grid_top, cx, y)
        c.setStrokeColor(t.ink)
        c.setLineWidth(1)
        c.rect(x, y, total_w, top_y - y)
        return y

    def lined_area(self, x, y, width, height, gap=None, label=""):
        """Block of writing lines. Returns y below."""
        t = self.theme
        gap = gap or (30 if t.large_print else 22)
        if label:
            self.label(x, y, label)
            y -= 14 if t.large_print else 11
        yy = y - gap
        while yy >= y - height:
            self.write_line(x, yy, width)
            yy -= gap
        return yy + gap

    def scale_row(self, x, y, label, lo=0, hi=10, width=None):
        """Circle-a-number scale, e.g. pain 0-10. Returns y below."""
        c, t = self.c, self.theme
        width = width or self.width
        self.label(x, y, label)
        y -= 24 if t.large_print else 19
        n = hi - lo + 1
        r = 11 if t.large_print else 8.5
        step = (width - 2 * r) / (n - 1)
        c.setFont(FONT_BOLD, 12 if t.large_print else 9)
        for i in range(n):
            cx = x + r + i * step
            c.setStrokeColor(t.accent)
            c.setLineWidth(1)
            c.circle(cx, y, r, stroke=1, fill=0)
            c.setFillColor(t.ink)
            c.drawCentredString(cx, y - 3, str(lo + i))
        return y - r - 10

    def chart_grid(self, x, y, width, height, cols, rows,
                   y_labels=None, x_label="", y_title=""):
        """Empty plotting grid for trend charts. Returns y below."""
        c, t = self.c, self.theme
        c.setStrokeColor(t.line)
        c.setLineWidth(0.5)
        for i in range(rows + 1):
            yy = y - height * i / rows
            c.line(x, yy, x + width, yy)
        for i in range(cols + 1):
            xx = x + width * i / cols
            c.line(xx, y - height, xx, y)
        c.setStrokeColor(t.ink)
        c.setLineWidth(1)
        c.rect(x, y - height, width, height)
        if y_labels:
            c.setFont(FONT, 9 if t.large_print else 7)
            c.setFillColor(t.grey)
            for i, lab in enumerate(y_labels):
                yy = y - height + height * i / (len(y_labels) - 1)
                c.drawRightString(x - 5, yy - 2, str(lab))
        if x_label:
            c.setFont(FONT, 9 if t.large_print else 7.5)
            c.setFillColor(t.grey)
            c.drawCentredString(x + width / 2, y - height - 14, x_label)
        if y_title:
            c.saveState()
            c.translate(x - 34, y - height / 2)
            c.rotate(90)
            c.setFont(FONT, 9 if t.large_print else 7.5)
            c.setFillColor(t.grey)
            c.drawCentredString(0, 0, y_title)
            c.restoreState()
        return y - height - 20

    # -- stock pages ----------------------------------------------------
    def title_page(self, title, subtitle, tagline=""):
        self.new_page(footer=False)
        c, t = self.c, self.theme
        c.setFillColor(t.accent)
        c.rect(0, PAGE_H - 2.6 * inch, PAGE_W, 0.18 * inch, stroke=0, fill=1)
        c.rect(0, 2.4 * inch, PAGE_W, 0.18 * inch, stroke=0, fill=1)
        c.setFillColor(t.ink)
        c.setFont(FONT_BOLD, 30)
        mid = PAGE_H / 2 + 1.2 * inch
        for i, line in enumerate(title.split("\n")):
            c.drawCentredString(PAGE_W / 2, mid - i * 40, line)
        c.setFont(FONT, 14)
        c.setFillColor(t.grey)
        y = mid - title.count("\n") * 40 - 44
        for i, line in enumerate(subtitle.split("\n")):
            c.drawCentredString(PAGE_W / 2, y - i * 20, line)
        if tagline:
            c.setFont(FONT_ITALIC, 11)
            c.drawCentredString(PAGE_W / 2, 2.9 * inch, tagline)

    def ownership_page(self, fields):
        """'This book belongs to' + key info fields."""
        self.new_page(footer=False)
        c, t = self.c, self.theme
        c.setFont(FONT_BOLD, 18)
        c.setFillColor(t.ink)
        y = PAGE_H - 3.2 * inch
        c.drawCentredString(PAGE_W / 2, y, "This Book Belongs To")
        y -= 50
        cx = PAGE_W / 2
        half = 2.4 * inch
        self.write_line(cx - half, y, 2 * half)
        y -= 70
        for lab in fields:
            c.setFont(FONT_BOLD, 12)
            c.setFillColor(t.ink)
            c.drawString(cx - half, y, lab)
            self.write_line(cx - half + c.stringWidth(lab, FONT_BOLD, 12) + 8,
                            y - 1, 2 * half - c.stringWidth(lab, FONT_BOLD, 12) - 8)
            y -= 44

    def copyright_page(self, title, brand="Bytebuz Press"):
        self.new_page(footer=False)
        c, t = self.c, self.theme
        c.setFont(FONT, 8.5)
        c.setFillColor(t.grey)
        y = 2.2 * inch
        lines = [
            f"{title}",
            f"Copyright © 2026 {brand}. All rights reserved.",
            "No part of this publication may be reproduced, distributed, or transmitted in any form",
            "without the prior written permission of the publisher, except for brief quotations.",
            "",
            "This book is a personal record-keeping tool. It does not provide medical advice and is",
            "not a substitute for professional diagnosis or treatment. Always consult a qualified",
            "health provider with questions about a medical condition.",
        ]
        for line in lines:
            c.drawCentredString(PAGE_W / 2, y, line)
            y -= 13

    def section_divider(self, number, title, blurb):
        self.new_page()
        c, t = self.c, self.theme
        band_h = 3.0 * inch
        band_y = PAGE_H / 2 - band_h / 2 + 0.8 * inch
        c.setFillColor(t.accent_light)
        c.rect(0, band_y, PAGE_W, band_h, stroke=0, fill=1)
        c.setFillColor(t.accent)
        c.rect(0, band_y + band_h - 6, PAGE_W, 6, stroke=0, fill=1)
        c.rect(0, band_y, PAGE_W, 6, stroke=0, fill=1)
        c.setFillColor(t.grey)
        c.setFont(FONT_BOLD, 13)
        c.drawCentredString(PAGE_W / 2, band_y + band_h - 0.75 * inch,
                            f"SECTION {number}")
        c.setFillColor(t.ink)
        c.setFont(FONT_BOLD, 26)
        c.drawCentredString(PAGE_W / 2, band_y + band_h / 2 + 6, title)
        c.setFont(FONT_ITALIC, 11.5)
        c.setFillColor(t.ink)
        self._centered_wrap(blurb, band_y + band_h / 2 - 34, 5.8 * inch,
                            FONT_ITALIC, 11.5, 16)

    def _centered_wrap(self, text, y, width, fname, size, leading):
        c = self.c
        c.setFont(fname, size)
        words, line = text.split(), ""
        for w in words:
            trial = (line + " " + w).strip()
            if c.stringWidth(trial, fname, size) > width:
                c.drawCentredString(PAGE_W / 2, y, line)
                y -= leading
                line = w
            else:
                line = trial
        if line:
            c.drawCentredString(PAGE_W / 2, y, line)

    def notes_page(self, title="Notes"):
        self.new_page()
        y = self.header(title)
        self.lined_area(self.left, y, self.width, y - self.bottom - 10)
