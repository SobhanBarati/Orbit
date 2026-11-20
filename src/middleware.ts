import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("caterie_session")?.value;
  const { pathname } = req.nextUrl;

  // لیست مسیرهایی که نیاز به احراز هویت دارند
  const isProtectedRoute = 
    pathname.startsWith("/overview") || 
    pathname.startsWith("/people") || 
    pathname.startsWith("/payroll") || 
    pathname.startsWith("/settings") ||
    pathname === "/";

  // اگر کاربر لاگین نکرده باشد و بخواهد وارد صفحات محافظت‌شده شود
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // اگر کاربر لاگین کرده باشد و بخواهد صفحه لاگین را باز کند، به اورویو هدایت می‌شود
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// تنظیمات مَچِر برای اعمال میدلور روی صفحات دلخواه
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};