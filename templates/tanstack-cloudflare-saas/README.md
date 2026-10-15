# Edge SaaS Starter

A local SaaS template based on the stack recommended in the linked X posts:
`TanStack Start + Cloudflare Workers`, with optional modules for D1, R2, KV,
Better Auth, Stripe/Creem, Resend/Cloudflare Email, Turnstile, and AI providers.

## Why This Stack

- TanStack Start gives a full-stack React app with typed file routes, SSR,
  server routes, and server functions.
- Cloudflare Workers keeps the first version cheap, global, and close to the
  Cloudflare storage/runtime ecosystem.
- SaaS modules are added when needed instead of installed up front, so a new
  tool site can stay small until traffic and payment signals justify complexity.

See [docs/STACK.md](docs/STACK.md) for the article-derived stack notes.

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validate

```bash
pnpm validate
```

This runs route generation, Biome checks, and a production build.

## Useful Routes

- `/` - SaaS starter screen and launch checklist.
- `/api/health` - Server route health check.
- `/robots.txt` - SEO crawler rules.
- `/sitemap.xml` - Starter sitemap.

## Cloudflare Setup

`wrangler.jsonc` is preconfigured for TanStack Start on Cloudflare Workers:

- `main`: `@tanstack/react-start/server-entry`
- `compatibility_flags`: `["nodejs_compat"]`
- placeholders for D1, R2, KV, and Workers AI bindings

After creating real Cloudflare resources, uncomment the relevant bindings and
run:

```bash
pnpm cf-typegen
pnpm deploy
```

Use `env.example` as the local checklist. Secrets should be set with
`wrangler secret put`, not committed to the repo.

## Add SaaS Modules When Needed

Recommended order:

1. Free tool page with crawlable content.
2. D1 + Drizzle for accounts, jobs, and billing metadata.
3. Better Auth for email/social login.
4. Stripe Checkout or Creem for paid plans.
5. Resend or Cloudflare Email for transactional email.
6. R2 for uploads, exports, and generated files.
7. Turnstile and rate limits before exposing costly endpoints.
8. Workers AI/OpenAI/fal.ai based on the product workload.

The launch checklist lives in [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md).
