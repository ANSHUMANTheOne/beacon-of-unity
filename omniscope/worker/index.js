import { onRequestGet as archive } from '../functions/api/archive.js';
import { onRequestGet as ephemeris } from '../functions/api/ephemeris.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/omniscope') {
      url.pathname = '/omniscope/';
      return Response.redirect(url, 308);
    }
    if (path === '/omniscope/api/archive' || path === '/omniscope/api/ephemeris') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      return path.endsWith('/archive') ? archive({ request }) : ephemeris({ request });
    }
    if (!path.startsWith('/omniscope/')) return new Response('Not found', { status: 404 });
    url.pathname = path.slice('/omniscope'.length) || '/index.html';
    if (url.pathname === '/') url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  },
};
