"""Fill template.html with a document body.

    python3 md2html.py <input.md | input.html> <output.html>

A .md file is converted (headings, paragraphs, **bold**, *italic*, lists, pipe tables).
A .html file is a ready-made body fragment (quotes: see example-quote.html) and goes in as is.
The title is the first # heading (or <h1>). A "Mon D, YYYY · ..." line right under the title is left out.
Fonts come from the site repo (components/hero/font-files), found relative to this file.
"""
import re, sys, html
from pathlib import Path

HERE = Path(__file__).resolve().parent
FONT_DIR = (HERE.parent.parent / "components" / "hero" / "font-files").as_uri()

src_path, out_path = sys.argv[1], sys.argv[2]
source = open(src_path, encoding="utf-8").read()


def inline(s):
    s = html.escape(s, quote=False)
    s = s.replace(r"\[", "[").replace(r"\]", "]")
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", s)
    return s


def md_to_html(lines):
    out = []
    state = {"title": "", "after_h1": False}

    def flush_para(buf):
        if not buf:
            return
        text = " ".join(buf).strip()
        m = re.match(r"^([A-Z][a-z]{2} \d{1,2}, \d{4})\s*·\s*(.+)$", text)
        if not (state["after_h1"] and m):  # the "date · author" line under the title is left out
            out.append(f"<p>{inline(text)}</p>")
        state["after_h1"] = False
        buf.clear()

    para = []
    list_re = re.compile(r"^(\s*)(?:([-*])|(\d+)\.)\s+(.*)$")
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        if not line.strip():
            flush_para(para); i += 1; continue
        m = re.match(r"^(#{1,3})\s+(.*)$", line)
        if m:
            flush_para(para)
            level = len(m.group(1)); text = m.group(2).strip()
            if level == 1:
                state["title"] = text; state["after_h1"] = True
            out.append(f"<h{level}>{inline(text)}</h{level}>")
            i += 1; continue
        if line.lstrip().startswith("|"):
            flush_para(para)
            rows = []
            while i < n and lines[i].lstrip().startswith("|"):
                raw = lines[i].strip().strip("|")
                rows.append([c.strip() for c in raw.split("|")])
                i += 1
            head = rows[0]
            body = [r for r in rows[1:] if not all(re.match(r"^:?-{3,}:?$", c) for c in r)]
            t = [f'<table class="cols{len(head)}"><thead><tr>']
            t += [f"<th>{inline(c)}</th>" for c in head]
            t.append("</tr></thead><tbody>")
            for r in body:
                t.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
            t.append("</tbody></table>")
            out.append("".join(t)); continue
        m = list_re.match(line)
        if m:
            flush_para(para)
            stack = []  # (indent, tag)

            def close_to(indent):
                while stack and stack[-1][0] > indent:
                    out.append(f"</li></{stack.pop()[1]}>")

            while i < n:
                cur = lines[i]
                if not cur.strip():
                    j = i + 1  # continue only if the next non-blank line is a list item
                    while j < n and not lines[j].strip():
                        j += 1
                    if j < n and list_re.match(lines[j]):
                        i = j; continue
                    break
                mm = list_re.match(cur)
                if not mm:
                    break
                indent = len(mm.group(1).expandtabs(4))
                tag = "ul" if mm.group(2) else "ol"
                text = mm.group(4)
                start = f' start="{mm.group(3)}"' if tag == "ol" and mm.group(3) != "1" else ""
                if stack and indent > stack[-1][0]:
                    out.append(f"<{tag}{start}><li>{inline(text)}")
                    stack.append((indent, tag))
                else:
                    close_to(indent)
                    if stack and stack[-1][0] == indent:
                        out.append(f"</li><li>{inline(text)}")
                    else:
                        out.append(f"<{tag}{start}><li>{inline(text)}")
                        stack.append((indent, tag))
                i += 1
            close_to(-1)
            continue
        para.append(line.strip()); i += 1
    flush_para(para)
    return "\n".join(out), state["title"]


if src_path.lower().endswith((".html", ".htm")):
    body = source
    m = re.search(r"<h1[^>]*>(.*?)</h1>", source, re.S)
    title = html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip() if m else ""
else:
    body, title = md_to_html(source.splitlines())

tpl = (HERE / "template.html").read_text(encoding="utf-8")
page = tpl.replace("{{FONT_DIR}}", FONT_DIR).replace("{{TITLE}}", html.escape(title)).replace("{{BODY}}", body)
Path(out_path).write_text(page, encoding="utf-8")
print("title:", title)
