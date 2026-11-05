import { m as xe, b as Ee, x as Ce, s as Me, t as de, i as ke, y as Te, D as Ae, n as Le, J as qe, G as C, M, T as ie, X as Pe, $ as Ie, a0 as Be, a1 as Re, Y as Oe, c as O, Z as De, d as Ge, _ as T, o as Fe, E as ze } from "./three.module.js";
const z = document.querySelector("#spaces-canvas"), y = z.parentElement, L = new xe();
L.background = new Ee("#d5e5ea");
const B = new Ce(35, 1, 0.1, 80);
let q;
try {
  q = new Me({ canvas: z, antialias: !0, alpha: !1, powerPreference: "low-power" });
} catch (e) {
  throw y.classList.add("space-fallback"), e;
}
q.setPixelRatio(Math.min(devicePixelRatio, 1.6));
q.outputColorSpace = de;
q.toneMapping = ke;
L.add(new Te(15792895, 6913672, 2.6));
const oe = new Ae(16772049, 3.2);
oe.position.set(-4, 9, 5);
L.add(oe);
const U = {};
function A(e) {
  return U[e] ?? (U[e] = new Fe({ color: e, roughness: 0.65 }));
}
const He = new Le(1, 1, 1), Ne = new qe(1, 16, 12);
function c(e, t, n, o, r, s, a, l) {
  const i = new M(He, A(l));
  return i.position.set(t, n, o), i.scale.set(r, s, a), e.add(i), i;
}
function D(e, t, n, o, r, s) {
  const a = new M(Ne, A(s));
  return a.position.set(t, n, o), a.scale.setScalar(r), e.add(a), a;
}
function X(e, t, n, o, r, s, a) {
  const l = new M(new ze(r, r, s, 16), A(a));
  return l.position.set(t, n, o), e.add(l), l;
}
function v(e, t, n, o, r = {}) {
  const s = new C();
  s.position.set(t, 0, n), e.add(s);
  const a = !!r.wheelchair, l = r.skin || "#b88967", i = a ? 0.46 : 0.5, d = new M(new ie(0.14, 0.22, 5, 12), A(o));
  d.position.y = i + 0.22, d.scale.z = 0.8, s.add(d), D(s, 0, i + 0.62, 0, 0.16, l);
  const u = D(s, 0, i + 0.71, -0.02, 0.145, r.elder ? "#d8d5ca" : "#303538");
  u.scale.y *= 0.65;
  function h(g, I, ae, Se) {
    const N = new C();
    N.position.set(g, I, 0), s.add(N);
    const re = new M(new ie(0.055, ae - 0.11, 4, 8), A(Se));
    return re.position.y = -ae / 2, N.add(re), N;
  }
  const f = [h(-0.095, i, 0.46, "#243c50"), h(0.095, i, 0.46, "#243c50")], w = [h(-0.21, i + 0.36, 0.37, o), h(0.21, i + 0.36, 0.37, o)];
  if (w.forEach((g) => D(g, 0, -0.38, 0, 0.058, l)), f.forEach((g) => c(g, 0, -0.43, 0.045, 0.13, 0.08, 0.22, "#314959")), a) {
    f.forEach((g) => g.rotation.x = -0.4);
    for (const g of [-0.29, 0.29]) {
      const I = new M(new Pe(0.27, 0.035, 8, 24), A("#284353"));
      I.rotation.y = Math.PI / 2, I.position.set(g, 0.28, 0), s.add(I), c(s, g, 0.28, 0, 0.035, 0.48, 0.035, "#9dafb2");
    }
    c(s, 0, 0.43, 0, 0.48, 0.07, 0.44, "#426b7c"), c(s, 0, 0.65, -0.18, 0.48, 0.48, 0.06, "#426b7c");
  }
  let se;
  return r.bag && (se = c(w[1], 0, -0.48, 0.03, 0.23, 0.27, 0.18, "#d0ac76")), s.userData = { arm: w[1], arms: w, legs: f, seated: a, bag: se }, s;
}
function x(e, t, n, o, r) {
  const s = document.createElement("canvas");
  s.width = 512, s.height = 128;
  const a = s.getContext("2d");
  a.fillStyle = "#f9fcff", a.beginPath(), a.roundRect(0, 0, 512, 110, 24), a.fill(), a.fillStyle = "#183d50", a.font = r.length < 12 ? "600 54px sans-serif" : "600 30px sans-serif", a.textAlign = "center", a.fillText(r, 256, 68);
  const l = new Ie(s);
  l.colorSpace = de;
  const i = new Be(new Re({ map: l, transparent: !0, depthTest: !1, toneMapped: !1 }));
  return i.position.set(t, n, o), i.scale.set(2.2, 0.55, 1), e.add(i), i;
}
function ce(e, t, n, o, r, s) {
  c(e, t, r / 2, n, o, r, 1.3, s), c(e, t, r + 0.05, n, o + 0.15, 0.1, 1.45, "#edf3ef");
  for (let a = 0.65; a < r - 0.2; a += 0.65) for (let l = -o / 2 + 0.3; l < o / 2; l += 0.55)
    c(e, t + l, a, n + 0.66, 0.32, 0.4, 0.025, "#386a80"), c(e, t + l, a - 0.23, n + 0.74, 0.4, 0.04, 0.17, "#e4ebdf");
}
const ue = [], he = [], fe = [];
let k = 0, S = !1, R = !1;
function We(e) {
  const t = new C();
  e.add(t), X(t, 0, 0.15, 0, 0.65, 0.3, "#376d85"), X(t, 0, 0.37, 0, 0.42, 0.15, "#79d2e8"), D(t, 0, 0.7, 0, 0.22, "#e5f9ff"), x(t, 0, 1.35, 0, "BEACON"), [[-2.4, -1.25], [2.4, -1.25], [-2.4, 1.45], [2.4, 1.45]].forEach(([n, o], r) => {
    const s = new C();
    s.position.set(n, 0, o), e.add(s), c(s, 0, 0.09, 0, 1.8, 0.18, 1.6, "#edf0e3");
    const a = new C();
    s.add(a), c(a, 0, 0.65, -0.75, 1.8, 1.15, 0.09, "#93b1bd"), c(a, -0.86, 0.65, 0, 0.09, 1.15, 1.6, "#abc4cb"), c(a, 0, 0.73, -0.68, 1, 0.48, 0.03, "#2a5665");
    for (const f of [-0.4, 0.4])
      c(a, f, 0.5, 0.1, 0.5, 0.07, 0.38, "#cab18b"), c(a, f, 0.29, 0.1, 0.05, 0.4, 0.18, "#687e85"), v(a, f, 0.48, ["#578999", "#9cad8c", "#bd9f80", "#648195"][r]).scale.setScalar(0.48);
    const l = X(s, 0, 0.22, 0, 0.52, 0.16, "#4e9bb7");
    l.scale.setScalar(0.01), x(s, 0, 1.55, 0, "Class " + (r + 1)).scale.set(1.4, 0.35, 1), ue.push({ room: s, interior: a, node: l, x: n, z: o });
    const d = new Oe(new O(n, 0.25, o), new O(n * 0.5, 0.9, o * 0.5), new O(0, 0.45, 0)), u = new M(new De(d, 32, 0.025, 6, !1), new Ge({ color: "#368dac", transparent: !0, opacity: 0 }));
    e.add(u), he.push(u);
    const h = D(e, n, 0.25, o, 0.075, "#e8fbff");
    h.visible = !1, fe.push({ packet: h, curve: d, index: r });
  });
}
const H = new C();
L.add(H);
const m = {}, V = [], J = [], E = {}, K = {};
let G = "neighbours";
const b = { neighbours: !1, office: !1 };
for (const e of ["neighbours", "school", "office"]) {
  const t = new C();
  if (m[e] = t, H.add(t), t.visible = e === "neighbours", c(t, 0, -0.16, 0, 8, 0.3, 5, "#b9ccd1"), c(t, 0, 0.015, 0.8, 7.8, 0.03, 2.6, "#e4e6da"), e === "neighbours")
    ce(t, -1.5, -1.25, 2.5, 4.1, "#9ab8c6"), ce(t, 1.45, -1.4, 2.4, 3.5, "#7798ab"), V.push(v(t, -0.7, 0.8, "#438197"), v(t, 0.7, 1, "#ccb68c", { elder: !0 }), v(t, 1.8, 1.2, "#7f9e88", { wheelchair: !0 })), J.push(x(t, 0.2, 2, 1, "Need a hand with those?"));
  else if (e === "school")
    We(t);
  else {
    c(t, 0, 1.4, -1.6, 7, 2.8, 0.15, "#9eb7c1");
    for (let n = -3; n < 4; n++)
      c(t, n, 1.6, -1.48, 0.87, 2, 0.04, "#6990a6"), c(t, n + 0.47, 1.6, -1.45, 0.04, 2.3, 0.08, "#d7e2df");
    for (const n of [-1.5, 1.5])
      c(t, n, 0.72, 0, 1.8, 0.12, 1, "#d1ba94"), c(t, n, 0.33, 0, 0.15, 0.66, 0.5, "#617985"), c(t, n, 0.99, -0.1, 0.55, 0.4, 0.05, "#2b4b61"), c(t, n, 0.77, 0.1, 0.6, 0.03, 0.4, "#748a93");
    V.push(v(t, -1.2, 1, "#4f8395", { bag: !0 }), v(t, 0.3, 0.9, "#b8a17b"), v(t, 1.6, 0.9, "#607e75")), J.push(x(t, 0.3, 2.4, 0.7, "Lunch drive. Count me in!"));
  }
}
V.push(v(m.neighbours, 2.8, 1.8, "#496e92", { bag: !0, skin: "#89654e" }));
for (const e of ["neighbours", "office"])
  E[e] = V.filter((t) => t.parent === m[e]), E[e].forEach((t) => t.userData.start = t.position.clone()), K[e] = J.find((t) => t.parent === m[e]);
