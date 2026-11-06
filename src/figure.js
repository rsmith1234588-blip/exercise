// Draws a side-view stick figure from joint angles, as an SVG string.
//
// Angles are in degrees: 0 points straight down, 90 points forward (right),
// 180 points up and -90 points backward (left). The figure faces right.
//
// A pose:
//   t      torso angle, hip -> neck (180 = upright)
//   h      head angle from the neck (defaults to t)
//   a      arms: [[upperArm, forearm], [farUpperArm, farForearm]?]
//   l      legs: [[thigh, shin, foot?], [farThigh, farShin, farFoot?]?]
//          foot defaults to 90 (flat, pointing forward)
// Placement and props (all optional):
//   level  { on, up, height }  rotate the whole figure about joint `on` (which
//          rests on the floor) until joint `up` is `height` above the floor.
//          Draws a bench under `up` when height > 0, or a low bar if `bar`.
//   bar    with `level`: draw a low bar (on a post) at the `up` joint
//   hang   true, or { towel: length }: hands hold a pull-up bar
//   bars   number: hands on parallel bars this high
//   box    { at, height, align?, edge? }: a box under a joint group
//          (align: true places the figure on the box instead of the floor)
//   wall   { at, side: "left" | "right" }: a wall touching that joint group
//   strap  [jointA, jointB]: a towel or strap between two joints
//   air    lift the figure this far off the floor (jumps)

export const SIZE = 120;
export const FLOOR = 112;
const BAR_Y = 14;
const LEN = { torso: 26, neck: 3, headR: 5.5, upperArm: 13, forearm: 12, thigh: 20, shin: 19, foot: 6 };

const GROUPS = {
  hands: ["hand", "hand2"],
  hand: ["hand"],
  hand2: ["hand2"],
  elbows: ["elbow", "elbow2"],
  feet: ["ankle", "toe", "ankle2", "toe2"],
  foot: ["ankle", "toe"],
  foot2: ["ankle2", "toe2"],
  toes: ["toe", "toe2"],
  knees: ["knee", "knee2"],
  neck: ["neck", "head"],
  hip: ["hip"],
  back: ["hip", "neck"],
};

const rad = (deg) => (deg * Math.PI) / 180;
const dir = (deg) => [Math.sin(rad(deg)), Math.cos(rad(deg))];
const step = ([x, y], deg, len) => {
  const [dx, dy] = dir(deg);
  return [x + dx * len, y + dy * len];
};

/** Joint positions before placement, with the hip at the origin. */
function skeleton(pose) {
  const arms = pose.a ?? [[0, 0]];
  const legs = pose.l ?? [[0, 0]];
  const [a1, a2 = a1] = arms;
  const [l1, l2 = l1] = legs;
  const hip = [0, 0];
  const neck = step(hip, pose.t ?? 180, LEN.torso);
  const head = step(neck, pose.h ?? pose.t ?? 180, LEN.neck + LEN.headR);
  const p = { hip, neck, head };
  const arm = ([u, f], s) => {
    p["elbow" + s] = step(neck, u, LEN.upperArm);
    p["hand" + s] = step(p["elbow" + s], f, LEN.forearm);
  };
  const leg = ([th, sh, ft = 90], s) => {
    p["knee" + s] = step(hip, th, LEN.thigh);
    p["ankle" + s] = step(p["knee" + s], sh, LEN.shin);
    p["toe" + s] = step(p["ankle" + s], ft, LEN.foot);
  };
  arm(a1, "");
  arm(a2, "2");
  leg(l1, "");
  leg(l2, "2");
  return p;
}

const lowest = (p, names) =>
  Math.max(...names.map((n) => (n === "head" ? p.head[1] + LEN.headR : p[n][1])));

function transform(p, fn) {
  for (const k of Object.keys(p)) p[k] = fn(p[k]);
}

/**
 * Work out final joint positions and props for a pose.
 * @returns {{ points: Record<string, [number, number]>, props: object[], floor: boolean }}
 */
