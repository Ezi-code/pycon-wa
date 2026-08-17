// partial loader — fetches HTML fragments into include slots
async function loadPartials() {
  const partials = [
    { id: "schedule-include", file: "static/partials/schedule.html" },
    { id: "speakers-include", file: "static/partials/speakers.html" },
    { id: "sponsors-include", file: "static/partials/sponsors.html" },
  ];
  await Promise.all(
    partials.map(async ({ id, file }) => {
      const el = document.getElementById(id);
      if (!el) return;
      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(res.status);
        el.innerHTML = await res.text();
      } catch (err) {
        console.warn(`Could not load ${file}:`, err);
      }
    }),
  );
  // re-observe any new .reveal elements
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
}

// mobile nav
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", false);
  }),
);

// faq accordion
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  q.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => {
      i.classList.remove("open");
      i.querySelector(".faq-a").style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add("open");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
});

// registration form — AJAX submit to Formspree-style endpoint
const regForm = document.getElementById("regForm");
const formStatus = document.getElementById("formStatus");
regForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = regForm.querySelector(".form-submit");
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;
  formStatus.classList.remove("show");
  try {
    const response = await fetch(regForm.action, {
      method: "POST",
      body: new FormData(regForm),
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      formStatus.textContent =
        "Thank you for registering! You'll be notified by email when you're confirmed.";
      formStatus.style.color = "#8fd6b0";
      regForm.reset();
    } else {
      throw new Error("Submission failed");
    }
  } catch (err) {
    formStatus.textContent =
      "This form isn't connected to a live endpoint yet. See the setup note in the site source.";
    formStatus.style.color = "#e88a78";
  }
  formStatus.classList.add("show");
  submitBtn.textContent = "Register, free →";
  submitBtn.disabled = false;
});

// newsletter form
const newsletterForm = document.querySelector(".newsletter form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    newsletterForm.querySelector("button").textContent =
      "Thanks, you're on the list";
  });
}

// scroll reveal
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// init — load partials then bind interactive elements
loadPartials().then(() => {
  // program tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".day")
        .forEach((d) => d.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.day).classList.add("active");
    });
  });
});
