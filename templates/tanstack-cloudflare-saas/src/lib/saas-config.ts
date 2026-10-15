import {
	BadgeCheck,
	Bot,
	CreditCard,
	Database,
	Globe2,
	HardDrive,
	KeyRound,
	Mail,
	ShieldCheck,
	Sparkles,
	Zap,
} from "lucide-react";

export const appName = "Edge SaaS Starter";

export const stackLayers = [
	{
		name: "TanStack Start",
		description: "Full-stack React, typed routes, server functions, SSR.",
		icon: Zap,
	},
	{
		name: "Cloudflare Workers",
		description: "Edge deployment with bindings for app services.",
		icon: Globe2,
	},
	{
		name: "D1 + Drizzle",
		description: "Small SaaS database path with typed migrations.",
		icon: Database,
	},
	{
		name: "R2 Storage",
		description: "Uploads, exports, generated files, and customer assets.",
		icon: HardDrive,
	},
	{
		name: "Better Auth",
		description: "Email and social login once the product needs accounts.",
		icon: KeyRound,
	},
	{
		name: "Stripe / Creem",
		description: "Subscriptions, one-time payments, and billing portal.",
		icon: CreditCard,
	},
	{
		name: "Resend / CF Email",
		description: "Transactional email, waitlist, and lifecycle messages.",
		icon: Mail,
	},
	{
		name: "Workers AI / OpenAI / fal.ai",
		description: "Pick the model provider by latency, cost, and media type.",
		icon: Bot,
	},
	{
		name: "Turnstile",
		description: "Bot protection for signup, checkout, and lead capture.",
		icon: ShieldCheck,
	},
];

export const buildSteps = [
	"Choose one narrow search-intent tool.",
	"Ship a crawlable free page first.",
	"Gate batch, export, history, API, or commercial use.",
	"Review GSC queries weekly and add pages from evidence.",
];

export const readinessItems = [
	{ label: "Cloudflare deploy path", done: true },
	{ label: "Typed routes and server route examples", done: true },
	{ label: "SEO sitemap and robots endpoints", done: true },
	{ label: "D1/R2/KV binding placeholders", done: true },
	{ label: "Auth provider selected", done: false },
	{ label: "Payment provider selected", done: false },
];

export const productHooks = [
	{
		title: "Free Tool",
		body: "The homepage should solve one job without login, so SEO traffic can try it immediately.",
		icon: Sparkles,
	},
	{
		title: "Paid Edge",
		body: "Charge for privacy, batch volume, exports, history, integrations, API access, or commercial use.",
		icon: BadgeCheck,
	},
];
