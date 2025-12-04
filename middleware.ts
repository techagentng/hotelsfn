import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const exemptedPaths = ['/', '/login', '/signup', '/pricing', '/dashboard', '/example-chat', '/auth/google/callback', '/bookings', '/bookings/new', '/rooms', '/preferences'];

export function middleware(req: NextRequest) {
  const isAuthenticated = req.cookies.get('auth_token');
  const { pathname } = req.nextUrl;

  // Allow public pages for unauthenticated users
  if (exemptedPaths.includes(pathname) && !isAuthenticated) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect unauthenticated users to login for protected pages
  if (!isAuthenticated && !exemptedPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next|static|.*\\..*).*)',
};