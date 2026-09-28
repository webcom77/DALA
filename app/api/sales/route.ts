import { NextResponse } from "next/server";
import { posStore } from "@/lib/store/pos-store";

export async function GET() {
  const sales = posStore.getSales();
  return NextResponse.json({ sales });
}
