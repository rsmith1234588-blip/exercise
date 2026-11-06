import { MUSCLES } from "./muscles.js";
import { EXERCISES } from "./exercise-data.js";
import { renderFigure } from "./figure.js";
import { TOTAL_POINTS, clampPoints, generatePlan } from "./planner.js";

const STORAGE_KEY = "exercise-planner:points";

const dialsEl = document.getElementById("dials");
const remainingEl = document.getElementById("remaining");
const barEl = document.getElementById("points-bar");
const planEl = document.getElementById("plan");
const sizeEl = document.getElementById("size");
const levelEl = document.getElementById("level");

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

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// "8-12" -> "8-12 reps", "8-10 / leg" -> "8-10 reps / leg", "30-60 s" stays.
function formatReps(reps) {
  if (/\ss$/.test(reps)) return reps;
  const m = reps.match(/^(\S+)(.*)$/);
  return `${m[1]} reps${m[2]}`;
}

function exerciseCard({ exercise: e, sets, reps, muscle }) {
  const frames = e.hold
    ? [["Hold", e.start]]
    : [["Start", e.start], ["End", e.end]];
  const diagrams = frames
    .map(([label, pose]) => `<figure>${renderFigure(pose, `${e.name}: ${label.toLowerCase()} position`)}<figcaption>${label}</figcaption></figure>`)
    .join("");
  const also = e.secondary.filter((m) => m !== muscle).map((m) => nameOf[m]);
  return `
    <article class="exercise">
      <div class="diagrams">${diagrams}</div>
      <div class="info">
        <h3>${escapeHtml(e.name)}</h3>
        <p class="prescription"><strong>${sets} sets</strong> × ${escapeHtml(formatReps(reps))}</p>
        <p class="tags">
          <span class="tag">${nameOf[muscle]}</span>
          <span class="tag">${escapeHtml(e.needs ?? "No equipment")}</span>
          <span class="tag level">${escapeHtml(e.level)}</span>
        </p>
        ${also.length ? `<p class="also">Also works: ${also.join(", ")}</p>` : ""}
        <details>
          <summary>How to do it</summary>
          <ol>${e.instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </details>
      </div>
    </article>`;
}

function renderPlan() {
  const plan = generatePlan(points, { totalSets: Number(sizeEl.value), level: levelEl.value });
  if (plan.length === 0) {
    planEl.innerHTML = `<p class="empty">Put some points on a muscle, then generate a plan.</p>`;
    return;
  }
  planEl.innerHTML = plan.map(exerciseCard).join("");
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

document.getElementById("library-count").textContent = EXERCISES.length;
renderDials();
