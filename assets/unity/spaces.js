import { m as D, b as F, x as I, s as j, t as H, i as W, y as N, D as U, n as X, J as z, G as M, M as A, X as J, $ as K, a0 as V, a1 as _, c as G, _ as $, o as Q } from "./three.module.js";
const p = document.querySelector("#spaces-canvas"), h = p.parentElement, m = new D();
m.background = new F("#d5e5ea");
const u = new I(35, 1, 0.1, 80);
let f;
try {
  f = new j({ canvas: p, antialias: !0, alpha: !1, powerPreference: "low-power" });
} catch (t) {
  throw h.classList.add("space-fallback"), t;
}
f.setPixelRatio(Math.min(devicePixelRatio, 1.6));
f.outputColorSpace = H;
f.toneMapping = W;
m.add(new N(15792895, 6913672, 2.6));
const R = new U(16772049, 3.2);
R.position.set(-4, 9, 5);
m.add(R);
const y = {};
function E(t) {
  return y[t] ?? (y[t] = new Q({ color: t, roughness: 0.65 }));
}
const Y = new X(1, 1, 1), Z = new z(1, 16, 12);
function s(t, e, n, r, c, o, a, i) {
  const d = new A(Y, E(i));
  return d.position.set(e, n, r), d.scale.set(c, o, a), t.add(d), d;
}
function L(t, e, n, r, c, o) {
  const a = new A(Z, E(o));
  return a.position.set(e, n, r), a.scale.setScalar(c), t.add(a), a;
}
function l(t, e, n, r, c = {}) {
  const o = new M();
  o.position.set(e, 0, n), t.add(o);
  const a = c.wheelchair, i = a ? 0.57 : 0.68;
  s(o, 0, i, 0, 0.3, 0.48, 0.23, r), L(o, 0, i + 0.4, 0, 0.17, c.skin || "#b88967"), L(o, 0, i + 0.49, -0.015, 0.155, c.elder ? "#d8d5ca" : "#303538"), s(o, -0.1, a ? 0.25 : 0.22, a ? 0.15 : 0, 0.12, 0.44, 0.13, "#243c50"), s(o, 0.1, a ? 0.25 : 0.22, a ? 0.15 : 0, 0.12, 0.44, 0.13, "#243c50"), s(o, -0.23, i - 0.08, 0.04, 0.11, 0.4, 0.12, r);
  const d = s(o, 0.23, i + 0.02, 0.1, 0.11, 0.4, 0.12, r);
  if (d.rotation.x = -0.65, a) {
    for (const k of [-0.27, 0.27]) {
      const v = new A(new J(0.27, 0.035, 8, 24), E("#284353"));
      v.rotation.y = Math.PI / 2, v.position.set(k, 0.28, 0), o.add(v), s(o, k, 0.28, 0, 0.035, 0.48, 0.035, "#9dafb2");
    }
    s(o, 0, 0.43, 0, 0.48, 0.07, 0.44, "#426b7c"), s(o, 0, 0.65, -0.18, 0.48, 0.48, 0.06, "#426b7c");
  }
  return c.bag && s(o, 0.32, 0.43, 0.19, 0.23, 0.27, 0.18, "#d0ac76"), o.userData.arm = d, o;
}
function x(t, e, n, r, c) {
  const o = document.createElement("canvas");
  o.width = 512, o.height = 128;
  const a = o.getContext("2d");
  a.fillStyle = "#f9fcff", a.beginPath(), a.roundRect(0, 0, 512, 110, 24), a.fill(), a.fillStyle = "#183d50", a.font = "600 30px sans-serif", a.textAlign = "center", a.fillText(c, 256, 68);
  const i = new K(o), d = new V(new _({ map: i, transparent: !0, depthTest: !1 }));
  return d.position.set(e, n, r), d.scale.set(2.2, 0.55, 1), t.add(d), d;
}
function S(t, e, n, r, c, o) {
  s(t, e, c / 2, n, r, c, 1.3, o), s(t, e, c + 0.05, n, r + 0.15, 0.1, 1.45, "#edf3ef");
  for (let a = 0.65; a < c - 0.2; a += 0.65) for (let i = -r / 2 + 0.3; i < r / 2; i += 0.55)
    s(t, e + i, a, n + 0.66, 0.32, 0.4, 0.025, "#386a80"), s(t, e + i, a - 0.23, n + 0.74, 0.4, 0.04, 0.17, "#e4ebdf");
}
const b = new M();
m.add(b);
const T = {}, g = [], w = [];
for (const t of ["neighbours", "school", "office"]) {
  const e = new M();
  if (T[t] = e, b.add(e), e.visible = t === "neighbours", s(e, 0, -0.16, 0, 8, 0.3, 5, "#b9ccd1"), s(e, 0, 0.015, 0.8, 7.8, 0.03, 2.6, "#e4e6da"), t === "neighbours")
    S(e, -1.5, -1.25, 2.5, 4.1, "#9ab8c6"), S(e, 1.45, -1.4, 2.4, 3.5, "#7798ab"), g.push(l(e, -0.7, 0.8, "#438197", { bag: !0 }), l(e, 0.7, 1, "#ccb68c", { elder: !0 }), l(e, 1.8, 1.2, "#7f9e88", { wheelchair: !0 })), w.push(x(e, 0.2, 2, 1, "Need a hand with those?"));
  else if (t === "school") {
    S(e, 0, -1.3, 6, 2, "#c4b995"), s(e, 0, 0.85, -0.56, 1.1, 1.7, 0.1, "#557b89"), s(e, 0, 2.05, -0.45, 2, 0.35, 0.1, "#315c71");
    for (let n = 0; n < 3; n++)
      s(e, -2 + n * 2, 0.38, 0.5, 1.2, 0.08, 0.5, "#cbab78"), s(e, -2 + n * 2, 0.18, 0.5, 0.1, 0.36, 0.4, "#647c7e");
    g.push(l(e, -1.6, 1.2, "#7e9d91"), l(e, -0.6, 1, "#cdb184"), l(e, 1.25, 0.9, "#598799")), w.push(x(e, 0, 2.8, 0, "Found: a school backpack")), s(e, -1.8, 0.65, 0.5, 0.26, 0.35, 0.2, "#4c708c");
  } else {
    s(e, 0, 1.4, -1.6, 7, 2.8, 0.15, "#9eb7c1");
    for (let n = -3; n < 4; n++)
      s(e, n, 1.6, -1.48, 0.87, 2, 0.04, "#6990a6"), s(e, n + 0.47, 1.6, -1.45, 0.04, 2.3, 0.08, "#d7e2df");
    for (const n of [-1.5, 1.5])
      s(e, n, 0.72, 0, 1.8, 0.12, 1, "#d1ba94"), s(e, n, 0.33, 0, 0.15, 0.66, 0.5, "#617985"), s(e, n, 0.99, -0.1, 0.55, 0.4, 0.05, "#2b4b61"), s(e, n, 0.77, 0.1, 0.6, 0.03, 0.4, "#748a93");
    g.push(l(e, -1.2, 1, "#4f8395", { bag: !0 }), l(e, 0.3, 0.9, "#b8a17b"), l(e, 1.6, 0.9, "#607e75")), w.push(x(e, 0.3, 2.4, 0.7, "Lunch drive. Count me in!"));
  }
}
const ee = { neighbours: ["AT HOME", "A small favour. A familiar face.", "A neighbour brings groceries. Another joins the conversation. Everyday support can include older and disabled neighbours, too."], school: ["ON CAMPUS", "Less searching. More belonging.", "A lost backpack, a school announcement, a parent offering a hand. Give useful conversations a place of their own."], office: ["AT WORK", "Colleagues become a community.", "Coordinate a donation drive, find shared support and bring people together beyond their desks."] };
document.querySelectorAll("[data-space]").forEach((t) => t.addEventListener("click", () => {
  Object.entries(T).forEach(([n, r]) => r.visible = n === t.dataset.space), document.querySelectorAll("[data-space]").forEach((n) => n.setAttribute("aria-pressed", String(n === t)));
  const e = ee[t.dataset.space];
  ["space-label", "space-title", "space-copy"].forEach((n, r) => document.getElementById(n).textContent = e[r]), b.rotation.y = -0.12;
}));
let O = !1;
new IntersectionObserver((t) => O = t[0].isIntersecting).observe(h);
let C = 0;
p.addEventListener("pointermove", (t) => {
  if (t.pointerType === "mouse") {
    const e = p.getBoundingClientRect();
    C = (t.clientX - e.left) / e.width * 0.3 - 0.15;
  }
});
p.addEventListener("pointerleave", () => C = 0);
function q() {
  const t = h.clientWidth, e = t < 700 ? 340 : h.clientHeight;
  f.setSize(t, e, !1), u.aspect = t / e;
  const n = t < 700;
  u.position.set(8, n ? 7 : 6.2, n ? 14 : 10), u.lookAt(n ? new G(0, 0.7, 0) : new G(-1.8, 0.8, 0)), u.updateProjectionMatrix();
}
new ResizeObserver(q).observe(h);
q();
const te = matchMedia("(prefers-reduced-motion: reduce)");
let P = 0;
function B(t) {
  if (requestAnimationFrame(B), !O || document.hidden || t - P < 33) return;
  P = t;
  const e = !te.matches && !document.body.classList.contains("motion-paused");
  b.rotation.y = $.lerp(b.rotation.y, e ? C : 0, 0.07), e && (g.forEach((n, r) => n.userData.arm.rotation.x = -0.65 + Math.sin(t * 1e-3 + r) * 0.14), w.forEach((n, r) => n.rotation.z = Math.sin(t * 8e-4 + r) * 0.015)), f.render(m, u);
}
requestAnimationFrame(B);
