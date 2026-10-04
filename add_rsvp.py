import re, os

FORM_ENDPOINT = "https://formspree.io/f/mpwpwlog"   # your existing Formspree form

PAGES = ["home", "home-ava", "when-where", "when-where-ava"]

EVENTS = {
    "groom": ["Haldi", "Sangeet Night", "Mehndi, Music & Magic", "Anand Karaj"],
    "bride": ["Haldi", "Jaggo Night", "Mehndi, Music & Magic", "Anand Karaj"],
}

CSS = r'''/* RSVP form */
#fh5co-started .rsvp-form { max-width: 720px; margin: 0 auto; text-align: left; color: #fff; overflow: hidden; }
#fh5co-started .rsvp-form .form-group { margin-bottom: 10px; }
#fh5co-started .rsvp-form .form-control { height: 54px; padding: 0 20px; box-shadow: none; border-radius: 0; }
#fh5co-started .rsvp-form textarea.form-control { height: auto; padding: 15px 20px; resize: vertical; }
#fh5co-started .rsvp-form select.form-control option { color: #333; }
#fh5co-started .rsvp-form .rsvp-label { margin: 18px 0 8px; color: rgba(255, 255, 255, 0.9); font-size: 16px; }
#fh5co-started .rsvp-choice { display: flex; flex-wrap: wrap; gap: 10px; margin: 5px 0 20px; }
#fh5co-started .rsvp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 15px; }
#fh5co-started .rsvp-pill { position: relative; margin: 0; cursor: pointer; font-weight: 400; }
#fh5co-started .rsvp-choice .rsvp-pill { flex: 1 1 220px; }
#fh5co-started .rsvp-pill input { position: absolute; opacity: 0; width: 100%; height: 100%; left: 0; top: 0; margin: 0; cursor: pointer; }
#fh5co-started .rsvp-pill span { display: block; text-align: center; padding: 15px 10px; background: rgba(0, 0, 0, 0.2); color: #fff; font-size: 16px; transition: 0.3s; }
#fh5co-started .rsvp-pill input:checked + span { background: #ac4aea; }
#fh5co-started .rsvp-pill input:focus + span { outline: 2px solid #fff; }
#fh5co-started .rsvp-form .btn-block { margin-top: 10px; }
#fh5co-started .rsvp-form .btn-block[disabled] { opacity: 0.6; }
#fh5co-started .rsvp-status { min-height: 24px; margin: 12px 0 0; text-align: center; color: #ffd0d0; }
#fh5co-started .rsvp-thanks { text-align: center; padding: 30px 20px; background: rgba(0, 0, 0, 0.3); color: #fff; font-size: 20px; }
'''

JS = r'''(function () {
  var form = document.getElementById("rsvp-form");
  if (!form) return;

  var extra = document.getElementById("rsvp-extra");
  var status = document.getElementById("rsvp-status");
  var button = form.querySelector("button[type=submit]");
  var buttonText = button.textContent;

  function attending() {
    var checked = form.querySelector("input[name=attending]:checked");
    return checked ? checked.value : "";
  }

  function toggleExtra() {
    extra.style.display = attending() === "No" ? "none" : "";
  }

  Array.prototype.forEach.call(form.querySelectorAll("input[name=attending]"), function (r) {
    r.addEventListener("change", toggleExtra);
  });
  toggleExtra();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";

    var data = new FormData(form);
    var events = [];
    Array.prototype.forEach.call(form.querySelectorAll("input[name=event]:checked"), function (c) {
      events.push(c.value);
    });
    data.delete("event");

    if (attending() === "Yes") {
      if (events.length === 0) {
        status.textContent = "Please pick at least one event you will join.";
        return;
      }
      data.set("events", events.join(", "));
    } else {
      data.delete("guests");
      data.set("events", "");
    }

    button.disabled = true;
    button.textContent = "Sending...";

    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("bad response");
      var name = (form.querySelector("input[name=name]").value || "").trim();
      var msg = attending() === "Yes"
        ? "Thank you, " + name + "! We can't wait to celebrate with you."
        : "Thank you for letting us know, " + name + ". We will miss you!";
      var box = document.createElement("div");
      box.className = "rsvp-thanks";
      box.textContent = msg;
      form.parentNode.replaceChild(box, form);
    }).catch(function () {
      status.textContent = "Something went wrong. Please try again, or message us directly.";
      button.disabled = false;
      button.textContent = buttonText;
    });
  });
})();
'''

def esc(s):
    return s.replace("&", "&amp;")

