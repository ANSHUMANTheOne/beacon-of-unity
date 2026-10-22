
(function(){
  'use strict';

  const panel   = document.getElementById('bav-chat');
  const body    = document.getElementById('bav-chat-body');
  const form    = document.getElementById('bav-chat-form');
  const input   = document.getElementById('bav-chat-input');
  const closeBtn= document.getElementById('bav-chat-close');
  const badge   = document.getElementById('bav-chat-badge');
  const hint    = document.getElementById('bav-chat-hint');
  // The hint's text should match whatever gesture the mascot actually
  // listens for — double-click on desktop (mouse), double-tap on touch —
  // instead of a generic "tap" that's just wrong on desktop. A local
  // width check here (rather than reusing isNarrowScreen from the
  // hero-lock script) keeps this script's behavior self-contained.
  if(hint && window.innerWidth <= 768) hint.textContent = 'Double-tap to chat';
  if(!panel) return; panel.inert = true;

  // Both the badge and the hint label sit INSIDE #bav-wrap, which has its
  // own mousedown/touchstart listeners for dragging the mascot — without
  // stopping propagation, clicking either would also kick off a drag.
  // Chat itself opens on the SAME double-click/double-tap gesture as the
  // mascot body (not a single click) so the "Double-click to chat" /
  // "Double-tap to chat" label stays literally true — a single-click
  // shortcut here would silently contradict its own text.
  [badge, hint].forEach(el=>{
    if(!el) return;
    ['mousedown','touchstart'].forEach(evt=> el.addEventListener(evt, e=>e.stopPropagation()));
    el.addEventListener('dblclick', e=>{ e.stopPropagation(); if(window.__bavOpenChat) window.__bavOpenChat(); });
    let lastTapT = 0;
    el.addEventListener('touchend', e=>{
      e.stopPropagation();
      const now = performance.now();
      if(now - lastTapT < 320){ if(window.__bavOpenChat) window.__bavOpenChat(); }
      lastTapT = now;
    });
  });

  let opened = false;
  let isOpen = false;

  function addMsg(text, who){
    const m = document.createElement('div');
    m.className = 'bav-msg ' + who;
    if(who === 'user') m.textContent = text; else m.innerHTML = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function addQuickReplies(options){
    const wrap = document.createElement('div');
    wrap.className = 'bav-quick';
    options.forEach(label=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', ()=>{ input.value = label; handleSubmit(); });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function botTyping(replyFn){
    const t = document.createElement('div');
    t.className = 'bav-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    setTimeout(()=>{
      t.remove();
      replyFn();
    }, 500 + Math.random()*450);
  }

  // Keyword → answer. Checked in order; first match wins. Kept close to
  // what's actually on the page (features, verification, sign-up) rather
  // than inventing capabilities the platform doesn't have.
  const FAQ = [
    // Placed BEFORE the Lost & Found entry deliberately: "founder" contains
    // the substring "found", so if the Lost & Found entry (keyed on
    // 'found') were checked first, a question like "who is the founder"
    // would incorrectly match Lost & Found instead. First-match-wins, so
    // order here isn't cosmetic.
    { k:['founder','who built','who made','who created','about beacon','mission','company'], a:"Beacon of Unity was built to give UAE residents a single trusted place for help requests, lost & found, volunteering, and reliable local news — all gated behind real Emirates ID verification. You can read more on the <a href=\"founder.html\">About the Founder</a> page, linked in the footer." },
    { k:['legit','scam','trustworthy','is this real','is this safe','can i trust'], a:"Every member on Beacon of Unity verifies with a live selfie holding their physical Emirates ID — no digital scans accepted, and it's a one-time, permanent step. There are zero anonymous users on the platform. To be upfront: this is our own verification process, not an official UAE government service or database check — it just means every member has shown a real Emirates ID on camera to us. You can see the full flow in the <a href=\"#trust\">Verification System</a> section, and our <a href=\"privacy.html\">Privacy</a> and <a href=\"terms.html\">Terms</a> pages are linked in the footer if you want the full detail." },
    { k:['verify','emirates id','verification','id check'], a:"Every member verifies with a live selfie holding their physical Emirates ID — no digital scans accepted. It's a one-time step, then you're in for good. See the <a href=\"#trust\">Verification System</a> section for the full flow." },
    { k:['help request','need help','ask for help','groceries'], a:"You can post a Help Request by category (groceries, tech, transport, etc). It shows up to nearby verified neighbours, sorted by distance." },
    { k:['lost','found','keys','wallet','phone'], a:"Head to Lost & Found — report an item with a photo and status tag (LOST/FOUND), and a direct 'Contact User' button connects you straight to the other person." },
    { k:['volunteer','event','cleanup','clean up'], a:"The Volunteer tab lists curated community events — cleanups, food drives, tutoring — sourced from Volunteers.ae, each with a direct registration link." },
    { k:['news','article','khaleej','gulf news'], a:"Reliable News aggregates trusted stories from Khaleej Times, Gulf News, Al Jazeera and BBC, filterable by source or topic." },
    { k:['badge','points','unity points','reward','leaderboard'], a:"Every helpful act earns Unity Points. There are 37 badges to unlock, and points can be redeemed for profile skins on the public leaderboard." },
    { k:['sign up','join','create account','get started','register'], a:"You can create your account right from the hero — the 'Join the Movement' button takes you straight to sign-up." },
    { k:['sign in','log in','login'], a:"Use 'Sign In' in the top-right of the navigation bar." },
    { k:['demo','try it','preview'], a:"There's a live interactive demo — look for the 'Try a Demo' button near the top of the page." },
    { k:['language','arabic','hindi'], a:"Beacon of Unity is available in English, Arabic, and Hindi." },
    { k:['contact','support','email'], a:"You'll find a Contact link in the footer at the very bottom of the page." },
    { k:['profile','rank','my account'], a:"Your profile keeps your verified name (permanent once set), volunteer rank, resolved chats, average rating, and badge count all in one place. You can also update your Emirate or live GPS location from there." },
    { k:['gps','location','emirate ','which emirate','change my emirate'], a:"You can update your live GPS location or change your Emirate anytime from your profile/dashboard — it's what keeps help requests and lost & found sorted by real proximity to you." },
    { k:['thank you wall','appreciation'], a:"The Thank You Wall lets you post public appreciation notes for neighbours who helped you — it sits alongside your resolved chats and rating on your profile." },
    { k:['report a user','report someone','block','harassment','unsafe'], a:"Every member is Emirates-ID-verified with no anonymous accounts, which is the platform's main safety layer. For anything specific about reporting or blocking, the <a href=\"contact.html\">Contact</a> page in the footer is the right place to reach out." },
    { k:['privacy','my data','data safe','gdpr'], a:"For exactly what's collected and how it's handled, see the <a href=\"privacy.html\">Privacy</a> page linked in the footer." },
    { k:['terms','terms of service','terms and conditions'], a:"You'll find the full <a href=\"terms.html\">Terms</a> in the footer." },
    { k:['credits','attribution'], a:"Credits are listed on the <a href=\"credits.html\">Credits</a> page, linked in the footer." },
    { k:['cost','price','free','subscription','paywall'], a:"There's no pricing or subscription mentioned anywhere on the platform — every feature shown (help requests, lost & found, volunteering, news, badges) is just part of the verified community, no paywall in sight." },
    { k:['mobile app','ios app','android app','app store'], a:"Right now Beacon of Unity is a web platform — everything you see here (help requests, lost & found, volunteering, news) runs in the browser, no separate app download needed." },
    { k:['who are you','what are you','your name'], a:"I'm Beacon — the little guardian who hangs out on this page! Drag me around, throw me, or tap the 'Tap to chat' label any time 😊" }
  ];

  function botReply(userText){
    const lower = userText.toLowerCase();
    const hit = FAQ.find(f => f.k.some(kw => lower.includes(kw)));
    if(hit) return hit.a;
    return "I'm not totally sure about that one — but I can tell you about Help Requests, Lost & Found, Volunteering, News, Verification, or how to join. What sounds useful?";
  }

  function handleSubmit(){
    const val = input.value.trim();
    if(!val) return;
    addMsg(val, 'user');
    input.value = '';
    botTyping(()=> addMsg(botReply(val), 'bot'));
  }

  form.addEventListener('submit', e => { e.preventDefault(); handleSubmit(); });
  // Belt-and-suspenders: a lone text input in a form should implicitly
  // submit on Enter natively, but that's a "should" across browsers, not
  // a guarantee — this makes it explicit instead of relying on it.
  // preventDefault stops the native implicit-submit from also firing,
  // so this can't double-send a message.
  input.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); handleSubmit(); } });

  function openChat(){
    isOpen = true;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false'); panel.inert = false;
    if(badge) badge.classList.add('hide');
    if(hint) hint.classList.add('hide');
    if(!opened){
      opened = true;
      botTyping(()=>{
        addMsg("Hey! I'm Beacon 👋 Ask me anything about the platform, or tap a topic below.", 'bot');
        addQuickReplies(['How do I verify?','Post a help request','Lost & Found','Volunteer events']);
      });
    }
    setTimeout(()=> input.focus(), 250);
  }
  function closeChat(){
    isOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true'); panel.inert = true; document.getElementById('beacon-chat-button')?.focus();
  }

  window.__bavOpenChat = function(){ isOpen ? closeChat() : openChat(); };
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && isOpen) closeChat(); });

  // Also let the toggle/popover's mascot icon open chat on a normal click
  // modifier isn't needed — the dedicated dblclick/double-tap on the
  // mascot itself is the documented way in, per the on-load hint bubble.
})();
