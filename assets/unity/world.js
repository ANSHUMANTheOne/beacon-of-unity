(function() {
  const e = matchMedia("(max-width: 700px)").matches, n = matchMedia("(prefers-reduced-motion: reduce)");
  window._bavPaused = n.matches;
  const r = e ? 0.68 : 1, i = Math.round(64 * r), o = Math.round(84 * r), C = 0.36, B = 0.967, T = 0.76, S = 0.52, N = 0.68, j = 1.8, L = 28;
  let u = window.innerWidth - 148, m = window.innerHeight * 0.32, c = -1.2, f = 0, l = "idle", d = "", h = !1, y = null, v = !1, K = 0, me = 0, P = [], H = null, et = 0, z = !1, J = !1, tt = null, he = performance.now(), Z = 0, Y = 0, W = 0, ee = 0;
  const p = document.getElementById("bav-wrap"), w = document.getElementById("bav-anim"), Ce = document.getElementById("bav-svg"), nt = document.getElementById("bav-bubble"), Ft = document.getElementById("bav-msg"), ot = document.getElementById("bav-shadow"), Te = document.getElementById("bav-el"), Se = document.getElementById("bav-er"), Pt = document.getElementById("bav-mth"), Rt = document.getElementById("bav-leg-l"), Ht = document.getElementById("bav-leg-r");
  p.style.width = i + "px", w.style.width = i + "px", w.style.height = o + "px", Ce.style.width = "100%", Ce.style.height = "100%";
  const pe = document.querySelector("#beacon-hide"), se = document.querySelector(".beacon-dock");
  let q = "tucked", R = 0, Q = 0, at = performance.now(), re = null, Be = null;
  p.classList.add("beacon-tucked");
  function Ie(t) {
    pe.textContent = t ? "−" : "+", pe.setAttribute("aria-label", t ? "Hide Beacon mascot" : "Show Beacon mascot"), pe.setAttribute("aria-expanded", String(t)), p.tabIndex = t ? 0 : -1;
  }
  Ie(!1);
  function Xt() {
    const t = se.getBoundingClientRect();
    u = Math.min(innerWidth - i - 10, t.left + t.width / 2 - i / 2), m = t.top - o - 10, p.style.left = u + "px", p.style.top = m + "px", p.style.opacity = String(R), p.style.translate = `0 ${(1 - R) * (o + 14)}px`, p.style.scale = String(0.45 + 0.55 * R), p.style.pointerEvents = R > 0.35 ? "auto" : "none", p.style.clipPath = `inset(0 0 ${(1 - R) * 100}% 0)`;
  }
  function Ye() {
    q = "shown", p.classList.remove("beacon-tucked");
    for (const t of ["opacity", "translate", "scale", "pointerEvents", "clipPath"]) p.style[t] = "";
    c = 0, f = 0, M("happy"), Ie(!0);
  }
  document.addEventListener("pointermove", (t) => {
    if (q !== "tucked" || t.pointerType === "touch") return;
    const a = se.getBoundingClientRect(), g = Math.hypot(Math.max(a.left - t.clientX, 0, t.clientX - a.right), Math.max(a.top - t.clientY, 0, t.clientY - a.bottom)), b = performance.now(), I = re ? Math.hypot(t.clientX - re.x, t.clientY - re.y) / Math.max(1, b - re.t) : 0;
    re = { x: t.clientX, y: t.clientY, t: b }, Q = Math.max(0, Math.min(1, (210 - g) / 170)), p.dataset.approachSpeed = String(Math.min(2, I));
  }, { passive: !0 }), se.addEventListener("focusin", () => {
    q === "tucked" && (Q = 1);
  }), window.__bavTogglePresence = () => {
    if (q === "hiding") return;
    if (q !== "shown") {
      document.body.classList.remove("beacon-hidden"), q = "tucked", Q = 1, p.classList.add("beacon-tucked");
      return;
    }
    q = "hiding", Ie(!1);
    const t = pe.getBoundingClientRect(), a = p.getBoundingClientRect();
    se.classList.add("beacon-recalling"), Be = p.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${t.left + t.width / 2 - a.left - a.width / 2}px,${t.top + t.height / 2 - a.top - a.height / 2}px) rotate(12deg) scale(.04)`, opacity: 0 }
    ], { duration: n.matches ? 0 : 380, easing: "cubic-bezier(.5,0,.75,.4)", fill: "forwards" }), Be.onfinish = () => {
      q = "hidden", R = 0, Q = 0, document.body.classList.add("beacon-hidden"), Be.cancel(), se.classList.remove("beacon-recalling");
    };
  };
  function qe(t) {
    Rt.classList.toggle("swinging", t), Ht.classList.toggle("swinging", t);
  }
  function Fe() {
    if (window._bavPaused && !h) return;
    const t = document.querySelector(".beacon-dock")?.getBoundingClientRect();
    t && u + i > t.left - 12 && u < t.right + 12 && m + o > t.top - 14 && (m = t.top - o - 14), p.style.left = u + "px", p.style.top = m + "px";
  }
  function F(t, a) {
    clearTimeout(tt), Ft.textContent = t, nt.classList.add("on"), tt = setTimeout(() => nt.classList.remove("on"), a || 3e3);
  }
  setTimeout(() => {
    F("Hi! I'm Beacon! 👋", 4e3), setTimeout(() => F("Your community guardian ✨", 3200), 4700), setTimeout(() => F("Double-click (or double-tap) me to chat! 💬", 3600), 8200);
  }, 1400);
  const it = [
    "🛡️ Keeping UAE safe!",
    "🤝 Community first!",
    "🇦🇪 Proud to serve!",
    "✨ Beacon of Unity",
    "💪 Together we rise",
    "🌟 Verified & trusted"
  ];
  setInterval(() => {
    (l === "idle" || l === "sitting") && Math.random() < 0.28 && F(it[Math.floor(Math.random() * it.length)], 2800);
  }, 11e3);
  const Pe = {
    happy: "M22 52 Q32 59 42 52",
    surprised: "M24 53 Q32 58 40 53",
    sitting: "M23 52 Q32 57 41 52",
    flying: "M24 52 Q32 58 40 52"
  };
  function M(t) {
    Pt.setAttribute("d", Pe[t] || Pe.happy), p.dataset.expression = t in Pe ? t : "happy", t === "surprised" && [Te, Se].forEach((a) => {
      a.style.transform = "scale(1.3)", setTimeout(() => a.style.transform = "scale(1)", 550);
    });
  }
  M("happy");
  function Re() {
    J || n.matches || [Te, Se].forEach((t) => {
      t.style.transform = "scaleY(0.06)", setTimeout(() => t.style.transform = "scaleY(1)", 110);
    });
  }
  function st() {
    clearTimeout(rt);
    const t = 2600 + Math.random() * 2800;
    rt = setTimeout(() => {
      Re(), Math.random() < 0.22 && setTimeout(Re, 300), st();
    }, t);
  }
  let rt;
  setTimeout(() => {
    Re(), st();
  }, 1800 + Math.random() * 1200);
  function fe() {
    J || n.matches || (J = !0, w.style.animation = "none", w.offsetHeight, w.style.animation = "bav-squish .46s cubic-bezier(.36,.07,.19,.97) forwards", M("surprised"), setTimeout(() => {
      J = !1, w.style.animation = "", ct(), M(l === "sitting" ? "sitting" : "happy");
    }, 460));
  }
  function ct() {
    if (!(J || n.matches))
      switch (l) {
        case "idle":
          w.style.animation = "bav-idle 3.4s ease-in-out infinite";
          break;
        case "walking":
          w.style.animation = "bav-walk 0.46s ease-in-out infinite";
          break;
        case "sitting":
          w.style.animation = "bav-sit  2.9s ease-in-out infinite";
          break;
        case "flying":
          w.style.animation = "";
          break;
      }
  }
  let lt = [];
  function ge() {
    lt = Array.from(document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,p,.ftitle,.stitle,.ctat,.nname,.pct,.ft,.tname,.rpt,figcaption,dt,dd"
    )).map((t) => ({ el: t, r: t.getBoundingClientRect() })).filter(({ r: t, el: a }) => t.width > 120 && t.height > 20 && t.bottom > 0 && t.top < window.innerHeight && !a.closest("#bav-chat,dialog,.beacon-dock,#bav-root") && a.textContent.trim().length > 8);
  }
  ge(), setInterval(ge, 700);
  let He = !1;
  window.addEventListener("scroll", () => {
    He || (He = !0, requestAnimationFrame(() => {
      He = !1, ge();
    }));
  }, { passive: !0 }), window.addEventListener("resize", ge, { passive: !0 });
  function _t() {
    if (h) return null;
    const t = m + o, a = u + i * 0.5;
    for (const { el: g, r: b } of lt)
      if (Math.abs(t - b.top) < 28 && a > b.left + 10 && a < b.right - 10 && b.top > 55)
        return { el: g, snapY: b.top - o };
    return null;
  }
  const te = ["Oof! 😅", "Wheee! 🌀", "Boing! 🎯", "Hey! 😄", "Woo! 💫"], ye = ["Whoa! 😲", "Wee! 🚀", "Flying! 🌟", "Catch me! 😄"], dt = ["Nice read! 📖", "Interesting! 🤔", "Love this! ✨", "Reading... 👀"];
  function ve(t) {
    if (q !== "shown") {
      const ce = Math.min(50, t - at);
      if (at = t, he = t, q === "tucked") {
        const ne = Number(p.dataset.approachSpeed || 0);
        R = n.matches ? Q : R + (Q - R) * (1 - Math.exp(-ce / (160 - ne * 35))), Xt(), R > 0.985 && Q === 1 && Ye();
      }
      requestAnimationFrame(ve);
      return;
    }
    if (window._bavPaused || document.hidden || document.body.classList.contains("beacon-hidden") || document.body.classList.contains("beacon-chat-open") || document.querySelector("dialog[open]")) {
      he = t, requestAnimationFrame(ve);
      return;
    }
    const a = t - he;
    he = t;
    const g = Math.min(a / 16.67, 3), b = window.innerWidth, I = document.querySelector(".beacon-dock")?.getBoundingClientRect(), X = I && u + i > I.left - 12 && u < I.right + 12 ? I.top - 14 : window.innerHeight - 12;
    if (u = Math.max(0, Math.min(b - i, u)), m = Math.max(75, Math.min(X - o, m)), !h) {
      if (l === "sitting" && H) {
        const k = H.getBoundingClientRect(), _ = k.top > 55 && k.top < X + 20, le = u + i * 0.5, de = le > k.left - 10 && le < k.right + 10;
        if (_ && de)
          m = k.top - o + 12, f = 0, c *= T;
        else {
          H = null, l = "flying", qe(!1), f = -1.5;
          const D = ["Here I come!", "A little hop!", "Off we go!", "Wheee!"];
          F(D[Math.floor(Math.random() * D.length)], 1500);
        }
      } else {
        const k = _t();
        if (k && Math.abs(f) < 7)
          (l !== "sitting" || H !== k.el) && (H = k.el, et = k.snapY, l = "sitting", f = 0, c *= 0.35, m = et, fe(), M("sitting"), qe(!0), (Math.abs(c) > 1.2 || Math.abs(f) > 2) && F(dt[Math.floor(Math.random() * dt.length)], 2400));
        else {
          f = Math.min(f + C * g, L), c *= Math.pow(B, g), u += c * g, m += f * g, u < 0 && (u = 0, Math.abs(c) > j ? (c = Math.abs(c) * N, fe(), Math.random() < 0.4 && F(te[Math.floor(Math.random() * te.length)], 1500)) : c = 0, z = !1), u + i > b && (u = b - i, Math.abs(c) > j ? (c = -Math.abs(c) * N, fe(), Math.random() < 0.4 && F(te[Math.floor(Math.random() * te.length)], 1500)) : c = 0, z = !0), m + o > X && (m = X - o, Math.abs(f) > j ? (f = -Math.abs(f) * S, c *= T, fe(), Math.random() < 0.28 && F(te[Math.floor(Math.random() * te.length)], 1500)) : (f = 0, c *= T, l !== "sitting" && (l = Math.abs(c) > 1.1 ? "walking" : "idle"))), m < 0 && (m = 0, f = Math.abs(f) * S);
          const _ = Math.sqrt(c * c + f * f);
          l !== "sitting" && (_ > 3.5 ? l = "flying" : Math.abs(c) > 1 && m + o >= X - 2 ? l = "walking" : _ < 0.7 && (l = "idle"));
        }
      }
      if (c < -0.3 && (z = !0), c > 0.3 && (z = !1), l === "flying") {
        const k = Math.max(-30, Math.min(30, c * 2.8));
        Z += (k - Z) * 0.18 * g, Y += (0 - Y) * 0.12 * g, w.style.transform = `rotate(${(Z + Y).toFixed(2)}deg)`;
      } else {
        Z *= 0.8, Y += (0 - Y) * 0.14 * g;
        const k = Z + Y;
        Math.abs(k) < 0.2 ? (Z = 0, Y = 0, w.style.transform = "") : w.style.transform = `rotate(${k.toFixed(2)}deg)`;
      }
      Ce.style.transform = `scaleX(${z ? -1 : 1})`;
      const ce = Math.max(0, X - (m + o)), ne = Math.max(0.15, 1 - ce / X);
      ot.style.width = 38 * ne + "px", ot.style.opacity = (0.72 * ne).toString(), l !== d && !J && (ct(), M(l === "sitting" ? "sitting" : l === "flying" ? "flying" : "happy"), d = l);
    }
    Fe(), requestAnimationFrame(ve);
  }
  if (p.style.left = u + "px", p.style.top = m + "px", requestAnimationFrame(ve), p.addEventListener("mouseenter", () => document.body.classList.add("hov")), p.addEventListener("mouseleave", () => document.body.classList.remove("hov")), p.addEventListener("mousedown", (t) => {
    t.button === 0 && (q === "tucked" && Ye(), t.preventDefault(), h = !0, y = { x: t.clientX, y: t.clientY }, v = !1, K = t.clientX - u, me = t.clientY - m, ee = t.clientX, P = [{ x: t.clientX, y: t.clientY, t: performance.now() }], c = 0, f = 0, H = null, l = d = "flying", w.style.animation = "", w.style.transform = "", M("surprised"), F(ye[Math.floor(Math.random() * ye.length)], 1e3));
  }), document.addEventListener("mousemove", (t) => {
    if (!h || (v = v || Math.hypot(t.clientX - y.x, t.clientY - y.y) > 7, !v)) return;
    const a = t.clientX - ee;
    ee = t.clientX, W = Math.max(-38, Math.min(38, -a * 3.2)), u = t.clientX - K, m = t.clientY - me, P.push({ x: t.clientX, y: t.clientY, t: performance.now() }), P.length > 10 && P.shift(), Y += (W - Y) * 0.28, W *= 0.82, w.style.transform = `rotate(${Y.toFixed(1)}deg)`, Fe();
  }), document.addEventListener("mouseup", () => {
    if (!h) return;
    if (h = !1, !v) {
      c = 0, f = 0, M("happy"), window.__bavOpenChat?.();
      return;
    }
    W = 0, M("happy");
    const t = performance.now(), a = P.filter((g) => t - g.t < 130);
    if (a.length >= 2) {
      const g = a[0], b = a[a.length - 1], I = Math.max(b.t - g.t, 5) / 16.67;
      c = Math.max(-L, Math.min(L, (b.x - g.x) / I * 0.62)), f = Math.max(-L, Math.min(L, (b.y - g.y) / I * 0.62));
    }
    l = "flying", d = "";
  }), p.addEventListener("touchstart", (t) => {
    q === "tucked" && Ye(), t.preventDefault();
    const a = t.touches[0];
    h = !0, y = { x: a.clientX, y: a.clientY }, v = !1, K = a.clientX - u, me = a.clientY - m, ee = a.clientX, P = [{ x: a.clientX, y: a.clientY, t: performance.now() }], c = 0, f = 0, H = null, qe(!1), l = d = "flying", w.style.animation = "", M("surprised"), F(ye[Math.floor(Math.random() * ye.length)], 1e3);
  }, { passive: !1 }), document.addEventListener("touchmove", (t) => {
    if (!h) return;
    t.preventDefault();
    const a = t.touches[0];
    if (v = v || Math.hypot(a.clientX - y.x, a.clientY - y.y) > 7, !v) return;
    const g = a.clientX - ee;
    ee = a.clientX, W = Math.max(-38, Math.min(38, -g * 3.2)), u = a.clientX - K, m = a.clientY - me, P.push({ x: a.clientX, y: a.clientY, t: performance.now() }), P.length > 10 && P.shift(), Y += (W - Y) * 0.28, W *= 0.82, w.style.transform = `rotate(${Y.toFixed(1)}deg)`, Fe();
  }, { passive: !1 }), document.addEventListener("touchend", () => {
    if (!h) return;
    if (h = !1, M("happy"), !v) {
      c = 0, f = 0, window.__bavOpenChat?.();
      return;
    }
    W = 0;
    const t = performance.now(), a = P.filter((g) => t - g.t < 130);
    if (a.length >= 2) {
      const g = a[0], b = a[a.length - 1], I = Math.max(b.t - g.t, 5) / 16.67;
      c = Math.max(-L, Math.min(L, (b.x - g.x) / I * 0.62)), f = Math.max(-L, Math.min(L, (b.y - g.y) / I * 0.62));
    }
    l = "flying", d = "";
  }), document.addEventListener("touchcancel", () => {
    h = !1, v = !0, M("happy");
  }), !matchMedia("(hover: none)").matches) {
    let _ = function() {
      if (h || document.hidden) {
        requestAnimationFrame(_);
        return;
      }
      const Xe = document.getElementById("bav-svg").getBoundingClientRect(), ut = Xe.width / 64, Dt = z ? -1 : 1;
      [
        { base: ce, pupil: g, iris: b },
        { base: ne, pupil: I, iris: X }
      ].forEach(({ base: G, pupil: mt, iris: ht }) => {
        const Ot = Xe.left + (z ? 64 - G.x : G.x) * ut, Nt = Xe.top + G.y * ut, _e = t - Ot, De = a - Nt, Oe = Math.sqrt(_e * _e + De * De) || 1, pt = Math.min(Oe / 55, 1) * k, ft = _e / Oe * pt * Dt, gt = De / Oe * pt;
        mt.setAttribute("cx", (G.x + ft).toFixed(2)), mt.setAttribute("cy", (G.y + gt).toFixed(2)), ht.setAttribute("cx", (G.x + ft * 0.55).toFixed(2)), ht.setAttribute("cy", (G.y + gt * 0.55).toFixed(2));
      }), requestAnimationFrame(_);
    };
    var Kt = _;
    let t = window.innerWidth / 2, a = window.innerHeight / 2;
    document.addEventListener("mousemove", (D) => {
      t = D.clientX, a = D.clientY;
    });
    const g = document.getElementById("bav-pupil-l"), b = document.getElementById("bav-iris-l"), I = document.getElementById("bav-pupil-r"), X = document.getElementById("bav-iris-r"), ce = { x: 23, y: 38 }, ne = { x: 41, y: 38 }, k = 2.6;
    _();
    let le = null, de = !1;
    p.addEventListener("mousedown", () => {
      de = !1, le = setTimeout(() => {
        h && !de && (de = !0, F("🥰 Squeezing me!", 1800), [Te, Se].forEach((D) => {
          D.style.transform = "scale(1.22)", setTimeout(() => D.style.transform = "scale(1)", 700);
        }));
      }, 1200);
    }), document.addEventListener("mouseup", () => clearTimeout(le));
  }
  window.addEventListener("resize", () => {
    u = Math.max(0, Math.min(innerWidth - i, u)), m = Math.max(75, Math.min(innerHeight - o - 12, m)), p.style.left = u + "px", p.style.top = m + "px";
  }), p.addEventListener("bav-teleport", (t) => {
    u = t.detail.x, m = t.detail.y, c = 0, f = 0, l = "idle", d = "", M("happy"), H = null;
  }), p.addEventListener("bav-restore", () => {
    c = (Math.random() - 0.5) * 4, f = -3, l = "flying", d = "", H = null, w.style.transform = "", M("happy");
  });
})();
(function() {
  const e = document.getElementById("bav-chat"), n = document.getElementById("bav-chat-body"), r = document.getElementById("bav-chat-form"), i = document.getElementById("bav-chat-input"), o = document.getElementById("bav-chat-close"), C = document.getElementById("bav-chat-badge"), B = document.getElementById("bav-chat-hint");
  if (B && window.innerWidth <= 768 && (B.textContent = "Double-tap to chat"), !e) return;
  e.inert = !0, [C, B].forEach((d) => {
    if (!d) return;
    ["mousedown", "touchstart"].forEach((y) => d.addEventListener(y, (v) => v.stopPropagation())), d.addEventListener("dblclick", (y) => {
      y.stopPropagation(), window.__bavOpenChat && window.__bavOpenChat();
    });
    let h = 0;
    d.addEventListener("touchend", (y) => {
      y.stopPropagation();
      const v = performance.now();
      v - h < 320 && window.__bavOpenChat && window.__bavOpenChat(), h = v;
    });
  });
  let T = !1, S = !1;
  function N(d, h) {
    const y = document.createElement("div");
    return y.className = "bav-msg " + h, h === "user" ? y.textContent = d : y.innerHTML = d, n.appendChild(y), n.scrollTop = n.scrollHeight, y;
  }
  function j(d) {
    const h = document.createElement("div");
    h.className = "bav-quick", d.forEach((y) => {
      const v = document.createElement("button");
      v.type = "button", v.textContent = y, v.addEventListener("click", () => {
        i.value = y, c();
      }), h.appendChild(v);
    }), n.appendChild(h), n.scrollTop = n.scrollHeight;
  }
  function L(d) {
    const h = document.createElement("div");
    h.className = "bav-typing", h.innerHTML = "<span></span><span></span><span></span>", n.appendChild(h), n.scrollTop = n.scrollHeight, setTimeout(() => {
      h.remove(), d();
    }, 500 + Math.random() * 450);
  }
  const u = [
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
  function m(d) {
    const h = d.toLowerCase(), y = u.find((v) => v.k.some((K) => h.includes(K)));
    return y ? y.a : "I'm not totally sure about that one - but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }
  function c() {
    const d = i.value.trim();
    d && (N(d, "user"), i.value = "", L(() => N(m(d), "bot")));
  }
  r.addEventListener("submit", (d) => {
    d.preventDefault(), c();
  }), i.addEventListener("keydown", (d) => {
    d.key === "Enter" && (d.preventDefault(), c());
  });
  function f() {
    S = !0, document.body.classList.add("beacon-chat-open"), e.classList.add("open"), e.setAttribute("aria-hidden", "false"), e.inert = !1, C && C.classList.add("hide"), B && B.classList.add("hide"), T || (T = !0, L(() => {
      N("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", "bot"), j(["How do I verify?", "Post a help request", "Lost & Found", "Volunteer events"]);
    })), setTimeout(() => i.focus(), 250);
  }
  function l() {
    S = !1, document.body.classList.remove("beacon-chat-open"), e.classList.remove("open"), e.setAttribute("aria-hidden", "true"), e.inert = !0, document.getElementById("beacon-chat-button")?.focus();
  }
  window.__bavOpenChat = function() {
    S ? l() : f();
  }, o.addEventListener("click", l), document.addEventListener("keydown", (d) => {
    d.key === "Escape" && S && l();
  });
})();
const Et = document.querySelector(".pillar-gallery"), Wt = [...Et.querySelectorAll(".pillar-card")], kt = matchMedia("(prefers-reduced-motion: reduce)");
let We = !1;
function Ee() {
  We = !1;
  const e = Et.getBoundingClientRect(), n = !kt.matches && !document.body.classList.contains("motion-paused") && innerWidth > 550, r = Math.max(-1, Math.min(1, (innerHeight / 2 - e.top - e.height / 2) / innerHeight));
  Wt.forEach((i, o) => i.style.setProperty("--offset", n ? `${r * (o % 2 ? -58 : 58)}px` : "0px"));
}
addEventListener("scroll", () => {
  We || (We = !0, requestAnimationFrame(Ee));
}, { passive: !0 });
addEventListener("resize", Ee);
kt.addEventListener("change", Ee);
Ee();
const xt = matchMedia("(hover: hover) and (pointer: fine)"), Lt = matchMedia("(forced-colors: active)"), Ke = document.documentElement;
let oe = !0;
try {
  oe = localStorage.getItem("beacon-cursor") !== "standard";
} catch {
}
const E = document.createElement("div");
E.id = "beacon-orbit";
E.setAttribute("aria-hidden", "true");
E.setAttribute("popover", "manual");
E.innerHTML = '<span class="orbit-trail"></span><span class="orbit-shell"><i></i><i></i></span>';
document.body.append(E);
const ke = document.createElement("button");
ke.id = "cursor-toggle";
const Mt = () => xt.matches && oe && !Lt.matches && typeof E.showPopover == "function";
function V() {
  Ke.classList.remove("beacon-cursor-ready"), E.classList.remove("visible", "pressed"), Je();
}
function xe() {
  Ke.classList.toggle("beacon-cursor", Mt()), ke.textContent = oe ? "Use standard cursor" : "Use Beacon cursor", V();
}
ke.addEventListener("click", () => {
  oe = !oe;
  try {
    localStorage.setItem("beacon-cursor", oe ? "beacon" : "standard");
  } catch {
  }
  xe();
});
document.querySelector(".menu-bottom")?.append(ke);
xt.addEventListener("change", xe);
Lt.addEventListener("change", xe);
const be = E.querySelector(".orbit-trail"), $e = matchMedia("(prefers-reduced-motion: reduce)");
let $ = 0, U = 0, Ue = 0, Ve = 0, ae = 0, je = 0, ze = !1;
function Je() {
  cancelAnimationFrame(ae), ae = 0, ze = !1, be.style.transform = "translate3d(0,0,0)";
}
function At(e) {
  const n = Math.min(40, e - je);
  je = e;
  const r = 1 - Math.exp(-n / 65);
  $ += (Ue - $) * r, U += (Ve - U) * r;
  const i = $ - Ue, o = U - Ve;
  be.style.transform = `translate3d(${i}px,${o}px,0)`, Math.hypot(i, o) > 0.15 ? ae = requestAnimationFrame(At) : (ae = 0, be.style.transform = "translate3d(0,0,0)");
}
function $t(e, n) {
  Ue = e, Ve = n, (!ze || $e.matches) && ($ = e, U = n, ze = !0);
  const r = Math.hypot($ - e, U - n);
  r > 42 && ($ = e + ($ - e) * 42 / r, U = n + (U - n) * 42 / r), be.style.transform = `translate3d(${$ - e}px,${U - n}px,0)`, !ae && !$e.matches && (je = performance.now(), ae = requestAnimationFrame(At));
}
$e.addEventListener("change", Je);
let yt = null, Qe = null;
function Le(e) {
  if (!Mt() || e.pointerType === "touch") {
    V();
    return;
  }
  const n = e.target instanceof Element ? e.target : null;
  if (!n) {
    V();
    return;
  }
  Qe = { x: e.clientX, y: e.clientY };
  const r = n.closest("#unity-canvas");
  if (n.closest("iframe,select,input,textarea,[contenteditable=true],#bav-wrap,[disabled],[aria-disabled=true],[aria-busy=true]")) {
    E.classList.remove("visible", "pressed"), Je();
    return;
  }
  const o = n.closest("dialog[open]");
  o !== yt && (E.matches(":popover-open") && E.hidePopover(), yt = o);
  try {
    E.matches(":popover-open") || E.showPopover();
  } catch {
    V();
    return;
  }
  $t(e.clientX, e.clientY), E.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`, E.classList.add("visible"), E.classList.toggle("world-drag", !!r), Ke.classList.add("beacon-cursor-ready"), E.classList.toggle("clickable", !!n.closest("a,button,summary,[role=button],label[for]"));
}
document.addEventListener("pointermove", Le, { passive: !0, capture: !0 });
document.addEventListener("pointerover", Le, { passive: !0, capture: !0 });
document.addEventListener("pointerdown", (e) => {
  Le(e), e.button === 0 && E.classList.add("pressed");
}, { passive: !0 });
window.addEventListener("pointerup", () => E.classList.remove("pressed"), { passive: !0 });
window.addEventListener("pointercancel", V);
window.addEventListener("blur", V);
document.documentElement.addEventListener("pointerleave", V);
document.addEventListener("visibilitychange", () => {
  document.hidden && V();
});
let Ne = 0;
document.addEventListener("scroll", () => {
  !Qe || Ne || (Ne = requestAnimationFrame(() => {
    Ne = 0;
    const { x: e, y: n } = Qe;
    Le({ target: document.elementFromPoint(e, n), clientX: e, clientY: n, pointerType: "mouse" });
  }));
}, { passive: !0, capture: !0 });
xe();
const s = (e) => document.querySelector(e), A = (e) => [...document.querySelectorAll(e)], Me = matchMedia("(prefers-reduced-motion: reduce)");
let O, x = Me.matches;
const vt = setTimeout(() => document.documentElement.classList.add("world-unavailable"), 12e3);
async function Ut() {
  try {
    const { UnityWorld: e } = await import("./world2.js");
    O = new e(s("#unity-canvas"), () => {
      clearTimeout(vt), document.documentElement.classList.remove("world-unavailable"), document.documentElement.classList.add("world-ready");
    });
  } catch (e) {
    clearTimeout(vt), document.documentElement.classList.add("world-unavailable"), console.warn("The lightweight world illustration is active.", e.message);
  }
}
Ut();
const bt = {
  help: [["↗", "A ladder for a little home improvement", "Al Nahda, Sharjah · Nearby", "Tools & everyday help"], ["↗", "An extra pair of hands with groceries", "Al Majaz, Sharjah · Nearby", "Community support"], ["↗", "A friendly hand setting up a laptop", "Abu Shagara, Sharjah · Nearby", "Tech help"]],
  found: [["⌕", "A set of keys, waiting to come home", "Al Majaz waterfront · Example listing", "Found"], ["⌕", "Looking for a much-loved backpack", "Al Nahda park · Example listing", "Lost"], ["⌕", "A wallet found on an evening walk", "Abu Shagara · Example listing", "Found"]],
  volunteer: [["✳", "A cleaner coast, together", "Community beach cleanup · Example event", "Environment"], ["✳", "Give a little time. Share a meal.", "Community food drive · Example event", "Community care"], ["✳", "Help someone take their next step", "Neighbourhood skills exchange · Example event", "Share a skill"]],
  news: [["↗", "Keep up with your neighbourhood", "Discover community updates in one place", "Local updates"], ["↗", "Find stories with their sources attached", "Explore the platform’s local news space", "Stay informed"], ["↗", "Know what is happening nearby", "Open the demo to explore news categories", "Community news"]]
};
function we(e, n = !1) {
  if (!bt[e]) return;
  A("[data-preview]").forEach((T) => {
    const S = T.dataset.preview === e;
    T.setAttribute("aria-selected", String(S)), T.tabIndex = S ? 0 : -1, S && n && T.focus();
  }), s("#feature-panel").setAttribute("aria-labelledby", "tab-" + e);
  const r = { help: "community", found: "lostfound", volunteer: "volunteer-opps", news: "reliable-news" }, i = s(".preview-cta");
  i.dataset.demo = r[e], i.firstChild.textContent = { help: "Try posting or answering a request ", found: "Try searching Lost & Found ", volunteer: "Explore volunteer opportunities ", news: "Try the news filters " }[e];
  const o = s("#preview-content");
  o.replaceChildren();
  const C = { help: "Ask for groceries, transport, tools or tech support. See distance, time remaining and volunteer counts, then message a neighbour directly.", found: "Photo listings, clear Lost and Found labels, and Emirate locations. Contact the person who posted an item directly.", volunteer: "Community events sourced from Volunteers.ae, with dates, locations and direct registration links.", news: "Stories from Al Jazeera, BBC News, NPR News and Times of India. Filter by source or topic. Demo stories are fictional examples." }, B = document.createElement("p");
  B.className = "preview-description", B.textContent = C[e], o.append(B), bt[e].forEach(([T, S, N, j]) => {
    const L = document.createElement("article");
    L.className = "preview-item";
    const u = document.createElement("span");
    u.className = "preview-symbol", u.textContent = T;
    const m = document.createElement("div"), c = document.createElement("h3");
    c.textContent = S;
    const f = document.createElement("p");
    f.textContent = N;
    const l = document.createElement("span");
    l.className = "tag", l.textContent = j, m.append(c, f, l), L.append(u, m), o.append(L);
  });
}
A("[data-preview]").forEach((e, n) => {
  e.addEventListener("click", () => we(e.dataset.preview)), e.addEventListener("keydown", (r) => {
    const i = A("[data-preview]");
    let o;
    (r.key === "ArrowRight" || r.key === "ArrowDown") && (o = (n + 1) % i.length), (r.key === "ArrowLeft" || r.key === "ArrowUp") && (o = (n + i.length - 1) % i.length), r.key === "Home" && (o = 0), r.key === "End" && (o = i.length - 1), o !== void 0 && (r.preventDefault(), we(i[o].dataset.preview, !0));
  });
});
A("[data-select]").forEach((e) => e.addEventListener("click", () => we(e.dataset.select)));
we("help");
const Vt = A(".desktop-nav a,#navigation nav a"), jt = A("#home,#community,#how,#trust,#compare,#beyond,#questions");
let Ct;
function Ze(e) {
  Ct = document.activeElement, e.showModal(), O?.setPaused(!0);
}
function ue(e) {
  e.close(), O?.setPaused(x), Ct?.focus();
}
A("dialog").forEach((e) => {
  e.querySelector("[data-close]").addEventListener("click", () => ue(e)), e.addEventListener("click", (n) => {
    if (n.target === e) {
      const r = e.getBoundingClientRect();
      (n.clientX < r.left || n.clientX > r.right || n.clientY < r.top || n.clientY > r.bottom) && ue(e);
    }
  }), e.addEventListener("close", () => {
    O?.setPaused(x), s("#menu-toggle").setAttribute("aria-expanded", "false"), e.id === "video-dialog" && s("#video-frame").removeAttribute("src");
  });
});
s("#menu-toggle").addEventListener("click", () => {
  Ze(s("#navigation")), s("#menu-toggle").setAttribute("aria-expanded", "true");
});
A("#navigation a").forEach((e) => e.addEventListener("click", () => ue(s("#navigation"))));
let wt;
A("[data-demo]").forEach((e) => e.addEventListener("click", () => {
  const n = s("#demo-frame"), r = e.dataset.demo || "community";
  n.getAttribute("src") || (n.src = n.dataset.src), s("#navigation").open && ue(s("#navigation")), Ze(s("#demo-dialog")), clearTimeout(wt);
  let i = 0;
  function o() {
    if (s("#demo-dialog").open) {
      try {
        if (n.contentWindow?.__beaconDemoReady) {
          n.contentWindow.switchTab(r);
          return;
        }
      } catch {
      }
      ++i < 100 && (wt = setTimeout(o, 100));
    }
  }
  o();
}));
s("#demo-frame").addEventListener("load", () => {
  try {
    const e = s("#demo-frame").contentDocument, n = e.createElement("style");
    n.textContent = "#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}", e.head.append(n), [...e.querySelectorAll("button")].find((i) => i.textContent.trim().startsWith("Skip"))?.click();
  } catch {
  }
});
A("[data-video]").forEach((e) => e.addEventListener("click", () => {
  s("#video-frame").src = "https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0", Ze(s("#video-dialog"));
}));
window.openSimDemo = () => A("[data-demo]")[0].click();
window.closeSimDemo = () => ue(s("#demo-dialog"));
function Tt() {
  x = !x, window._bavPaused = x, document.body.classList.toggle("motion-paused", x), O?.setPaused(x), s("#motion-toggle").textContent = x ? "Resume background motion" : "Pause background motion", s("#motion-toggle").setAttribute("aria-pressed", String(x)), s("#footer-motion").textContent = x ? "Resume background motion" : "Pause background motion";
}
function St() {
  document.body.classList.toggle("motion-paused", x), s("#motion-toggle").textContent = x ? "Resume background motion" : "Pause background motion", s("#motion-toggle").setAttribute("aria-pressed", String(x)), s("#footer-motion").textContent = x ? "Resume background motion" : "Pause background motion";
}
St();
s("#motion-toggle").addEventListener("click", Tt);
s("#footer-motion").addEventListener("click", Tt);
Me.addEventListener("change", (e) => {
  O && (O.reduced = e.matches, O.lastFrame = 0), x = e.matches, window._bavPaused = e.matches, document.body.classList.toggle("motion-paused", e.matches), s("#motion-toggle").setAttribute("aria-pressed", String(x)), O?.setPaused(x), St();
});
s("#theme-toggle").addEventListener("click", () => {
  const e = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = e ? "dark" : "light", s("#theme-toggle").textContent = e ? "Switch to day" : "Switch to night";
  try {
    localStorage.setItem("beacon-theme", e ? "dark" : "light");
  } catch {
  }
});
try {
  localStorage.getItem("beacon-theme") === "dark" && s("#theme-toggle").click();
} catch {
}
s("#year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
const zt = A(".chapter");
let Ge = !1;
function Bt() {
  Ge = !1;
  let e = "home";
  jt.forEach((o) => {
    o.getBoundingClientRect().top < innerHeight * 0.35 && (e = o.id);
  }), Vt.forEach((o) => {
    o.getAttribute("href") === "#" + e ? o.setAttribute("aria-current", "location") : o.removeAttribute("aria-current");
  });
  const n = scrollY;
  s(".site-header").classList.toggle("scrolled", n > 60);
  const r = n > s("#story-end").offsetTop - innerHeight * 0.6;
  document.body.classList.toggle("past-story", r);
  let i = 0;
  zt.forEach((o, C) => {
    const B = o.getBoundingClientRect();
    B.top < innerHeight * 0.4 && (i = C);
    const T = o.querySelector(".chapter-copy");
    if (!Me.matches && innerWidth > 700) {
      const S = Math.max(-30, Math.min(30, -B.top * 0.06));
      T.style.transform = `translateY(${S}px)`;
    }
  }), A("#chapter-progress a").forEach((o, C) => {
    o.classList.toggle("active", C === i), C === i ? o.setAttribute("aria-current", "step") : o.removeAttribute("aria-current");
  }), s("#chapter-number").textContent = `0${i + 1} / 05`, document.body.classList.toggle("footer-visible", s(".site-footer").getBoundingClientRect().top < innerHeight - 100);
}
addEventListener("scroll", () => {
  Ge || (Ge = !0, requestAnimationFrame(Bt));
}, { passive: !0 });
Bt();
const Ae = s("#bav-wrap");
Ae.setAttribute("role", "button");
Ae.tabIndex = s("#beacon-hide").getAttribute("aria-expanded") === "true" ? 0 : -1;
Ae.setAttribute("aria-label", "Ask Beacon. Click or tap to chat, or drag to play.");
s("#bav-chat-input").setAttribute("aria-label", "Message Beacon");
s("#bav-chat-body").setAttribute("aria-live", "polite");
s("#beacon-chat-button").addEventListener("click", () => window.__bavOpenChat?.());
Ae.addEventListener("keydown", (e) => {
  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), window.__bavOpenChat?.());
});
s("#beacon-hide").addEventListener("click", () => window.__bavTogglePresence?.());
const ie = s("#bav-svg").cloneNode(!0), It = /* @__PURE__ */ new Map();
[ie, ...ie.querySelectorAll("[id]")].forEach((e) => {
  e.id && (It.set(e.id, "chat-" + e.id), e.id = "chat-" + e.id);
});
[ie, ...ie.querySelectorAll("*")].forEach((e) => {
  for (const n of [...e.attributes]) {
    let r = n.value;
    It.forEach((i, o) => {
      r = r.replaceAll("url(#" + o + ")", "url(#" + i + ")"), r === "#" + o && (r = "#" + i);
    }), r !== n.value && e.setAttribute(n.name, r);
  }
});
ie.setAttribute("aria-hidden", "true");
s("#bav-chat-avatar").replaceChildren(ie);
const Yt = new IntersectionObserver((e) => {
  e.forEach((n) => {
    n.isIntersecting && (n.target.classList.add("in-view"), Yt.unobserve(n.target));
  });
}, { threshold: 0.08 });
A(".chapter-copy,.story-signal,.section-heading,.how-steps article,.platform-explained article,.organisation-types article,.compare-row,.beyond-layout,.trust-layout").forEach((e) => {
  e.classList.add("motion-reveal"), Yt.observe(e);
});
addEventListener("pointermove", (e) => {
  e.pointerType === "touch" || Me.matches || (document.documentElement.style.setProperty("--pointer-x", `${e.clientX / innerWidth * 100}%`), document.documentElement.style.setProperty("--pointer-y", `${e.clientY / innerHeight * 100}%`));
}, { passive: !0 });
function Qt() {
  s(".space-stage").classList.add("space-fallback");
  const n = { neighbours: ["AT HOME", "A request. Someone nearby.", "An older neighbour asks for company for a hospital appointment. Another neighbour offers support. A second example shows help with groceries for a wheelchair user."], school: ["SCHOOL CONCEPT", "Every classroom. One connected school.", "Classroom nodes illustrate how announcements and shared resources could connect a school. This is a concept, not an available classroom-management product."], office: ["WORKPLACE CONCEPT", "A shared space. A shared purpose.", "Colleagues coordinate a small community collection. This illustrative concept is available to discuss through the organisation enquiry link."] };
  function r(i) {
    const o = n[i];
    s("#space-label").textContent = o[0], s("#space-title").textContent = o[1], s("#space-copy").textContent = o[2], s(".space-example").textContent = "3D preview unavailable on this device. These text scenarios are illustrative, not live activity.", A("[data-space]").forEach((C) => C.setAttribute("aria-pressed", String(C.dataset.space === i)));
  }
  A("[data-space]").forEach((i) => i.addEventListener("click", () => r(i.dataset.space))), r("neighbours");
}
const qt = new IntersectionObserver((e) => {
  e.some((n) => n.isIntersecting) && (import("./spaces.js").catch(Qt), qt.disconnect());
}, { rootMargin: "400px" });
qt.observe(document.querySelector(".community-spaces"));
