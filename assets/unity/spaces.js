import { m as oe, b as ne, x as se, s as ae, t as J, i as re, y as ce, D as ie, n as le, J as de, G as v, M as L, X as ue, $ as he, a0 as fe, a1 as me, Y as pe, c as S, Z as be, d as ge, _ as G, o as ve, E as we } from "./three.module.js";
const M = document.querySelector("#spaces-canvas"), d = M.parentElement, T = new oe();
T.background = new ne("#d5e5ea");
const C = new se(35, 1, 0.1, 80);
let y;
try {
  y = new ae({ canvas: M, antialias: !0, alpha: !1, powerPreference: "low-power" });
} catch (e) {
  throw d.classList.add("space-fallback"), e;
}
y.setPixelRatio(Math.min(devicePixelRatio, 1.6));
y.outputColorSpace = J;
y.toneMapping = re;
T.add(new ce(15792895, 6913672, 2.6));
const K = new ie(16772049, 3.2);
K.position.set(-4, 9, 5);
T.add(K);
const O = {};
function R(e) {
  return O[e] ?? (O[e] = new ve({ color: e, roughness: 0.65 }));
}
const ye = new le(1, 1, 1), Ee = new de(1, 16, 12);
function i(e, t, s, n, r, o, a, c) {
  const l = new L(ye, R(c));
  return l.position.set(t, s, n), l.scale.set(r, o, a), e.add(l), l;
}
function P(e, t, s, n, r, o) {
  const a = new L(Ee, R(o));
  return a.position.set(t, s, n), a.scale.setScalar(r), e.add(a), a;
}
function D(e, t, s, n, r, o, a) {
  const c = new L(new we(r, r, o, 16), R(a));
  return c.position.set(t, s, n), e.add(c), c;
}
function u(e, t, s, n, r = {}) {
  const o = new v();
  o.position.set(t, 0, s), e.add(o);
  const a = r.wheelchair, c = a ? 0.57 : 0.68;
  i(o, 0, c, 0, 0.3, 0.48, 0.23, n), P(o, 0, c + 0.4, 0, 0.17, r.skin || "#b88967"), P(o, 0, c + 0.49, -0.015, 0.155, r.elder ? "#d8d5ca" : "#303538"), i(o, -0.1, a ? 0.25 : 0.22, a ? 0.15 : 0, 0.12, 0.44, 0.13, "#243c50"), i(o, 0.1, a ? 0.25 : 0.22, a ? 0.15 : 0, 0.12, 0.44, 0.13, "#243c50"), i(o, -0.23, c - 0.08, 0.04, 0.11, 0.4, 0.12, n);
  const l = i(o, 0.23, c + 0.02, 0.1, 0.11, 0.4, 0.12, n);
  if (l.rotation.x = -0.65, a) {
    for (const x of [-0.27, 0.27]) {
      const b = new L(new ue(0.27, 0.035, 8, 24), R("#284353"));
      b.rotation.y = Math.PI / 2, b.position.set(x, 0.28, 0), o.add(b), i(o, x, 0.28, 0, 0.035, 0.48, 0.035, "#9dafb2");
    }
    i(o, 0, 0.43, 0, 0.48, 0.07, 0.44, "#426b7c"), i(o, 0, 0.65, -0.18, 0.48, 0.48, 0.06, "#426b7c");
  }
  return r.bag && i(o, 0.32, 0.43, 0.19, 0.23, 0.27, 0.18, "#d0ac76"), o.userData.arm = l, o;
}
function w(e, t, s, n, r) {
  const o = document.createElement("canvas");
  o.width = 512, o.height = 128;
  const a = o.getContext("2d");
  a.fillStyle = "#f9fcff", a.beginPath(), a.roundRect(0, 0, 512, 110, 24), a.fill(), a.fillStyle = "#183d50", a.font = r.length < 12 ? "600 54px sans-serif" : "600 30px sans-serif", a.textAlign = "center", a.fillText(r, 256, 68);
  const c = new he(o);
  c.colorSpace = J;
  const l = new fe(new me({ map: c, transparent: !0, depthTest: !1, toneMapped: !1 }));
  return l.position.set(t, s, n), l.scale.set(2.2, 0.55, 1), e.add(l), l;
}
function X(e, t, s, n, r, o) {
  i(e, t, r / 2, s, n, r, 1.3, o), i(e, t, r + 0.05, s, n + 0.15, 0.1, 1.45, "#edf3ef");
  for (let a = 0.65; a < r - 0.2; a += 0.65) for (let c = -n / 2 + 0.3; c < n / 2; c += 0.55)
    i(e, t + c, a, s + 0.66, 0.32, 0.4, 0.025, "#386a80"), i(e, t + c, a - 0.23, s + 0.74, 0.4, 0.04, 0.17, "#e4ebdf");
}
const Q = [], U = [], Y = [];
let g = 0, h = !1, B = !1;
function xe(e) {
  const t = new v();
  e.add(t), D(t, 0, 0.15, 0, 0.65, 0.3, "#376d85"), D(t, 0, 0.37, 0, 0.42, 0.15, "#79d2e8"), P(t, 0, 0.7, 0, 0.22, "#e5f9ff"), w(t, 0, 1.35, 0, "BEACON"), [[-2.4, -1.25], [2.4, -1.25], [-2.4, 1.45], [2.4, 1.45]].forEach(([s, n], r) => {
    const o = new v();
    o.position.set(s, 0, n), e.add(o), i(o, 0, 0.09, 0, 1.8, 0.18, 1.6, "#edf0e3");
    const a = new v();
    o.add(a), i(a, 0, 0.65, -0.75, 1.8, 1.15, 0.09, "#93b1bd"), i(a, -0.86, 0.65, 0, 0.09, 1.15, 1.6, "#abc4cb"), i(a, 0, 0.73, -0.68, 1, 0.48, 0.03, "#2a5665");
    for (const q of [-0.4, 0.4])
      i(a, q, 0.5, 0.1, 0.5, 0.07, 0.38, "#cab18b"), i(a, q, 0.29, 0.1, 0.05, 0.4, 0.18, "#687e85"), u(a, q, 0.48, ["#578999", "#9cad8c", "#bd9f80", "#648195"][r]).scale.setScalar(0.48);
    const c = D(o, 0, 0.22, 0, 0.52, 0.16, "#4e9bb7");
    c.scale.setScalar(0.01), w(o, 0, 1.55, 0, "Class " + (r + 1)).scale.set(1.4, 0.35, 1), Q.push({ room: o, interior: a, node: c, x: s, z: n });
    const x = new pe(new S(s, 0.25, n), new S(s * 0.5, 0.9, n * 0.5), new S(0, 0.45, 0)), b = new L(new be(x, 32, 0.025, 6, !1), new ge({ color: "#368dac", transparent: !0, opacity: 0 }));
    e.add(b), U.push(b);
    const V = P(e, s, 0.25, n, 0.075, "#e8fbff");
    V.visible = !1, Y.push({ packet: V, curve: x, index: r });
  });
}
const A = new v();
T.add(A);
const m = {}, k = [], I = [], N = {}, H = {};
let F = "neighbours";
const f = { neighbours: !1, office: !1 }, p = { neighbours: 0, office: 0 };
for (const e of ["neighbours", "school", "office"]) {
  const t = new v();
  if (m[e] = t, A.add(t), t.visible = e === "neighbours", i(t, 0, -0.16, 0, 8, 0.3, 5, "#b9ccd1"), i(t, 0, 0.015, 0.8, 7.8, 0.03, 2.6, "#e4e6da"), e === "neighbours")
    X(t, -1.5, -1.25, 2.5, 4.1, "#9ab8c6"), X(t, 1.45, -1.4, 2.4, 3.5, "#7798ab"), k.push(u(t, -0.7, 0.8, "#438197", { bag: !0 }), u(t, 0.7, 1, "#ccb68c", { elder: !0 }), u(t, 1.8, 1.2, "#7f9e88", { wheelchair: !0 })), I.push(w(t, 0.2, 2, 1, "Need a hand with those?"));
  else if (e === "school")
    xe(t);
  else {
    i(t, 0, 1.4, -1.6, 7, 2.8, 0.15, "#9eb7c1");
    for (let s = -3; s < 4; s++)
      i(t, s, 1.6, -1.48, 0.87, 2, 0.04, "#6990a6"), i(t, s + 0.47, 1.6, -1.45, 0.04, 2.3, 0.08, "#d7e2df");
    for (const s of [-1.5, 1.5])
      i(t, s, 0.72, 0, 1.8, 0.12, 1, "#d1ba94"), i(t, s, 0.33, 0, 0.15, 0.66, 0.5, "#617985"), i(t, s, 0.99, -0.1, 0.55, 0.4, 0.05, "#2b4b61"), i(t, s, 0.77, 0.1, 0.6, 0.03, 0.4, "#748a93");
    k.push(u(t, -1.2, 1, "#4f8395", { bag: !0 }), u(t, 0.3, 0.9, "#b8a17b"), u(t, 1.6, 0.9, "#607e75")), I.push(w(t, 0.3, 2.4, 0.7, "Lunch drive. Count me in!"));
  }
}
k.push(u(m.neighbours, 2.8, 1.8, "#496e92", { bag: !0, skin: "#89654e" }));
for (const e of ["neighbours", "office"])
  N[e] = k.filter((t) => t.parent === m[e]), N[e].forEach((t) => t.userData.start = t.position.clone()), H[e] = I.find((t) => t.parent === m[e]);
