"use client";

import * as React from "react";
import Link from "next/link";
import { supplierService } from "@/services/supplier";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import type { Supplier } from "@/types";
import { RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditSupplierPage({ params }: { params: { id: string } }) {
  const [supplier, setSupplier] = React.useState<Supplier | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supplierService.getSupplierById(params.id).then((s) => {
      setSupplier(s);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Carregando fornecedor...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">Fornecedor não encontrado</h2>
        <Button asChild variant="outline">
          <Link href="/suppliers" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Lista
          </Link>
        </Button>
      </div>
    );
  }

  return <SupplierForm initialData={supplier} isEditing={true} />;
}