export function layout(pose) {
  const p = skeleton(pose);
  const props = [];
  let floor = true;
  const all = Object.keys(p);

  if (pose.level) {
    const { on, up, height = 0 } = pose.level;
    const [cx, cy] = p[on];
    const vx = p[up][0] - cx;
    const vy = p[up][1] - cy;
    // Rotate by phi so that up.y - on.y = -height.
    const r = Math.hypot(vx, vy);
    const delta = Math.atan2(vx, vy);
    const spread = Math.acos(Math.max(-1, Math.min(1, -height / r)));
    const norm = (x) => Math.atan2(Math.sin(x), Math.cos(x));
    const options = [norm(delta + spread), norm(delta - spread)];
    const phi = Math.abs(options[0]) < Math.abs(options[1]) ? options[0] : options[1];
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    transform(p, ([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
    const shift = FLOOR - p[on][1];
    transform(p, ([x, y]) => [x, y + shift]);
    if (height > 3) {
      props.push(pose.bar ? { type: "lowbar", at: p[up] } : { type: "box", x: p[up][0], top: p[up][1] + 2 });
    }
  } else if (pose.hang) {
    const towel = pose.hang.towel ?? 0;
    const shift = BAR_Y + towel - p.hand[1];
    transform(p, ([x, y]) => [x, y + shift]);
    props.push({ type: "bar", at: [p.hand[0], BAR_Y], towel });
    floor = lowest(p, all) > FLOOR - 8;
  } else if (pose.bars) {
    const shift = FLOOR - pose.bars - p.hand[1];
    transform(p, ([x, y]) => [x, y + shift]);
    props.push({ type: "bars", at: p.hand });
  } else {
    const boxed = pose.box ? GROUPS[pose.box.at] : [];
    let shift;
    if (pose.box?.align) {
      shift = FLOOR - pose.box.height - lowest(p, boxed);
    } else {
      shift = FLOOR - lowest(p, all.filter((n) => !boxed.includes(n)));
    }
    transform(p, ([x, y]) => [x, y + shift]);
  }

  if (pose.box) {
    const names = GROUPS[pose.box.at];
    const x = names.reduce((sum, n) => sum + p[n][0], 0) / names.length;
    props.push({ type: "box", x, top: FLOOR - pose.box.height, edge: pose.box.edge });
  }
  if (pose.air) transform(p, ([x, y]) => [x, y - pose.air]);
  if (pose.wall) {
    const xs = GROUPS[pose.wall.at].map((n) => p[n][0]);
    const x = pose.wall.side === "left" ? Math.min(...xs) - 3 : Math.max(...xs) + 3;
    props.push({ type: "wall", x, side: pose.wall.side });
  }
  if (pose.strap) props.push({ type: "strap", from: pose.strap[0], to: pose.strap[1] });

  return { points: p, props, floor };
}

const f = (n) => Math.round(n * 10) / 10;
const line = (a, b, cls) => `<line class="${cls}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
const path = (pts, cls) => `<polyline class="${cls}" points="${pts.map((q) => `${f(q[0])},${f(q[1])}`).join(" ")}"/>`;

/** Render a pose to an SVG string. */
export function renderFigure(pose, label = "") {
  const { points: p, props, floor } = layout(pose);

  // Centre everything horizontally.
  const xs = Object.values(p).map((q) => q[0]);
  for (const pr of props) {
    if (pr.type === "box") xs.push(pr.x - 11, pr.x + (pr.edge ? 20 : 11));
    if (pr.type === "wall") xs.push(pr.x + (pr.side === "left" ? -3 : 3));
  }
  const dx = SIZE / 2 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const P = (q) => [q[0] + dx, q[1]];
  const at = (n) => P(p[n]);

  const out = [];
  for (const pr of props) {
    if (pr.type === "box") {
      const x0 = pr.edge ? pr.x - 2 + dx : pr.x - 11 + dx;
      out.push(`<rect class="prop" x="${f(x0)}" y="${f(pr.top)}" width="22" height="${f(FLOOR + 1 - pr.top)}" rx="1.5"/>`);
    } else if (pr.type === "bar") {
      const [x, y] = P(pr.at);
      if (pr.towel) out.push(line([x, y], [x, y + pr.towel], "strap"));
      out.push(`<circle class="bar" cx="${f(x)}" cy="${f(y)}" r="2.6"/>`);
    } else if (pr.type === "lowbar") {
      const [x, y] = P(pr.at);
      out.push(`<line class="prop-line" x1="${f(x + 3)}" y1="${f(y)}" x2="${f(x + 3)}" y2="${FLOOR + 1}"/>`);
      out.push(`<circle class="bar" cx="${f(x)}" cy="${f(y)}" r="2.6"/>`);
    } else if (pr.type === "bars") {
      const [x, y] = P(pr.at);
      out.push(`<rect class="prop" x="${f(x - 1.5)}" y="${f(y + 2)}" width="3" height="${f(FLOOR + 1 - y - 2)}"/>`);
      out.push(`<circle class="bar" cx="${f(x)}" cy="${f(y + 2)}" r="2.6"/>`);
    } else if (pr.type === "wall") {
      const x = pr.x + dx;
      const x0 = pr.side === "left" ? x - 6 : x;
      out.push(`<rect class="prop" x="${f(x0)}" y="0" width="6" height="${FLOOR + 1}"/>`);
    }
  }
  if (floor) out.push(`<line class="floor" x1="0" y1="${FLOOR + 1.5}" x2="${SIZE}" y2="${FLOOR + 1.5}"/>`);

  // Far limbs first (lighter), then torso and near limbs.
  out.push(path([at("hip"), at("knee2"), at("ankle2"), at("toe2")], "limb far"));
  out.push(path([at("neck"), at("elbow2"), at("hand2")], "limb far"));
  out.push(line(at("hip"), at("neck"), "limb"));
  out.push(path([at("hip"), at("knee"), at("ankle"), at("toe")], "limb"));
  out.push(path([at("neck"), at("elbow"), at("hand")], "limb"));
  const [hx, hy] = at("head");
  out.push(`<circle class="head" cx="${f(hx)}" cy="${f(hy)}" r="${LEN.headR}"/>`);
  for (const pr of props) {
    if (pr.type === "strap") out.push(line(at(pr.from), at(pr.to), "strap"));
  }

  const title = label ? `<title>${label.replace(/[<&>"]/g, "")}</title>` : "";
  return `<svg class="figure" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${label.replace(/[<&>"]/g, "")}" xmlns="http://www.w3.org/2000/svg">${title}${out.join("")}</svg>`;
}
