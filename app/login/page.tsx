"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Store, Lock, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [showPassword, setShowPassword] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const { error } = await authService.signIn(data.email, data.password);

      if (error) {
        let message = "Credenciais inválidas. Verifique seu e-mail e senha.";
        if (error.message.includes("Invalid login credentials")) {
          message = "E-mail ou senha incorretos.";
        } else if (error.message.includes("Email not confirmed")) {
          message = "E-mail ainda não confirmado.";
        } else if (error.message) {
          message = error.message;
        }
        setAuthError(message);
        toast.error(message);
        return;
      }

      toast.success("Autenticado com sucesso! Entrando...");
      router.push(redirectTo);
      router.refresh();
    } catch {
      const err = "Ocorreu um erro inesperado ao tentar conectar.";
      setAuthError(err);
      toast.error(err);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-muted/40">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Marca / Identidade */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DALA</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão para Loja de Roupas
          </p>
        </div>

        {/* Card do Formulário de Login */}
        <Card className="shadow-sm border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Acessar sistema</CardTitle>
            <CardDescription>
              Informe seu e-mail e senha para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@lojadala.com.br"
                    className="pl-9"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground border-t pt-4">
            <p>Acesso restrito a colaboradores autorizados.</p>
            <p>Novos usuários devem ser cadastrados pela gerência.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
