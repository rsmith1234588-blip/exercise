# Exercise Planner

Spread **1000 points** across a dial for each muscle. The planner turns those points into a workout: the more points a muscle has, the bigger its share of the sets. Put all 1000 on biceps and you get a workout made only of biceps exercises.

Every exercise is **bodyweight**. The library has 58 of them, and each comes with stick-figure drawings of the start and end positions, step-by-step instructions, a difficulty level and any equipment needed (such as a pull-up bar, bench or wall).

## Run it

Needs Node 18 or newer. There are no dependencies to install, and it works offline.

```bash
npm start
```

Then open http://localhost:3000.

```bash
npm test
```

## How it works

- **Dials** (`src/app.js`): one slider per muscle. A dial can't push the total past 1000 (`clampPoints`).
- **Allocation** (`src/planner.js`, `allocate`): the workout's total sets (12, 20 or 28) are split between muscles in proportion to their points. The largest-remainder method makes sure the counts always add up to the total.
- **Exercise picks** (`generatePlan`): each muscle gets about 4 sets per exercise, picked at random from that muscle's exercises. The experience setting limits picks to that level and easier. If a muscle runs out of exercises, the planner adds ones that work it as a secondary muscle, and an exercise is never used twice in one plan. Passing a seed makes the plan repeatable.

## Drawings

The diagrams are drawn in code by `src/figure.js`, so there are no image files. Each pose is a set of joint angles (0° points down, 90° forward, 180° up):

```js
const SQUAT = { t: 145, a: [[90, 90]], l: [[80, -25, 90]] };
//              torso    arms: upper, fore   legs: thigh, shin, foot
```

The figure is placed on the floor automatically. A pose can also rest on props: `level` tilts the body so two points touch the floor or a bench (for example hands and toes in a push-up), `hang` hangs it from a pull-up bar, and `box`, `bars`, `wall` and `strap` draw equipment. The comment at the top of `figure.js` lists every option.

To add an exercise, add an entry to `src/exercise-data.js` with a `start` and `end` pose (or `hold: true` and just `start`). `npm test` checks that every drawing stays inside its frame.

## Project layout

```
index.html            page markup
styles.css            styles (light and dark)
src/muscles.js        muscle dials and levels
src/exercise-data.js  exercise library with poses and instructions
src/figure.js         stick-figure drawing engine (SVG)
src/planner.js        allocation and plan generation (pure, tested)
src/app.js            UI wiring
server.js             tiny static server
tests/                node:test unit tests
```

## Ideas for next steps

- "No equipment at all" filter (each exercise already lists what it needs)
- Animate between the start and end drawings
- Save presets and plan weekly splits
- Swap or reroll a single exercise
