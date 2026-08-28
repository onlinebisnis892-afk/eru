import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "wz_session";

function verifySession(token: string) {
  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const [payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return false;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (!data.exp || Date.now() > data.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/login",
    "/api/auth/login",
    "/api/auth/logout",
  ];

  if (
    publicPaths.some(
      (path) =>
        pathname === path ||
        pathname.startsWith(`${path}/`)
    )
  ) {
    return NextResponse.next();
  }

  const protectedPaths = [
    "/dashboard",
    "/customers",
    "/booking",
    "/queue",
    "/pos",
    "/inventory",
    "/finance",
    "/commission",
    "/reports",
  ];

  const isProtected = protectedPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get(
    COOKIE_NAME
  )?.value;

  if (!session || !verifySession(session)) {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/booking/:path*",
    "/queue/:path*",
    "/pos/:path*",
    "/inventory/:path*",
    "/finance/:path*",
    "/commission/:path*",
    "/reports/:path*",
  ],
};
