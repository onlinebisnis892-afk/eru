import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "wz_session";

function createSession(username: string) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
  ).toString("base64url");

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET belum diatur di Vercel");
  }

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function verifyPassword(input: string, actual: string) {
  const inputBuffer = Buffer.from(input);
  const actualBuffer = Buffer.from(actual);

  if (inputBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, actualBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "");
    const password = String(body.password ?? "");

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun admin belum dikonfigurasi.",
        },
        { status: 500 }
      );
    }

    const usernameCorrect = username === adminUsername;
    const passwordCorrect = verifyPassword(
      password,
      adminPassword
    );

    if (!usernameCorrect || !passwordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah.",
        },
        { status: 401 }
      );
    }

    const session = createSession(username);

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
            }
