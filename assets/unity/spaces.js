import { m as xe, b as Ce, x as Me, s as ke, t as he, i as Te, y as Ae, D as Le, n as qe, J as Pe, G as M, M as k, T as le, X as Ie, $ as Be, a0 as Re, a1 as Oe, Y as De, c as D, Z as Ge, d as Fe, _ as A, o as ze, E as He } from "./three.module.js";
const N = document.querySelector("#spaces-canvas"), y = N.parentElement;
let E = !0;
document.querySelector(".community-spaces").addEventListener("click", () => E = !0);
new MutationObserver(() => E = !0).observe(document.body, { attributes: !0, attributeFilter: ["class"] });
const q = new xe();
q.background = new Ce("#d5e5ea");
const R = new Me(35, 1, 0.1, 80);
let P;
try {
  P = new ke({ canvas: N, antialias: innerWidth >= 700, alpha: !1, powerPreference: "low-power" });
} catch (e) {
  throw y.classList.add("space-fallback"), e;
}
P.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.6));
P.outputColorSpace = he;
P.toneMapping = Te;
q.add(new Ae(15792895, 6913672, 2.6));
const se = new Le(16772049, 3.2);
se.position.set(-4, 9, 5);
q.add(se);
const X = {};
function L(e) {
  return X[e] ?? (X[e] = new ze({ color: e, roughness: 0.65 }));
}
const Ne = new qe(1, 1, 1), We = new Pe(1, 16, 12);
function c(e, t, n, o, r, s, a, l) {
  const i = new k(Ne, L(l));
  return i.position.set(t, n, o), i.scale.set(r, s, a), e.add(i), i;
}
function G(e, t, n, o, r, s) {
  const a = new k(We, L(s));
  return a.position.set(t, n, o), a.scale.setScalar(r), e.add(a), a;
}
function Y(e, t, n, o, r, s, a) {
  const l = new k(new He(r, r, s, 16), L(a));
  return l.position.set(t, n, o), e.add(l), l;
}
function w(e, t, n, o, r = {}) {
  const s = new M();
  s.position.set(t, 0, n), e.add(s);
  const a = !!r.wheelchair, l = r.skin || "#b88967", i = a ? 0.46 : 0.5, d = new k(new le(0.14, 0.22, 5, 12), L(o));
  d.position.y = i + 0.22, d.scale.z = 0.8, s.add(d), G(s, 0, i + 0.62, 0, 0.16, l);
  const u = G(s, 0, i + 0.71, -0.02, 0.145, r.elder ? "#d8d5ca" : "#303538");
  u.scale.y *= 0.65;
  function h(g, B, ie, Ee) {
    const j = new M();
    j.position.set(g, B, 0), s.add(j);
    const ce = new k(new le(0.055, ie - 0.11, 4, 8), L(Ee));
    return ce.position.y = -ie / 2, j.add(ce), j;
  }
  const f = [h(-0.095, i, 0.46, "#243c50"), h(0.095, i, 0.46, "#243c50")], v = [h(-0.21, i + 0.36, 0.37, o), h(0.21, i + 0.36, 0.37, o)];
  if (v.forEach((g) => G(g, 0, -0.38, 0, 0.058, l)), f.forEach((g) => c(g, 0, -0.43, 0.045, 0.13, 0.08, 0.22, "#314959")), a) {
    f.forEach((g) => g.rotation.x = -0.4);
    for (const g of [-0.29, 0.29]) {
      const B = new k(new Ie(0.27, 0.035, 8, 24), L("#284353"));
      B.rotation.y = Math.PI / 2, B.position.set(g, 0.28, 0), s.add(B), c(s, g, 0.28, 0, 0.035, 0.48, 0.035, "#9dafb2");
    }
    c(s, 0, 0.43, 0, 0.48, 0.07, 0.44, "#426b7c"), c(s, 0, 0.65, -0.18, 0.48, 0.48, 0.06, "#426b7c");
  }
  let re;
  return r.bag && (re = c(v[1], 0, -0.48, 0.03, 0.23, 0.27, 0.18, "#d0ac76")), s.userData = { arm: v[1], arms: v, legs: f, seated: a, bag: re }, s;
}
function x(e, t, n, o, r) {
  const s = document.createElement("canvas");
  s.width = 512, s.height = 128;
  const a = s.getContext("2d");
  a.fillStyle = "#f9fcff", a.beginPath(), a.roundRect(0, 0, 512, 110, 24), a.fill(), a.fillStyle = "#183d50", a.font = r.length < 12 ? "600 54px sans-serif" : "600 30px sans-serif", a.textAlign = "center", a.fillText(r, 256, 68);
  const l = new Be(s);
  l.colorSpace = he;
  const i = new Re(new Oe({ map: l, transparent: !0, depthTest: !1, toneMapped: !1 }));
  return i.position.set(t, n, o), i.scale.set(2.2, 0.55, 1), e.add(i), i;
}
function de(e, t, n, o, r, s) {
  c(e, t, r / 2, n, o, r, 1.3, s), c(e, t, r + 0.05, n, o + 0.15, 0.1, 1.45, "#edf3ef");
  for (let a = 0.65; a < r - 0.2; a += 0.65) for (let l = -o / 2 + 0.3; l < o / 2; l += 0.55)
    c(e, t + l, a, n + 0.66, 0.32, 0.4, 0.025, "#386a80"), c(e, t + l, a - 0.23, n + 0.74, 0.4, 0.04, 0.17, "#e4ebdf");
}
const fe = [], pe = [], be = [];
let T = 0, S = !1, O = !1;
function je(e) {
  const t = new M();
  e.add(t), Y(t, 0, 0.15, 0, 0.65, 0.3, "#376d85"), Y(t, 0, 0.37, 0, 0.42, 0.15, "#79d2e8"), G(t, 0, 0.7, 0, 0.22, "#e5f9ff"), x(t, 0, 1.35, 0, "BEACON"), [[-2.4, -1.25], [2.4, -1.25], [-2.4, 1.45], [2.4, 1.45]].forEach(([n, o], r) => {
    const s = new M();
    s.position.set(n, 0, o), e.add(s), c(s, 0, 0.09, 0, 1.8, 0.18, 1.6, "#edf0e3");
    const a = new M();
    s.add(a), c(a, 0, 0.65, -0.75, 1.8, 1.15, 0.09, "#93b1bd"), c(a, -0.86, 0.65, 0, 0.09, 1.15, 1.6, "#abc4cb"), c(a, 0, 0.73, -0.68, 1, 0.48, 0.03, "#2a5665");
    for (const f of [-0.4, 0.4])
      c(a, f, 0.5, 0.1, 0.5, 0.07, 0.38, "#cab18b"), c(a, f, 0.29, 0.1, 0.05, 0.4, 0.18, "#687e85"), w(a, f, 0.48, ["#578999", "#9cad8c", "#bd9f80", "#648195"][r]).scale.setScalar(0.48);
    const l = Y(s, 0, 0.22, 0, 0.52, 0.16, "#4e9bb7");
    l.scale.setScalar(0.01), x(s, 0, 1.55, 0, "Class " + (r + 1)).scale.set(1.4, 0.35, 1), fe.push({ room: s, interior: a, node: l, x: n, z: o });
    const d = new De(new D(n, 0.25, o), new D(n * 0.5, 0.9, o * 0.5), new D(0, 0.45, 0)), u = new k(new Ge(d, 32, 0.025, 6, !1), new Fe({ color: "#368dac", transparent: !0, opacity: 0 }));
    e.add(u), pe.push(u);
    const h = G(e, n, 0.25, o, 0.075, "#e8fbff");
    h.visible = !1, be.push({ packet: h, curve: d, index: r });
  });
}
const W = new M();
q.add(W);
const m = {}, J = [], U = [], C = {}, Q = {};
let F = "neighbours";
const p = { neighbours: !1, office: !1 };
for (const e of ["neighbours", "school", "office"]) {
  const t = new M();
  if (m[e] = t, W.add(t), t.visible = e === "neighbours", c(t, 0, -0.16, 0, 8, 0.3, 5, "#b9ccd1"), c(t, 0, 0.015, 0.8, 7.8, 0.03, 2.6, "#e4e6da"), e === "neighbours")
    de(t, -1.5, -1.25, 2.5, 4.1, "#9ab8c6"), de(t, 1.45, -1.4, 2.4, 3.5, "#7798ab"), J.push(w(t, -0.7, 0.8, "#438197"), w(t, 0.7, 1, "#ccb68c", { elder: !0 }), w(t, 1.8, 1.2, "#7f9e88", { wheelchair: !0 })), U.push(x(t, 0.2, 2, 1, "Need a hand with those?"));
  else if (e === "school")
    je(t);
  else {
    c(t, 0, 1.4, -1.6, 7, 2.8, 0.15, "#9eb7c1");
    for (let n = -3; n < 4; n++)
      c(t, n, 1.6, -1.48, 0.87, 2, 0.04, "#6990a6"), c(t, n + 0.47, 1.6, -1.45, 0.04, 2.3, 0.08, "#d7e2df");
    for (const n of [-1.5, 1.5])
      c(t, n, 0.72, 0, 1.8, 0.12, 1, "#d1ba94"), c(t, n, 0.33, 0, 0.15, 0.66, 0.5, "#617985"), c(t, n, 0.99, -0.1, 0.55, 0.4, 0.05, "#2b4b61"), c(t, n, 0.77, 0.1, 0.6, 0.03, 0.4, "#748a93");
    J.push(w(t, -1.2, 1, "#4f8395", { bag: !0 }), w(t, 0.3, 0.9, "#b8a17b"), w(t, 1.6, 0.9, "#607e75")), U.push(x(t, 0.3, 2.4, 0.7, "Lunch drive. Count me in!"));
  }
}
J.push(w(m.neighbours, 2.8, 1.8, "#496e92", { bag: !0, skin: "#89654e" }));
for (const e of ["neighbours", "office"])
  C[e] = J.filter((t) => t.parent === m[e]), C[e].forEach((t) => t.userData.start = t.position.clone()), Q[e] = U.find((t) => t.parent === m[e]);
