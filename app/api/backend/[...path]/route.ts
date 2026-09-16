import { NextResponse } from 'next/server';

/**
 * Same-origin proxy for the Open Energy backend.
 *
 * The browser calls `/api/backend/<path>` and this handler forwards the
 * request to the backend with the API key attached. The key lives only on
 * the server:
 *   - production / previews: a Cloudflare Worker secret named OPEN_ENERGY_API_KEY
 *   - `wrangler dev`:        .dev.vars
 *   - `next dev`:            .env.local
 *
 * Because the browser only talks to its own origin, the backend's CORS
 * allowlist no longer matters for the site.
 */

export const dynamic = 'force-dynamic';

const UPSTREAM_ORIGIN = 'https://api.open-energy.madebyomnis.com';
const ROUTE_PREFIX = '/api/backend';

// Response headers worth passing back to the browser. Content-Disposition
// carries the filename for CSV exports.
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'content-disposition', 'cache-control'];

const buildUpstreamUrl = (requestUrl: string): string => {
  const { pathname, search } = new URL(requestUrl);
  // Keep the path exactly as sent, including any trailing slash: the backend
  // treats `/foo` and `/foo/` as different routes.
  const upstreamPath = pathname.startsWith(ROUTE_PREFIX)
    ? pathname.slice(ROUTE_PREFIX.length)
    : pathname;
  return `${UPSTREAM_ORIGIN}${upstreamPath}${search}`;
};

const fetchUpstream = async (url: string, apiKey: string, accept: string): Promise<Response> => {
  const init: RequestInit = {
    headers: { 'x-api-key': apiKey, accept },
    redirect: 'manual',
  };

  let response = await fetch(url, init);

  // The backend answers a trailing-slash mismatch with a 307 whose Location is
  // plain http://. Follow it once ourselves so the key never travels
  // unencrypted.
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      const target = new URL(location, url);
      target.protocol = 'https:';
      response = await fetch(target.toString(), init);
    }
  }

  return response;
};

export async function GET(request: Request) {
  const apiKey = process.env.OPEN_ENERGY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPEN_ENERGY_API_KEY is not configured on the server' },
      { status: 503 },
    );
  }

  const upstreamUrl = buildUpstreamUrl(request.url);
  const accept = request.headers.get('accept') ?? '*/*';

  let upstream: Response;
  try {
    upstream = await fetchUpstream(upstreamUrl, apiKey, accept);
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }

  const headers = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
