#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const factoryRoot = path.resolve(__dirname, '..');
// Edge SaaS Starter, repo Soliday1984/08-template.
const defaultTemplatePath = 'E:\\GitRepo\\08-template\\08-template';
const tanStarterTemplatePath = 'E:\\mkfast-template\\mkfast-template';
const defaultOutRoot = 'E:\\AIphaDev\\products';

const excludedSegments = new Set([
  '.git',
  'node_modules',
  'dist',
  'dist-ssr',
  '.wrangler',
  '.tanstack',
  '.nitro',
  '.output',
  '.vinxi',
  '.content-collections',
  'src\\locale\\paraglide',
  'playwright-report',
  'test-results',
  '.qa',
]);

const excludedNames = new Set(['todos.json', 'count.txt']);

function isExcludedName(name) {
  if (excludedNames.has(name)) {
    return true;
  }

  // Local secrets and dev logs; keep .env.example, TanStarter reads it.
  if (name.startsWith('.env') && name !== '.env.example') {
    return true;
  }

  return name.startsWith('.dev.vars') || /^\.dev-server.*\.log$/.test(name);
}

function parseArgs(argv) {
  const args = {
    config: path.join(
      factoryRoot,
      'products',
      'shopify-alt-text-generator',
      'product.json',
    ),
    template: defaultTemplatePath,
    out: defaultOutRoot,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--config') {
      args.config = argv[++index];
    } else if (arg === '--template') {
      args.template = argv[++index];
    } else if (arg === '--out') {
      args.out = argv[++index];
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`create-product

Usage:
  node scripts/create-product.mjs --config products/my-product/product.json --out E:\\AIphaDev\\products

Options:
  --config <path>    Product config JSON.
  --template <path>  Template path. Default: Edge SaaS Starter
                     (${defaultTemplatePath}).
                     Full TanStarter: ${tanStarterTemplatePath}
  --out <path>       Output root directory.
  --force            Replace existing output directory.
`);
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeProduct(raw) {
  const slug = slugify(raw.slug || raw.name || raw.brand);

  if (!slug) {
    throw new Error('Product config needs slug, name, or brand.');
  }

  const brand = raw.brand || raw.name || slug;
  const domain = raw.domain || `${slug}.example.com`;
  const baseUrl = raw.baseUrl || `https://${domain}`;
  const cloudflare = raw.cloudflare || {};
  const providers = raw.providers || {};
  const contact = raw.contact || {};

  return {
    ...raw,
    slug,
    name: raw.name || brand,
    brand,
    description:
      raw.description ||
      `${brand} is a focused SaaS tool for ${raw.primaryKeyword || slug}.`,
    domain,
    baseUrl,
    primaryKeyword: raw.primaryKeyword || raw.name || brand,
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    features: Array.isArray(raw.features) ? raw.features : [],
    mvp: raw.mvp || {},
    providers: {
      auth: providers.auth !== false,
      googleOAuth: providers.googleOAuth === true,
      payment: providers.payment || '',
      mail: providers.mail || 'resend',
      newsletter: providers.newsletter || 'resend',
      notification: providers.notification || '',
      storage: providers.storage !== false,
      cache: providers.cache !== false,
    },
    cloudflare: {
      workerName: cloudflare.workerName || slug,
      route: cloudflare.route || domain,
      d1DatabaseName: cloudflare.d1DatabaseName || slug,
      d1DatabaseId: cloudflare.d1DatabaseId || 'REPLACE_WITH_D1_DATABASE_ID',
      r2BucketName: cloudflare.r2BucketName || slug,
      kvNamespaceId: cloudflare.kvNamespaceId || 'REPLACE_WITH_KV_NAMESPACE_ID',
    },
    social: {
      github: raw.social?.github || '',
      discord: raw.social?.discord || '',
      twitter: raw.social?.twitter || '',
      youtube: raw.social?.youtube || '',
    },
    contact: {
      fromEmail: contact.fromEmail || `${brand} <support@${domain}>`,
      supportEmail: contact.supportEmail || `support@${domain}`,
    },
    messages: raw.messages || {},
  };
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyTemplate(templatePath, outDir, force) {
  if (await exists(outDir)) {
    if (!force) {
      throw new Error(
        `Output already exists: ${outDir}. Use --force to replace it.`,
      );
    }

    await fs.rm(outDir, { recursive: true, force: true });
  }

  await fs.mkdir(path.dirname(outDir), { recursive: true });

  await fs.cp(templatePath, outDir, {
    recursive: true,
    filter: (source) => shouldCopy(templatePath, source),
  });
}

function shouldCopy(templatePath, source) {
  const relative = path.relative(templatePath, source);

  if (!relative) {
    return true;
  }

  const normalized = relative.split(path.sep).join('\\');
  const segments = normalized.split('\\');

  if (segments.some((segment) => excludedSegments.has(segment))) {
    return false;
  }

  for (const excluded of excludedSegments) {
    if (normalized.startsWith(`${excluded}\\`)) {
      return false;
    }
  }

  return !isExcludedName(path.basename(source));
}

async function detectTemplateKind(templatePath) {
  if (await exists(path.join(templatePath, 'src', 'lib', 'saas-config.ts'))) {
    return 'edge';
  }

  if (
    (await exists(path.join(templatePath, 'project.inlang'))) &&
    (await exists(path.join(templatePath, 'src', 'config', 'website.ts')))
  ) {
    return 'tanstarter';
  }

  throw new Error(
    `Unknown template layout: ${templatePath}. Expected Edge SaaS Starter (src/lib/saas-config.ts) or TanStarter (project.inlang + src/config/website.ts).`,
  );
}

function replaceRequired(content, pattern, replacement, label) {
  if (!pattern.test(content)) {
    throw new Error(`Template drift: could not find ${label}.`);
  }

  return content.replace(pattern, replacement);
}

async function customizeEdgeTemplate(outDir, product) {
  const packagePath = path.join(outDir, 'package.json');
  const pkg = await readJson(packagePath);
  pkg.name = product.slug;
  await writeJson(packagePath, pkg);

  const wranglerPath = path.join(outDir, 'wrangler.jsonc');
  let wrangler = await fs.readFile(wranglerPath, 'utf8');
  wrangler = replaceRequired(
    wrangler,
    /("name":\s*)"[^"]*"/,
    (_, prefix) => `${prefix}${JSON.stringify(product.cloudflare.workerName)}`,
    'wrangler.jsonc name',
  );
  wrangler = replaceRequired(
    wrangler,
    /("PUBLIC_APP_NAME":\s*)"[^"]*"/,
    (_, prefix) => `${prefix}${JSON.stringify(product.brand)}`,
    'wrangler.jsonc vars.PUBLIC_APP_NAME',
  );
  wrangler = replaceRequired(
    wrangler,
    /("PUBLIC_SITE_URL":\s*)"[^"]*"/,
    (_, prefix) => `${prefix}${JSON.stringify(product.baseUrl)}`,
    'wrangler.jsonc vars.PUBLIC_SITE_URL',
  );
  await fs.writeFile(wranglerPath, wrangler, 'utf8');

  const configPath = path.join(outDir, 'src', 'lib', 'saas-config.ts');
  let saasConfig = await fs.readFile(configPath, 'utf8');
  saasConfig = replaceRequired(
    saasConfig,
    /(export const appName = )"[^"]*";/,
    (_, prefix) => `${prefix}${JSON.stringify(product.brand)};`,
    'saas-config.ts appName',
  );
  await fs.writeFile(configPath, saasConfig, 'utf8');

  const envPath = path.join(outDir, 'env.example');
  if (await exists(envPath)) {
    let env = await fs.readFile(envPath, 'utf8');
    env = env.replace(
      /^PUBLIC_APP_NAME=.*$/m,
      `PUBLIC_APP_NAME=${JSON.stringify(product.brand)}`,
    );
    env = env.replace(
      /^PUBLIC_SITE_URL=.*$/m,
      `PUBLIC_SITE_URL=${JSON.stringify(product.baseUrl)}`,
    );
    env = env.replace(
      /^EMAIL_FROM=.*$/m,
      `EMAIL_FROM=${JSON.stringify(product.contact.fromEmail)}`,
    );
    await fs.writeFile(envPath, env, 'utf8');
  }
}

