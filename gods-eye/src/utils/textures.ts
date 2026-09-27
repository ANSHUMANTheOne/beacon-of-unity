import * as THREE from 'three';

/**
 * All textures are generated procedurally on a <canvas> at runtime — no
 * external image assets required, and easy to swap for real NASA/USGS
 * planetary imagery later (just load a texture from a URL instead of
 * calling these generators).
 */

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function mixColor(a: THREE.Color, b: THREE.Color, t: number) {
  return a.clone().lerp(b, t);
}

/** Mottled, cratered look for rocky/terrestrial bodies and asteroids. */
export function createRockyTexture(baseColorHex: string, seed = 1): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRandom(seed * 9973 + 7);

  const base = new THREE.Color(baseColorHex);
  const dark = base.clone().multiplyScalar(0.62);
  const light = mixColor(base, new THREE.Color('#ffffff'), 0.22);

  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, size, size);

  // Low-frequency mottling
  for (let i = 0; i < 340; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 4 + rand() * 22;
    const t = rand();
    const c = t > 0.5 ? dark : light;
    ctx.globalAlpha = 0.05 + rand() * 0.12;
    ctx.fillStyle = `#${c.getHexString()}`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small crater-like specks
  ctx.globalAlpha = 1;
  for (let i = 0; i < 120; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 1 + rand() * 3.5;
    ctx.fillStyle = `#${dark.getHexString()}`;
    ctx.globalAlpha = 0.3 + rand() * 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Horizontal banding for gas/ice giants (Jupiter, Saturn, Uranus, Neptune). */
export function createGasGiantTexture(baseColorHex: string, seed = 1): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRandom(seed * 6151 + 3);

  const base = new THREE.Color(baseColorHex);
  const bandCount = 14 + Math.floor(rand() * 6);
  const bandHeight = height / bandCount;

  for (let i = 0; i < bandCount; i++) {
    const shade = 0.75 + rand() * 0.5;
    const c = base.clone().multiplyScalar(shade);
    ctx.fillStyle = `#${c.getHexString()}`;
    ctx.fillRect(0, i * bandHeight, width, bandHeight + 1);
  }

  // Horizontal turbulence: soft streaks smeared across bands
  for (let i = 0; i < 60; i++) {
    const y = rand() * height;
    const h = 2 + rand() * 6;
    const shade = 0.85 + rand() * 0.4;
    const c = base.clone().multiplyScalar(shade);
    ctx.globalAlpha = 0.12 + rand() * 0.18;
    ctx.fillStyle = `#${c.getHexString()}`;
    ctx.fillRect(0, y, width, h);
  }

  // A single storm spot for character (harmless if it lands near a pole)
  ctx.globalAlpha = 0.35;
  const spotX = rand() * width;
  const spotY = height * (0.3 + rand() * 0.4);
  const grad = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, 34);
  grad.addColorStop(0, mixColor(base, new THREE.Color('#ffffff'), 0.3).getStyle());
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(spotX, spotY, 34, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Radial gradient ring-particle texture for Saturn's rings. */
export function createRingTexture(baseColorHex: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  const base = new THREE.Color(baseColorHex);

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  const rand = seededRandom(42);
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const shade = 0.4 + rand() * 0.6;
    const alpha = 0.25 + rand() * 0.55;
    const c = base.clone().multiplyScalar(shade);
    grad.addColorStop(t, `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha})`);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Soft mottled noise for the Sun's surface, subtler than a flat sphere. */
export function createSunTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRandom(11);

  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 500; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 2 + rand() * 10;
    const brighter = rand() > 0.5;
    ctx.globalAlpha = 0.05 + rand() * 0.1;
    ctx.fillStyle = brighter ? '#ffffff' : '#ffb347';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
