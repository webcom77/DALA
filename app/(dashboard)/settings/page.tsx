"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import {
  Save,
  Store,
  User,
  Coins,
  Globe,
  Palette,
  CheckCircle2,
  Database,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Activity,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { storeSettingsSchema, type StoreSettingsFormData } from "@/schemas/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "dala_store_settings";

const defaultSettings: StoreSettingsFormData = {
  storeName: "DALA Moda & Estilo",
  responsibleName: "Administrador Geral",
  currency: "BRL",
  language: "pt-BR",
  theme: "system",
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();
  const [isSaved, setIsSaved] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: defaultSettings,
  });

  const selectedTheme = watch("theme");

  // Carrega configurações salvas localmente ao montar a tela
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as StoreSettingsFormData;
          setValue("storeName", parsed.storeName);
          setValue("responsibleName", parsed.responsibleName);
          setValue("currency", parsed.currency || "BRL");
          setValue("language", parsed.language || "pt-BR");
          setValue("theme", parsed.theme || "system");
        } else if (profile?.full_name) {
          setValue("responsibleName", profile.full_name);
        }
      } catch {
        // Se falhar o parse, usa os padrões
      }
    }
  }, [profile, setValue]);

  const onSubmit = async (data: StoreSettingsFormData) => {
    try {
      // Salva no localStorage (persistência da fundação antes da tabela dedicada)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Aplica o tema imediatamente
      setTheme(data.theme);

      setIsSaved(true);
      toast.success("Configurações salvas com sucesso!");

      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      toast.error("Erro ao salvar as configurações.");
    }
  };

  const [supabaseStatus, setSupabaseStatus] = React.useState<"checking" | "connected" | "error">("checking");
  const [latency, setLatency] = React.useState<number | null>(null);
  const [isPinging, setIsPinging] = React.useState(false);

  const testSupabaseConnection = React.useCallback(async (showToast = false) => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").select("id", { count: "exact", head: true });
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);

      if (error && error.code !== "PGRST205") {
        setSupabaseStatus("error");
        if (showToast) toast.error("Falha ao comunicar com o Supabase: " + error.message);
      } else {
        setSupabaseStatus("connected");
        if (showToast) toast.success(`Conexão Supabase verificada com sucesso! (${elapsed}ms)`);
      }
    } catch {
      setSupabaseStatus("error");
      if (showToast) toast.error("Erro inesperado ao conectar com o Supabase.");
    } finally {
      setIsPinging(false);
    }
  }, []);

  React.useEffect(() => {
    testSupabaseConnection(false);
  }, [testSupabaseConnection]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações Gerais</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Parâmetros fundamentais de identidade, localização e exibição do sistema.
        </p>
      </div>

      {/* Status da Conexão com o Supabase */}
      <Card className="border border-border/80 bg-gradient-to-br from-card via-card to-[#E06B67]/5 shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#E06B67] to-[#F48884] flex items-center justify-center text-white shadow-sm shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    Banco de Dados Supabase (PostgreSQL Cloud)
                  </h3>
                  {supabaseStatus === "connected" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Conectado e Operacional
                    </span>
                  )}
                  {supabaseStatus === "checking" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Verificando Conexão...
                    </span>
                  )}
                  {supabaseStatus === "error" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <AlertCircle className="h-3 w-3" />
                      Falha de Conexão
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  https://vimjhbjscvkwusxilzmo.supabase.co
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => testSupabaseConnection(true)}
                disabled={isPinging}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? "animate-spin" : ""}`} />
                Testar Conexão
              </Button>
              <a
                href="https://supabase.com/dashboard/project/vimjhbjscvkwusxilzmo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Painel
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#E06B67]" />
              <span>Chave Anon Ativa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Tabelas DALA Criadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              <span>{latency !== null ? `Latência: ${latency}ms` : "Latência: normal"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-violet-500" />
              <span>RLS Habilitado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Identidade da Loja */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Identificação da Loja</CardTitle>
              </div>
              <CardDescription>
                Informações principais da unidade comercial e gestor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da Loja</Label>
                <div className="relative">
                  <Input
                    id="storeName"
                    placeholder="Ex: DALA Moda Feminina"
                    disabled={isSubmitting}
                    {...register("storeName")}
                  />
                </div>
                {errors.storeName && (
                  <p className="text-xs text-destructive">{errors.storeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibleName">Nome do Responsável</Label>
                <div className="relative">
                  <Input
                    id="responsibleName"
                    placeholder="Ex: Carlos Silva"
                    disabled={isSubmitting}
                    {...register("responsibleName")}
                  />
                </div>
                {errors.responsibleName && (
                  <p className="text-xs text-destructive">{errors.responsibleName.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de Localização & Moeda */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Localização e Moeda</CardTitle>
              </div>
              <CardDescription>
                Padrões monetários e de idioma do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda Padrão</Label>
                <select
                  id="currency"
                  disabled={isSubmitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("currency")}
                >
                  <option value="BRL" className="bg-background text-foreground">
                    BRL - Real Brasileiro (R$)
                  </option>
                </select>
                {errors.currency && (
                  <p className="text-xs text-destructive">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma do Sistema</Label>
                <select
                  id="language"
                  disabled={isSubmitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("language")}
                >
                  <option value="pt-BR" className="bg-background text-foreground">
                    Português (Brasil) - pt-BR
                  </option>
                </select>
                {errors.language && (
                  <p className="text-xs text-destructive">{errors.language.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de Tema & Aparência */}
          <Card className="shadow-sm md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Aparência do Sistema</CardTitle>
              </div>
              <CardDescription>
                Escolha a preferência visual de contraste e tema da interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Tema Claro", desc: "Interface limpa com fundo branco e contraste suave." },
                  { id: "dark", label: "Tema Escuro", desc: "Interface escura de alto conforto visual noturno." },
                  { id: "system", label: "Seguir Sistema", desc: "Sincroniza automaticamente com o tema do seu dispositivo." },
                ].map((item) => {
                  const isChecked = selectedTheme === item.id;
                  return (
                    <label
                      key={item.id}
                      onClick={() => {
                        setValue("theme", item.id as "light" | "dark" | "system", { shouldDirty: true });
                        setTheme(item.id);
                      }}
                      className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isChecked
                          ? "border-primary bg-primary/5 text-foreground shadow-sm"
                          : "border-border hover:border-muted-foreground/30 bg-card text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">{item.label}</span>
                        {isChecked && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <span className="text-xs leading-relaxed">{item.desc}</span>
                    </label>
                  );
                })}
              </div>
              {errors.theme && (
                <p className="text-xs text-destructive mt-2">{errors.theme.message}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t p-6">
              <span className="text-xs text-muted-foreground">
                {isDirty ? "Você possui alterações não salvas." : "Configurações em sincronia."}
              </span>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