const je = c(E.neighbours[1].userData.arms[1], 0, -0.34, 0.08, 0.1, 0.17, 0.025, "#2a6883"), pe = c(m.office, 0, 0.3, 1.95, 0.65, 0.6, 0.5, "#c6a77a");
pe.visible = !0;
const Q = c(m.office, 0, 0.8, 1.95, 0.23, 0.27, 0.18, "#d0ac76");
Q.visible = !1;
const Z = x(m.neighbours, 0.7, 2.1, 1, "Can someone come with me?");
Z.visible = !1;
const _ = x(m.office, 0, 2.1, 1, "Join the food drive");
_.visible = !1;
const $ = x(m.neighbours, 0.7, 2.1, 1, "Thank you, neighbour!");
$.visible = !1;
const be = x(m.office, 0.3, 2.4, 0.7, "Together for the food drive");
be.visible = !1;
const me = { neighbours: ["AT HOME", "An appointment. Someone by your side.", "An older neighbour needs a lift and company for a hospital appointment. A request on Beacon connects them with someone nearby, while another neighbour helps a wheelchair user with groceries."], school: ["SCHOOL CONCEPT", "Every classroom. One connected school.", "Imagine each classroom as a node in Beacon: coordinate announcements, classroom requests and shared resources from one school hub. Lost and found and parent support stay part of the same community."], office: ["AT WORK", "Colleagues become a community.", "Coordinate a donation drive, find shared support and bring people together beyond their desks."] };
["space-label", "space-title", "space-copy"].forEach((e, t) => document.getElementById(e).textContent = me.neighbours[t]);
document.querySelectorAll("[data-space]").forEach((e) => e.addEventListener("click", () => {
  Object.entries(m).forEach(([n, o]) => o.visible = n === e.dataset.space), document.querySelectorAll("[data-space]").forEach((n) => n.setAttribute("aria-pressed", String(n === e)));
  const t = me[e.dataset.space];
  ["space-label", "space-title", "space-copy"].forEach((n, o) => document.getElementById(n).textContent = t[o]), H.rotation.y = -0.12, G = e.dataset.space, R = G === "school", document.querySelectorAll("[data-scenario-controls]").forEach((n) => n.hidden = n.dataset.scenarioControls !== G), P.hidden = !R, y.classList.toggle("school-active", R), document.querySelector(".space-example").textContent = R ? "Classroom management concept, not an available product feature." : "Illustrative scenarios, not live activity.";
}));
const P = document.createElement("div");
P.className = "school-controls";
P.hidden = !0;
P.innerHTML = '<button id="connect-classrooms" aria-pressed="false">Connect the classrooms</button><button id="school-announcement" disabled>Preview school announcement</button><p id="school-status" role="status">Four classrooms, each with its own community.</p>';
y.after(P);
document.getElementById("connect-classrooms").addEventListener("click", (e) => {
  S = !S, e.currentTarget.setAttribute("aria-pressed", String(S)), e.currentTarget.textContent = S ? "Show the classrooms" : "Connect the classrooms", document.getElementById("school-announcement").disabled = !S, document.getElementById("school-status").textContent = S ? "Four class nodes connected to one Beacon school hub." : "Four classrooms, each with its own community.";
});
document.getElementById("school-announcement").addEventListener("click", () => {
  document.getElementById("school-status").textContent = "Preview: one announcement reaches all four classrooms. Library book drive on Thursday.";
});
const F = { neighbours: 0, office: 0 }, ee = { neighbours: -1, office: -1 }, le = { neighbours: [["A request for company", "I have a hospital appointment tomorrow, but no one to go with. Could a neighbour offer a lift and come along?"], ["A neighbour replies", "I can help. Let us arrange a time and meet at the entrance."], ["Meeting at the entrance", "The helper walks over and stops beside the older neighbour. Another neighbour brings groceries to the wheelchair user."], ["On their way, together", "They walk together to the agreed pickup point for the appointment."]], office: [["A team invitation", "Thursday food drive: bring a contribution to the collection point."], ["Colleagues join in", "The team agrees where to meet and what to bring."], ["Contributions arrive", "Colleagues walk around the desks and stop beside the collection point."], ["One team effort", "A contribution is placed at the collection point, ready for the drive."]] }, p = document.createElement("div");
p.className = "scene-story";
p.setAttribute("aria-live", "polite");
p.innerHTML = '<span class="eyebrow">ILLUSTRATIVE STORY</span><strong></strong><p></p><div class="story-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
y.append(p);
function te(e, t) {
  ee[e] === t && p.dataset.storySpace === e || (ee[e] = t, p.dataset.storySpace = e, p.querySelector("strong").textContent = le[e][t][0], p.querySelector("p").textContent = le[e][t][1], p.querySelectorAll("i").forEach((n, o) => n.classList.toggle("active", o <= t)));
}
for (const e of ["neighbours", "office"]) {
  let o = function() {
    innerWidth < 700 && y.scrollIntoView({ block: "start", behavior: j.matches ? "instant" : "smooth" });
  };
  const t = document.createElement("div");
  t.className = "school-controls scenario-controls", t.dataset.scenarioControls = e, t.hidden = e !== "neighbours", t.innerHTML = '<button data-scenario-action="' + e + '">Play animation</button><button data-scenario-preview="' + e + '">Next moment</button><button data-story-pause="' + e + '" hidden>Pause animation</button><p>Request, reply, meet and help. Play to watch the full sequence.</p>';
  const n = t.querySelector("[data-scenario-action]");
  n.setAttribute("aria-pressed", "false"), n.addEventListener("click", () => {
    F[e] = 0, b[e] = !0, n.setAttribute("aria-pressed", "true"), n.textContent = "Restart animation", t.querySelector("[data-story-pause]").hidden = !1, t.querySelector("[data-story-pause]").textContent = "Pause animation", te(e, 0), o();
  }), t.querySelector("[data-scenario-preview]").addEventListener("click", () => {
    b[e] = !j.matches;
    const r = (Math.max(0, ee[e]) + 1) % 4;
    F[e] = (j.matches ? [0, 1.5, 7, 14] : [0, 1.5, 3, 8])[r], te(e, r);
    const s = t.querySelector("[data-story-pause]");
    s.hidden = !b[e], s.textContent = "Pause animation", o();
  }), t.querySelector("[data-story-pause]").addEventListener("click", (r) => {
    b[e] = !b[e], r.currentTarget.textContent = b[e] ? "Pause animation" : "Resume animation";
  }), P.after(t);
}
function Ve(e, t, n, o, r = 1) {
  e.position.set(t, Math.sin(o * 2) * 0.018 * r, n), !e.userData.seated && (e.userData.legs.forEach((s, a) => s.rotation.x = Math.sin(o + a * Math.PI) * 0.38 * r), e.userData.arms.forEach((s, a) => s.rotation.x = -Math.sin(o + a * Math.PI) * 0.25 * r));
}
function W(e) {
  return e = T.clamp(e, 0, 1), e * e * (3 - 2 * e);
}
function Je(e, t, n) {
  b[e] && e === G && (F[e] = Math.min(14, F[e] + t));
  const o = F[e], r = o < 1.5 ? 0 : o < 3 ? 1 : o < 8 ? 2 : 3;
  e === G && (p.hidden = !1, te(e, r), p.dataset.playbackTime = o.toFixed(2), p.style.setProperty("--playback", o / 14)), o >= 14 && b[e] && (b[e] = !1, document.querySelector("[data-scenario-action=" + e + "]").textContent = "Replay animation", document.querySelector("[data-story-pause=" + e + "]").hidden = !0);
  const s = W((o - 3) / 4), a = W((o - 8) / 6), l = o > 3 && o < 7 || e === "neighbours" && o > 8 && o < 14;
  if (E[e].forEach((i, d) => {
    const u = i.userData.start;
    let h = u.x, f = u.z;
    e === "neighbours" ? (d === 0 && (h = u.x + 0.6 * s - 2 * a, f = u.z + 0.2 * s + 0.6 * a), d === 1 && (h = u.x - 2 * a, f = u.z + 0.6 * a), d === 3 && (h = u.x - 0.15 * s, f = u.z - 0.6 * s)) : (d === 0 && (h = u.x + 0.25 * s, f = u.z + 0.5 * s), d === 1 && (h = u.x - 0.3 * s, f = u.z - 0.1 * s), d === 2 && (h = u.x - 0.6 * s, f = u.z + 0.6 * s));
    const w = l && (e === "office" || d === 0 || d === 3 && o < 7 || d === 1 && o > 8);
    Ve(i, h, f, o * 8, w ? 1 : 0), i.rotation.y = w && e === "neighbours" ? o > 8 ? -1.28 : d === 0 ? 1.25 : -2.9 : 0;
  }), K[e] && (K[e].visible = !1), e === "neighbours")
    Z.visible = o < 3 && b[e], Z.position.set(T.lerp(0.7, -0.7, W((o - 1) / 2)), 2.1 + Math.sin(o * 3) * 0.08, 1), je.visible = o < 3, E.neighbours[1].userData.arms[1].rotation.x = o < 3 ? -1.15 + Math.sin(o * 4) * 0.12 : E.neighbours[1].userData.arms[1].rotation.x, $.visible = o >= 7, $.position.set(-0.2 - 2 * a, 2, 1);
  else {
    _.visible = o < 3 && b[e], _.position.y = 2.1 + Math.sin(o * 3) * 0.1, be.visible = o >= 8, pe.visible = !0;
    const i = W((o - 8) / 3), d = E.office[0];
    d.userData.bag && (d.userData.bag.visible = i === 0), Q.visible = i > 0, Q.position.set(T.lerp(-0.75, 0, i), 0.76 + Math.sin(i * Math.PI) * 0.3, T.lerp(1.5, 1.95, i));
  }
}
let ge = !1;
new IntersectionObserver((e) => ge = e[0].isIntersecting).observe(y);
let ne = 0;
z.addEventListener("pointermove", (e) => {
  if (e.pointerType === "mouse") {
    const t = z.getBoundingClientRect();
    ne = (e.clientX - t.left) / t.width * 0.3 - 0.15;
  }
});
z.addEventListener("pointerleave", () => ne = 0);
function ye() {
  const e = y.clientWidth, t = e < 700 ? 340 : y.clientHeight;
  q.setSize(e, t, !1), B.aspect = e / t;
  const n = e < 700;
  B.position.set(8, n ? 7 : 6.2, n ? 14 : 10), B.lookAt(n ? new O(0, 0.7, 0) : new O(-1.8, 0.8, 0)), B.updateProjectionMatrix();
}
new ResizeObserver(ye).observe(y);
ye();
const j = matchMedia("(prefers-reduced-motion: reduce)");
let Y = 0;
function we(e) {
  if (requestAnimationFrame(we), !ge || document.hidden || e - Y < 33) return;
  const t = Math.min((e - Y) / 1e3, 0.2);
  Y = e;
  const n = !j.matches && !document.body.classList.contains("motion-paused");
  H.rotation.y = T.lerp(H.rotation.y, n ? ne : 0, 0.07), n && J.forEach((r, s) => r.rotation.z = Math.sin(e * 8e-4 + s) * 0.015);
  const o = S ? 1 : 0;
  k = n ? T.lerp(k, o, 0.06) : o, ue.forEach(({ interior: r, node: s }) => {
    r.scale.setScalar(Math.max(1e-3, 1 - k)), r.visible = k < 0.99, s.scale.setScalar(Math.max(0.01, k));
  }), he.forEach((r) => r.material.opacity = k * 0.85), fe.forEach(({ packet: r, curve: s, index: a }) => {
    r.visible = S, r.position.copy(s.getPoint(n ? (e * 18e-5 + a * 0.2) % 1 : 0.5));
  });
  for (const r of ["neighbours", "office"]) Je(r, t);
  p.hidden = R, q.render(L, B);
}
requestAnimationFrame(we);
function ve() {
  const e = document.documentElement.dataset.theme === "dark";
  L.background.set(e ? "#102b3e" : "#d5e5ea"), oe.intensity = e ? 2.1 : 3.2;
}
new MutationObserver(ve).observe(document.documentElement, { attributes: !0, attributeFilter: ["data-theme"] });
ve();
