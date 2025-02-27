import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // Hash the provided password
    const hash = crypto.createHash("sha256").update(password).digest("hex");

    // Compare with stored hash
    const isValid = hash === process.env.ADMIN_PASS_HASH;

    if (isValid) {
      const response = NextResponse.json({ success: true }, { status: 200 });

      // Set HTTP-only cookie
      response.cookies.set("poker_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Server error" + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete("poker_auth");
  return response;
}
