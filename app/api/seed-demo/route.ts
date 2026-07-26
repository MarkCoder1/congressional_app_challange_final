import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/demoData";

export async function GET() {
  try {
    seedDemoData();
    return NextResponse.json({ success: true, message: "Demo data seeded successfully" });
  } catch (error) {
    console.error("Failed to seed demo data:", error);
    return NextResponse.json({ success: false, error: "Failed to seed demo data" }, { status: 500 });
  }
}