async function customizeTanStarterTemplate(outDir, product) {
  await customizePackage(outDir, product);
  await customizeWrangler(outDir, product);
  await customizeMessages(outDir, product);
  await customizeWebsiteConfig(outDir, product);
  await writeCrossPlatformScripts(outDir);
  await writeEnvExample(outDir, product);
}

async function customizePackage(outDir, product) {
  const packagePath = path.join(outDir, 'package.json');
  const pkg = await readJson(packagePath);
  pkg.name = product.slug;
  pkg.scripts['db:migrate:local'] = 'tsx scripts/apply-d1-migrations.ts --local';
  pkg.scripts['db:migrate:remote'] = 'tsx scripts/apply-d1-migrations.ts --remote';
  await writeJson(packagePath, pkg);
}

async function customizeWrangler(outDir, product) {
  const wranglerPath = path.join(outDir, 'wrangler.jsonc');
  let content = await fs.readFile(wranglerPath, 'utf8');

  content = content.replace(
    /"name":\s*"[^"]+"/,
    `"name": "${product.cloudflare.workerName}"`,
  );
  content = content.replace(
    /"pattern":\s*"[^"]+"/,
    `"pattern": "${product.cloudflare.route}"`,
  );
  content = content.replace(
    /"database_name":\s*"[^"]+"/,
    `"database_name": "${product.cloudflare.d1DatabaseName}"`,
  );
  content = content.replace(
    /"database_id":\s*"[^"]+"/,
    `"database_id": "${product.cloudflare.d1DatabaseId}"`,
  );
  content = content.replace(
    /"bucket_name":\s*"[^"]+"/,
    `"bucket_name": "${product.cloudflare.r2BucketName}"`,
  );
  content = content.replace(
    /"id":\s*"[^"]+"/,
    `"id": "${product.cloudflare.kvNamespaceId}"`,
  );
  content = content.replace(
    /npx wrangler d1 create [^`\n]+/,
    `npx wrangler d1 create ${product.cloudflare.d1DatabaseName}`,
  );
  content = content.replace(
    /npx wrangler r2 bucket create [^`\n]+/,
    `npx wrangler r2 bucket create ${product.cloudflare.r2BucketName}`,
  );

  await fs.writeFile(wranglerPath, content, 'utf8');
}

