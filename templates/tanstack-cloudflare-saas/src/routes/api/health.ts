import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: () =>
				Response.json({
					ok: true,
					app: "tanstack-cloudflare-saas",
					stack: ["TanStack Start", "Cloudflare Workers", "React 19"],
					checkedAt: new Date().toISOString(),
				}),
		},
	},
});
