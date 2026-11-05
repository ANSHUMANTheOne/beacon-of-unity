/**
 * BEACON TUTORIAL v2 — Cinematic Onboarding for Beacon of Unity
 * ══════════════════════════════════════════════════════════════
 * Auto-starts once for new users (localStorage: bou_tutorial_done).
 * Reads window.currentUserFirstName set by Firebase auth.
 * Replayable from Settings → View Tutorial → BeaconTutorial.start()
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     WEB AUDIO  — pure synthesis, no files needed
  ══════════════════════════════════════════════════════════ */
  let _ctx = null;
  function actx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    return _ctx;
  }
  function tone(freq, type, dur, vol, delay) {
    try {
      const c = actx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type || 'square';
      o.frequency.value = freq || 800;
      const t = c.currentTime + (delay || 0);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol || 0.04, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.06));
      o.start(t); o.stop(t + (dur || 0.06) + 0.02);
    } catch (e) {}
  }
  function playBlip()     { tone(700 + Math.random() * 200, 'square', 0.022, 0.018); }
  function playChime()    { tone(660,'sine',0.08,0.07); tone(880,'sine',0.12,0.055,0.09); }
  function playWhoosh()   { tone(200,'sine',0.18,0.05); tone(400,'sine',0.14,0.04,0.06); }
  function playEntrance() {
    tone(80,'sine',0.6,0.07); tone(120,'sine',0.5,0.05,0.15);
    tone(200,'sine',0.35,0.04,0.35); tone(300,'sine',0.25,0.035,0.55);
  }
  function playFinish() {
    [523,659,784,1047].forEach((f,i) => tone(f,'sine',0.28,0.065,i*0.09));
  }

  /* ══════════════════════════════════════════════════════════
     BEACON SVG  (exact replica from index.html)
  ══════════════════════════════════════════════════════════ */
  function mkSVG(id, w, h) {
    return `<svg id="${id}" viewBox="0 0 64 84" width="${w}" height="${h}"
      fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;display:block">
      <defs>
        <radialGradient id="${id}-g1" cx="38%" cy="26%" r="70%">
          <stop offset="0%" stop-color="#7dd3fc"/>
          <stop offset="42%" stop-color="#0ea5e9"/>
          <stop offset="100%" stop-color="#082c47"/>
        </radialGradient>
        <radialGradient id="${id}-g3" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="rgba(6,182,212,0.26)"/>
          <stop offset="100%" stop-color="rgba(7,26,44,0.72)"/>
        </radialGradient>
        <filter id="${id}-f1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="${id}-f2" x="-28%" y="-28%" width="156%" height="156%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feFlood flood-color="#0ea5e9" flood-opacity=".42" result="c"/>
          <feComposite in="c" in2="b" operator="in" result="d"/>
          <feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="32" cy="81" rx="20" ry="4.5" fill="rgba(14,165,233,0.18)"/>
      <rect x="13" y="65" width="14" height="18" rx="7" fill="url(#${id}-g1)"/>
      <rect x="37" y="65" width="14" height="18" rx="7" fill="url(#${id}-g1)"/>
      <rect x="8" y="16" width="48" height="52" rx="17" fill="url(#${id}-g1)" filter="url(#${id}-f2)"/>
      <rect x="13" y="20" width="38" height="18" rx="11" fill="rgba(186,230,253,0.12)"/>
      <rect x="12" y="24" width="40" height="36" rx="11" fill="url(#${id}-g3)" stroke="rgba(14,165,233,0.52)" stroke-width="1"/>
      <circle cx="23" cy="38" r="8.5" fill="white" filter="url(#${id}-f1)"/>
      <circle cx="23" cy="38" r="5.8" fill="#7dd3fc"/>
      <circle cx="23" cy="38" r="3.4" fill="#0a1f33"/>
      <circle cx="20.2" cy="35.2" r="2.2" fill="white" opacity=".95"/>
      <circle cx="41" cy="38" r="8.5" fill="white" filter="url(#${id}-f1)"/>
      <circle cx="41" cy="38" r="5.8" fill="#7dd3fc"/>
      <circle cx="41" cy="38" r="3.4" fill="#0a1f33"/>
      <circle cx="38.2" cy="35.2" r="2.2" fill="white" opacity=".95"/>
      <path d="M22 52 Q32 59 42 52" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <rect x="3" y="30" width="7" height="18" rx="3.5" fill="rgba(14,165,233,0.42)" stroke="rgba(125,211,252,0.22)" stroke-width=".5"/>
      <rect x="54" y="30" width="7" height="18" rx="3.5" fill="rgba(14,165,233,0.42)" stroke="rgba(125,211,252,0.22)" stroke-width=".5"/>
      <rect x="29.5" y="5" width="5" height="13" rx="2.5" fill="rgba(14,165,233,0.68)"/>
      <circle cx="32" cy="4" r="5.5" fill="#0ea5e9" filter="url(#${id}-f1)"/>
      <circle cx="32" cy="4" r="3.5" fill="#bae6fd"/>
    </svg>`;
  }

  /* ══════════════════════════════════════════════════════════
     STEPS  — 14 fully guided steps
  ══════════════════════════════════════════════════════════ */
  const STEPS = [
    {
      tab: 'community', target: 'communityTab', side: 'right', yFrac: 0.40,
      say: n => `Hey ${n}! I'm Beacon — your guide on Beacon of Unity! 🌟 I'll walk you through every single feature here so you feel completely at home. Ready to explore? Let's go!`
    },
    {
      tab: 'community', target: 'requestFeed', side: 'right', yFrac: 0.45,
      say: () => `This is your Community Hub — your main feed! 🏠 You'll see help requests from neighbours nearby. Posts that are urgent will pulse in red so you never miss someone who needs you. Scroll down to explore them!`
    },
    {
      tab: 'community', target: '.fab', side: 'left', yFrac: 0.80,
      say: () => `See that glowing ＋ button? That's how you create a post! ✍️ Tap it to ask for help — food, transport, medical, tools, general help, or to post a lost & found item. Your neighbours are here for you!`
    },
    {
      tab: 'community', target: 'requestFeed', side: 'right', yFrac: 0.50,
      say: () => `Each post shows the type, distance, and urgency. 💬 Click "I can help" on any post to open a private chat with that person. Helping others earns you points — more on that later!`
    },
    {
      tab: 'lostfound', target: 'lostFoundTab', side: 'right', yFrac: 0.40,
      say: () => `Lost & Found! 🔍 Lost your keys? Found a wallet? Report it here with a photo and location. Items are clearly tagged LOST or FOUND so the community can help reunite them with their owners.`
    },
    {
      tab: 'volunteer-opps', target: 'volunteer-oppsTab', side: 'right', yFrac: 0.40,
      say: () => `Volunteer Opportunities! 🤝 Beach cleanups, food drives, education events — browse and sign up here. Admins can manually award you up to 10 points if your volunteer work is verified and deemed credible!`
    },
    {
      tab: 'community', target: null, side: 'center', yFrac: 0.50,
      say: () => `Here's how points work! ⭐ Resolving a chat = 2 pts. A 4-star rating = 3 pts total. A 5-star rating = 4 pts total. The rating includes the base 2 pts — no double-counting. Posting on the Thank You Wall = +1 pt. Points = ranking!`
    },
    {
      tab: 'thankyou', target: 'thankyouTab', side: 'right', yFrac: 0.40,
      say: () => `The Thank You Wall! 💙 When someone gives you a public shoutout for helping them, you earn +1 point. It's the community saying "you made a real difference today." Small acts, big hearts!`
    },
    {
      tab: 'leaderboard', target: 'leaderboardTab', side: 'right', yFrac: 0.40,
      say: () => `The Leaderboard! 🏆 Rankings are based on your total points. Switch between Local (your area) and Global (all UAE). At the end of every month, the Top 3 earners receive an official Beacon of Unity certificate!`
    },
    {
      tab: 'reliable-news', target: 'reliable-newsTab', side: 'right', yFrac: 0.40,
      say: () => `Reliable News! 📰 Curated, verified news for your UAE community. No misinformation here — only trusted sources. Stay informed about everything that matters to your neighbourhood and beyond.`
    },
    {
      tab: 'rewards', target: 'rewardsTab', side: 'right', yFrac: 0.40,
      say: () => `Rewards! 🎁 Spend your hard-earned points on profile skins, picture frame colours, and exclusive perks. Your good deeds have real tangible value here. Keep helping to unlock more!`
    },
    {
      tab: 'badges', target: 'badgesTab', side: 'right', yFrac: 0.40,
      say: () => `Badges! 🏅 Earn these by hitting milestones — first help, streaks, top helper of the month, and many more. They live on your profile and show the community your story. Can you collect them all?`
    },
    {
      tab: null, target: 'minimap-widget', side: 'right', yFrac: 0.75,
      say: () => `Your Region Minimap! 📍 That glowing map on the bottom-left shows live activity around you. Click it to expand and see exactly what's happening in your neighbourhood in real time!`
    },
    {
      tab: null, target: 'settingsBtn', side: 'left', yFrac: 0.82,
      say: n => `You're almost done, ${n}! ⚙️ That's the Settings button. Want to replay this tour anytime in the future? Just go to Settings → View Tutorial. I'll always be here for you! Welcome to Beacon of Unity! 🌟`
    },
  ];

  /* ══════════════════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════════════════ */
  let idx = 0, typingTimer = null, uName = 'friend';

  /* ══════════════════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════════════════ */
  function buildCSS() {
    const old = document.getElementById('bt-css');
    if (old) old.remove();
    const s = document.createElement('style');
    s.id = 'bt-css';
    s.textContent = `
/* ── RESET ── */
#bt-root *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}

/* ── OVERLAY (intro screen) ── */
#bt-ov{position:fixed;inset:0;z-index:19000;background:#050912;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity .7s}
#bt-ov.hid{opacity:0;pointer-events:none}

/* ── CINEMATIC BARS ── */
#bt-bar-t,#bt-bar-b{position:absolute;left:0;right:0;background:#000;z-index:10;transition:height .95s cubic-bezier(.77,0,.18,1)}
#bt-bar-t{top:0;height:80px}
#bt-bar-b{bottom:0;height:80px}
#bt-ov.bo #bt-bar-t,#bt-ov.bo #bt-bar-b{height:0}

/* ── STAR PARTICLES ── */
#bt-stars{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}
.bt-star{position:absolute;border-radius:50%;background:#fff;animation:bt-tw 3s ease-in-out infinite alternate}
@keyframes bt-tw{0%{opacity:.1}100%{opacity:.75}}

/* ── SCANLINES ── */
#bt-scan{position:absolute;inset:0;pointer-events:none;z-index:2;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px);opacity:.25}

/* ── LIGHT BEAM ── */
#bt-beam{position:absolute;bottom:50%;left:50%;transform:translateX(-50%);width:8px;height:0;background:linear-gradient(0deg,transparent 0%,rgba(56,189,248,.9) 50%,#fff 100%);border-radius:4px;opacity:0;pointer-events:none;z-index:4;box-shadow:0 0 22px 6px rgba(56,189,248,.55),0 0 60px 20px rgba(56,189,248,.2)}

/* ── BIG BEACON (intro) ── */
#bt-stage{position:relative;z-index:5;display:flex;flex-direction:column;align-items:center}
#bt-big-wrap{position:relative;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0) translateY(80px);transition:opacity .75s,transform .75s cubic-bezier(.34,1.56,.64,1)}
#bt-big-wrap.vis{opacity:1;transform:scale(1) translateY(0)}
#bt-big-ring{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.22) 0%,rgba(56,189,248,.06) 55%,transparent 75%);animation:bt-gp 2.5s ease-in-out infinite;pointer-events:none}
@keyframes bt-gp{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.28);opacity:1}}
#bt-big{filter:drop-shadow(0 0 32px rgba(56,189,248,.7)) drop-shadow(0 0 70px rgba(56,189,248,.35));animation:bt-fl 3s ease-in-out infinite}
@keyframes bt-fl{0%,100%{transform:translateY(0) rotate(-.5deg)}50%{transform:translateY(-16px) rotate(.5deg)}}

/* ── GREETING TEXT ── */
#bt-greet-wrap{text-align:center;margin-top:30px;padding:0 24px;max-width:580px}
#bt-gl{font-family:'Syne','Segoe UI',sans-serif;font-size:clamp(22px,4.5vw,36px);font-weight:800;letter-spacing:-.5px;background:linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:bt-ga 3s ease infinite;opacity:0;transform:translateY(20px);transition:opacity .55s,transform .55s}
@keyframes bt-ga{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
#bt-gl.vis{opacity:1;transform:translateY(0)}
#bt-gsub{font-size:clamp(13px,2vw,16px);color:rgba(255,255,255,.52);margin-top:10px;line-height:1.65;opacity:0;transform:translateY(14px);transition:opacity .5s .18s,transform .5s .18s}
#bt-gsub.vis{opacity:1;transform:translateY(0)}
#bt-go-btn{margin-top:28px;padding:14px 46px;background:linear-gradient(135deg,#0ea5e9,#38bdf8);border:none;border-radius:50px;color:#0f172a;font-family:'Syne','Segoe UI',sans-serif;font-size:15px;font-weight:800;cursor:pointer;opacity:0;transform:translateY(14px) scale(.96);transition:opacity .5s .32s,transform .5s .32s,box-shadow .2s;box-shadow:0 6px 26px rgba(56,189,248,.42)}
#bt-go-btn.vis{opacity:1;transform:translateY(0) scale(1)}
#bt-go-btn:hover{box-shadow:0 12px 38px rgba(56,189,248,.62);transform:translateY(-3px) scale(1.04)!important}

/* ── GLITCH EFFECT ── */
@keyframes bt-glitch{0%{clip-path:inset(12% 0 78% 0);transform:translate(-4px,0) skew(.5deg)}20%{clip-path:inset(52% 0 28% 0);transform:translate(4px,0) skew(-.5deg)}40%{clip-path:inset(22% 0 58% 0);transform:translate(-2px,0)}60%{clip-path:inset(78% 0 7% 0);transform:translate(3px,0) skew(.3deg)}80%{clip-path:inset(7% 0 88% 0);transform:translate(-1px,0)}100%{clip-path:inset(0 0 0 0);transform:none}}
.btg{animation:bt-glitch .38s steps(2) both}

/* ── DARK OVERLAY (during tour) ── */
#bt-dk{position:fixed;inset:0;z-index:18000;background:rgba(5,9,18,.76);pointer-events:all;opacity:0;transition:opacity .5s;display:none}
#bt-dk.on{opacity:1;display:block}

/* ── SPOTLIGHT ── */
#bt-spl{position:fixed;z-index:18500;pointer-events:none;box-shadow:0 0 0 9999px rgba(5,9,18,.76);transition:left .55s cubic-bezier(.34,1.2,.64,1),top .55s cubic-bezier(.34,1.2,.64,1),width .55s cubic-bezier(.34,1.2,.64,1),height .55s cubic-bezier(.34,1.2,.64,1),border-radius .3s;display:none;border-radius:12px}
#bt-spl.on{display:block}
/* HUD corner brackets */
.btc{position:absolute;width:18px;height:18px;border-color:rgba(56,189,248,.9);border-style:solid}
.btc-tl{top:-3px;left:-3px;border-width:3px 0 0 3px;border-radius:4px 0 0 0}
.btc-tr{top:-3px;right:-3px;border-width:3px 3px 0 0;border-radius:0 4px 0 0}
.btc-bl{bottom:-3px;left:-3px;border-width:0 0 3px 3px;border-radius:0 0 0 4px}
.btc-br{bottom:-3px;right:-3px;border-width:0 3px 3px 0;border-radius:0 0 4px 0}
@keyframes btc-draw{from{width:0;height:0;opacity:0}to{width:18px;height:18px;opacity:1}}
#bt-spl.on .btc{animation:btc-draw .35s cubic-bezier(.34,1.56,.64,1) both}
#bt-spl.on .btc-tr{animation-delay:.05s}
#bt-spl.on .btc-bl{animation-delay:.09s}
#bt-spl.on .btc-br{animation-delay:.13s}
/* glow pulse inside spotlight */
#bt-spl-glow{position:absolute;inset:-8px;border-radius:16px;box-shadow:0 0 28px 4px rgba(56,189,248,.32),inset 0 0 16px 2px rgba(56,189,248,.12);pointer-events:none;animation:bt-sglow 2s ease-in-out infinite}
@keyframes bt-sglow{0%,100%{opacity:.5}50%{opacity:1}}

/* ── SCAN LINE TRANSITION ── */
#bt-scanswipe{position:fixed;inset:0;z-index:19200;pointer-events:none;background:linear-gradient(180deg,transparent 0%,rgba(56,189,248,.12) 50%,transparent 100%);transform:translateY(-110%);transition:none}
#bt-scanswipe.swipe{transition:transform .4s linear;transform:translateY(110%)}

/* ── GUIDE BEACON (tour mascot) ── */
#bt-guide{position:fixed;z-index:19500;pointer-events:none;transition:left .65s cubic-bezier(.34,1.3,.64,1),top .65s cubic-bezier(.34,1.3,.64,1);display:none}
#bt-guide.on{display:block}
#bt-guide-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.18) 0%,transparent 70%);pointer-events:none;animation:bt-gp 2.5s ease-in-out infinite}
#bt-gs2{filter:drop-shadow(0 0 14px rgba(56,189,248,.55));animation:bt-gfl 3s ease-in-out infinite;position:relative;z-index:1}
@keyframes bt-gfl{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}

/* ── SPEECH BUBBLE ── */
#bt-bub{position:fixed;z-index:19600;width:clamp(240px,30vw,320px);background:linear-gradient(135deg,rgba(15,23,42,.97),rgba(5,9,18,.97));border:1.5px solid rgba(56,189,248,.42);border-radius:16px;padding:14px 16px 12px;pointer-events:none;opacity:0;transform:scale(.9);transition:opacity .38s,transform .38s,left .6s cubic-bezier(.34,1.3,.64,1),top .6s cubic-bezier(.34,1.3,.64,1);box-shadow:0 8px 38px rgba(0,0,0,.5),0 0 0 1px rgba(56,189,248,.07),0 0 20px rgba(56,189,248,.08);display:none;backdrop-filter:blur(4px)}
#bt-bub.on{opacity:1;transform:scale(1);display:block}
/* bubble arrow */
#bt-bub::before{content:'';position:absolute;width:0;height:0;border:8px solid transparent;pointer-events:none}
#bt-bub.btr::before{left:-15px;top:28px;border-right-color:rgba(56,189,248,.42)}
#bt-bub.btl::before{right:-15px;top:28px;border-left-color:rgba(56,189,248,.42)}
/* bubble header */
#bt-bh{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#38bdf8;margin-bottom:8px;font-family:'Syne','Segoe UI',sans-serif}
#bt-bdot{width:7px;height:7px;border-radius:50%;background:#38bdf8;animation:bt-dp 1.5s ease-in-out infinite;flex-shrink:0}
@keyframes bt-dp{0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,.6)}50%{box-shadow:0 0 0 6px rgba(56,189,248,0)}}
/* waveform bars */
#bt-bwav{display:flex;gap:2px;align-items:flex-end;margin-left:auto;height:14px}
#bt-bwav span{display:block;width:3px;border-radius:2px;background:#38bdf8;opacity:.5;animation:bt-wv 1.1s ease-in-out infinite}
#bt-bwav span:nth-child(2){animation-delay:.1s}
#bt-bwav span:nth-child(3){animation-delay:.2s}
#bt-bwav span:nth-child(4){animation-delay:.3s}
@keyframes bt-wv{0%,100%{height:3px;opacity:.25}50%{height:12px;opacity:.9}}
#bt-bwav.done span{animation:none!important;height:3px;opacity:.18}
/* text area */
#bt-bt{font-size:13px;color:rgba(255,255,255,.88);line-height:1.68;font-family:'Segoe UI',system-ui,sans-serif;min-height:40px}
/* blinking cursor */
.bt-cur{display:inline-block;width:2px;height:13px;background:#38bdf8;vertical-align:middle;margin-left:1px;border-radius:1px;animation:bt-bl .58s step-end infinite}
@keyframes bt-bl{0%,100%{opacity:1}50%{opacity:0}}

/* ── PROGRESS DOTS ── */
#bt-dots{position:fixed;top:18px;left:50%;transform:translateX(-50%);display:none;gap:5px;align-items:center;z-index:19600}
#bt-dots.on{display:flex}
.btd{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);transition:all .32s}
.btd.act{background:#38bdf8;width:22px;border-radius:3px}
.btd.dn{background:rgba(56,189,248,.38)}

/* ── CONTINUE BUTTON ── */
#bt-nxt{position:fixed;bottom:24px;right:96px;z-index:19600;padding:11px 30px;background:linear-gradient(135deg,#0ea5e9,#38bdf8);border:none;border-radius:50px;color:#0f172a;font-family:'Syne','Segoe UI',sans-serif;font-size:13px;font-weight:800;cursor:pointer;display:none;box-shadow:0 4px 22px rgba(56,189,248,.42);transition:transform .2s,box-shadow .2s;pointer-events:all}
#bt-nxt.on{display:block}
#bt-nxt:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(56,189,248,.58)}

/* ── SKIP BUTTON ── */
#bt-skp{position:fixed;bottom:28px;right:22px;z-index:19600;padding:9px 20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;color:rgba(255,255,255,.32);font-size:12px;cursor:pointer;display:none;transition:all .22s;pointer-events:all;font-family:'Segoe UI',system-ui,sans-serif}
#bt-skp.on{display:block}
#bt-skp:hover{background:rgba(255,255,255,.1);color:rgba(255,255,255,.62);border-color:rgba(255,255,255,.22)}

/* ── SKIP WARNING ── */
#bt-wrn{position:fixed;inset:0;z-index:20000;background:rgba(5,9,18,.88);display:none;align-items:center;justify-content:center}
#bt-wrn.on{display:flex}
#bt-wb{background:linear-gradient(135deg,#0f172a,#1e293b);border:1.5px solid rgba(239,68,68,.38);border-radius:20px;padding:34px 38px;max-width:430px;width:90%;text-align:center;box-shadow:0 26px 80px rgba(0,0,0,.65);animation:bt-win .38s cubic-bezier(.34,1.56,.64,1)}
@keyframes bt-win{from{transform:scale(.88);opacity:0}to{transform:scale(1);opacity:1}}
#bt-wt{font-family:'Syne','Segoe UI',sans-serif;font-size:19px;font-weight:800;color:#f87171;margin-bottom:12px}
#bt-wd{font-size:13px;color:rgba(255,255,255,.6);line-height:1.68;margin-bottom:10px}
#bt-wh{font-size:11.5px;color:rgba(255,255,255,.28);margin-bottom:26px;background:rgba(56,189,248,.06);border:1px solid rgba(56,189,248,.18);border-radius:10px;padding:10px 14px;line-height:1.6}
#bt-wbtns{display:flex;gap:12px;justify-content:center}
#bt-wbtns button{padding:12px 28px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne','Segoe UI',sans-serif;transition:transform .18s,box-shadow .18s}
#bt-wbtns button:first-child{background:rgba(56,189,248,.15);border:1.5px solid rgba(56,189,248,.38);color:#38bdf8}
#bt-wbtns button:last-child{background:rgba(239,68,68,.15);border:1.5px solid rgba(239,68,68,.38);color:#f87171}
#bt-wbtns button:hover{transform:translateY(-2px)}

/* ── FINISH SCREEN ── */
#bt-fin{position:fixed;inset:0;z-index:19800;background:#050912;display:none;align-items:center;justify-content:center;opacity:0;transition:opacity .55s}
#bt-fin.on{display:flex}
#bt-fin.vis{opacity:1}
#bt-fi{text-align:center;padding:24px;max-width:500px}
#bt-fg{position:absolute;inset:-35px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.22) 0%,transparent 70%);animation:bt-gp 2s infinite}
#bt-fsvg{filter:drop-shadow(0 0 24px rgba(56,189,248,.65));animation:bt-fl 3s ease-in-out infinite;position:relative;z-index:1}
#bt-ft{font-family:'Syne','Segoe UI',sans-serif;font-size:clamp(26px,5vw,38px);font-weight:800;background:linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:bt-ga 3s ease infinite;margin:12px 0 10px}
#bt-fsub{font-size:15px;color:rgba(255,255,255,.52);margin-bottom:16px;line-height:1.62}
#bt-fhint{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.22);border-radius:12px;padding:14px 20px;font-size:12px;color:rgba(255,255,255,.52);line-height:1.68;margin-bottom:30px}
#bt-fhint strong{color:#38bdf8}
#bt-fgo{padding:15px 52px;background:linear-gradient(135deg,#0ea5e9,#38bdf8);border:none;border-radius:50px;color:#0f172a;font-family:'Syne','Segoe UI',sans-serif;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 6px 30px rgba(56,189,248,.48);transition:transform .2s,box-shadow .2s}
#bt-fgo:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(56,189,248,.62)}
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════
     DOM BUILD
  ══════════════════════════════════════════════════════════ */
  function buildDOM() {
    const r = document.createElement('div');
    r.id = 'bt-root';
    r.innerHTML = `
<div id="bt-ov">
  <div id="bt-stars"></div>
  <div id="bt-scan"></div>
  <div id="bt-bar-t"></div>
  <div id="bt-bar-b"></div>
  <div id="bt-stage">
    <div id="bt-beam"></div>
    <div id="bt-big-wrap">
      <div id="bt-big-ring"></div>
      ${mkSVG('bt-big', 168, 220)}
    </div>
    <div id="bt-greet-wrap">
      <div id="bt-gl"></div>
      <div id="bt-gsub"></div>
      <button id="bt-go-btn" onclick="BeaconTutorial._begin()"><span>Let's explore! ✨</span></button>
    </div>
  </div>
</div>

<div id="bt-dk"></div>

<div id="bt-spl">
  <div id="bt-spl-glow"></div>
  <div class="btc btc-tl"></div>
  <div class="btc btc-tr"></div>
  <div class="btc btc-bl"></div>
  <div class="btc btc-br"></div>
</div>

<div id="bt-guide">
  <div id="bt-guide-glow"></div>
  ${mkSVG('bt-gs2', 76, 100)}
</div>

<div id="bt-bub" class="btr">
  <div id="bt-bh">
    <div id="bt-bdot"></div>
    <span>BEACON</span>
    <div id="bt-bwav">
      <span></span><span></span><span></span><span></span>
    </div>
  </div>
  <div id="bt-bt"></div>
</div>

<div id="bt-dots"></div>
<button id="bt-nxt" onclick="BeaconTutorial._next()">Continue →</button>
<button id="bt-skp" onclick="BeaconTutorial._warnSkip()">Skip tutorial</button>

<div id="bt-scanswipe"></div>

<div id="bt-wrn">
  <div id="bt-wb">
    <div style="font-size:44px;margin-bottom:16px">⚠️</div>
    <div id="bt-wt">Skip the tutorial?</div>
    <div id="bt-wd">You won't be able to see this automatically again. Beacon was really looking forward to showing you around!</div>
    <div id="bt-wh">💡 You can always replay it later:<br><strong>Settings ⚙️ → "View Tutorial"</strong></div>
    <div id="bt-wbtns">
      <button onclick="BeaconTutorial._cancelSkip()">Keep going</button>
      <button onclick="BeaconTutorial._confirmSkip()">Skip anyway</button>
    </div>
  </div>
</div>

<div id="bt-fin">
  <div id="bt-fi">
    <div style="position:relative;display:inline-block;margin-bottom:10px">
      <div id="bt-fg"></div>
      ${mkSVG('bt-fsvg', 120, 157)}
    </div>
    <div id="bt-ft"></div>
    <div id="bt-fsub">You now know everything Beacon of Unity has to offer.</div>
    <div id="bt-fhint">💡 To replay this tour anytime:<br>Click <strong>Settings ⚙️</strong> → <strong>"View Tutorial"</strong></div>
    <button id="bt-fgo" onclick="BeaconTutorial._enterDash()">Enter Dashboard →</button>
  </div>
</div>`;
    document.body.appendChild(r);
  }

  /* ══════════════════════════════════════════════════════════
     STARS
  ══════════════════════════════════════════════════════════ */
  function buildStars() {
    const c = document.getElementById('bt-stars');
    if (!c) return;
    for (let i = 0; i < 140; i++) {
      const s = document.createElement('div');
      s.className = 'bt-star';
      const z = Math.random() * 2.2 + 0.3;
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${z}px;height:${z}px;animation-delay:${(Math.random()*3).toFixed(2)}s;animation-duration:${(2+Math.random()*3.5).toFixed(2)}s`;
      c.appendChild(s);
    }
  }

  /* ══════════════════════════════════════════════════════════
     DOTS
  ══════════════════════════════════════════════════════════ */
  function buildDots() {
    const w = document.getElementById('bt-dots');
    w.innerHTML = '';
    STEPS.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'btd';
      d.id = 'btd-' + i;
      w.appendChild(d);
    });
  }
  function updateDots(a) {
    STEPS.forEach((_, i) => {
      const d = document.getElementById('btd-' + i);
      if (d) d.className = 'btd' + (i === a ? ' act' : i < a ? ' dn' : '');
    });
  }

  /* ══════════════════════════════════════════════════════════
     TYPEWRITER
  ══════════════════════════════════════════════════════════ */
  function typeText(text) {
    clearInterval(typingTimer);
    const el  = document.getElementById('bt-bt');
    const wav = document.getElementById('bt-bwav');
    if (!el) return;
    el.innerHTML = '';
    if (wav) wav.classList.remove('done');
    let i = 0;
    const cur = document.createElement('span');
    cur.className = 'bt-cur';
    el.appendChild(cur);
    typingTimer = setInterval(() => {
      if (i < text.length) {
        cur.insertAdjacentText('beforebegin', text[i++]);
        if (i % 2 === 0) playBlip();
      } else {
        clearInterval(typingTimer);
        cur.remove();
        if (wav) wav.classList.add('done');
      }
    }, 26);
  }

  /* ══════════════════════════════════════════════════════════
     SPOTLIGHT
  ══════════════════════════════════════════════════════════ */
  function spotlight(step) {
    const spl = document.getElementById('bt-spl');
    if (!spl) return;
    const el = step.target
      ? (document.getElementById(step.target) || document.querySelector(step.target))
      : null;

    if (!el) {
      spl.classList.remove('on');
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const p = 12;
      spl.style.cssText = `left:${r.left-p}px;top:${r.top-p}px;width:${r.width+p*2}px;height:${r.height+p*2}px;border-radius:12px`;
      spl.classList.remove('on');
      void spl.offsetHeight; // reflow to restart animation
      spl.classList.add('on');
    }, 340);
  }

  /* ══════════════════════════════════════════════════════════
     POSITION GUIDE + BUBBLE
  ══════════════════════════════════════════════════════════ */
  function positionGuide(step) {
    const guide = document.getElementById('bt-guide');
    const bub   = document.getElementById('bt-bub');
    if (!guide || !bub) return;

    const VW = window.innerWidth, VH = window.innerHeight;
    const GW = 76, GH = 100;
    let gx, gy;

    if (step.side === 'left')       { gx = 22;             gy = VH * (step.yFrac || .5) - GH / 2; }
    else if (step.side === 'right') { gx = VW - GW - 22;   gy = VH * (step.yFrac || .5) - GH / 2; }
    else                            { gx = VW / 2 - GW / 2; gy = VH * .42 - GH / 2; }

    gy = Math.max(90, Math.min(VH - GH - 80, gy));
    guide.style.left = gx + 'px';
    guide.style.top  = gy + 'px';

    const onLeft = (step.side !== 'right');
    bub.className = onLeft ? 'btl' : 'btr';

    const bw = 300;
    let bx = onLeft ? gx - bw - 20 : gx + GW + 20;
    let by = gy - 12;
    bx = Math.max(10, Math.min(VW - bw - 10, bx));
    by = Math.max(70, Math.min(VH - 220, by));
    bub.style.left = bx + 'px';
    bub.style.top  = by + 'px';
  }

  /* ══════════════════════════════════════════════════════════
     SCAN SWIPE TRANSITION
  ══════════════════════════════════════════════════════════ */
  function scanSwipe(cb) {
    const sw = document.getElementById('bt-scanswipe');
    if (!sw) { cb && cb(); return; }
    sw.style.transition = 'none';
    sw.style.transform  = 'translateY(-110%)';
    void sw.offsetHeight;
    sw.classList.add('swipe');
    setTimeout(() => {
      cb && cb();
      sw.classList.remove('swipe');
      sw.style.transition = 'none';
      sw.style.transform  = 'translateY(-110%)';
    }, 420);
  }

  /* ══════════════════════════════════════════════════════════
     RUN STEP
  ══════════════════════════════════════════════════════════ */
  function runStep(i) {
    idx = i;
    const step = STEPS[i];
    updateDots(i);

    scanSwipe(() => {
      // switch tab if needed
      if (step.tab && typeof window.switchTab === 'function') {
        window.switchTab(step.tab);
      }

      spotlight(step);
      positionGuide(step);

      const bub = document.getElementById('bt-bub');
      if (bub) bub.classList.add('on');

      playChime();
      const msg = typeof step.say === 'function' ? step.say(uName) : step.say;
      typeText(msg);

      const nxt = document.getElementById('bt-nxt');
      if (nxt) {
        nxt.textContent = (i === STEPS.length - 1) ? 'Finish 🎉' : 'Continue →';
        nxt.classList.add('on');
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     INTRO SEQUENCE
  ══════════════════════════════════════════════════════════ */
  function runIntro() {
    const ov   = document.getElementById('bt-ov');
    const beam = document.getElementById('bt-beam');
    const big  = document.getElementById('bt-big-wrap');
    const gl   = document.getElementById('bt-gl');
    const gsub = document.getElementById('bt-gsub');
    const btn  = document.getElementById('bt-go-btn');

    const greets = [
      n => `Hey ${n}! I'm Beacon — your guide! ✨`,
      n => `${n}! You made it. I'm Beacon. Let's explore! 🚀`,
      n => `Welcome, ${n}! Beacon here — ready to show you around! 🌟`,
      n => `Oh hey, ${n}! The name's Beacon. This is going to be fun! 🎉`,
      n => `${n}! I'm Beacon — your beacon of unity. Let's go! 💡`,
    ];
    const subs = [
      "I'll walk you through every feature of this community dashboard.",
      "Stick with me — you'll be up and running in just a few minutes.",
      "Together we'll discover everything this platform has to offer.",
      "Your community journey starts right here. I've got you covered.",
    ];

    gl.textContent   = greets[Math.floor(Math.random() * greets.length)](uName);
    gsub.textContent = subs[Math.floor(Math.random() * subs.length)];

    // Open cinematic bars
    setTimeout(() => ov.classList.add('bo'), 200);

    // Light beam shoots down
    setTimeout(() => {
      playEntrance();
      beam.style.transition = 'height .6s ease-out, opacity .28s';
      beam.style.opacity    = '1';
      beam.style.height     = '58vh';
    }, 650);

    // Beacon rises
    setTimeout(() => big.classList.add('vis'), 1150);

    // Beam fades
    setTimeout(() => {
      beam.style.transition = 'opacity .55s';
      beam.style.opacity    = '0';
    }, 1800);

    // Greeting fades in with glitch
    setTimeout(() => {
      gl.classList.add('vis');
      setTimeout(() => {
        gl.classList.add('btg');
        setTimeout(() => gl.classList.remove('btg'), 400);
      }, 200);
    }, 1450);

    setTimeout(() => gsub.classList.add('vis'), 1850);
    setTimeout(() => btn.classList.add('vis'),  2220);
  }

  /* ══════════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════════ */
  window.BeaconTutorial = {

    start() {
      uName = (window.currentUserFirstName) ||
              (window.currentUserName ? window.currentUserName.split(' ')[0] : '') ||
              localStorage.getItem('bou_user_first') ||
              'friend';

      // Clean up previous instance
      const old = document.getElementById('bt-root');
      if (old) old.remove();
      const oldcss = document.getElementById('bt-css');
      if (oldcss) oldcss.remove();

      idx = 0;
      buildCSS();
      buildDOM();
      buildStars();
      runIntro();
    },

    _begin() {
      playWhoosh();
      const ov = document.getElementById('bt-ov');
      ov.classList.add('hid');
      document.getElementById('bt-dk').classList.add('on');
      document.getElementById('bt-guide').classList.add('on');
      document.getElementById('bt-dots').classList.add('on');
      document.getElementById('bt-skp').classList.add('on');
      buildDots();
      setTimeout(() => { ov.style.display = 'none'; runStep(0); }, 680);
    },

    _next() {
      document.getElementById('bt-spl')?.classList.remove('on');
      document.getElementById('bt-nxt')?.classList.remove('on');
      if (idx >= STEPS.length - 1) { this._finish(); return; }
      runStep(idx + 1);
    },

    _finish() {
      ['bt-dk','bt-spl','bt-guide','bt-bub','bt-dots','bt-nxt','bt-skp'].forEach(id => {
        document.getElementById(id)?.classList.remove('on');
      });
      const ft = document.getElementById('bt-ft');
      if (ft) ft.textContent = `You're all set, ${uName}! 🎉`;
      playFinish();
      const fin = document.getElementById('bt-fin');
      if (fin) {
        fin.classList.add('on');
        setTimeout(() => fin.classList.add('vis'), 30);
      }
      try { localStorage.setItem('bou_tutorial_done', '1'); } catch (e) {}
    },

    _enterDash() {
      const fin = document.getElementById('bt-fin');
      if (fin) {
        fin.classList.remove('vis');
        setTimeout(() => {
          fin.classList.remove('on');
          document.getElementById('bt-dk')?.classList.remove('on');
          const root = document.getElementById('bt-root');
          setTimeout(() => root?.remove(), 400);
        }, 520);
      }
    },

    _warnSkip()    { document.getElementById('bt-wrn')?.classList.add('on'); },
    _cancelSkip()  { document.getElementById('bt-wrn')?.classList.remove('on'); },
    _confirmSkip() {
      document.getElementById('bt-wrn')?.classList.remove('on');
      this._finish();
    },
  };

  /* ══════════════════════════════════════════════════════════
     AUTO-START  (first-time users only)
  ══════════════════════════════════════════════════════════ */
  function autoStart() {
    if (localStorage.getItem('bou_tutorial_done')) return;
    let tries = 0;
    const poll = setInterval(() => {
      tries++;
      const hasName = window.currentUserFirstName || window.currentUserName;
      if (hasName || tries > 60) {
        clearInterval(poll);
        if (hasName) window.BeaconTutorial.start();
      }
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoStart);
  } else {
    autoStart();
  }

})();
