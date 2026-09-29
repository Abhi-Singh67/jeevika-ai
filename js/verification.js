// =========================================================
// verification.js — Skill Verification simulation
//
// Profile (localStorage se) ke self-reported + AI-inferred skills
// dikhata hai. User "Verify Karein" dabaake ek skill select karta
// hai, phir certificate "upload" karta hai (demo — koi real file
// processing nahi hoti). Verify hone par skill ka naam
// localStorage("jeevikaVerifiedSkills") mein save ho jaata hai —
// dashboard.js aur passport isi list ko padhte hain.
// =========================================================

const DEMO_SKILLS_FALLBACK = ["Tractor Operation", "Agricultural Machinery Handling", "Basic Mechanical Maintenance", "Equipment Handling"];

function loadProfileSkills() {
  const saved = localStorage.getItem("jeevikaProfile");
  if (!saved) return DEMO_SKILLS_FALLBACK;
  const profile = JSON.parse(saved);
  return [...(profile.self_reported_skills || []), ...(profile.ai_inferred_skills || [])];
}

function getVerifiedSkills() {
  try { return JSON.parse(localStorage.getItem("jeevikaVerifiedSkills")) || []; }
  catch { return []; }
}

function saveVerifiedSkill(skillName) {
  const verified = getVerifiedSkills();
  if (!verified.includes(skillName)) verified.push(skillName);
  localStorage.setItem("jeevikaVerifiedSkills", JSON.stringify(verified));
}

let selectedSkill = null;
const skillList = document.getElementById("skillList");

function renderSkills() {
  const skills = loadProfileSkills();
  const verified = getVerifiedSkills();

  skillList.innerHTML = skills.map((skill, i) => {
    const isVerified = verified.includes(skill);
    return `
      <div class="skill-row" id="skill-${i}">
        <div class="si">🔧</div>
        <div class="sinfo"><b>${skill}</b><span>${isVerified ? "Certified — verified" : "Not yet verified"}</span></div>
        <div class="status-pill ${isVerified ? "verified" : "none"}">${isVerified ? "✓ VERIFIED" : "NOT VERIFIED"}</div>
        <button class="verify-btn" data-skill="${skill}" ${isVerified ? "disabled" : ""}>${isVerified ? "Done" : "Verify Karein"}</button>
      </div>
    `;
  }).join("");

  skillList.querySelectorAll(".verify-btn:not(:disabled)").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedSkill = btn.dataset.skill;
      logLine(`👉 "${selectedSkill}" select kiya gaya — ab certificate upload karein (left panel)`);
    });
  });
}
renderSkills();

// ---------- Upload zone ----------
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag"));
dropzone.addEventListener("drop", (e) => { e.preventDefault(); dropzone.classList.remove("drag"); runVerification(); });
fileInput.addEventListener("change", () => { if (fileInput.files.length) runVerification(); });

// ---------- Pipeline stepper ----------
const steps = [...document.querySelectorAll(".pstep")];
function setStep(activeIndex, doneUpTo) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === activeIndex);
    step.classList.toggle("done", i < doneUpTo);
  });
}

// ---------- Log helper ----------
const logBox = document.getElementById("logBox");
function logLine(text, ok = false) {
  const line = document.createElement("div");
  line.textContent = text;
  if (ok) line.classList.add("ok");
  logBox.appendChild(line);
  requestAnimationFrame(() => line.classList.add("show"));
  while (logBox.children.length > 4) logBox.removeChild(logBox.firstChild);
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ---------- Full verification sequence ----------
let verifying = false;
async function runVerification() {
  if (verifying) return;
  if (!selectedSkill) {
    alert("Pehle right panel mein kisi skill ke saamne 'Verify Karein' dabayein.");
    return;
  }
  verifying = true;
  dropzone.classList.add("scanning");
  dropzone.querySelector("h3").textContent = "Processing certificate...";

  setStep(0, 0);
  logLine("📄 File received: certificate.pdf");
  await wait(700);

  setStep(1, 1);
  logLine("🔍 Scanning document for text + seals...");
  await wait(1000);

  setStep(2, 2);
  logLine("🗂️ Cross-checking against training-issuer records...");
  await wait(1100);

  setStep(3, 3);
  logLine("✅ Match found — certificate looks authentic", true);
  await wait(600);

  setStep(4, 4);
  logLine(`🛡️ "${selectedSkill}" — Verified badge granted`, true);

  dropzone.classList.remove("scanning");
  dropzone.querySelector("h3").textContent = "Drag & drop certificate yahaan";

  saveVerifiedSkill(selectedSkill);
  renderSkills();

  const rows = [...skillList.querySelectorAll(".skill-row")];
  const target = rows.find((r) => r.querySelector("b").textContent === selectedSkill);
  if (target) {
    target.classList.add("bursting");
    setTimeout(() => target.classList.remove("bursting"), 1000);
  }

  selectedSkill = null;
  verifying = false;
}
