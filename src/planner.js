import { EXERCISES } from "./exercises.js";

export const TOTAL_POINTS = 1000;
export const SETS_PER_EXERCISE = 4;

/**
 * Split `slots` whole units between muscles in proportion to their points
 * (largest-remainder method, so the counts always add up to `slots`).
 * @param {Record<string, number>} points muscle id -> points
 * @param {number} slots e.g. total sets in the workout
 * @returns {Record<string, number>} muscle id -> slots (only muscles with > 0)
 */
export function allocate(points, slots) {
  const entries = Object.entries(points).filter(([, p]) => p > 0);
  const total = entries.reduce((sum, [, p]) => sum + p, 0);
  if (total === 0 || slots <= 0) return {};

  const shares = entries.map(([id, p]) => {
    const exact = (p / total) * slots;
    return { id, whole: Math.floor(exact), rest: exact - Math.floor(exact), p };
  });

  let left = slots - shares.reduce((sum, s) => sum + s.whole, 0);
  // Biggest remainders get the leftover slots; ties go to more points.
  [...shares]
    .sort((a, b) => b.rest - a.rest || b.p - a.p)
    .slice(0, left)
    .forEach((s) => s.whole++);

  const result = {};
  for (const s of shares) if (s.whole > 0) result[s.id] = s.whole;
  return result;
}

/** Small seeded RNG (mulberry32) so a plan can be reproduced. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a workout from the user's point dials.
 * @param {Record<string, number>} points muscle id -> points (sum <= 1000)
 * @param {{ totalSets?: number, seed?: number, library?: typeof EXERCISES }} [options]
 * @returns {{ muscle: string, name: string, sets: number, reps: string }[]}
 */
export function generatePlan(points, options = {}) {
  const { totalSets = 20, seed = Date.now(), library = EXERCISES } = options;
  const rng = makeRng(seed);
  const setsByMuscle = allocate(points, totalSets);
  const plan = [];

  for (const [muscle, sets] of Object.entries(setsByMuscle)) {
    const pool = shuffle(library.filter((e) => e.primary === muscle), rng);
    if (pool.length === 0) continue;

    // About SETS_PER_EXERCISE sets per exercise, limited by how many exist.
    const count = Math.min(pool.length, Math.max(1, Math.round(sets / SETS_PER_EXERCISE)));
    const base = Math.floor(sets / count);
    let extra = sets - base * count;

    for (let i = 0; i < count; i++) {
      const ex = pool[i];
      plan.push({
        muscle,
        name: ex.name,
        sets: base + (extra-- > 0 ? 1 : 0),
        reps: ex.reps,
      });
    }
  }

  // Biggest muscle blocks first, the usual order for a session.
  const order = Object.entries(setsByMuscle).sort((a, b) => b[1] - a[1]).map(([m]) => m);
  return plan.sort((a, b) => order.indexOf(a.muscle) - order.indexOf(b.muscle));
}

/**
 * Clamp a dial so the total never exceeds TOTAL_POINTS.
 * @returns {number} the value the dial is allowed to take
 */
export function clampPoints(points, muscle, requested) {
  const others = Object.entries(points)
    .filter(([id]) => id !== muscle)
    .reduce((sum, [, p]) => sum + p, 0);
  return Math.max(0, Math.min(Math.round(requested), TOTAL_POINTS - others));
}
