/** First-touch, self-reported marketing context. Never used for authorization. */
export const ACQUISITION_COOKIE = 'acquisition_v1';
const MAX_AGE = 30 * 24 * 60 * 60;
export type Acquisition = {
  source: string;
  medium: string;
  campaign: string;
  landingPath: string;
  referrerHost: string;
  capturedAt: number;
};
export const unknownAcquisition = (): Acquisition => ({
  source: 'unknown',
  medium: 'unknown',
  campaign: '',
  landingPath: '',
  referrerHost: '',
  capturedAt: 0,
});
const label = (value: unknown) =>
  typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value)
    ? value.toLowerCase()
    : '';
const path = (value: unknown) =>
  typeof value === 'string' && /^\/[a-z0-9/_-]{0,159}$/i.test(value)
    ? value
    : '/';
export function trackingAllowed(headers: Headers) {
  return headers.get('sec-gpc') !== '1' && headers.get('dnt') !== '1';
}
export function readAcquisition(
  headers: Headers,
  now = Date.now()
): Acquisition {
  if (!trackingAllowed(headers)) return unknownAcquisition();
  try {
    const raw = headers
      .get('cookie')
      ?.split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${ACQUISITION_COOKIE}=`))
      ?.slice(ACQUISITION_COOKIE.length + 1);
    if (!raw || raw.length > 2048) return unknownAcquisition();
    const data = JSON.parse(decodeURIComponent(raw));
    if (
      !Number.isFinite(data.capturedAt) ||
      data.capturedAt > now ||
      now - data.capturedAt > MAX_AGE * 1000 ||
      !label(data.source) ||
      !label(data.medium)
    ) {
      return unknownAcquisition();
    }
    return {
      source: label(data.source),
      medium: label(data.medium),
      campaign: label(data.campaign),
      landingPath: path(data.landingPath),
      referrerHost:
        typeof data.referrerHost === 'string' &&
        /^[a-z0-9.-]{1,120}$/i.test(data.referrerHost)
          ? data.referrerHost
          : '',
      capturedAt: data.capturedAt,
    };
  } catch {
    return unknownAcquisition();
  }
}
export function acquisitionForRequest(
  request: Request,
  now = Date.now()
): Acquisition {
  const url = new URL(request.url);
  let host = '';
  try {
    host = new URL(request.headers.get('referer') || '').hostname.toLowerCase();
  } catch {
    /* no referrer */
  }
  const internal =
    host === url.hostname ||
    host.endsWith(`.${url.hostname.replace(/^www\./, '')}`);
  const search =
    /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|baidu\.com)$/i.test(
      host
    );
  const source = label(url.searchParams.get('utm_source'));
  const paidSource =
    url.searchParams.has('gclid') || url.searchParams.has('dclid')
      ? 'google'
      : url.searchParams.has('msclkid')
        ? 'bing'
        : '';
  return {
    source:
      source ||
      paidSource ||
      (search
        ? host.includes('google.')
          ? 'google'
          : host.includes('bing.')
            ? 'bing'
            : host.includes('duckduckgo.')
              ? 'duckduckgo'
              : host.includes('yahoo.')
                ? 'yahoo'
                : 'baidu'
        : host && !internal
          ? 'referral'
          : internal
            ? 'unknown'
            : 'direct'),
    medium:
      label(url.searchParams.get('utm_medium')) ||
      (paidSource
        ? 'cpc'
        : source
          ? 'unknown'
          : search
            ? 'organic'
            : host && !internal
              ? 'referral'
              : internal
                ? 'unknown'
                : 'none'),
    campaign: label(url.searchParams.get('utm_campaign')),
    landingPath: path(url.pathname),
    referrerHost: internal ? '' : host.slice(0, 120),
    capturedAt: now,
  };
}
/** Only successful document responses set a host-only cookie; never cache it. */
export function captureAcquisition(
  request: Request,
  response: Response
): Response {
  if (
    request.method !== 'GET' ||
    response.status !== 200 ||
    !response.headers.get('content-type')?.includes('text/html')
  )
    return response;
  if (
    readAcquisition(request.headers).capturedAt ||
    !trackingAllowed(request.headers)
  )
    return response;
  const url = new URL(request.url);
  if (/^\/(api|_next|assets)(\/|$)/.test(url.pathname)) return response;
  const headers = new Headers(response.headers);
  headers.append(
    'Set-Cookie',
    `${ACQUISITION_COOKIE}=${encodeURIComponent(JSON.stringify(acquisitionForRequest(request)))}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax${url.protocol === 'https:' ? '; Secure' : ''}`
  );
  headers.set('Cache-Control', 'private, no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