const W = i(m.office, 0, 0.3, 1.35, 0.65, 0.6, 0.5, "#c6a77a");
W.visible = !1;
const Z = w(m.neighbours, 0.7, 2.1, 1, "Thank you, neighbour!");
Z.visible = !1;
const _ = w(m.office, 0.3, 2.4, 0.7, "Together for the food drive");
_.visible = !1;
const Ce = { neighbours: ["AT HOME", "A small favour. A familiar face.", "Neighbours lend a hand with groceries and everyday errands, including support for older residents and wheelchair users. Small gestures make a building feel like a community."], school: ["SCHOOL CONCEPT", "Every classroom. One connected school.", "Imagine each classroom as a node in Beacon: coordinate announcements, classroom requests and shared resources from one school hub. Lost and found and parent support stay part of the same community."], office: ["AT WORK", "Colleagues become a community.", "Coordinate a donation drive, find shared support and bring people together beyond their desks."] };
document.querySelectorAll("[data-space]").forEach((e) => e.addEventListener("click", () => {
  Object.entries(m).forEach(([s, n]) => n.visible = s === e.dataset.space), document.querySelectorAll("[data-space]").forEach((s) => s.setAttribute("aria-pressed", String(s === e)));
  const t = Ce[e.dataset.space];
  ["space-label", "space-title", "space-copy"].forEach((s, n) => document.getElementById(s).textContent = t[n]), A.rotation.y = -0.12, F = e.dataset.space, B = F === "school", document.querySelectorAll("[data-scenario-controls]").forEach((s) => s.hidden = s.dataset.scenarioControls !== F), E.hidden = !B, d.classList.toggle("school-active", B), document.querySelector(".space-example").textContent = B ? "Classroom management concept, not an available product feature." : "Illustrative scenarios, not live activity.";
}));
const E = document.createElement("div");
E.className = "school-controls";
E.hidden = !0;
E.innerHTML = '<button id="connect-classrooms" aria-pressed="false">Connect the classrooms</button><button id="school-announcement" disabled>Preview school announcement</button><p id="school-status" role="status">Four classrooms, each with its own community.</p>';
d.after(E);
document.getElementById("connect-classrooms").addEventListener("click", (e) => {
  h = !h, e.currentTarget.setAttribute("aria-pressed", String(h)), e.currentTarget.textContent = h ? "Show the classrooms" : "Connect the classrooms", document.getElementById("school-announcement").disabled = !h, document.getElementById("school-status").textContent = h ? "Four class nodes connected to one Beacon school hub." : "Four classrooms, each with its own community.";
});
document.getElementById("school-announcement").addEventListener("click", () => {
  document.getElementById("school-status").textContent = "Preview: one announcement reaches all four classrooms. Library book drive on Thursday.";
});
for (const [e, t, s, n] of [
  ["neighbours", "Show neighbours helping", "Preview a help request", "See how a nearby request can become a helping hand."],
  ["office", "Bring the team together", "Preview a team activity", "Turn a shared workplace into a community that helps."]
]) {
  const r = document.createElement("div");
  r.className = "school-controls scenario-controls", r.dataset.scenarioControls = e, r.hidden = e !== "neighbours";
  const o = document.createElement("button");
  o.textContent = t, o.dataset.scenarioAction = e, o.setAttribute("aria-pressed", "false");
  const a = document.createElement("button");
  a.textContent = s, a.dataset.scenarioPreview = e;
  const c = document.createElement("p");
  c.setAttribute("role", "status"), c.textContent = n, o.addEventListener("click", () => {
    innerWidth < 700 && d.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }), f[e] = !f[e], o.setAttribute("aria-pressed", String(f[e])), o.textContent = f[e] ? "Reset the scene" : t, c.textContent = f[e] ? e === "neighbours" ? "Two neighbours lend a hand: groceries for an older resident and a bag brought over to a wheelchair user." : "Colleagues coordinate a food drive and gather their contributions in one place." : n;
  }), a.addEventListener("click", () => {
    innerWidth < 700 && d.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }), f[e] = !0, o.setAttribute("aria-pressed", "true"), o.textContent = "Reset the scene", c.textContent = e === "neighbours" ? "Example request: Could someone bring my groceries to the building entrance? A nearby neighbour offers to help." : "Example activity: Thursday food drive. See the collection point, coordinate contributions and join your colleagues.";
  }), r.append(o, a, c), E.after(r);
}
let $ = !1;
new IntersectionObserver((e) => $ = e[0].isIntersecting).observe(d);
let j = 0;
M.addEventListener("pointermove", (e) => {
  if (e.pointerType === "mouse") {
    const t = M.getBoundingClientRect();
    j = (e.clientX - t.left) / t.width * 0.3 - 0.15;
  }
});
M.addEventListener("pointerleave", () => j = 0);
function ee() {
  const e = d.clientWidth, t = e < 700 ? 340 : d.clientHeight;
  y.setSize(e, t, !1), C.aspect = e / t;
  const s = e < 700;
  C.position.set(8, s ? 7 : 6.2, s ? 14 : 10), C.lookAt(s ? new S(0, 0.7, 0) : new S(-1.8, 0.8, 0)), C.updateProjectionMatrix();
}
new ResizeObserver(ee).observe(d);
ee();
const Se = matchMedia("(prefers-reduced-motion: reduce)");
let z = 0;
function te(e) {
  if (requestAnimationFrame(te), !$ || document.hidden || e - z < 33) return;
  z = e;
  const t = !Se.matches && !document.body.classList.contains("motion-paused");
  A.rotation.y = G.lerp(A.rotation.y, t ? j : 0, 0.07), t && (k.forEach((n, r) => n.userData.arm.rotation.x = -0.65 + Math.sin(e * 1e-3 + r) * 0.14), I.forEach((n, r) => n.rotation.z = Math.sin(e * 8e-4 + r) * 0.015));
  const s = h ? 1 : 0;
  g = t ? G.lerp(g, s, 0.06) : s, Q.forEach(({ interior: n, node: r }) => {
    n.scale.setScalar(Math.max(1e-3, 1 - g)), n.visible = g < 0.99, r.scale.setScalar(Math.max(0.01, g));
  }), U.forEach((n) => n.material.opacity = g * 0.85), Y.forEach(({ packet: n, curve: r, index: o }) => {
    n.visible = h, n.position.copy(r.getPoint(t ? (e * 18e-5 + o * 0.2) % 1 : 0.5));
  });
  for (const n of ["neighbours", "office"]) {
    p[n] = t ? G.lerp(p[n], f[n] ? 1 : 0, 0.035) : f[n] ? 1 : 0;
    const r = p[n];
    N[n].forEach((o, a) => {
      const c = o.userData.start;
      o.position.copy(c), n === "neighbours" && a === 0 && (o.position.x += r * 0.8, o.position.z += r * 0.2), n === "neighbours" && a === 3 && (o.position.x -= r * 0.65, o.position.z -= r * 0.55), n === "office" && (o.position.x += (a === 0 ? 0.65 : a === 2 ? -0.55 : 0) * r, o.position.z += r * 0.35);
    }), H[n] && (H[n].visible = r < 0.7);
  }
  Z.visible = p.neighbours >= 0.7, _.visible = p.office >= 0.7, W.visible = p.office > 0.2, W.scale.setScalar(Math.max(0.01, p.office)), y.render(T, C);
}
requestAnimationFrame(te);
