# Article Stack Notes

The linked X posts point to the same indie SaaS direction:

- Move new sites from `Next.js + Vercel` toward `TanStack + Cloudflare`.
- Use `TanStack Start` for the full-stack React app layer.
- Run on `Cloudflare Workers` for edge deployment and low operating cost.
- Treat TanStarter-style boilerplates as the productized version of this stack.

## Recommended Lightweight Stack

| Layer | Default | Why |
| --- | --- | --- |
| App framework | TanStack Start + React 19 | Full-stack React, typed file routes, server functions, SSR. |
| Hosting | Cloudflare Workers | Edge runtime, simple deploys, low baseline cost. |
| Build/runtime | Vite + Cloudflare Vite plugin | Official TanStack Start Workers path. |
| Database | Cloudflare D1 + Drizzle ORM | Good default for small SaaS and tool sites. |
| Storage | Cloudflare R2 | File uploads, exports, generated assets. |
| Cache/limits | Cloudflare KV or Durable Objects | Quotas, simple session/cache state, rate limits. |
| Auth | Better Auth | Lightweight auth for email/social login. |
| Payments | Stripe first; Creem optional | Stripe for mature markets; Creem can be added for indie-friendly alternatives. |
| Email | Resend or Cloudflare Email | Transactional email and waitlist/newsletter workflows. |
| AI | Workers AI, OpenAI, fal.ai | Choose per task: cheap edge inference, strong text models, image/video generation. |
| Bot protection | Cloudflare Turnstile | Sign-up, checkout, and lead forms. |
| Analytics/SEO | GSC + sitemap + server-rendered content | Tool pages need crawlable copy, not only client-rendered UI. |

## Local Template Scope

This local starter intentionally keeps paid/provider packages out until you choose the exact services. It includes:

- TanStack Start on Cloudflare Workers.
- Tailwind CSS v4 and a SaaS-ready first screen.
- Health API, robots.txt, sitemap.xml.
- `wrangler.jsonc` binding placeholders for D1, R2, KV, and Workers AI.
- `.env.example` for auth, payment, email, and AI providers.

Add real auth/payment/database once a concrete product idea is selected.
