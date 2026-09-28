"use client";

import * as React from "react";
import Link from "next/link";
import { customerService } from "@/services/customer";
import { CustomerForm } from "@/components/customers/customer-form";
import type { Customer } from "@/types";
import { RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    customerService.getCustomerById(params.id).then((c) => {
      setCustomer(c);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Carregando cliente...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">Cliente não encontrado</h2>
        <Button asChild variant="outline">
          <Link href="/customers" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Lista
          </Link>
        </Button>
      </div>
    );
  }

  return <CustomerForm initialData={customer} isEditing={true} />;
}
