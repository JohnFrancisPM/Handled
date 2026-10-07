import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const routes = ["", "/why-handled", "/features", "/pricing", "/integrations", "/how-it-works", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" || path === "/why-handled" ? 0.8 : 0.6
  }));
}
