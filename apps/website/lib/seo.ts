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
    icons: { icon: "/favicon.ico", apple: "/icon.png" }
  };
}

export function pageMetadata(opts: {
  title: string; description: string; path: string; noindex?: boolean; ogImage?: string;
}): Metadata {
  const url = `${site.url}${opts.path}`;
  return {
    // Spec per-page titles already include the brand, so emit them verbatim
    // (absolute) and skip the `%s | Handled` template to avoid doubling it.
    title: { absolute: opts.title },
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
