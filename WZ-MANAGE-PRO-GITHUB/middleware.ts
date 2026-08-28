import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "wz_session";

function base64UrlToUint8Array(base64url: string) {
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padding =
    "=".repeat((4 - (base64.length % 4)) % 4);

  const binary = atob(base64 + padding);

  return Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );
}

async function createSignature(
  payload: string,
  secret: string
) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const bytes = new Uint8Array(signature);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function verifySession(token: string) {
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

    const expectedSignature = await createSignature(
      payload,
      secret
    );

    if (signature !== expectedSignature) {
      return false;
    }

    const bytes = base64UrlToUint8Array(payload);

    const decoder = new TextDecoder();

    const data = JSON.parse(
      decoder.decode(bytes)
    );

    if (
      !data.username ||
      !data.exp ||
      Date.now() > data.exp
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(
  request: NextRequest
) {
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

  if (
    !session ||
    !(await verifySession(session))
  ) {
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
