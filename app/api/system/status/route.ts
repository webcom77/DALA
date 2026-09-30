import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = performance.now();
  try {
    const supabase = await createClient();

    // Testa a consulta na tabela de categorias
    const { data, count, error } = await supabase
      .from("categories")
      .select("id, name", { count: "exact" })
      .limit(5);

    const latency = Math.round(performance.now() - start);

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          error: error.message,
          code: error.code,
          latency,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      connected: true,
      latency,
      categoriesCount: count ?? data?.length ?? 0,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vimjhbjscvkwusxilzmo.supabase.co",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : "Erro desconhecido ao testar Supabase.";
    return NextResponse.json(
      {
        connected: false,
        error: message,
        latency,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
