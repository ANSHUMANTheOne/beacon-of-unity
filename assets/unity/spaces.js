import { m as we, b as ve, x as Ee, s as xe, t as re, i as Se, y as Ce, D as Me, n as ke, J as Ae, G as x, M as S, T as ne, X as Te, $ as Le, a0 as Ie, a1 as Be, Y as Pe, c as P, Z as qe, d as Oe, _ as D, o as Re, E as De } from "./three.module.js";
const G = document.querySelector("#spaces-canvas"), m = G.parentElement, F = new we();
F.background = new ve("#d5e5ea");
const I = new Ee(35, 1, 0.1, 80);
let A;
try {
  A = new xe({ canvas: G, antialias: !0, alpha: !1, powerPreference: "low-power" });
} catch (e) {
  throw m.classList.add("space-fallback"), e;
}
A.setPixelRatio(Math.min(devicePixelRatio, 1.6));
A.outputColorSpace = re;
A.toneMapping = Se;
F.add(new Ce(15792895, 6913672, 2.6));
const ie = new Me(16772049, 3.2);
ie.position.set(-4, 9, 5);
F.add(ie);
const j = {};
function M(e) {
  return j[e] ?? (j[e] = new Re({ color: e, roughness: 0.65 }));
}
const Ge = new ke(1, 1, 1), ze = new Ae(1, 16, 12);
function c(e, t, o, n, r, s, a, l) {
  const i = new S(Ge, M(l));
  return i.position.set(t, o, n), i.scale.set(r, s, a), e.add(i), i;
}
function q(e, t, o, n, r, s) {
  const a = new S(ze, M(s));
  return a.position.set(t, o, n), a.scale.setScalar(r), e.add(a), a;
}
function V(e, t, o, n, r, s, a) {
  const l = new S(new De(r, r, s, 16), M(a));
  return l.position.set(t, o, n), e.add(l), l;
}
function w(e, t, o, n, r = {}) {
  const s = new x();
  s.position.set(t, 0, o), e.add(s);
  const a = !!r.wheelchair, l = r.skin || "#b88967", i = a ? 0.46 : 0.5, d = new S(new ne(0.14, 0.22, 5, 12), M(n));
  d.position.y = i + 0.22, d.scale.z = 0.8, s.add(d), q(s, 0, i + 0.62, 0, 0.16, l);
  const u = q(s, 0, i + 0.71, -0.02, 0.145, r.elder ? "#d8d5ca" : "#303538");
  u.scale.y *= 0.65;
  function h(b, L, te, ye) {
    const H = new x();
    H.position.set(b, L, 0), s.add(H);
    const oe = new S(new ne(0.055, te - 0.11, 4, 8), M(ye));
    return oe.position.y = -te / 2, H.add(oe), H;
  }
  const f = [h(-0.095, i, 0.46, "#243c50"), h(0.095, i, 0.46, "#243c50")], y = [h(-0.21, i + 0.36, 0.37, n), h(0.21, i + 0.36, 0.37, n)];
  if (y.forEach((b) => q(b, 0, -0.38, 0, 0.058, l)), f.forEach((b) => c(b, 0, -0.43, 0.045, 0.13, 0.08, 0.22, "#314959")), a) {
    f.forEach((b) => b.rotation.x = -0.4);
    for (const b of [-0.29, 0.29]) {
      const L = new S(new Te(0.27, 0.035, 8, 24), M("#284353"));
      L.rotation.y = Math.PI / 2, L.position.set(b, 0.28, 0), s.add(L), c(s, b, 0.28, 0, 0.035, 0.48, 0.035, "#9dafb2");
    }
    c(s, 0, 0.43, 0, 0.48, 0.07, 0.44, "#426b7c"), c(s, 0, 0.65, -0.18, 0.48, 0.48, 0.06, "#426b7c");
  }
  let ee;
  return r.bag && (ee = c(y[1], 0, -0.48, 0.03, 0.23, 0.27, 0.18, "#d0ac76")), s.userData = { arm: y[1], arms: y, legs: f, seated: a, bag: ee }, s;
}
function k(e, t, o, n, r) {
  const s = document.createElement("canvas");
  s.width = 512, s.height = 128;
  const a = s.getContext("2d");
  a.fillStyle = "#f9fcff", a.beginPath(), a.roundRect(0, 0, 512, 110, 24), a.fill(), a.fillStyle = "#183d50", a.font = r.length < 12 ? "600 54px sans-serif" : "600 30px sans-serif", a.textAlign = "center", a.fillText(r, 256, 68);
  const l = new Le(s);
  l.colorSpace = re;
  const i = new Ie(new Be({ map: l, transparent: !0, depthTest: !1, toneMapped: !1 }));
  return i.position.set(t, o, n), i.scale.set(2.2, 0.55, 1), e.add(i), i;
}
function se(e, t, o, n, r, s) {
  c(e, t, r / 2, o, n, r, 1.3, s), c(e, t, r + 0.05, o, n + 0.15, 0.1, 1.45, "#edf3ef");
  for (let a = 0.65; a < r - 0.2; a += 0.65) for (let l = -n / 2 + 0.3; l < n / 2; l += 0.55)
    c(e, t + l, a, o + 0.66, 0.32, 0.4, 0.025, "#386a80"), c(e, t + l, a - 0.23, o + 0.74, 0.4, 0.04, 0.17, "#e4ebdf");
}
const ce = [], le = [], de = [];
let C = 0, v = !1, B = !1;
function Fe(e) {
  const t = new x();
  e.add(t), V(t, 0, 0.15, 0, 0.65, 0.3, "#376d85"), V(t, 0, 0.37, 0, 0.42, 0.15, "#79d2e8"), q(t, 0, 0.7, 0, 0.22, "#e5f9ff"), k(t, 0, 1.35, 0, "BEACON"), [[-2.4, -1.25], [2.4, -1.25], [-2.4, 1.45], [2.4, 1.45]].forEach(([o, n], r) => {
    const s = new x();
    s.position.set(o, 0, n), e.add(s), c(s, 0, 0.09, 0, 1.8, 0.18, 1.6, "#edf0e3");
    const a = new x();
    s.add(a), c(a, 0, 0.65, -0.75, 1.8, 1.15, 0.09, "#93b1bd"), c(a, -0.86, 0.65, 0, 0.09, 1.15, 1.6, "#abc4cb"), c(a, 0, 0.73, -0.68, 1, 0.48, 0.03, "#2a5665");
    for (const f of [-0.4, 0.4])
      c(a, f, 0.5, 0.1, 0.5, 0.07, 0.38, "#cab18b"), c(a, f, 0.29, 0.1, 0.05, 0.4, 0.18, "#687e85"), w(a, f, 0.48, ["#578999", "#9cad8c", "#bd9f80", "#648195"][r]).scale.setScalar(0.48);
    const l = V(s, 0, 0.22, 0, 0.52, 0.16, "#4e9bb7");
    l.scale.setScalar(0.01), k(s, 0, 1.55, 0, "Class " + (r + 1)).scale.set(1.4, 0.35, 1), ce.push({ room: s, interior: a, node: l, x: o, z: n });
    const d = new Pe(new P(o, 0.25, n), new P(o * 0.5, 0.9, n * 0.5), new P(0, 0.45, 0)), u = new S(new qe(d, 32, 0.025, 6, !1), new Oe({ color: "#368dac", transparent: !0, opacity: 0 }));
    e.add(u), le.push(u);
    const h = q(e, o, 0.25, n, 0.075, "#e8fbff");
    h.visible = !1, de.push({ packet: h, curve: d, index: r });
  });
}
const z = new x();
F.add(z);
const g = {}, N = [], W = [], E = {}, Y = {};
let O = "neighbours";
const J = { neighbours: !1, office: !1 };
for (const e of ["neighbours", "school", "office"]) {
  const t = new x();
  if (g[e] = t, z.add(t), t.visible = e === "neighbours", c(t, 0, -0.16, 0, 8, 0.3, 5, "#b9ccd1"), c(t, 0, 0.015, 0.8, 7.8, 0.03, 2.6, "#e4e6da"), e === "neighbours")
    se(t, -1.5, -1.25, 2.5, 4.1, "#9ab8c6"), se(t, 1.45, -1.4, 2.4, 3.5, "#7798ab"), N.push(w(t, -0.7, 0.8, "#438197"), w(t, 0.7, 1, "#ccb68c", { elder: !0 }), w(t, 1.8, 1.2, "#7f9e88", { wheelchair: !0 })), W.push(k(t, 0.2, 2, 1, "Need a hand with those?"));
  else if (e === "school")
    Fe(t);
  else {
    c(t, 0, 1.4, -1.6, 7, 2.8, 0.15, "#9eb7c1");
    for (let o = -3; o < 4; o++)
      c(t, o, 1.6, -1.48, 0.87, 2, 0.04, "#6990a6"), c(t, o + 0.47, 1.6, -1.45, 0.04, 2.3, 0.08, "#d7e2df");
    for (const o of [-1.5, 1.5])
      c(t, o, 0.72, 0, 1.8, 0.12, 1, "#d1ba94"), c(t, o, 0.33, 0, 0.15, 0.66, 0.5, "#617985"), c(t, o, 0.99, -0.1, 0.55, 0.4, 0.05, "#2b4b61"), c(t, o, 0.77, 0.1, 0.6, 0.03, 0.4, "#748a93");
    N.push(w(t, -1.2, 1, "#4f8395", { bag: !0 }), w(t, 0.3, 0.9, "#b8a17b"), w(t, 1.6, 0.9, "#607e75")), W.push(k(t, 0.3, 2.4, 0.7, "Lunch drive. Count me in!"));
  }
}
N.push(w(g.neighbours, 2.8, 1.8, "#496e92", { bag: !0, skin: "#89654e" }));
for (const e of ["neighbours", "office"])
  E[e] = N.filter((t) => t.parent === g[e]), E[e].forEach((t) => t.userData.start = t.position.clone()), Y[e] = W.find((t) => t.parent === g[e]);
