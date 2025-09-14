/*
// middleware.ts (raíz del proyecto, no dentro de /app)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas/archivos públicos que no requieren sesión
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") // (solo si usas /api del FE)
  ) {
    return NextResponse.next();
  }

  // Vista de login: si ya hay sesión, redirige al home
  if (pathname === "/login") {
    if (req.cookies.get("hasAuth")?.value === "1") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Bloquear todo si no hay la cookie bandera de sesión (no sensible)
  const hasAuth = req.cookies.get("hasAuth")?.value;
  if (!hasAuth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Aplica el middleware a todas las rutas excepto assets estáticos
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
*/

/*
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/", "/login", "/_next", "/favicon.ico", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();

  const hasAuth = req.cookies.get("hasAuth")?.value;
  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
*/

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// rutas públicas por igualdad EXACTA
const PUBLIC_EXACT = ["/", "/login"];
// prefijos públicos (estáticos / API del FE)
const PUBLIC_PREFIXES = ["/_next", "/favicon.ico", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  const hasAuth = req.cookies.get("hasAuth")?.value;
  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


/*
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_EXACT = ["/", "/login"];
const PUBLIC_PREFIXES = ["/_next", "/favicon.ico", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  const hasAuth = req.cookies.get("hasAuth")?.value;
  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
*/