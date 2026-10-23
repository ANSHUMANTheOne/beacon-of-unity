(function() {
  const e = matchMedia("(max-width: 700px)").matches, n = matchMedia("(prefers-reduced-motion: reduce)");
  window._bavPaused = n.matches;
  const s = e ? 0.88 : 1, r = Math.round(64 * s), c = Math.round(84 * s), E = 0.36, k = 0.967, Y = 0.76, q = 0.52, _ = 0.68, F = 1.8, x = 28;
  let g = window.innerWidth - 148, h = window.innerHeight * 0.32, a = -1.2, p = 0, u = "idle", l = "", d = !1, y = 0, w = 0, C = [], H = null, xe = 0, P = !1, X = !1, Me = null, se = performance.now(), W = 0, A = 0, D = 0, U = 0;
  const M = document.getElementById("bav-wrap"), v = document.getElementById("bav-anim"), re = document.getElementById("bav-svg"), Le = document.getElementById("bav-bubble"), Ge = document.getElementById("bav-msg"), Ae = document.getElementById("bav-shadow"), le = document.getElementById("bav-el"), ce = document.getElementById("bav-er"), Ke = document.getElementById("bav-mth"), Je = document.getElementById("bav-leg-l"), Ze = document.getElementById("bav-leg-r");
  M.style.width = r + "px", v.style.width = r + "px", v.style.height = c + "px", re.style.width = "100%", re.style.height = "100%";
  function de(t) {
    Je.classList.toggle("swinging", t), Ze.classList.toggle("swinging", t);
  }
  function ue() {
    window._bavPaused && !d || (M.style.left = g + "px", M.style.top = h + "px");
  }
  function T(t, i) {
    clearTimeout(Me), Ge.textContent = t, Le.classList.add("on"), Me = setTimeout(() => Le.classList.remove("on"), i || 3e3);
  }
  setTimeout(() => {
    T("Hi! I'm Beacon! 👋", 4e3), setTimeout(() => T("Your community guardian ✨", 3200), 4700), setTimeout(() => T("Double-click (or double-tap) me to chat! 💬", 3600), 8200);
  }, 1400);
  const Ce = [
    "🛡️ Keeping UAE safe!",
    "🤝 Community first!",
    "🇦🇪 Proud to serve!",
    "✨ Beacon of Unity",
    "💪 Together we rise",
    "🌟 Verified & trusted"
  ];
  setInterval(() => {
    (u === "idle" || u === "sitting") && Math.random() < 0.28 && T(Ce[Math.floor(Math.random() * Ce.length)], 2800);
  }, 11e3);
  const Te = {
    happy: "M22 52 Q32 59 42 52",
    surprised: "M24 53 Q32 58 40 53",
    sitting: "M23 52 Q32 57 41 52",
    flying: "M24 54 Q32 50 40 54"
  };
  function I(t) {
    Ke.setAttribute("d", Te[t] || Te.happy), t === "surprised" && [le, ce].forEach((i) => {
      i.style.transform = "scale(1.3)", setTimeout(() => i.style.transform = "scale(1)", 550);
    });
  }
  function he() {
    X || n.matches || [le, ce].forEach((t) => {
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
  let Ye = [];
  function K() {
    Ye = Array.from(document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,p,.ftitle,.stitle,.ctat,.nname,.pct,.ft,.tname,.rpt,figcaption,dt,dd"
    )).map((t) => ({ el: t, r: t.getBoundingClientRect() })).filter(({ r: t, el: i }) => t.width > 120 && t.height > 20 && t.bottom > 0 && t.top < window.innerHeight && !i.closest("#bav-chat,dialog,.beacon-dock,#bav-root") && i.textContent.trim().length > 8);
  }
  K(), setInterval(K, 700);
  let me = !1;
  window.addEventListener("scroll", () => {
    me || (me = !0, requestAnimationFrame(() => {
      me = !1, K();
    }));
  }, { passive: !0 }), window.addEventListener("resize", K, { passive: !0 });
  function et() {
    if (d) return null;
    const t = h + c, i = g + r * 0.5;
    for (const { el: m, r: f } of Ye)
      if (Math.abs(t - f.top) < 28 && i > f.left + 10 && i < f.right - 10 && f.top > 55)
        return { el: m, snapY: f.top - c };
    return null;
  }
  const $ = ["Oof! 😅", "Wheee! 🌀", "Boing! 🎯", "Hey! 😄", "Woo! 💫"], J = ["Whoa! 😲", "Wee! 🚀", "Flying! 🌟", "Catch me! 😄"], _e = ["Nice read! 📖", "Interesting! 🤔", "Love this! ✨", "Reading... 👀"];
  function pe(t) {
    if (window._bavPaused || document.hidden || document.body.classList.contains("beacon-hidden") || document.body.classList.contains("beacon-chat-open") || document.querySelector("dialog[open]")) {
      se = t, requestAnimationFrame(pe);
      return;
    }
    const i = t - se;
    se = t;
    const m = Math.min(i / 16.67, 3), f = window.innerWidth, L = window.innerHeight - 12;
    if (g = Math.max(0, Math.min(f - r, g)), h = Math.max(75, Math.min(L - c, h)), !d) {
      if (u === "sitting" && H) {
        const b = H.getBoundingClientRect(), j = b.top > 55 && b.top < L + 20, N = g + r * 0.5, ee = N > b.left - 10 && N < b.right + 10;
        if (j && ee)
          h = b.top - c + 12, p = 0, a *= Y;
        else {
          H = null, u = "flying", de(!1), p = -1.5;
          const Q = ["Whoa! 😱", "Aaaaah! 😵", "Not again! 😤", "Slipping! 🫨", "Noooo! 😩", "Help! 🙈", "Gravity wins 😔", "See ya! 👋", "Wheee... 😬", "Oh no no no! 😰"];
          T(Q[Math.floor(Math.random() * Q.length)], 1500);
        }
      } else {
        const b = et();
        if (b && Math.abs(p) < 7)
          (u !== "sitting" || H !== b.el) && (H = b.el, xe = b.snapY, u = "sitting", p = 0, a *= 0.35, h = xe, V(), I("sitting"), de(!0), (Math.abs(a) > 1.2 || Math.abs(p) > 2) && T(_e[Math.floor(Math.random() * _e.length)], 2400));
        else {
          p = Math.min(p + E * m, x), a *= Math.pow(k, m), g += a * m, h += p * m, g < 0 && (g = 0, Math.abs(a) > F ? (a = Math.abs(a) * _, V(), Math.random() < 0.4 && T($[Math.floor(Math.random() * $.length)], 1500)) : a = 0, P = !1), g + r > f && (g = f - r, Math.abs(a) > F ? (a = -Math.abs(a) * _, V(), Math.random() < 0.4 && T($[Math.floor(Math.random() * $.length)], 1500)) : a = 0, P = !0), h + c > L && (h = L - c, Math.abs(p) > F ? (p = -Math.abs(p) * q, a *= Y, V(), Math.random() < 0.28 && T($[Math.floor(Math.random() * $.length)], 1500)) : (p = 0, a *= Y, u !== "sitting" && (u = Math.abs(a) > 1.1 ? "walking" : "idle"))), h < 0 && (h = 0, p = Math.abs(p) * q);
          const j = Math.sqrt(a * a + p * p);
          u !== "sitting" && (j > 3.5 ? u = "flying" : Math.abs(a) > 1 && h + c >= L - 2 ? u = "walking" : j < 0.7 && (u = "idle"));
        }
      }
      if (a < -0.3 && (P = !0), a > 0.3 && (P = !1), u === "flying") {
        const b = Math.max(-30, Math.min(30, a * 2.8));
        W += (b - W) * 0.18 * m, A += (0 - A) * 0.12 * m, v.style.transform = `rotate(${(W + A).toFixed(2)}deg)`;
      } else {
        W *= 0.8, A += (0 - A) * 0.14 * m;
        const b = W + A;
        Math.abs(b) < 0.2 ? (W = 0, A = 0, v.style.transform = "") : v.style.transform = `rotate(${b.toFixed(2)}deg)`;
      }
      re.style.transform = `scaleX(${P ? -1 : 1})`;
      const fe = Math.max(0, L - (h + c)), Z = Math.max(0.15, 1 - fe / L);
      Ae.style.width = 38 * Z + "px", Ae.style.opacity = (0.72 * Z).toString(), u !== l && !X && (Ie(), I(u === "sitting" ? "sitting" : u === "flying" ? "flying" : "happy"), l = u);
    }
    ue(), requestAnimationFrame(pe);
  }
  M.style.left = g + "px", M.style.top = h + "px", requestAnimationFrame(pe), M.addEventListener("mouseenter", () => document.body.classList.add("hov")), M.addEventListener("mouseleave", () => document.body.classList.remove("hov")), M.addEventListener("mousedown", (t) => {
    t.button === 0 && (t.preventDefault(), d = !0, y = t.clientX - g, w = t.clientY - h, U = t.clientX, C = [{ x: t.clientX, y: t.clientY, t: performance.now() }], a = 0, p = 0, H = null, u = l = "flying", v.style.animation = "", v.style.transform = "", I("surprised"), T(J[Math.floor(Math.random() * J.length)], 1e3));
  }), document.addEventListener("mousemove", (t) => {
    if (!d) return;
    const i = t.clientX - U;
    U = t.clientX, D = Math.max(-38, Math.min(38, -i * 3.2)), g = t.clientX - y, h = t.clientY - w, C.push({ x: t.clientX, y: t.clientY, t: performance.now() }), C.length > 10 && C.shift(), A += (D - A) * 0.28, D *= 0.82, v.style.transform = `rotate(${A.toFixed(1)}deg)`, ue();
  }), document.addEventListener("mouseup", () => {
    if (!d) return;
    d = !1, D = 0, I("happy");
    const t = performance.now(), i = C.filter((m) => t - m.t < 130);
    if (i.length >= 2) {
      const m = i[0], f = i[i.length - 1], L = Math.max(f.t - m.t, 5) / 16.67;
      a = Math.max(-x, Math.min(x, (f.x - m.x) / L * 0.62)), p = Math.max(-x, Math.min(x, (f.y - m.y) / L * 0.62));
    }
    u = "flying", l = "";
  }), M.addEventListener("dblclick", () => {
    d || (p = -8 - Math.random() * 2, a = (Math.random() - 0.5) * 5, u = "flying", l = "", V()), window.__bavOpenChat && window.__bavOpenChat();
  });
  let qe = 0;
  if (M.addEventListener("touchstart", (t) => {
    t.preventDefault();
    const i = performance.now(), m = i - qe < 320;
    if (qe = i, m) {
      window.__bavOpenChat && window.__bavOpenChat(), V();
      return;
    }
    const f = t.touches[0];
    d = !0, y = f.clientX - g, w = f.clientY - h, U = f.clientX, C = [{ x: f.clientX, y: f.clientY, t: performance.now() }], a = 0, p = 0, H = null, de(!1), u = l = "flying", v.style.animation = "", I("surprised"), T(J[Math.floor(Math.random() * J.length)], 1e3);
  }, { passive: !1 }), document.addEventListener("touchmove", (t) => {
    if (!d) return;
    t.preventDefault();
    const i = t.touches[0], m = i.clientX - U;
    U = i.clientX, D = Math.max(-38, Math.min(38, -m * 3.2)), g = i.clientX - y, h = i.clientY - w, C.push({ x: i.clientX, y: i.clientY, t: performance.now() }), C.length > 10 && C.shift(), A += (D - A) * 0.28, D *= 0.82, v.style.transform = `rotate(${A.toFixed(1)}deg)`, ue();
  }, { passive: !1 }), document.addEventListener("touchend", () => {
    if (!d) return;
    d = !1, I("happy"), D = 0;
    const t = performance.now(), i = C.filter((m) => t - m.t < 130);
    if (i.length >= 2) {
      const m = i[0], f = i[i.length - 1], L = Math.max(f.t - m.t, 5) / 16.67;
      a = Math.max(-x, Math.min(x, (f.x - m.x) / L * 0.62)), p = Math.max(-x, Math.min(x, (f.y - m.y) / L * 0.62));
    }
    u = "flying", l = "";
  }), !matchMedia("(hover: none)").matches) {
    let N = function() {
      if (d || document.hidden) {
        requestAnimationFrame(N);
        return;
      }
      const ge = document.getElementById("bav-svg").getBoundingClientRect(), Fe = ge.width / 64, tt = P ? -1 : 1;
      [
        { base: Z, pupil: m, iris: f },
        { base: b, pupil: L, iris: fe }
      ].forEach(({ base: O, pupil: He, iris: De }) => {
        const nt = ge.left + (P ? 64 - O.x : O.x) * Fe, ot = ge.top + O.y * Fe, ye = t - nt, ve = i - ot, be = Math.sqrt(ye * ye + ve * ve) || 1, Re = Math.min(be / 55, 1) * j, Pe = ye / be * Re * tt, Ne = ve / be * Re;
        He.setAttribute("cx", (O.x + Pe).toFixed(2)), He.setAttribute("cy", (O.y + Ne).toFixed(2)), De.setAttribute("cx", (O.x + Pe * 0.55).toFixed(2)), De.setAttribute("cy", (O.y + Ne * 0.55).toFixed(2));
      }), requestAnimationFrame(N);
    };
    var ct = N;
    let t = window.innerWidth / 2, i = window.innerHeight / 2;
    document.addEventListener("mousemove", (z) => {
      t = z.clientX, i = z.clientY;
    });
    const m = document.getElementById("bav-pupil-l"), f = document.getElementById("bav-iris-l"), L = document.getElementById("bav-pupil-r"), fe = document.getElementById("bav-iris-r"), Z = { x: 23, y: 38 }, b = { x: 41, y: 38 }, j = 2.6;
    N();
    let ee = null, Q = !1;
    M.addEventListener("mousedown", () => {
      Q = !1, ee = setTimeout(() => {
        d && !Q && (Q = !0, T("🥰 Squeezing me!", 1800), [le, ce].forEach((z) => {
          z.style.transform = "scale(1.22)", setTimeout(() => z.style.transform = "scale(1)", 700);
        }));
      }, 1200);
    }), document.addEventListener("mouseup", () => clearTimeout(ee));
  }
  window.addEventListener("resize", () => {
    g = Math.max(0, Math.min(innerWidth - r, g)), h = Math.max(75, Math.min(innerHeight - c - 12, h)), M.style.left = g + "px", M.style.top = h + "px";
  }), M.addEventListener("bav-teleport", (t) => {
    g = t.detail.x, h = t.detail.y, a = 0, p = 0, u = "idle", l = "", H = null;
  }), M.addEventListener("bav-restore", () => {
    a = (Math.random() - 0.5) * 4, p = -3, u = "flying", l = "", H = null, v.style.transform = "", I("happy");
  });
})();
(function() {
  const e = document.getElementById("bav-chat"), n = document.getElementById("bav-chat-body"), s = document.getElementById("bav-chat-form"), r = document.getElementById("bav-chat-input"), c = document.getElementById("bav-chat-close"), E = document.getElementById("bav-chat-badge"), k = document.getElementById("bav-chat-hint");
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
  let Y = !1, q = !1;
  function _(l, d) {
    const y = document.createElement("div");
    return y.className = "bav-msg " + d, d === "user" ? y.textContent = l : y.innerHTML = l, n.appendChild(y), n.scrollTop = n.scrollHeight, y;
  }
  function F(l) {
    const d = document.createElement("div");
    d.className = "bav-quick", l.forEach((y) => {
      const w = document.createElement("button");
      w.type = "button", w.textContent = y, w.addEventListener("click", () => {
        r.value = y, a();
      }), d.appendChild(w);
    }), n.appendChild(d), n.scrollTop = n.scrollHeight;
  }
  function x(l) {
    const d = document.createElement("div");
    d.className = "bav-typing", d.innerHTML = "<span></span><span></span><span></span>", n.appendChild(d), n.scrollTop = n.scrollHeight, setTimeout(() => {
      d.remove(), l();
    }, 500 + Math.random() * 450);
  }
  const g = [
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
    const d = l.toLowerCase(), y = g.find((w) => w.k.some((C) => d.includes(C)));
    return y ? y.a : "I'm not totally sure about that one - but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }
  function a() {
    const l = r.value.trim();
    l && (_(l, "user"), r.value = "", x(() => _(h(l), "bot")));
  }
  s.addEventListener("submit", (l) => {
    l.preventDefault(), a();
  }), r.addEventListener("keydown", (l) => {
    l.key === "Enter" && (l.preventDefault(), a());
  });
  function p() {
    q = !0, document.body.classList.add("beacon-chat-open"), e.classList.add("open"), e.setAttribute("aria-hidden", "false"), e.inert = !1, E && E.classList.add("hide"), k && k.classList.add("hide"), Y || (Y = !0, x(() => {
      _("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", "bot"), F(["How do I verify?", "Post a help request", "Lost & Found", "Volunteer events"]);
    })), setTimeout(() => r.focus(), 250);
  }
  function u() {
    q = !1, document.body.classList.remove("beacon-chat-open"), e.classList.remove("open"), e.setAttribute("aria-hidden", "true"), e.inert = !0, document.getElementById("beacon-chat-button")?.focus();
  }
  window.__bavOpenChat = function() {
    q ? u() : p();
  }, c.addEventListener("click", u), document.addEventListener("keydown", (l) => {
    l.key === "Escape" && q && u();
  });
})();
const We = document.querySelector(".pillar-gallery"), at = [...We.querySelectorAll(".pillar-card")], Ue = matchMedia("(prefers-reduced-motion: reduce)");
let we = !1;
function oe() {
  we = !1;
  const e = We.getBoundingClientRect(), n = !Ue.matches && !document.body.classList.contains("motion-paused") && innerWidth > 550, s = Math.max(-1, Math.min(1, (innerHeight / 2 - e.top - e.height / 2) / innerHeight));
  at.forEach((r, c) => r.style.setProperty("--offset", n ? `${s * (c % 2 ? -58 : 58)}px` : "0px"));
}
addEventListener("scroll", () => {
  we || (we = !0, requestAnimationFrame(oe));
}, { passive: !0 });
addEventListener("resize", oe);
Ue.addEventListener("change", oe);
oe();
const o = (e) => document.querySelector(e), B = (e) => [...document.querySelectorAll(e)], ae = matchMedia("(prefers-reduced-motion: reduce)");
let R, S = ae.matches;
const Oe = setTimeout(() => document.documentElement.classList.add("world-unavailable"), 12e3);
async function it() {
  try {
    const { UnityWorld: e } = await import("./world2.js");
    R = new e(o("#unity-canvas"), () => {
      clearTimeout(Oe), document.documentElement.classList.remove("world-unavailable"), document.documentElement.classList.add("world-ready");
    });
  } catch (e) {
    clearTimeout(Oe), document.documentElement.classList.add("world-unavailable"), console.warn("The lightweight world illustration is active.", e.message);
  }
}
it();
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
  const s = o("#preview-content");
  s.replaceChildren();
  const r = { help: "Ask for groceries, transport, tools or tech support. See distance, time remaining and volunteer counts, then message a neighbour directly.", found: "Photo listings, clear Lost and Found labels, and Emirate locations. Contact the person who posted an item directly.", volunteer: "Community events sourced from Volunteers.ae, with dates, locations and direct registration links.", news: "Stories from Khaleej Times, Gulf News, Al Jazeera and BBC. Filter by source or topic in the dashboard." }, c = document.createElement("p");
  c.className = "preview-description", c.textContent = r[e], s.append(c), Xe[e].forEach(([E, k, Y, q]) => {
    const _ = document.createElement("article");
    _.className = "preview-item";
    const F = document.createElement("span");
    F.className = "preview-symbol", F.textContent = E;
    const x = document.createElement("div"), g = document.createElement("h3");
    g.textContent = k;
    const h = document.createElement("p");
    h.textContent = Y;
    const a = document.createElement("span");
    a.className = "tag", a.textContent = q, x.append(g, h, a), _.append(F, x), s.append(_);
  });
}
B("[data-preview]").forEach((e, n) => {
  e.addEventListener("click", () => te(e.dataset.preview)), e.addEventListener("keydown", (s) => {
    const r = B("[data-preview]");
    let c;
    (s.key === "ArrowRight" || s.key === "ArrowDown") && (c = (n + 1) % r.length), (s.key === "ArrowLeft" || s.key === "ArrowUp") && (c = (n + r.length - 1) % r.length), s.key === "Home" && (c = 0), s.key === "End" && (c = r.length - 1), c !== void 0 && (s.preventDefault(), te(r[c].dataset.preview, !0));
  });
});
B("[data-select]").forEach((e) => e.addEventListener("click", () => te(e.dataset.select)));
te("help");
let Ve;
function ke(e) {
  Ve = document.activeElement, e.showModal(), R?.setPaused(!0);
}
function ne(e) {
  e.close(), R?.setPaused(S), Ve?.focus();
}
B("dialog").forEach((e) => {
  e.querySelector("[data-close]").addEventListener("click", () => ne(e)), e.addEventListener("click", (n) => {
    if (n.target === e) {
      const s = e.getBoundingClientRect();
      (n.clientX < s.left || n.clientX > s.right || n.clientY < s.top || n.clientY > s.bottom) && ne(e);
    }
  }), e.addEventListener("close", () => {
    R?.setPaused(S), o("#menu-toggle").setAttribute("aria-expanded", "false"), e.id === "video-dialog" && o("#video-frame").removeAttribute("src");
  });
});
o("#menu-toggle").addEventListener("click", () => {
  ke(o("#navigation")), o("#menu-toggle").setAttribute("aria-expanded", "true");
});
B("#navigation a").forEach((e) => e.addEventListener("click", () => ne(o("#navigation"))));
B("[data-demo]").forEach((e) => e.addEventListener("click", () => {
  const n = o("#demo-frame");
  n.getAttribute("src") || (n.src = n.dataset.src), ke(o("#demo-dialog"));
}));
o("#demo-frame").addEventListener("load", () => {
  try {
    const e = o("#demo-frame").contentDocument, n = e.createElement("style");
    n.textContent = "#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}", e.head.append(n), [...e.querySelectorAll("button")].find((r) => r.textContent.trim().startsWith("Skip"))?.click();
  } catch {
  }
});
B("[data-video]").forEach((e) => e.addEventListener("click", () => {
  o("#video-frame").src = "https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0", ke(o("#video-dialog"));
}));
window.openSimDemo = () => B("[data-demo]")[0].click();
window.closeSimDemo = () => ne(o("#demo-dialog"));
function $e() {
  S = !S, window._bavPaused = S, document.body.classList.toggle("motion-paused", S), R?.setPaused(S), o("#motion-toggle").textContent = S ? "Resume the world" : "Pause the world", o("#motion-toggle").setAttribute("aria-pressed", String(S)), o("#footer-motion").textContent = S ? "Resume motion" : "Pause motion";
}
o("#motion-toggle").addEventListener("click", $e);
o("#footer-motion").addEventListener("click", $e);
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
const st = B(".chapter");
let Ee = !1;
function je() {
  Ee = !1;
  const e = scrollY;
  o(".site-header").classList.toggle("scrolled", e > 60);
  const n = e > o("#story-end").offsetTop - innerHeight * 0.6;
  document.body.classList.toggle("past-story", n);
  let s = 0;
  st.forEach((r, c) => {
    const E = r.getBoundingClientRect();
    E.top < innerHeight * 0.4 && (s = c);
    const k = r.querySelector(".chapter-copy");
    if (!ae.matches && innerWidth > 700) {
      const Y = Math.max(-30, Math.min(30, -E.top * 0.06));
      k.style.transform = `translateY(${Y}px)`;
    }
  }), B("#chapter-progress a").forEach((r, c) => {
    r.classList.toggle("active", c === s), c === s ? r.setAttribute("aria-current", "step") : r.removeAttribute("aria-current");
  }), o("#chapter-number").textContent = `0${s + 1} / 05`, document.body.classList.toggle("footer-visible", o(".site-footer").getBoundingClientRect().top < innerHeight - 100);
}
addEventListener("scroll", () => {
  Ee || (Ee = !0, requestAnimationFrame(je));
}, { passive: !0 });
je();
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
const G = o("#bav-svg").cloneNode(!0), Qe = /* @__PURE__ */ new Map();
[G, ...G.querySelectorAll("[id]")].forEach((e) => {
  e.id && (Qe.set(e.id, "chat-" + e.id), e.id = "chat-" + e.id);
});
[G, ...G.querySelectorAll("*")].forEach((e) => {
  for (const n of [...e.attributes]) {
    let s = n.value;
    Qe.forEach((r, c) => {
      s = s.replaceAll("url(#" + c + ")", "url(#" + r + ")"), s === "#" + c && (s = "#" + r);
    }), s !== n.value && e.setAttribute(n.name, s);
  }
});
G.setAttribute("aria-hidden", "true");
o("#bav-chat-avatar").replaceChildren(G);
const rt = new IntersectionObserver((e) => {
  e.forEach((n) => {
    n.target.classList.toggle("in-view", n.isIntersecting);
  });
}, { threshold: 0.13 });
B(".chapter-copy,.story-signal,.section-heading,.how-steps article,.platform-explained article,.organisation-types article,.compare-row,.beyond-layout,.trust-layout").forEach((e) => {
  e.classList.add("motion-reveal"), rt.observe(e);
});
addEventListener("pointermove", (e) => {
  e.pointerType === "touch" || ae.matches || (document.documentElement.style.setProperty("--pointer-x", `${e.clientX / innerWidth * 100}%`), document.documentElement.style.setProperty("--pointer-y", `${e.clientY / innerHeight * 100}%`));
}, { passive: !0 });
const ze = new IntersectionObserver((e) => {
  e.some((n) => n.isIntersecting) && (import("./spaces.js").catch(() => document.querySelector(".space-stage").classList.add("space-fallback")), ze.disconnect());
}, { rootMargin: "400px" });
ze.observe(document.querySelector(".community-spaces"));
