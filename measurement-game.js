// ─── MEASUREMENT CHALLENGE GAME ──────────────────────────────────────────────
// Standalone JS module for the Measurement Challenge mini-game in MENDROBE
// Inject this via <script src="measurement-game.js"></script>

const MEASUREMENT_ROUNDS = [
  {
    id: 1,
    title: "Bust measurement",
    avatar: "👩🏾",
    client: "Mrs. Okonkwo",
    instruction: "Measure around the fullest part of the chest, keeping the tape parallel to the floor. The tape should be snug but not tight — you should be able to slip two fingers underneath.",
    trueValue: 92,
    unit: "cm",
    tolerance: 2,
    tips: ["Keep tape parallel to floor","Measure over the fullest part","Snug, not tight — two-finger rule"],
    difficulty: "easy",
    garment: "Evening gown",
    icon: "👗"
  },
  {
    id: 2,
    title: "Inseam length",
    avatar: "👨🏿",
    client: "Mr. Adeleke",
    instruction: "Measure from the crotch seam to the bottom of the leg. The client should stand with feet hip-width apart. Ensure the tape runs straight down the inner leg — not angled.",
    trueValue: 82,
    unit: "cm",
    tolerance: 1.5,
    tips: ["Stand with feet hip-width","Tape runs straight down inner leg","Measure to where hem will sit"],
    difficulty: "easy",
    garment: "Tailored trousers",
    icon: "👖"
  },
  {
    id: 3,
    title: "Shoulder width",
    avatar: "👨🏾",
    client: "Chief Bankole",
    instruction: "Measure from the edge of one shoulder to the other, across the back. The natural shoulder point is where the shoulder seam would typically sit — feel for the slight ridge where the arm begins.",
    trueValue: 46,
    unit: "cm",
    tolerance: 1,
    tips: ["Back shoulder to shoulder only","Feel for the natural shoulder point","Don't include the arm"],
    difficulty: "medium",
    garment: "Agbada",
    icon: "🥻"
  },
  {
    id: 4,
    title: "Waist measurement",
    avatar: "👩🏽",
    client: "Miss Adebayo",
    instruction: "Measure the natural waist — the narrowest part of the torso, typically 2–3 cm above the belly button. Have the client breathe normally; measure on the exhale. Do not pull the tape tight.",
    trueValue: 70,
    unit: "cm",
    tolerance: 1.5,
    tips: ["Find the natural narrowest point","Measure on the exhale","2–3cm above belly button"],
    difficulty: "easy",
    garment: "Ankara wrap skirt",
    icon: "👗"
  },
  {
    id: 5,
    title: "Back length (nape to waist)",
    avatar: "👩🏿",
    client: "Madam Chidinma",
    instruction: "Measure from the prominent bone at the base of the neck (7th cervical vertebra) straight down the spine to the natural waist. The client should stand upright, chin level, not tilting forward or back.",
    trueValue: 42,
    unit: "cm",
    tolerance: 1,
    tips: ["Start at 7th cervical vertebra","Down the spine, not curved","Client stands perfectly upright"],
    difficulty: "medium",
    garment: "Bespoke blouse",
    icon: "👚"
  },
  {
    id: 6,
    title: "Hip measurement",
    avatar: "👩🏾",
    client: "Barrister Ngozi",
    instruction: "Measure around the fullest part of the hips and seat — typically 18–23 cm below the natural waist. The tape should be parallel to the floor and should not dip at the back.",
    trueValue: 98,
    unit: "cm",
    tolerance: 2,
    tips: ["Fullest part of hip and seat","18–23cm below natural waist","Tape stays parallel — don't let it dip at the back"],
    difficulty: "medium",
    garment: "Fitted senator skirt",
    icon: "🩱"
  },
  {
    id: 7,
    title: "Sleeve length",
    avatar: "👨🏽",
    client: "Emeka Obi",
    instruction: "With the arm slightly bent, measure from the shoulder point over the elbow to the wrist bone. A slightly bent arm gives the correct ease for movement — a straight arm will produce a sleeve that's too short when the client moves.",
    trueValue: 64,
    unit: "cm",
    tolerance: 1.5,
    tips: ["Arm slightly bent at elbow","Shoulder point to wrist bone","Over the elbow, not under"],
    difficulty: "hard",
    garment: "Formal suit jacket",
    icon: "🧥"
  },
  {
    id: 8,
    title: "Neck circumference",
    avatar: "👨🏾",
    client: "Senator Fashola",
    instruction: "Measure around the base of the neck where a collar sits. Place one finger between the tape and the neck to ensure ease — a collar that's too tight is uncomfortable and restricts movement all day.",
    trueValue: 40,
    unit: "cm",
    tolerance: 0.5,
    tips: ["Base of neck, where collar sits","One finger of ease","Measure while client stands upright"],
    difficulty: "hard",
    garment: "Bespoke dress shirt",
    icon: "👔"
  }
];

