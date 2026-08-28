import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "wz_session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body.username || "");
    const password = String(body.password || "");

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.AUTH_SECRET;

    if (!adminUsername || !adminPassword || !secret) {
      return NextResponse.json(
        {
          success: false,
          message: "Konfigurasi login belum lengkap.",
        },
        { status: 500 }
      );
    }

    if (
      username !== adminUsername ||
      password !== adminPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah.",
        },
        { status: 401 }
      );
    }

    const payload = Buffer.from(
      JSON.stringify({
        username,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    ).toString("base64url");

    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const token = `${payload}.${signature}`;

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
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
        message: "Request login tidak valid.",
      },
      { status: 400 }
    );
  }
}

