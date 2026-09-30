import { NextResponse, type NextRequest } from "next/server";
import { posStore } from "@/lib/store/pos-store";
import { openCashSessionSchema, closeCashSessionSchema } from "@/schemas/pos";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isHistory = searchParams.get("history") === "true";

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      if (isHistory) {
        const { data: sessions, error } = await supabase
          .from("cash_sessions")
          .select("*")
          .order("opened_at", { ascending: false });

        if (!error && sessions) {
          return NextResponse.json({ sessions });
        }
      } else {
        const { data: session, error } = await supabase
          .from("cash_sessions")
          .select("*")
          .eq("status", "open")
          .order("opened_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error) {
          if (session) {
            posStore.syncSession(session);
          }
          return NextResponse.json({ session: session || null });
        }
      }
    } catch (e) {
      console.error("Erro ao buscar sessão no Supabase:", e);
    }
  }

  if (isHistory) {
    return NextResponse.json({ sessions: posStore.getSessionHistory() });
  }

  const session = posStore.getActiveCashSession();
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = openCashSessionSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const openedBy = json.opened_by || "Operador de Caixa";
    const initialBalance = Number(result.data.initial_balance || 0);
    const notes = result.data.notes || null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();

        // Verifica se já existe um caixa aberto
        const { data: existingOpen } = await supabase
          .from("cash_sessions")
          .select("id")
          .eq("status", "open")
          .limit(1)
          .maybeSingle();

        if (existingOpen) {
          return NextResponse.json(
            { error: "Já existe um turno de caixa aberto no sistema. Feche-o antes de abrir um novo." },
            { status: 400 }
          );
        }

        const { data: newSession, error: insertErr } = await supabase
          .from("cash_sessions")
          .insert({
            opened_by: openedBy,
            initial_balance: initialBalance,
            total_sales: 0,
            total_cash: 0,
            total_pix: 0,
            total_card: 0,
            status: "open",
            notes,
            opened_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertErr || !newSession) {
          console.error("Erro ao abrir caixa no Supabase:", insertErr);
          return NextResponse.json(
            { error: `Erro no banco ao abrir caixa: ${insertErr?.message || "Falha na inserção"}` },
            { status: 500 }
          );
        }

        posStore.syncSession(newSession);
        return NextResponse.json({ session: newSession }, { status: 201 });
      } catch (err: any) {
        console.error("Exceção ao abrir caixa:", err);
        return NextResponse.json(
          { error: `Erro ao conectar com banco: ${err?.message}` },
          { status: 500 }
        );
      }
    }

    const session = posStore.openCashSession(openedBy, initialBalance, notes || undefined);
    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao abrir caixa." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const result = closeCashSessionSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const closedBy = json.closed_by || "Operador de Caixa";
    const finalBalance = Number(result.data.final_balance || 0);
    const closeNotes = result.data.notes || null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();

        // Localiza a sessão aberta
        const { data: activeSession, error: findErr } = await supabase
          .from("cash_sessions")
          .select("*")
          .eq("status", "open")
          .order("opened_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (findErr || !activeSession) {
          return NextResponse.json(
            { error: "Nenhum caixa aberto localizado para fechar." },
            { status: 400 }
          );
        }

        const updatePayload: Record<string, unknown> = {
          status: "closed",
          closed_by: closedBy,
          closed_at: new Date().toISOString(),
          final_balance: finalBalance,
        };

        if (closeNotes) {
          updatePayload.notes = activeSession.notes
            ? `${activeSession.notes} | Fechamento: ${closeNotes}`
            : closeNotes;
        }

        const { data: closedSession, error: updateErr } = await supabase
          .from("cash_sessions")
          .update(updatePayload)
          .eq("id", activeSession.id)
          .select()
          .single();

        if (updateErr || !closedSession) {
          return NextResponse.json(
            { error: `Erro ao fechar caixa no banco: ${updateErr?.message}` },
            { status: 500 }
          );
        }

        posStore.syncSession(null);
        return NextResponse.json({ session: closedSession });
      } catch (err: any) {
        return NextResponse.json(
          { error: `Falha ao fechar caixa: ${err?.message}` },
          { status: 500 }
        );
      }
    }

    const session = posStore.closeCashSession(closedBy, finalBalance, closeNotes || undefined);
    if (!session) return NextResponse.json({ error: "Nenhum caixa aberto para fechar." }, { status: 400 });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Erro ao fechar caixa." }, { status: 500 });
  }
}
