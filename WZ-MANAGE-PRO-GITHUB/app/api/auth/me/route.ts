import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "wz_session";

function verifySession(token: string) {
  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret) return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (!data.username || !data.exp || Date.now() > data.exp) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const session = verifySession(token);

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username,
    },
  });
}
