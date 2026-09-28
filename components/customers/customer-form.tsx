"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, User, Phone, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";

import { customerSchema, type CustomerFormData } from "@/schemas/customer";
import { customerService } from "@/services/customer";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerFormProps {
  initialData?: Customer | null;
  isEditing?: boolean;
}

export function CustomerForm({ initialData, isEditing = false }: CustomerFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      cpf_cnpj: initialData?.cpf_cnpj || "",
      birth_date: initialData?.birth_date || "",
      street: initialData?.address?.street || "",
      number: initialData?.address?.number || "",
      complement: initialData?.address?.complement || "",
      neighborhood: initialData?.address?.neighborhood || "",
      city: initialData?.address?.city || "",
      state: initialData?.address?.state || "",
      zip_code: initialData?.address?.zip_code || "",
      notes: initialData?.notes || "",
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditing && initialData?.id) {
        const res = await customerService.updateCustomer(initialData.id, data);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const res = await customerService.createCustomer(data);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Cliente cadastrado com sucesso!");
      }

      router.push("/customers");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar cliente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? `Editar: ${initialData?.name}` : "Novo Cliente"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? "Atualize os dados e preferências do cliente." : "Preencha as informações cadastrais do cliente."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/customers">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Salvar Cliente"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados Básicos */}
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Identificação e Contato</CardTitle>
            </div>
            <CardDescription>Nome, documentos e canais de contato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input id="name" placeholder="Ex: Mariana Albuquerque" disabled={isSubmitting} {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" placeholder="(11) 98765-4321" disabled={isSubmitting} {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
                <Input id="cpf_cnpj" placeholder="000.000.000-00" disabled={isSubmitting} {...register("cpf_cnpj")} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="cliente@email.com" disabled={isSubmitting} {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input id="birth_date" type="date" disabled={isSubmitting} {...register("birth_date")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Status do Cliente</Label>
              <select
                id="active"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={watch("active") ? "true" : "false"}
                onChange={(e) => setValue("active", e.target.value === "true")}
                disabled={isSubmitting}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Endereço & Observações */}
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Endereço e Preferências</CardTitle>
            </div>
            <CardDescription>Localização para entrega e anotações de estilo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street">Logradouro / Rua</Label>
                <Input id="street" placeholder="Rua..." disabled={isSubmitting} {...register("street")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input id="number" placeholder="123" disabled={isSubmitting} {...register("number")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" placeholder="Bairro" disabled={isSubmitting} {...register("neighborhood")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="São Paulo" disabled={isSubmitting} {...register("city")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input id="state" placeholder="SP" maxLength={2} disabled={isSubmitting} {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input id="zip_code" placeholder="00000-000" disabled={isSubmitting} {...register("zip_code")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Preferências / Observações de Moda</Label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Ex: Tamanho habitual M / 38. Prefere tecidos fluidos e tons terrosos."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                disabled={isSubmitting}
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