async function writeCrossPlatformScripts(outDir) {
  const scriptPath = path.join(outDir, 'scripts', 'apply-d1-migrations.ts');
  const content = `import { spawnSync } from 'node:child_process';
import { parseWranglerConfig } from './parse-wrangler';

const mode = process.argv.includes('--remote') ? '--remote' : '--local';

try {
  const config = parseWranglerConfig();
  const dbName = config.d1_databases?.[0]?.database_name;

  if (!dbName) {
    console.error('Database name not found in wrangler.jsonc');
    process.exit(1);
  }

  const command = process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler';
  const result = spawnSync(
    command,
    ['d1', 'migrations', 'apply', dbName, mode],
    { stdio: 'inherit' },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(errorMessage);
  process.exit(1);
}
`;

  await fs.writeFile(scriptPath, content, 'utf8');
}

async function customizeMessages(outDir, product) {
  const messageDir = path.join(outDir, 'project.inlang', 'messages');
  await updateMessageFile(path.join(messageDir, 'en.json'), product, 'en');
  await updateMessageFile(path.join(messageDir, 'zh.json'), product, 'zh');
}

async function updateMessageFile(filePath, product, locale) {
  const messages = await readJson(filePath);
  const localeMessages = product.messages?.[locale] || {};
  const fallback = product.messages?.en || {};

  const siteTitle =
    localeMessages.siteTitle ||
    fallback.siteTitle ||
    `${product.brand} - ${product.primaryKeyword}`;
  const siteDescription =
    localeMessages.siteDescription ||
    fallback.siteDescription ||
    product.description;
  const heroIntro =
    localeMessages.heroIntro || fallback.heroIntro || `Introducing ${product.brand}`;
  const heroTitle =
    localeMessages.heroTitle || fallback.heroTitle || product.primaryKeyword;
  const heroDescription =
    localeMessages.heroDescription || fallback.heroDescription || product.description;
  const ctaDescription =
    localeMessages.ctaDescription ||
    fallback.ctaDescription ||
    `Try ${product.brand} for free, then upgrade for batch workflows.`;

  messages.site_name = product.brand;
  messages.site_title = siteTitle;
  messages.site_description = siteDescription;
  messages.built_with_brand = product.brand;
  messages.home_hero_introduction = heroIntro;
  messages.home_hero_title = heroTitle;
  messages.home_hero_description = heroDescription;
  messages.home_call_to_action_description = ctaDescription;

  await writeJson(filePath, messages);
}

