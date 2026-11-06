import { test } from "node:test";
import assert from "node:assert/strict";
import { allocate, clampPoints, generatePlan } from "../src/planner.js";
import { EXERCISES } from "../src/exercise-data.js";
import { MUSCLES, LEVELS } from "../src/muscles.js";

const totalSets = (plan) => plan.reduce((sum, e) => sum + e.sets, 0);

test("1000 points on biceps gives an all-biceps workout", () => {
  const plan = generatePlan({ biceps: 1000 }, { totalSets: 20, seed: 1 });
  assert.ok(plan.length > 1);
  assert.ok(plan.every((e) => e.muscle === "biceps"));
  assert.equal(totalSets(plan), 20);
});

test("sets follow the points split", () => {
  assert.deepEqual(allocate({ chest: 750, back: 250 }, 20), { chest: 15, back: 5 });
});

test("allocation always uses every set", () => {
  const sets = allocate({ chest: 333, back: 333, quads: 334 }, 20);
  assert.equal(Object.values(sets).reduce((a, b) => a + b, 0), 20);
});

test("muscles with no points are left out", () => {
  const plan = generatePlan({ chest: 1000, back: 0 }, { seed: 2 });
  assert.ok(plan.every((e) => e.muscle === "chest"));
});

test("no points means an empty plan", () => {
  assert.deepEqual(generatePlan({}, { seed: 3 }), []);
});

test("same seed gives the same plan", () => {
  const pts = { chest: 400, back: 300, abs: 300 };
  assert.deepEqual(generatePlan(pts, { seed: 42 }), generatePlan(pts, { seed: 42 }));
});

test("a dial cannot push the total over 1000", () => {
  assert.equal(clampPoints({ chest: 800, back: 0 }, "back", 500), 200);
  assert.equal(clampPoints({ chest: 800, back: 100 }, "chest", 900), 900);
  assert.equal(clampPoints({ chest: 0 }, "chest", -50), 0);
});

test("library is big and every exercise has photos and instructions", () => {
  assert.ok(EXERCISES.length >= 500, `only ${EXERCISES.length} exercises`);
  for (const e of EXERCISES) {
    assert.ok(e.images.length > 0, `${e.name} has no image`);
    assert.ok(e.instructions.length > 0, `${e.name} has no instructions`);
    assert.ok(LEVELS.includes(e.level), `${e.name} has level ${e.level}`);
  }
});

test("every muscle dial has beginner exercises", () => {
  for (const m of MUSCLES) {
    assert.ok(
      EXERCISES.some((e) => e.primary === m.id && e.level === "beginner"),
      `no beginner exercises for ${m.id}`
    );
  }
});

test("beginner plans only use beginner exercises", () => {
  const plan = generatePlan({ quads: 500, back: 500 }, { level: "beginner", seed: 7 });
  assert.ok(plan.length > 0);
  assert.ok(plan.every((p) => p.exercise.level === "beginner"));
});

test("an exercise isn't repeated within a plan", () => {
  const plan = generatePlan({ calves: 1000 }, { totalSets: 28, seed: 9 });
  const ids = plan.map((p) => p.exercise.id);
  assert.equal(new Set(ids).size, ids.length);
});
