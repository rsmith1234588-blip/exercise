import { MUSCLES } from "./exercises.js";
import { TOTAL_POINTS, clampPoints, generatePlan } from "./planner.js";

const STORAGE_KEY = "exercise-planner:points";

const dialsEl = document.getElementById("dials");
const remainingEl = document.getElementById("remaining");
const barEl = document.getElementById("points-bar");
const planEl = document.getElementById("plan");
const sizeEl = document.getElementById("size");

const points = loadPoints();
const nameOf = Object.fromEntries(MUSCLES.map((m) => [m.id, m.name]));

function loadPoints() {
  const empty = Object.fromEntries(MUSCLES.map((m) => [m.id, 0]));
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    for (const id of Object.keys(empty)) empty[id] = Number(saved[id]) || 0;
  } catch {
    /* storage unavailable: start empty */
  }
  return empty;
}

function savePoints() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch {
    /* ignore */
  }
}

function used() {
  return Object.values(points).reduce((a, b) => a + b, 0);
}

function renderDials() {
  dialsEl.innerHTML = "";
  for (const m of MUSCLES) {
    const row = document.createElement("label");
    row.className = "dial";
    row.innerHTML = `
      <span class="dial-name">${m.name}</span>
      <input type="range" min="0" max="${TOTAL_POINTS}" step="10" value="${points[m.id]}" aria-label="${m.name} points">
      <input type="number" min="0" max="${TOTAL_POINTS}" step="10" value="${points[m.id]}" aria-label="${m.name} points value">
    `;
    const [range, number] = row.querySelectorAll("input");
    const onInput = (e) => {
      const value = clampPoints(points, m.id, Number(e.target.value) || 0);
      points[m.id] = value;
      range.value = value;
      number.value = value;
      updateSummary();
      savePoints();
    };
    range.addEventListener("input", onInput);
    number.addEventListener("change", onInput);
    dialsEl.appendChild(row);
  }
  updateSummary();
}

function updateSummary() {
  const left = TOTAL_POINTS - used();
  remainingEl.textContent = left;
  barEl.style.width = `${(used() / TOTAL_POINTS) * 100}%`;
}

function renderPlan() {
  const plan = generatePlan(points, { totalSets: Number(sizeEl.value) });
  if (plan.length === 0) {
    planEl.innerHTML = `<p class="empty">Put some points on a muscle, then generate a plan.</p>`;
    return;
  }
  planEl.innerHTML = `
    <table>
      <thead><tr><th>Exercise</th><th>Muscle</th><th>Sets</th><th>Reps</th></tr></thead>
      <tbody>
        ${plan
          .map(
            (e) => `<tr><td>${e.name}</td><td>${nameOf[e.muscle]}</td><td>${e.sets}</td><td>${e.reps}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

document.getElementById("generate").addEventListener("click", renderPlan);
document.getElementById("reset").addEventListener("click", () => {
  for (const id of Object.keys(points)) points[id] = 0;
  savePoints();
  renderDials();
});
document.getElementById("even").addEventListener("click", () => {
  const each = Math.floor(TOTAL_POINTS / MUSCLES.length / 10) * 10;
  for (const id of Object.keys(points)) points[id] = each;
  savePoints();
  renderDials();
});

renderDials();
