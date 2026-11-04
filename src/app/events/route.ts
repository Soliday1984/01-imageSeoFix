import { NextResponse } from 'next/server';
import { readAcquisition, trackingAllowed } from '@/lib/acquisition';
import { getSelfServeBindings } from '@/lib/self-serve/server';

const allowedEvents = new Set([
  'csv_export',
  'csv_generate',
  'csv_upload',
  'full_store_fix_cta_click',
  'hero_scan_click',
  'lead_request_missing_email',
  'lead_email_open',
  'manual_fix_copy',
  'payment_link_click',
  'pricing_cta_click',
  'pricing_view',
  'smoke_test',
  'store_scan_error',
  'store_scan_submit',
  'store_scan_success',
  'self_serve_checkout_start',
  'self_serve_csv_download',
  'self_serve_csv_selected',
  'self_serve_import_feedback',
  'self_serve_job_created',
  'self_serve_recovery_requested',
  'self_serve_status_loaded',
]);
const maxBodyBytes = 2_000;

type EventPayload = Record<string, string | number | boolean | null>;

function noContent() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function jsonResponse(body: unknown, status = 400) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function sanitizePayload(input: unknown): EventPayload {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const payload: EventPayload = {};
  for (const [key, value] of Object.entries(input)) {
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(key)) {
      continue;
    }

    if (
      value === null ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      payload[key] = value;
      continue;
    }

    if (typeof value === 'string') {
      payload[key] = value.slice(0, 120);
    }
  }

  return payload;
}

export async function POST(request: Request) {
  if (!trackingAllowed(request.headers)) return noContent();
  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin) return jsonResponse({error: 'Invalid origin.'}, 403);
  if (Number(request.headers.get('content-length') || 0) > maxBodyBytes) return jsonResponse({error: 'Event payload is too large.'}, 413);
  const {db, env} = await getSelfServeBindings();
  const limiter = (env as unknown as {ANALYTICS_RATE_LIMITER?: {limit: (input: {key: string}) => Promise<{success: boolean}>}}).ANALYTICS_RATE_LIMITER;
  if (limiter) {
    const limited = await limiter.limit({key: `imageseofix:events:${request.headers.get('cf-connecting-ip') || 'anonymous'}`});
    if (!limited.success) return jsonResponse({error: 'Too many events.'}, 429);
  } else if (process.env.NODE_ENV === 'production') {
    return jsonResponse({error: 'Event protection unavailable.'}, 503);
  }
  const rawBody = await request.text();
  if (rawBody.length > maxBodyBytes) {
    return jsonResponse({ error: 'Event payload is too large.' }, 413);
  }

  let body: unknown;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return jsonResponse({ error: 'Invalid event payload.' }, 400);
  }

  const event =
    body && typeof body === 'object' && !Array.isArray(body)
      ? String((body as { event?: unknown }).event ?? '')
      : '';

  if (!allowedEvents.has(event)) {
    return jsonResponse({ error: 'Unknown event.' }, 400);
  }

  const eventId = (body as {eventId?: unknown}).eventId;
  if (typeof eventId !== 'string' || !/^[a-f0-9-]{36}$/i.test(eventId)) {
    return jsonResponse({error: 'Invalid event ID.'});
  }

  const payload = sanitizePayload(
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as { payload?: unknown }).payload
      : undefined
  );

  // Browser observations are kept separately from confirmed backend conversions.
  const safeKeys = new Set(['mode','imageRows','issueCount','productCount','processedImageRows','changedRows','bytes','status','reason']);
  const safePayload = Object.fromEntries(Object.entries(payload).filter(([key, value]) =>
    safeKeys.has(key) && (typeof value !== 'string' || /^[a-z0-9_-]{0,64}$/i.test(value))));
  try {
    await db.prepare('INSERT OR IGNORE INTO growth_interactions (event_id, event_name, occurred_at, attribution_json, payload_json) VALUES (?, ?, ?, ?, ?)')
      .bind(eventId, event, Date.now(), JSON.stringify(readAcquisition(request.headers)), JSON.stringify(safePayload)).run();
  } catch {
    console.error('growth_interaction_write_failed');
    return jsonResponse({error: 'Event storage unavailable.'}, 503);
  }

  return noContent();
}
