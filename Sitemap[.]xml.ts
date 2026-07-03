import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://agxxlabs.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function locFor(entry: SitemapEntry): string {
  return entry.path.startsWith("http://") || entry.path.startsWith("https://")
    ? entry.path
    : `${BASE_URL}${entry.path}`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/diagnostic", changefreq: "monthly", priority: "0.8" },
          { path: "/lab", changefreq: "weekly", priority: "0.9" },
          { path: "/lab/roi-calculation-guide", changefreq: "monthly", priority: "0.7" },
          { path: "/lab/b2b-saas-cro-guide", changefreq: "monthly", priority: "0.7" },
          { path: "https://agxxclientportal.vip/", changefreq: "monthly", priority: "0.6" },
          { path: "https://aagxx-proprietary-calculator.lovable.app", changefreq: "monthly", priority: "0.6" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${locFor(e)}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
