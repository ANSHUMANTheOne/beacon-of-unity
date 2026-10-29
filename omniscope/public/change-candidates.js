// A quick-look search of two images already registered onto the same sky grid.
// These are local residual peaks for human review, not confirmed moving sources.
function median(values) {
  if (!values.length) return NaN;
  values.sort((a, b) => a - b);
  const mid = values.length >> 1;
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

export function findChangeCandidates(a, b, limit = 5) {
  if (!a || !b || a.n !== b.n) return { candidates: [], checked: 0, reason: 'A matched image pair is needed.' };
  const n = a.n, length = n * n, residual = new Float32Array(length), valid = new Uint8Array(length), differences = [];
  for (let i = 0; i < length; i++) {
    const va = a.values[i], vb = b.values[i], wa = a.wavelength[i], wb = b.wavelength[i];
    const width = Math.max(a.bandwidth[i] || 0, b.bandwidth[i] || 0);
    const tolerance = Math.max(.025, Math.min(.08, width * 2));
    if (!Number.isFinite(va) || !Number.isFinite(vb) || !Number.isFinite(wa) || !Number.isFinite(wb) || a.flags[i] !== 0 || b.flags[i] !== 0 || Math.abs(wa - wb) > tolerance) continue;
    const d = vb - va;
    valid[i] = 1;
    residual[i] = d;
    differences.push(d);
  }
  if (differences.length < 300) return { candidates: [], checked: differences.length, reason: 'Too few clean pixels at similar wavelengths overlap.' };

  const background = median(differences);
  const noise = Math.max(1e-8, 1.4826 * median(differences.map(value => Math.abs(value - background))));
  const score = new Float32Array(length);
  for (let y = 10; y < n - 10; y++) for (let x = 10; x < n - 10; x++) {
    const i = y * n + x;
    if (!valid[i]) continue;
    let sum = 0, count = 0;
    for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) {
      const k = yy * n + xx;
      if (valid[k]) { sum += residual[k] - background; count++; }
    }
    if (count >= 7 && Math.abs(residual[i] - background) > 2.5 * noise) score[i] = Math.abs(sum) / (noise * Math.sqrt(count));
  }

  const peaks = [];
  for (let y = 13; y < n - 13; y++) for (let x = 13; x < n - 13; x++) {
    const i = y * n + x, strength = score[i];
    if (strength < 6) continue;
    let peak = true;
    for (let yy = y - 2; yy <= y + 2 && peak; yy++) for (let xx = x - 2; xx <= x + 2; xx++) {
      const k = yy * n + xx;
      if (score[k] > strength || (score[k] === strength && k < i)) { peak = false; break; }
    }
    if (peak) peaks.push({ x, y, i, strength });
  }
  peaks.sort((a, b) => b.strength - a.strength);
  const chosen = [];
  for (const peak of peaks) {
    if (chosen.some(other => Math.hypot(other.x - peak.x, other.y - peak.y) < 12)) continue;
    const i = peak.i, delta = residual[i] - background;
    chosen.push({ x: peak.x, y: peak.y, strength: peak.strength, delta, direction: delta > 0 ? 'brighter later' : 'brighter earlier', wavelengthA: a.wavelength[i], wavelengthB: b.wavelength[i], valueA: a.values[i], valueB: b.values[i] });
    if (chosen.length >= limit) break;
  }
  return { candidates: chosen, checked: differences.length, noise, background, reason: chosen.length ? '' : 'No compact, high-contrast residual passed the quick-look threshold.' };
}
