(function() {
  const e = matchMedia("(max-width: 700px)").matches, n = matchMedia("(prefers-reduced-motion: reduce)");
  window._bavPaused = n.matches;
  const a = e ? 0.68 : 1, i = Math.round(64 * a), s = Math.round(84 * a), L = 0.36, x = 0.967, q = 0.76, H = 0.52, F = 0.68, R = 1.8, M = 28;
  let h = window.innerWidth - 148, u = window.innerHeight * 0.32, r = -1.2, y = 0, p = "idle", l = "", m = !1, v = 0, k = 0, S = [], X = null, Ke = 0, z = !1, K = !1, Je = null, ue = performance.now(), J = 0, C = 0, W = 0, Z = 0;
  const d = document.getElementById("bav-wrap"), b = document.getElementById("bav-anim"), Me = document.getElementById("bav-svg"), Ze = document.getElementById("bav-bubble"), Bt = document.getElementById("bav-msg"), et = document.getElementById("bav-shadow"), Ae = document.getElementById("bav-el"), Te = document.getElementById("bav-er"), It = document.getElementById("bav-mth"), Yt = document.getElementById("bav-leg-l"), qt = document.getElementById("bav-leg-r");
  d.style.width = i + "px", b.style.width = i + "px", b.style.height = s + "px", Me.style.width = "100%", Me.style.height = "100%";
  const me = document.querySelector("#beacon-hide"), se = document.querySelector(".beacon-dock");
  let _ = "tucked", P = 0, Q = 0, tt = performance.now(), re = null, Ce = null;
  d.classList.add("beacon-tucked");
  function Se(t) {
    me.textContent = t ? "−" : "+", me.setAttribute("aria-label", t ? "Hide Beacon mascot" : "Show Beacon mascot"), me.setAttribute("aria-expanded", String(t)), d.tabIndex = t ? 0 : -1;
  }
  Se(!1);
  function Ft() {
    const t = se.getBoundingClientRect();
    h = Math.min(innerWidth - i - 10, t.left + t.width / 2 - i / 2), u = t.top - s - 10, d.style.left = h + "px", d.style.top = u + "px", d.style.opacity = String(P), d.style.translate = `0 ${(1 - P) * (s + 14)}px`, d.style.scale = String(0.45 + 0.55 * P), d.style.pointerEvents = P > 0.35 ? "auto" : "none", d.style.clipPath = `inset(0 0 ${(1 - P) * 100}% 0)`;
  }
  function _t() {
    _ = "shown", d.classList.remove("beacon-tucked");
    for (const t of ["opacity", "translate", "scale", "pointerEvents", "clipPath"]) d.style[t] = "";
    r = 0, y = 0, A("happy"), Se(!0);
  }
  document.addEventListener("pointermove", (t) => {
    if (_ !== "tucked" || t.pointerType === "touch") return;
    const o = se.getBoundingClientRect(), f = Math.hypot(Math.max(o.left - t.clientX, 0, t.clientX - o.right), Math.max(o.top - t.clientY, 0, t.clientY - o.bottom)), g = performance.now(), T = re ? Math.hypot(t.clientX - re.x, t.clientY - re.y) / Math.max(1, g - re.t) : 0;
    re = { x: t.clientX, y: t.clientY, t: g }, Q = Math.max(0, Math.min(1, (210 - f) / 170)), d.dataset.approachSpeed = String(Math.min(2, T));
  }, { passive: !0 }), se.addEventListener("focusin", () => {
    _ === "tucked" && (Q = 1);
  }), window.__bavTogglePresence = () => {
    if (_ === "hiding") return;
    if (_ !== "shown") {
      document.body.classList.remove("beacon-hidden"), _ = "tucked", Q = 1, d.classList.add("beacon-tucked");
      return;
    }
    _ = "hiding", Se(!1);
    const t = me.getBoundingClientRect(), o = d.getBoundingClientRect();
    se.classList.add("beacon-recalling"), Ce = d.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${t.left + t.width / 2 - o.left - o.width / 2}px,${t.top + t.height / 2 - o.top - o.height / 2}px) rotate(12deg) scale(.04)`, opacity: 0 }
    ], { duration: n.matches ? 0 : 380, easing: "cubic-bezier(.5,0,.75,.4)", fill: "forwards" }), Ce.onfinish = () => {
      _ = "hidden", P = 0, Q = 0, document.body.classList.add("beacon-hidden"), Ce.cancel(), se.classList.remove("beacon-recalling");
    };
  };
  function Be(t) {
    Yt.classList.toggle("swinging", t), qt.classList.toggle("swinging", t);
  }
  function Ie() {
    if (window._bavPaused && !m) return;
    const t = document.querySelector(".beacon-dock")?.getBoundingClientRect();
    t && h + i > t.left - 12 && h < t.right + 12 && u + s > t.top - 14 && (u = t.top - s - 14), d.style.left = h + "px", d.style.top = u + "px";
  }
  function B(t, o) {
    clearTimeout(Je), Bt.textContent = t, Ze.classList.add("on"), Je = setTimeout(() => Ze.classList.remove("on"), o || 3e3);
  }
  setTimeout(() => {
    B("Hi! I'm Beacon! 👋", 4e3), setTimeout(() => B("Your community guardian ✨", 3200), 4700), setTimeout(() => B("Double-click (or double-tap) me to chat! 💬", 3600), 8200);
  }, 1400);
  const nt = [
    "🛡️ Keeping UAE safe!",
    "🤝 Community first!",
    "🇦🇪 Proud to serve!",
    "✨ Beacon of Unity",
    "💪 Together we rise",
    "🌟 Verified & trusted"
  ];
  setInterval(() => {
    (p === "idle" || p === "sitting") && Math.random() < 0.28 && B(nt[Math.floor(Math.random() * nt.length)], 2800);
  }, 11e3);
  const Ye = {
    happy: "M22 52 Q32 59 42 52",
    surprised: "M24 53 Q32 58 40 53",
    sitting: "M23 52 Q32 57 41 52",
    flying: "M24 52 Q32 58 40 52"
  };
  function A(t) {
    It.setAttribute("d", Ye[t] || Ye.happy), d.dataset.expression = t in Ye ? t : "happy", t === "surprised" && [Ae, Te].forEach((o) => {
      o.style.transform = "scale(1.3)", setTimeout(() => o.style.transform = "scale(1)", 550);
    });
  }
  A("happy");
  function qe() {
    K || n.matches || [Ae, Te].forEach((t) => {
      t.style.transform = "scaleY(0.06)", setTimeout(() => t.style.transform = "scaleY(1)", 110);
    });
  }
  function at() {
    clearTimeout(ot);
    const t = 2600 + Math.random() * 2800;
    ot = setTimeout(() => {
      qe(), Math.random() < 0.22 && setTimeout(qe, 300), at();
    }, t);
  }
  let ot;
  setTimeout(() => {
    qe(), at();
  }, 1800 + Math.random() * 1200);
  function ee() {
    K || n.matches || (K = !0, b.style.animation = "none", b.offsetHeight, b.style.animation = "bav-squish .46s cubic-bezier(.36,.07,.19,.97) forwards", A("surprised"), setTimeout(() => {
      K = !1, b.style.animation = "", it(), A(p === "sitting" ? "sitting" : "happy");
    }, 460));
  }
  function it() {
    if (!(K || n.matches))
      switch (p) {
        case "idle":
          b.style.animation = "bav-idle 3.4s ease-in-out infinite";
          break;
        case "walking":
          b.style.animation = "bav-walk 0.46s ease-in-out infinite";
          break;
        case "sitting":
          b.style.animation = "bav-sit  2.9s ease-in-out infinite";
          break;
        case "flying":
          b.style.animation = "";
          break;
      }
  }
  let st = [];
  function he() {
    st = Array.from(document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,p,.ftitle,.stitle,.ctat,.nname,.pct,.ft,.tname,.rpt,figcaption,dt,dd"
    )).map((t) => ({ el: t, r: t.getBoundingClientRect() })).filter(({ r: t, el: o }) => t.width > 120 && t.height > 20 && t.bottom > 0 && t.top < window.innerHeight && !o.closest("#bav-chat,dialog,.beacon-dock,#bav-root") && o.textContent.trim().length > 8);
  }
  he(), setInterval(he, 700);
  let Fe = !1;
  window.addEventListener("scroll", () => {
    Fe || (Fe = !0, requestAnimationFrame(() => {
      Fe = !1, he();
    }));
  }, { passive: !0 }), window.addEventListener("resize", he, { passive: !0 });
  function Pt() {
    if (m) return null;
    const t = u + s, o = h + i * 0.5;
    for (const { el: f, r: g } of st)
      if (Math.abs(t - g.top) < 28 && o > g.left + 10 && o < g.right - 10 && g.top > 55)
        return { el: f, snapY: g.top - s };
    return null;
  }
  const te = ["Oof! 😅", "Wheee! 🌀", "Boing! 🎯", "Hey! 😄", "Woo! 💫"], pe = ["Whoa! 😲", "Wee! 🚀", "Flying! 🌟", "Catch me! 😄"], rt = ["Nice read! 📖", "Interesting! 🤔", "Love this! ✨", "Reading... 👀"];
  function fe(t) {
    if (_ !== "shown") {
      const ce = Math.min(50, t - tt);
      if (tt = t, ue = t, _ === "tucked") {
        const ne = Number(d.dataset.approachSpeed || 0);
        P = n.matches ? Q : P + (Q - P) * (1 - Math.exp(-ce / (160 - ne * 35))), Ft(), P > 0.985 && Q === 1 && _t();
      }
      requestAnimationFrame(fe);
      return;
    }
    if (window._bavPaused || document.hidden || document.body.classList.contains("beacon-hidden") || document.body.classList.contains("beacon-chat-open") || document.querySelector("dialog[open]")) {
      ue = t, requestAnimationFrame(fe);
      return;
    }
    const o = t - ue;
    ue = t;
    const f = Math.min(o / 16.67, 3), g = window.innerWidth, T = document.querySelector(".beacon-dock")?.getBoundingClientRect(), D = T && h + i > T.left - 12 && h < T.right + 12 ? T.top - 14 : window.innerHeight - 12;
    if (h = Math.max(0, Math.min(g - i, h)), u = Math.max(75, Math.min(D - s, u)), !m) {
      if (p === "sitting" && X) {
        const E = X.getBoundingClientRect(), N = E.top > 55 && E.top < D + 20, le = h + i * 0.5, de = le > E.left - 10 && le < E.right + 10;
        if (N && de)
          u = E.top - s + 12, y = 0, r *= q;
        else {
          X = null, p = "flying", Be(!1), y = -1.5;
          const O = ["Here I come!", "A little hop!", "Off we go!", "Wheee!"];
          B(O[Math.floor(Math.random() * O.length)], 1500);
        }
      } else {
        const E = Pt();
        if (E && Math.abs(y) < 7)
          (p !== "sitting" || X !== E.el) && (X = E.el, Ke = E.snapY, p = "sitting", y = 0, r *= 0.35, u = Ke, ee(), A("sitting"), Be(!0), (Math.abs(r) > 1.2 || Math.abs(y) > 2) && B(rt[Math.floor(Math.random() * rt.length)], 2400));
        else {
          y = Math.min(y + L * f, M), r *= Math.pow(x, f), h += r * f, u += y * f, h < 0 && (h = 0, Math.abs(r) > R ? (r = Math.abs(r) * F, ee(), Math.random() < 0.4 && B(te[Math.floor(Math.random() * te.length)], 1500)) : r = 0, z = !1), h + i > g && (h = g - i, Math.abs(r) > R ? (r = -Math.abs(r) * F, ee(), Math.random() < 0.4 && B(te[Math.floor(Math.random() * te.length)], 1500)) : r = 0, z = !0), u + s > D && (u = D - s, Math.abs(y) > R ? (y = -Math.abs(y) * H, r *= q, ee(), Math.random() < 0.28 && B(te[Math.floor(Math.random() * te.length)], 1500)) : (y = 0, r *= q, p !== "sitting" && (p = Math.abs(r) > 1.1 ? "walking" : "idle"))), u < 0 && (u = 0, y = Math.abs(y) * H);
          const N = Math.sqrt(r * r + y * y);
          p !== "sitting" && (N > 3.5 ? p = "flying" : Math.abs(r) > 1 && u + s >= D - 2 ? p = "walking" : N < 0.7 && (p = "idle"));
        }
      }
      if (r < -0.3 && (z = !0), r > 0.3 && (z = !1), p === "flying") {
        const E = Math.max(-30, Math.min(30, r * 2.8));
        J += (E - J) * 0.18 * f, C += (0 - C) * 0.12 * f, b.style.transform = `rotate(${(J + C).toFixed(2)}deg)`;
      } else {
        J *= 0.8, C += (0 - C) * 0.14 * f;
        const E = J + C;
        Math.abs(E) < 0.2 ? (J = 0, C = 0, b.style.transform = "") : b.style.transform = `rotate(${E.toFixed(2)}deg)`;
      }
      Me.style.transform = `scaleX(${z ? -1 : 1})`;
      const ce = Math.max(0, D - (u + s)), ne = Math.max(0.15, 1 - ce / D);
      et.style.width = 38 * ne + "px", et.style.opacity = (0.72 * ne).toString(), p !== l && !K && (it(), A(p === "sitting" ? "sitting" : p === "flying" ? "flying" : "happy"), l = p);
    }
    Ie(), requestAnimationFrame(fe);
  }
  d.style.left = h + "px", d.style.top = u + "px", requestAnimationFrame(fe), d.addEventListener("mouseenter", () => document.body.classList.add("hov")), d.addEventListener("mouseleave", () => document.body.classList.remove("hov")), d.addEventListener("mousedown", (t) => {
    t.button === 0 && (t.preventDefault(), m = !0, v = t.clientX - h, k = t.clientY - u, Z = t.clientX, S = [{ x: t.clientX, y: t.clientY, t: performance.now() }], r = 0, y = 0, X = null, p = l = "flying", b.style.animation = "", b.style.transform = "", A("surprised"), B(pe[Math.floor(Math.random() * pe.length)], 1e3));
  }), document.addEventListener("mousemove", (t) => {
    if (!m) return;
    const o = t.clientX - Z;
    Z = t.clientX, W = Math.max(-38, Math.min(38, -o * 3.2)), h = t.clientX - v, u = t.clientY - k, S.push({ x: t.clientX, y: t.clientY, t: performance.now() }), S.length > 10 && S.shift(), C += (W - C) * 0.28, W *= 0.82, b.style.transform = `rotate(${C.toFixed(1)}deg)`, Ie();
  }), document.addEventListener("mouseup", () => {
    if (!m) return;
    m = !1, W = 0, A("happy");
    const t = performance.now(), o = S.filter((f) => t - f.t < 130);
    if (o.length >= 2) {
      const f = o[0], g = o[o.length - 1], T = Math.max(g.t - f.t, 5) / 16.67;
      r = Math.max(-M, Math.min(M, (g.x - f.x) / T * 0.62)), y = Math.max(-M, Math.min(M, (g.y - f.y) / T * 0.62));
    }
    p = "flying", l = "";
  }), d.addEventListener("dblclick", () => {
    m || (y = -8 - Math.random() * 2, r = (Math.random() - 0.5) * 5, p = "flying", l = "", ee()), window.__bavOpenChat && window.__bavOpenChat();
  });
  let ct = 0;
  if (d.addEventListener("touchstart", (t) => {
    t.preventDefault();
    const o = performance.now(), f = o - ct < 320;
    if (ct = o, f) {
      window.__bavOpenChat && window.__bavOpenChat(), ee();
      return;
    }
    const g = t.touches[0];
    m = !0, v = g.clientX - h, k = g.clientY - u, Z = g.clientX, S = [{ x: g.clientX, y: g.clientY, t: performance.now() }], r = 0, y = 0, X = null, Be(!1), p = l = "flying", b.style.animation = "", A("surprised"), B(pe[Math.floor(Math.random() * pe.length)], 1e3);
  }, { passive: !1 }), document.addEventListener("touchmove", (t) => {
    if (!m) return;
    t.preventDefault();
    const o = t.touches[0], f = o.clientX - Z;
    Z = o.clientX, W = Math.max(-38, Math.min(38, -f * 3.2)), h = o.clientX - v, u = o.clientY - k, S.push({ x: o.clientX, y: o.clientY, t: performance.now() }), S.length > 10 && S.shift(), C += (W - C) * 0.28, W *= 0.82, b.style.transform = `rotate(${C.toFixed(1)}deg)`, Ie();
  }, { passive: !1 }), document.addEventListener("touchend", () => {
    if (!m) return;
    m = !1, A("happy"), W = 0;
    const t = performance.now(), o = S.filter((f) => t - f.t < 130);
    if (o.length >= 2) {
      const f = o[0], g = o[o.length - 1], T = Math.max(g.t - f.t, 5) / 16.67;
      r = Math.max(-M, Math.min(M, (g.x - f.x) / T * 0.62)), y = Math.max(-M, Math.min(M, (g.y - f.y) / T * 0.62));
    }
    p = "flying", l = "";
  }), !matchMedia("(hover: none)").matches) {
    let N = function() {
      if (m || document.hidden) {
        requestAnimationFrame(N);
        return;
      }
      const _e = document.getElementById("bav-svg").getBoundingClientRect(), lt = _e.width / 64, Ht = z ? -1 : 1;
      [
        { base: ce, pupil: f, iris: g },
        { base: ne, pupil: T, iris: D }
      ].forEach(({ base: G, pupil: dt, iris: ut }) => {
        const Rt = _e.left + (z ? 64 - G.x : G.x) * lt, Xt = _e.top + G.y * lt, Pe = t - Rt, He = o - Xt, Re = Math.sqrt(Pe * Pe + He * He) || 1, mt = Math.min(Re / 55, 1) * E, ht = Pe / Re * mt * Ht, pt = He / Re * mt;
        dt.setAttribute("cx", (G.x + ht).toFixed(2)), dt.setAttribute("cy", (G.y + pt).toFixed(2)), ut.setAttribute("cx", (G.x + ht * 0.55).toFixed(2)), ut.setAttribute("cy", (G.y + pt * 0.55).toFixed(2));
      }), requestAnimationFrame(N);
    };
    var Vt = N;
    let t = window.innerWidth / 2, o = window.innerHeight / 2;
    document.addEventListener("mousemove", (O) => {
      t = O.clientX, o = O.clientY;
    });
    const f = document.getElementById("bav-pupil-l"), g = document.getElementById("bav-iris-l"), T = document.getElementById("bav-pupil-r"), D = document.getElementById("bav-iris-r"), ce = { x: 23, y: 38 }, ne = { x: 41, y: 38 }, E = 2.6;
    N();
    let le = null, de = !1;
    d.addEventListener("mousedown", () => {
      de = !1, le = setTimeout(() => {
        m && !de && (de = !0, B("🥰 Squeezing me!", 1800), [Ae, Te].forEach((O) => {
          O.style.transform = "scale(1.22)", setTimeout(() => O.style.transform = "scale(1)", 700);
        }));
      }, 1200);
    }), document.addEventListener("mouseup", () => clearTimeout(le));
  }
  window.addEventListener("resize", () => {
    h = Math.max(0, Math.min(innerWidth - i, h)), u = Math.max(75, Math.min(innerHeight - s - 12, u)), d.style.left = h + "px", d.style.top = u + "px";
  }), d.addEventListener("bav-teleport", (t) => {
    h = t.detail.x, u = t.detail.y, r = 0, y = 0, p = "idle", l = "", A("happy"), X = null;
  }), d.addEventListener("bav-restore", () => {
    r = (Math.random() - 0.5) * 4, y = -3, p = "flying", l = "", X = null, b.style.transform = "", A("happy");
  });
})();
(function() {
  const e = document.getElementById("bav-chat"), n = document.getElementById("bav-chat-body"), a = document.getElementById("bav-chat-form"), i = document.getElementById("bav-chat-input"), s = document.getElementById("bav-chat-close"), L = document.getElementById("bav-chat-badge"), x = document.getElementById("bav-chat-hint");
  if (x && window.innerWidth <= 768 && (x.textContent = "Double-tap to chat"), !e) return;
  e.inert = !0, [L, x].forEach((l) => {
    if (!l) return;
    ["mousedown", "touchstart"].forEach((v) => l.addEventListener(v, (k) => k.stopPropagation())), l.addEventListener("dblclick", (v) => {
      v.stopPropagation(), window.__bavOpenChat && window.__bavOpenChat();
    });
    let m = 0;
    l.addEventListener("touchend", (v) => {
      v.stopPropagation();
      const k = performance.now();
      k - m < 320 && window.__bavOpenChat && window.__bavOpenChat(), m = k;
    });
  });
  let q = !1, H = !1;
  function F(l, m) {
    const v = document.createElement("div");
    return v.className = "bav-msg " + m, m === "user" ? v.textContent = l : v.innerHTML = l, n.appendChild(v), n.scrollTop = n.scrollHeight, v;
  }
  function R(l) {
    const m = document.createElement("div");
    m.className = "bav-quick", l.forEach((v) => {
      const k = document.createElement("button");
      k.type = "button", k.textContent = v, k.addEventListener("click", () => {
        i.value = v, r();
      }), m.appendChild(k);
    }), n.appendChild(m), n.scrollTop = n.scrollHeight;
  }
  function M(l) {
    const m = document.createElement("div");
    m.className = "bav-typing", m.innerHTML = "<span></span><span></span><span></span>", n.appendChild(m), n.scrollTop = n.scrollHeight, setTimeout(() => {
      m.remove(), l();
    }, 500 + Math.random() * 450);
  }
  const h = [
    // Placed BEFORE the Lost & Found entry deliberately: "founder" contains
    // the substring "found", so if the Lost & Found entry (keyed on
    // 'found') were checked first, a question like "who is the founder"
    // would incorrectly match Lost & Found instead. First-match-wins, so
    // order here isn't cosmetic.
    { k: ["founder", "who built", "who made", "who created", "about beacon", "mission", "company"], a: 'Beacon of Unity was built to give UAE residents a single trusted place for help requests, lost & found, volunteering, and reliable local news - all gated behind real Emirates ID verification. You can read more on the <a href="founder.html">About the Founder</a> page, linked in the footer.' },
    { k: ["legit", "scam", "trustworthy", "is this real", "is this safe", "can i trust"], a: `Every member on Beacon of Unity verifies with a live selfie holding their physical Emirates ID - no digital scans accepted, and it's a one-time, permanent step. There are zero anonymous users on the platform. To be upfront: this is our own verification process, not an official UAE government service or database check - it just means every member has shown a real Emirates ID on camera to us. You can see the full flow in the <a href="#trust">Verification System</a> section, and our <a href="privacy.html">Privacy</a> and <a href="terms.html">Terms</a> pages are linked in the footer if you want the full detail.` },
    { k: ["verify", "emirates id", "verification", "id check"], a: `Every member verifies with a live selfie holding their physical Emirates ID - no digital scans accepted. It's a one-time step, then you're in for good. See the <a href="#trust">Verification System</a> section for the full flow.` },
    { k: ["help request", "need help", "ask for help", "groceries"], a: "You can post a Help Request by category (groceries, tech, transport, etc). It shows up to nearby verified neighbours, sorted by distance." },
    { k: ["lost", "found", "keys", "wallet", "phone"], a: "Head to Lost & Found - report an item with a photo and status tag (LOST/FOUND), and a direct 'Contact User' button connects you straight to the other person." },
    { k: ["volunteer", "event", "cleanup", "clean up"], a: "The Volunteer tab lists curated community events - cleanups, food drives, tutoring - sourced from Volunteers.ae, each with a direct registration link." },
    { k: ["news", "article", "khaleej", "gulf news"], a: "Reliable News aggregates trusted stories from Khaleej Times, Gulf News, Al Jazeera and BBC, filterable by source or topic." },
    { k: ["badge", "points", "unity points", "reward", "leaderboard"], a: "Every helpful act earns Unity Points. There are 37 badges to unlock, and points can be redeemed for profile skins on the public leaderboard." },
    { k: ["sign up", "join", "create account", "get started", "register"], a: "You can create your account right from the hero - the 'Join the Movement' button takes you straight to sign-up." },
    { k: ["sign in", "log in", "login"], a: "Use 'Sign In' in the top-right of the navigation bar." },
    { k: ["demo", "try it", "preview"], a: "There's a live interactive demo - look for the 'Try a Demo' button near the top of the page." },
    { k: ["language", "arabic", "hindi"], a: "Beacon of Unity is available in English, Arabic, and Hindi." },
    { k: ["contact", "support", "email"], a: "You'll find a Contact link in the footer at the very bottom of the page." },
    { k: ["profile", "rank", "my account"], a: "Your profile keeps your verified name (permanent once set), volunteer rank, resolved chats, average rating, and badge count all in one place. You can also update your Emirate or live GPS location from there." },
    { k: ["gps", "location", "emirate ", "which emirate", "change my emirate"], a: "You can update your live GPS location or change your Emirate anytime from your profile/dashboard - it's what keeps help requests and lost & found sorted by real proximity to you." },
    { k: ["thank you wall", "appreciation"], a: "The Thank You Wall lets you post public appreciation notes for neighbours who helped you - it sits alongside your resolved chats and rating on your profile." },
    { k: ["report a user", "report someone", "block", "harassment", "unsafe"], a: `Every member is Emirates-ID-verified with no anonymous accounts, which is the platform's main safety layer. For anything specific about reporting or blocking, the <a href="contact.html">Contact</a> page in the footer is the right place to reach out.` },
    { k: ["privacy", "my data", "data safe", "gdpr"], a: `For exactly what's collected and how it's handled, see the <a href="privacy.html">Privacy</a> page linked in the footer.` },
    { k: ["terms", "terms of service", "terms and conditions"], a: `You'll find the full <a href="terms.html">Terms</a> in the footer.` },
    { k: ["credits", "attribution"], a: 'Credits are listed on the <a href="credits.html">Credits</a> page, linked in the footer.' },
    { k: ["cost", "price", "free", "subscription", "paywall"], a: "There's no pricing or subscription mentioned anywhere on the platform - every feature shown (help requests, lost & found, volunteering, news, badges) is just part of the verified community, no paywall in sight." },
    { k: ["mobile app", "ios app", "android app", "app store"], a: "Right now Beacon of Unity is a web platform - everything you see here (help requests, lost & found, volunteering, news) runs in the browser, no separate app download needed." },
    { k: ["who are you", "what are you", "your name"], a: "I'm Beacon - the little guardian who hangs out on this page! Drag me around, throw me, or tap the 'Tap to chat' label any time 😊" }
  ];
  function u(l) {
    const m = l.toLowerCase(), v = h.find((k) => k.k.some((S) => m.includes(S)));
    return v ? v.a : "I'm not totally sure about that one - but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }
  function r() {
    const l = i.value.trim();
    l && (F(l, "user"), i.value = "", M(() => F(u(l), "bot")));
  }
  a.addEventListener("submit", (l) => {
    l.preventDefault(), r();
  }), i.addEventListener("keydown", (l) => {
    l.key === "Enter" && (l.preventDefault(), r());
  });
  function y() {
    H = !0, document.body.classList.add("beacon-chat-open"), e.classList.add("open"), e.setAttribute("aria-hidden", "false"), e.inert = !1, L && L.classList.add("hide"), x && x.classList.add("hide"), q || (q = !0, M(() => {
      F("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", "bot"), R(["How do I verify?", "Post a help request", "Lost & Found", "Volunteer events"]);
    })), setTimeout(() => i.focus(), 250);
  }
  function p() {
    H = !1, document.body.classList.remove("beacon-chat-open"), e.classList.remove("open"), e.setAttribute("aria-hidden", "true"), e.inert = !0, document.getElementById("beacon-chat-button")?.focus();
  }
  window.__bavOpenChat = function() {
    H ? p() : y();
  }, s.addEventListener("click", p), document.addEventListener("keydown", (l) => {
    l.key === "Escape" && H && p();
  });
})();
const bt = document.querySelector(".pillar-gallery"), Dt = [...bt.querySelectorAll(".pillar-card")], wt = matchMedia("(prefers-reduced-motion: reduce)");
let De = !1;
function be() {
  De = !1;
  const e = bt.getBoundingClientRect(), n = !wt.matches && !document.body.classList.contains("motion-paused") && innerWidth > 550, a = Math.max(-1, Math.min(1, (innerHeight / 2 - e.top - e.height / 2) / innerHeight));
  Dt.forEach((i, s) => i.style.setProperty("--offset", n ? `${a * (s % 2 ? -58 : 58)}px` : "0px"));
}
addEventListener("scroll", () => {
  De || (De = !0, requestAnimationFrame(be));
}, { passive: !0 });
addEventListener("resize", be);
wt.addEventListener("change", be);
be();
const Et = matchMedia("(hover: hover) and (pointer: fine)"), kt = matchMedia("(forced-colors: active)"), ze = document.documentElement;
let ae = !0;
try {
  ae = localStorage.getItem("beacon-cursor") !== "standard";
} catch {
}
const w = document.createElement("div");
w.id = "beacon-orbit";
w.setAttribute("aria-hidden", "true");
w.setAttribute("popover", "manual");
w.innerHTML = '<span class="orbit-trail"></span><span class="orbit-shell"><i></i><i></i></span>';
document.body.append(w);
const we = document.createElement("button");
we.id = "cursor-toggle";
const Lt = () => Et.matches && ae && !kt.matches && typeof w.showPopover == "function";
function V() {
  ze.classList.remove("beacon-cursor-ready"), w.classList.remove("visible", "pressed"), Qe();
}
function Ee() {
  ze.classList.toggle("beacon-cursor", Lt()), we.textContent = ae ? "Use standard cursor" : "Use Beacon cursor", V();
}
we.addEventListener("click", () => {
  ae = !ae;
  try {
    localStorage.setItem("beacon-cursor", ae ? "beacon" : "standard");
  } catch {
  }
  Ee();
});
document.querySelector(".menu-bottom")?.append(we);
Et.addEventListener("change", Ee);
kt.addEventListener("change", Ee);
const ge = w.querySelector(".orbit-trail"), Ne = matchMedia("(prefers-reduced-motion: reduce)");
let $ = 0, U = 0, Oe = 0, We = 0, oe = 0, $e = 0, Ue = !1;
function Qe() {
  cancelAnimationFrame(oe), oe = 0, Ue = !1, ge.style.transform = "translate3d(0,0,0)";
}
function xt(e) {
  const n = Math.min(40, e - $e);
  $e = e;
  const a = 1 - Math.exp(-n / 65);
  $ += (Oe - $) * a, U += (We - U) * a;
  const i = $ - Oe, s = U - We;
  ge.style.transform = `translate3d(${i}px,${s}px,0)`, Math.hypot(i, s) > 0.15 ? oe = requestAnimationFrame(xt) : (oe = 0, ge.style.transform = "translate3d(0,0,0)");
}
function Nt(e, n) {
  Oe = e, We = n, (!Ue || Ne.matches) && ($ = e, U = n, Ue = !0);
  const a = Math.hypot($ - e, U - n);
  a > 42 && ($ = e + ($ - e) * 42 / a, U = n + (U - n) * 42 / a), ge.style.transform = `translate3d(${$ - e}px,${U - n}px,0)`, !oe && !Ne.matches && ($e = performance.now(), oe = requestAnimationFrame(xt));
}
Ne.addEventListener("change", Qe);
let ft = null, Ve = null;
function ke(e) {
  if (!Lt() || e.pointerType === "touch") {
    V();
    return;
  }
  const n = e.target instanceof Element ? e.target : null;
  if (!n) {
    V();
    return;
  }
  Ve = { x: e.clientX, y: e.clientY };
  const a = n.closest("#unity-canvas");
  if (n.closest("iframe,select,input,textarea,[contenteditable=true],#bav-wrap,[disabled],[aria-disabled=true],[aria-busy=true]")) {
    w.classList.remove("visible", "pressed"), Qe();
    return;
  }
  const s = n.closest("dialog[open]");
  s !== ft && (w.matches(":popover-open") && w.hidePopover(), ft = s);
  try {
    w.matches(":popover-open") || w.showPopover();
  } catch {
    V();
    return;
  }
  Nt(e.clientX, e.clientY), w.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`, w.classList.add("visible"), w.classList.toggle("world-drag", !!a), ze.classList.add("beacon-cursor-ready"), w.classList.toggle("clickable", !!n.closest("a,button,summary,[role=button],label[for]"));
}
document.addEventListener("pointermove", ke, { passive: !0, capture: !0 });
document.addEventListener("pointerover", ke, { passive: !0, capture: !0 });
document.addEventListener("pointerdown", (e) => {
  ke(e), e.button === 0 && w.classList.add("pressed");
}, { passive: !0 });
window.addEventListener("pointerup", () => w.classList.remove("pressed"), { passive: !0 });
window.addEventListener("pointercancel", V);
window.addEventListener("blur", V);
document.documentElement.addEventListener("pointerleave", V);
document.addEventListener("visibilitychange", () => {
  document.hidden && V();
});
let Xe = 0;
document.addEventListener("scroll", () => {
  !Ve || Xe || (Xe = requestAnimationFrame(() => {
    Xe = 0;
    const { x: e, y: n } = Ve;
    ke({ target: document.elementFromPoint(e, n), clientX: e, clientY: n, pointerType: "mouse" });
  }));
}, { passive: !0, capture: !0 });
Ee();
const c = (e) => document.querySelector(e), Y = (e) => [...document.querySelectorAll(e)], Le = matchMedia("(prefers-reduced-motion: reduce)");
let j, I = Le.matches;
const gt = setTimeout(() => document.documentElement.classList.add("world-unavailable"), 12e3);
async function Ot() {
  try {
    const { UnityWorld: e } = await import("./world2.js");
    j = new e(c("#unity-canvas"), () => {
      clearTimeout(gt), document.documentElement.classList.remove("world-unavailable"), document.documentElement.classList.add("world-ready");
    });
  } catch (e) {
    clearTimeout(gt), document.documentElement.classList.add("world-unavailable"), console.warn("The lightweight world illustration is active.", e.message);
  }
}
Ot();
const yt = {
  help: [["↗", "A ladder for a little home improvement", "Al Nahda, Sharjah · Nearby", "Tools & everyday help"], ["↗", "An extra pair of hands with groceries", "Al Majaz, Sharjah · Nearby", "Community support"], ["↗", "A friendly hand setting up a laptop", "Abu Shagara, Sharjah · Nearby", "Tech help"]],
  found: [["⌕", "A set of keys, waiting to come home", "Al Majaz waterfront · Example listing", "Found"], ["⌕", "Looking for a much-loved backpack", "Al Nahda park · Example listing", "Lost"], ["⌕", "A wallet found on an evening walk", "Abu Shagara · Example listing", "Found"]],
  volunteer: [["✳", "A cleaner coast, together", "Community beach cleanup · Example event", "Environment"], ["✳", "Give a little time. Share a meal.", "Community food drive · Example event", "Community care"], ["✳", "Help someone take their next step", "Neighbourhood skills exchange · Example event", "Share a skill"]],
  news: [["↗", "Keep up with your neighbourhood", "Discover community updates in one place", "Local updates"], ["↗", "Find stories with their sources attached", "Explore the platform’s local news space", "Stay informed"], ["↗", "Know what is happening nearby", "Open the demo to explore news categories", "Community news"]]
};
function ye(e, n = !1) {
  if (!yt[e]) return;
  Y("[data-preview]").forEach((L) => {
    const x = L.dataset.preview === e;
    L.setAttribute("aria-selected", String(x)), L.tabIndex = x ? 0 : -1, x && n && L.focus();
  }), c("#feature-panel").setAttribute("aria-labelledby", "tab-" + e);
  const a = c("#preview-content");
  a.replaceChildren();
  const i = { help: "Ask for groceries, transport, tools or tech support. See distance, time remaining and volunteer counts, then message a neighbour directly.", found: "Photo listings, clear Lost and Found labels, and Emirate locations. Contact the person who posted an item directly.", volunteer: "Community events sourced from Volunteers.ae, with dates, locations and direct registration links.", news: "Stories from Khaleej Times, Gulf News, Al Jazeera and BBC. Filter by source or topic in the dashboard." }, s = document.createElement("p");
  s.className = "preview-description", s.textContent = i[e], a.append(s), yt[e].forEach(([L, x, q, H]) => {
    const F = document.createElement("article");
    F.className = "preview-item";
    const R = document.createElement("span");
    R.className = "preview-symbol", R.textContent = L;
    const M = document.createElement("div"), h = document.createElement("h3");
    h.textContent = x;
    const u = document.createElement("p");
    u.textContent = q;
    const r = document.createElement("span");
    r.className = "tag", r.textContent = H, M.append(h, u, r), F.append(R, M), a.append(F);
  });
}
Y("[data-preview]").forEach((e, n) => {
  e.addEventListener("click", () => ye(e.dataset.preview)), e.addEventListener("keydown", (a) => {
    const i = Y("[data-preview]");
    let s;
    (a.key === "ArrowRight" || a.key === "ArrowDown") && (s = (n + 1) % i.length), (a.key === "ArrowLeft" || a.key === "ArrowUp") && (s = (n + i.length - 1) % i.length), a.key === "Home" && (s = 0), a.key === "End" && (s = i.length - 1), s !== void 0 && (a.preventDefault(), ye(i[s].dataset.preview, !0));
  });
});
Y("[data-select]").forEach((e) => e.addEventListener("click", () => ye(e.dataset.select)));
ye("help");
let Mt;
function Ge(e) {
  Mt = document.activeElement, e.showModal(), j?.setPaused(!0);
}
function ve(e) {
  e.close(), j?.setPaused(I), Mt?.focus();
}
Y("dialog").forEach((e) => {
  e.querySelector("[data-close]").addEventListener("click", () => ve(e)), e.addEventListener("click", (n) => {
    if (n.target === e) {
      const a = e.getBoundingClientRect();
      (n.clientX < a.left || n.clientX > a.right || n.clientY < a.top || n.clientY > a.bottom) && ve(e);
    }
  }), e.addEventListener("close", () => {
    j?.setPaused(I), c("#menu-toggle").setAttribute("aria-expanded", "false"), e.id === "video-dialog" && c("#video-frame").removeAttribute("src");
  });
});
c("#menu-toggle").addEventListener("click", () => {
  Ge(c("#navigation")), c("#menu-toggle").setAttribute("aria-expanded", "true");
});
Y("#navigation a").forEach((e) => e.addEventListener("click", () => ve(c("#navigation"))));
let vt;
Y("[data-demo]").forEach((e) => e.addEventListener("click", () => {
  const n = c("#demo-frame"), a = e.dataset.demo || "community";
  n.getAttribute("src") || (n.src = n.dataset.src), Ge(c("#demo-dialog")), clearTimeout(vt);
  let i = 0;
  function s() {
    if (c("#demo-dialog").open) {
      try {
        if (n.contentWindow?.__beaconDemoReady) {
          n.contentWindow.switchTab(a);
          return;
        }
      } catch {
      }
      ++i < 100 && (vt = setTimeout(s, 100));
    }
  }
  s();
}));
c("#demo-frame").addEventListener("load", () => {
  try {
    const e = c("#demo-frame").contentDocument, n = e.createElement("style");
    n.textContent = "#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}", e.head.append(n), [...e.querySelectorAll("button")].find((i) => i.textContent.trim().startsWith("Skip"))?.click();
  } catch {
  }
});
Y("[data-video]").forEach((e) => e.addEventListener("click", () => {
  c("#video-frame").src = "https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0", Ge(c("#video-dialog"));
}));
window.openSimDemo = () => Y("[data-demo]")[0].click();
window.closeSimDemo = () => ve(c("#demo-dialog"));
function At() {
  I = !I, window._bavPaused = I, document.body.classList.toggle("motion-paused", I), j?.setPaused(I), c("#motion-toggle").textContent = I ? "Resume background motion" : "Pause background motion", c("#motion-toggle").setAttribute("aria-pressed", String(I)), c("#footer-motion").textContent = I ? "Resume background motion" : "Pause background motion";
}
c("#motion-toggle").addEventListener("click", At);
c("#footer-motion").addEventListener("click", At);
Le.addEventListener("change", (e) => {
  j && (j.reduced = e.matches, j.lastFrame = 0), I = e.matches, window._bavPaused = e.matches, document.body.classList.toggle("motion-paused", e.matches), c("#motion-toggle").setAttribute("aria-pressed", String(I));
});
c("#theme-toggle").addEventListener("click", () => {
  const e = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = e ? "dark" : "light", c("#theme-toggle").textContent = e ? "Switch to day" : "Switch to night";
  try {
    localStorage.setItem("beacon-theme", e ? "dark" : "light");
  } catch {
  }
});
try {
  localStorage.getItem("beacon-theme") === "dark" && c("#theme-toggle").click();
} catch {
}
c("#year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
const Wt = Y(".chapter");
let je = !1;
function Tt() {
  je = !1;
  const e = scrollY;
  c(".site-header").classList.toggle("scrolled", e > 60);
  const n = e > c("#story-end").offsetTop - innerHeight * 0.6;
  document.body.classList.toggle("past-story", n);
  let a = 0;
  Wt.forEach((i, s) => {
    const L = i.getBoundingClientRect();
    L.top < innerHeight * 0.4 && (a = s);
    const x = i.querySelector(".chapter-copy");
    if (!Le.matches && innerWidth > 700) {
      const q = Math.max(-30, Math.min(30, -L.top * 0.06));
      x.style.transform = `translateY(${q}px)`;
    }
  }), Y("#chapter-progress a").forEach((i, s) => {
    i.classList.toggle("active", s === a), s === a ? i.setAttribute("aria-current", "step") : i.removeAttribute("aria-current");
  }), c("#chapter-number").textContent = `0${a + 1} / 05`, document.body.classList.toggle("footer-visible", c(".site-footer").getBoundingClientRect().top < innerHeight - 100);
}
addEventListener("scroll", () => {
  je || (je = !0, requestAnimationFrame(Tt));
}, { passive: !0 });
Tt();
const xe = c("#bav-wrap");
xe.setAttribute("role", "button");
xe.tabIndex = 0;
xe.setAttribute("aria-label", "Beacon mascot. Double-click to chat, or drag and throw to play.");
c("#bav-chat-input").setAttribute("aria-label", "Message Beacon");
c("#bav-chat-body").setAttribute("aria-live", "polite");
c("#beacon-chat-button").addEventListener("click", () => window.__bavOpenChat?.());
xe.addEventListener("keydown", (e) => {
  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), window.__bavOpenChat?.());
});
c("#beacon-hide").addEventListener("click", () => window.__bavTogglePresence?.());
const ie = c("#bav-svg").cloneNode(!0), Ct = /* @__PURE__ */ new Map();
[ie, ...ie.querySelectorAll("[id]")].forEach((e) => {
  e.id && (Ct.set(e.id, "chat-" + e.id), e.id = "chat-" + e.id);
});
[ie, ...ie.querySelectorAll("*")].forEach((e) => {
  for (const n of [...e.attributes]) {
    let a = n.value;
    Ct.forEach((i, s) => {
      a = a.replaceAll("url(#" + s + ")", "url(#" + i + ")"), a === "#" + s && (a = "#" + i);
    }), a !== n.value && e.setAttribute(n.name, a);
  }
});
ie.setAttribute("aria-hidden", "true");
c("#bav-chat-avatar").replaceChildren(ie);
const $t = new IntersectionObserver((e) => {
  e.forEach((n) => {
    n.target.classList.toggle("in-view", n.isIntersecting);
  });
}, { threshold: 0.13 });
Y(".chapter-copy,.story-signal,.section-heading,.how-steps article,.platform-explained article,.organisation-types article,.compare-row,.beyond-layout,.trust-layout").forEach((e) => {
  e.classList.add("motion-reveal"), $t.observe(e);
});
addEventListener("pointermove", (e) => {
  e.pointerType === "touch" || Le.matches || (document.documentElement.style.setProperty("--pointer-x", `${e.clientX / innerWidth * 100}%`), document.documentElement.style.setProperty("--pointer-y", `${e.clientY / innerHeight * 100}%`));
}, { passive: !0 });
const St = new IntersectionObserver((e) => {
  e.some((n) => n.isIntersecting) && (import("./spaces.js").catch(() => document.querySelector(".space-stage").classList.add("space-fallback")), St.disconnect());
}, { rootMargin: "400px" });
St.observe(document.querySelector(".community-spaces"));
