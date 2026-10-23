(function() {
  const e = document.getElementById("bav-chat"), t = document.getElementById("bav-chat-body"), n = document.getElementById("bav-chat-form"), a = document.getElementById("bav-chat-input"), i = document.getElementById("bav-chat-close"), h = document.getElementById("bav-chat-badge"), u = document.getElementById("bav-chat-hint");
  if (u && window.innerWidth <= 768 && (u.textContent = "Double-tap to chat"), !e) return;
  e.inert = !0, [h, u].forEach((r) => {
    if (!r) return;
    ["mousedown", "touchstart"].forEach((c) => r.addEventListener(c, (v) => v.stopPropagation())), r.addEventListener("dblclick", (c) => {
      c.stopPropagation(), window.__bavOpenChat && window.__bavOpenChat();
    });
    let d = 0;
    r.addEventListener("touchend", (c) => {
      c.stopPropagation();
      const v = performance.now();
      v - d < 320 && window.__bavOpenChat && window.__bavOpenChat(), d = v;
    });
  });
  let p = !1, f = !1;
  function b(r, d) {
    const c = document.createElement("div");
    return c.className = "bav-msg " + d, d === "user" ? c.textContent = r : c.innerHTML = r, t.appendChild(c), t.scrollTop = t.scrollHeight, c;
  }
  function g(r) {
    const d = document.createElement("div");
    d.className = "bav-quick", r.forEach((c) => {
      const v = document.createElement("button");
      v.type = "button", v.textContent = c, v.addEventListener("click", () => {
        a.value = c, T();
      }), d.appendChild(v);
    }), t.appendChild(d), t.scrollTop = t.scrollHeight;
  }
  function w(r) {
    const d = document.createElement("div");
    d.className = "bav-typing", d.innerHTML = "<span></span><span></span><span></span>", t.appendChild(d), t.scrollTop = t.scrollHeight, setTimeout(() => {
      d.remove(), r();
    }, 500 + Math.random() * 450);
  }
  const E = [
    // Placed BEFORE the Lost & Found entry deliberately: "founder" contains
    // the substring "found", so if the Lost & Found entry (keyed on
    // 'found') were checked first, a question like "who is the founder"
    // would incorrectly match Lost & Found instead. First-match-wins, so
    // order here isn't cosmetic.
    { k: ["founder", "who built", "who made", "who created", "about beacon", "mission", "company"], a: 'Beacon of Unity was built to give UAE residents a single trusted place for help requests, lost & found, volunteering, and reliable local news — all gated behind real Emirates ID verification. You can read more on the <a href="founder.html">About the Founder</a> page, linked in the footer.' },
    { k: ["legit", "scam", "trustworthy", "is this real", "is this safe", "can i trust"], a: `Every member on Beacon of Unity verifies with a live selfie holding their physical Emirates ID — no digital scans accepted, and it's a one-time, permanent step. There are zero anonymous users on the platform. To be upfront: this is our own verification process, not an official UAE government service or database check — it just means every member has shown a real Emirates ID on camera to us. You can see the full flow in the <a href="#trust">Verification System</a> section, and our <a href="privacy.html">Privacy</a> and <a href="terms.html">Terms</a> pages are linked in the footer if you want the full detail.` },
    { k: ["verify", "emirates id", "verification", "id check"], a: `Every member verifies with a live selfie holding their physical Emirates ID — no digital scans accepted. It's a one-time step, then you're in for good. See the <a href="#trust">Verification System</a> section for the full flow.` },
    { k: ["help request", "need help", "ask for help", "groceries"], a: "You can post a Help Request by category (groceries, tech, transport, etc). It shows up to nearby verified neighbours, sorted by distance." },
    { k: ["lost", "found", "keys", "wallet", "phone"], a: "Head to Lost & Found — report an item with a photo and status tag (LOST/FOUND), and a direct 'Contact User' button connects you straight to the other person." },
    { k: ["volunteer", "event", "cleanup", "clean up"], a: "The Volunteer tab lists curated community events — cleanups, food drives, tutoring — sourced from Volunteers.ae, each with a direct registration link." },
    { k: ["news", "article", "khaleej", "gulf news"], a: "Reliable News aggregates trusted stories from Khaleej Times, Gulf News, Al Jazeera and BBC, filterable by source or topic." },
    { k: ["badge", "points", "unity points", "reward", "leaderboard"], a: "Every helpful act earns Unity Points. There are 37 badges to unlock, and points can be redeemed for profile skins on the public leaderboard." },
    { k: ["sign up", "join", "create account", "get started", "register"], a: "You can create your account right from the hero — the 'Join the Movement' button takes you straight to sign-up." },
    { k: ["sign in", "log in", "login"], a: "Use 'Sign In' in the top-right of the navigation bar." },
    { k: ["demo", "try it", "preview"], a: "There's a live interactive demo — look for the 'Try a Demo' button near the top of the page." },
    { k: ["language", "arabic", "hindi"], a: "Beacon of Unity is available in English, Arabic, and Hindi." },
    { k: ["contact", "support", "email"], a: "You'll find a Contact link in the footer at the very bottom of the page." },
    { k: ["profile", "rank", "my account"], a: "Your profile keeps your verified name (permanent once set), volunteer rank, resolved chats, average rating, and badge count all in one place. You can also update your Emirate or live GPS location from there." },
    { k: ["gps", "location", "emirate ", "which emirate", "change my emirate"], a: "You can update your live GPS location or change your Emirate anytime from your profile/dashboard — it's what keeps help requests and lost & found sorted by real proximity to you." },
    { k: ["thank you wall", "appreciation"], a: "The Thank You Wall lets you post public appreciation notes for neighbours who helped you — it sits alongside your resolved chats and rating on your profile." },
    { k: ["report a user", "report someone", "block", "harassment", "unsafe"], a: `Every member is Emirates-ID-verified with no anonymous accounts, which is the platform's main safety layer. For anything specific about reporting or blocking, the <a href="contact.html">Contact</a> page in the footer is the right place to reach out.` },
    { k: ["privacy", "my data", "data safe", "gdpr"], a: `For exactly what's collected and how it's handled, see the <a href="privacy.html">Privacy</a> page linked in the footer.` },
    { k: ["terms", "terms of service", "terms and conditions"], a: `You'll find the full <a href="terms.html">Terms</a> in the footer.` },
    { k: ["credits", "attribution"], a: 'Credits are listed on the <a href="credits.html">Credits</a> page, linked in the footer.' },
    { k: ["cost", "price", "free", "subscription", "paywall"], a: "There's no pricing or subscription mentioned anywhere on the platform — every feature shown (help requests, lost & found, volunteering, news, badges) is just part of the verified community, no paywall in sight." },
    { k: ["mobile app", "ios app", "android app", "app store"], a: "Right now Beacon of Unity is a web platform — everything you see here (help requests, lost & found, volunteering, news) runs in the browser, no separate app download needed." },
    { k: ["who are you", "what are you", "your name"], a: "I'm Beacon — the little guardian who hangs out on this page! Drag me around, throw me, or tap the 'Tap to chat' label any time 😊" }
  ];
  function N(r) {
    const d = r.toLowerCase(), c = E.find((v) => v.k.some((R) => d.includes(R)));
    return c ? c.a : "I'm not totally sure about that one — but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }
  function T() {
    const r = a.value.trim();
    r && (b(r, "user"), a.value = "", w(() => b(N(r), "bot")));
  }
  n.addEventListener("submit", (r) => {
    r.preventDefault(), T();
  }), a.addEventListener("keydown", (r) => {
    r.key === "Enter" && (r.preventDefault(), T());
  });
  function O() {
    f = !0, e.classList.add("open"), e.setAttribute("aria-hidden", "false"), e.inert = !1, h && h.classList.add("hide"), u && u.classList.add("hide"), p || (p = !0, w(() => {
      b("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", "bot"), g(["How do I verify?", "Post a help request", "Lost & Found", "Volunteer events"]);
    })), setTimeout(() => a.focus(), 250);
  }
  function S() {
    f = !1, e.classList.remove("open"), e.setAttribute("aria-hidden", "true"), e.inert = !0, document.getElementById("beacon-chat-button")?.focus();
  }
  window.__bavOpenChat = function() {
    f ? S() : O();
  }, i.addEventListener("click", S), document.addEventListener("keydown", (r) => {
    r.key === "Escape" && f && S();
  });
})();
const o = (e) => document.querySelector(e), m = (e) => [...document.querySelectorAll(e)], L = matchMedia("(prefers-reduced-motion: reduce)");
let k, y = L.matches;
const Y = setTimeout(() => document.documentElement.classList.add("world-unavailable"), 12e3);
async function U() {
  try {
    const { UnityWorld: e } = await import("./world2.js");
    k = new e(o("#unity-canvas"), () => {
      clearTimeout(Y), document.documentElement.classList.remove("world-unavailable"), document.documentElement.classList.add("world-ready");
    });
  } catch (e) {
    clearTimeout(Y), document.documentElement.classList.add("world-unavailable"), console.warn("The lightweight world illustration is active.", e.message);
  }
}
U();
const H = {
  help: [["↗", "A ladder for a little home improvement", "Al Nahda, Sharjah · Nearby", "Tools & everyday help"], ["↗", "An extra pair of hands with groceries", "Al Majaz, Sharjah · Nearby", "Community support"], ["↗", "A friendly hand setting up a laptop", "Abu Shagara, Sharjah · Nearby", "Tech help"]],
  found: [["⌕", "A set of keys, waiting to come home", "Al Majaz waterfront · Example listing", "Found"], ["⌕", "Looking for a much-loved backpack", "Al Nahda park · Example listing", "Lost"], ["⌕", "A wallet found on an evening walk", "Abu Shagara · Example listing", "Found"]],
  volunteer: [["✳", "A cleaner coast, together", "Community beach cleanup · Example event", "Environment"], ["✳", "Give a little time. Share a meal.", "Community food drive · Example event", "Community care"], ["✳", "Help someone take their next step", "Neighbourhood skills exchange · Example event", "Share a skill"]],
  news: [["↗", "Keep up with your neighbourhood", "Discover community updates in one place", "Local updates"], ["↗", "Find stories with their sources attached", "Explore the platform’s local news space", "Stay informed"], ["↗", "Know what is happening nearby", "Open the demo to explore news categories", "Community news"]]
};
function x(e, t = !1) {
  if (!H[e]) return;
  m("[data-preview]").forEach((a) => {
    const i = a.dataset.preview === e;
    a.setAttribute("aria-selected", String(i)), a.tabIndex = i ? 0 : -1, i && t && a.focus();
  }), o("#feature-panel").setAttribute("aria-labelledby", "tab-" + e);
  const n = o("#preview-content");
  n.replaceChildren(), H[e].forEach(([a, i, h, u]) => {
    const p = document.createElement("article");
    p.className = "preview-item";
    const f = document.createElement("span");
    f.className = "preview-symbol", f.textContent = a;
    const b = document.createElement("div"), g = document.createElement("h3");
    g.textContent = i;
    const w = document.createElement("p");
    w.textContent = h;
    const E = document.createElement("span");
    E.className = "tag", E.textContent = u, b.append(g, w, E), p.append(f, b), n.append(p);
  });
}
m("[data-preview]").forEach((e, t) => {
  e.addEventListener("click", () => x(e.dataset.preview)), e.addEventListener("keydown", (n) => {
    const a = m("[data-preview]");
    let i;
    (n.key === "ArrowRight" || n.key === "ArrowDown") && (i = (t + 1) % a.length), (n.key === "ArrowLeft" || n.key === "ArrowUp") && (i = (t + a.length - 1) % a.length), n.key === "Home" && (i = 0), n.key === "End" && (i = a.length - 1), i !== void 0 && (n.preventDefault(), x(a[i].dataset.preview, !0));
  });
});
m("[data-select]").forEach((e) => e.addEventListener("click", () => x(e.dataset.select)));
x("help");
let F;
function D(e) {
  F = document.activeElement, e.showModal(), k?.setPaused(!0);
}
function C(e) {
  e.close(), k?.setPaused(y), F?.focus();
}
m("dialog").forEach((e) => {
  e.querySelector("[data-close]").addEventListener("click", () => C(e)), e.addEventListener("click", (t) => {
    if (t.target === e) {
      const n = e.getBoundingClientRect();
      (t.clientX < n.left || t.clientX > n.right || t.clientY < n.top || t.clientY > n.bottom) && C(e);
    }
  }), e.addEventListener("close", () => {
    k?.setPaused(y), o("#menu-toggle").setAttribute("aria-expanded", "false"), e.id === "video-dialog" && o("#video-frame").removeAttribute("src");
  });
});
o("#menu-toggle").addEventListener("click", () => {
  D(o("#navigation")), o("#menu-toggle").setAttribute("aria-expanded", "true");
});
m("#navigation a").forEach((e) => e.addEventListener("click", () => C(o("#navigation"))));
m("[data-demo]").forEach((e) => e.addEventListener("click", () => {
  const t = o("#demo-frame");
  t.getAttribute("src") || (t.src = t.dataset.src), D(o("#demo-dialog"));
}));
o("#demo-frame").addEventListener("load", () => {
  try {
    const e = o("#demo-frame").contentDocument, t = e.createElement("style");
    t.textContent = "#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}", e.head.append(t), [...e.querySelectorAll("button")].find((a) => a.textContent.trim().startsWith("Skip"))?.click();
  } catch {
  }
});
m("[data-video]").forEach((e) => e.addEventListener("click", () => {
  o("#video-frame").src = "https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0", D(o("#video-dialog"));
}));
window.openSimDemo = () => m("[data-demo]")[0].click();
window.closeSimDemo = () => C(o("#demo-dialog"));
function P() {
  y = !y, k?.setPaused(y), o("#motion-toggle").textContent = y ? "Resume the world" : "Pause the world", o("#motion-toggle").setAttribute("aria-pressed", String(y)), o("#footer-motion").textContent = y ? "Resume motion" : "Pause motion";
}
o("#motion-toggle").addEventListener("click", P);
o("#footer-motion").addEventListener("click", P);
L.addEventListener("change", (e) => {
  k && (k.reduced = e.matches, k.lastFrame = 0), y = e.matches, o("#motion-toggle").setAttribute("aria-pressed", String(y));
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
const j = m(".chapter");
let I = !1;
function _() {
  I = !1;
  const e = scrollY;
  o(".site-header").classList.toggle("scrolled", e > 60);
  const t = e > o("#story-end").offsetTop - innerHeight * 0.6;
  document.body.classList.toggle("past-story", t);
  let n = 0;
  j.forEach((a, i) => {
    const h = a.getBoundingClientRect();
    h.top < innerHeight * 0.4 && (n = i);
    const u = a.querySelector(".chapter-copy");
    if (!L.matches && innerWidth > 700) {
      const p = Math.max(-30, Math.min(30, -h.top * 0.06));
      u.style.transform = `translateY(${p}px)`;
    }
  }), m("#chapter-progress a").forEach((a, i) => {
    a.classList.toggle("active", i === n), i === n ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current");
  }), o("#chapter-number").textContent = `0${n + 1} / 05`, document.body.classList.toggle("footer-visible", o(".site-footer").getBoundingClientRect().top < innerHeight - 100);
}
addEventListener("scroll", () => {
  I || (I = !0, requestAnimationFrame(_));
}, { passive: !0 });
_();
const s = o("#bav-wrap");
s.setAttribute("role", "button");
s.setAttribute("tabindex", "0");
s.setAttribute("aria-label", "Beacon mascot. Double-click to chat, or drag to play.");
s.title = "Double-click to chat. Drag to play.";
o("#bav-chat-input").setAttribute("aria-label", "Message Beacon");
o("#bav-chat-body").setAttribute("aria-live", "polite");
let q = "mouse";
o("#beacon-chat-button").addEventListener("click", () => window.__bavOpenChat?.());
s.addEventListener("dblclick", () => {
  q !== "touch" && window.__bavOpenChat?.();
});
s.addEventListener("keydown", (e) => {
  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), window.__bavOpenChat?.());
});
o("#beacon-hide").addEventListener("click", () => {
  const e = document.body.classList.toggle("beacon-hidden");
  o("#beacon-hide").textContent = e ? "+" : "−", o("#beacon-hide").setAttribute("aria-label", e ? "Show Beacon mascot" : "Hide Beacon mascot");
});
let l = null, M = 0, B = 0;
s.addEventListener("pointerdown", (e) => {
  if (q = e.pointerType, e.button && e.button !== 0) return;
  cancelAnimationFrame(B);
  const t = s.getBoundingClientRect();
  l = { x: e.clientX, y: e.clientY, left: t.left, top: t.top, lastX: e.clientX, lastY: e.clientY, vx: 0, vy: 0, moved: !1 }, s.setPointerCapture(e.pointerId);
});
s.addEventListener("pointermove", (e) => {
  if (!l) return;
  const t = e.clientX - l.x, n = e.clientY - l.y;
  l.moved || (l.moved = Math.hypot(t, n) > 6), l.vx = e.clientX - l.lastX, l.vy = e.clientY - l.lastY, l.lastX = e.clientX, l.lastY = e.clientY, l.moved && (s.style.right = "auto", s.style.bottom = "auto", s.style.left = Math.max(8, Math.min(innerWidth - 60, l.left + t)) + "px", s.style.top = Math.max(85, Math.min(innerHeight - 105, l.top + n)) + "px");
});
function A() {
  s.style.left = "", s.style.top = "", s.style.right = "", s.style.bottom = "";
}
function W(e) {
  if (!l) return;
  const t = l;
  if (l = null, !t.moved) {
    const g = performance.now();
    e.pointerType === "touch" && g - M < 330 && window.__bavOpenChat?.(), M = g;
    return;
  }
  if (L.matches) {
    A();
    return;
  }
  let n = s.getBoundingClientRect(), a = n.left, i = n.top, h = t.vx * 0.5, u = t.vy * 0.5, p = performance.now(), f = p;
  function b(g) {
    const w = Math.min(2, (g - f) / 16.67);
    f = g, u += 0.5 * w, a += h * w, i += u * w, (a < 8 || a > innerWidth - 60) && (h *= -0.55, a = Math.max(8, Math.min(innerWidth - 60, a))), i > innerHeight - 105 && (u *= -0.5, i = innerHeight - 105, h *= 0.9), i = Math.max(85, i), s.style.left = a + "px", s.style.top = i + "px", g - p < 1800 ? B = requestAnimationFrame(b) : A();
  }
  B = requestAnimationFrame(b);
}
s.addEventListener("pointerup", W);
s.addEventListener("pointercancel", () => {
  l = null, A();
});
addEventListener("resize", A);
const X = new IntersectionObserver((e) => {
  e.forEach((t) => {
    t.target.classList.toggle("in-view", t.isIntersecting);
  });
}, { threshold: 0.13 });
m(".chapter-copy,.story-signal,.section-heading,.how-steps article,.platform-explained article,.organisation-types article,.compare-row,.beyond-layout,.trust-layout").forEach((e) => {
  e.classList.add("motion-reveal"), X.observe(e);
});
addEventListener("pointermove", (e) => {
  e.pointerType === "touch" || L.matches || (document.documentElement.style.setProperty("--pointer-x", `${e.clientX / innerWidth * 100}%`), document.documentElement.style.setProperty("--pointer-y", `${e.clientY / innerHeight * 100}%`));
}, { passive: !0 });
