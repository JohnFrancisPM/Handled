/** @type {import('next').NextConfig} */

// Content-Security-Policy for the marketing site.
// - No third-party scripts, iframes, analytics, or remote fonts: `next/font`
//   self-hosts Inter at build time (served from /_next), so 'self' covers fonts.
// - 'unsafe-inline' is required for script-src/style-src because Next's App
//   Router injects inline hydration/RSC bootstrap scripts and next/font injects
//   an inline <style>. Nonce-based CSP is not usable here: pages are statically
//   generated and CDN-cached, so a per-response nonce cannot be applied. This is
//   the documented, accepted trade-off for static Next on a CDN (see security-plan.md).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Clickjacking: frame-ancestors above is the modern control; X-Frame-Options
  // is kept for older browsers that ignore CSP framing directives.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny powerful features the site never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Only local/public images in MVP (logos, OG). No remote patterns needed.
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
