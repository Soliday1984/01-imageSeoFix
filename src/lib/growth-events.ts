import {
  readAcquisition,
  unknownAcquisition,
  type Acquisition,
} from './acquisition.ts';

type Statement = {
  bind: (...values: unknown[]) => Statement;
  run: () => Promise<unknown>;
};
export type GrowthDatabase = { prepare: (query: string) => Statement };
export type GrowthEvent = {
  key: string;
  name:
    | 'sign_up'
    | 'audit_completed'
    | 'assistant_created'
    | 'job_created'
    | 'purchase'
    | 'csv_downloaded';
  subject: string;
  isTest?: boolean;
  amountMinor?: number;
  currency?: string;
  paymentKind?: 'initial' | 'renewal' | 'adjustment' | 'one_time' | 'unknown';
  occurredAt?: number;
};
/** Keeps the first attribution for an internal user/job ID, without emails or URLs. */
export async function attachAcquisition(
  db: GrowthDatabase,
  subject: string,
  headers: Headers
) {
  const attribution = readAcquisition(headers);
  await db
    .prepare(`INSERT INTO growth_attribution (subject_id, attribution_json) VALUES (?, ?)
    ON CONFLICT(subject_id) DO UPDATE SET attribution_json = excluded.attribution_json
    WHERE json_extract(growth_attribution.attribution_json, '$.capturedAt') = 0
      AND json_extract(excluded.attribution_json, '$.capturedAt') > 0`)
    .bind(subject, JSON.stringify(attribution))
    .run();
  return attribution;
}
export async function recordGrowthEvent(
  db: GrowthDatabase,
  event: GrowthEvent,
  attribution?: Acquisition
) {
  const amount =
    Number.isSafeInteger(event.amountMinor) && event.amountMinor! >= 0
      ? event.amountMinor
      : null;
  const currency = /^[a-z]{3}$/i.test(event.currency || '')
    ? event.currency!.toUpperCase()
    : null;
  await db
    .prepare(`INSERT OR IGNORE INTO growth_events
    (event_key, event_name, subject_id, occurred_at, is_test, amount_minor, currency, payment_kind, attribution_json)
    VALUES (?, ?, ?, ?, COALESCE(?, (SELECT MAX(is_test) FROM growth_events WHERE subject_id = ?), 0), ?, ?, ?, COALESCE((SELECT attribution_json FROM growth_attribution WHERE subject_id = ?), ?))`)
    .bind(
      event.key,
      event.name,
      event.subject,
      event.occurredAt ?? Date.now(),
      event.isTest === undefined ? null : event.isTest ? 1 : 0,
      event.subject,
      amount,
      currency,
      event.paymentKind ?? null,
      event.subject,
      JSON.stringify(attribution ?? unknownAcquisition())
    )
    .run();
}
/** Tracking failures must not undo an already completed business operation. */
export async function safelyTrack(work: () => Promise<unknown>) {
  try {
    await work();
  } catch {
    console.error('growth_tracking_write_failed');
  }
}

export async function deleteGrowthSubject(db: GrowthDatabase, subject: string) {
  await db
    .prepare('DELETE FROM growth_events WHERE subject_id = ?')
    .bind(subject)
    .run();
  await db
    .prepare('DELETE FROM growth_attribution WHERE subject_id = ?')
    .bind(subject)
    .run();
}

/** Invoice status, amount and mode come from the signature-verified Stripe event. */
export function stripeInvoiceEvent(
  invoice: {
    id?: string;
    status?: string | null;
    amount_paid?: number;
    currency?: string;
    livemode?: boolean;
    billing_reason?: string | null;
    created?: number;
    paid_out_of_band?: boolean;
  },
  subject: string
): GrowthEvent | null {
  if (
    !invoice.id ||
    invoice.status !== 'paid' ||
    !Number.isSafeInteger(invoice.amount_paid) ||
    invoice.amount_paid! <= 0 ||
    invoice.paid_out_of_band
  )
    return null;
  return {
    key: `stripe-invoice:${invoice.livemode === true ? 'live' : 'test'}:${invoice.id}`,
    name: 'purchase',
    subject,
    isTest: invoice.livemode !== true,
    amountMinor: invoice.amount_paid,
    currency: invoice.currency,
    paymentKind:
      invoice.billing_reason === 'subscription_create'
        ? 'initial'
        : invoice.billing_reason === 'subscription_cycle'
          ? 'renewal'
          : invoice.billing_reason === 'subscription_update'
            ? 'adjustment'
            : 'unknown',
    occurredAt: invoice.created ? invoice.created * 1000 : undefined,
  };
}
