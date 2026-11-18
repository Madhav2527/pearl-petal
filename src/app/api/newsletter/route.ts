import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const result = addSubscriber(email);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
