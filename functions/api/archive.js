// Keep archive requests on the site's own origin so browser CORS rules do not
// prevent live SPHEREx searches and FITS cutouts.
const HOST = 'https://irsa.ipac.caltech.edu';

export async function onRequestGet({ request }) {
  const p = new URL(request.url).searchParams;
  const ra = Number(p.get('ra'));
  const dec = Number(p.get('dec'));
  if (!p.has('ra') || !p.has('dec') || !Number.isFinite(ra) || !Number.isFinite(dec) || ra < 0 || ra >= 360 || dec < -90 || dec > 90) {
    return Response.json({ error: 'Use RA 0–359.999 and Dec −90–90 degrees.' }, { status: 400 });
  }

  let url;
  if (p.get('file')) {
    const file = p.get('file');
    if (!/^\/ibe\/data\/spherex\/qr[23]\/level2\/[A-Za-z0-9_\-/]+\.fits$/.test(file)) {
      return Response.json({ error: 'Invalid SPHEREx image path.' }, { status: 400 });
    }
    const size = Number(p.get('size') || '.4');
    if (!Number.isFinite(size) || size < .05 || size > .8) {
      return Response.json({ error: 'Cutout size must be 0.05–0.8 degrees.' }, { status: 400 });
    }
    url = new URL(HOST + file);
    url.search = new URLSearchParams({ center: `${ra},${dec}`, size: String(size), gzip: 'false' }).toString();
  } else {
    const collection = p.get('collection') || 'spherex_qr3';
    if (!['spherex_qr2', 'spherex_qr3', 'spherex_qr3_deep', 'spherex_qr2_deep'].includes(collection)) {
      return Response.json({ error: 'Invalid collection.' }, { status: 400 });
    }
    url = new URL(HOST + '/SIA');
    url.search = new URLSearchParams({ COLLECTION: collection, POS: `CIRCLE ${ra} ${dec} 0.001`, RESPONSEFORMAT: 'votable', MAXREC: '600' }).toString();
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(55000), redirect: 'manual' });
    if (!response.ok) {
      return Response.json({ error: `NASA/IPAC archive returned ${response.status}. Please retry or use the included real-data example.` }, { status: 502 });
    }
    return new Response(response.body, { headers: {
      'Content-Type': p.get('file') ? 'application/fits' : 'application/xml',
      'Cache-Control': p.get('file') ? 'public, max-age=604800, immutable' : 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Data-Source': HOST,
    } });
  } catch (error) {
    console.error('Archive request failed:', error);
    return Response.json({ error: 'The NASA/IPAC archive is temporarily unreachable. Retry or open the included real-data example.' }, { status: 502 });
  }
}
