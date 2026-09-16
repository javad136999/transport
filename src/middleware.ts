import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_HOME: Record<string, string> = {
  super_admin: "/dashboard",
  petro_manager: "/petro/dashboard",
  petro_env_officer: "/petro/dashboard",
  driver: "/driver",
  transport_company: "/transport/dashboard",
  destination_operator: "/destination/dashboard",
  env_observer: "/observer/dashboard",
  gov_environment_observer: "/observer/dashboard",
  pars_zone_observer: "/observer/dashboard",
  patrol_manager: "/patrol/inquiry",
  patrol_officer: "/patrol/inquiry",
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = path === "/" || path === "/login" || path.startsWith("/register") || path.startsWith("/_next");

  const response = NextResponse.next({ request: { headers: request.headers } });

  // Public pages do not need an Auth round-trip. This removes the unnecessary
  // Supabase request that was making the login/landing experience feel slow.
  if (isPublic && !request.cookies.getAll().some((cookie) => cookie.name.includes("auth-token"))) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => response.cookies.set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) => response.cookies.set({ name, value: "", ...options }),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // After login, route directly to the correct role dashboard instead of
  // sending the user to the public homepage first.
  if (user && (path === "/" || path === "/login")) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    const home = (profile?.role && ROLE_HOME[profile.role]) || "/";
    if (home !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)"],
};