async function customizeWebsiteConfig(outDir, product) {
  const filePath = path.join(outDir, 'src', 'config', 'website.ts');
  let content = await fs.readFile(filePath, 'utf8');

  content = replaceTsString(content, 'github', product.social.github);
  content = replaceTsString(content, 'discord', product.social.discord);
  content = replaceTsString(content, 'twitter', product.social.twitter);
  content = replaceTsString(content, 'youtube', product.social.youtube);

  content = replaceObjectBoolean(content, 'auth', 'enable', product.providers.auth);
  content = replaceObjectBoolean(
    content,
    'auth',
    'enableGoogleLogin',
    product.providers.googleOAuth,
  );

  content = replaceObjectBoolean(content, 'mail', 'enable', Boolean(product.providers.mail));
  content = replaceObjectString(content, 'mail', 'provider', product.providers.mail);
  content = replaceObjectString(content, 'mail', 'fromEmail', product.contact.fromEmail);
  content = replaceObjectString(
    content,
    'mail',
    'supportEmail',
    product.contact.supportEmail,
  );

  content = replaceObjectBoolean(
    content,
    'newsletter',
    'enable',
    Boolean(product.providers.newsletter),
  );
  content = replaceObjectString(
    content,
    'newsletter',
    'provider',
    product.providers.newsletter,
  );

  content = replaceObjectBoolean(
    content,
    'notification',
    'enable',
    Boolean(product.providers.notification),
  );
  if (product.providers.notification) {
    content = replaceObjectString(
      content,
      'notification',
      'provider',
      product.providers.notification,
    );
  }

  content = replaceObjectBoolean(content, 'cache', 'enable', product.providers.cache);
  content = replaceObjectBoolean(content, 'storage', 'enable', product.providers.storage);

  await fs.writeFile(filePath, content, 'utf8');
}

function replaceTsString(content, key, value) {
  return content.replace(
    new RegExp(`(${key}:\\s*)'[^']*'`),
    `$1'${escapeTsString(value)}'`,
  );
}

function replaceObjectString(content, objectName, key, value) {
  return replaceObjectProperty(content, objectName, key, `'${escapeTsString(value)}'`);
}

function replaceObjectBoolean(content, objectName, key, value) {
  return replaceObjectProperty(content, objectName, key, value ? 'true' : 'false');
}

function replaceObjectProperty(content, objectName, key, valueLiteral) {
  const pattern = new RegExp(
    `(${objectName}:\\s*\\{[\\s\\S]*?${key}:\\s*)([^,\\n]+)`,
    'm',
  );

  if (!pattern.test(content)) {
    return content;
  }

  return content.replace(pattern, `$1${valueLiteral}`);
}

