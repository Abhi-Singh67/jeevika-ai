// =========================================================
// dashboard.js — Poora dashboard orchestrate karta hai:
// profile, pathways+skill gap, why/why-not, comparison table,
// what-if simulator, 90-day roadmap, skill passport.
// Sab kuch client-side hai — koi server call nahi.
// =========================================================

const DEMO_PROFILE = {
  education: "12th Pass",
  occupation: "Agriculture (Family Occupation)",
  self_reported_skills: ["Tractor Operation", "Agricultural Machinery Handling"],
  ai_inferred_skills: ["Basic Mechanical Maintenance", "Equipment Handling"],
  interests: ["Electrical Work"],
  constraints: { mobility: "Cannot relocate outside district", hours_per_day: 3, budget_inr: null },
  employment_preference: "Self-Employment",
};

let currentProfile = null;
let currentRanked = [];
let selectedIndex = 0;

function constraintTags(constraints) {
  const tags = [];
  if (constraints?.mobility && constraints.mobility !== "Not specified") tags.push(constraints.mobility);
  if (constraints?.hours_per_day != null) tags.push(constraints.hours_per_day + " hours/day available");
  if (constraints?.budget_inr != null) tags.push("Budget: ₹" + constraints.budget_inr);
  return tags.length ? tags : ["None mentioned"];
}

// ---------- Profile summary ----------
function renderProfile(profile) {
  document.getElementById("d-education").textContent = profile.education;
  document.getElementById("d-occupation").textContent = profile.occupation;
  document.getElementById("d-skills").innerHTML =
    (profile.self_reported_skills || []).map(s => `<span class="tag">${s}</span>`).join("") +
    (profile.ai_inferred_skills || []).map(s => `<span class="tag inferred">${s} (AI-inferred)</span>`).join("");
  document.getElementById("d-interests").innerHTML =
    (profile.interests || []).map(s => `<span class="tag">${s}</span>`).join("") || "Not specified";
  document.getElementById("d-constraints").innerHTML =
    constraintTags(profile.constraints).map(s => `<span class="tag">${s}</span>`).join("");
}

// ---------- Helper: read verified skills (set by verification.html) ----------
function getVerifiedSkills() {
  try { return JSON.parse(localStorage.getItem("jeevikaVerifiedSkills")) || []; }
  catch { return []; }
}

// ---------- Pathways + skill gap (with radial score ring + expandable breakdown) ----------
const FACTOR_LABELS = [
  { key: "interestScore", label: "Interest Match", color: "var(--marigold)" },
  { key: "skillScore", label: "Skill Match", color: "var(--forest)" },
  { key: "educationScore", label: "Education Fit", color: "var(--clay)" },
  { key: "localScore", label: "Local Opportunity", color: "var(--forest-dark)" },
  { key: "constraintScore", label: "Constraint Fit", color: "var(--marigold-dark)" },
  { key: "empScore", label: "Employment Match", color: "var(--clay)" },
];

