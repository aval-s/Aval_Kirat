import re, os

# ---- SET THESE TWO ----
CEREMONY_TIME = "2026-12-19T10:00:00+05:30"   # Anand Karaj start, India time
SITE_URL = "https://kirat-aval.com"        # your real site address, no trailing slash
# -----------------------

PAGES = ["home", "home-ava", "groom-bride", "groom-bride-ava", "when-where", "when-where-ava"]

NEW_COUNTDOWN = '''<script>
\t\t\t\t\t\t\tvar countDownDate = new Date("%s").getTime();

\t\t\t\t\t\t\tfunction tick() {
\t\t\t\t\t\t\t\tvar distance = countDownDate - new Date().getTime();

\t\t\t\t\t\t\t\tif (distance < 0) {
\t\t\t\t\t\t\t\t\tclearInterval(timer);
\t\t\t\t\t\t\t\t\tdocument.querySelector(".countdown").innerHTML = "We are Married!";
\t\t\t\t\t\t\t\t\treturn;
\t\t\t\t\t\t\t\t}

\t\t\t\t\t\t\t\tvar days = Math.floor(distance / (1000 * 60 * 60 * 24));
\t\t\t\t\t\t\t\tvar hours = Math.floor((distance %% (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
\t\t\t\t\t\t\t\tvar minutes = Math.floor((distance %% (1000 * 60 * 60)) / (1000 * 60));
\t\t\t\t\t\t\t\tvar seconds = Math.floor((distance %% (1000 * 60)) / 1000);

\t\t\t\t\t\t\t\tdocument.getElementById("days").innerHTML = days + " <small>days</small>";
\t\t\t\t\t\t\t\tdocument.getElementById("hours").innerHTML = hours + " <small>hours</small>";
\t\t\t\t\t\t\t\tdocument.getElementById("minutes").innerHTML = minutes + " <small>minutes</small>";
\t\t\t\t\t\t\t\tdocument.getElementById("seconds").innerHTML = seconds + " <small>seconds</small>";
\t\t\t\t\t\t\t}

\t\t\t\t\t\t\tvar timer = setInterval(tick, 1000);
\t\t\t\t\t\t\ttick();
\t\t\t\t\t\t</script>''' % CEREMONY_TIME

def og_block(page):
    url = "%s/%s.html" % (SITE_URL, page)
    img = "%s/images/share.jpg" % SITE_URL
    title = "Kirat &amp; Aval &mdash; Happily Ever After"
    desc = "We're getting married! Join us December 19, 2026."
    return (
        '<meta property="og:type" content="website"/>\n'
        '\t<meta property="og:title" content="%s"/>\n'
        '\t<meta property="og:image" content="%s"/>\n'
        '\t<meta property="og:url" content="%s"/>\n'
        '\t<meta property="og:site_name" content="Kirat &amp; Aval"/>\n'
        '\t<meta property="og:description" content="%s"/>\n'
        '\t<meta name="twitter:title" content="%s" />\n'
        '\t<meta name="twitter:image" content="%s" />\n'
        '\t<meta name="twitter:url" content="%s" />\n'
        '\t<meta name="twitter:card" content="summary_large_image" />'
    ) % (title, img, url, desc, title, img, url)

OG_RE = re.compile(r'<meta property="og:title" content=""/>.*?<meta name="twitter:card" content="" />', re.S)

for page in PAGES:
    path = page + ".html"
    s = open(path, encoding="utf-8").read()

    # countdown fix (home pages only)
    if page.startswith("home"):
        s, n = re.subn(r'<script>\s*var countDownDate.*?</script>', lambda m: NEW_COUNTDOWN, s, flags=re.S)
        print(path, "countdown replaced:", n)

    # remove Google Maps script (no map on any page)
    s = re.sub(r'[ \t]*<!-- Google Map -->\n', '', s)
    s = re.sub(r'[ \t]*<script src="https://maps\.googleapis\.com/[^"]*"></script>\n', '', s)

    # link preview tags
    s, n = OG_RE.subn(lambda m: og_block(page), s)
    print(path, "og tags filled:", n)

    # alt text
    s = re.sub(r'(src="images/groom\.jpg"[^>]*?)alt="[^"]*"', r'\1alt="Harkirat Singh"', s)
    s = re.sub(r'(src="images/bride\.png"[^>]*?)alt="[^"]*"', r'\1alt="Avalvir Kaur"', s)

    open(path, "w", encoding="utf-8").write(s)

# the bundled js still calls google.maps on load, so remove that call too
for f in ["dist/scripts.min.js", "dist/scripts.js", "js/google_map.js"]:
    if not os.path.exists(f):
        continue
    s = open(f, encoding="utf-8").read()
    s2 = s.replace('google.maps.event.addDomListener(window,"load",init),', '')
    s2 = s2.replace("google.maps.event.addDomListener(window, 'load', init);", '')
    print(f, "changed" if s2 != s else "unchanged")
    open(f, "w", encoding="utf-8").write(s2)