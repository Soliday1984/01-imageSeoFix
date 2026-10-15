# Launch Checklist

## 1. Pick The Narrow Tool

- Define one painful workflow.
- Build one free tool page that solves the first step.
- Put paid value behind privacy, batch volume, export, history, API access, or commercial use.

## 2. Wire Cloudflare

- Create a Workers project.
- Create D1, R2, and KV resources only when the product needs them.
- Replace placeholder bindings in `wrangler.jsonc`.
- Run `pnpm cf-typegen` after bindings are configured.

## 3. Add SaaS Modules

- Auth: Better Auth with email/social login.
- Payments: Stripe Checkout or Customer Portal.
- Email: Resend or Cloudflare Email for verification, receipts, and lifecycle messages.
- AI: Workers AI for cheap edge tasks; OpenAI/fal.ai for stronger generation.

## 4. SEO Basics

- Keep landing/tool pages server-rendered and crawlable.
- Update title, description, canonical URL, `sitemap.xml`, and `robots.txt`.
- Add comparison/tutorial/template pages only when they match real search intent.
- Submit sitemap in Google Search Console after deployment.

## 5. Validate Before Deploy

```bash
pnpm install
pnpm validate
pnpm dev
pnpm deploy
```

For local Cloudflare parity, use `pnpm preview` after a successful build.