function renderPathways() {
  const verifiedSkills = getVerifiedSkills();
  const list = document.getElementById("pathways-list");
  const circumference = 2 * Math.PI * 26; // r=26, matches the SVG below

  list.innerHTML = currentRanked.map((p, i) => `
    <div class="pathway-card ${i === selectedIndex ? 'selected' : ''}" data-idx="${i}">
      <div class="pathway-top" onclick="selectPathway(${i})" style="cursor:pointer;">
        <h3>${p.occupation} ${i === selectedIndex ? '<span class="select-badge">SELECTED</span>' : ''}</h3>
        <div class="score-ring">
          <svg viewBox="0 0 58 58">
            <circle class="bg" cx="29" cy="29" r="26"></circle>
            <circle class="fg" cx="29" cy="29" r="26" style="stroke-dasharray:${circumference}; stroke-dashoffset:${circumference}"></circle>
          </svg>
          <div class="pct">${p.score}%</div>
        </div>
      </div>
      <p style="color:var(--ink-soft); margin-top:4px;">${p.description}</p>
      <div class="pathway-meta">
        <span>🎓 ${p.education_requirement}</span>
        <span>⏱️ ${p.training_duration_weeks} weeks training</span>
        <span>💰 ₹${p.investment_amount_inr.toLocaleString("en-IN")} approx.</span>
        <span>🧭 ${p.mobility_requirement} mobility needed</span>
      </div>
      <div class="pathway-skills">
        <span class="label">Present:</span>
        ${p.matched_skills.map(s => `<span class="skill-chip have">${s}${verifiedSkills.includes(s) ? ' ✓' : ''}</span>`).join("") || "<em>None yet</em>"}
      </div>
      <div class="pathway-skills">
        <span class="label">Missing:</span>
        ${p.missing_skills.map(s => `<span class="skill-chip missing">${s}</span>`).join("") || "<em>None — fully ready!</em>"}
      </div>
      <button class="breakdown-toggle" onclick="event.stopPropagation(); toggleBreakdown(${i})">📊 Score Breakdown ▾</button>
      <div class="breakdown">
        ${FACTOR_LABELS.map(f => `
          <div class="factor-row">
            <div class="fl">${f.label}</div>
            <div class="ftrack"><div class="ffill" data-target="${Math.round(p._flags[f.key] * 100)}" style="background:${f.color}"></div></div>
            <div class="fv">${Math.round(p._flags[f.key] * 100)}%</div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  // Animate each radial ring from 0 -> score%, staggered
  document.querySelectorAll(".score-ring .fg").forEach((fg, i) => {
    const score = currentRanked[i].score;
    setTimeout(() => {
      fg.style.strokeDashoffset = circumference - (score / 100) * circumference;
    }, 150 + i * 150);
  });
}

// Expand/collapse a pathway card's factor breakdown (mirrors ai-matching.html pattern)
function toggleBreakdown(i) {
  const card = document.querySelector(`.pathway-card[data-idx="${i}"]`);
  const opening = !card.classList.contains("expanded");
  card.classList.toggle("expanded");
  card.querySelector(".breakdown-toggle").textContent = opening ? "📊 Hide Breakdown ▴" : "📊 Score Breakdown ▾";
  if (opening) {
    card.querySelectorAll(".ffill").forEach((bar, idx) => {
      setTimeout(() => { bar.style.width = bar.dataset.target + "%"; }, idx * 100);
    });
  } else {
    card.querySelectorAll(".ffill").forEach(bar => { bar.style.width = "0%"; });
  }
}

// ---------- Why / Why Not ----------
function renderWhy() {
  const selected = currentRanked[selectedIndex];
  document.getElementById("why-pathway-name").textContent = selected.occupation;
  document.getElementById("why-list").innerHTML =
    getWhyReasons(selected).map(r => `<li>${r}</li>`).join("");

  const others = currentRanked.filter((_, i) => i !== selectedIndex);
  document.getElementById("whynot-list").innerHTML = others.map(o => {
    const reasons = getWhyNotReasons(o, selected);
    return `<li><b>${o.occupation}:</b> ${reasons.join("; ")}</li>`;
  }).join("") || "<li>Koi aur vikalp nahi hai comparison ke liye</li>";
}

// ---------- Comparison table ----------
function renderComparisonTable() {
  const rows = [
    { label: "Score", get: p => p.score + "/100" },
    { label: "Skill Match", get: p => `${p.matched_skills.length}/${p.required_skills.length}` },
    { label: "Training Time", get: p => p.training_duration_weeks + " weeks" },
    { label: "Investment", get: p => "₹" + p.investment_amount_inr.toLocaleString("en-IN") },
    { label: "Local Opportunity", get: p => p.local_opportunity },
    { label: "Mobility Required", get: p => p.mobility_requirement },
    { label: "Employment Type", get: p => p.employment_type.join(" / ") },
  ];
  let html = "<tr><th>Factor</th>" + currentRanked.map(p => `<th>${p.occupation}</th>`).join("") + "</tr>";
  rows.forEach(row => {
    html += `<tr><td class="metric-label">${row.label}</td>` +
      currentRanked.map(p => `<td>${row.get(p)}</td>`).join("") + "</tr>";
  });
  document.getElementById("compare-table").innerHTML = html;
}

// ---------- Roadmap ----------
function renderRoadmap() {
  const selected = currentRanked[selectedIndex];
  document.getElementById("roadmap-pathway-name").textContent = selected.occupation;
  document.getElementById("roadmap-list").innerHTML = generateRoadmap(selected).map(step => `
    <div class="roadmap-item">
      <div class="period">${step.period}</div>
      <div>
        <div class="rd-title">${step.title}</div>
        <div class="rd-detail">${step.detail}</div>
      </div>
    </div>
  `).join("");
}

// ---------- Skill Passport (flip ID card + real QR code) ----------
function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function renderPassport() {
  const selected = currentRanked[selectedIndex];
  const p = currentProfile;
  const verifiedSkills = getVerifiedSkills();
  const allSkills = [...(p.self_reported_skills || []), ...(p.ai_inferred_skills || [])];
  const verifiedCount = allSkills.filter(s => verifiedSkills.includes(s)).length;

  // Beneficiary ka koi naam field abhi profile mein nahi hai, isliye ek generic ID use karte hain
  const displayName = "JEEVIKA Beneficiary";
  const passportId = "JVK-" + (p.education || "NA").replace(/\s+/g, "").slice(0, 3).toUpperCase() + "-" + selected.pathway_id.slice(0, 4).toUpperCase();

  document.getElementById("ppFront").innerHTML = `
    <div class="pp-eyebrow">JEEVIKA SKILL PASSPORT</div>
    <div class="pp-avatar">${getInitials(displayName)}</div>
    <div class="pp-name">${displayName}</div>
    <div class="pp-role">${p.education} · Target: ${selected.occupation}</div>
    <div class="pp-tags">
      ${allSkills.map(s => `<span class="tag ${verifiedSkills.includes(s) ? '' : 'inferred'}">${s}${verifiedSkills.includes(s) ? ' ✓' : ''}</span>`).join("")}
    </div>
    <div class="pp-footer"><span>ID: ${passportId}</span><span>Flip for QR →</span></div>
  `;

  document.getElementById("ppBack").innerHTML = `
    <h3>Scan to Verify</h3>
    <div class="qr-holder" id="qrHolder"></div>
    <div class="pp-back-stats">
      <div><b>${verifiedCount}/${allSkills.length}</b><span>VERIFIED SKILLS</span></div>
      <div><b>${selected.missing_skills.length}</b><span>SKILL GAP</span></div>
    </div>
  `;

  // Real, scannable QR code — payload is a mock deep-link (no backend exists yet)
  const qrHolder = document.getElementById("qrHolder");
  qrHolder.innerHTML = "";
  const payload = `https://jeevika.ai/passport/${passportId}`;
  if (typeof QRCode !== "undefined") {
    new QRCode(qrHolder, { text: payload, width: 140, height: 140, colorDark: "#1C2521", colorLight: "#ffffff" });
  } else {
    qrHolder.innerHTML = `<div style="font-family:monospace; font-size:0.7rem; color:#1C2521; padding:10px;">${payload}</div>`;
  }
}

// Flip interaction for the passport card
document.addEventListener("DOMContentLoaded", () => {
  const flipScene = document.getElementById("passportFlip");
  if (!flipScene) return;
  const toggle = () => flipScene.classList.toggle("flipped");
  flipScene.addEventListener("click", toggle);
  flipScene.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
});

// ---------- Master refresh (called after selection or what-if change) ----------
function refreshAll() {
  renderPathways();
  renderWhy();
  renderComparisonTable();
  renderRoadmap();
  renderPassport();
}

function selectPathway(i) {
  selectedIndex = i;
  refreshAll();
}

// ---------- What-If Simulator ----------
document.addEventListener("input", (e) => {
  if (e.target.id === "wi-budget") document.getElementById("wi-budget-val").textContent = Number(e.target.value).toLocaleString("en-IN");
  if (e.target.id === "wi-hours") document.getElementById("wi-hours-val").textContent = e.target.value;
});

function applyWhatIf() {
  const mobility = document.getElementById("wi-mobility").value;
  const budget_inr = Number(document.getElementById("wi-budget").value);
  const hours_per_day = Number(document.getElementById("wi-hours").value);
  const employment_preference = document.getElementById("wi-employment").value;

  const modifiedProfile = {
    ...currentProfile,
    employment_preference,
    constraints: { mobility, budget_inr, hours_per_day },
  };

  currentRanked = getRecommendations(modifiedProfile);
  selectedIndex = 0;
  refreshAll();

  document.getElementById("whatif-note").style.display = "block";
}

// ---------- Init ----------
const saved = localStorage.getItem("jeevikaProfile");
currentProfile = saved ? JSON.parse(saved) : DEMO_PROFILE;
renderProfile(currentProfile);
currentRanked = getRecommendations(currentProfile);
refreshAll();

// What-if controls ko current profile ke hisaab se pre-fill karo
if (currentProfile.constraints?.mobility === "Can relocate") document.getElementById("wi-mobility").value = "Can relocate";
if (currentProfile.constraints?.budget_inr) {
  document.getElementById("wi-budget").value = currentProfile.constraints.budget_inr;
  document.getElementById("wi-budget-val").textContent = Number(currentProfile.constraints.budget_inr).toLocaleString("en-IN");
}
if (currentProfile.constraints?.hours_per_day) {
  document.getElementById("wi-hours").value = currentProfile.constraints.hours_per_day;
  document.getElementById("wi-hours-val").textContent = currentProfile.constraints.hours_per_day;
}
if (currentProfile.employment_preference) document.getElementById("wi-employment").value = currentProfile.employment_preference;
