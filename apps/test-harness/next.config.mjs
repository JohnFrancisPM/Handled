/** @type {import('next').NextConfig} */

// CSP scoped to the harness's real surfaces: the browser calls only our own /api/*
// (never n8n directly), renders no remote images, and talks to no third-party origin.
// So connect-src is 'self' only — stricter than the dashboard's. See deployment.md §4.
//
// 'unsafe-eval' is added for script-src in DEVELOPMENT ONLY — Next's Fast Refresh runtime
// evaluates strings at dev time. Production keeps the strict `script-src 'self' 'unsafe-inline'`.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  scriptSrc,
  "connect-src 'self'",
  "form-action 'self'",
  "manifest-src 'self'"
];

// `upgrade-insecure-requests` rewrites every http subresource to https. In production the
// harness would be served over HTTPS, so it's a harmless safety net there. But this app is
// local-only (Stage 6 deploy skipped) and runs on http://localhost — and Safari/WebKit,
// unlike Chrome (which exempts loopback), upgrades the page's own JS/CSS/font/fetch requests
// to https://localhost, which has no TLS, leaving the page unstyled/broken. So emit it ONLY
// in production. Same reasoning for HSTS below (it's only meaningful over HTTPS).
if (!isDev) cspDirectives.push("upgrade-insecure-requests");

const csp = cspDirectives.join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // HSTS pins the origin to HTTPS; pointless (and ignored) over http://localhost, so dev-skip it.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }])
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