const He = c(E.neighbours[1].userData.arms[1], 0, -0.34, 0.08, 0.1, 0.17, 0.025, "#2a6883"), ue = c(g.office, 0, 0.3, 1.95, 0.65, 0.6, 0.5, "#c6a77a");
ue.visible = !0;
const K = c(g.office, 0, 0.8, 1.95, 0.23, 0.27, 0.18, "#d0ac76");
K.visible = !1;
const Q = k(g.neighbours, 0.7, 2.1, 1, "Thank you, neighbour!");
Q.visible = !1;
const he = k(g.office, 0.3, 2.4, 0.7, "Together for the food drive");
he.visible = !1;
const fe = { neighbours: ["AT HOME", "An appointment. Someone by your side.", "An older neighbour needs a lift and company for a hospital appointment. A request on Beacon connects them with someone nearby, while another neighbour helps a wheelchair user with groceries."], school: ["SCHOOL CONCEPT", "Every classroom. One connected school.", "Imagine each classroom as a node in Beacon: coordinate announcements, classroom requests and shared resources from one school hub. Lost and found and parent support stay part of the same community."], office: ["AT WORK", "Colleagues become a community.", "Coordinate a donation drive, find shared support and bring people together beyond their desks."] };
["space-label", "space-title", "space-copy"].forEach((e, t) => document.getElementById(e).textContent = fe.neighbours[t]);
document.querySelectorAll("[data-space]").forEach((e) => e.addEventListener("click", () => {
  Object.entries(g).forEach(([o, n]) => n.visible = o === e.dataset.space), document.querySelectorAll("[data-space]").forEach((o) => o.setAttribute("aria-pressed", String(o === e)));
  const t = fe[e.dataset.space];
  ["space-label", "space-title", "space-copy"].forEach((o, n) => document.getElementById(o).textContent = t[n]), z.rotation.y = -0.12, O = e.dataset.space, B = O === "school", document.querySelectorAll("[data-scenario-controls]").forEach((o) => o.hidden = o.dataset.scenarioControls !== O), T.hidden = !B, m.classList.toggle("school-active", B), document.querySelector(".space-example").textContent = B ? "Classroom management concept, not an available product feature." : "Illustrative scenarios, not live activity.";
}));
const T = document.createElement("div");
T.className = "school-controls";
T.hidden = !0;
T.innerHTML = '<button id="connect-classrooms" aria-pressed="false">Connect the classrooms</button><button id="school-announcement" disabled>Preview school announcement</button><p id="school-status" role="status">Four classrooms, each with its own community.</p>';
m.after(T);
document.getElementById("connect-classrooms").addEventListener("click", (e) => {
  v = !v, e.currentTarget.setAttribute("aria-pressed", String(v)), e.currentTarget.textContent = v ? "Show the classrooms" : "Connect the classrooms", document.getElementById("school-announcement").disabled = !v, document.getElementById("school-status").textContent = v ? "Four class nodes connected to one Beacon school hub." : "Four classrooms, each with its own community.";
});
document.getElementById("school-announcement").addEventListener("click", () => {
  document.getElementById("school-status").textContent = "Preview: one announcement reaches all four classrooms. Library book drive on Thursday.";
});
const R = { neighbours: 0, office: 0 }, Z = { neighbours: -1, office: -1 }, ae = { neighbours: [["A request for company", "I have a hospital appointment tomorrow, but no one to go with. Could a neighbour offer a lift and come along?"], ["A neighbour replies", "I can help. Let us arrange a time and meet at the entrance."], ["Meeting at the entrance", "The helper walks over and stops beside the older neighbour. Another neighbour brings groceries to the wheelchair user."], ["On their way, together", "They walk together to the agreed pickup point for the appointment."]], office: [["A team invitation", "Thursday food drive: bring a contribution to the collection point."], ["Colleagues join in", "The team agrees where to meet and what to bring."], ["Contributions arrive", "Colleagues walk around the desks and stop beside the collection point."], ["One team effort", "A contribution is placed at the collection point, ready for the drive."]] }, p = document.createElement("div");
p.className = "scene-story";
p.setAttribute("aria-live", "polite");
p.innerHTML = '<span class="eyebrow">ILLUSTRATIVE STORY</span><strong></strong><p></p><div class="story-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
m.append(p);
function _(e, t) {
  Z[e] === t && p.dataset.storySpace === e || (Z[e] = t, p.dataset.storySpace = e, p.querySelector("strong").textContent = ae[e][t][0], p.querySelector("p").textContent = ae[e][t][1], p.querySelectorAll("i").forEach((o, n) => o.classList.toggle("active", n <= t)));
}
for (const e of ["neighbours", "office"]) {
  let n = function() {
    innerWidth < 700 && m.scrollIntoView({ block: "start", behavior: me.matches ? "instant" : "smooth" });
  };
  const t = document.createElement("div");
  t.className = "school-controls scenario-controls", t.dataset.scenarioControls = e, t.hidden = e !== "neighbours", t.innerHTML = '<button data-scenario-action="' + e + '">Play the story</button><button data-scenario-preview="' + e + '">Next moment</button><p>Four moments: request, reply, meet and help.</p>';
  const o = t.querySelector("[data-scenario-action]");
  o.setAttribute("aria-pressed", "false"), o.addEventListener("click", () => {
    R[e] = 0, J[e] = !0, o.setAttribute("aria-pressed", "true"), o.textContent = "Replay the story", _(e, 0), n();
  }), t.querySelector("[data-scenario-preview]").addEventListener("click", () => {
    J[e] = !1;
    const r = (Math.max(0, Z[e]) + 1) % 4;
    R[e] = [0, 3, 9, 14][r], _(e, r), n();
  }), T.after(t);
}
function Ne(e, t, o, n, r = 1) {
  e.position.set(t, Math.sin(n * 2) * 0.018 * r, o), !e.userData.seated && (e.userData.legs.forEach((s, a) => s.rotation.x = Math.sin(n + a * Math.PI) * 0.38 * r), e.userData.arms.forEach((s, a) => s.rotation.x = -Math.sin(n + a * Math.PI) * 0.25 * r));
}
function U(e) {
  return e = D.clamp(e, 0, 1), e * e * (3 - 2 * e);
}
function We(e, t, o) {
  J[e] && e === O && o && (R[e] = Math.min(14, R[e] + t));
  const n = R[e], r = n < 3 ? 0 : n < 6 ? 1 : n < 11 ? 2 : 3;
  e === O && (p.hidden = !1, _(e, r));
  const s = U((n - 6) / 3), a = U((n - 11) / 3), l = n > 6 && n < 9 || e === "neighbours" && n > 11 && n < 14;
  if (E[e].forEach((i, d) => {
    const u = i.userData.start;
    let h = u.x, f = u.z;
    e === "neighbours" ? (d === 0 && (h = u.x + 0.6 * s - 2 * a, f = u.z + 0.2 * s + 0.6 * a), d === 1 && (h = u.x - 2 * a, f = u.z + 0.6 * a), d === 3 && (h = u.x - 0.15 * s, f = u.z - 0.6 * s)) : (d === 0 && (h = u.x + 0.25 * s, f = u.z + 0.5 * s), d === 1 && (h = u.x - 0.3 * s, f = u.z - 0.1 * s), d === 2 && (h = u.x - 0.6 * s, f = u.z + 0.6 * s));
    const y = l && (e === "office" || d === 0 || d === 3 && n < 9 || d === 1 && n > 11);
    Ne(i, h, f, n * 8, y ? 1 : 0), i.rotation.y = y && e === "neighbours" ? n > 11 ? -1.28 : d === 0 ? 1.25 : -2.9 : 0;
  }), Y[e] && (Y[e].visible = !1), e === "neighbours")
    He.visible = n < 6, E.neighbours[1].userData.arms[1].rotation.x = n < 6 ? -1.15 : E.neighbours[1].userData.arms[1].rotation.x, Q.visible = n >= 9, Q.position.set(-0.2 - 2 * a, 2, 1);
  else {
    he.visible = n >= 11, ue.visible = !0;
    const i = U((n - 11) / 2), d = E.office[0];
    d.userData.bag && (d.userData.bag.visible = i === 0), K.visible = i > 0, K.position.set(D.lerp(-0.75, 0, i), 0.76 + Math.sin(i * Math.PI) * 0.3, D.lerp(1.5, 1.95, i));
  }
}
let pe = !1;
new IntersectionObserver((e) => pe = e[0].isIntersecting).observe(m);
let $ = 0;
G.addEventListener("pointermove", (e) => {
  if (e.pointerType === "mouse") {
    const t = G.getBoundingClientRect();
    $ = (e.clientX - t.left) / t.width * 0.3 - 0.15;
  }
});
G.addEventListener("pointerleave", () => $ = 0);
function be() {
  const e = m.clientWidth, t = e < 700 ? 340 : m.clientHeight;
  A.setSize(e, t, !1), I.aspect = e / t;
  const o = e < 700;
  I.position.set(8, o ? 7 : 6.2, o ? 14 : 10), I.lookAt(o ? new P(0, 0.7, 0) : new P(-1.8, 0.8, 0)), I.updateProjectionMatrix();
}
new ResizeObserver(be).observe(m);
be();
const me = matchMedia("(prefers-reduced-motion: reduce)");
let X = 0;
function ge(e) {
  if (requestAnimationFrame(ge), !pe || document.hidden || e - X < 33) return;
  const t = Math.min((e - X) / 1e3, 0.05);
  X = e;
  const o = !me.matches && !document.body.classList.contains("motion-paused");
  z.rotation.y = D.lerp(z.rotation.y, o ? $ : 0, 0.07), o && W.forEach((r, s) => r.rotation.z = Math.sin(e * 8e-4 + s) * 0.015);
  const n = v ? 1 : 0;
  C = o ? D.lerp(C, n, 0.06) : n, ce.forEach(({ interior: r, node: s }) => {
    r.scale.setScalar(Math.max(1e-3, 1 - C)), r.visible = C < 0.99, s.scale.setScalar(Math.max(0.01, C));
  }), le.forEach((r) => r.material.opacity = C * 0.85), de.forEach(({ packet: r, curve: s, index: a }) => {
    r.visible = v, r.position.copy(s.getPoint(o ? (e * 18e-5 + a * 0.2) % 1 : 0.5));
  });
  for (const r of ["neighbours", "office"]) We(r, t, o);
  p.hidden = B, A.render(F, I);
}
requestAnimationFrame(ge);
