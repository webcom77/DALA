"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Store, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    try {
      const { error } = await authService.resetPassword(data.email);

      if (error) {
        setErrorMessage(error.message);
        toast.error("Não foi possível enviar o e-mail de recuperação.");
        return;
      }

      setIsSuccess(true);
      toast.success("E-mail de recuperação enviado com sucesso!");
    } catch {
      const err = "Ocorreu um erro inesperado ao solicitar a recuperação.";
      setErrorMessage(err);
      toast.error(err);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-muted/40">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DALA</h1>
          <p className="text-sm text-muted-foreground">
            Recuperação de Acesso
          </p>
        </div>

        <Card className="shadow-sm border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Redefinir senha</CardTitle>
            <CardDescription>
              Digite o e-mail cadastrado para receber o link de redefinição de acesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-sm leading-relaxed">
                    <p className="font-semibold">Instruções enviadas!</p>
                    <p className="mt-1">
                      Se o e-mail informado estiver registrado em nosso sistema,
                      você receberá um link com instruções para cadastrar uma nova senha.
                    </p>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail cadastrado</Label>
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando instruções...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex justify-center border-t pt-4">
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
