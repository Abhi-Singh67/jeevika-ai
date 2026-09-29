// =========================================================
// admin.js — ADMIN_DEMO (data.js) ko dashboard mein render karta hai
// Sab hardcoded demo numbers hain — real project mein ye database
// se (beneficiaries, assessments collections) aayenge.
// =========================================================

function renderStats() {
  const d = ADMIN_DEMO;
  const cards = [
    { num: d.totalAssessed.toLocaleString("en-IN"), label: "Beneficiaries Assessed" },
    { num: d.trainingEnrolled.toLocaleString("en-IN"), label: "Enrolled in Training" },
    { num: d.selfEmployedOutcomes.toLocaleString("en-IN"), label: "Self-Employment Outcomes" },
    { num: d.wageEmployedOutcomes.toLocaleString("en-IN"), label: "Wage Employment Outcomes" },
  ];
  document.getElementById("stat-grid").innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="num">${c.num}</div>
      <div class="label">${c.label}</div>
    </div>
  `).join("");
}

function renderSectorBars() {
  const sectors = ADMIN_DEMO.topInterestSectors;
  const max = Math.max(...sectors.map(s => s.count));
  document.getElementById("sector-bars").innerHTML = sectors.map(s => `
    <div class="bar-row">
      <div class="bar-label"><span>${s.sector}</span><span>${s.count}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(s.count / max) * 100}%"></div></div>
    </div>
  `).join("");
}

// ---------- District Skill Supply vs Demand (real Leaflet map) ----------
const LEVEL_COLOR = { high: "#FB6B52", medium: "#F5B942", low: "#34D399" };

function levelFor(gap) {
  if (gap >= 5) return "high";
  if (gap >= 2) return "medium";
  return "low";
}

let districtMap = null;
let zoneMarkers = [];

function initDistrictMap() {
  // Centered roughly over the demo districts (Kanpur Dehat / Hamirpur / Jalaun, UP)
  districtMap = L.map("districtMap", { scrollWheelZoom: false }).setView([26.15, 79.75], 8);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 18,
  }).addTo(districtMap);

  // Only zoom with scroll once the user has actually clicked into the map
  districtMap.on("focus", () => districtMap.scrollWheelZoom.enable());
  districtMap.on("blur", () => districtMap.scrollWheelZoom.disable());
}

// Small fixed offset per row so multiple skills in the same district don't stack exactly
function offsetCoords(baseCoords, index) {
  const angle = index * 65 * (Math.PI / 180);
  const r = 0.045;
  return [baseCoords[0] + r * Math.sin(angle), baseCoords[1] + r * Math.cos(angle)];
}

function plotZone(row, index) {
  const base = DISTRICT_COORDS[row.district];
  if (!base) return;
  const coords = offsetCoords(base, index);
  const gap = row.demand - row.supply;
  const level = levelFor(gap);
  const radius = 900 + gap * 350;

  const circle = L.circle(coords, {
    radius,
    color: LEVEL_COLOR[level],
    fillColor: LEVEL_COLOR[level],
    fillOpacity: 0.28,
    weight: 2,
  }).addTo(districtMap);

  circle.bindPopup(`
    <div class="popup-title">${row.district}</div>
    <div class="popup-meta">${row.skill} · Demand ${row.demand} vs Supply ${row.supply}</div>
  `);

  zoneMarkers.push({ circle, row, level, coords });
}

function renderAllZones(rows) {
  zoneMarkers.forEach((m) => districtMap.removeLayer(m.circle));
  zoneMarkers = [];
  rows.forEach((row, i) => plotZone(row, i));
}

function renderZoneList(rows) {
  const sorted = [...rows].sort((a, b) => (b.demand - b.supply) - (a.demand - a.supply));
  document.getElementById("zoneList").innerHTML = sorted.map((z) => {
    const level = levelFor(z.demand - z.supply);
    return `
      <div class="zone-row" data-district="${z.district}" data-skill="${z.skill}">
        <span>${z.district} — ${z.skill}</span>
        <span class="zone-badge ${level}">Gap ${z.demand - z.supply}</span>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".zone-row").forEach((row) => {
    row.addEventListener("click", () => {
      const match = zoneMarkers.find((m) => m.row.district === row.dataset.district && m.row.skill === row.dataset.skill);
      if (match) districtMap.flyTo(match.coords, 11, { duration: 1.1 });
    });
  });
}

function renderFilterChips(rows) {
  const skills = ["All", ...new Set(rows.map((r) => r.skill))];
  const filterBar = document.getElementById("filterBar");
  filterBar.innerHTML = "";
  skills.forEach((skill) => {
    const chip = document.createElement("div");
    chip.className = "filter-chip" + (skill === "All" ? " active" : "");
    chip.textContent = skill;
    chip.addEventListener("click", () => {
      filterBar.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const filtered = skill === "All" ? rows : rows.filter((r) => r.skill === skill);
      renderAllZones(filtered);
      renderZoneList(filtered);
    });
    filterBar.appendChild(chip);
  });
}

function renderDistrictMap() {
  const rows = ADMIN_DEMO.districtDemand;
  initDistrictMap();
  renderAllZones(rows);
  renderZoneList(rows);
  renderFilterChips(rows);
}

renderStats();
renderSectorBars();
renderDistrictMap();
