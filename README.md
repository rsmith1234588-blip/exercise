# Exercise Planner

Spread **1000 points** across a dial for each muscle. The planner turns those points into a workout: the more points a muscle has, the bigger its share of the sets. Put all 1000 on biceps and you get a workout made only of biceps exercises.

It picks from a library of **726 exercises**. Each one comes with start and end photos, step-by-step instructions, equipment and difficulty level.

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
- **Exercise picks** (`generatePlan`): each muscle gets about 4 sets per exercise, picked at random from that muscle's exercises. The experience setting limits picks to that level and easier. Passing a seed makes the plan repeatable.

## Exercise data

`src/exercise-data.js` is generated from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is public domain. The import is pinned to a fixed commit, and photos load from that commit on raw.githubusercontent.com, so the app needs internet to show them. To rebuild the file:

```bash
node scripts/import-exercises.js
```

The script drops stretching and cardio, maps the dataset's muscles onto the dials (for example lats, traps and lower back all count as Back) and suggests rep ranges based on the exercise type.

## Project layout

```
index.html          page markup
styles.css          styles (light and dark)
src/muscles.js      muscle dials and levels
src/exercise-data.js  generated exercise library (726 exercises)
src/planner.js      allocation and plan generation (pure, tested)
src/app.js          UI wiring
server.js           tiny static server
scripts/            data import script
tests/              node:test unit tests
```

## Ideas for next steps

- Count secondary muscles toward the points (the data already lists them)
- Equipment filter (bodyweight only, dumbbells, gym); each exercise already has its equipment
- Save presets and plan weekly splits
- Swap or reroll a single exercise