const Ve = c(C.neighbours[1].userData.arms[1], 0, -0.34, 0.08, 0.1, 0.17, 0.025, "#2a6883"), me = c(m.office, 0, 0.3, 1.95, 0.65, 0.6, 0.5, "#c6a77a");
me.visible = !0;
const Z = c(m.office, 0, 0.8, 1.95, 0.23, 0.27, 0.18, "#d0ac76");
Z.visible = !1;
const _ = x(m.neighbours, 0.7, 2.1, 1, "Can someone come with me?");
_.visible = !1;
const $ = x(m.office, 0, 2.1, 1, "Join the food drive");
$.visible = !1;
const ee = x(m.neighbours, 0.7, 2.1, 1, "Thank you, neighbour!");
ee.visible = !1;
const ge = x(m.office, 0.3, 2.4, 0.7, "Together for the food drive");
ge.visible = !1;
const ye = { neighbours: ["AT HOME", "An appointment. Someone by your side.", "An older neighbour needs a lift and company for a hospital appointment. A request on Beacon connects them with someone nearby, while another neighbour helps a wheelchair user with groceries."], school: ["SCHOOL CONCEPT", "Every classroom. One connected school.", "Imagine each classroom as a node in Beacon: coordinate announcements, classroom requests and shared resources from one school hub. Lost and found and parent support stay part of the same community."], office: ["AT WORK", "Colleagues become a community.", "Coordinate a donation drive, find shared support and bring people together beyond their desks."] };
["space-label", "space-title", "space-copy"].forEach((e, t) => document.getElementById(e).textContent = ye.neighbours[t]);
document.querySelectorAll("[data-space]").forEach((e) => e.addEventListener("click", () => {
  Object.entries(m).forEach(([n, o]) => o.visible = n === e.dataset.space), document.querySelectorAll("[data-space]").forEach((n) => n.setAttribute("aria-pressed", String(n === e)));
  const t = ye[e.dataset.space];
  ["space-label", "space-title", "space-copy"].forEach((n, o) => document.getElementById(n).textContent = t[o]), W.rotation.y = -0.12, F = e.dataset.space, O = F === "school", document.querySelectorAll("[data-scenario-controls]").forEach((n) => n.hidden = n.dataset.scenarioControls !== F), I.hidden = !O, y.classList.toggle("school-active", O), document.querySelector(".space-example").textContent = O ? "Classroom management concept, not an available product feature." : "Illustrative scenarios, not live activity.";
}));
const I = document.createElement("div");
I.className = "school-controls";
I.hidden = !0;
I.innerHTML = '<button id="connect-classrooms" aria-pressed="false">Connect the classrooms</button><button id="school-announcement" disabled>Preview school announcement</button><p id="school-status" role="status">Four classrooms, each with its own community.</p>';
y.after(I);
document.getElementById("connect-classrooms").addEventListener("click", (e) => {
  S = !S, e.currentTarget.setAttribute("aria-pressed", String(S)), e.currentTarget.textContent = S ? "Show the classrooms" : "Connect the classrooms", document.getElementById("school-announcement").disabled = !S, document.getElementById("school-status").textContent = S ? "Four class nodes connected to one Beacon school hub." : "Four classrooms, each with its own community.";
});
document.getElementById("school-announcement").addEventListener("click", () => {
  document.getElementById("school-status").textContent = "Preview: one announcement reaches all four classrooms. Library book drive on Thursday.";
});
const z = { neighbours: 0, office: 0 }, te = { neighbours: -1, office: -1 }, ue = { neighbours: [["A request for company", "I have a hospital appointment tomorrow, but no one to go with. Could a neighbour offer a lift and come along?"], ["A neighbour replies", "I can help. Let us arrange a time and meet at the entrance."], ["Meeting at the entrance", "The helper walks over and stops beside the older neighbour. Another neighbour brings groceries to the wheelchair user."], ["On their way, together", "They walk together to the agreed pickup point for the appointment."]], office: [["A team invitation", "Thursday food drive: bring a contribution to the collection point."], ["Colleagues join in", "The team agrees where to meet and what to bring."], ["Contributions arrive", "Colleagues walk around the desks and stop beside the collection point."], ["One team effort", "A contribution is placed at the collection point, ready for the drive."]] }, b = document.createElement("div");
b.className = "scene-story";
b.setAttribute("aria-live", "polite");
b.innerHTML = '<span class="eyebrow">ILLUSTRATIVE STORY</span><strong></strong><p></p><div class="story-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
y.append(b);
function oe(e, t) {
  te[e] === t && b.dataset.storySpace === e || (te[e] = t, b.dataset.storySpace = e, b.querySelector("strong").textContent = ue[e][t][0], b.querySelector("p").textContent = ue[e][t][1], b.querySelectorAll("i").forEach((n, o) => n.classList.toggle("active", o <= t)));
}
for (const e of ["neighbours", "office"]) {
  let o = function() {
    innerWidth < 700 && y.scrollIntoView({ block: "start", behavior: H.matches ? "instant" : "smooth" });
  };
  const t = document.createElement("div");
  t.className = "school-controls scenario-controls", t.dataset.scenarioControls = e, t.hidden = e !== "neighbours", t.innerHTML = '<button data-scenario-action="' + e + '">Play animation</button><button data-scenario-preview="' + e + '">Next moment</button><button data-story-pause="' + e + '" hidden>Pause animation</button><p>Request, reply, meet and help. Play to watch the full sequence.</p>';
  const n = t.querySelector("[data-scenario-action]");
  n.setAttribute("aria-pressed", "false"), n.addEventListener("click", () => {
    z[e] = 0, p[e] = !0, n.setAttribute("aria-pressed", "true"), n.textContent = "Restart animation", t.querySelector("[data-story-pause]").hidden = !1, t.querySelector("[data-story-pause]").textContent = "Pause animation", oe(e, 0), o();
  }), t.querySelector("[data-scenario-preview]").addEventListener("click", () => {
    p[e] = !H.matches;
    const r = (Math.max(0, te[e]) + 1) % 4;
    z[e] = (H.matches ? [0, 1.5, 7, 14] : [0, 1.5, 3, 8])[r], oe(e, r);
    const s = t.querySelector("[data-story-pause]");
    s.hidden = !p[e], s.textContent = "Pause animation", o();
  }), t.querySelector("[data-story-pause]").addEventListener("click", (r) => {
    p[e] = !p[e], r.currentTarget.textContent = p[e] ? "Pause animation" : "Resume animation";
  }), I.after(t);
}
function Je(e, t, n, o, r = 1) {
  e.position.set(t, Math.sin(o * 2) * 0.018 * r, n), !e.userData.seated && (e.userData.legs.forEach((s, a) => s.rotation.x = Math.sin(o + a * Math.PI) * 0.38 * r), e.userData.arms.forEach((s, a) => s.rotation.x = -Math.sin(o + a * Math.PI) * 0.25 * r));
}
function V(e) {
  return e = A.clamp(e, 0, 1), e * e * (3 - 2 * e);
}
function Ue(e, t, n) {
  p[e] && e === F && (z[e] = Math.min(14, z[e] + t));
  const o = z[e], r = o < 1.5 ? 0 : o < 3 ? 1 : o < 8 ? 2 : 3;
  e === F && (b.hidden = !1, oe(e, r), b.dataset.playbackTime = o.toFixed(2), b.style.setProperty("--playback", o / 14)), o >= 14 && p[e] && (p[e] = !1, document.querySelector("[data-scenario-action=" + e + "]").textContent = "Replay animation", document.querySelector("[data-story-pause=" + e + "]").hidden = !0);
  const s = V((o - 3) / 4), a = V((o - 8) / 6), l = o > 3 && o < 7 || e === "neighbours" && o > 8 && o < 14;
  if (C[e].forEach((i, d) => {
    const u = i.userData.start;
    let h = u.x, f = u.z;
    e === "neighbours" ? (d === 0 && (h = u.x + 0.6 * s - 2 * a, f = u.z + 0.2 * s + 0.6 * a), d === 1 && (h = u.x - 2 * a, f = u.z + 0.6 * a), d === 3 && (h = u.x - 0.15 * s, f = u.z - 0.6 * s)) : (d === 0 && (h = u.x + 0.25 * s, f = u.z + 0.5 * s), d === 1 && (h = u.x - 0.3 * s, f = u.z - 0.1 * s), d === 2 && (h = u.x - 0.6 * s, f = u.z + 0.6 * s));
    const v = l && (e === "office" || d === 0 || d === 3 && o < 7 || d === 1 && o > 8);
    Je(i, h, f, o * 8, v ? 1 : 0), i.rotation.y = v && e === "neighbours" ? o > 8 ? -1.28 : d === 0 ? 1.25 : -2.9 : 0;
  }), Q[e] && (Q[e].visible = !1), e === "neighbours")
    _.visible = o < 3 && p[e], _.position.set(A.lerp(0.7, -0.7, V((o - 1) / 2)), 2.1 + Math.sin(o * 3) * 0.08, 1), Ve.visible = o < 3, C.neighbours[1].userData.arms[1].rotation.x = o < 3 ? -1.15 + Math.sin(o * 4) * 0.12 : C.neighbours[1].userData.arms[1].rotation.x, ee.visible = o >= 7, ee.position.set(-0.2 - 2 * a, 2, 1);
  else {
    $.visible = o < 3 && p[e], $.position.y = 2.1 + Math.sin(o * 3) * 0.1, ge.visible = o >= 8, me.visible = !0;
    const i = V((o - 8) / 3), d = C.office[0];
    d.userData.bag && (d.userData.bag.visible = i === 0), Z.visible = i > 0, Z.position.set(A.lerp(-0.75, 0, i), 0.76 + Math.sin(i * Math.PI) * 0.3, A.lerp(1.5, 1.95, i));
  }
}
let ne = !1;
new IntersectionObserver((e) => {
  ne = e[0].isIntersecting, ne && (E = !0);
}).observe(y);
let ae = 0;
N.addEventListener("pointermove", (e) => {
  if (e.pointerType === "mouse") {
    const t = N.getBoundingClientRect();
    ae = (e.clientX - t.left) / t.width * 0.3 - 0.15;
  }
});
N.addEventListener("pointerleave", () => ae = 0);
function ve() {
  E = !0;
  const e = y.clientWidth, t = e < 700 ? 340 : y.clientHeight;
  P.setSize(e, t, !1), R.aspect = e / t;
  const n = e < 700;
  R.position.set(8, n ? 7 : 6.2, n ? 14 : 10), R.lookAt(n ? new D(0, 0.7, 0) : new D(-1.8, 0.8, 0)), R.updateProjectionMatrix();
}
new ResizeObserver(ve).observe(y);
ve();
const H = matchMedia("(prefers-reduced-motion: reduce)");
let K = 0;
function we(e) {
  if (requestAnimationFrame(we), !ne || document.hidden || e - K < 33) return;
  const t = Math.min((e - K) / 1e3, 0.2);
  K = e;
  const n = !H.matches && !document.body.classList.contains("motion-paused");
  if (!n && !p.neighbours && !p.office && !E) return;
  E = !1, W.rotation.y = A.lerp(W.rotation.y, n ? ae : 0, 0.07), n && U.forEach((r, s) => r.rotation.z = Math.sin(e * 8e-4 + s) * 0.015);
  const o = S ? 1 : 0;
  T = n ? A.lerp(T, o, 0.06) : o, fe.forEach(({ interior: r, node: s }) => {
    r.scale.setScalar(Math.max(1e-3, 1 - T)), r.visible = T < 0.99, s.scale.setScalar(Math.max(0.01, T));
  }), pe.forEach((r) => r.material.opacity = T * 0.85), be.forEach(({ packet: r, curve: s, index: a }) => {
    r.visible = S, r.position.copy(s.getPoint(n ? (e * 18e-5 + a * 0.2) % 1 : 0.5));
  });
  for (const r of ["neighbours", "office"]) Ue(r, t);
  b.hidden = O, P.render(q, R);
}
requestAnimationFrame(we);
function Se() {
  E = !0;
  const e = document.documentElement.dataset.theme === "dark";
  q.background.set(e ? "#102b3e" : "#d5e5ea"), se.intensity = e ? 2.1 : 3.2;
}
new MutationObserver(Se).observe(document.documentElement, { attributes: !0, attributeFilter: ["data-theme"] });
Se();
H.addEventListener("change", () => E = !0);
