import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	CheckCircle2,
	Cloud,
	ExternalLink,
	FileText,
	Rocket,
} from "lucide-react";

import {
	appName,
	buildSteps,
	productHooks,
	readinessItems,
	stackLayers,
} from "#/lib/saas-config";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
			<main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-5 py-6 sm:px-8 lg:px-10">
				<header className="flex items-center justify-between gap-4 border-[var(--color-line)] border-b pb-5">
					<a className="flex items-center gap-3" href="/">
						<span className="grid size-10 place-items-center rounded-md bg-[var(--color-ink)] text-white">
							<Cloud className="size-5" aria-hidden="true" />
						</span>
						<span>
							<span className="block font-semibold text-base">{appName}</span>
							<span className="block text-[var(--color-muted)] text-xs">
								TanStack + Cloudflare template
							</span>
						</span>
					</a>
					<nav className="hidden items-center gap-5 text-[var(--color-muted)] text-sm md:flex">
						<a
							className="transition hover:text-[var(--color-ink)]"
							href="#stack"
						>
							Stack
						</a>
						<a
							className="transition hover:text-[var(--color-ink)]"
							href="#launch"
						>
							Launch
						</a>
						<a
							className="inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] px-4 py-2 font-medium text-white transition hover:bg-[var(--color-accent)]"
							href="/api/health"
						>
							<ExternalLink className="size-4" aria-hidden="true" />
							Health
						</a>
					</nav>
				</header>

				<section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
					<div className="max-w-3xl">
						<h1 className="max-w-4xl font-semibold text-5xl tracking-normal sm:text-6xl lg:text-7xl">
							Ship a small SaaS on the edge, then let SEO tell you what to build
							next.
						</h1>
						<p className="mt-6 max-w-2xl text-[var(--color-muted)] text-lg leading-8">
							This starter follows the article stack: TanStack Start for the
							full-stack app, Cloudflare Workers for hosting, and optional SaaS
							modules for auth, payments, email, storage, and AI.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<a
								className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(15,96,112,0.22)] transition hover:bg-[var(--color-ink)]"
								href="#launch"
							>
								<Rocket className="size-4" aria-hidden="true" />
								Start checklist
							</a>
							<a
								className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-line)] px-5 py-3 font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
								href="/sitemap.xml"
							>
								<FileText className="size-4" aria-hidden="true" />
								Sitemap
							</a>
						</div>
					</div>

					<div className="rounded-lg border border-[var(--color-line)] bg-white p-5 shadow-[0_24px_70px_rgba(25,37,46,0.08)]">
						<div className="flex items-center justify-between border-[var(--color-line)] border-b pb-4">
							<div>
								<p className="font-semibold">Template readiness</p>
								<p className="text-[var(--color-muted)] text-sm">
									Local scaffold status
								</p>
							</div>
							<span className="rounded-md bg-[var(--color-soft)] px-3 py-1 font-medium text-[var(--color-accent)] text-xs">
								Edge-first
							</span>
						</div>
						<div className="mt-5 grid gap-3">
							{readinessItems.map((item) => (
								<div
									className="flex items-center justify-between gap-3 rounded-md bg-[var(--color-bg)] px-4 py-3"
									key={item.label}
								>
									<span className="text-sm">{item.label}</span>
									<span
										className={
											item.done
												? "text-[var(--color-success)]"
												: "text-[var(--color-muted)]"
										}
									>
										<CheckCircle2 className="size-5" aria-hidden="true" />
									</span>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-2">
					{productHooks.map((hook) => {
						const Icon = hook.icon;

						return (
							<article
								className="rounded-lg border border-[var(--color-line)] bg-white p-6"
								key={hook.title}
							>
								<Icon
									className="size-6 text-[var(--color-accent)]"
									aria-hidden="true"
								/>
								<h2 className="mt-5 font-semibold text-2xl">{hook.title}</h2>
								<p className="mt-3 text-[var(--color-muted)] leading-7">
									{hook.body}
								</p>
							</article>
						);
					})}
				</section>

				<section id="stack" className="grid gap-6">
					<div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
						<div>
							<h2 className="font-semibold text-3xl">Recommended SaaS stack</h2>
							<p className="mt-2 max-w-2xl text-[var(--color-muted)]">
								Keep the base cheap and edge-native. Add provider packages only
								after the product needs the module.
							</p>
						</div>
						<a
							className="inline-flex items-center gap-2 font-semibold text-[var(--color-accent)]"
							href="https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/"
						>
							<ExternalLink className="size-4" aria-hidden="true" />
							Cloudflare guide
						</a>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{stackLayers.map((layer) => {
							const Icon = layer.icon;

							return (
								<article
									className="rounded-lg border border-[var(--color-line)] bg-white p-5"
									key={layer.name}
								>
									<Icon
										className="size-5 text-[var(--color-accent)]"
										aria-hidden="true"
									/>
									<h3 className="mt-4 font-semibold text-lg">{layer.name}</h3>
									<p className="mt-2 text-[var(--color-muted)] text-sm leading-6">
										{layer.description}
									</p>
								</article>
							);
						})}
					</div>
				</section>

				<section
					id="launch"
					className="grid gap-8 rounded-lg bg-[var(--color-ink)] p-6 text-white md:grid-cols-[0.8fr_1.2fr] md:p-8"
				>
					<div>
						<h2 className="font-semibold text-3xl">Launch path</h2>
						<p className="mt-3 text-white/72 leading-7">
							The template is intentionally narrow: first ship a crawlable tool,
							then add auth, payments, email, storage, and AI when the funnel
							proves it deserves them.
						</p>
					</div>
					<ol className="grid gap-3">
						{buildSteps.map((step, index) => (
							<li
								className="flex items-center gap-4 rounded-md bg-white/8 px-4 py-3"
								key={step}
							>
								<span className="grid size-8 shrink-0 place-items-center rounded-md bg-white text-[var(--color-ink)] font-semibold text-sm">
									{index + 1}
								</span>
								<span>{step}</span>
								<ArrowRight
									className="ml-auto size-4 text-white/55"
									aria-hidden="true"
								/>
							</li>
						))}
					</ol>
				</section>
			</main>
		</div>
	);
}
