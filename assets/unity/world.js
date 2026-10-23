(function() {
  const e = matchMedia("(max-width: 700px)").matches, n = matchMedia("(prefers-reduced-motion: reduce)");
  window._bavPaused = n.matches;
  const i = e ? 0.88 : 1, a = Math.round(64 * i), s = Math.round(84 * i), E = 0.36, k = 0.967, _ = 0.76, Y = 0.52, q = 0.68, F = 1.8, x = 28;
  let p = window.innerWidth - 148, h = window.innerHeight * 0.32, r = -1.2, f = 0, u = "idle", l = "", d = !1, y = 0, w = 0, T = [], H = null, xe = 0, N = !1, X = !1, Me = null, se = performance.now(), W = 0, A = 0, D = 0, U = 0;
  const M = document.getElementById("bav-wrap"), v = document.getElementById("bav-anim"), re = document.getElementById("bav-svg"), Le = document.getElementById("bav-bubble"), Ke = document.getElementById("bav-msg"), Ae = document.getElementById("bav-shadow"), ce = document.getElementById("bav-el"), le = document.getElementById("bav-er"), Je = document.getElementById("bav-mth"), Ze = document.getElementById("bav-leg-l"), et = document.getElementById("bav-leg-r");
  M.style.width = a + "px", v.style.width = a + "px", v.style.height = s + "px", re.style.width = "100%", re.style.height = "100%";
  function de(t) {
    Ze.classList.toggle("swinging", t), et.classList.toggle("swinging", t);
  }
  function ue() {
    if (window._bavPaused && !d) return;
    const t = document.querySelector(".beacon-dock")?.getBoundingClientRect();
    t && p + a > t.left - 12 && p < t.right + 12 && h + s > t.top - 14 && (h = t.top - s - 14), M.style.left = p + "px", M.style.top = h + "px";
  }
  function C(t, c) {
    clearTimeout(Me), Ke.textContent = t, Le.classList.add("on"), Me = setTimeout(() => Le.classList.remove("on"), c || 3e3);
  }
  setTimeout(() => {
    C("Hi! I'm Beacon! 👋", 4e3), setTimeout(() => C("Your community guardian ✨", 3200), 4700), setTimeout(() => C("Double-click (or double-tap) me to chat! 💬", 3600), 8200);
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
    (u === "idle" || u === "sitting") && Math.random() < 0.28 && C(Te[Math.floor(Math.random() * Te.length)], 2800);
  }, 11e3);
  const Ce = {
    happy: "M22 52 Q32 59 42 52",
    surprised: "M24 53 Q32 58 40 53",
    sitting: "M23 52 Q32 57 41 52",
    flying: "M24 54 Q32 50 40 54"
  };
  function I(t) {
    Je.setAttribute("d", Ce[t] || Ce.happy), t === "surprised" && [ce, le].forEach((c) => {
      c.style.transform = "scale(1.3)", setTimeout(() => c.style.transform = "scale(1)", 550);
    });
  }
  function he() {
    X || n.matches || [ce, le].forEach((t) => {
      t.style.transform = "scaleY(0.06)", setTimeout(() => t.style.transform = "scaleY(1)", 110);
    });
  }
  function Se() {
    clearTimeout(Be);
    const t = 2600 + Math.random() * 2800;
    Be = setTimeout(() => {
      he(), Math.random() < 0.22 && setTimeout(he, 300), Se();
    }, t);
  }
  let Be;
  setTimeout(() => {
    he(), Se();
  }, 1800 + Math.random() * 1200);
  function V() {
    X || n.matches || (X = !0, v.style.animation = "none", v.offsetHeight, v.style.animation = "bav-squish .46s cubic-bezier(.36,.07,.19,.97) forwards", I("surprised"), setTimeout(() => {
      X = !1, v.style.animation = "", Ie(), I(u === "sitting" ? "sitting" : "happy");
    }, 460));
  }
  function Ie() {
    if (!(X || n.matches))
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
  function K() {
    _e = Array.from(document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,p,.ftitle,.stitle,.ctat,.nname,.pct,.ft,.tname,.rpt,figcaption,dt,dd"
    )).map((t) => ({ el: t, r: t.getBoundingClientRect() })).filter(({ r: t, el: c }) => t.width > 120 && t.height > 20 && t.bottom > 0 && t.top < window.innerHeight && !c.closest("#bav-chat,dialog,.beacon-dock,#bav-root") && c.textContent.trim().length > 8);
  }
  K(), setInterval(K, 700);
  let me = !1;
  window.addEventListener("scroll", () => {
    me || (me = !0, requestAnimationFrame(() => {
      me = !1, K();
    }));
  }, { passive: !0 }), window.addEventListener("resize", K, { passive: !0 });
  function tt() {
    if (d) return null;
    const t = h + s, c = p + a * 0.5;
    for (const { el: m, r: g } of _e)
      if (Math.abs(t - g.top) < 28 && c > g.left + 10 && c < g.right - 10 && g.top > 55)
        return { el: m, snapY: g.top - s };
    return null;
  }
  const $ = ["Oof! 😅", "Wheee! 🌀", "Boing! 🎯", "Hey! 😄", "Woo! 💫"], J = ["Whoa! 😲", "Wee! 🚀", "Flying! 🌟", "Catch me! 😄"], qe = ["Nice read! 📖", "Interesting! 🤔", "Love this! ✨", "Reading... 👀"];
  function pe(t) {
    if (window._bavPaused || document.hidden || document.body.classList.contains("beacon-hidden") || document.body.classList.contains("beacon-chat-open") || document.querySelector("dialog[open]")) {
      se = t, requestAnimationFrame(pe);
      return;
    }
    const c = t - se;
    se = t;
    const m = Math.min(c / 16.67, 3), g = window.innerWidth, L = window.innerHeight - 12;
    if (p = Math.max(0, Math.min(g - a, p)), h = Math.max(75, Math.min(L - s, h)), !d) {
      if (u === "sitting" && H) {
        const b = H.getBoundingClientRect(), j = b.top > 55 && b.top < L + 20, P = p + a * 0.5, ee = P > b.left - 10 && P < b.right + 10;
        if (j && ee)
          h = b.top - s + 12, f = 0, r *= _;
        else {
          H = null, u = "flying", de(!1), f = -1.5;
          const Q = ["Whoa! 😱", "Aaaaah! 😵", "Not again! 😤", "Slipping! 🫨", "Noooo! 😩", "Help! 🙈", "Gravity wins 😔", "See ya! 👋", "Wheee... 😬", "Oh no no no! 😰"];
          C(Q[Math.floor(Math.random() * Q.length)], 1500);
        }
      } else {
        const b = tt();
        if (b && Math.abs(f) < 7)
          (u !== "sitting" || H !== b.el) && (H = b.el, xe = b.snapY, u = "sitting", f = 0, r *= 0.35, h = xe, V(), I("sitting"), de(!0), (Math.abs(r) > 1.2 || Math.abs(f) > 2) && C(qe[Math.floor(Math.random() * qe.length)], 2400));
        else {
          f = Math.min(f + E * m, x), r *= Math.pow(k, m), p += r * m, h += f * m, p < 0 && (p = 0, Math.abs(r) > F ? (r = Math.abs(r) * q, V(), Math.random() < 0.4 && C($[Math.floor(Math.random() * $.length)], 1500)) : r = 0, N = !1), p + a > g && (p = g - a, Math.abs(r) > F ? (r = -Math.abs(r) * q, V(), Math.random() < 0.4 && C($[Math.floor(Math.random() * $.length)], 1500)) : r = 0, N = !0), h + s > L && (h = L - s, Math.abs(f) > F ? (f = -Math.abs(f) * Y, r *= _, V(), Math.random() < 0.28 && C($[Math.floor(Math.random() * $.length)], 1500)) : (f = 0, r *= _, u !== "sitting" && (u = Math.abs(r) > 1.1 ? "walking" : "idle"))), h < 0 && (h = 0, f = Math.abs(f) * Y);
          const j = Math.sqrt(r * r + f * f);
          u !== "sitting" && (j > 3.5 ? u = "flying" : Math.abs(r) > 1 && h + s >= L - 2 ? u = "walking" : j < 0.7 && (u = "idle"));
        }
      }
      if (r < -0.3 && (N = !0), r > 0.3 && (N = !1), u === "flying") {
        const b = Math.max(-30, Math.min(30, r * 2.8));
        W += (b - W) * 0.18 * m, A += (0 - A) * 0.12 * m, v.style.transform = `rotate(${(W + A).toFixed(2)}deg)`;
      } else {
        W *= 0.8, A += (0 - A) * 0.14 * m;
        const b = W + A;
        Math.abs(b) < 0.2 ? (W = 0, A = 0, v.style.transform = "") : v.style.transform = `rotate(${b.toFixed(2)}deg)`;
      }
      re.style.transform = `scaleX(${N ? -1 : 1})`;
      const fe = Math.max(0, L - (h + s)), Z = Math.max(0.15, 1 - fe / L);
      Ae.style.width = 38 * Z + "px", Ae.style.opacity = (0.72 * Z).toString(), u !== l && !X && (Ie(), I(u === "sitting" ? "sitting" : u === "flying" ? "flying" : "happy"), l = u);
    }
    ue(), requestAnimationFrame(pe);
  }
  M.style.left = p + "px", M.style.top = h + "px", requestAnimationFrame(pe), M.addEventListener("mouseenter", () => document.body.classList.add("hov")), M.addEventListener("mouseleave", () => document.body.classList.remove("hov")), M.addEventListener("mousedown", (t) => {
    t.button === 0 && (t.preventDefault(), d = !0, y = t.clientX - p, w = t.clientY - h, U = t.clientX, T = [{ x: t.clientX, y: t.clientY, t: performance.now() }], r = 0, f = 0, H = null, u = l = "flying", v.style.animation = "", v.style.transform = "", I("surprised"), C(J[Math.floor(Math.random() * J.length)], 1e3));
  }), document.addEventListener("mousemove", (t) => {
    if (!d) return;
    const c = t.clientX - U;
    U = t.clientX, D = Math.max(-38, Math.min(38, -c * 3.2)), p = t.clientX - y, h = t.clientY - w, T.push({ x: t.clientX, y: t.clientY, t: performance.now() }), T.length > 10 && T.shift(), A += (D - A) * 0.28, D *= 0.82, v.style.transform = `rotate(${A.toFixed(1)}deg)`, ue();
  }), document.addEventListener("mouseup", () => {
    if (!d) return;
    d = !1, D = 0, I("happy");
    const t = performance.now(), c = T.filter((m) => t - m.t < 130);
    if (c.length >= 2) {
      const m = c[0], g = c[c.length - 1], L = Math.max(g.t - m.t, 5) / 16.67;
      r = Math.max(-x, Math.min(x, (g.x - m.x) / L * 0.62)), f = Math.max(-x, Math.min(x, (g.y - m.y) / L * 0.62));
    }
    u = "flying", l = "";
  }), M.addEventListener("dblclick", () => {
    d || (f = -8 - Math.random() * 2, r = (Math.random() - 0.5) * 5, u = "flying", l = "", V()), window.__bavOpenChat && window.__bavOpenChat();
  });
  let Ye = 0;
  if (M.addEventListener("touchstart", (t) => {
    t.preventDefault();
    const c = performance.now(), m = c - Ye < 320;
    if (Ye = c, m) {
      window.__bavOpenChat && window.__bavOpenChat(), V();
      return;
    }
    const g = t.touches[0];
    d = !0, y = g.clientX - p, w = g.clientY - h, U = g.clientX, T = [{ x: g.clientX, y: g.clientY, t: performance.now() }], r = 0, f = 0, H = null, de(!1), u = l = "flying", v.style.animation = "", I("surprised"), C(J[Math.floor(Math.random() * J.length)], 1e3);
  }, { passive: !1 }), document.addEventListener("touchmove", (t) => {
    if (!d) return;
    t.preventDefault();
    const c = t.touches[0], m = c.clientX - U;
    U = c.clientX, D = Math.max(-38, Math.min(38, -m * 3.2)), p = c.clientX - y, h = c.clientY - w, T.push({ x: c.clientX, y: c.clientY, t: performance.now() }), T.length > 10 && T.shift(), A += (D - A) * 0.28, D *= 0.82, v.style.transform = `rotate(${A.toFixed(1)}deg)`, ue();
  }, { passive: !1 }), document.addEventListener("touchend", () => {
    if (!d) return;
    d = !1, I("happy"), D = 0;
    const t = performance.now(), c = T.filter((m) => t - m.t < 130);
    if (c.length >= 2) {
      const m = c[0], g = c[c.length - 1], L = Math.max(g.t - m.t, 5) / 16.67;
      r = Math.max(-x, Math.min(x, (g.x - m.x) / L * 0.62)), f = Math.max(-x, Math.min(x, (g.y - m.y) / L * 0.62));
    }
    u = "flying", l = "";
  }), !matchMedia("(hover: none)").matches) {
    let P = function() {
      if (d || document.hidden) {
        requestAnimationFrame(P);
        return;
      }
      const ge = document.getElementById("bav-svg").getBoundingClientRect(), Fe = ge.width / 64, nt = N ? -1 : 1;
      [
        { base: Z, pupil: m, iris: g },
        { base: b, pupil: L, iris: fe }
      ].forEach(({ base: O, pupil: He, iris: De }) => {
        const ot = ge.left + (N ? 64 - O.x : O.x) * Fe, at = ge.top + O.y * Fe, ye = t - ot, ve = c - at, be = Math.sqrt(ye * ye + ve * ve) || 1, Re = Math.min(be / 55, 1) * j, Ne = ye / be * Re * nt, Pe = ve / be * Re;
        He.setAttribute("cx", (O.x + Ne).toFixed(2)), He.setAttribute("cy", (O.y + Pe).toFixed(2)), De.setAttribute("cx", (O.x + Ne * 0.55).toFixed(2)), De.setAttribute("cy", (O.y + Pe * 0.55).toFixed(2));
      }), requestAnimationFrame(P);
    };
    var dt = P;
    let t = window.innerWidth / 2, c = window.innerHeight / 2;
    document.addEventListener("mousemove", (z) => {
      t = z.clientX, c = z.clientY;
    });
    const m = document.getElementById("bav-pupil-l"), g = document.getElementById("bav-iris-l"), L = document.getElementById("bav-pupil-r"), fe = document.getElementById("bav-iris-r"), Z = { x: 23, y: 38 }, b = { x: 41, y: 38 }, j = 2.6;
    P();
    let ee = null, Q = !1;
    M.addEventListener("mousedown", () => {
      Q = !1, ee = setTimeout(() => {
        d && !Q && (Q = !0, C("🥰 Squeezing me!", 1800), [ce, le].forEach((z) => {
          z.style.transform = "scale(1.22)", setTimeout(() => z.style.transform = "scale(1)", 700);
        }));
      }, 1200);
    }), document.addEventListener("mouseup", () => clearTimeout(ee));
  }
  window.addEventListener("resize", () => {
    p = Math.max(0, Math.min(innerWidth - a, p)), h = Math.max(75, Math.min(innerHeight - s - 12, h)), M.style.left = p + "px", M.style.top = h + "px";
  }), M.addEventListener("bav-teleport", (t) => {
    p = t.detail.x, h = t.detail.y, r = 0, f = 0, u = "idle", l = "", H = null;
  }), M.addEventListener("bav-restore", () => {
    r = (Math.random() - 0.5) * 4, f = -3, u = "flying", l = "", H = null, v.style.transform = "", I("happy");
  });
})();
(function() {
  const e = document.getElementById("bav-chat"), n = document.getElementById("bav-chat-body"), i = document.getElementById("bav-chat-form"), a = document.getElementById("bav-chat-input"), s = document.getElementById("bav-chat-close"), E = document.getElementById("bav-chat-badge"), k = document.getElementById("bav-chat-hint");
  if (k && window.innerWidth <= 768 && (k.textContent = "Double-tap to chat"), !e) return;
  e.inert = !0, [E, k].forEach((l) => {
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
  let _ = !1, Y = !1;
  function q(l, d) {
    const y = document.createElement("div");
    return y.className = "bav-msg " + d, d === "user" ? y.textContent = l : y.innerHTML = l, n.appendChild(y), n.scrollTop = n.scrollHeight, y;
  }
  function F(l) {
    const d = document.createElement("div");
    d.className = "bav-quick", l.forEach((y) => {
      const w = document.createElement("button");
      w.type = "button", w.textContent = y, w.addEventListener("click", () => {
        a.value = y, r();
      }), d.appendChild(w);
    }), n.appendChild(d), n.scrollTop = n.scrollHeight;
  }
  function x(l) {
    const d = document.createElement("div");
    d.className = "bav-typing", d.innerHTML = "<span></span><span></span><span></span>", n.appendChild(d), n.scrollTop = n.scrollHeight, setTimeout(() => {
      d.remove(), l();
    }, 500 + Math.random() * 450);
  }
  const p = [
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
    const d = l.toLowerCase(), y = p.find((w) => w.k.some((T) => d.includes(T)));
    return y ? y.a : "I'm not totally sure about that one - but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }
  function r() {
    const l = a.value.trim();
    l && (q(l, "user"), a.value = "", x(() => q(h(l), "bot")));
  }
  i.addEventListener("submit", (l) => {
    l.preventDefault(), r();
  }), a.addEventListener("keydown", (l) => {
    l.key === "Enter" && (l.preventDefault(), r());
  });
  function f() {
    Y = !0, document.body.classList.add("beacon-chat-open"), e.classList.add("open"), e.setAttribute("aria-hidden", "false"), e.inert = !1, E && E.classList.add("hide"), k && k.classList.add("hide"), _ || (_ = !0, x(() => {
      q("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", "bot"), F(["How do I verify?", "Post a help request", "Lost & Found", "Volunteer events"]);
    })), setTimeout(() => a.focus(), 250);
  }
  function u() {
    Y = !1, document.body.classList.remove("beacon-chat-open"), e.classList.remove("open"), e.setAttribute("aria-hidden", "true"), e.inert = !0, document.getElementById("beacon-chat-button")?.focus();
  }
  window.__bavOpenChat = function() {
    Y ? u() : f();
  }, s.addEventListener("click", u), document.addEventListener("keydown", (l) => {
    l.key === "Escape" && Y && u();
  });
})();
const Ue = document.querySelector(".pillar-gallery"), it = [...Ue.querySelectorAll(".pillar-card")], Ve = matchMedia("(prefers-reduced-motion: reduce)");
let we = !1;
function oe() {
  we = !1;
  const e = Ue.getBoundingClientRect(), n = !Ve.matches && !document.body.classList.contains("motion-paused") && innerWidth > 550, i = Math.max(-1, Math.min(1, (innerHeight / 2 - e.top - e.height / 2) / innerHeight));
  it.forEach((a, s) => a.style.setProperty("--offset", n ? `${i * (s % 2 ? -58 : 58)}px` : "0px"));
}
addEventListener("scroll", () => {
  we || (we = !0, requestAnimationFrame(oe));
}, { passive: !0 });
addEventListener("resize", oe);
Ve.addEventListener("change", oe);
oe();
const o = (e) => document.querySelector(e), B = (e) => [...document.querySelectorAll(e)], ae = matchMedia("(prefers-reduced-motion: reduce)");
let R, S = ae.matches;
const Oe = setTimeout(() => document.documentElement.classList.add("world-unavailable"), 12e3);
async function st() {
  try {
    const { UnityWorld: e } = await import("./world2.js");
    R = new e(o("#unity-canvas"), () => {
      clearTimeout(Oe), document.documentElement.classList.remove("world-unavailable"), document.documentElement.classList.add("world-ready");
    });
  } catch (e) {
    clearTimeout(Oe), document.documentElement.classList.add("world-unavailable"), console.warn("The lightweight world illustration is active.", e.message);
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
  B("[data-preview]").forEach((E) => {
    const k = E.dataset.preview === e;
    E.setAttribute("aria-selected", String(k)), E.tabIndex = k ? 0 : -1, k && n && E.focus();
  }), o("#feature-panel").setAttribute("aria-labelledby", "tab-" + e);
  const i = o("#preview-content");
  i.replaceChildren();
  const a = { help: "Ask for groceries, transport, tools or tech support. See distance, time remaining and volunteer counts, then message a neighbour directly.", found: "Photo listings, clear Lost and Found labels, and Emirate locations. Contact the person who posted an item directly.", volunteer: "Community events sourced from Volunteers.ae, with dates, locations and direct registration links.", news: "Stories from Khaleej Times, Gulf News, Al Jazeera and BBC. Filter by source or topic in the dashboard." }, s = document.createElement("p");
  s.className = "preview-description", s.textContent = a[e], i.append(s), Xe[e].forEach(([E, k, _, Y]) => {
    const q = document.createElement("article");
    q.className = "preview-item";
    const F = document.createElement("span");
    F.className = "preview-symbol", F.textContent = E;
    const x = document.createElement("div"), p = document.createElement("h3");
    p.textContent = k;
    const h = document.createElement("p");
    h.textContent = _;
    const r = document.createElement("span");
    r.className = "tag", r.textContent = Y, x.append(p, h, r), q.append(F, x), i.append(q);
  });
}
B("[data-preview]").forEach((e, n) => {
  e.addEventListener("click", () => te(e.dataset.preview)), e.addEventListener("keydown", (i) => {
    const a = B("[data-preview]");
    let s;
    (i.key === "ArrowRight" || i.key === "ArrowDown") && (s = (n + 1) % a.length), (i.key === "ArrowLeft" || i.key === "ArrowUp") && (s = (n + a.length - 1) % a.length), i.key === "Home" && (s = 0), i.key === "End" && (s = a.length - 1), s !== void 0 && (i.preventDefault(), te(a[s].dataset.preview, !0));
  });
});
B("[data-select]").forEach((e) => e.addEventListener("click", () => te(e.dataset.select)));
te("help");
let $e;
function ke(e) {
  $e = document.activeElement, e.showModal(), R?.setPaused(!0);
}
function ne(e) {
  e.close(), R?.setPaused(S), $e?.focus();
}
B("dialog").forEach((e) => {
  e.querySelector("[data-close]").addEventListener("click", () => ne(e)), e.addEventListener("click", (n) => {
    if (n.target === e) {
      const i = e.getBoundingClientRect();
      (n.clientX < i.left || n.clientX > i.right || n.clientY < i.top || n.clientY > i.bottom) && ne(e);
    }
  }), e.addEventListener("close", () => {
    R?.setPaused(S), o("#menu-toggle").setAttribute("aria-expanded", "false"), e.id === "video-dialog" && o("#video-frame").removeAttribute("src");
  });
});
o("#menu-toggle").addEventListener("click", () => {
  ke(o("#navigation")), o("#menu-toggle").setAttribute("aria-expanded", "true");
});
B("#navigation a").forEach((e) => e.addEventListener("click", () => ne(o("#navigation"))));
let We;
B("[data-demo]").forEach((e) => e.addEventListener("click", () => {
  const n = o("#demo-frame"), i = e.dataset.demo || "community";
  n.getAttribute("src") || (n.src = n.dataset.src), ke(o("#demo-dialog")), clearTimeout(We);
  let a = 0;
  function s() {
    if (o("#demo-dialog").open) {
      try {
        if (n.contentWindow?.__beaconDemoReady) {
          n.contentWindow.switchTab(i);
          return;
        }
      } catch {
      }
      ++a < 100 && (We = setTimeout(s, 100));
    }
  }
  s();
}));
o("#demo-frame").addEventListener("load", () => {
  try {
    const e = o("#demo-frame").contentDocument, n = e.createElement("style");
    n.textContent = "#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}", e.head.append(n), [...e.querySelectorAll("button")].find((a) => a.textContent.trim().startsWith("Skip"))?.click();
  } catch {
  }
});
B("[data-video]").forEach((e) => e.addEventListener("click", () => {
  o("#video-frame").src = "https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0", ke(o("#video-dialog"));
}));
window.openSimDemo = () => B("[data-demo]")[0].click();
window.closeSimDemo = () => ne(o("#demo-dialog"));
function je() {
  S = !S, window._bavPaused = S, document.body.classList.toggle("motion-paused", S), R?.setPaused(S), o("#motion-toggle").textContent = S ? "Resume the world" : "Pause the world", o("#motion-toggle").setAttribute("aria-pressed", String(S)), o("#footer-motion").textContent = S ? "Resume motion" : "Pause motion";
}
o("#motion-toggle").addEventListener("click", je);
o("#footer-motion").addEventListener("click", je);
ae.addEventListener("change", (e) => {
  R && (R.reduced = e.matches, R.lastFrame = 0), S = e.matches, window._bavPaused = e.matches, document.body.classList.toggle("motion-paused", e.matches), o("#motion-toggle").setAttribute("aria-pressed", String(S));
});
o("#theme-toggle").addEventListener("click", () => {
  const e = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = e ? "dark" : "light", o("#theme-toggle").textContent = e ? "Switch to day" : "Switch to night";
  try {
    localStorage.setItem("beacon-theme", e ? "dark" : "light");
  } catch {
  }
});
try {
  localStorage.getItem("beacon-theme") === "dark" && o("#theme-toggle").click();
} catch {
}
o("#year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
const rt = B(".chapter");
let Ee = !1;
function Qe() {
  Ee = !1;
  const e = scrollY;
  o(".site-header").classList.toggle("scrolled", e > 60);
  const n = e > o("#story-end").offsetTop - innerHeight * 0.6;
  document.body.classList.toggle("past-story", n);
  let i = 0;
  rt.forEach((a, s) => {
    const E = a.getBoundingClientRect();
    E.top < innerHeight * 0.4 && (i = s);
    const k = a.querySelector(".chapter-copy");
    if (!ae.matches && innerWidth > 700) {
      const _ = Math.max(-30, Math.min(30, -E.top * 0.06));
      k.style.transform = `translateY(${_}px)`;
    }
  }), B("#chapter-progress a").forEach((a, s) => {
    a.classList.toggle("active", s === i), s === i ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current");
  }), o("#chapter-number").textContent = `0${i + 1} / 05`, document.body.classList.toggle("footer-visible", o(".site-footer").getBoundingClientRect().top < innerHeight - 100);
}
addEventListener("scroll", () => {
  Ee || (Ee = !0, requestAnimationFrame(Qe));
}, { passive: !0 });
Qe();
const ie = o("#bav-wrap");
ie.setAttribute("role", "button");
ie.tabIndex = 0;
ie.setAttribute("aria-label", "Beacon mascot. Double-click to chat, or drag and throw to play.");
o("#bav-chat-input").setAttribute("aria-label", "Message Beacon");
o("#bav-chat-body").setAttribute("aria-live", "polite");
o("#beacon-chat-button").addEventListener("click", () => window.__bavOpenChat?.());
ie.addEventListener("keydown", (e) => {
  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), window.__bavOpenChat?.());
});
o("#beacon-hide").addEventListener("click", () => {
  const e = document.body.classList.toggle("beacon-hidden");
  o("#beacon-hide").textContent = e ? "+" : "−", o("#beacon-hide").setAttribute("aria-label", e ? "Show Beacon mascot" : "Hide Beacon mascot");
});
const G = o("#bav-svg").cloneNode(!0), ze = /* @__PURE__ */ new Map();
[G, ...G.querySelectorAll("[id]")].forEach((e) => {
  e.id && (ze.set(e.id, "chat-" + e.id), e.id = "chat-" + e.id);
});
[G, ...G.querySelectorAll("*")].forEach((e) => {
  for (const n of [...e.attributes]) {
    let i = n.value;
    ze.forEach((a, s) => {
      i = i.replaceAll("url(#" + s + ")", "url(#" + a + ")"), i === "#" + s && (i = "#" + a);
    }), i !== n.value && e.setAttribute(n.name, i);
  }
});
G.setAttribute("aria-hidden", "true");
o("#bav-chat-avatar").replaceChildren(G);
const ct = new IntersectionObserver((e) => {
  e.forEach((n) => {
    n.target.classList.toggle("in-view", n.isIntersecting);
  });
}, { threshold: 0.13 });
B(".chapter-copy,.story-signal,.section-heading,.how-steps article,.platform-explained article,.organisation-types article,.compare-row,.beyond-layout,.trust-layout").forEach((e) => {
  e.classList.add("motion-reveal"), ct.observe(e);
});
addEventListener("pointermove", (e) => {
  e.pointerType === "touch" || ae.matches || (document.documentElement.style.setProperty("--pointer-x", `${e.clientX / innerWidth * 100}%`), document.documentElement.style.setProperty("--pointer-y", `${e.clientY / innerHeight * 100}%`));
}, { passive: !0 });
const Ge = new IntersectionObserver((e) => {
  e.some((n) => n.isIntersecting) && (import("./spaces.js").catch(() => document.querySelector(".space-stage").classList.add("space-fallback")), Ge.disconnect());
}, { rootMargin: "400px" });
Ge.observe(document.querySelector(".community-spaces"));
