"use client";

import * as React from "react";
import { productService } from "@/services/product";
import { ProductForm } from "@/components/products/product-form";
import type { Category } from "@/types";
import { RefreshCw } from "lucide-react";

export default function NewProductPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    productService.getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Carregando formulário...</p>
      </div>
    );
  }

  return <ProductForm categories={categories} isEditing={false} />;
}
