# First-party acquisition and conversions

Implemented 2026-11-04. GA4 is not configured or required in this phase.

`acquisition_v1` is a host-only, HttpOnly, SameSite=Lax cookie, secure on HTTPS,
lasting up to 30 days. It preserves the first source, medium, campaign slug,
landing pathname (no query), referrer hostname (no full URL), and capture time.
Google/Bing ad click markers imply cpc, not organic; the marker values are not stored.
Missing attribution is unknown. Client-supplied attribution is marketing evidence,
not verified identity. GPC/DNT opt-outs prevent this cookie and browser interaction writes.

`growth_attribution` associates this context with an internal user/job ID.
`growth_events` records confirmed backend actions, with a unique operation/transaction
key. No email, IP, payment token, document content or uploaded CSV is stored in these tables.
`assistant_created` means provisioning succeeded; it does not prove installation.

Stripe invoices are counted only with status paid, positive amount_paid, and not
paid_out_of_band. Test/live comes from the verified provider object. Initial,
renewal, and adjustment are separate payment_kind values. Do not count renewals,
zero-value trials, existing test records or unknown legacy records as new customers.
Amounts are gross charged minor units; this is not net revenue, MRR or a refund ledger.

Read-only reporting: apply `queries/growth-summary.sql` to the site's D1 DB.
For subscription new-customer cohorts, require an observed sign_up plus initial
live payment and deduplicate by subject_id. ImageSEOFix subjects are jobs, so its
metric is paid jobs, not unique paying customers. Legacy activity is not backfilled.

Before release: apply the additive growth migration, deploy the reviewed build,
then verify a safe local/test journey and read the resulting events. Backend
analytics failures are logged as growth_tracking_write_failed; they do not turn
registration or tool completion into a failure. Invoice tracking failures retry
through the existing signed webhook retry path.
