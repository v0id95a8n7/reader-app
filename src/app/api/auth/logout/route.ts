import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    // Remove authentication cookie by setting empty value and expiration in the past
    response.cookies.set({
      name: "auth_token",
      value: "",
      expires: new Date(0), // Date in the past - 1970-01-01
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
