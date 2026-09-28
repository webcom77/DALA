"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth";
import type { Profile, UserRole } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const fetchProfile = React.useCallback(async (currentUser: User) => {
    try {
      const p = await authService.getProfile(currentUser.id);
      if (p) {
        setProfile(p);
      } else {
        // Fallback usando os metadados do auth.users se o perfil ainda estiver sendo provisionado
        const defaultName =
          (currentUser.user_metadata?.full_name as string) ||
          currentUser.email?.split("@")[0] ||
          "Usuário";
        const defaultRole = (currentUser.user_metadata?.role as UserRole) || "admin";

        setProfile({
          id: currentUser.id,
          full_name: defaultName,
          role: defaultRole,
          active: true,
          created_at: currentUser.created_at,
          updated_at: currentUser.created_at,
        });
      }
    } catch {
      // Falha silenciosa com fallback seguro
    }
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  React.useEffect(() => {
    const supabase = createClient();

    // Carrega a sessão inicial
    supabase.auth.getUser().then(async ({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfile(currentUser).finally(() => setIsLoading(false));
      } else {
        // Verifica se há sessão administrativa ativa
        try {
          const res = await fetch("/api/auth/me");
          const { user: adminUser } = await res.json();
          if (adminUser) {
            setUser({
              id: adminUser.id,
              email: adminUser.email,
              user_metadata: {
                full_name: adminUser.full_name,
                role: adminUser.role,
              },
            } as any);
            setProfile({
              id: adminUser.id,
              full_name: adminUser.full_name,
              role: adminUser.role,
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } catch {
          // Sem sessão ativa
        }
        setIsLoading(false);
      }
    });

    // Ouve mudanças de estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      toast.success("Sessão finalizada com sucesso.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Erro ao encerrar a sessão.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
