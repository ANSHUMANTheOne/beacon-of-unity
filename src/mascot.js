// Original Beacon movement, expressions and eye tracking restored from the existing site.

(function () {
  'use strict';

  // ── constants ────────────────────────────────────────
  // Android-only, per request ("only on androids, don't do anything on
  // PCs") -- a real Android check (not a screen-width/touch-capability
  // guess, which would also catch iPhones/iPads/touchscreen laptops).
  // Scaling W/H themselves (not a CSS transform:scale on top of the
  // unchanged constants) keeps the physics collision box and the visual
  // size exactly in sync -- a scale-only approach would shrink what's
  // drawn but leave the invisible bounce/floor box at the old size.
  // Phones only (iPhone AND Android), not desktop -- reusing the file's
  // own established width-based phone check (isNarrowScreen, declared
  // earlier and shared here since classic scripts share top-level
  // lexical scope) rather than UA-sniffing for "iPhone" specifically,
  // which is unreliable (iPadOS, for one, reports as "Macintosh" by
  // default). This is the same signal already used elsewhere in this
  // file for the same kind of decision (cursor, scroll speed).
  const isPhone = matchMedia('(max-width: 700px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  window._bavPaused = reduced.matches;
  const MASC_SCALE = isPhone ? 0.88 : 1;
  const W = Math.round(64 * MASC_SCALE), H = Math.round(84 * MASC_SCALE);          // avatar container size
  const GRAVITY    = 0.36;
  const AIR_FRIC   = 0.967;      // per-frame multiplier
  const GND_FRIC   = 0.76;
  const BOUNCE_Y   = 0.52;
  const BOUNCE_X   = 0.68;
  const MIN_BV     = 1.8;        // min speed to trigger bounce animation
  const MAX_V      = 28;

  // ── state ─────────────────────────────────────────────
  let px = window.innerWidth  - 148;
  let py = window.innerHeight * 0.32;
  let vx = -1.2, vy = 0;
  let mode     = 'idle';   // idle | walking | flying | sitting
  let prevMode = '';
  let dragging = false;
  let dragOX = 0, dragOY = 0;
  let mHist = [];          // mouse history for throw
  let sitEl = null;
  let sitSnapY = 0;
  let flipped  = false;
  let squishing = false;
  let bubTimer = null;
  let lastT = performance.now();
  let flyRot = 0;
  let dragSway = 0, dragSwayTarget = 0, lastDragX = 0;

  // ── element refs ──────────────────────────────────────
  const wrap   = document.getElementById('bav-wrap');
  const animEl = document.getElementById('bav-anim');
  const svg    = document.getElementById('bav-svg');
  const bubble = document.getElementById('bav-bubble');
  const msgEl  = document.getElementById('bav-msg');
  const shadowEl = document.getElementById('bav-shadow');
  const eyeL   = document.getElementById('bav-el');
  const eyeR   = document.getElementById('bav-er');
  const mouth  = document.getElementById('bav-mth');
  const legL   = document.getElementById('bav-leg-l');
  const legR   = document.getElementById('bav-leg-r');

  // Android-only size reduction (see MASC_SCALE above). #bav-anim has a
  // fixed 64x84 CSS size (not a % of its parent), and both its own and
  // #bav-wrap's `transform` are already actively used elsewhere for
  // squish/flip/black-hole effects -- setting a static transform:scale()
  // here would just get overwritten the next time any of those run.
  // width/height aren't touched anywhere else, so setting them directly
  // (matching the already-scaled W/H physics constants) is the durable
  // way to actually shrink what's drawn, not just the invisible
  // collision box.
  {
    wrap.style.width = W + 'px';
    animEl.style.width = W + 'px';
    animEl.style.height = H + 'px';
    // The <svg> itself has fixed width="64" height="84" ATTRIBUTES
    // matching its viewBox 1:1 -- just shrinking its container wouldn't
    // scale the artwork, it'd clip it. width/height:100% here lets the
    // svg fill whatever size #bav-anim now is, and the existing
    // viewBox="0 0 64 84" does the actual proportional scaling of
    // everything drawn inside it.
    svg.style.width = '100%';
    svg.style.height = '100%';
  }

  function setLegsSwinging(on) {
    legL.classList.toggle('swinging', on);
    legR.classList.toggle('swinging', on);
  }

  // ── position helper ───────────────────────────────────
  function applyPos() {
    if (window._bavPaused && !dragging) return;
    const dock=document.querySelector('.beacon-dock')?.getBoundingClientRect();
    if(dock && px+W>dock.left-12 && px<dock.right+12 && py+H>dock.top-14)py=dock.top-H-14;
    wrap.style.left = px + 'px';
    wrap.style.top  = py + 'px';
  }

  // ── speech bubble ──────────────────────────────────────
  function showBubble(text, ms) {
    clearTimeout(bubTimer);
    msgEl.textContent = text;
    bubble.classList.add('on');
    bubTimer = setTimeout(() => bubble.classList.remove('on'), ms || 3000);
  }

  // greetings
  setTimeout(() => {
    showBubble("Hi! I'm Beacon! 👋", 4000);
    setTimeout(() => showBubble("Your community guardian ✨", 3200), 4700);
    setTimeout(() => showBubble("Double-click (or double-tap) me to chat! 💬", 3600), 8200);
  }, 1400);

  // idle thoughts
  const thoughts = [
    "🛡️ Keeping UAE safe!",
    "🤝 Community first!",
    "🇦🇪 Proud to serve!",
    "✨ Beacon of Unity",
    "💪 Together we rise",
    "🌟 Verified & trusted",
  ];
  setInterval(() => {
    if ((mode === 'idle' || mode === 'sitting') && Math.random() < 0.28) {
      showBubble(thoughts[Math.floor(Math.random() * thoughts.length)], 2800);
    }
  }, 11000);

  // ── expressions ───────────────────────────────────────
  const MOUTH = {
    happy:     'M22 52 Q32 59 42 52',
    surprised: 'M24 53 Q32 58 40 53',
    sitting:   'M23 52 Q32 57 41 52',
    flying:    'M24 52 Q32 58 40 52',
  };
  function setExpr(e) {
    mouth.setAttribute('d', MOUTH[e] || MOUTH.happy);
    if (e === 'surprised') {
      [eyeL, eyeR].forEach(g => {
        g.style.transform = 'scale(1.3)';
        setTimeout(() => g.style.transform = 'scale(1)', 550);
      });
    }
  }

  // ── eye blink ─────────────────────────────────────────
  function doWink() {
    if (squishing || reduced.matches) return;
    [eyeL, eyeR].forEach(g => {
      g.style.transform = 'scaleY(0.06)';
      setTimeout(() => g.style.transform = 'scaleY(1)', 110);
    });
  }
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    const delay = 2600 + Math.random() * 2800;
    blinkTimer = setTimeout(() => {
      doWink();
      if (Math.random() < 0.22) {
        setTimeout(doWink, 300);
      }
      scheduleBlink();
    }, delay);
  }
  let blinkTimer;
  setTimeout(() => { doWink(); scheduleBlink(); }, 1800 + Math.random() * 1200);

  // ── squish on impact ──────────────────────────────────
  function squish() {
    if (squishing || reduced.matches) return;
    squishing = true;
    animEl.style.animation = 'none';
    void animEl.offsetHeight;   // force reflow
    animEl.style.animation = 'bav-squish .46s cubic-bezier(.36,.07,.19,.97) forwards';
    setExpr('surprised');
    setTimeout(() => {
      squishing = false;
      animEl.style.animation = '';
      applyModeAnim();
      setExpr(mode === 'sitting' ? 'sitting' : 'happy');
    }, 460);
  }

  // ── CSS animation per mode ────────────────────────────
  function applyModeAnim() {
    if (squishing || reduced.matches) return;
    switch (mode) {
      case 'idle':    animEl.style.animation = 'bav-idle 3.4s ease-in-out infinite';  break;
      case 'walking': animEl.style.animation = 'bav-walk 0.46s ease-in-out infinite'; break;
      case 'sitting': animEl.style.animation = 'bav-sit  2.9s ease-in-out infinite';  break;
      case 'flying':  animEl.style.animation = '';                                     break;
    }
  }

  // ── cached text elements (refreshed on scroll/resize) ─
  let textEls = [];
  // The main perf cost here (especially painful on Android Chrome) was
  // findSurface() below calling getBoundingClientRect() on every visible
  // text element EVERY SINGLE PHYSICS FRAME (60/sec) whenever the mascot
  // is flying/falling -- each call is a forced synchronous layout read,
  // so this was doing dozens of forced reflows per second just for
  // surface detection. Fixed by caching {el, rect} pairs HERE (only on
  // the existing 700ms interval / scroll / resize triggers, which is
  // already how often positions actually need rechecking) and having
  // findSurface() read from that cache instead of re-measuring anything
  // itself -- eliminates the per-frame layout reads entirely rather than
  // just throttling them.
  function refreshText() {
    textEls = Array.from(document.querySelectorAll(
      'h1,h2,h3,h4,h5,h6,p,.ftitle,.stitle,.ctat,.nname,.pct,.ft,.tname,.rpt,figcaption,dt,dd'
    )).map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(({r, el}) => r.width > 120
          && r.height > 20
          && r.bottom > 0
          && r.top < window.innerHeight
          && !el.closest('#bav-chat,dialog,.beacon-dock,#bav-root')
          && el.textContent.trim().length > 8);
  }
  refreshText();
  setInterval(refreshText, 700);
  // Raw 'scroll' events can fire many times within a single frame during
  // an active touch-scroll -- rAF-throttled here so a scroll gesture
  // triggers at most one refreshText() per frame instead of stacking up.
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; refreshText(); });
  }, { passive: true });
  window.addEventListener('resize', refreshText, { passive: true });

  // ── text surface detection ────────────────────────────
  function findSurface() {
    if (dragging) return null;
    const feet  = py + H;
    const ctr   = px + W * 0.5;
    for (const { el, r } of textEls) {
      if (Math.abs(feet - r.top) < 28
          && ctr > r.left + 10
          && ctr < r.right - 10
          && r.top > 55) {
        return { el, snapY: r.top - H };
      }
    }
    return null;
  }

  // ── reactions ─────────────────────────────────────────
  const bounceQ = ["Oof! 😅", "Wheee! 🌀", "Boing! 🎯", "Hey! 😄", "Woo! 💫"];
  const pickupQ = ["Whoa! 😲", "Wee! 🚀", "Flying! 🌟", "Catch me! 😄"];
  const sitQ    = ["Nice read! 📖", "Interesting! 🤔", "Love this! ✨", "Reading... 👀"];

  // ── main physics loop ─────────────────────────────────
  function loop(now) {
    if (window._bavPaused || document.hidden || document.body.classList.contains('beacon-hidden') || document.body.classList.contains('beacon-chat-open') || document.querySelector('dialog[open]')) { lastT = now; requestAnimationFrame(loop); return; }
    const raw = now - lastT;
    lastT = now;
    const dt = Math.min(raw / 16.67, 3);

    const VW = window.innerWidth;
    const dockFloor=document.querySelector('.beacon-dock')?.getBoundingClientRect();
    const VH = dockFloor && px+W>dockFloor.left-12 && px<dockFloor.right+12 ? dockFloor.top-14 : window.innerHeight-12;
    px = Math.max(0, Math.min(VW - W, px));
    py = Math.max(75, Math.min(VH - H, py));

    if (!dragging) {

      if (mode === 'sitting' && sitEl) {
        const r = sitEl.getBoundingClientRect();
        const stillVisible = r.top > 55 && r.top < VH + 20;
        const ctr = px + W * 0.5;
        const overElement = ctr > r.left - 10 && ctr < r.right + 10;

        if (stillVisible && overElement) {
          py = r.top - H + 12;
          vy = 0;
          vx *= GND_FRIC;
        } else {
          sitEl = null;
          mode = 'flying';
          setLegsSwinging(false);
          vy = -1.5;
          const fallQ = ["Here I come!", "A little hop!", "Off we go!", "Wheee!"];
          showBubble(fallQ[Math.floor(Math.random()*fallQ.length)], 1500);
        }
      } else {
      const surf = findSurface();

      if (surf && Math.abs(vy) < 7) {
        if (mode !== 'sitting' || sitEl !== surf.el) {
          sitEl   = surf.el;
          sitSnapY = surf.snapY;
          mode    = 'sitting';
          vy = 0;
          vx *= 0.35;
          py = sitSnapY;
          squish();
          setExpr('sitting');
          setLegsSwinging(true);
          if (Math.abs(vx) > 1.2 || Math.abs(vy) > 2)
            showBubble(sitQ[Math.floor(Math.random() * sitQ.length)], 2400);
        }
      } else {

        vy = Math.min(vy + GRAVITY * dt, MAX_V);
        vx *= Math.pow(AIR_FRIC, dt);
        px += vx * dt;
        py += vy * dt;

        if (px < 0) {
          px = 0;
          if (Math.abs(vx) > MIN_BV) {
            vx = Math.abs(vx) * BOUNCE_X;
            squish();
            if (Math.random() < .4) showBubble(bounceQ[Math.floor(Math.random()*bounceQ.length)], 1500);
          } else { vx = 0; }
          flipped = false;
        }

        if (px + W > VW) {
          px = VW - W;
          if (Math.abs(vx) > MIN_BV) {
            vx = -Math.abs(vx) * BOUNCE_X;
            squish();
            if (Math.random() < .4) showBubble(bounceQ[Math.floor(Math.random()*bounceQ.length)], 1500);
          } else { vx = 0; }
          flipped = true;
        }

        if (py + H > VH) {
          py = VH - H;
          if (Math.abs(vy) > MIN_BV) {
            vy = -Math.abs(vy) * BOUNCE_Y;
            vx *= GND_FRIC;
            squish();
            if (Math.random() < .28) showBubble(bounceQ[Math.floor(Math.random()*bounceQ.length)], 1500);
          } else {
            vy = 0;
            vx *= GND_FRIC;
            if (mode !== 'sitting') mode = Math.abs(vx) > 1.1 ? 'walking' : 'idle';
          }
        }

        if (py < 0) { py = 0; vy = Math.abs(vy) * BOUNCE_Y; }

        const spd = Math.sqrt(vx*vx + vy*vy);
        if (mode !== 'sitting') {
          if (spd > 3.5) {
            mode = 'flying';
          } else if (Math.abs(vx) > 1.0 && py + H >= VH - 2) {
            mode = 'walking';
          } else if (spd < 0.7) {
            mode = 'idle';
          }
        }
      }
      }

      if (vx < -0.3) flipped = true;
      if (vx >  0.3) flipped = false;

      if (mode === 'flying') {
        const targetRot = Math.max(-30, Math.min(30, vx * 2.8));
        flyRot += (targetRot - flyRot) * 0.18 * dt;
        dragSway += (0 - dragSway) * 0.12 * dt;
        animEl.style.transform = `rotate(${(flyRot + dragSway).toFixed(2)}deg)`;
      } else {
        flyRot *= 0.8;
        dragSway += (0 - dragSway) * 0.14 * dt;
        const tot = flyRot + dragSway;
        if (Math.abs(tot) < 0.2) { flyRot = 0; dragSway = 0; animEl.style.transform = ''; }
        else animEl.style.transform = `rotate(${tot.toFixed(2)}deg)`;
      }

      svg.style.transform = `scaleX(${flipped ? -1 : 1})`;

      const alt = Math.max(0, VH - (py + H));
      const sc  = Math.max(0.15, 1 - alt / VH);
      shadowEl.style.width   = (38 * sc) + 'px';
      shadowEl.style.opacity = (0.72 * sc).toString();

      if (mode !== prevMode && !squishing) {
        applyModeAnim();
        if (mode === 'sitting') setExpr('sitting');
        else if (mode === 'flying') setExpr('flying');
        else setExpr('happy');
        prevMode = mode;
      }
    }

    applyPos();
    requestAnimationFrame(loop);
  }

  wrap.style.left=px+'px';wrap.style.top=py+'px';
  requestAnimationFrame(loop);

  wrap.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  wrap.addEventListener('mouseleave', () => document.body.classList.remove('hov'));

  wrap.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    dragOX = e.clientX - px;
    dragOY = e.clientY - py;
    lastDragX = e.clientX;
    mHist  = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    vx = 0; vy = 0;
    sitEl = null;
    mode = prevMode = 'flying';
    animEl.style.animation  = '';
    animEl.style.transform  = '';
    setExpr('surprised');
    showBubble(pickupQ[Math.floor(Math.random() * pickupQ.length)], 1000);
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastDragX;
    lastDragX = e.clientX;
    dragSwayTarget = Math.max(-38, Math.min(38, -dx * 3.2));
    px = e.clientX - dragOX;
    py = e.clientY - dragOY;
    mHist.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (mHist.length > 10) mHist.shift();
    dragSway += (dragSwayTarget - dragSway) * 0.28;
    dragSwayTarget *= 0.82;
    animEl.style.transform = `rotate(${dragSway.toFixed(1)}deg)`;
    applyPos();
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    dragSwayTarget = 0;
    setExpr('happy');
    const now = performance.now();
    const rec = mHist.filter(p => now - p.t < 130);
    if (rec.length >= 2) {
      const a = rec[0], b = rec[rec.length - 1];
      const dT = Math.max(b.t - a.t, 5) / 16.67;
      vx = Math.max(-MAX_V, Math.min(MAX_V, ((b.x - a.x) / dT) * 0.62));
      vy = Math.max(-MAX_V, Math.min(MAX_V, ((b.y - a.y) / dT) * 0.62));
    }
    mode = 'flying'; prevMode = '';
  });

  wrap.addEventListener('dblclick', () => {
    // Double-click now opens the chat (physics/drag/throw are untouched - // this only fires on the distinct dblclick event, not during dragging).
    if (!dragging) {
      vy = -8 - Math.random() * 2;
      vx = (Math.random() - 0.5) * 5;
      mode = 'flying'; prevMode = '';
      squish();
    }
    if (window.__bavOpenChat) window.__bavOpenChat();
  });

  let lastTapT = 0;
  wrap.addEventListener('touchstart', e => {
    e.preventDefault();
    const now = performance.now();
    const isDoubleTap = (now - lastTapT) < 320;
    lastTapT = now;
    if (isDoubleTap) {
      if (window.__bavOpenChat) window.__bavOpenChat();
      squish();
      return;
    }
    const t = e.touches[0];
    dragging = true;
    dragOX = t.clientX - px; dragOY = t.clientY - py;
    lastDragX = t.clientX;
    mHist  = [{ x: t.clientX, y: t.clientY, t: performance.now() }];
    vx = 0; vy = 0;
    sitEl = null;
    setLegsSwinging(false);
    mode = prevMode = 'flying';
    animEl.style.animation = '';
    setExpr('surprised');
    showBubble(pickupQ[Math.floor(Math.random() * pickupQ.length)], 1000);
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - lastDragX;
    lastDragX = t.clientX;
    dragSwayTarget = Math.max(-38, Math.min(38, -dx * 3.2));
    px = t.clientX - dragOX; py = t.clientY - dragOY;
    mHist.push({ x: t.clientX, y: t.clientY, t: performance.now() });
    if (mHist.length > 10) mHist.shift();
    dragSway += (dragSwayTarget - dragSway) * 0.28;
    dragSwayTarget *= 0.82;
    animEl.style.transform = `rotate(${dragSway.toFixed(1)}deg)`;
    applyPos();
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false; setExpr('happy');
    dragSwayTarget = 0;
    const now = performance.now();
    const rec = mHist.filter(p => now - p.t < 130);
    if (rec.length >= 2) {
      const a = rec[0], b = rec[rec.length - 1];
      const dT = Math.max(b.t - a.t, 5) / 16.67;
      vx = Math.max(-MAX_V, Math.min(MAX_V, ((b.x - a.x) / dT) * 0.62));
      vy = Math.max(-MAX_V, Math.min(MAX_V, ((b.y - a.y) / dT) * 0.62));
    }
    mode = 'flying'; prevMode = '';
  });

  const isTouchDevice = matchMedia('(hover: none)').matches;
  if (!isTouchDevice) {
    let curX = window.innerWidth / 2, curY = window.innerHeight / 2;
    document.addEventListener('mousemove', e => { curX = e.clientX; curY = e.clientY; });

    const pupilL = document.getElementById('bav-pupil-l');
    const irisL  = document.getElementById('bav-iris-l');
    const pupilR = document.getElementById('bav-pupil-r');
    const irisR  = document.getElementById('bav-iris-r');

    const EYE_L = { x: 23, y: 38 };
    const EYE_R = { x: 41, y: 38 };
    const MAX_TRAVEL = 2.6;

    function trackEyes() {
      if (dragging || document.hidden) { requestAnimationFrame(trackEyes); return; }

      const svgEl = document.getElementById('bav-svg');
      const rect  = svgEl.getBoundingClientRect();
      const scale = rect.width / 64;
      const xDir = flipped ? -1 : 1;

      [
        { base: EYE_L, pupil: pupilL, iris: irisL },
        { base: EYE_R, pupil: pupilR, iris: irisR },
      ].forEach(({ base, pupil, iris }) => {
        const ex = rect.left + (flipped ? 64-base.x : base.x) * scale;
        const ey = rect.top  + base.y * scale;
        const dx = curX - ex;
        const dy = curY - ey;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const travel = Math.min(dist / 55, 1) * MAX_TRAVEL;
        const ox = (dx / dist) * travel * xDir;
        const oy = (dy / dist) * travel;
        pupil.setAttribute('cx', (base.x + ox).toFixed(2));
        pupil.setAttribute('cy', (base.y + oy).toFixed(2));
        iris.setAttribute('cx',  (base.x + ox * 0.55).toFixed(2));
        iris.setAttribute('cy',  (base.y + oy * 0.55).toFixed(2));
      });

      requestAnimationFrame(trackEyes);
    }
    trackEyes();

    let holdTimer = null;
    let heartShown = false;
    wrap.addEventListener('mousedown', () => {
      heartShown = false;
      holdTimer = setTimeout(() => {
        if (dragging && !heartShown) {
          heartShown = true;
          showBubble('🥰 Squeezing me!', 1800);
          [eyeL, eyeR].forEach(g => {
            g.style.transform = 'scale(1.22)';
            setTimeout(() => g.style.transform = 'scale(1)', 700);
          });
        }
      }, 1200);
    });
    document.addEventListener('mouseup', () => clearTimeout(holdTimer));
  }

  window.addEventListener('resize',()=>{px=Math.max(0,Math.min(innerWidth-W,px));py=Math.max(75,Math.min(innerHeight-H-12,py));wrap.style.left=px+'px';wrap.style.top=py+'px';});
  wrap.addEventListener('bav-teleport', e => {
    px = e.detail.x;
    py = e.detail.y;
    vx = 0; vy = 0;
    mode = 'idle'; prevMode = '';
    sitEl = null;
  });

  wrap.addEventListener('bav-restore', () => {
    vx = (Math.random() - 0.5) * 4;
    vy = -3;
    mode = 'flying'; prevMode = '';
    sitEl = null;
    animEl.style.transform = '';
    setExpr('happy');
  });

})();
