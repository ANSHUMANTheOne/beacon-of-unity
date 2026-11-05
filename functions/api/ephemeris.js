const bodies = { mercury: '199', venus: '299', earth: '399', mars: '499', jupiter: '599', saturn: '699', uranus: '799', neptune: '899' };

export async function onRequestGet({ request }) {
  const p = new URL(request.url).searchParams;
  const body = p.get('body') || '';
  const date = p.get('date') || '';
  if (!bodies[body] || !/^20[23]\d-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date + 'T00:00:00Z')) || new Date(date).toISOString().slice(0, 10) !== date) {
    return Response.json({ error: 'Choose a supported planet and a valid date from 2020 to 2039.' }, { status: 400 });
  }

  const jd = Date.parse(date + 'T00:00:00Z') / 86400000 + 2440587.5;
  const params = new URLSearchParams({
    format: 'json', COMMAND: `'${bodies[body]}'`, OBJ_DATA: "'NO'", MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'VECTORS'", CENTER: "'500@10'", REF_PLANE: "'ECLIPTIC'",
    REF_SYSTEM: "'ICRF'", OUT_UNITS: "'AU-D'", VEC_TABLE: "'2'",
    CSV_FORMAT: "'YES'", TLIST: `'${jd}'`, TIME_TYPE: "'UT'",
  });
  const source = 'https://ssd.jpl.nasa.gov/api/horizons.api?' + params;
  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(45000), redirect: 'manual' });
    if (!response.ok) throw Error('JPL returned ' + response.status);
    const data = await response.json();
    const row = data.result?.split('$$SOE')[1]?.split('$$EOE')[0]?.trim().split(',');
    if (!row) throw Error(data.error || 'No JPL vector returned.');
    const values = row.slice(2, 8).map(Number);
    if (values.length !== 6 || !values.every(Number.isFinite)) throw Error('Unsupported JPL response.');
    return Response.json({ body, epoch: date + 'T00:00:00Z', position: values.slice(0, 3), velocity: values.slice(3), frame: 'Ecliptic J2000', center: 'Sun', units: 'AU and AU/day', source, apiVersion: data.signature?.version }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'JPL is temporarily unavailable.' }, { status: 502 });
  }
}
