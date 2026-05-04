import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18n = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Step 1: Run next-intl locale routing
  const intlResponse = handleI18n(request);
  const response = intlResponse ?? NextResponse.next({ request });

  // Step 2: Refresh Supabase session tokens (critical for SSR auth)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Step 3: Protect dashboard routes — redirect to login if not authenticated
  const { pathname } = request.nextUrl;
  const isDashboard = /^\/en\/dashboard/.test(pathname);
  if (isDashboard && !user) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Step 4: Redirect authenticated users away from auth pages
  const isAuthPage = /^\/en\/auth\//.test(pathname);
  if (isAuthPage && user) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
