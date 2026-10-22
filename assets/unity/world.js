(function() {
  const e = document.getElementById("bav-chat"), t = document.getElementById("bav-chat-body"), n = document.getElementById("bav-chat-form"), o = document.getElementById("bav-chat-input"), i = document.getElementById("bav-chat-close"), h = document.getElementById("bav-chat-badge"), u = document.getElementById("bav-chat-hint");
  if (u && window.innerWidth <= 768 && (u.textContent = "Double-tap to chat"), !e) return;
  e.inert = !0, [h, u].forEach((r) => {
    if (!r) return;
    ["mousedown", "touchstart"].forEach((c) => r.addEventListener(c, (g) => g.stopPropagation())), r.addEventListener("dblclick", (c) => {
      c.stopPropagation(), window.__bavOpenChat && window.__bavOpenChat();
    });
    let d = 0;
    r.addEventListener("touchend", (c) => {
      c.stopPropagation();
      const g = performance.now();
      g - d < 320 && window.__bavOpenChat && window.__bavOpenChat(), d = g;
    });
  });
  let m = !1, p = !1;
  function b(r, d) {
    const c = document.createElement("div");
    return c.className = "bav-msg " + d, d === "user" ? c.textContent = r : c.innerHTML = r, t.appendChild(c), t.scrollTop = t.scrollHeight, c;
  }
  function f(r) {
    const d = document.createElement("div");
    d.className = "bav-quick", r.forEach((c) => {
      const g = document.createElement("button");
      g.type = "button", g.textContent = c, g.addEventListener("click", () => {
        o.value = c, T();
      }), d.appendChild(g);
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
    const d = r.toLowerCase(), c = E.find((g) => g.k.some((O) => d.includes(O)));
    return c ? c.a : "I'm not totally sure about that one — but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }
  function T() {
    const r = o.value.trim();
    r && (b(r, "user"), o.value = "", w(() => b(N(r), "bot")));
  }
  n.addEventListener("submit", (r) => {
    r.preventDefault(), T();
  }), o.addEventListener("keydown", (r) => {
    r.key === "Enter" && (r.preventDefault(), T());
  });
  function R() {
    p = !0, e.classList.add("open"), e.setAttribute("aria-hidden", "false"), e.inert = !1, h && h.classList.add("hide"), u && u.classList.add("hide"), m || (m = !0, w(() => {
      b("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", "bot"), f(["How do I verify?", "Post a help request", "Lost & Found", "Volunteer events"]);
    })), setTimeout(() => o.focus(), 250);
  }
  function S() {
    p = !1, e.classList.remove("open"), e.setAttribute("aria-hidden", "true"), e.inert = !0, document.getElementById("beacon-chat-button")?.focus();
  }
  window.__bavOpenChat = function() {
    p ? S() : R();
  }, i.addEventListener("click", S), document.addEventListener("keydown", (r) => {
    r.key === "Escape" && p && S();
  });
})();
const a = (e) => document.querySelector(e), v = (e) => [...document.querySelectorAll(e)], A = matchMedia("(prefers-reduced-motion: reduce)");
let k, y = A.matches;
const Y = setTimeout(() => document.documentElement.classList.add("world-unavailable"), 12e3);
async function U() {
  try {
    const { UnityWorld: e } = await import("./world2.js");
    k = new e(a("#unity-canvas"), () => {
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
function L(e, t = !1) {
  if (!H[e]) return;
  v("[data-preview]").forEach((o) => {
    const i = o.dataset.preview === e;
    o.setAttribute("aria-selected", String(i)), o.tabIndex = i ? 0 : -1, i && t && o.focus();
  }), a("#feature-panel").setAttribute("aria-labelledby", "tab-" + e);
  const n = a("#preview-content");
  n.replaceChildren(), H[e].forEach(([o, i, h, u]) => {
    const m = document.createElement("article");
    m.className = "preview-item";
    const p = document.createElement("span");
    p.className = "preview-symbol", p.textContent = o;
    const b = document.createElement("div"), f = document.createElement("h3");
    f.textContent = i;
    const w = document.createElement("p");
    w.textContent = h;
    const E = document.createElement("span");
    E.className = "tag", E.textContent = u, b.append(f, w, E), m.append(p, b), n.append(m);
  });
}
v("[data-preview]").forEach((e, t) => {
  e.addEventListener("click", () => L(e.dataset.preview)), e.addEventListener("keydown", (n) => {
    const o = v("[data-preview]");
    let i;
    (n.key === "ArrowRight" || n.key === "ArrowDown") && (i = (t + 1) % o.length), (n.key === "ArrowLeft" || n.key === "ArrowUp") && (i = (t + o.length - 1) % o.length), n.key === "Home" && (i = 0), n.key === "End" && (i = o.length - 1), i !== void 0 && (n.preventDefault(), L(o[i].dataset.preview, !0));
  });
});
v("[data-select]").forEach((e) => e.addEventListener("click", () => L(e.dataset.select)));
L("help");
let F;
function D(e) {
  F = document.activeElement, e.showModal(), k?.setPaused(!0);
}
function x(e) {
  e.close(), k?.setPaused(y), F?.focus();
}
v("dialog").forEach((e) => {
  e.querySelector("[data-close]").addEventListener("click", () => x(e)), e.addEventListener("click", (t) => {
    if (t.target === e) {
      const n = e.getBoundingClientRect();
      (t.clientX < n.left || t.clientX > n.right || t.clientY < n.top || t.clientY > n.bottom) && x(e);
    }
  }), e.addEventListener("close", () => {
    k?.setPaused(y), a("#menu-toggle").setAttribute("aria-expanded", "false"), e.id === "video-dialog" && a("#video-frame").removeAttribute("src");
  });
});
a("#menu-toggle").addEventListener("click", () => {
  D(a("#navigation")), a("#menu-toggle").setAttribute("aria-expanded", "true");
});
v("#navigation a").forEach((e) => e.addEventListener("click", () => x(a("#navigation"))));
v("[data-demo]").forEach((e) => e.addEventListener("click", () => {
  const t = a("#demo-frame");
  t.getAttribute("src") || (t.src = t.dataset.src), D(a("#demo-dialog"));
}));
a("#demo-frame").addEventListener("load", () => {
  try {
    const e = a("#demo-frame").contentDocument, t = e.createElement("style");
    t.textContent = "#bav-root,#bav-toggle,#bav-popover,#bav-chat{display:none!important}", e.head.append(t), [...e.querySelectorAll("button")].find((o) => o.textContent.trim().startsWith("Skip"))?.click();
  } catch {
  }
});
v("[data-video]").forEach((e) => e.addEventListener("click", () => {
  a("#video-frame").src = "https://www.youtube-nocookie.com/embed/md8suH2LcHs?autoplay=1&rel=0", D(a("#video-dialog"));
}));
window.openSimDemo = () => v("[data-demo]")[0].click();
window.closeSimDemo = () => x(a("#demo-dialog"));
function _() {
  y = !y, k?.setPaused(y), a("#motion-toggle").textContent = y ? "Resume the world" : "Pause the world", a("#motion-toggle").setAttribute("aria-pressed", String(y)), a("#footer-motion").textContent = y ? "Resume motion" : "Pause motion";
}
a("#motion-toggle").addEventListener("click", _);
a("#footer-motion").addEventListener("click", _);
A.addEventListener("change", (e) => {
  k && (k.reduced = e.matches, k.lastFrame = 0), y = e.matches, a("#motion-toggle").setAttribute("aria-pressed", String(y));
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
const j = v(".chapter");
let B = !1;
function q() {
  B = !1;
  const e = scrollY;
  a(".site-header").classList.toggle("scrolled", e > 60);
  const t = e > a("#story-end").offsetTop - innerHeight * 0.6;
  document.body.classList.toggle("past-story", t);
  let n = 0;
  j.forEach((o, i) => {
    const h = o.getBoundingClientRect();
    h.top < innerHeight * 0.4 && (n = i);
    const u = o.querySelector(".chapter-copy");
    if (!A.matches && innerWidth > 700) {
      const m = Math.max(-30, Math.min(30, -h.top * 0.06));
      u.style.transform = `translateY(${m}px)`;
    }
  }), v("#chapter-progress a").forEach((o, i) => {
    o.classList.toggle("active", i === n), i === n ? o.setAttribute("aria-current", "step") : o.removeAttribute("aria-current");
  }), a("#chapter-number").textContent = `0${n + 1} / 05`, document.body.classList.toggle("footer-visible", a(".site-footer").getBoundingClientRect().top < innerHeight - 100);
}
addEventListener("scroll", () => {
  B || (B = !0, requestAnimationFrame(q));
}, { passive: !0 });
q();
const s = a("#bav-wrap");
s.setAttribute("role", "button");
s.setAttribute("tabindex", "0");
s.setAttribute("aria-label", "Beacon mascot. Double-click to chat, or drag to play.");
s.title = "Double-click to chat. Drag to play.";
a("#bav-chat-input").setAttribute("aria-label", "Message Beacon");
a("#bav-chat-body").setAttribute("aria-live", "polite");
let P = "mouse";
a("#beacon-chat-button").addEventListener("click", () => window.__bavOpenChat?.());
s.addEventListener("dblclick", () => {
  P !== "touch" && window.__bavOpenChat?.();
});
s.addEventListener("keydown", (e) => {
  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), window.__bavOpenChat?.());
});
a("#beacon-hide").addEventListener("click", () => {
  const e = document.body.classList.toggle("beacon-hidden");
  a("#beacon-hide").textContent = e ? "+" : "−", a("#beacon-hide").setAttribute("aria-label", e ? "Show Beacon mascot" : "Hide Beacon mascot");
});
let l = null, M = 0, I = 0;
s.addEventListener("pointerdown", (e) => {
  if (P = e.pointerType, e.button && e.button !== 0) return;
  cancelAnimationFrame(I);
  const t = s.getBoundingClientRect();
  l = { x: e.clientX, y: e.clientY, left: t.left, top: t.top, lastX: e.clientX, lastY: e.clientY, vx: 0, vy: 0, moved: !1 }, s.setPointerCapture(e.pointerId);
});
s.addEventListener("pointermove", (e) => {
  if (!l) return;
  const t = e.clientX - l.x, n = e.clientY - l.y;
  l.moved || (l.moved = Math.hypot(t, n) > 6), l.vx = e.clientX - l.lastX, l.vy = e.clientY - l.lastY, l.lastX = e.clientX, l.lastY = e.clientY, l.moved && (s.style.right = "auto", s.style.bottom = "auto", s.style.left = Math.max(8, Math.min(innerWidth - 60, l.left + t)) + "px", s.style.top = Math.max(85, Math.min(innerHeight - 105, l.top + n)) + "px");
});
function C() {
  s.style.left = "", s.style.top = "", s.style.right = "", s.style.bottom = "";
}
function W(e) {
  if (!l) return;
  const t = l;
  if (l = null, !t.moved) {
    const f = performance.now();
    e.pointerType === "touch" && f - M < 330 && window.__bavOpenChat?.(), M = f;
    return;
  }
  if (A.matches) {
    C();
    return;
  }
  let n = s.getBoundingClientRect(), o = n.left, i = n.top, h = t.vx * 0.5, u = t.vy * 0.5, m = performance.now(), p = m;
  function b(f) {
    const w = Math.min(2, (f - p) / 16.67);
    p = f, u += 0.5 * w, o += h * w, i += u * w, (o < 8 || o > innerWidth - 60) && (h *= -0.55, o = Math.max(8, Math.min(innerWidth - 60, o))), i > innerHeight - 105 && (u *= -0.5, i = innerHeight - 105, h *= 0.9), i = Math.max(85, i), s.style.left = o + "px", s.style.top = i + "px", f - m < 1800 ? I = requestAnimationFrame(b) : C();
  }
  I = requestAnimationFrame(b);
}
s.addEventListener("pointerup", W);
s.addEventListener("pointercancel", () => {
  l = null, C();
});
addEventListener("resize", C);
