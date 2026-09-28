import { NextResponse, type NextRequest } from "next/server";
import { inventoryStore } from "@/lib/store/inventory-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  const stockLevels = inventoryStore.getStockLevels({ search, status });
  return NextResponse.json({ stockLevels });
}
