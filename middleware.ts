import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.BETTER_AUTH_SECRET })
  const path = req.nextUrl.pathname

   console.log("🔒 middleware hit:", {
    path,
    role: token?.role ?? "no token",
    isLoggedIn: !!token,
  })


  const isAdminAuth = path === "/admin/auth"
  const isAdminPage = path.startsWith("/admin") && !isAdminAuth
  const isUserAuth = path === "/login" || path === "/register"
  const isUserPage = !path.startsWith("/admin") && !isUserAuth

  // ── ADMIN AUTH PAGE ──────────────────────────────
  // already logged in as staff → redirect to dashboard
  if (isAdminAuth && token?.role === "staff") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url))
  }

  // ── ADMIN PAGES ──────────────────────────────────
  // not logged in or not staff → redirect to admin login
  if (isAdminPage) {
    if (!token || token.role !== "staff") {
      return NextResponse.redirect(new URL("/admin/auth", req.url))
    }
  }

  // ── USER AUTH PAGES ──────────────────────────────
  // already logged in as pengguna → redirect to home
  if (isUserAuth && token?.role === "pengguna") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // ── USER PAGES ───────────────────────────────────
  // not logged in → redirect to login
  // if (isUserPage && !token) {
  //   return NextResponse.redirect(new URL("/login", req.url))
  // }
  // ── USER PAGES PROTECTED ─────────────────────────
  // Guard ketat: pastikan hanya session dengan role "pengguna" yang bisa masuk
  if (isUserPage) {
    if (!token) {
      // Jika belum login sama sekali
      return NextResponse.redirect(new URL("/login", req.url))
    }
    
    if (token.role !== "pengguna" && token.role === "staff") {
      // Jika yang mencoba masuk adalah staff akun, alihkan ke dashboard admin mereka
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",  // all admin pages
    "/login",
    "/register",
    "/dashboard/:path*",  // add any other protected user pages here
    "/transaksi-koin",
    "/peminjaman",
    "/top-up",
    "/profile",
  ]
}