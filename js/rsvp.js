(function () {
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
