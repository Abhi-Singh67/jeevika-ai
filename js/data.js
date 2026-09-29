// =========================================================
// data.js — Curated demo pathway dataset
// NOTE: Ye dataset DEMO/CURATED hai, official NSQF/government
// data nahi hai. Real project mein isse verified data se replace
// karna hoga.
// =========================================================

const PATHWAYS = [
  {
    pathway_id: "solar-pv-technician",
    occupation: "Solar PV Technician",
    category: "Electrical & Renewable Energy",
    description: "Install and maintain rooftop solar panels for homes and small businesses.",
    required_skills: ["Basic Electrical Knowledge", "Tool Handling", "Solar Fundamentals", "PV Installation", "Electrical Safety"],
    interest_tags: ["Electrical Work", "Solar / Renewable Energy"],
    education_requirement: "10th Pass",
    training_duration_weeks: 8,
    investment_amount_inr: 15000,
    employment_type: ["wage", "self-employment"],
    mobility_requirement: "low",
    local_opportunity: "high",
  },
  {
    pathway_id: "domestic-electrician",
    occupation: "Electrician (Domestic Wiring)",
    category: "Electrical",
    description: "House wiring, appliance repair, and small electrical installation work.",
    required_skills: ["Basic Electrical Knowledge", "Tool Handling", "Wiring", "Electrical Safety", "Circuit Testing"],
    interest_tags: ["Electrical Work"],
    education_requirement: "8th Pass",
    training_duration_weeks: 6,
    investment_amount_inr: 8000,
    employment_type: ["wage", "self-employment"],
    mobility_requirement: "low",
    local_opportunity: "high",
  },
  {
    pathway_id: "agri-machinery-technician",
    occupation: "Agricultural Machinery Technician",
    category: "Agriculture & Machinery",
    description: "Repair and maintain tractors and farm equipment for local farmers.",
    required_skills: ["Tractor Operation", "Basic Mechanical Maintenance", "Equipment Handling", "Engine Repair", "Tool Handling"],
    interest_tags: ["Agricultural Machinery", "Mechanical Work"],
    education_requirement: "8th Pass",
    training_duration_weeks: 6,
    investment_amount_inr: 10000,
    employment_type: ["wage", "self-employment"],
    mobility_requirement: "low",
    local_opportunity: "medium",
  },
  {
    pathway_id: "mobile-repair-technician",
    occupation: "Mobile Phone Repair Technician",
    category: "Electronics",
    description: "Diagnose and repair smartphones — screens, batteries, and common faults.",
    required_skills: ["Basic Electrical Knowledge", "Soldering", "Tool Handling", "Circuit Testing", "Component Handling"],
    interest_tags: ["Mobile Repair", "Electronics"],
    education_requirement: "10th Pass",
    training_duration_weeks: 10,
    investment_amount_inr: 12000,
    employment_type: ["wage", "self-employment"],
    mobility_requirement: "medium",
    local_opportunity: "medium",
  },
  {
    pathway_id: "tailoring-fashion",
    occupation: "Tailoring & Fashion Design",
    category: "Textile & Apparel",
    description: "Stitching, alterations, and small-scale garment making, often home-based.",
    required_skills: ["Hand Stitching", "Machine Operation", "Pattern Cutting", "Measurement Reading"],
    interest_tags: ["Tailoring"],
    education_requirement: "8th Pass",
    training_duration_weeks: 8,
    investment_amount_inr: 6000,
    employment_type: ["self-employment", "wage"],
    mobility_requirement: "low",
    local_opportunity: "medium",
  },
  {
    pathway_id: "two-wheeler-mechanic",
    occupation: "Two-Wheeler Mechanic",
    category: "Automotive",
    description: "Servicing and repairing motorcycles and scooters at a local garage.",
    required_skills: ["Basic Mechanical Maintenance", "Tool Handling", "Engine Repair", "Equipment Handling"],
    interest_tags: ["Mechanical Work", "Automotive"],
    education_requirement: "8th Pass",
    training_duration_weeks: 6,
    investment_amount_inr: 9000,
    employment_type: ["wage", "self-employment"],
    mobility_requirement: "low",
    local_opportunity: "high",
  },
];

