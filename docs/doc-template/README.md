# Wiedel.me document template

Quotes, invoices and reports printed as Letter PDFs on the wiedel.me letterhead. The pages use the
site's own fonts: Wiedel Display for the title and small caps headings, and Mona Sans for everything else.

## What a page looks like

- **Header, every page:** the wordmark on the left, the document title in italic Mona Sans on the right, and a 2px
  rule under both that is as wide as the text.
- **Footer:** "Page X of Y".
- **`#` / `<h1>`:** the document title, in Wiedel Display (black italic, all caps).
- **`##` / `<h2>`:** section headings, in Mona Sans ExtraBold, in the case you type.
- **`###` / `<h3>`:** smaller headings such as "Start now" or "Next", in Wiedel Display, all caps.
- **Tables:** near-black header row with white text, and every other body row shaded.
- **No date/author byline under the title.** Quotes put a plain details block under the title instead:
  "Prepared for" (client name, business, email) and "Prepared by" (Caleb Wiedel, Wiedel.me, caleb@wiedel.me)
  side by side on the left, both left-aligned, and the quote number and issue date on the right, right-aligned
  (see `example-quote.html`). No table. The expiry date goes in the Terms section.

## Files

| File | What it does |
|---|---|
| `template.html` | The page styles. `md2html.py` fills in `{{FONT_DIR}}`, `{{TITLE}}` and `{{BODY}}`. |
| `md2html.py` | Turns a `.md` file, or a ready-made `.html` body, into a full page. |
| `pdf.mjs` | Prints that page to PDF with the letterhead header and the page-number footer (Chrome via Playwright). |
| `example-quote.html` | A quote body with placeholders, showing every quote component. |
| `render.swift` | Optional, macOS only: renders PDF pages to PNGs for a quick look. |
| `../brand/wiedel-me-wordmark-print.svg` | The black print wordmark used in the header. |

The fonts are loaded from `components/hero/font-files/`, Playwright from the repo's `node_modules`, and the logo
from `docs/brand/`, all relative to this folder, so the template works from any clone of the repo.

## Setup on a new machine

1. Clone the repo and run `npm ci` in its root. That installs Playwright.
2. Install Google Chrome. The PDF is printed with the installed Chrome (`channel: 'chrome'`).
3. Make sure `python3` is installed.

## Build

Client documents belong in the client's own project folder (its gitignored `docs/`), **not in this public
repo**. Run the scripts from anywhere:

```sh
T=docs/doc-template   # from the wiedel-me repo root

# a report written in markdown
python3 $T/md2html.py "Report.md" /tmp/report.html
node $T/pdf.mjs /tmp/report.html "Client Report.pdf" "Client Name · Report Title"

# a quote: copy example-quote.html, fill it in, then
python3 $T/md2html.py my-quote.html /tmp/quote.html
node $T/pdf.mjs /tmp/quote.html "Client Name Website Quote.pdf" "Client Name · Website Quote"
```

The third argument to `pdf.mjs` is the header title. Without it, the header uses the document's first heading.

To check the pages, look at the PDF, or render them with `swift $T/render.swift "<file>.pdf" <out-dir> 1.3` (or
`pdftoppm -r 110 -png`). Check that no page ends with a lonely table row or a signature block on its own.

## Quote components (HTML body)

| Markup | Use |
|---|---|
| `<div class="quote-meta">` | Details under the title: Prepared for and Prepared by (left), quote number and issued date (right) |
| `<table class="scope">` | Item / Details (first column bold) |
| `<table class="price">` | Item / Price, amounts right-aligned; `<tr class="total">` for the total row |
| `<table class="timeline">` | When / What happens |
| `<p class="note">` | Small gray note under a table |
| `<p class="check">` | Checkbox line (☐) for an optional add-on |
| `<table class="sign">` | Signature and date lines (`.line`, `.label`), no shading |
| `<div class="keep">` | Keeps a section on one page |

## Writing rules

- Keep em dashes, en dashes and double hyphens out of client prose. Use periods, colons or commas.
- Brand: this is Wiedel.me (Caleb Wiedel), not Wetware Labs.
