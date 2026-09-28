import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Credenciais do Administrador do sistema DALA
    if (email === "admin@dala.com.br" && password === "admin123") {
      const adminUser = {
        id: "admin-dala-001",
        email: "admin@dala.com.br",
        full_name: "Administrador DALA",
        role: "admin",
      };

      const response = NextResponse.json({
        success: true,
        user: adminUser,
      });

      response.cookies.set({
        name: "dala_session",
        value: JSON.stringify(adminUser),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias de sessão ativa
      });

      return response;
    }

    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno no processamento do login." },
      { status: 500 }
    );
  }
}
