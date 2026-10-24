(function() {
  const e = matchMedia("(max-width: 700px)").matches, n = matchMedia("(prefers-reduced-motion: reduce)");
  window._bavPaused = n.matches;
  const i = e ? 0.68 : 1, o = Math.round(64 * i), s = Math.round(84 * i), k = 0.36, x = 0.967, _ = 0.76, F = 0.52, q = 0.68, Y = 1.8, M = 28;
  let m = window.innerWidth - 148, h = window.innerHeight * 0.32, r = -1.2, f = 0, u = "idle", l = "", d = !1, y = 0, w = 0, C = [], H = null, Me = 0, X = !1, U = !1, Le = null, se = performance.now(), V = 0, L = 0, O = 0, $ = 0;
  const E = document.getElementById("bav-wrap"), v = document.getElementById("bav-anim"), re = document.getElementById("bav-svg"), Ae = document.getElementById("bav-bubble"), Ke = document.getElementById("bav-msg"), Ce = document.getElementById("bav-shadow"), ce = document.getElementById("bav-el"), le = document.getElementById("bav-er"), Je = document.getElementById("bav-mth"), Ze = document.getElementById("bav-leg-l"), et = document.getElementById("bav-leg-r");
  E.style.width = o + "px", v.style.width = o + "px", v.style.height = s + "px", re.style.width = "100%", re.style.height = "100%";
  function de(t) {
    Ze.classList.toggle("swinging", t), et.classList.toggle("swinging", t);
  }
  function ue() {
    if (window._bavPaused && !d) return;
    const t = document.querySelector(".beacon-dock")?.getBoundingClientRect();
    t && m + o > t.left - 12 && m < t.right + 12 && h + s > t.top - 14 && (h = t.top - s - 14), E.style.left = m + "px", E.style.top = h + "px";
  }
  function T(t, c) {
    clearTimeout(Le), Ke.textContent = t, Ae.classList.add("on"), Le = setTimeout(() => Ae.classList.remove("on"), c || 3e3);
  }
  setTimeout(() => {
    T("Hi! I'm Beacon! 👋", 4e3), setTimeout(() => T("Your community guardian ✨", 3200), 4700), setTimeout(() => T("Double-click (or double-tap) me to chat! 💬", 3600), 8200);
  }, 1400);
  const Te = [
    "🛡️ Keeping UAE safe!",
    "🤝 Community first!",
    "🇦🇪 Proud to serve!",
    "✨ Beacon of Unity",
    "💪 Together we rise",
    "🌟 Verified & trusted"
  ];
  setInterval(() => {
    (u === "idle" || u === "sitting") && Math.random() < 0.28 && T(Te[Math.floor(Math.random() * Te.length)], 2800);
  }, 11e3);
  const he = {
    happy: "M22 52 Q32 59 42 52",
    surprised: "M24 53 Q32 58 40 53",
    sitting: "M23 52 Q32 57 41 52",
    flying: "M24 52 Q32 58 40 52"
  };
  function A(t) {
    Je.setAttribute("d", he[t] || he.happy), E.dataset.expression = t in he ? t : "happy", t === "surprised" && [ce, le].forEach((c) => {
      c.style.transform = "scale(1.3)", setTimeout(() => c.style.transform = "scale(1)", 550);
    });
  }
  A("happy");
  function me() {
    U || n.matches || [ce, le].forEach((t) => {
      t.style.transform = "scaleY(0.06)", setTimeout(() => t.style.transform = "scaleY(1)", 110);
    });
  }
  function Be() {
    clearTimeout(Ie);
    const t = 2600 + Math.random() * 2800;
    Ie = setTimeout(() => {
      me(), Math.random() < 0.22 && setTimeout(me, 300), Be();
    }, t);
  }
  let Ie;
  setTimeout(() => {
    me(), Be();
  }, 1800 + Math.random() * 1200);
  function j() {
    U || n.matches || (U = !0, v.style.animation = "none", v.offsetHeight, v.style.animation = "bav-squish .46s cubic-bezier(.36,.07,.19,.97) forwards", A("surprised"), setTimeout(() => {
      U = !1, v.style.animation = "", Se(), A(u === "sitting" ? "sitting" : "happy");
    }, 460));
  }
  function Se() {
    if (!(U || n.matches))
      switch (u) {
        case "idle":
          v.style.animation = "bav-idle 3.4s ease-in-out infinite";
          break;
        case "walking":
          v.style.animation = "bav-walk 0.46s ease-in-out infinite";
          break;
        case "sitting":
          v.style.animation = "bav-sit  2.9s ease-in-out infinite";
          break;
        case "flying":
          v.style.animation = "";
          break;
      }
  }
  let _e = [];
  function J() {
    _e = Array.from(document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,p,.ftitle,.stitle,.ctat,.nname,.pct,.ft,.tname,.rpt,figcaption,dt,dd"
    )).map((t) => ({ el: t, r: t.getBoundingClientRect() })).filter(({ r: t, el: c }) => t.width > 120 && t.height > 20 && t.bottom > 0 && t.top < window.innerHeight && !c.closest("#bav-chat,dialog,.beacon-dock,#bav-root") && c.textContent.trim().length > 8);
  }
  J(), setInterval(J, 700);
  let pe = !1;
  window.addEventListener("scroll", () => {
    pe || (pe = !0, requestAnimationFrame(() => {
      pe = !1, J();
    }));
  }, { passive: !0 }), window.addEventListener("resize", J, { passive: !0 });
  function tt() {
    if (d) return null;
    const t = h + s, c = m + o * 0.5;
    for (const { el: p, r: g } of _e)
      if (Math.abs(t - g.top) < 28 && c > g.left + 10 && c < g.right - 10 && g.top > 55)
        return { el: p, snapY: g.top - s };
    return null;
  }
  const Q = ["Oof! 😅", "Wheee! 🌀", "Boing! 🎯", "Hey! 😄", "Woo! 💫"], Z = ["Whoa! 😲", "Wee! 🚀", "Flying! 🌟", "Catch me! 😄"], qe = ["Nice read! 📖", "Interesting! 🤔", "Love this! ✨", "Reading... 👀"];
  function fe(t) {
    if (window._bavPaused || document.hidden || document.body.classList.contains("beacon-hidden") || document.body.classList.contains("beacon-chat-open") || document.querySelector("dialog[open]")) {
      se = t, requestAnimationFrame(fe);
      return;
    }
    const c = t - se;
    se = t;
    const p = Math.min(c / 16.67, 3), g = window.innerWidth, B = document.querySelector(".beacon-dock")?.getBoundingClientRect(), D = B && m + o > B.left - 12 && m < B.right + 12 ? B.top - 14 : window.innerHeight - 12;
    if (m = Math.max(0, Math.min(g - o, m)), h = Math.max(75, Math.min(D - s, h)), !d) {
      if (u === "sitting" && H) {
        const b = H.getBoundingClientRect(), R = b.top > 55 && b.top < D + 20, G = m + o * 0.5, K = G > b.left - 10 && G < b.right + 10;
        if (R && K)
          h = b.top - s + 12, f = 0, r *= _;
        else {
          H = null, u = "flying", de(!1), f = -1.5;
          const P = ["Here I come!", "A little hop!", "Off we go!", "Wheee!"];
          T(P[Math.floor(Math.random() * P.length)], 1500);
        }
      } else {
        const b = tt();
        if (b && Math.abs(f) < 7)
          (u !== "sitting" || H !== b.el) && (H = b.el, Me = b.snapY, u = "sitting", f = 0, r *= 0.35, h = Me, j(), A("sitting"), de(!0), (Math.abs(r) > 1.2 || Math.abs(f) > 2) && T(qe[Math.floor(Math.random() * qe.length)], 2400));
        else {
          f = Math.min(f + k * p, M), r *= Math.pow(x, p), m += r * p, h += f * p, m < 0 && (m = 0, Math.abs(r) > Y ? (r = Math.abs(r) * q, j(), Math.random() < 0.4 && T(Q[Math.floor(Math.random() * Q.length)], 1500)) : r = 0, X = !1), m + o > g && (m = g - o, Math.abs(r) > Y ? (r = -Math.abs(r) * q, j(), Math.random() < 0.4 && T(Q[Math.floor(Math.random() * Q.length)], 1500)) : r = 0, X = !0), h + s > D && (h = D - s, Math.abs(f) > Y ? (f = -Math.abs(f) * F, r *= _, j(), Math.random() < 0.28 && T(Q[Math.floor(Math.random() * Q.length)], 1500)) : (f = 0, r *= _, u !== "sitting" && (u = Math.abs(r) > 1.1 ? "walking" : "idle"))), h < 0 && (h = 0, f = Math.abs(f) * F);
          const R = Math.sqrt(r * r + f * f);
          u !== "sitting" && (R > 3.5 ? u = "flying" : Math.abs(r) > 1 && h + s >= D - 2 ? u = "walking" : R < 0.7 && (u = "idle"));
        }
      }
      if (r < -0.3 && (X = !0), r > 0.3 && (X = !1), u === "flying") {
        const b = Math.max(-30, Math.min(30, r * 2.8));
        V += (b - V) * 0.18 * p, L += (0 - L) * 0.12 * p, v.style.transform = `rotate(${(V + L).toFixed(2)}deg)`;
      } else {
        V *= 0.8, L += (0 - L) * 0.14 * p;
        const b = V + L;
        Math.abs(b) < 0.2 ? (V = 0, L = 0, v.style.transform = "") : v.style.transform = `rotate(${b.toFixed(2)}deg)`;
      }
      re.style.transform = `scaleX(${X ? -1 : 1})`;
      const ge = Math.max(0, D - (h + s)), ee = Math.max(0.15, 1 - ge / D);
      Ce.style.width = 38 * ee + "px", Ce.style.opacity = (0.72 * ee).toString(), u !== l && !U && (Se(), A(u === "sitting" ? "sitting" : u === "flying" ? "flying" : "happy"), l = u);
    }
    ue(), requestAnimationFrame(fe);
  }
  E.style.left = m + "px", E.style.top = h + "px", requestAnimationFrame(fe), E.addEventListener("mouseenter", () => document.body.classList.add("hov")), E.addEventListener("mouseleave", () => document.body.classList.remove("hov")), E.addEventListener("mousedown", (t) => {
    t.button === 0 && (t.preventDefault(), d = !0, y = t.clientX - m, w = t.clientY - h, $ = t.clientX, C = [{ x: t.clientX, y: t.clientY, t: performance.now() }], r = 0, f = 0, H = null, u = l = "flying", v.style.animation = "", v.style.transform = "", A("surprised"), T(Z[Math.floor(Math.random() * Z.length)], 1e3));
  }), document.addEventListener("mousemove", (t) => {
    if (!d) return;
    const c = t.clientX - $;
    $ = t.clientX, O = Math.max(-38, Math.min(38, -c * 3.2)), m = t.clientX - y, h = t.clientY - w, C.push({ x: t.clientX, y: t.clientY, t: performance.now() }), C.length > 10 && C.shift(), L += (O - L) * 0.28, O *= 0.82, v.style.transform = `rotate(${L.toFixed(1)}deg)`, ue();
  }), document.addEventListener("mouseup", () => {
    if (!d) return;
    d = !1, O = 0, A("happy");
    const t = performance.now(), c = C.filter((p) => t - p.t < 130);
    if (c.length >= 2) {
      const p = c[0], g = c[c.length - 1], B = Math.max(g.t - p.t, 5) / 16.67;
      r = Math.max(-M, Math.min(M, (g.x - p.x) / B * 0.62)), f = Math.max(-M, Math.min(M, (g.y - p.y) / B * 0.62));
    }
    u = "flying", l = "";
  }), E.addEventListener("dblclick", () => {
    d || (f = -8 - Math.random() * 2, r = (Math.random() - 0.5) * 5, u = "flying", l = "", j()), window.__bavOpenChat && window.__bavOpenChat();
  });
  let Fe = 0;
  if (E.addEventListener("touchstart", (t) => {
    t.preventDefault();
    const c = performance.now(), p = c - Fe < 320;
    if (Fe = c, p) {
      window.__bavOpenChat && window.__bavOpenChat(), j();
      return;
    }
    const g = t.touches[0];
    d = !0, y = g.clientX - m, w = g.clientY - h, $ = g.clientX, C = [{ x: g.clientX, y: g.clientY, t: performance.now() }], r = 0, f = 0, H = null, de(!1), u = l = "flying", v.style.animation = "", A("surprised"), T(Z[Math.floor(Math.random() * Z.length)], 1e3);
  }, { passive: !1 }), document.addEventListener("touchmove", (t) => {
    if (!d) return;
    t.preventDefault();
    const c = t.touches[0], p = c.clientX - $;
    $ = c.clientX, O = Math.max(-38, Math.min(38, -p * 3.2)), m = c.clientX - y, h = c.clientY - w, C.push({ x: c.clientX, y: c.clientY, t: performance.now() }), C.length > 10 && C.shift(), L += (O - L) * 0.28, O *= 0.82, v.style.transform = `rotate(${L.toFixed(1)}deg)`, ue();
  }, { passive: !1 }), document.addEventListener("touchend", () => {
    if (!d) return;
    d = !1, A("happy"), O = 0;
    const t = performance.now(), c = C.filter((p) => t - p.t < 130);
    if (c.length >= 2) {
      const p = c[0], g = c[c.length - 1], B = Math.max(g.t - p.t, 5) / 16.67;
      r = Math.max(-M, Math.min(M, (g.x - p.x) / B * 0.62)), f = Math.max(-M, Math.min(M, (g.y - p.y) / B * 0.62));
    }
    u = "flying", l = "";
  }), !matchMedia("(hover: none)").matches) {
    let R = function() {
      if (d || document.hidden) {
        requestAnimationFrame(R);
        return;
      }
      const ye = document.getElementById("bav-svg").getBoundingClientRect(), Ye = ye.width / 64, nt = X ? -1 : 1;
      [
        { base: ge, pupil: p, iris: g },
        { base: ee, pupil: B, iris: D }
      ].forEach(({ base: W, pupil: He, iris: De }) => {
        const ot = ye.left + (X ? 64 - W.x : W.x) * Ye, at = ye.top + W.y * Ye, ve = t - ot, be = c - at, we = Math.sqrt(ve * ve + be * be) || 1, Re = Math.min(we / 55, 1) * b, Pe = ve / we * Re * nt, Oe = be / we * Re;
        He.setAttribute("cx", (W.x + Pe).toFixed(2)), He.setAttribute("cy", (W.y + Oe).toFixed(2)), De.setAttribute("cx", (W.x + Pe * 0.55).toFixed(2)), De.setAttribute("cy", (W.y + Oe * 0.55).toFixed(2));
      }), requestAnimationFrame(R);
    };
    var dt = R;
    let t = window.innerWidth / 2, c = window.innerHeight / 2;
    document.addEventListener("mousemove", (P) => {
      t = P.clientX, c = P.clientY;
    });
    const p = document.getElementById("bav-pupil-l"), g = document.getElementById("bav-iris-l"), B = document.getElementById("bav-pupil-r"), D = document.getElementById("bav-iris-r"), ge = { x: 23, y: 38 }, ee = { x: 41, y: 38 }, b = 2.6;
    R();
    let G = null, K = !1;
    E.addEventListener("mousedown", () => {
      K = !1, G = setTimeout(() => {
        d && !K && (K = !0, T("🥰 Squeezing me!", 1800), [ce, le].forEach((P) => {
          P.style.transform = "scale(1.22)", setTimeout(() => P.style.transform = "scale(1)", 700);
        }));
      }, 1200);
    }), document.addEventListener("mouseup", () => clearTimeout(G));
  }
  window.addEventListener("resize", () => {
    m = Math.max(0, Math.min(innerWidth - o, m)), h = Math.max(75, Math.min(innerHeight - s - 12, h)), E.style.left = m + "px", E.style.top = h + "px";
  }), E.addEventListener("bav-teleport", (t) => {
    m = t.detail.x, h = t.detail.y, r = 0, f = 0, u = "idle", l = "", A("happy"), H = null;
  }), E.addEventListener("bav-restore", () => {
    r = (Math.random() - 0.5) * 4, f = -3, u = "flying", l = "", H = null, v.style.transform = "", A("happy");
  });
})();
(function() {
  const e = document.getElementById("bav-chat"), n = document.getElementById("bav-chat-body"), i = document.getElementById("bav-chat-form"), o = document.getElementById("bav-chat-input"), s = document.getElementById("bav-chat-close"), k = document.getElementById("bav-chat-badge"), x = document.getElementById("bav-chat-hint");
  if (x && window.innerWidth <= 768 && (x.textContent = "Double-tap to chat"), !e) return;
  e.inert = !0, [k, x].forEach((l) => {
    if (!l) return;
    ["mousedown", "touchstart"].forEach((y) => l.addEventListener(y, (w) => w.stopPropagation())), l.addEventListener("dblclick", (y) => {
      y.stopPropagation(), window.__bavOpenChat && window.__bavOpenChat();
    });
    let d = 0;
    l.addEventListener("touchend", (y) => {
      y.stopPropagation();
      const w = performance.now();
      w - d < 320 && window.__bavOpenChat && window.__bavOpenChat(), d = w;
    });
  });
  let _ = !1, F = !1;
  function q(l, d) {
    const y = document.createElement("div");
    return y.className = "bav-msg " + d, d === "user" ? y.textContent = l : y.innerHTML = l, n.appendChild(y), n.scrollTop = n.scrollHeight, y;
  }
  function Y(l) {
    const d = document.createElement("div");
    d.className = "bav-quick", l.forEach((y) => {
      const w = document.createElement("button");
      w.type = "button", w.textContent = y, w.addEventListener("click", () => {
        o.value = y, r();
      }), d.appendChild(w);
    }), n.appendChild(d), n.scrollTop = n.scrollHeight;
  }
  function M(l) {
    const d = document.createElement("div");
    d.className = "bav-typing", d.innerHTML = "<span></span><span></span><span></span>", n.appendChild(d), n.scrollTop = n.scrollHeight, setTimeout(() => {
      d.remove(), l();
    }, 500 + Math.random() * 450);
  }
  const m = [
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
  function h(l) {
    const d = l.toLowerCase(), y = m.find((w) => w.k.some((C) => d.includes(C)));
    return y ? y.a : "I'm not totally sure about that one - but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }
  function r() {
    const l = o.value.trim();
    l && (q(l, "user"), o.value = "", M(() => q(h(l), "bot")));
  }
  i.addEventListener("submit", (l) => {
    l.preventDefault(), r();
  }), o.addEventListener("keydown", (l) => {
    l.key === "Enter" && (l.preventDefault(), r());
  });
  function f() {
    F = !0, document.body.classList.add("beacon-chat-open"), e.classList.add("open"), e.setAttribute("aria-hidden", "false"), e.inert = !1, k && k.classList.add("hide"), x && x.classList.add("hide"), _ || (_ = !0, M(() => {
      q("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", "bot"), Y(["How do I verify?", "Post a help request", "Lost & Found", "Volunteer events"]);
    })), setTimeout(() => o.focus(), 250);
  }
  function u() {
    F = !1, document.body.classList.remove("beacon-chat-open"), e.classList.remove("open"), e.setAttribute("aria-hidden", "true"), e.inert = !0, document.getElementById("beacon-chat-button")?.focus();
  }
  window.__bavOpenChat = function() {
    F ? u() : f();
  }, s.addEventListener("click", u), document.addEventListener("keydown", (l) => {
    l.key === "Escape" && F && u();
  });
})();
const Ue = document.querySelector(".pillar-gallery"), it = [...Ue.querySelectorAll(".pillar-card")], Ve = matchMedia("(prefers-reduced-motion: reduce)");
let Ee = !1;
function oe() {
  Ee = !1;
  const e = Ue.getBoundingClientRect(), n = !Ve.matches && !document.body.classList.contains("motion-paused") && innerWidth > 550, i = Math.max(-1, Math.min(1, (innerHeight / 2 - e.top - e.height / 2) / innerHeight));
  it.forEach((o, s) => o.style.setProperty("--offset", n ? `${i * (s % 2 ? -58 : 58)}px` : "0px"));
}
addEventListener("scroll", () => {
  Ee || (Ee = !0, requestAnimationFrame(oe));
}, { passive: !0 });
addEventListener("resize", oe);
Ve.addEventListener("change", oe);
oe();
const a = (e) => document.querySelector(e), S = (e) => [...document.querySelectorAll(e)], ae = matchMedia("(prefers-reduced-motion: reduce)");
let N, I = ae.matches;
const Ne = setTimeout(() => document.documentElement.classList.add("world-unavailable"), 12e3);
async function st() {
  try {
    const { UnityWorld: e } = await import("./world2.js");
    N = new e(a("#unity-canvas"), () => {
      clearTimeout(Ne), document.documentElement.classList.remove("world-unavailable"), document.documentElement.classList.add("world-ready");
    });
  } catch (e) {
    clearTimeout(Ne), document.documentElement.classList.add("world-unavailable"), console.warn("The lightweight world illustration is active.", e.message);
  }
}
st();
const Xe = {
  help: [["↗", "A ladder for a little home improvement", "Al Nahda, Sharjah · Nearby", "Tools & everyday help"], ["↗", "An extra pair of hands with groceries", "Al Majaz, Sharjah · Nearby", "Community support"], ["↗", "A friendly hand setting up a laptop", "Abu Shagara, Sharjah · Nearby", "Tech help"]],
  found: [["⌕", "A set of keys, waiting to come home", "Al Majaz waterfront · Example listing", "Found"], ["⌕", "Looking for a much-loved backpack", "Al Nahda park · Example listing", "Lost"], ["⌕", "A wallet found on an evening walk", "Abu Shagara · Example listing", "Found"]],
  volunteer: [["✳", "A cleaner coast, together", "Community beach cleanup · Example event", "Environment"], ["✳", "Give a little time. Share a meal.", "Community food drive · Example event", "Community care"], ["✳", "Help someone take their next step", "Neighbourhood skills exchange · Example event", "Share a skill"]],
  news: [["↗", "Keep up with your neighbourhood", "Discover community updates in one place", "Local updates"], ["↗", "Find stories with their sources attached", "Explore the platform’s local news space", "Stay informed"], ["↗", "Know what is happening nearby", "Open the demo to explore news categories", "Community news"]]
};
function te(e, n = !1) {
  if (!Xe[e]) return;
  S("[data-preview]").forEach((k) => {
    const x = k.dataset.preview === e;
    k.setAttribute("aria-selected", String(x)), k.tabIndex = x ? 0 : -1, x && n && k.focus();
  }), a("#feature-panel").setAttribute("aria-labelledby", "tab-" + e);
  const i = a("#preview-content");
  i.replaceChildren();
  const o = { help: "Ask for groceries, transport, tools or tech support. See distance, time remaining and volunteer counts, then message a neighbour directly.", found: "Photo listings, clear Lost and Found labels, and Emirate locations. Contact the person who posted an item directly.", volunteer: "Community events sourced from Volunteers.ae, with dates, locations and direct registration links.", news: "Stories from Khaleej Times, Gulf News, Al Jazeera and BBC. Filter by source or topic in the dashboard." }, s = document.createElement("p");
  s.className = "preview-description", s.textContent = o[e], i.append(s), Xe[e].forEach(([k, x, _, F]) => {
    const q = document.createElement("article");
    q.className = "preview-item";
    const Y = document.createElement("span");
    Y.className = "preview-symbol", Y.textContent = k;
    const M = document.createElement("div"), m = document.createElement("h3");
    m.textContent = x;
    const h = document.createElement("p");
    h.textContent = _;
    const r = document.createElement("span");
    r.className = "tag", r.textContent = F, M.append(m, h, r), q.append(Y, M), i.append(q);
  });
}
S("[data-preview]").forEach((e, n) => {
  e.addEventListener("click", () => te(e.dataset.preview)), e.addEventListener("keydown", (i) => {
    const o = S("[data-preview]");
    let s;
    (i.key === "ArrowRight" || i.key === "ArrowDown") && (s = (n + 1) % o.length), (i.key === "ArrowLeft" || i.key === "ArrowUp") && (s = (n + o.length - 1) % o.length), i.key === "Home" && (s = 0), i.key === "End" && (s = o.length - 1), s !== void 0 && (i.preventDefault(), te(o[s].dataset.preview, !0));
  });
});
S("[data-select]").forEach((e) => e.addEventListener("click", () => te(e.dataset.select)));
te("help");
let $e;
function xe(e) {
  $e = document.activeElement, e.showModal(), N?.setPaused(!0);
}
function ne(e) {
  e.close(), N?.setPaused(I), $e?.focus();
}
S("dialog").forEach((e) => {
  e.querySelector("[data-close]").addEventListener("click", () => ne(e)), e.addEventListener("click", (n) => {
    if (n.target === e) {
      const i = e.getBoundingClientRect();
      (n.clientX < i.left || n.clientX > i.right || n.clientY < i.top || n.clientY > i.bottom) && ne(e);
    }
  }), e.addEventListener("close", () => {
    N?.setPaused(I), a("#menu-toggle").setAttribute("aria-expanded", "false"), e.id === "video-dialog" && a("#video-frame").removeAttribute("src");
  });
});
a("#menu-toggle").addEventListener("click", () => {
  xe(a("#navigation")), a("#menu-toggle").setAttribute("aria-expanded", "true");
});
S("#navigation a").forEach((e) => e.addEventListener("click", () => ne(a("#navigation"))));
let We;
S("[data-demo]").forEach((e) => e.addEventListener("click", () => {
  const n = a("#demo-frame"), i = e.dataset.demo || "community";
  n.getAttribute("src") || (n.src = n.dataset.src), xe(a("#demo-dialog")), clearTimeout(We);
  let o = 0;
  function s() {
    if (a("#demo-dialog").open) {
      try {
        if (n.contentWindow?.__beaconDemoReady) {
          n.contentWindow.switchTab(i);
          return;
        }
      } catch {
      }
      ++o < 100 && (We = setTimeout(s, 100));
    }
  }
  s();
}));
a("#demo-frame").addEventListener("load", () => {
  try {
    const e = a("#demo-frame").contentDocument, n = e.createElement("style");
    n.textContent = "#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}", e.head.append(n), [...e.querySelectorAll("button")].find((o) => o.textContent.trim().startsWith("Skip"))?.click();
  } catch {
  }
});
S("[data-video]").forEach((e) => e.addEventListener("click", () => {
  a("#video-frame").src = "https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0", xe(a("#video-dialog"));
}));
window.openSimDemo = () => S("[data-demo]")[0].click();
window.closeSimDemo = () => ne(a("#demo-dialog"));
function je() {
  I = !I, window._bavPaused = I, document.body.classList.toggle("motion-paused", I), N?.setPaused(I), a("#motion-toggle").textContent = I ? "Resume the world" : "Pause the world", a("#motion-toggle").setAttribute("aria-pressed", String(I)), a("#footer-motion").textContent = I ? "Resume motion" : "Pause motion";
}
a("#motion-toggle").addEventListener("click", je);
a("#footer-motion").addEventListener("click", je);
ae.addEventListener("change", (e) => {
  N && (N.reduced = e.matches, N.lastFrame = 0), I = e.matches, window._bavPaused = e.matches, document.body.classList.toggle("motion-paused", e.matches), a("#motion-toggle").setAttribute("aria-pressed", String(I));
});
a("#theme-toggle").addEventListener("click", () => {
  const e = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = e ? "dark" : "light", a("#theme-toggle").textContent = e ? "Switch to day" : "Switch to night";
  try {
    localStorage.setItem("beacon-theme", e ? "dark" : "light");
  } catch {
  }
});
try {
  localStorage.getItem("beacon-theme") === "dark" && a("#theme-toggle").click();
} catch {
}
a("#year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
const rt = S(".chapter");
let ke = !1;
function Qe() {
  ke = !1;
  const e = scrollY;
  a(".site-header").classList.toggle("scrolled", e > 60);
  const n = e > a("#story-end").offsetTop - innerHeight * 0.6;
  document.body.classList.toggle("past-story", n);
  let i = 0;
  rt.forEach((o, s) => {
    const k = o.getBoundingClientRect();
    k.top < innerHeight * 0.4 && (i = s);
    const x = o.querySelector(".chapter-copy");
    if (!ae.matches && innerWidth > 700) {
      const _ = Math.max(-30, Math.min(30, -k.top * 0.06));
      x.style.transform = `translateY(${_}px)`;
    }
  }), S("#chapter-progress a").forEach((o, s) => {
    o.classList.toggle("active", s === i), s === i ? o.setAttribute("aria-current", "step") : o.removeAttribute("aria-current");
  }), a("#chapter-number").textContent = `0${i + 1} / 05`, document.body.classList.toggle("footer-visible", a(".site-footer").getBoundingClientRect().top < innerHeight - 100);
}
addEventListener("scroll", () => {
  ke || (ke = !0, requestAnimationFrame(Qe));
}, { passive: !0 });
Qe();
const ie = a("#bav-wrap");
ie.setAttribute("role", "button");
ie.tabIndex = 0;
ie.setAttribute("aria-label", "Beacon mascot. Double-click to chat, or drag and throw to play.");
a("#bav-chat-input").setAttribute("aria-label", "Message Beacon");
a("#bav-chat-body").setAttribute("aria-live", "polite");
a("#beacon-chat-button").addEventListener("click", () => window.__bavOpenChat?.());
ie.addEventListener("keydown", (e) => {
  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), window.__bavOpenChat?.());
});
a("#beacon-hide").addEventListener("click", () => {
  const e = document.body.classList.toggle("beacon-hidden");
  a("#beacon-hide").textContent = e ? "+" : "−", a("#beacon-hide").setAttribute("aria-label", e ? "Show Beacon mascot" : "Hide Beacon mascot");
});
const z = a("#bav-svg").cloneNode(!0), ze = /* @__PURE__ */ new Map();
[z, ...z.querySelectorAll("[id]")].forEach((e) => {
  e.id && (ze.set(e.id, "chat-" + e.id), e.id = "chat-" + e.id);
});
[z, ...z.querySelectorAll("*")].forEach((e) => {
  for (const n of [...e.attributes]) {
    let i = n.value;
    ze.forEach((o, s) => {
      i = i.replaceAll("url(#" + s + ")", "url(#" + o + ")"), i === "#" + s && (i = "#" + o);
    }), i !== n.value && e.setAttribute(n.name, i);
  }
});
z.setAttribute("aria-hidden", "true");
a("#bav-chat-avatar").replaceChildren(z);
const ct = new IntersectionObserver((e) => {
  e.forEach((n) => {
    n.target.classList.toggle("in-view", n.isIntersecting);
  });
}, { threshold: 0.13 });
S(".chapter-copy,.story-signal,.section-heading,.how-steps article,.platform-explained article,.organisation-types article,.compare-row,.beyond-layout,.trust-layout").forEach((e) => {
  e.classList.add("motion-reveal"), ct.observe(e);
});
addEventListener("pointermove", (e) => {
  e.pointerType === "touch" || ae.matches || (document.documentElement.style.setProperty("--pointer-x", `${e.clientX / innerWidth * 100}%`), document.documentElement.style.setProperty("--pointer-y", `${e.clientY / innerHeight * 100}%`));
}, { passive: !0 });
const Ge = new IntersectionObserver((e) => {
  e.some((n) => n.isIntersecting) && (import("./spaces.js").catch(() => document.querySelector(".space-stage").classList.add("space-fallback")), Ge.disconnect());
}, { rootMargin: "400px" });
Ge.observe(document.querySelector(".community-spaces"));
