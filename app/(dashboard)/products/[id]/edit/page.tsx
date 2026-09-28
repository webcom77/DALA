"use client";

import * as React from "react";
import Link from "next/link";
import { productService } from "@/services/product";
import { ProductForm } from "@/components/products/product-form";
import type { Category, Product } from "@/types";
import { RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [product, setProduct] = React.useState<Product | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([
      productService.getProductById(id),
      productService.getCategories(),
    ])
      .then(([prod, cats]) => {
        if (!prod) {
          setError("Produto não encontrado.");
        } else {
          setProduct(prod);
        }
        setCategories(cats);
      })
      .catch(() => {
        setError("Erro ao carregar dados do produto.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Carregando produto e variações...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">Produto não encontrado</h2>
        <p className="text-sm text-muted-foreground">
          O produto que você está tentando editar não existe ou foi removido.
        </p>
        <Button asChild variant="outline">
          <Link href="/products" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Catálogo
          </Link>
        </Button>
      </div>
    );
  }

  return <ProductForm initialData={product} categories={categories} isEditing={true} />;
}
