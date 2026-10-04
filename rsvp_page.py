import re, os

# Run this AFTER add_rsvp.py (it reuses the form, css/rsvp.css and js/rsvp.js that script made)

SIDES = {
    "groom": {"suffix": "",     "base": "when-where.html",     "home": "home.html",     "rsvp": "rsvp.html"},
    "bride": {"suffix": "-ava", "base": "when-where-ava.html", "home": "home-ava.html", "rsvp": "rsvp-ava.html"},
}
OLD_PAGES = ["home", "groom-bride", "when-where"]

def read(p):  return open(p, encoding="utf-8").read()
def write(p, s): open(p, "w", encoding="utf-8").write(s)

FORM_RE = re.compile(r'<form id="rsvp-form".*?</form>', re.S)
ANY_FORM_RE = re.compile(r'<form (?:id="rsvp-form"|class="form-inline").*?</form>', re.S)
SECTION_RE = re.compile(r'[ \t]*<div id="fh5co-started".*?(?=[ \t]*<footer>)', re.S)

# 1. add the RSVP link to the menu of every page
def add_nav(s, side):
    cfg = SIDES[side]
    if cfg["rsvp"] in s:
        return s
    pat = re.compile(r'(<li[^>]*><a href="when-where%s\.html">When &amp; Where</a></li>)' % re.escape(cfg["suffix"]))
    new_li = '\n\t\t\t\t\t\t\t<li><a href="%s">RSVP</a></li>' % cfg["rsvp"]
    return pat.sub(lambda m: m.group(1) + new_li, s, count=1)

for side, cfg in SIDES.items():
    for page in OLD_PAGES:
        path = page + cfg["suffix"] + ".html"
        write(path, add_nav(read(path), side))

# 2. build the dedicated RSVP pages
for side, cfg in SIDES.items():
    home = read(cfg["home"])
    m = FORM_RE.search(home)
    if not m:
        raise SystemExit("Could not find the new RSVP form in %s. Run add_rsvp.py first." % cfg["home"])
    form = m.group(0)

    s = read(cfg["base"])
    s = re.sub(r'<title>.*?</title>', '<title>RSVP &mdash; Kirat &amp; Aval</title>', s, count=1, flags=re.S)
    s = re.sub(r'(content="[^"]*/)when-where%s\.html(")' % re.escape(cfg["suffix"]), r'\1' + cfg["rsvp"] + r'\2', s)
    s = s.replace('<h2>When &amp; Where</h2>', '<h2>RSVP</h2>', 1)            # hero title

    # menu: RSVP becomes the active link
    s = s.replace('<li class="active"><a href="when-where%s.html">' % cfg["suffix"],
                  '<li><a href="when-where%s.html">' % cfg["suffix"])
    s = s.replace('<li><a href="%s">RSVP</a></li>' % cfg["rsvp"],
                  '<li class="active"><a href="%s">RSVP</a></li>' % cfg["rsvp"])

    # drop the events section (everything between the header and the RSVP section)
    s = re.sub(r'(<!-- end:header-top -->\s*).*?(?=[ \t]*<div id="fh5co-started")', r'\1\n', s, count=1, flags=re.S)

    # swap in the new form and a friendlier heading
    s = ANY_FORM_RE.sub(lambda _m: form, s, count=1)
    s = s.replace('<h2>RSVP</h2>\n\t\t\t\t\t\t<!---p>', '<h2>Will you join us?</h2>\n\t\t\t\t\t\t<!---p>', 1)

    if 'href="css/rsvp.css"' not in s:
        s = s.replace('<link rel="stylesheet" href="css/style.css">',
                      '<link rel="stylesheet" href="css/style.css">\n\t<link rel="stylesheet" href="css/rsvp.css">')
    if 'src="js/rsvp.js"' not in s:
        s = s.replace('<script src="dist/scripts.min.js"></script>',
                      '<script src="dist/scripts.min.js"></script>\n\t<script src="js/rsvp.js"></script>')
    write(cfg["rsvp"], s)
    print("created", cfg["rsvp"])

# 3. remove the RSVP section from the other pages
for side, cfg in SIDES.items():
    for page in OLD_PAGES:
        path = page + cfg["suffix"] + ".html"
        s = read(path)
        s, n = SECTION_RE.subn('', s, count=1)
        s = s.replace('\n\t<link rel="stylesheet" href="css/rsvp.css">', '')
        s = s.replace('\n\t<script src="js/rsvp.js"></script>', '')
        write(path, s)
        print(path, "RSVP section removed" if n else "no RSVP section found")