// State
let MG = {
  roundIdx: 0,
  score: 0,
  attempts: {},
  results: [],
  phase: "play", // play | result
  currentGuess: null,
  submitted: false
};

function renderMeasurement() {
  const el = document.getElementById("measure-main");
  if (!el) return;
  if (MG.phase === "result") { renderMeasurementResult(el); return; }
  renderMeasurementPlay(el);
}

function renderMeasurementPlay(el) {
  const r = MEASUREMENT_ROUNDS[MG.roundIdx];
  const diffColor = { easy: "var(--green)", medium: "var(--amber)", hard: "var(--red)" }[r.difficulty];
  const sliderVal = MG.currentGuess !== null ? MG.currentGuess : Math.round(r.trueValue * 0.85);
  const isSubmitted = MG.submitted;

  let feedbackHtml = "";
  if (isSubmitted) {
    const diff = Math.abs(sliderVal - r.trueValue);
    const isCorrect = diff <= r.tolerance;
    const pts = isCorrect ? (r.difficulty === "hard" ? 150 : r.difficulty === "medium" ? 120 : 100) : diff <= r.tolerance * 2 ? 40 : 0;
    feedbackHtml = `<div class="feedback-banner ${isCorrect ? "success" : "error"}">
      ${isCorrect
        ? `✓ Accurate! ${sliderVal}cm is within ${r.tolerance}cm of the correct ${r.trueValue}cm. +${pts} points.`
        : `✗ ${sliderVal}cm — correct answer is ${r.trueValue}cm. You were ${diff.toFixed(1)}cm off. ${pts > 0 ? `+${pts} partial points.` : "No points."}`}
    </div>`;
  }

  el.innerHTML = `
    <div class="stat-row">
      <div class="stat-card"><div class="stat-label">Score</div><div class="stat-value">${MG.score}</div></div>
      <div class="stat-card"><div class="stat-label">Round</div><div class="stat-value">${MG.roundIdx + 1} / ${MEASUREMENT_ROUNDS.length}</div></div>
      <div class="stat-card"><div class="stat-label">Difficulty</div><div class="stat-value" style="font-size:13px;color:${diffColor};">${r.difficulty}</div></div>
    </div>

    <div class="brief-card">
      <div class="client-avatar">${r.avatar}</div>
      <div style="flex:1;">
        <div class="brief-meta">${r.client} · <span style="color:${diffColor};font-weight:600;">${r.difficulty}</span></div>
        <div class="brief-title">${r.title} — ${r.icon} ${r.garment}</div>
        <div class="brief-desc">${r.instruction}</div>
        <div class="brief-tags">${r.tips.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      </div>
    </div>

    ${feedbackHtml}

    <div class="tailor-card" style="margin-bottom:1rem;">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:0.75rem;">Your measurement</div>
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.875rem;">
        <input type="range"
          min="${Math.round(r.trueValue * 0.6)}"
          max="${Math.round(r.trueValue * 1.4)}"
          value="${sliderVal}"
          step="0.5"
          style="flex:1;accent-color:var(--purple);"
          ${isSubmitted ? "disabled" : ""}
          oninput="updateMeasureGuess(this.value)"
          id="measure-slider">
        <div style="font-size:26px;font-weight:700;color:var(--purple);min-width:72px;text-align:right;letter-spacing:-0.02em;">${sliderVal}<span style="font-size:13px;font-weight:400;color:var(--text3);margin-left:2px;">${r.unit}</span></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);">
        <span>${Math.round(r.trueValue * 0.6)} ${r.unit}</span>
        <span>${Math.round(r.trueValue * 1.4)} ${r.unit}</span>
      </div>
    </div>

    <div class="btn-row">
      ${!isSubmitted
        ? `<button class="btn btn-primary" onclick="submitMeasurement()">Record measurement</button>`
        : MG.roundIdx + 1 < MEASUREMENT_ROUNDS.length
          ? `<button class="btn btn-primary" onclick="nextMeasurement()">Next client <i class="ti ti-arrow-right"></i></button>`
          : `<button class="btn btn-primary" onclick="finishMeasurement()">See results <i class="ti ti-trophy"></i></button>`
      }
      ${!isSubmitted ? `<button class="btn" onclick="resetMeasureGuess()">Reset</button>` : ""}
    </div>`;
}

