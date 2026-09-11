(function(){
  'use strict';

  const canvas  = document.getElementById('hero3d-canvas');
  const scrimEl = document.getElementById('hero3d-scrim');
  const caps    = Array.from(document.querySelectorAll('.h3d-cap'));
  const minis   = Array.from(document.querySelectorAll('.h3d-mini'));
  if(!canvas) return;

  if(typeof THREE === 'undefined'){
    document.body.classList.add('no-3d');
    return;
  }

  let renderer, scene, camera;
  let buildings = [], streetlights = [], beams = [], people = [], bubbles = [];
  let trashBags = [];   // { mesh, appearAt, volunteer, sx, sz, baseRot, baseY }
  let running = true;

  function makeBuilding(x, z, w, h, d, colorHex, threshold, side){
    // A small baseline emissive so the building is always distinguishable
    // from the dark sky/background regardless of lighting angle — without
    // it, buildings whose diffuse-lit colour happens to match the ambient
    // background can render almost invisible, leaving only their window
    // accents visible and looking like they're floating in mid-air.
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: .82, metalness: .05, emissive: colorHex });
    mat.emissive.multiplyScalar(0.16); // baseline self-glow so it's never fully dark/invisible before update() runs
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // simple pitched roof cap
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(w,d)*0.72, h*0.22, 4),
      new THREE.MeshStandardMaterial({ color: 0x0a2338, roughness: 1 })
    );
    roof.rotation.y = Math.PI/4;
    roof.position.y = h/2 + h*0.11;
    mesh.add(roof);
    // Window accents on all four faces (not just the street-facing side) —
    // rows going up the building too, so it reads as genuinely lit all
    // around instead of one bright side and three dark ones. Cheap planes,
    // no grid mesh, so no z-fighting risk.
    mesh.userData.windows = [];
    const winMat = new THREE.MeshBasicMaterial({ color: 0x0a1f33, transparent:true, opacity:.9 });
    const rows = Math.max(2, Math.floor(h/1.8));
    const faces = [
      { axis:'z', sign: side,  w: w*0.18 }, // street-facing (matches beat "side")
      { axis:'z', sign: -side, w: w*0.18 }, // rear face
      { axis:'x', sign: 1,     w: d*0.18 }, // right face
      { axis:'x', sign: -1,    w: d*0.18 }  // left face
    ];
    faces.forEach(face=>{
      const cols = face.axis==='z' ? 2 : 1;
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const win = new THREE.Mesh(new THREE.PlaneGeometry(face.w, h*0.11), winMat.clone());
          const along = cols>1 ? (c-0.5)*(w*0.4) : 0;
          const rowY = -h*0.34 + r*(h*0.62/(rows-1||1));
          if(face.axis==='z'){
            win.position.set(along, rowY, (d/2+0.02)*face.sign);
            if(face.sign < 0) win.rotation.y = Math.PI;
          } else {
            win.position.set((w/2+0.02)*face.sign, rowY, along*0 );
            win.rotation.y = face.sign > 0 ? Math.PI/2 : -Math.PI/2;
          }
          mesh.add(win);
          mesh.userData.windows.push(win);
        }
      }
    });
    mesh.userData.threshold = threshold;
    scene.add(mesh);
    buildings.push(mesh);
    return mesh;
  }

  // The beat-2 "response" building. Earlier versions tried a hollow-wall
  // reveal (a fading face + separate interior geometry) — it wasn't
  // reliably readable at the actual camera distance/angle. This is a
  // plain solid building like the others, PLUS a large illustrated
  // "window" icon (see makeIconSprite below) showing a lit window with a
  // person answering — a technique that's already proven reliable (it's
  // how the chat-bubble/key icons work), rather than depending on real
  // hollow-geometry occlusion that's hard to get right without live
  // testing.
  function makeInteriorBuilding(x, z, w, h, d, colorHex, threshold, side){
    // Plain solid building (interior-room experiment removed).
    return makeBuilding(x, z, w, h, d, colorHex, threshold, side);
  }

  function makeStreetlight(x, z, threshold){
    const g = new THREE.Group();
    // the arm/shade/bulb must reach OUT OVER THE ROAD, not just always to
    // +x — poles on the right side of the street (x>0) need the head
    // mirrored to -x so both sides' lamps lean toward the road center,
    // matching how real streetlights are hung. dir flips the offset sign
    // based on which side of the street this pole is on.
    const dir = x < 0 ? 1 : -1;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.065,2.5,8), new THREE.MeshStandardMaterial({ color:0x0e2c42, roughness:.6, metalness:.3 }));
    pole.position.y = 1.25;
    // a curved arm out to the lamp head, instead of the bulb sitting
    // directly on top of the pole — reads as an actual streetlight shape
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.42,6), new THREE.MeshStandardMaterial({ color:0x0e2c42, roughness:.6 }));
    arm.rotation.z = dir * Math.PI/2.4;
    arm.position.set(dir*0.16, 2.42, 0);
    // lamp housing (a small cone shade over the bulb)
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.14, 8), new THREE.MeshStandardMaterial({ color:0x0a2338, roughness:.7 }));
    shade.position.set(dir*0.32, 2.56, 0);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x1a2432 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8), bulbMat);
    bulb.position.set(dir*0.32, 2.44, 0);
    // a soft glow disc on the ground beneath, fades in with the light
    const glowMat = new THREE.MeshBasicMaterial({ color:0x9ddcff, transparent:true, opacity:0 });
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), glowMat);
    glow.rotation.x = -Math.PI/2;
    glow.position.set(dir*0.32, 0.02, 0);
    g.add(pole); g.add(arm); g.add(shade); g.add(bulb); g.add(glow);
    const pl = new THREE.PointLight(0x9ddcff, 0, 7, 2);
    pl.position.set(dir*0.32, 2.44, 0);
    g.add(pl);
    g.position.set(x, 0, z);
    g.userData = { bulbMat, glowMat, light: pl, threshold };
    scene.add(g);
    streetlights.push(g);
  }

  function makeTree(x, z){
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.17,1.1,7), new THREE.MeshStandardMaterial({ color:0x3d2a1a, roughness:.9 }));
    trunk.position.y = 0.55;
    // two-tone foliage — a darker base cone and a smaller, brighter cone
    // nested on top gives real shading/depth instead of one flat colour mass
    const leafBase = new THREE.Mesh(new THREE.ConeGeometry(0.85,1.8,8), new THREE.MeshStandardMaterial({ color:0x155f3f, roughness:.95 }));
    leafBase.position.y = 1.55;
    const leafTop = new THREE.Mesh(new THREE.ConeGeometry(0.6,1.2,8), new THREE.MeshStandardMaterial({ color:0x2a9166, roughness:.85 }));
    leafTop.position.y = 1.95;
    g.add(trunk); g.add(leafBase); g.add(leafTop);
    g.traverse(o=>{ if(o.isMesh){ o.castShadow = true; } });
    g.position.set(x, 0, z);
    const s = 0.9 + Math.random()*0.3;
    g.scale.set(s,s,s);
    g.rotation.y = Math.random()*Math.PI*2;
    scene.add(g);
  }

  // Stylised neighbours — torso + shoulders + head + arms + legs, so they
  // actually read as people from a distance instead of geometric blobs.
  // Skin, hair and shirt colours all vary so a crowd doesn't look like
  // identical plastic pawns. `holdingBag` adds a small dark satchel for
  // the volunteer/clean-up beat, so that scene visibly shows people doing
  // something, not just standing around.
  // Stylised neighbours with real character — a two-tone torso (shirt +
  // collar trim), a belt accent, small separate feet, and a slightly
  // larger "chibi" head for charm — deliberately no thin stick-out limb
  // geometry (that's specifically what kept reading as broken/clipping at
  // a distance or from certain angles). Skin, shirt, trim and hair all
  // vary per person so a crowd doesn't look like identical pawns.
  const shirtColors = [0x2c6e8f, 0x9c4a4a, 0x3d7a5c, 0x6b4a8f, 0xb8834a, 0x4a5a8f, 0xc2703e, 0x3f6b4a];
  const trimColors  = [0xbae6fd, 0xfbcfe8, 0xd1fae5, 0xe9d5ff, 0xa5f3fc, 0xbae6fd, 0xc7d2fe, 0xd1fae5];
  const skinTones   = [0xf0c39e, 0xd9a273, 0xc98a5e, 0xe0a17a, 0xb87a52];
  const hairTones   = [0x2a1b12, 0x4a2f1c, 0x1a1a1a, 0x6b4226, 0x3a2418];
  function makePerson(x, z, colorIdx, appearAt, holdingBag){
    // Articulated mini-figure: real arms (upper+forearm with elbow bend),
    // legs with hips, tapered torso, neck, and a proper head. Built from
    // capsules/spheres so it reads as a small person from any distance,
    // not a stack of blobs. Reference points: low-poly stylized figures
    // (Crossy Road / Monument Valley vibe) that still look human.
    const g = new THREE.Group();
    const skin = skinTones[colorIdx % skinTones.length];
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2a3b4d, roughness:.85 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColors[colorIdx % shirtColors.length], roughness:.75 });
    const skinMat  = new THREE.MeshStandardMaterial({ color: skin, roughness:.6 });

    // LEGS: two separate legs with hip joint + shoe
    // Guard MUST test the constructor itself — `new THREE.CapsuleGeometry ?` evaluates
    // `new undefined` first in three r128 (no CapsuleGeometry), which THROWS and kills
    // the whole scene init (that was the "intro didn't load at all" bug).
    const legGeo = THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.055, 0.28, 4, 8) : new THREE.CylinderGeometry(0.055, 0.06, 0.38, 8);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.075, 0.19, 0);
    const legR = legL.clone(); legR.position.x = 0.075;
    const shoeGeo = new THREE.SphereGeometry(0.07, 8, 6);
    const shoeL = new THREE.Mesh(shoeGeo, new THREE.MeshStandardMaterial({ color:0x1a2531, roughness:.9 }));
    shoeL.scale.set(1, 0.6, 1.5); shoeL.position.set(-0.075, 0.045, 0.03);
    const shoeR = shoeL.clone(); shoeR.position.x = 0.075;
    g.add(legL); g.add(legR); g.add(shoeL); g.add(shoeR);

    // TORSO: tapered chest + hips, soft jacket look
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.135, 0.42, 12), shirtMat);
    torso.position.y = 0.52;
    const hips = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), pantsMat);
    hips.scale.set(1.05, 0.6, 0.9); hips.position.y = 0.36;
    g.add(torso); g.add(hips);

    // ARMS: shoulder pivot groups so a pickup pose can swing them forward
    const armGeo = THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.042, 0.24, 4, 8) : new THREE.CylinderGeometry(0.042, 0.05, 0.32, 8);
    function makeArm(side){
      const shoulder = new THREE.Group();
      shoulder.position.set(side*0.185, 0.68, 0);
      const upper = new THREE.Mesh(armGeo, shirtMat);
      upper.position.y = -0.14;
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.28;
      const fore = new THREE.Mesh(armGeo, skinMat);
      fore.scale.set(0.9, 0.8, 0.9);
      fore.position.y = -0.11;
      elbow.add(fore);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skinMat);
      hand.position.y = -0.24;
      elbow.add(hand);
      shoulder.add(elbow);
      return shoulder;
    }
    const armL = makeArm(-1), armR = makeArm(1);
    g.add(armL); g.add(armR);

    // NECK + HEAD: rounded head with hair cap, subtle nose
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 8), skinMat);
    neck.position.y = 0.755;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 14), skinMat);
    head.position.y = 0.855;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.142, 14, 12, 0, Math.PI*2, 0, Math.PI*0.55), new THREE.MeshStandardMaterial({ color: hairTones[colorIdx % hairTones.length], roughness:.95 }));
    hair.position.y = 0.87;
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), skinMat);
    nose.position.set(0, 0.845, 0.125);
    g.add(neck); g.add(head); g.add(hair); g.add(nose);

    if(holdingBag){
      // Carried sack: tall tapered garbage-bag silhouette held at the
      // right hand, slightly away from the body. Attached INSIDE the
      // right-arm elbow group so it follows arm poses automatically.
      const bagGroup = new THREE.Group();
      const bagMat = new THREE.MeshStandardMaterial({ color: 0x1c2e40, roughness:.85 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), bagMat);
      body.scale.set(0.8, 1.55, 0.75);
      body.position.y = 0.09;
      const neckM = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.05,0.09,8), bagMat);
      neckM.position.set(0.02, 0.22, 0);
      neckM.rotation.z = 0.4;
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), bagMat);
      knot.position.set(0.045, 0.265, 0);
      bagGroup.add(body); bagGroup.add(neckM); bagGroup.add(knot);
      bagGroup.position.set(0, -0.28, 0.06);
      bagGroup.rotation.z = -0.15;
      armR.add(bagGroup);
    }

    g.position.set(x, 0, z);
    g.traverse(o=>{ if(o.isMesh){ o.castShadow = true; } });
    g.scale.setScalar(0); // scales in once its beat is reached
    g.userData = { appearAt, phase: Math.random()*Math.PI*2, armR: armR, armL: armL, head: head };
    scene.add(g);
    people.push(g);
    return g;
  }

  function makeBeam(fromV, toV, threshold){
    // A true Line, not a mesh — it has no surface/thickness, so unlike a
    // thin cylinder it can never balloon into a big flat wedge no matter
    // how close the camera gets to it. Given a gentle upward arc so it
    // reads as a deliberate "connection" rather than a flat straight bar.
    const mid = new THREE.Vector3().addVectors(fromV, toV).multiplyScalar(0.5);
    mid.y += 1.1;
    const curve = new THREE.QuadraticBezierCurve3(fromV.clone(), mid, toV.clone());
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
    const mat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent:true, opacity:0 });
    const line = new THREE.Line(geo, mat);
    line.userData = { threshold };
    scene.add(line);
    beams.push(line);
  }

  // Litter bags for the clean-up beat: small crumpled dark blobs with a
  // tied top, scattered on the park lawn. Each holds a direct reference
  // to its volunteer; on the pickup cue the bag hops up and vanishes --
  // a visible "collected" beat without any flying-across-the-park nonsense.
  function makeTrashBag(x, z, volunteer, appearAt){
    const g = new THREE.Group();
    const bagMat = new THREE.MeshStandardMaterial({ color:0x2f3b4a, roughness:.95 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), bagMat);
    body.scale.set(1.15, 0.85, 1.05);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), bagMat);
    knot.position.y = 0.16;
    g.add(body); g.add(knot);
    g.position.set(x, 0.14, z);
    g.rotation.y = Math.random()*Math.PI;
    // Direct object reference to the volunteer who picks it up -- no
    // index arithmetic that can silently point at the wrong person.
    // sx/sz/baseRot freeze the spawn state so the arc math is stable.
    g.userData = { appearAt, volunteer, baseY: 0.14, sx:x, sz:z, baseRot:g.rotation.y };
    scene.add(g);
    trashBags.push(g);
    return g;
  }

  // person's head, not a screen-filling billboard) and depth-tested like
  // a normal object, so it sits IN the scene near what it's illustrating
  // instead of floating detached on top of everything.
  const iconTextures = {};
  function getIconTexture(kind){
    if(iconTextures[kind]) return iconTextures[kind];
    const c = document.createElement('canvas');
    c.width = 128; c.height = 112;
    const ctx = c.getContext('2d');
    function roundRect(x,y,w,h,r){
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
      ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); ctx.fill();
    }
    if(kind === 'chat'){
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      roundRect(8,8,112,64,18);
      ctx.beginPath(); ctx.moveTo(30,72); ctx.lineTo(46,72); ctx.lineTo(30,92); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0ea5e9';
      [38,64,90].forEach(cx=>{ ctx.beginPath(); ctx.arc(cx,40,7,0,Math.PI*2); ctx.fill(); });
    } else if(kind === 'key'){
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.beginPath(); ctx.arc(64,50,44,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(46,50,13,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(58,50); ctx.lineTo(90,50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(80,50); ctx.lineTo(80,62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(88,50); ctx.lineTo(88,60); ctx.stroke();
    } else if(kind === 'phone'){
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.beginPath(); ctx.arc(64,52,44,0,Math.PI*2); ctx.fill();
      // phone handset shape
      ctx.fillStyle = '#10b981';
      ctx.save(); ctx.translate(64,52); ctx.rotate(-0.7);
      ctx.fillRect(-7,-22,14,44);
      ctx.fillRect(-22,-7,44,14);
      ctx.restore();
      // two ring arcs
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(64,52,26,-0.5,0.9); ctx.stroke();
    } else if(kind === 'trash'){
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.beginPath(); ctx.arc(64,52,44,0,Math.PI*2); ctx.fill();
      // trash bag: dark blob with tied top
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.ellipse(64,62,22,18,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(64,42,7,0,Math.PI*2); ctx.fill();
      ctx.fillRect(60,42,8,10);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(64,42,7,0,Math.PI*2); ctx.stroke();
    } else if(kind === 'check'){
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.beginPath(); ctx.arc(64,56,44,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(42,58); ctx.lineTo(58,74); ctx.lineTo(88,40); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    iconTextures[kind] = tex;
    return tex;
  }
  function makeIconSprite(x, y, z, appearAt, kind, size){
    size = size || 0.62;
    const mat = new THREE.SpriteMaterial({ map: getIconTexture(kind), transparent:true, opacity:0, depthTest:false, depthWrite:false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size*0.78, 1);
    sprite.position.set(x, y, z);
    sprite.userData = { appearAt, baseY: y };
    scene.add(sprite);
    bubbles.push(sprite);
    return sprite;
  }

  function initScene(){
    renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    const isSmall = innerWidth <= 768;
    renderer.setPixelRatio(Math.min(devicePixelRatio||1, isSmall?1.6:2));
    renderer.setSize(canvas.clientWidth||innerWidth, canvas.clientHeight||innerHeight, false);
    // ── RENDER PIPELINE ──
    // No tone mapping (ACES washed the whole scene into a hazy "filter"
    // look -- reverted on feedback). Keep PCFSoftShadowMap only: contact
    // shadows ground objects without altering color.
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    // ── BLUE HOUR SKY ── a shader dome: luminous blue horizon blending
    // through steel blue into deep night at the zenith, with a cool
    // moon glow low on the horizon behind the street. This is the single
    // biggest "looks nice" upgrade -- everything silhouettes against a
    // real evening sky instead of a flat navy background.
    const skyGeo = new THREE.SphereGeometry(160, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        cTop:    { value: new THREE.Color(0x071a30) },   // deep night zenith
        cMid:    { value: new THREE.Color(0x0e3a5c) },   // steel blue band
        cHorizon:{ value: new THREE.Color(0x1d6fa3) },   // blue-hour horizon
        cSun:    { value: new THREE.Color(0x7dd3fc) },   // cool moon glow
        sunDir:  { value: new THREE.Vector3(-0.35, 0.12, -1).normalize() }
      },
      vertexShader: [
        'varying vec3 vDir;',
        'void main(){',
        '  vDir = normalize(position);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vDir;',
        'uniform vec3 cTop; uniform vec3 cMid; uniform vec3 cHorizon; uniform vec3 cSun;',
        'uniform vec3 sunDir;',
        'void main(){',
        '  float h = clamp(vDir.y, -0.1, 1.0);',
        '  vec3 col = mix(cHorizon, cMid, smoothstep(0.0, 0.24, h));',
        '  col = mix(col, cTop, smoothstep(0.2, 0.75, h));',
        '  float sunAmt = pow(max(dot(vDir, sunDir), 0.0), 14.0);',
        '  col += cSun * sunAmt * 0.85;',
        '  float sunHaze = pow(max(dot(vDir, sunDir), 0.0), 3.0);',
        '  col += cSun * sunHaze * 0.22;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);
    // Blue-hour key light: cool moonlight from high on the west end of the
    // street, soft cyan fill from the sky's opposite side. Long gentle
    // shadows across the road still sell the time of day.
    const ghSun = new THREE.DirectionalLight(0x9cc9e8, 1.0);
    ghSun.position.set(-30, 14, -55);
    ghSun.castShadow = true;
    ghSun.shadow.mapSize.set(2048, 2048);
    ghSun.shadow.camera.left = -16; ghSun.shadow.camera.right = 16;
    ghSun.shadow.camera.top = 26;   ghSun.shadow.camera.bottom = -14;
    ghSun.shadow.camera.near = 2;   ghSun.shadow.camera.far = 130;
    ghSun.shadow.bias = -0.0005;
    ghSun.shadow.normalBias = 0.02;
    scene.add(ghSun);
    const ghFill = new THREE.DirectionalLight(0x5aa7d6, 0.55);
    ghFill.position.set(24, 30, 20);
    scene.add(ghFill);
    const ghAmb = new THREE.AmbientLight(0x3a5f82, 0.6);
    scene.add(ghAmb);
    const ghHemi = new THREE.HemisphereLight(0x7db8dd, 0x0e2436, 0.55);
    scene.add(ghHemi);
    window.__bavSun = ghSun; window.__bavAmbient = ghAmb; window.__bavFill = ghFill;
    camera = new THREE.PerspectiveCamera(46, (canvas.clientWidth||innerWidth)/(canvas.clientHeight||innerHeight), 0.4, 220);

    // (lighting rig moved to the golden-hour setup above)
    // Fill light from the opposite side, plus a hemisphere light — without
    // these, only the sun-facing side of each building ever picks up real
    // light and the far side reads as flat/dark, which is what read as
    // "lighting isn't all around the building." This gives even, believable
    // illumination on every face instead of just one.
    

    // ground + road — the road gets a real dashed-lane-line texture and
    // lighter sidewalk strips either side, instead of a single flat colour
    // slab, so it reads as an actual street rather than a coloured plane.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160,160), new THREE.MeshStandardMaterial({ color:0x0b2438, roughness:1 }));
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    scene.add(ground);

    function makeRoadTexture(lengthUnits){
      const c = document.createElement('canvas');
      c.width = 64; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#16324a';
      ctx.fillRect(0,0,64,512);
      // subtle asphalt speckle for texture instead of a flat fill
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      for(let i=0;i<160;i++){
        ctx.fillRect(Math.random()*64, Math.random()*512, 1.2, 1.2);
      }
      // ONE dash per repeat tile (not several) — real lane markings are
      // long dashes with long gaps, not a tight dotted line. Repeating this
      // sparingly (see repeat.set below) is what actually reads as a road.
      ctx.fillStyle = 'rgba(253,230,138,0.8)';
      ctx.fillRect(30, 210, 4, 92);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
      // dash spacing is ~12.73 world units per repeat tile (140/11 from the
      // original single-plane road) — keep that same spacing now that the
      // road is split into two shorter segments around the plaza, instead
      // of hardcoding 11 dashes onto whatever length is passed in (which
      // would bunch or stretch the dashes differently on each segment).
      const len = lengthUnits || 140;
      tex.repeat.set(1, Math.round(len/12.73));
      // the road is viewed at a low, receding angle for most of the camera
      // path — at that grazing angle, mipmap minification along the
      // receding axis blurs the dashes into a hazy smear without
      // anisotropic filtering. Max out anisotropy (renderer is already
      // initialized above this call) so the dashes stay crisp into the
      // distance instead of washing out.
      if(renderer) tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    }
    // The road is a THROUGH street, but the park previously sat as a
    // circle stamped directly on top of that live traffic lane at the same
    // height as the road surface -- a park literally paved into a moving
    // road doesn't read as intentional, and being nearly coplanar with the
    // road (0.03 vs 0.02) also caused z-fighting flicker where the road's
    // texture bled through the park's edge. Fixed by actually opening a
    // gap in the road here and filling it with a plain paved plaza (no
    // lane markings) that the park sits inside, raised clearly above it --
    // reads as "the street opens into a square," which is how park squares
    // actually work in real neighborhoods, instead of a road/park overlap.
    const roadMat = new THREE.MeshStandardMaterial({ map: makeRoadTexture(57), roughness:1 });
    const roadNear = new THREE.Mesh(new THREE.PlaneGeometry(7,57), roadMat);
    roadNear.rotation.x = -Math.PI/2; roadNear.position.set(0,0.02,-71.5); // -100 to -43
    roadNear.receiveShadow = true;
    scene.add(roadNear);
    const roadFar = new THREE.Mesh(new THREE.PlaneGeometry(7,75), new THREE.MeshStandardMaterial({ map: makeRoadTexture(75), roughness:1 }));
    roadFar.rotation.x = -Math.PI/2; roadFar.position.set(0,0.02,2.5); // -35 to 40
    roadFar.receiveShadow = true;
    scene.add(roadFar);
    // plain paved plaza filling the gap (z -43 to -35) -- same ground
    // level as the road/sidewalks, just no lane markings, so the road
    // visibly opens into it rather than the park sitting on a driving lane
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(9,9), new THREE.MeshStandardMaterial({ color:0x1c3a52, roughness:1 }));
    plaza.rotation.x = -Math.PI/2; plaza.position.set(0,0.022,-39);
    scene.add(plaza);
    // sidewalks either side of the road (continuous -- bordering a plaza
    // the same way they border the road is normal streetscape, no gap needed)
    [-4.4, 4.4].forEach(sx=>{
      const walk = new THREE.Mesh(new THREE.PlaneGeometry(1.8,140), new THREE.MeshStandardMaterial({ color:0x1e3d54, roughness:1 }));
      walk.rotation.x = -Math.PI/2; walk.position.set(sx, 0.015, -30);
      scene.add(walk);
    });

    // ── DISTANT SKYLINE BACKDROP ── cheap silhouette blocks far off both
    // sides of the street and across the far end, so the world doesn't
    // visibly "end" a few metres from the road. One shared material, no
    // windows/shadows/animations — they're never approached by the camera,
    // just depth behind the lit street.
    // Slightly darker + cooler than the street rows so lit buildings
    // silhouette cleanly against them instead of blending together.
    const bldMat = new THREE.MeshStandardMaterial({ color:0x081e30, roughness:1 });
    const backdrop = [];
    function addSilhouette(x, z, w, h, d){
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldMat);
      m.position.set(x, h/2, z);
      backdrop.push(m); scene.add(m);
    }
    // sides (two depth rings each side)
    [[-20,-4],[-26,-14],[-22,-26],[-28,-38],[-24,-50],[-19,-12],[-25,-32],[-27,-46],
     [20,-6],[25,-16],[21,-28],[27,-40],[23,-52],[20,-10],[26,-34],[28,-48]]
      .forEach(function(b){ addSilhouette(b[0], b[1], 6+Math.random()*5, 8+Math.random()*14, 6+Math.random()*4); });
    // far end wall of skyline
    for(let i=0;i<9;i++){
      addSilhouette(-28 + i*7 + Math.random()*3, -74 - Math.random()*10, 6+Math.random()*4, 9+Math.random()*16, 6);
    }
    // a few behind the opening camera too, so the first shot has a skyline
    [[-20,6],[24,4],[-26,14],[22,12],[0,20]].forEach(function(b){ addSilhouette(b[0], b[1], 7, 10+Math.random()*8, 6); });

    const colors = [0x1a4a6b, 0x123a57, 0x1f5678, 0x164363, 0x1c4f74];
    // Left/right building rows down the street, thresholds spread across
    // the journey so they light up roughly as the camera reaches them.
    const rows = [
      [-6, -6, 4.2, 5.2, .06, -1], [6, -4, 3.8, 4.6, .08, 1],
      [-6.5, -10, 5.5, 6.8, .16, -1], [6.5, -10, 4.6, 5.6, .18, 1],
      [-6, -16, 3.6, 4.4, .28, -1], [6, -17, 4.8, 6.2, .30, 1],
      [-6.5, -24, 5.8, 7.2, .40, -1],
      [-6, -30, 4.0, 5.0, .52, -1], [6, -31, 5.2, 6.4, .54, 1],
      [-6.5, -38, 4.8, 6.0, .64, -1], [6.5, -37, 3.8, 4.6, .66, 1],
      [-6, -44, 5.6, 7.0, .74, -1], [6, -45, 4.4, 5.4, .76, 1],
      [-6.5, -50, 3.6, 4.2, .84, -1], [6.5, -50, 5.0, 6.0, .86, 1]
    ];
    rows.forEach((r,i)=>{
      makeBuilding(r[0], r[1], 3.4, r[3], 3.2, colors[i%colors.length], r[4], r[5]);
    });
    // The beat-2 "response" building: its street-facing wall fades away as
    // the camera arrives, revealing a small lit interior with a person
    // inside and a warm lamp — the actual "camera goes through the window"
    // moment, not just an exterior figure standing on the street.
    makeInteriorBuilding(6.5, -23, 3.4, 5.0, 3.2, colors[3], .42, 1);
    [-9,-19,-29,-39,-49].forEach((z,i)=>{
      makeStreetlight(i%2===0?-4:4, z, 0.1 + i*0.16);
      // the 3rd tree in this loop (z=-31, x=4.5) landed INSIDE building #9's
      // footprint (x:[4.3,7.7] z:[-32.6,-29.4] -- both ranges cover it), a
      // real tree-through-building clip, not a camera-angle illusion. Every
      // other z in this loop falls between building footprints; -27 is the
      // nearest clear gap on that side (past the interior-building's -24.6
      // edge, short of #9's -29.4 edge), so nudge that one tree there
      // instead of changing the formula for all five.
      const treeZ = (i===2) ? -27 : z-2;
      makeTree(i%2===0?4.5:-4.5, treeZ);
    });

    // park patch near beat 3 — a real textured lawn with a gravel path
    // crossing it, plus a bench, instead of one flat green disc (which
    // read as a plain shape with no detail).
    function makeParkTexture(){
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#1f7a52';
      ctx.fillRect(0,0,256,256);
      // mottled grass texture — small light/dark speckles, not a flat fill
      for(let i=0;i<900;i++){
        const shade = Math.random()>0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        ctx.fillStyle = shade;
        ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
      }
      // a gravel path curving across the park
      ctx.strokeStyle = 'rgba(210,190,150,0.55)';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(20,230);
      ctx.quadraticCurveTo(120,140,236,30);
      ctx.stroke();
      return new THREE.CanvasTexture(c);
    }
    const park = new THREE.Mesh(new THREE.CircleGeometry(2.6, 28), new THREE.MeshStandardMaterial({ map: makeParkTexture(), roughness:1 }));
    park.rotation.x = -Math.PI/2; park.position.set(0, 0.06, -39); // clearly above the plaza (0.022) now, not the razor-thin 0.01 gap that let its edge z-fight/flicker against the ground below it
    scene.add(park);
    // a simple bench for detail
    const benchMat = new THREE.MeshStandardMaterial({ color:0x4a3423, roughness:.9 });
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.06,0.28), benchMat);
    benchSeat.position.set(1.6, 0.32, -39.3);
    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.35,0.05), benchMat);
    benchBack.position.set(1.6, 0.5, -39.42);
    const benchLegs = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.3,0.24), new THREE.MeshStandardMaterial({ color:0x2e2016, roughness:.9 }));
    [1.25,1.95].forEach(bx=>{ const leg = benchLegs.clone(); leg.position.set(bx,0.16,-39.3); scene.add(leg); });
    scene.add(benchSeat); scene.add(benchBack);
    makeTree(-2.5,-41); makeTree(2.5,-41); makeTree(0,-36);

    // People — clustered near each story beat so the captions ("someone
    // loses their keys", "a neighbour answers", "neighbours gather") have
    // actual figures on screen, not just empty buildings. Positioned with
    // real clearance from the camera's own path (see camKeys below) so it
    // never gets close enough to near-clip into one.
    makePerson(-5.9, -12.4, 0, .16);  // beat 1: lost & found, near the left house — spaced further apart, staggered so they don't all pop in at once
    makePerson(-4.4, -9.6,  1, .20);
    makePerson(-6.4, -8.6,  2, .24);
    makePerson(-3.7, -13.2, 3, .28);
    // "found the keys" moment — a small key icon hovering right above the
    // person who found them, right on the caption's cue, so the beat
    // actually shows what happened instead of just two people standing near
    // a building with no visible connection to "lost keys."
    makeIconSprite(-4.4, 1.55, -9.6, .27, 'key', 0.55);
    // then a check mark near the other person once it's "returned"
    makeIconSprite(-5.9, 1.55, -12.4, .33, 'check', 0.5);

    makePerson(6.0, -25.8,  2, .40);  // beat 2: help request, near the right house
    makePerson(7.3, -22.6,  3, .44);
    makePerson(7.4, -26.4,  4, .48);
    makePerson(5.2, -21.8,  0, .52);

    // The communication moment: a chat icon right above the responder,
    // properly scaled to the scene (roughly head-height) and depth-tested
    // like a normal object, appearing the instant the caption says "a
    // verified neighbour answers" — reads as something happening at that
    // person, not a giant detached graphic floating in the sky.
    makeIconSprite(5.2, 1.65, -21.8, .50, 'chat', 0.6);

    // beat 3: a real clean-up crew in the park — volunteers with satchels
    // spread across the green
    const parkCrew = [
      makePerson(-1.8, -40.6, 4, .63, true),
      makePerson(1.6,  -41.4, 0, .66, true),
      makePerson(0.4,  -36.8, 2, .69),
      makePerson(-2.6, -37.8, 1, .72, true),
      makePerson(2.5,  -39.8, 3, .75),
      makePerson(0.7,  -42.6, 5, .78, true)
    ];
    // Litter scattered between them; each bag "picked up" by its nearest
    // volunteer slightly after that volunteer appears -- the beat's toast
    // says "Park cleaned up", and now the scene actually shows the pickup.
    const bagSpecs = [
      [-1.2, -40.2, 0, .65], [1.0, -41.0, 1, .68], [-0.4, -37.4, 2, .71],
      [-2.2, -38.2, 3, .74], [2.0, -39.4, 4, .77], [0.2, -42.2, 5, .80],
      [-0.9, -39.0, 1, .76], [1.4, -38.4, 0, .79]
    ];
    bagSpecs.forEach(sp=>{ makeTrashBag(sp[0], sp[1], parkCrew[sp[2]], sp[3]); });

    // Finale: as the camera rises for the full-street reveal, a lively
    // scattering of neighbours appears up and down the whole block — the
    // "now visibly connected, everyone's out and happy" payoff, instead of
    // just three lonely dots in an otherwise empty street.
    const finalePositions = [
      [-5,-5],[5.5,-4],[-6,-16],[6.2,-17],[-5.6,-29],[6,-30],
      [-6.3,-45],[6.4,-44],[-4,-50],[4.5,-49],[0,-33],[-2,-43]
    ];
    finalePositions.forEach((pos,i)=>{
      makePerson(pos[0], pos[1], i%6, 0.86 + (i%5)*0.012);
    });

    // Connection beams now link the actual people involved at each beat
    // (not an arbitrary line across the whole street), so what they're
    // "pointing at" is legible — the two neighbours from the lost & found
    // moment, the requester and responder, two of the volunteers.
    makeBeam(new THREE.Vector3(-5.6,1.0,-11.4), new THREE.Vector3(-4.9,1.0,-10.2), .26);
    makeBeam(new THREE.Vector3(6.2,1.0,-24.6),  new THREE.Vector3(7.0,1.0,-23.2),  .50);

    onResize();
    window.addEventListener('resize', onResize);
    canvas.classList.add('ready');
    canvas.style.opacity = '0';   // journey fades it in (see update()); start hidden so the CSS backdrop shows at p=0
  }

  function onResize(){
    if(!renderer) return;
    const w = canvas.clientWidth||innerWidth, h = canvas.clientHeight||innerHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }

  // Camera path: real 3D positions + lookAt targets. Interpolated with
  // easing between named keyframes — establishing shot, push toward each
  // beat's buildings (alternating sides down the street), travel between
  // them, then rise and pull back for the full-street reveal.
  const camKeys = [
    // Opening = the ORIGINAL homepage look: camera looking up at the sky
    // so the CSS gradient + particles read clean (their screenshot-9
    // homepage). Journey tilts down into the street; on unlock the hero
    // rests back here AND the 3D layer fades out entirely, so the resting
    // homepage is the pure gradient + headline + mascot they expect.
    { p:.00, pos:[0,4,6],      look:[0,26,2]   },
    { p:.05, pos:[0,13,10],    look:[0,3,-10]  },
    { p:.08, pos:[0,6,3],      look:[0,2,-8]   },
    { p:.20, pos:[-2.2,4,-3],  look:[-6,1.8,-9]   },  // approach beat 1 — pulled back to a proper medium shot, not against the wall
    { p:.30, pos:[-2.8,3.6,-6],look:[-6,1.5,-10.5] },
    { p:.36, pos:[-1,3,-15],   look:[1,1.8,-20] },
    { p:.48, pos:[2.8,4,-16],  look:[6,1.8,-22]   },  // approach beat 2 — same fix, clear of the building wall
    { p:.58, pos:[3.2,3.6,-19],look:[6,1.5,-23.5] },
    { p:.64, pos:[0,3.4,-30],  look:[0,1.7,-36] },
    { p:.75, pos:[0,5,-31],    look:[0,1.8,-38] },     // approach beat 3 — held back from the (now smaller) park so it doesn't fill the frame
    { p:.83, pos:[0,4.4,-33],  look:[0,1.5,-39] },
    { p:.90, pos:[0,14,-34],   look:[0,2,-42]  },
    { p:.96, pos:[0,30,-24],   look:[0,0,-24]  },
    { p:1.0, pos:[0,34,-22],   look:[0,0,-20]  }
  ];
  function ez(t){ return t<.5 ? 2*t*t : -1+(4-2*t)*t; }
  function lerpV(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
  function camAt(p){
    p = Math.max(0, Math.min(1, p));
    let i = 0;
    while(i < camKeys.length-2 && p > camKeys[i+1].p) i++;
    const a = camKeys[i], b = camKeys[i+1];
    const span = Math.max(0.0001, b.p - a.p);
    const t = ez(Math.max(0, Math.min(1, (p - a.p)/span)));
    return { pos: lerpV(a.pos,b.pos,t), look: lerpV(a.look,b.look,t) };
  }

  const beatRanges = [
    { key:'0', from:0,   to:.16 },
    { key:'1', from:.16, to:.34 },
    { key:'2', from:.40, to:.58 },
    { key:'3', from:.66, to:.84 },
    { key:'4', from:.86, to:.96 }
  ];
  function currentBeat(p){ for(const b of beatRanges){ if(p>=b.from && p<=b.to) return b.key; } return null; }

  // Camera micro-smoothing state: the hero's progress value already
  // eases toward its target, but keyframe interpolation itself can still
  // carry visible segment-boundary inflections. An additional short
  // exponential lag on the camera transform smooths those seams into
  // continuous, weighty camera motion -- the "invisible dolly grip"
  // quality. Lerp factors tuned so lag stays imperceptible on fast
  // scrolls but kills the mechanical keyframe snap.
  let camPosS=[0,4,6], camLookS=[0,26,2], camInit=false;
  function update(p){
    if(!camera) return;
    // Lighting/world progress: once the journey finishes and the hero
    // rests as the homepage, the WORLD stays warm and alive (buildings
    // lit, people out) even though the camera returns to the opening
    // framing -- the homepage should never sit cold/dark at p=0.
    const lp = window.__heroResting ? 1 : p;
    const cam = camAt(p);
    if(!camInit){ camPosS=cam.pos.slice(); camLookS=cam.look.slice(); camInit=true; }
    // 0.14 ≈ critically-damped feel at 60fps; frames that arrive late
    // (dt spike) still settle because this is applied every rendered frame.
    camPosS = camPosS.map((v,i)=> v + (cam.pos[i]-v)*0.14 );
    camLookS = camLookS.map((v,i)=> v + (cam.look[i]-v)*0.14 );
    camera.position.set(camPosS[0], camPosS[1], camPosS[2]);
    camera.lookAt(camLookS[0], camLookS[1], camLookS[2]);

    // Blue hour is the constant base look. The journey only lifts
    // intensity slightly as the street lights up (no color swaps).
    const glow = Math.min(1, lp/.9);
    if(window.__bavAmbient) window.__bavAmbient.intensity = 0.6 + glow*0.15;
    if(window.__bavSun)     window.__bavSun.intensity = 1.0 + glow*0.2;
    if(window.__bavFill)    window.__bavFill.intensity = 0.55 + glow*0.1;

    buildings.forEach(b=>{
      const lit = Math.max(0, Math.min(1, (lp - b.userData.threshold)/0.16));
      // Always keep a baseline self-glow tinted to the building's own
      // colour, scaled up as it "warms up" — never let it drop to fully
      // black/emissive-off, which is what made buildings blend invisibly
      // into the dark background (only their window planes stayed visible,
      // looking like they were floating in mid-air with no building behind
      // them at all).
      const glowAmt = 0.16 + lit*0.35;
      if(Array.isArray(b.material)){
        b.material.forEach(m=>{ if(m.emissive && m.color) m.emissive.copy(m.color).multiplyScalar(glowAmt); });
      } else if(b.material.emissive && b.material.color){
        b.material.emissive.copy(b.material.color).multiplyScalar(glowAmt);
      }
      if(b.userData.windows) b.userData.windows.forEach(w=>{
        w.material.color.setHex(lit>0.5 ? 0xbfe4ff : 0x0a1f33);
        w.material.opacity = lit>0.5 ? 1 : 0.85;
      });
    });
    streetlights.forEach(s=>{
      const lit = lp > s.userData.threshold;
      s.userData.light.intensity = lit ? 1.3 : 0;
      s.userData.bulbMat.color.setHex(lit ? 0x9ddcff : 0x1a2430);
      if(s.userData.glowMat) s.userData.glowMat.opacity += ((lit?0.22:0) - s.userData.glowMat.opacity) * 0.06;
    });
    beams.forEach(bm=>{
      const target = lp >= bm.userData.threshold ? 0.85 : 0;
      bm.material.opacity += (target - bm.material.opacity) * 0.08;
    });


    // Chat bubble: fades in right on cue, holds visible for a stretch,
    // then fades back out as the camera moves on — with a gentle float
    // and pulse so it reads as an active, live moment.
    const tNow = performance.now() * 0.001;
    bubbles.forEach(bub=>{
      const since = lp - bub.userData.appearAt;
      const target = (since > 0 && (since < 0.16 || window.__heroResting)) ? 1 : 0;
      bub.material.opacity += (target - bub.material.opacity) * 0.1;
      bub.position.y = bub.userData.baseY + Math.sin(tNow*1.8)*0.06;
      const pulse = 1 + Math.sin(tNow*3)*0.05;
      bub.scale.set(1.3*pulse, 1.0*pulse, 1);
    });

    // People scale in with a little bounce once their beat is reached,
    // then gently bob. Volunteers (with armR exposed) do a repeating
    // reach-down pickup gesture -- the readable "collecting litter"
    // action instead of static standing.
    const t = performance.now() * 0.001;
    people.forEach(person=>{
      const since = lp - person.userData.appearAt;
      const appear = Math.max(0, Math.min(1, since/0.05));
      const bounce = 1 - Math.pow(1-appear,3);
      person.scale.setScalar(Math.max(0, bounce));
      if(appear>=1){
        person.position.y = Math.sin(t*1.6 + person.userData.phase) * 0.04;
        const armR = person.userData.armR;
        if(armR){
          // slow reach-down-and-up cycle: arm swings forward/down then back
          const cyc = (Math.sin(t*1.1 + person.userData.phase) + 1) / 2; // 0..1
          const bend = cyc * 1.5; // radians of forward swing
          armR.rotation.x = -bend * 0.55;
          armR.rotation.z = -bend * 0.18;
        }
      }
    });

    // Trash pickup: once a bag's volunteer is on screen (bag.appearAt
    // reached), the bag arcs up toward the volunteer and shrinks away --
    // a visible "picked up" action instead of litter just disappearing.
    trashBags.forEach(bag=>{
      const since = lp - bag.userData.appearAt;
      if(since < 0 || window.__heroResting){
        bag.visible = false;
        return;
      }
      bag.visible = true;
      const pick = Math.max(0, Math.min(1, since/0.45));
      if(pick >= 1){
        bag.visible = false;
        return;
      }
      // "Collected" beat: the bag does a little hop at its own spot and
      // scales away -- no flying across the park (the fly-to-volunteer
      // version read as bags zooming off into the sky). The volunteer is
      // standing right next to it, so the pickup reads without movement.
      const e = pick*pick*(3-2*pick);
      bag.position.y = bag.userData.baseY + Math.sin(e*Math.PI)*0.22;
      bag.scale.setScalar(Math.max(0.01, 1-e));
      bag.rotation.y = bag.userData.baseRot + e*1.2;
    });

    const beat = currentBeat(p);
    caps.forEach(c=> c.classList.toggle('on', p>.01 && p<.985 && c.dataset.beat===beat));
    minis.forEach(m=> m.classList.toggle('on', p>.01 && p<.985 && m.dataset.beat===beat));

    if(scrimEl){
      const lift = Math.max(0, (p-.88)/.12)*0.22;
      scrimEl.style.opacity = String(1-lift);
    }

    // AT REST = the ORIGINAL homepage: when the journey finishes, the
    // camera returns to the sky-up opening AND the whole 3D layer eases
    // to transparent, leaving the clean CSS gradient + starfield + the
    // headline/mascot (exactly the screenshot-9 homepage look). The
    // canvas stays mounted (zero cost while transparent) so Replay Intro
    // can fade it straight back in.
    if(canvas){
      // Canvas visibility follows the journey: fully transparent at the
      // very start (p=0) so the CSS gradient + grid + orbs + particles
      // show as the homepage backdrop, fading in as the camera tilts down
      // into the street — and fully transparent again at rest.
      const restFade = window.__heroResting ? 1 : 0;
      const journeyIn = Math.max(0, Math.min(1, (p - 0.015) / 0.05));
      const cur = parseFloat(canvas.style.opacity || '0');
      const target = (1 - restFade) * journeyIn;
      const next = cur + (target - cur) * 0.08;
      canvas.style.opacity = String(next);
      canvas.style.pointerEvents = 'none';
    }
  }

  try{
    initScene();
    window.__updateNeighborhood = update;
    // Start on the frame the page layer actually landed on (PC intro:
    // 0; mobile: 0; reduced-motion desktop: 1 -- published by the hero
    // script as __heroInitP before this deferred file executes).
    const p0 = (typeof window.__heroInitP === 'number') ? window.__heroInitP : 0;
    update(p0);

    function render(){
      if(!running) return;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        const was = running;
        running = en.isIntersecting;
        if(running && !was) requestAnimationFrame(render);
      });
    }, { threshold:0 });
    const heroEl2 = document.getElementById('hero');
    if(heroEl2) io.observe(heroEl2);
  }catch(err){
    document.body.classList.add('no-3d');
    window.__updateNeighborhood = null;
  }

})();