def build_form(side):
    label = "Groom's side" if side == "groom" else "Bride's side"
    events = "\n".join(
        '\t\t\t\t\t\t\t\t<label class="rsvp-pill"><input type="checkbox" name="event" value="%s"><span>%s</span></label>'
        % (esc(ev), esc(ev)) for ev in EVENTS[side])
    guests = "\n".join(
        '\t\t\t\t\t\t\t\t\t<option value="%d">%s</option>' % (n, "1 (just me)" if n == 1 else str(n))
        for n in range(1, 9))
    return '''<form id="rsvp-form" class="rsvp-form" action="%(action)s" method="POST">
\t\t\t\t\t\t\t<input type="hidden" name="side" value="%(label)s">
\t\t\t\t\t\t\t<input type="hidden" name="_subject" value="New RSVP (%(label)s)">
\t\t\t\t\t\t\t<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none">
\t\t\t\t\t\t\t<div class="row">
\t\t\t\t\t\t\t\t<div class="col-sm-6"><div class="form-group">
\t\t\t\t\t\t\t\t\t<label for="rsvp-name" class="sr-only">Name</label>
\t\t\t\t\t\t\t\t\t<input type="text" class="form-control" id="rsvp-name" name="name" placeholder="Your name" required>
\t\t\t\t\t\t\t\t</div></div>
\t\t\t\t\t\t\t\t<div class="col-sm-6"><div class="form-group">
\t\t\t\t\t\t\t\t\t<label for="rsvp-email" class="sr-only">Email</label>
\t\t\t\t\t\t\t\t\t<input type="email" class="form-control" id="rsvp-email" name="email" placeholder="Email" required>
\t\t\t\t\t\t\t\t</div></div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div class="rsvp-choice">
\t\t\t\t\t\t\t\t<label class="rsvp-pill"><input type="radio" name="attending" value="Yes" required><span>Joyfully accepts</span></label>
\t\t\t\t\t\t\t\t<label class="rsvp-pill"><input type="radio" name="attending" value="No"><span>Regretfully declines</span></label>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div id="rsvp-extra">
\t\t\t\t\t\t\t\t<p class="rsvp-label">How many people are coming, including you?</p>
\t\t\t\t\t\t\t\t<div class="form-group">
\t\t\t\t\t\t\t\t\t<select class="form-control" name="guests" aria-label="Number of guests">
%(guests)s
\t\t\t\t\t\t\t\t\t</select>
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t<p class="rsvp-label">Which events will you join?</p>
\t\t\t\t\t\t\t\t<div class="rsvp-grid">
%(events)s
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div class="form-group">
\t\t\t\t\t\t\t\t<label for="rsvp-message" class="sr-only">Message</label>
\t\t\t\t\t\t\t\t<textarea class="form-control" id="rsvp-message" name="message" rows="3" placeholder="Food needs, or a note for us (optional)"></textarea>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<button type="submit" class="btn btn-primary btn-block">Send RSVP</button>
\t\t\t\t\t\t\t<p id="rsvp-status" class="rsvp-status" role="status"></p>
\t\t\t\t\t\t</form>''' % {"action": FORM_ENDPOINT, "label": label, "guests": guests, "events": events}

os.makedirs("js", exist_ok=True)
open("css/rsvp.css", "w", encoding="utf-8").write(CSS)
open("js/rsvp.js", "w", encoding="utf-8").write(JS)
print("wrote css/rsvp.css and js/rsvp.js")

FORM_RE = re.compile(r'<form class="form-inline" action="https://formspree\.io/[^"]*" method="POST">.*?</form>', re.S)

for page in PAGES:
    path = page + ".html"
    s = open(path, encoding="utf-8").read()
    if 'id="rsvp-form"' in s:
        print(path, "already updated, skipping")
        continue
    side = "bride" if page.endswith("-ava") else "groom"
    s, n = FORM_RE.subn(lambda m: build_form(side), s)
    if '<link rel="stylesheet" href="css/rsvp.css">' not in s:
        s = s.replace('<link rel="stylesheet" href="css/style.css">',
                      '<link rel="stylesheet" href="css/style.css">\n\t<link rel="stylesheet" href="css/rsvp.css">')
    if '<script src="js/rsvp.js"></script>' not in s:
        s = s.replace('<script src="dist/scripts.min.js"></script>',
                      '<script src="dist/scripts.min.js"></script>\n\t<script src="js/rsvp.js"></script>')
    open(path, "w", encoding="utf-8").write(s)
    print(path, "form replaced (%s side):" % side, n)