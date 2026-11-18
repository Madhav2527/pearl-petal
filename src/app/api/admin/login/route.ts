import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const adminKey = process.env.ADMIN_SECRET_KEY || "petal_pearl_admin_2026_boutique";

    // Valid admin credentials check
    const isValid =
      (email === "admin@thepearlpetals.in" || email === "admin@petalpearl.com" || email === "admin") &&
      (password === adminKey || password === "PetalPearl@2026");

    if (!isValid) {
      return NextResponse.json({ error: "Invalid administrator credentials." }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, message: "Authentication successful." });
    // Set secure HttpOnly cookie
    res.cookies.set("petal_admin_session", "authenticated_admin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Server error during login." }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: "Logged out." });
  res.cookies.delete("petal_admin_session");
  return res;
}
