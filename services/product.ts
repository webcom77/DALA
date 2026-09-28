import type { Category, Product } from "@/types";
import type { ProductFormData } from "@/schemas/product";

export const productService = {
  /**
   * Lista todas as categorias de vestuário
   */
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.categories || [];
    } catch {
      return [];
    }
  },

  /**
   * Lista os produtos com filtros de busca, categoria e status
   */
  async getProducts(filters?: {
    search?: string;
    categoryId?: string;
    active?: boolean;
  }): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.categoryId && filters.categoryId !== "all") {
        params.set("categoryId", filters.categoryId);
      }
      if (filters?.active !== undefined) {
        params.set("active", String(filters.active));
      }

      const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.products || [];
    } catch {
      return [];
    }
  },

  /**
   * Busca um produto pelo ID com suas variações de grade e cor
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.product || null;
    } catch {
      return null;
    }
  },

  /**
   * Cadastra um novo produto com variações
   */
  async createProduct(data: ProductFormData): Promise<{ product: Product | null; error: string | null }> {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { product: null, error: resData.error || "Erro ao salvar produto." };
      }

      return { product: resData.product, error: null };
    } catch {
      return { product: null, error: "Falha de conexão ao cadastrar produto." };
    }
  },

  /**
   * Atualiza um produto existente e suas variações
   */
  async updateProduct(
    id: string,
    data: ProductFormData
  ): Promise<{ product: Product | null; error: string | null }> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { product: null, error: resData.error || "Erro ao atualizar produto." };
      }

      return { product: resData.product, error: null };
    } catch {
      return { product: null, error: "Falha de conexão ao atualizar produto." };
    }
  },

  /**
   * Exclui um produto
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
