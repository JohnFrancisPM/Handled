# Spec: SEO & Metadata

**App:** `apps/website`
**Implements:** R28
**Depends on:** `project-setup.md`, `content-modules.md`
**Files:** `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, per-page `metadata` exports.

Per-page metadata (title/description/OG/Twitter/canonical), a sitemap, and robots. No third-party analytics (R39).

---

## 1. `lib/seo.ts`

```ts
import type { Metadata } from "next";
import { site } from "@/content/site";

export function baseMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.positioning,
    applicationName: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      url: site.url,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: site.name }]
    },
    twitter: { card: "summary_large_image", title: site.name, description: site.positioning, images: ["/og-default.png"] },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" }
  };
}

export function pageMetadata(opts: {
  title: string; description: string; path: string; noindex?: boolean; ogImage?: string;
}): Metadata {
  const url = `${site.url}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title, description: opts.description, url, type: "website",
      images: [{ url: opts.ogImage ?? "/og-default.png", width: 1200, height: 630, alt: opts.title }]
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [opts.ogImage ?? "/og-default.png"] },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true }
  };
}
```

- `baseMetadata()` is exported from `app/layout.tsx` (title template + defaults).
- Each page exports `export const metadata = pageMetadata({...})` with the exact title/description/path given in that page's spec.

> **Title note:** the Home page title should be the full default (no template suffix), so Home exports `pageMetadata({ title: "Handled — The AI office manager for home & service businesses", ... })` and may set it as an absolute title if the template would double-append the brand; use `title: { absolute: "..." }` on Home if needed.

---

## 2. Per-page metadata summary

| Route | Title | Canonical path | Index |
|---|---|---|---|
| `/` | Handled — The AI office manager for home & service businesses | `/` | yes |
| `/why-handled` | Why Handled — the office manager, not just a receptionist | `/why-handled` | yes |
| `/features` | Features — Handled AI office manager | `/features` | yes |
| `/pricing` | Pricing — Handled AI office manager | `/pricing` | yes |
| `/integrations` | Integrations — Jobber, Housecall Pro & ServiceTitan \| Handled | `/integrations` | yes |
| `/how-it-works` | How it works — Handled AI office manager | `/how-it-works` | yes |
| `/contact` | Book a demo — Handled | `/contact` | yes |
| `/privacy` | Privacy Policy — Handled | `/privacy` | yes |
| `/terms` | Terms of Service — Handled | `/terms` | yes |

(Full descriptions are given in each page spec.)

---

## 3. `app/sitemap.ts`

```ts
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
```

The `/api/leads` endpoint is excluded (not a page).

---

## 4. `app/robots.ts`

```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}
```

---

## 5. Assets
- `public/og-default.png` — 1200×630 OG image (Handled wordmark + positioning line on brand background). If not available at build, a placeholder PNG is acceptable for MVP; the metadata references must still resolve.
- `public/favicon.ico`.

---

## 6. Acceptance criteria
- Every page exports `metadata` with a unique title, description, and canonical URL (R28).
- OG + Twitter card tags render on every page (verify in built HTML `<head>`).
- `/sitemap.xml` lists all 9 pages; `/robots.txt` allows all and disallows `/api/`, referencing the sitemap.
- `metadataBase` set so relative OG image URLs resolve absolutely.
- No analytics or third-party script tags injected (R39).
