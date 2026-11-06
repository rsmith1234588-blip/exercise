// Muscle groups the user can assign points to.
export const MUSCLES = [
  { id: "chest", name: "Chest" },
  { id: "back", name: "Back" },
  { id: "shoulders", name: "Shoulders" },
  { id: "biceps", name: "Biceps" },
  { id: "triceps", name: "Triceps" },
  { id: "forearms", name: "Forearms" },
  { id: "abs", name: "Abs" },
  { id: "quads", name: "Quads" },
  { id: "hamstrings", name: "Hamstrings" },
  { id: "glutes", name: "Glutes" },
  { id: "calves", name: "Calves" },
];

// Exercise library. `primary` decides which dial an exercise belongs to.
export const EXERCISES = [
  // Chest
  { name: "Barbell Bench Press", primary: "chest", reps: "6-10" },
  { name: "Incline Dumbbell Press", primary: "chest", reps: "8-12" },
  { name: "Push-Ups", primary: "chest", reps: "10-20" },
  { name: "Cable Fly", primary: "chest", reps: "12-15" },
  { name: "Dips (chest lean)", primary: "chest", reps: "8-12" },

  // Back
  { name: "Pull-Ups", primary: "back", reps: "6-10" },
  { name: "Barbell Row", primary: "back", reps: "6-10" },
  { name: "Lat Pulldown", primary: "back", reps: "10-12" },
  { name: "Seated Cable Row", primary: "back", reps: "10-12" },
  { name: "Single-Arm Dumbbell Row", primary: "back", reps: "8-12" },

  // Shoulders
  { name: "Overhead Press", primary: "shoulders", reps: "6-10" },
  { name: "Lateral Raise", primary: "shoulders", reps: "12-15" },
  { name: "Rear Delt Fly", primary: "shoulders", reps: "12-15" },
  { name: "Arnold Press", primary: "shoulders", reps: "8-12" },
  { name: "Face Pull", primary: "shoulders", reps: "12-15" },

  // Biceps
  { name: "Barbell Curl", primary: "biceps", reps: "8-12" },
  { name: "Hammer Curl", primary: "biceps", reps: "10-12" },
  { name: "Incline Dumbbell Curl", primary: "biceps", reps: "10-12" },
  { name: "Preacher Curl", primary: "biceps", reps: "10-12" },
  { name: "Cable Curl", primary: "biceps", reps: "12-15" },
  { name: "Concentration Curl", primary: "biceps", reps: "10-12" },

  // Triceps
  { name: "Close-Grip Bench Press", primary: "triceps", reps: "6-10" },
  { name: "Triceps Pushdown", primary: "triceps", reps: "10-15" },
  { name: "Overhead Triceps Extension", primary: "triceps", reps: "10-12" },
  { name: "Skull Crushers", primary: "triceps", reps: "8-12" },
  { name: "Bench Dips", primary: "triceps", reps: "10-15" },

  // Forearms
  { name: "Wrist Curl", primary: "forearms", reps: "15-20" },
  { name: "Reverse Wrist Curl", primary: "forearms", reps: "15-20" },
  { name: "Farmer's Carry", primary: "forearms", reps: "30-45 s" },
  { name: "Reverse Curl", primary: "forearms", reps: "10-12" },

  // Abs
  { name: "Plank", primary: "abs", reps: "30-60 s" },
  { name: "Hanging Leg Raise", primary: "abs", reps: "10-15" },
  { name: "Cable Crunch", primary: "abs", reps: "12-15" },
  { name: "Ab Wheel Rollout", primary: "abs", reps: "8-12" },
  { name: "Russian Twist", primary: "abs", reps: "20" },

  // Quads
  { name: "Back Squat", primary: "quads", reps: "5-8" },
  { name: "Leg Press", primary: "quads", reps: "10-12" },
  { name: "Bulgarian Split Squat", primary: "quads", reps: "8-10" },
  { name: "Leg Extension", primary: "quads", reps: "12-15" },
  { name: "Goblet Squat", primary: "quads", reps: "10-12" },

  // Hamstrings
  { name: "Romanian Deadlift", primary: "hamstrings", reps: "8-10" },
  { name: "Lying Leg Curl", primary: "hamstrings", reps: "10-12" },
  { name: "Nordic Curl", primary: "hamstrings", reps: "5-8" },
  { name: "Good Morning", primary: "hamstrings", reps: "8-10" },

  // Glutes
  { name: "Hip Thrust", primary: "glutes", reps: "8-12" },
  { name: "Glute Bridge", primary: "glutes", reps: "12-15" },
  { name: "Cable Kickback", primary: "glutes", reps: "12-15" },
  { name: "Walking Lunge", primary: "glutes", reps: "10 / leg" },

  // Calves
  { name: "Standing Calf Raise", primary: "calves", reps: "10-15" },
  { name: "Seated Calf Raise", primary: "calves", reps: "12-20" },
  { name: "Single-Leg Calf Raise", primary: "calves", reps: "10-15" },
];
