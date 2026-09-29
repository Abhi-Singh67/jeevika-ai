// =========================================================
// onboarding.js — Voice/Text input + LOCAL rule-based extraction
// (skillEngine.js mein extractProfileFromText() define hai)
// Koi server/API call nahi — sab kuch browser mein turant chalta hai.
// =========================================================

let currentMode = "voice";
let capturedText = "";
let recognition = null;
let isListening = false;

function switchMode(mode) {
  currentMode = mode;
  document.getElementById("tab-voice").classList.toggle("active", mode === "voice");
  document.getElementById("tab-text").classList.toggle("active", mode === "text");
  document.getElementById("panel-voice").style.display = mode === "voice" ? "block" : "none";
  document.getElementById("panel-text").style.display = mode === "text" ? "block" : "none";
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById("micStatus").textContent = "Ye browser voice input support nahi karta — kripya ⌨️ Text tab use karein.";
    document.getElementById("micBtn").disabled = true;
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "hi-IN";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = function (event) {
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript + " ";
    capturedText = transcript.trim();
    document.getElementById("transcriptBox").textContent = capturedText;
  };
  recognition.onerror = function (event) {
    document.getElementById("micStatus").textContent = "Kuch galat hua: " + event.error;
    isListening = false;
    document.getElementById("micBtn").classList.remove("listening");
  };
  recognition.onend = function () { if (isListening) recognition.start(); };
}

function toggleListening() {
  if (!recognition) return;
  if (!isListening) {
    isListening = true;
    recognition.start();
    document.getElementById("micBtn").classList.add("listening");
    document.getElementById("micStatus").textContent = "Sun rha hoon... bolte rahiye";
  } else {
    isListening = false;
    recognition.stop();
    document.getElementById("micBtn").classList.remove("listening");
    document.getElementById("micStatus").textContent = "Rukaya gaya. Dubara bolne ke liye mic dabayein.";
  }
}

function constraintTags(constraints) {
  const tags = [];
  if (constraints?.mobility && constraints.mobility !== "Not specified") tags.push(constraints.mobility);
  if (constraints?.hours_per_day != null) tags.push(constraints.hours_per_day + " hours/day available");
  if (constraints?.budget_inr != null) tags.push("Budget: ₹" + constraints.budget_inr);
  return tags.length ? tags : ["None mentioned"];
}

function runExtraction() {
  const text = currentMode === "voice" ? capturedText : document.getElementById("textInput").value.trim();
  if (!text) { alert("Kripya pehle kuch boliye ya likhiye."); return; }

  // Yahi hamara "AI extraction" hai — skillEngine.js mein defined, turant chalta hai
  const profile = extractProfileFromText(text);

  document.getElementById("out-education").textContent = profile.education;
  document.getElementById("out-occupation").textContent = profile.occupation;
  document.getElementById("out-skills").innerHTML =
    profile.self_reported_skills.map(s => `<span class="tag">${s}</span>`).join("") +
    profile.ai_inferred_skills.map(s => `<span class="tag inferred">${s} (AI-inferred)</span>`).join("");
  document.getElementById("out-interests").innerHTML =
    profile.interests.map(s => `<span class="tag">${s}</span>`).join("");
  document.getElementById("out-constraints").innerHTML =
    constraintTags(profile.constraints).map(s => `<span class="tag">${s}</span>`).join("");

  document.getElementById("profile-preview").style.display = "block";
  document.getElementById("profile-preview").scrollIntoView({ behavior: "smooth" });

  localStorage.setItem("jeevikaProfile", JSON.stringify(profile));
}

setupSpeechRecognition();
