"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Truck, MapPin } from "lucide-react";
import { toast } from "sonner";

import { supplierSchema, type SupplierFormData } from "@/schemas/supplier";
import { supplierService } from "@/services/supplier";
import type { Supplier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SupplierFormProps {
  initialData?: Supplier | null;
  isEditing?: boolean;
}

export function SupplierForm({ initialData, isEditing = false }: SupplierFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      trade_name: initialData?.trade_name || "",
      corporate_name: initialData?.corporate_name || "",
      cnpj: initialData?.cnpj || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      contact_person: initialData?.contact_person || "",
      category: initialData?.category || "",
      street: initialData?.address?.street || "",
      number: initialData?.address?.number || "",
      neighborhood: initialData?.address?.neighborhood || "",
      city: initialData?.address?.city || "",
      state: initialData?.address?.state || "",
      zip_code: initialData?.address?.zip_code || "",
      notes: initialData?.notes || "",
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (isEditing && initialData?.id) {
        const res = await supplierService.updateSupplier(initialData.id, data);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Fornecedor atualizado com sucesso!");
      } else {
        const res = await supplierService.createSupplier(data);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Fornecedor cadastrado com sucesso!");
      }

      router.push("/suppliers");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar fornecedor.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/suppliers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? `Editar: ${initialData?.trade_name}` : "Novo Fornecedor"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? "Atualize as informações comerciais da confecção ou tecelagem." : "Cadastre uma nova confecção ou distribuidor."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/suppliers">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Salvar Fornecedor"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados da Empresa */}
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Dados Comerciais</CardTitle>
            </div>
            <CardDescription>Nome fantasia, razão social, CNPJ e linha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trade_name">Nome Fantasia *</Label>
              <Input id="trade_name" placeholder="Ex: Confecções Estilo & Arte" disabled={isSubmitting} {...register("trade_name")} />
              {errors.trade_name && <p className="text-xs text-destructive">{errors.trade_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="corporate_name">Razão Social *</Label>
              <Input id="corporate_name" placeholder="Ex: Estilo & Arte Indústria Ltda" disabled={isSubmitting} {...register("corporate_name")} />
              {errors.corporate_name && <p className="text-xs text-destructive">{errors.corporate_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" placeholder="00.000.000/0000-00" disabled={isSubmitting} {...register("cnpj")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Linha Fornecida</Label>
                <Input id="category" placeholder="Ex: Vestidos, Linho, Jeans" disabled={isSubmitting} {...register("category")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Pessoa de Contato</Label>
                <Input id="contact_person" placeholder="Ex: Renato Mendes" disabled={isSubmitting} {...register("contact_person")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / Comercial</Label>
                <Input id="phone" placeholder="(11) 3322-1100" disabled={isSubmitting} {...register("phone")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Pedidos</Label>
              <Input id="email" type="email" placeholder="pedidos@empresa.com.br" disabled={isSubmitting} {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
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

        {/* Localização & Notas */}
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Endereço e Observações</CardTitle>
            </div>
            <CardDescription>Localização da fábrica e prazos de entrega.</CardDescription>
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
              <Label htmlFor="notes">Condições Comerciais / Observações</Label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Ex: Prazo de produção: 15 dias. Pagamento 30 dias no boleto. Quantidade mínima: 10 peças."
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
