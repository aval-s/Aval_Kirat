/* Fancy, interactive touches (remove this file's <script> to switch them off) */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var side = /-ava\.html$/.test(location.pathname) ? "-ava" : "";

  // ---------- scroll progress bar ----------
  var bar = document.createElement("div");
  bar.className = "fancy-progress";
  document.body.appendChild(bar);
  var onScroll = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Four Laavan logo: four gold rings around K & A ----------
  var logoCount = 0;
  function laavanLogo(dark, compact) {
    var id = "lv" + (++logoCount);
    var stops = dark
      ? ["#fff4cf", "#f3dca0", "#d9b25e", "#f7e6b5", "#c9a046"]
      : ["#b8862f", "#e9cd7c", "#a87726", "#d8b25a", "#9c6c1e"];
    var arc = function (r, rot, w) {
      var c = 2 * Math.PI * r;
      return '<circle cx="120" cy="120" r="' + r + '" fill="none" stroke="url(#' + id + ')" stroke-width="' + w +
        '" stroke-linecap="round" stroke-dasharray="' + (c * 0.86).toFixed(1) + ' ' + c.toFixed(1) +
        '" transform="rotate(' + rot + ' 120 120)"/>';
    };
    var dot = 60 * Math.PI / 180;
    return '<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      stops.map(function (c, i) { return '<stop offset="' + [0, .35, .55, .8, 1][i] + '" stop-color="' + c + '"/>'; }).join("") +
      '</linearGradient></defs>' +
      (compact ? arc(108, -60, 4) + arc(98, 30, 2.4) + arc(88, 120, 4) + arc(78, 210, 2.4)
               : arc(106, -60, 2.2) + arc(98, 30, 1.2) + arc(90, 120, 2.2) + arc(82, 210, 1.2)) +
      '<circle cx="' + (120 + 106 * Math.cos(-dot)).toFixed(1) + '" cy="' + (120 + 106 * Math.sin(-dot)).toFixed(1) + '" r="3.5" fill="url(#' + id + ')"/>' +
      (compact
        ? '<text x="120" y="142" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="62" letter-spacing="2" fill="' + (dark ? "#fff" : "#7d2fb3") + '">K' +
          '<tspan font-family="Pinyon Script, cursive" font-weight="400" font-size="96" fill="url(#' + id + ')" dx="-2" dy="10">&amp;</tspan><tspan dx="0" dy="-10">A</tspan></text>'
        : '<text x="120" y="134" text-anchor="middle" font-family="Cinzel, serif" font-weight="500" font-size="44" letter-spacing="4" fill="' + (dark ? "#fff" : "#7d2fb3") + '">K' +
          '<tspan font-family="Pinyon Script, cursive" font-size="52" fill="url(#' + id + ')" dx="2" dy="4">&amp;</tspan><tspan dx="4" dy="-4">A</tspan></text>') +
      (compact ? '' :
        '<path d="M86 150 H154" stroke="url(#' + id + ')" stroke-width="1"/>' +
        '<text x="120" y="166" text-anchor="middle" font-family="Open Sans, sans-serif" font-weight="700" font-size="8" letter-spacing="3" fill="' + (dark ? "#f3dca0" : "#b8862f") + '">19 · XII · 2026</text>') +
      '</svg>';
  }

  // ---------- logo in the empty header spot ----------
  var logo = document.getElementById("fh5co-logo");
  if (logo) {
    var a = document.createElement("a");
    a.className = "fancy-logo";
    a.href = "home" + side + ".html";
    a.setAttribute("aria-label", "Kirat & Aval, home");
    a.innerHTML = laavanLogo(false, true);
    logo.appendChild(a);
  }

  // ---------- hero: monogram, scroll cue, petals ----------
  var hero = document.querySelector(".fh5co-hero");
  if (hero) {
    var heroBox = hero.querySelector(".animate-box");
    if (heroBox && heroBox.querySelector("h1")) {
      var mono = document.createElement("div");
      mono.className = "fancy-monogram";
      mono.innerHTML = laavanLogo(true);
      heroBox.insertBefore(mono, heroBox.firstChild);
    }
    var cue = document.createElement("a");
    cue.className = "fancy-scroll";
    cue.href = "#fh5co-header-section";
    cue.setAttribute("aria-label", "Scroll down");
    hero.appendChild(cue);
    if (!reduceMotion) petals(hero);
  }

  function petals(host) {
    var canvas = document.createElement("canvas");
    canvas.className = "fancy-petals";
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var colors = ["#f3dca0", "#f7c6dc", "#e3b5ff", "#ffffff"];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, list = [], visible = true;
    var resize = function () {
      w = host.clientWidth; h = host.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var make = function (top) {
      return {
        x: Math.random() * w, y: top ? -20 : Math.random() * h,
        r: 4 + Math.random() * 6, vy: 0.35 + Math.random() * 0.7, sway: Math.random() * Math.PI * 2,
        spin: Math.random() * Math.PI, vs: (Math.random() - 0.5) * 0.03,
        color: colors[(Math.random() * colors.length) | 0], alpha: 0.45 + Math.random() * 0.45
      };
    };
    resize();
    window.addEventListener("resize", resize);
    var count = w < 600 ? 16 : 30;
    for (var i = 0; i < count; i++) list.push(make(false));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(host);
    }
    (function frame() {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        list.forEach(function (p, idx) {
          p.y += p.vy; p.sway += 0.015; p.spin += p.vs;
          var x = p.x + Math.sin(p.sway) * 22;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(x, p.y);
          ctx.rotate(p.spin);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (p.y > h + 20) list[idx] = make(true);
        });
      }
      requestAnimationFrame(frame);
    })();
  }

  // ---------- footer: monogram and date ----------
  var footerTitle = document.querySelector("#footer h2");
  if (footerTitle) {
    var fm = document.createElement("div");
    fm.className = "fancy-footer-mark";
    fm.innerHTML = laavanLogo(true);
    footerTitle.parentNode.insertBefore(fm, footerTitle);
  }

  // ---------- home: tap the heart ----------
  var heart = document.querySelector("#fh5co-couple .amp-center");
  if (heart) {
    heart.setAttribute("role", "button");
    heart.setAttribute("tabindex", "0");
    heart.setAttribute("aria-label", "Send some love");
    var burst = function () {
      var r = heart.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2.5;
      for (var i = 0; i < 16; i++) {
        var s = document.createElement("span");
        s.className = "fancy-heart";
        s.textContent = "♥";
        s.style.left = cx + "px";
        s.style.top = cy + "px";
        s.style.color = ["#ac4aea", "#e86aa6", "#c9a046", "#c76df5"][i % 4];
        s.style.fontSize = 14 + Math.random() * 18 + "px";
        document.body.appendChild(s);
        var ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 110;
        s.animate([
          { transform: "translate(-50%,-50%) scale(0.4)", opacity: 1 },
          { transform: "translate(calc(-50% + " + Math.cos(ang) * dist + "px), calc(-50% + " + (Math.sin(ang) * dist - 60) + "px)) scale(1.2)", opacity: 0 }
        ], { duration: 1100 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = (function (el) {
          return function () { el.remove(); };
        })(s);
      }
    };
    heart.addEventListener("click", burst);
    heart.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); burst(); } });
  }

  // ---------- when & where: up next (per side) ----------
  var today;
  try { today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()); }
  catch (e) { today = new Date().toISOString().slice(0, 10); }
  Array.prototype.forEach.call(document.querySelectorAll(".timeline"), function (tl) {
    var marked = false;
    Array.prototype.forEach.call(tl.querySelectorAll(".day[data-day]"), function (d) {
      var iso = d.getAttribute("data-day");
      if (iso < today) { d.classList.add("is-past"); return; }
      if (!marked) {
        marked = true;
        d.classList.add("is-next");
        var badge = d.querySelector(".day-badge");
        badge.textContent = iso === today ? "Today" : "Up next";
        badge.hidden = false;
      }
    });
  });

  // ---------- when & where: groom's side / bride's side switch ----------
  var ww = document.getElementById("fh5co-when-where");
  var sideBtns = document.querySelectorAll("[data-side-btn]");
  if (ww && sideBtns.length) {
    var panels = ww.querySelectorAll(".side-panel");
    var showSide = function (which, animate) {
      Array.prototype.forEach.call(sideBtns, function (b) {
        var on = b.getAttribute("data-side-btn") === which;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      Array.prototype.forEach.call(panels, function (p) {
        var on = p.getAttribute("data-side") === which;
        p.hidden = !on;
        if (on && animate) {
          Array.prototype.forEach.call(p.querySelectorAll(".animate-box"), function (el, i) {
            el.classList.remove("fadeInUp", "animated");
            void el.offsetWidth;
            el.style.animationDelay = Math.min(i, 6) * 0.08 + "s";
            el.classList.add("fadeInUp", "animated", "item-animate");
          });
        }
      });
    };
    var start = new URLSearchParams(location.search).get("side");
    if (start !== "groom" && start !== "bride") start = ww.getAttribute("data-default-side");
    showSide(start, false);
    Array.prototype.forEach.call(sideBtns, function (b) {
      b.addEventListener("click", function () { showSide(b.getAttribute("data-side-btn"), true); });
    });
  }

  // ---------- our story: tap a photo to enlarge ----------
  Array.prototype.forEach.call(document.querySelectorAll("[data-lightbox]"), function (btn) {
    btn.addEventListener("click", function () {
      var box = document.createElement("div");
      box.className = "fancy-lightbox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-label", "Photo");
      var img = document.createElement("img");
      img.src = btn.getAttribute("data-lightbox");
      img.alt = btn.querySelector("img").alt;
      var close = document.createElement("button");
      close.type = "button";
      close.setAttribute("aria-label", "Close");
      close.innerHTML = "&times;";
      box.appendChild(img);
      box.appendChild(close);
      document.body.appendChild(box);
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      var shut = function () {
        box.classList.remove("is-open");
        document.removeEventListener("keydown", onKey);
        setTimeout(function () { box.remove(); btn.focus(); }, 300);
      };
      var onKey = function (e) { if (e.key === "Escape") shut(); };
      box.addEventListener("click", shut);
      document.addEventListener("keydown", onKey);
      close.focus();
    });
  });

  // ---------- bride & groom: quiz ----------
  var quiz = document.querySelector("[data-quiz]");
  if (quiz) {
    var qs = quiz.querySelectorAll(".quiz-q");
    var result = quiz.querySelector(".quiz-result");
    var current = 0, score = 0;
    var names = { kirat: "Kirat", aval: "Aval" };
    var show = function (i) {
      Array.prototype.forEach.call(qs, function (q, j) { q.classList.toggle("is-current", j === i); });
    };
    Array.prototype.forEach.call(qs, function (q) {
      var fb = document.createElement("p");
      fb.className = "quiz-feedback";
      fb.setAttribute("aria-live", "polite");
      q.appendChild(fb);
      var buttons = q.querySelectorAll("[data-pick]");
      Array.prototype.forEach.call(buttons, function (b) {
        b.addEventListener("click", function () {
          var answer = q.getAttribute("data-answer");
          var right = b.getAttribute("data-pick") === answer;
          if (right) score++;
          Array.prototype.forEach.call(buttons, function (x) {
            x.disabled = true;
            if (x.getAttribute("data-pick") === answer) x.classList.add("is-right");
            else if (x === b) x.classList.add("is-wrong");
          });
          fb.textContent = right ? "Yes! You know us well ✨" : "Nope, it’s " + names[answer] + "!";
          setTimeout(function () {
            current++;
            if (current < qs.length) { show(current); return; }
            show(-1);
            result.hidden = false;
            quiz.querySelector(".quiz-score").textContent = score + " / " + qs.length;
            quiz.querySelector(".quiz-msg").textContent =
              score === qs.length ? "Perfect score! You clearly know us better than we know ourselves." :
              score >= qs.length - 2 ? "So close! You’re definitely on the VIP list." :
              score >= qs.length / 2 ? "Not bad! Come to the sangeet and get to know us better." :
              "Hmm… we need to hang out more. See you at the wedding!";
            if (score >= qs.length - 1) confetti();
          }, 1300);
        });
      });
    });
    quiz.querySelector("[data-quiz-restart]").addEventListener("click", function () {
      current = 0; score = 0; result.hidden = true;
      Array.prototype.forEach.call(quiz.querySelectorAll("[data-pick]"), function (x) {
        x.disabled = false; x.classList.remove("is-right", "is-wrong");
      });
      Array.prototype.forEach.call(quiz.querySelectorAll(".quiz-feedback"), function (f) { f.textContent = ""; });
      show(0);
    });
    show(0);
  }

  // ---------- RSVP: confetti when someone joyfully accepts ----------
  var started = document.getElementById("fh5co-started");
  var rsvpForm = document.getElementById("rsvp-form");
  if (started && rsvpForm && "MutationObserver" in window) {
    var mo = new MutationObserver(function () {
      if (!started.querySelector(".rsvp-thanks")) return;
      mo.disconnect();
      var going = rsvpForm.querySelector("input[name=attending]:checked");
      if (going && going.value === "Yes") confetti();
    });
    mo.observe(started, { childList: true, subtree: true });
  }

  function confetti() {
    if (reduceMotion) return;
    var c = document.createElement("canvas");
    c.className = "fancy-confetti";
    document.body.appendChild(c);
    var ctx = c.getContext("2d");
    var w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    var colors = ["#ac4aea", "#c9a046", "#f3dca0", "#e86aa6", "#ffffff", "#7d2fb3"];
    var bits = [];
    for (var i = 0; i < 160; i++) {
      bits.push({
        x: w / 2 + (Math.random() - 0.5) * 120, y: h * 0.55,
        vx: (Math.random() - 0.5) * 16, vy: -8 - Math.random() * 12,
        s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length]
      });
    }
    var start = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, w, h);
      bits.forEach(function (b) {
        b.vy += 0.32; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
        ctx.restore();
      });
      if (t - start < 3200) requestAnimationFrame(frame);
      else c.remove();
    })(start);
  }
})();