function escapeTsString(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function writeEnvExample(outDir, product) {
  const sourcePath = path.join(outDir, '.env.example');
  let content = await fs.readFile(sourcePath, 'utf8');

  content = replaceEnv(content, 'VITE_BASE_URL', product.baseUrl);
  content = replaceEnv(content, 'VITE_PAYMENT_PROVIDER', product.providers.payment);
  content = replaceEnv(content, 'CREEM_DEBUG', 'true');
  content = replaceEnv(content, 'CLOUDFLARE_DATABASE_ID', product.cloudflare.d1DatabaseId);

  await fs.writeFile(path.join(outDir, '.env.local.example'), content, 'utf8');
}

function replaceEnv(content, key, value) {
  const escaped = String(value ?? '').replace(/'/g, "\\'");
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}='${escaped}'`;

  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }

  return `${content.trimEnd()}\n${line}\n`;
}

async function writeFactoryDocs(outDir, product, sourceConfig, templateKind) {
  const docsDir = path.join(outDir, 'docs', 'factory');
  await fs.mkdir(docsDir, { recursive: true });
  await writeJson(path.join(docsDir, 'product.config.json'), sourceConfig);
  await fs.writeFile(path.join(docsDir, 'PRODUCT.md'), productMarkdown(product), 'utf8');
  await fs.writeFile(
    path.join(docsDir, 'LAUNCH-CHECKLIST.md'),
    templateKind === 'edge'
      ? edgeLaunchChecklist(product)
      : launchChecklist(product),
    'utf8',
  );
  await fs.writeFile(path.join(docsDir, 'keywords.csv'), keywordsCsv(product), 'utf8');
}

function productMarkdown(product) {
  return `# ${product.brand}

## Positioning

- Product: ${product.name}
- Domain: ${product.domain}
- Market: ${product.market || 'US'}
- Primary keyword: ${product.primaryKeyword}
- Description: ${product.description}

## MVP

- Free tool: ${product.mvp.freeTool || 'Define the free core workflow.'}
- Paid value: ${product.mvp.paidValue || 'Define the paid upgrade trigger.'}

## Features

${product.features.map((feature) => `- ${feature}`).join('\n') || '- Define product features.'}

## Providers

- Auth: ${product.providers.auth ? 'enabled' : 'disabled'}
- Google OAuth: ${product.providers.googleOAuth ? 'enabled' : 'disabled'}
- Payment: ${product.providers.payment || 'disabled'}
- Mail: ${product.providers.mail || 'disabled'}
- Newsletter: ${product.providers.newsletter || 'disabled'}
- Storage: ${product.providers.storage ? 'R2' : 'disabled'}
- Cache: ${product.providers.cache ? 'KV' : 'disabled'}

`;
}

function launchChecklist(product) {
  return `# Launch Checklist

## Keyword Validation

- [ ] Confirm SERP intent for "${product.primaryKeyword}".
- [ ] Record Volume, KD, CPC, SERP risk, and monetization path.
- [ ] Map first 3-10 keywords to pages in docs/factory/keywords.csv.

## Product Setup

- [ ] Replace placeholder D1 database id in wrangler.jsonc.
- [ ] Replace placeholder KV namespace id in wrangler.jsonc.
- [ ] Create R2 bucket: ${product.cloudflare.r2BucketName}.
- [ ] Copy .env.local.example to .env.local.
- [ ] Generate BETTER_AUTH_SECRET.
- [ ] Configure mail provider secrets.
- [ ] Configure payment provider only after pricing is ready.

## Local Validation

- [ ] pnpm install
- [ ] pnpm cf-typegen
- [ ] pnpm db:migrate:local
- [ ] pnpm check
- [ ] pnpm build
- [ ] pnpm dev

## Launch

- [ ] Create Cloudflare D1/R2/KV resources.
- [ ] Set Worker secrets with wrangler secret put.
- [ ] Apply remote D1 migrations.
- [ ] Deploy Worker.
- [ ] Submit sitemap to GSC.
- [ ] Track GSC impressions, clicks, signups, checkout clicks, and first payment.

`;
}

function edgeLaunchChecklist(product) {
  return `# Launch Checklist

Template: Edge SaaS Starter (TanStack Start + Cloudflare Workers). Add D1,
Better Auth, Stripe, R2, AI and other modules only when the product needs them;
see ${tanStarterTemplatePath} for full reference implementations.

## Keyword Validation

- [ ] Confirm SERP intent for "${product.primaryKeyword}".
- [ ] Record Volume, KD, CPC, SERP risk, and monetization path.
- [ ] Map first 3-10 keywords to pages in docs/factory/keywords.csv.

## Product Setup

- [ ] Check wrangler.jsonc name (${product.cloudflare.workerName}) and vars
      PUBLIC_APP_NAME / PUBLIC_SITE_URL (${product.baseUrl}).
- [ ] Update page title, sitemap.xml and robots.txt site URL.
- [ ] Add modules (D1, auth, payment, R2, AI) only when the MVP needs them,
      then run \`pnpm cf-typegen\`.
- [ ] Configure payment provider only after pricing is ready.

## Local Validation

- [ ] pnpm install
- [ ] pnpm validate
- [ ] pnpm dev

## Launch

- [ ] Create only the Cloudflare resources the product uses.
- [ ] Set Worker secrets with wrangler secret put.
- [ ] Deploy Worker.
- [ ] Submit sitemap to GSC.
- [ ] Track GSC impressions, clicks, signups, checkout clicks, and first payment.

`;
}

function keywordsCsv(product) {
  const header = [
    'keyword',
    'intent',
    'page',
    'type',
    'volume',
    'kd',
    'cpc',
    'serp_risk',
    'monetization',
    'recommendation',
  ];
  const rows = product.keywords.map((item) => [
    item.keyword || '',
    item.intent || '',
    item.page || '',
    item.type || '',
    item.volume || '',
    item.kd || '',
    item.cpc || '',
    item.serpRisk || '',
    item.monetization || '',
    item.recommendation || '',
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

async function writeFactoryStamp(
  outDir,
  product,
  configPath,
  templatePath,
  templateKind,
) {
  const stamp = {
    generatedAt: new Date().toISOString(),
    generatedBy: 'saas-factory/scripts/create-product.mjs',
    sourceTemplate: templatePath,
    templateKind,
    configPath,
    product: product.slug,
    id: crypto.randomUUID(),
  };

  await fs.writeFile(
    path.join(outDir, 'docs', 'factory', 'factory-stamp.json'),
    `${JSON.stringify(stamp, null, 2)}\n`,
    'utf8',
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configPath = path.resolve(args.config);
  const templatePath = path.resolve(args.template);
  const outRoot = path.resolve(args.out);
  const sourceConfig = await readJson(configPath);
  const product = normalizeProduct(sourceConfig);
  const outDir = path.join(outRoot, product.slug);

  if (!(await exists(templatePath))) {
    throw new Error(`Template path does not exist: ${templatePath}`);
  }

  const templateKind = await detectTemplateKind(templatePath);

  await copyTemplate(templatePath, outDir, args.force);

  if (templateKind === 'edge') {
    await customizeEdgeTemplate(outDir, product);
  } else {
    await customizeTanStarterTemplate(outDir, product);
  }

  await writeFactoryDocs(outDir, product, sourceConfig, templateKind);
  await writeFactoryStamp(
    outDir,
    product,
    configPath,
    templatePath,
    templateKind,
  );

  console.log(`Created product: ${product.brand} (${templateKind} template)`);
  console.log(`Output: ${outDir}`);
  console.log('');
  console.log('Next:');
  console.log(`  cd ${outDir}`);
  console.log('  pnpm install');

  if (templateKind === 'edge') {
    console.log('  pnpm validate');
  } else {
    console.log('  pnpm cf-typegen');
    console.log('  pnpm db:migrate:local');
    console.log('  pnpm check');
    console.log('  pnpm build');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
