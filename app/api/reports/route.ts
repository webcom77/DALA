import { NextResponse } from "next/server";
import { reportsService } from "@/services/reports";

export async function GET() {
  const sales = reportsService.getSalesReport();
  const inventory = reportsService.getInventoryReport();
  const incomeStatement = reportsService.getIncomeStatement();

  return NextResponse.json({
    sales,
    inventory,
    incomeStatement,
  });
}
