import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(
					[
						"User-agent: *",
						"Allow: /",
						"Sitemap: http://localhost:3000/sitemap.xml",
					].join("\n"),
					{
						headers: {
							"Content-Type": "text/plain; charset=utf-8",
						},
					},
				),
		},
	},
});
