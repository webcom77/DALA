import { NextResponse } from "next/server";
import { financeStore } from "@/lib/store/finance-store";

export async function GET() {
  const summary = financeStore.getSummary();
  return NextResponse.json({ summary });
}
