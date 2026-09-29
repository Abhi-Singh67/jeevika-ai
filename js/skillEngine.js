// =========================================================
// skillEngine.js — JEEVIKA AI ka "brain", pure client-side
//
// Isme 3 cheezein hain:
// 1. extractProfileFromText() — text se structured profile banata hai
//    (Day 1/2 ka rule-based mock — real project mein LLM API se
//    replace hoga, but prototype ke liye ye kaafi hai)
// 2. getRecommendations() — pathways.json (data.js) se match karke
//    ranked list deta hai + skill gap
// 3. explainPathway() / generateRoadmap() — explainability + roadmap
// =========================================================

// ---------- 1. TEXT -> STRUCTURED PROFILE (mock extraction) ----------
function extractProfileFromText(rawText) {
  const text = rawText.toLowerCase();

  let education = "Not specified";
  if (/12\s*th|barahvi|barvi/.test(text)) education = "12th Pass";
  else if (/10\s*th|dasvi/.test(text)) education = "10th Pass";
  else if (/graduate|degree|snatak/.test(text)) education = "Graduate";
  else if (/8\s*th|athvi/.test(text)) education = "8th Pass";

  let occupation = "Not specified";
  if (/kheti|farming|agriculture|khet/.test(text)) occupation = "Agriculture (Family Occupation)";

  const self_reported_skills = [];
  const ai_inferred_skills = [];

  if (/tractor/.test(text)) self_reported_skills.push("Tractor Operation");
  if (/machine|मशीन/.test(text)) self_reported_skills.push("Agricultural Machinery Handling");
  if (/silai|tailoring|stitch/.test(text)) self_reported_skills.push("Hand Stitching");
  if (/repair/.test(text)) ai_inferred_skills.push("Basic Mechanical Maintenance");
  if (/tractor|machine/.test(text)) ai_inferred_skills.push("Equipment Handling");
  if (/mobile.*repair|phone.*repair/.test(text)) ai_inferred_skills.push("Component Handling");

  const interests = [];
  if (/electrical|bijli/.test(text)) interests.push("Electrical Work");
  if (/tailoring|silai/.test(text)) interests.push("Tailoring");
  if (/mobile.*repair/.test(text)) interests.push("Mobile Repair");
  if (/solar/.test(text)) interests.push("Solar / Renewable Energy");
  if (/gaadi|vehicle|mechanic|automotive/.test(text)) interests.push("Automotive");

  let mobility = "Not specified";
  if (/bahar nahi|relocate nahi|district se bahar/.test(text)) mobility = "Cannot relocate outside district";
  else if (/kahin bhi|relocate.*theek|bahar jaa sakta/.test(text)) mobility = "Can relocate";

  let hours_per_day = null;
  const hourMatch = text.match(/(\d+)\s*(ghante|hour)/);
  if (hourMatch) hours_per_day = parseInt(hourMatch[1], 10);

  let budget_inr = null;
  const budgetMatch = text.match(/(₹|rs\.?|rupaye)\s?(\d+[,\d]*)/);
  if (budgetMatch) budget_inr = parseInt(budgetMatch[2].replace(/,/g, ""), 10);

  let employment_preference = "Not specified";
  if (/khud ka|apna kaam|self.?employ|business/.test(text)) employment_preference = "Self-Employment";
  else if (/naukri|job|wage/.test(text)) employment_preference = "Wage Employment";

  return {
    education,
    occupation,
    self_reported_skills: self_reported_skills.length ? self_reported_skills : ["Not detected"],
    ai_inferred_skills: ai_inferred_skills.length ? ai_inferred_skills : ["Not detected"],
    interests: interests.length ? interests : ["Not specified"],
    constraints: { mobility, hours_per_day, budget_inr },
    employment_preference,
  };
}

// ---------- 2. SCORING / RECOMMENDATION ENGINE ----------
const WEIGHTS = { interest: 30, skill: 25, education: 15, localOpportunity: 15, constraint: 10, employmentPreference: 5 };
const EDUCATION_RANK = { "Not specified": 0, "8th Pass": 1, "10th Pass": 2, "12th Pass": 3, Graduate: 4 };

function norm(s) { return (s || "").toString().toLowerCase().trim(); }
function normNoSpace(s) { return norm(s).replace(/[\s-]/g, ""); }

function matchSkills(userSkills, requiredSkills) {
  const userWords = userSkills.flatMap((s) => norm(s).split(/\s+/));
  const matched = [], missing = [];
  requiredSkills.forEach((req) => {
    const reqWords = norm(req).split(/\s+/);
    const overlaps = reqWords.some((w) => w.length > 3 && userWords.includes(w));
    if (overlaps) matched.push(req); else missing.push(req);
  });
  return { matched, missing };
}

