# SaaS Factory

This folder adds an independent automation layer for creating repeatable SaaS
products from a clean template.

## Source Template

Default master: TanStarter (TanStack Start + Cloudflare Workers, with auth,
D1, Stripe/Creem/Waffo, R2, KV, AI, i18n, blog, newsletter and admin built in).

```text
E:\tanstarter-mkfast-template\mkfast-template   (private fork Soliday1984/origin-tanstarter-mkfast-template)
```

It is a fork of the official template (saas-sources-org/mkfast-template,
remote `upstream`, read-only), which the author keeps updating in step with
https://docs.tanstarter.dev/. To pick up new features: `git fetch upstream`,
`git merge upstream/main`, push to `origin` (or use "Sync fork" on GitHub, then
`git pull`). Keep it private (TanStarter license). Soliday1984/08-template is
only a backup copy.

Minimal alternative for small tool / game sites, usable with `--template`:

```text
E:\AIphaDev\templates\tanstack-cloudflare-saas   (Edge SaaS Starter)
```

Do not edit either folder for product experiments. Use this factory to copy a
template into a product workspace. The generator detects the template layout
(`src/lib/saas-config.ts` = Edge SaaS Starter, `project.inlang` +
`src/config/website.ts` = TanStarter).

## Create A Product

```powershell
cd E:\AIphaDev\saas-factory
.\create-PRODUCT.ps1 --config products/shopify-alt-text-generator/product.json --out E:\AIphaDev\products
```

You can also run the same generator through pnpm:

```powershell
pnpm create-product -- --config products/shopify-alt-text-generator/product.json --out E:\AIphaDev\products
```

The command creates:

```text
E:\AIphaDev\products\<product-slug>\
```

It copies the template while excluding `.git`, `node_modules`, build output,
local env files, Playwright reports, and Cloudflare local state.

To use the minimal Edge SaaS Starter instead:

```powershell
pnpm create-product -- --config products/shopify-alt-text-generator/product.json --template E:\AIphaDev\templates\tanstack-cloudflare-saas
```

## What Gets Customized

Edge SaaS Starter (`--template`):

- `package.json` package name.
- `wrangler.jsonc` worker name and vars `PUBLIC_APP_NAME` / `PUBLIC_SITE_URL`.
- `src/lib/saas-config.ts` `appName`.
- `env.example` app name, site URL, and from-email.
- `docs/factory/` launch notes, keyword table, and product config snapshot.

Validate the output with `pnpm install` and `pnpm validate`.

TanStarter (default):

- `package.json` package name.
- `wrangler.jsonc` worker name, domain route, D1/R2/KV placeholders.
- `project.inlang/messages/en.json` and `zh.json` core brand/SEO copy.
- `src/config/website.ts` social links, mail settings, auth/storage/cache flags.
- `.env.local.example` with product base URL and provider selections.
- `scripts/apply-d1-migrations.ts` so D1 migrations work from Windows PowerShell.
- `docs/factory/` launch notes, keyword table, and product config snapshot.

## Product Config

Start from:

```text
products/shopify-alt-text-generator/product.json
```

Then change the product name, domain, primary keyword, provider choices, and
Cloudflare resource placeholders.

## Next Automation Layer

The current script only creates a customized codebase. The next layer should add
Cloudflare provisioning:

1. Create D1 database, R2 bucket, and KV namespace.
2. Write returned ids into `wrangler.jsonc`.
3. Run `pnpm install`, `pnpm cf-typegen`, and local D1 migrations.
4. Sync secrets with `wrangler secret`.
5. Deploy to Workers.

## Opportunity Pool

The reusable product backlog lives in `opportunity-pool/`. Rank and validate it
before choosing the next product:

```powershell
pnpm pool:rank
pnpm pool:check
```

See `opportunity-pool/README.md` for stage gates and validation rules.