// ---------- Demo data for Admin Dashboard (Day 4) ----------
// Ye sab HARDCODED demo numbers hain, kisi real database se nahi aaye.
const ADMIN_DEMO = {
  totalAssessed: 1284,
  trainingEnrolled: 742,
  selfEmployedOutcomes: 216,
  wageEmployedOutcomes: 301,
  districtDemand: [
    { district: "Kanpur Dehat", skill: "Solar PV Technician", supply: 3, demand: 9 },
    { district: "Kanpur Dehat", skill: "Electrician", supply: 5, demand: 7 },
    { district: "Kanpur Dehat", skill: "Tailoring", supply: 8, demand: 5 },
    { district: "Hamirpur", skill: "Agri Machinery Technician", supply: 2, demand: 8 },
    { district: "Hamirpur", skill: "Two-Wheeler Mechanic", supply: 4, demand: 6 },
    { district: "Jalaun", skill: "Mobile Repair Technician", supply: 1, demand: 6 },
  ],
  topInterestSectors: [
    { sector: "Electrical & Renewable Energy", count: 412 },
    { sector: "Agriculture & Machinery", count: 298 },
    { sector: "Automotive", count: 201 },
    { sector: "Electronics", count: 187 },
    { sector: "Textile & Apparel", count: 156 },
  ],
};

// Approx coordinates for the demo districts (used by the real Leaflet map on admin.html)
const DISTRICT_COORDS = {
  "Kanpur Dehat": [26.4499, 79.9750],
  "Hamirpur": [25.9556, 80.1500],
  "Jalaun": [26.1450, 79.3350],
};

// ---------- Post-Training "Connect" layer demo data ----------
// Ye mock local opportunities hain — real project mein employer/govt
// portal se aayenge. Har entry pathway_id se link hoti hai taaki
// beneficiary ki recommendation se match dikhaya ja sake.
const CONNECT_OPPORTUNITIES = [
  { id: 1, title: "Rooftop Solar Installation Helper", employer: "SunRise Energy Pvt Ltd", location: "Kanpur Dehat", pathway_id: "solar-pv-technician", wage: "₹450/day", type: "Wage Employment", posted: "2 days ago" },
  { id: 2, title: "Domestic Wiring Electrician Needed", employer: "Local Housing Society", location: "Kanpur Dehat", pathway_id: "domestic-electrician", wage: "₹400/day", type: "Wage Employment", posted: "5 days ago" },
  { id: 3, title: "Tractor & Farm Equipment Mechanic", employer: "Hamirpur Krishi Seva Kendra", location: "Hamirpur", pathway_id: "agri-machinery-technician", wage: "₹380/day", type: "Wage Employment", posted: "1 day ago" },
  { id: 4, title: "Mobile Repair Shop Assistant", employer: "Jalaun Mobile Hub", location: "Jalaun", pathway_id: "mobile-repair-technician", wage: "₹9,000/month", type: "Wage Employment", posted: "3 days ago" },
  { id: 5, title: "Tailoring Orders — Home Based", employer: "Self-Employment Opportunity", location: "Kanpur Dehat", pathway_id: "tailoring-fashion", wage: "Per order", type: "Self-Employment", posted: "1 week ago" },
  { id: 6, title: "Two-Wheeler Service Center Helper", employer: "Speed Motors Garage", location: "Hamirpur", pathway_id: "two-wheeler-mechanic", wage: "₹350/day", type: "Wage Employment", posted: "4 days ago" },
];

// ---------- Portfolio + Reputation demo data (post-employment) ----------
const PORTFOLIO_DEMO = {
  name: "Suresh Yadav",
  role: "Solar PV Technician",
  location: "Kanpur Dehat, UP",
  memberSince: "2025",
  reputation: { score: 88, jobsCompleted: 14, avgRating: 4.7, repeatClients: 42 },
  jobs: [
    { tag: "Solar", gradient: "linear-gradient(135deg,#E7A33D,#1F4B43)", title: "5kW Rooftop Solar Setup", desc: "Residential solar installation with inverter integration, completed in 2 days." },
    { tag: "Solar", gradient: "linear-gradient(135deg,#1F4B43,#38BDF8)", title: "Panel Cleaning & Fault Check", desc: "Maintenance visit — diagnosed and fixed a loose wiring fault." },
    { tag: "Electrical", gradient: "linear-gradient(135deg,#B5583A,#E7A33D)", title: "Society DB Upgrade", desc: "Distribution board upgrade for a 12-flat housing society." },
    { tag: "Solar", gradient: "linear-gradient(135deg,#22C55E,#1F4B43)", title: "Off-Grid Farmhouse Setup", desc: "Solar setup for an irrigation pump, no grid connection needed." },
  ],
  reviews: [
    { name: "Ramesh Housing Society", job: "Society DB Upgrade", text: "Suresh ne time pe kaam kiya aur sab clean tha. Bahut professional." },
    { name: "Anita Sharma", job: "Rooftop Solar Setup", text: "Solar panel lagane ke baad bhi follow-up ke liye khud aaye — trust ban gaya." },
  ],
};