function scorePathway(profile, pathway) {
  const userSkills = [...(profile.self_reported_skills || []), ...(profile.ai_inferred_skills || [])];
  const { matched, missing } = matchSkills(userSkills, pathway.required_skills);

  const interestScore = (profile.interests || []).some((i) => pathway.interest_tags.some((t) => norm(t) === norm(i))) ? 1 : 0;
  const skillScore = pathway.required_skills.length ? matched.length / pathway.required_skills.length : 0;

  const userEdu = EDUCATION_RANK[profile.education] ?? 0;
  const reqEdu = EDUCATION_RANK[pathway.education_requirement] ?? 0;
  const educationScore = userEdu >= reqEdu ? 1 : 0.4;

  const localMap = { high: 1, medium: 0.6, low: 0.3 };
  const localScore = localMap[pathway.local_opportunity] ?? 0.5;

  let constraintScore = 1;
  const mobility = norm(profile.constraints?.mobility);
  const relocateBlocked = mobility.includes("cannot relocate") && pathway.mobility_requirement !== "low";
  if (relocateBlocked) constraintScore -= 0.6;
  const budget = profile.constraints?.budget_inr;
  const overBudget = budget && pathway.investment_amount_inr > budget;
  if (overBudget) constraintScore -= 0.4;
  constraintScore = Math.max(constraintScore, 0);

  const prefNorm = normNoSpace(profile.employment_preference);
  const empMatch = pathway.employment_type.some((t) => normNoSpace(t) === prefNorm);
  const empScore = empMatch ? 1 : prefNorm === "notspecified" ? 0.6 : 0.3;

  const totalScore = Math.round(
    interestScore * WEIGHTS.interest + skillScore * WEIGHTS.skill + educationScore * WEIGHTS.education +
    localScore * WEIGHTS.localOpportunity + constraintScore * WEIGHTS.constraint + empScore * WEIGHTS.employmentPreference
  );

  return {
    ...pathway, score: totalScore, matched_skills: matched, missing_skills: missing,
    _flags: { interestScore, skillScore, educationScore, localScore, constraintScore, empScore, relocateBlocked, overBudget },
  };
}

function getRecommendations(profile) {
  const ranked = PATHWAYS.map((p) => scorePathway(profile, p)).sort((a, b) => b.score - a.score);
  return ranked.slice(0, 4);
}

// ---------- 3. EXPLAINABILITY ----------
function getWhyReasons(p) {
  const f = p._flags;
  const why = [];
  if (f.interestScore === 1) why.push("Aapki batayi hui ruchi se match karta hai");
  if (f.skillScore > 0.3) why.push(`Aapke paas ${p.matched_skills.length}/${p.required_skills.length} zaroori skills pehle se hain`);
  if (f.educationScore === 1) why.push("Aapki padhai is trade ke liye kaafi hai");
  if (f.localScore >= 0.6) why.push("Is trade mein local opportunity achhi hai");
  if (!f.relocateBlocked) why.push("Aapke district mein hi kaam mil sakta hai");
  if (f.empScore === 1) why.push("Aapki employment preference se match karta hai");
  if (!why.length) why.push("Ye ek uplabdh vikalp hai, lekin match zyada strong nahi hai");
  return why;
}

function getWhyNotReasons(other, base) {
  const reasons = [];
  if (other._flags.localScore < base._flags.localScore) reasons.push("Local opportunity kam hai");
  if (other.missing_skills.length > base.missing_skills.length) reasons.push("Zyada skill gap hai — training zyada lambi lagegi");
  if (other._flags.relocateBlocked && !base._flags.relocateBlocked) reasons.push("Relocation ki zaroorat aapke constraint se takra rahi hai");
  if (other.investment_amount_inr > base.investment_amount_inr) reasons.push("Investment zyada hai");
  if (other.score < base.score && !reasons.length) reasons.push("Overall score selected pathway se kam hai");
  return reasons.length ? reasons : ["Selected pathway jitna strong match nahi hai"];
}

// ---------- 4. 90-DAY ROADMAP ----------
function generateRoadmap(pathway) {
  const weeks = pathway.training_duration_weeks;
  return [
    { period: "Week 1", title: "Profile Assessment", detail: "Baseline skills confirm karna aur training center/mentor se judna." },
    { period: `Week 2–${Math.min(weeks, 4)}`, title: "Foundation Training", detail: `${pathway.occupation} ke basics — ${pathway.required_skills.slice(0, 2).join(", ")}.` },
    { period: "Month 2", title: "Skill Development", detail: `Baaki skills seekhna: ${pathway.missing_skills.slice(0, 3).join(", ") || "practice & speed-building"}.` },
    { period: "Month 3", title: "Certification / Practical Assessment", detail: "Hands-on assessment aur certification (ya practical test)." },
    { period: "After Training", title: pathway.employment_type.includes("self-employment") ? "Self-Employment Setup" : "Employment Placement", detail: `Approx investment: ₹${pathway.investment_amount_inr.toLocaleString("en-IN")}. Local opportunity: ${pathway.local_opportunity}.` },
  ];
}
