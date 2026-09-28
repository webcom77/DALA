import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export const authService = {
  /**
   * Efetua login com e-mail e senha
   */
  async signIn(email: string, password: string) {
    const supabase = createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfiguredSupabase = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

    // Se houver Supabase real configurado, tenta autenticar por ele
    if (isConfiguredSupabase) {
      try {
        const res = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!res.error) {
          return res;
        }
      } catch {
        // Prossegue para autenticação de administração local
      }
    }

    // Autenticação administrativa com sessão via cookie
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          data: { user: null, session: null },
          error: { message: data.error || "E-mail ou senha incorretos." },
        };
      }

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            user_metadata: {
              full_name: data.user.full_name,
              role: data.user.role,
            },
          } as any,
          session: null,
        },
        error: null,
      };
    } catch {
      return {
        data: { user: null, session: null },
        error: { message: "Não foi possível conectar ao serviço de autenticação." },
      };
    }
  },

  /**
   * Envia e-mail de recuperação de senha
   */
  async resetPassword(email: string) {
    const supabase = createClient();
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/settings`
      : undefined;

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  },

  /**
   * Encerra a sessão do usuário
   */
  async signOut() {
    const supabase = createClient();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignora erro de rede no logout
    }
    return await supabase.auth.signOut();
  },

  /**
   * Busca o perfil do usuário logado no banco de dados (public.profiles)
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Profile;
  },
};