function updateMeasureGuess(val) {
  MG.currentGuess = parseFloat(val);
  const slider = document.getElementById("measure-slider");
  if (slider) {
    const r = MEASUREMENT_ROUNDS[MG.roundIdx];
    const display = slider.parentElement.querySelector("div[style*='26px']");
    if (display) display.innerHTML = `${parseFloat(val)}<span style="font-size:13px;font-weight:400;color:var(--text3);margin-left:2px;">${r.unit}</span>`;
  }
}

function resetMeasureGuess() {
  const r = MEASUREMENT_ROUNDS[MG.roundIdx];
  MG.currentGuess = Math.round(r.trueValue * 0.85);
  renderMeasurement();
}

function submitMeasurement() {
  const r = MEASUREMENT_ROUNDS[MG.roundIdx];
  const val = MG.currentGuess !== null ? MG.currentGuess : Math.round(r.trueValue * 0.85);
  const diff = Math.abs(val - r.trueValue);
  const isCorrect = diff <= r.tolerance;
  const pts = isCorrect
    ? (r.difficulty === "hard" ? 150 : r.difficulty === "medium" ? 120 : 100)
    : diff <= r.tolerance * 2 ? 40 : 0;
  MG.score += pts;
  MG.submitted = true;
  MG.results.push({ round: r, guess: val, correct: isCorrect, pts });
  renderMeasurement();
}

function nextMeasurement() {
  MG.roundIdx++;
  MG.submitted = false;
  MG.currentGuess = null;
  renderMeasurement();
}

function finishMeasurement() {
  MG.phase = "result";
  renderMeasurement();
}

function renderMeasurementResult(el) {
  const total = MEASUREMENT_ROUNDS.length;
  const correct = MG.results.filter(r => r.correct).length;
  const maxScore = MEASUREMENT_ROUNDS.reduce((a, r) => a + (r.difficulty === "hard" ? 150 : r.difficulty === "medium" ? 120 : 100), 0);
  const pct = Math.round((MG.score / maxScore) * 100);
  const stars = pct >= 85 ? "⭐⭐⭐" : pct >= 55 ? "⭐⭐" : "⭐";
  const title = pct >= 85 ? "Precision Tailor!" : pct >= 55 ? "Steady Hands!" : "Keep Practising!";
  const sub = pct >= 85
    ? "Your measurements are accurate enough for any bespoke commission."
    : pct >= 55
    ? "Good instincts — a few measurements were out of range."
    : "Measurement accuracy is the foundation of good tailoring. Keep training.";

  const breakdown = MG.results.map((r, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">
      <span style="color:var(--text2);">${r.round.title}</span>
      <span style="color:${r.correct ? "var(--green)" : "var(--red)"};font-weight:600;">
        ${r.guess}${r.round.unit} ${r.correct ? "✓" : `✗ (${r.round.trueValue}${r.round.unit})`}
      </span>
      <span style="color:var(--purple);font-weight:600;">+${r.pts}pt</span>
    </div>`).join("");

  el.innerHTML = `<div class="result-screen pop">
    <div class="result-icon">📏</div>
    <div class="result-title">${title}</div>
    <div class="result-stars">${stars}</div>
    <div class="result-grid">
      <div class="result-stat"><div class="result-stat-val">${correct}/${total}</div><div class="result-stat-lbl">Accurate</div></div>
      <div class="result-stat"><div class="result-stat-val">${MG.score}</div><div class="result-stat-lbl">Score</div></div>
      <div class="result-stat"><div class="result-stat-val">${pct}%</div><div class="result-stat-lbl">Rating</div></div>
    </div>
    <div class="result-sub" style="margin-top:0.75rem;">${sub}</div>
    <div class="tailor-card" style="margin:1.25rem 0;text-align:left;">${breakdown}</div>
    <button class="btn btn-primary" onclick="resetMeasurement()">Play again</button>
  </div>`;
}

function resetMeasurement() {
  MG = { roundIdx: 0, score: 0, attempts: {}, results: [], phase: "play", currentGuess: null, submitted: false };
  renderMeasurement();
}
