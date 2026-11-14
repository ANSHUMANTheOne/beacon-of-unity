import { onRequestGet as archive } from '../functions/api/archive.js';
import { onRequestGet as ephemeris } from '../functions/api/ephemeris.js';

const RELEASE_AT = Date.parse('2026-11-14T05:00:00Z'); // 14 Nov 2026, 09:00 GST
const LAUNCH_PAGE = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>OmniScope — Public launch November 14</title><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#071018;color:#e8f0ef;font:16px/1.6 Arial,sans-serif}main{min-height:100vh;display:grid;place-content:center;text-align:center;padding:24px;background:radial-gradient(ellipse at 50% 42%,#24414b 0,#0c1b24 38%,#071018 78%)}small{color:#8eb8b8;letter-spacing:.16em}h1{font-size:clamp(32px,6vw,58px);font-weight:500;margin:20px 0 4px;letter-spacing:-.04em}p{color:#bbcece;margin:6px 0}</style><main><small>OMNISCOPE / SPHEREx</small><h1>Public launch</h1><p>14 November 2026</p></main></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/omniscope') {
      url.pathname = '/omniscope/';
      return Response.redirect(url, 308);
    }
    if (path === '/omniscope/index.html') {
      url.pathname = '/omniscope/';
      return Response.redirect(url.toString(), 308);
    }
    const localPreview = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    const previewToken = env.OMNISCOPE_PREVIEW_TOKEN || '';
    const cookieToken = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)omniscope_preview=([^;]+)/)?.[1] || '';
    const previewAuthorized = !!previewToken &&
      (url.searchParams.get('preview') === previewToken || cookieToken === previewToken);
    if (!localPreview && !previewAuthorized && Date.now() < RELEASE_AT) {
      if (path === '/omniscope/') {
        return new Response(LAUNCH_PAGE, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
      }
      return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }
    if (path === '/omniscope/api/archive' || path === '/omniscope/api/ephemeris') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      return path.endsWith('/archive') ? archive({ request }) : ephemeris({ request });
    }
    if (!path.startsWith('/omniscope/')) return new Response('Not found', { status: 404 });
    url.pathname = path.slice('/omniscope'.length) || '/';
    const response = await env.ASSETS.fetch(new Request(url, request));
    if (previewAuthorized && path === '/omniscope/') {
      const headers = new Headers(response.headers);
      headers.set('Set-Cookie', `omniscope_preview=${previewToken}; Path=/omniscope/; Secure; HttpOnly; SameSite=Lax; Max-Age=604800`);
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
    return response;
  },
};
