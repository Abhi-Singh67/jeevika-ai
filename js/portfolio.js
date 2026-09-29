// =========================================================
// portfolio.js — Post-employment Portfolio + Reputation
// Uses PORTFOLIO_DEMO (data.js). All animations are vanilla JS —
// count-up numbers, radial gauge fill, staggered gallery reveal,
// IntersectionObserver-based review reveal.
// =========================================================

const data = PORTFOLIO_DEMO;

document.getElementById("repName").textContent = data.name;
document.getElementById("repRole").textContent = `${data.role} · ${data.location} · Member since ${data.memberSince}`;
document.getElementById("jobCount").textContent = `${data.jobs.length} COMPLETED JOBS · CLICK TO VIEW`;

// ---------- Count-up helper ----------
function animateNumber(el, target, suffix = "", duration = 1400) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function animateRating(el, target, duration = 1400) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(1);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------- Reputation gauge ----------
const circumference = 2 * Math.PI * 60; // r=60
const gaugeFg = document.getElementById("gaugeFg");
gaugeFg.style.strokeDasharray = circumference;
gaugeFg.style.strokeDashoffset = circumference;
requestAnimationFrame(() => {
  gaugeFg.style.strokeDashoffset = circumference - (data.reputation.score / 100) * circumference;
});
animateNumber(document.getElementById("gaugeNum"), data.reputation.score);
animateNumber(document.getElementById("mJobs"), data.reputation.jobsCompleted);
animateNumber(document.getElementById("mRepeat"), data.reputation.repeatClients, "%");
animateRating(document.getElementById("mRating"), data.reputation.avgRating);

// ---------- Star row ----------
const starRow = document.getElementById("starRow");
for (let i = 0; i < 5; i++) {
  const s = document.createElement("span");
  s.textContent = "★";
  starRow.appendChild(s);
}
[...starRow.children].forEach((s, i) => {
  setTimeout(() => s.classList.add("lit"), 300 + i * 180);
});

// ---------- Portfolio gallery ----------
const gallery = document.getElementById("gallery");
data.jobs.forEach((job, i) => {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.style.background = job.gradient;
  tile.innerHTML = `<span class="tag">${job.tag}</span>`;
  tile.addEventListener("click", () => openLightbox(job));
  gallery.appendChild(tile);
  setTimeout(() => tile.classList.add("show"), 150 + i * 90);
});

// ---------- Lightbox ----------
const lightbox = document.getElementById("lightbox");
function openLightbox(job) {
  document.getElementById("lightboxMedia").style.background = job.gradient;
  document.getElementById("lightboxTitle").textContent = job.title;
  document.getElementById("lightboxDesc").textContent = job.desc;
  lightbox.classList.add("open");
}
document.getElementById("lightboxClose").addEventListener("click", () => lightbox.classList.remove("open"));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("open"); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") lightbox.classList.remove("open"); });

// ---------- Reviews (scroll-reveal) ----------
const reviewsEl = document.getElementById("reviews");
data.reviews.forEach((r) => {
  const card = document.createElement("div");
  card.className = "review card";
  card.innerHTML = `
    <div class="review-top"><span class="rname">${r.name}</span><span class="rjob">${r.job}</span></div>
    <p>"${r.text}"</p>
  `;
  reviewsEl.appendChild(card);
});
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("show"); io.unobserve(entry.target); }
  });
}, { threshold: 0.2 });
document.querySelectorAll(".review").forEach((el) => io.observe(el));
