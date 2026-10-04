(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("contact-status");
  var button = form.querySelector("button[type=submit]");
  var buttonText = button.textContent;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    button.disabled = true;
    button.textContent = "Sending...";

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("bad response");
      var name = (form.querySelector("input[name=name]").value || "").trim();
      var box = document.createElement("div");
      box.className = "rsvp-thanks";
      box.textContent = "Thank you, " + name + "! We'll get back to you soon.";
      form.parentNode.replaceChild(box, form);
    }).catch(function () {
      status.textContent = "Something went wrong. Please try again, or message us on WhatsApp.";
      button.disabled = false;
      button.textContent = buttonText;
    });
  });
})();
