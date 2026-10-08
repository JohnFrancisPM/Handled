/** @type {import('next').NextConfig} */

// Content-Security-Policy for the customer-app dashboard (Stage 7, scoped).
// Unlike the marketing site, the dashboard's BROWSER talks to Supabase directly
// (RLS-enforced anon client): REST + Auth over https, and Realtime over a
// websocket. So connect-src must allow https + wss to *.supabase.co, and img-src
// must allow the two image hosts the app renders (Supabase storage + Unsplash
// seed photos — mirrors `images.remotePatterns` below). Everything else is locked
// to 'self' with no third-party origins and no framing.
// 'unsafe-inline' on script-src/style-src is the same accepted Next.js trade-off
// as the website (App Router inline hydration/RSC bootstrap + next/font inline
// <style>); see docs/customer-app/security/security-plan.md §3.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "img-src 'self' data: https://*.supabase.co https://images.unsplash.com",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "form-action 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // frame-ancestors (CSP) is the modern clickjacking control; X-Frame-Options is
  // kept for older browsers that ignore CSP framing directives.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny powerful features the dashboard never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Demo lead photos (seed fixtures) + Supabase storage for real uploads.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
