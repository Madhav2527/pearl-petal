import { NextResponse } from "next/server";
import { getStoreSettings, updateDefaultMarkupAdmin, getFinancialOverviewAdmin } from "@/lib/store";

export async function GET() {
  try {
    const settings = getStoreSettings();
    const overview = getFinancialOverviewAdmin();
    return NextResponse.json({ settings, overview });
  } catch {
    return NextResponse.json({ error: "Failed to load store settings." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { defaultMarkup } = await req.json();
    if (defaultMarkup === undefined || isNaN(Number(defaultMarkup))) {
      return NextResponse.json({ error: "Valid markup number required." }, { status: 400 });
    }

    const result = updateDefaultMarkupAdmin(Number(defaultMarkup));
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Failed to update markup settings." }, { status: 500 });
  }
}
