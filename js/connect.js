// =========================================================
// connect.js — Post-Training "Connect" layer
//
// Beneficiary ki profile (localStorage) se uski top recommended
// pathway nikaalta hai, aur CONNECT_OPPORTUNITIES (data.js) mein
// se usse match karne wali listings highlight karta hai.
// Search + location filter bhi client-side hi hain.
// =========================================================

const DEMO_PROFILE_FALLBACK = {
  education: "12th Pass",
  occupation: "Agriculture (Family Occupation)",
  self_reported_skills: ["Tractor Operation"],
  ai_inferred_skills: ["Basic Mechanical Maintenance"],
  interests: ["Electrical Work"],
  constraints: { mobility: "Cannot relocate outside district", hours_per_day: 3, budget_inr: null },
  employment_preference: "Self-Employment",
};

let matchedPathwayIds = [];
let activeLocation = "All";
let searchTerm = "";

function computeMatchedPathwayIds() {
  const saved = localStorage.getItem("jeevikaProfile");
  const profile = saved ? JSON.parse(saved) : DEMO_PROFILE_FALLBACK;
  const ranked = getRecommendations(profile);
  return ranked.slice(0, 2).map((p) => p.pathway_id); // top 2 pathways count as "matched"
}

function renderFilters() {
  const locations = ["All", ...new Set(CONNECT_OPPORTUNITIES.map((o) => o.location))];
  const filterRow = document.getElementById("filterRow");
  filterRow.innerHTML = locations.map((loc) =>
    `<div class="filter-chip ${loc === activeLocation ? "active" : ""}" data-loc="${loc}">${loc}</div>`
  ).join("");

  filterRow.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeLocation = chip.dataset.loc;
      renderFilters();
      renderList();
    });
  });
}

function renderList() {
  const term = searchTerm.toLowerCase();
  const filtered = CONNECT_OPPORTUNITIES.filter((o) => {
    const matchesLocation = activeLocation === "All" || o.location === activeLocation;
    const matchesSearch = !term ||
      o.title.toLowerCase().includes(term) ||
      o.employer.toLowerCase().includes(term) ||
      o.location.toLowerCase().includes(term);
    return matchesLocation && matchesSearch;
  });

  // Matched-pathway opportunities pehle dikhaye jaate hain
  filtered.sort((a, b) => {
    const aMatch = matchedPathwayIds.includes(a.pathway_id) ? 1 : 0;
    const bMatch = matchedPathwayIds.includes(b.pathway_id) ? 1 : 0;
    return bMatch - aMatch;
  });

  const oppList = document.getElementById("oppList");
  if (!filtered.length) {
    oppList.innerHTML = `<div class="empty-state">Koi opportunity nahi mili — search ya filter badal kar dekhein.</div>`;
    return;
  }

  oppList.innerHTML = filtered.map((o) => {
    const isMatch = matchedPathwayIds.includes(o.pathway_id);
    return `
      <div class="opp-card ${isMatch ? "match" : ""}">
        <div class="opp-info">
          <h3>${o.title} ${isMatch ? '<span class="match-tag">✓ Aapki pathway se match</span>' : ""}</h3>
          <div class="employer">${o.employer}</div>
          <div class="opp-meta">
            <span>📍 ${o.location}</span>
            <span>💼 ${o.type}</span>
            <span>🕒 Posted ${o.posted}</span>
          </div>
        </div>
        <div class="opp-actions">
          <div class="opp-wage">${o.wage}</div>
          <button class="btn btn-primary" onclick="applyTo('${o.title.replace(/'/g, "")}')">Contact Karein →</button>
        </div>
      </div>
    `;
  }).join("");
}

function applyTo(title) {
  alert(`Demo: "${title}" ke liye contact request bheji gayi (prototype mein koi real backend nahi hai).`);
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderList();
});

// ---------- Init ----------
matchedPathwayIds = computeMatchedPathwayIds();
renderFilters();
renderList();
