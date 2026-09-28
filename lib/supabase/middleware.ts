import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as any)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  // Verifica se há sessão administrativa local ativa
  if (!user) {
    const sessionCookie = request.cookies.get("dala_session")?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed && parsed.email) {
          user = {
            id: parsed.id || "admin-dala-001",
            email: parsed.email,
            user_metadata: {
              full_name: parsed.full_name,
              role: parsed.role,
            },
          } as any;
        }
      } catch {
        user = null;
      }
    }
  }

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/forgot-password");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/pos") ||
    pathname.startsWith("/cash") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/suppliers") ||
    pathname.startsWith("/purchases") ||
    pathname.startsWith("/finance") ||
    pathname.startsWith("/reports");

  // Rota raiz "/" -> redireciona conforme autenticação
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  // Usuário não autenticado tentando acessar rota interna
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Usuário autenticado tentando acessar login ou recuperação de senha
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
