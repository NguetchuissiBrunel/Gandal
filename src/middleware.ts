import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/authCookie';
import { getDashboardPath, canAccessDashboardRoute } from '@/lib/authUtils';

// Le middleware s'exécute côté serveur, sur le même hôte que l'API → localhost par défaut.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') ||
  process.env.API_BASE_INTERNAL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8080';

type SessionUser = { type: string; role?: string | null };

async function fetchSessionUser(token: string): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function readToken(request: NextRequest): string | null {
  const raw = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = readToken(request);

  if ((pathname === '/login' || pathname === '/signup') && token) {
    const user = await fetchSessionUser(token);
    if (user) {
      return NextResponse.redirect(new URL(getDashboardPath(user as Parameters<typeof getDashboardPath>[0]), request.url));
    }
  }

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = await fetchSessionUser(token);
  if (!user) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }

  if (!canAccessDashboardRoute(pathname, user as Parameters<typeof canAccessDashboardRoute>[1])) {
    return NextResponse.redirect(
      new URL(getDashboardPath(user as Parameters<typeof getDashboardPath>[0]), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
