import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware (auth-and-middleware.md): protects (dashboard) + /api routes.
 * - Demo mode (Supabase auth env absent): never redirect, so the recorded demo
 *   cannot hard-fail — the app serves seeded read-only data.
 * - Live mode: refresh the Supabase session cookie on each request; redirect to
 *   /login when there is no session (except API routes, which return 401 via the
 *   handlers themselves).
 */
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode: pass through (read-only seeded data; no auth).
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options);
        }
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Unauthenticated page requests go to /login; API routes answer with 401.
  if (!user && !url.startsWith("/api")) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Matcher: dashboard + api (except auth). Excludes static assets, _next, login.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"]
};
