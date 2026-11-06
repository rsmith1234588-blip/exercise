# Exercise Planner

Spread **1000 points** across a dial for each muscle. The planner turns those points into a workout: the more points a muscle has, the bigger its share of the sets. Put all 1000 on biceps and you get a workout made only of biceps exercises.

## Run it

Needs Node 18 or newer. There are no dependencies to install.

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
- **Exercise picks** (`generatePlan`): each muscle gets about 4 sets per exercise, picked at random from that muscle's exercises in `src/exercises.js`. Passing a seed makes the plan repeatable.

## Project layout

```
index.html          page markup
styles.css          styles (light and dark)
src/exercises.js    muscle list and exercise library
src/planner.js      allocation and plan generation (pure, tested)
src/app.js          UI wiring
server.js           tiny static server
tests/              node:test unit tests
```

## Ideas for next steps

- Secondary muscles per exercise (for example bench press also hits triceps)
- Equipment filters (bodyweight only, dumbbells, gym)
- Save presets and plan weekly splits
- Swap or reroll a single exercise
