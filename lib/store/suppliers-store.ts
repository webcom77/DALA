import type { Supplier } from "@/types";

export const INITIAL_SUPPLIERS: Supplier[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __DALA_SUPPLIERS__: Supplier[] | undefined;
}

if (!global.__DALA_SUPPLIERS__) {
  global.__DALA_SUPPLIERS__ = [];
}

export const suppliersStore = {
  getSuppliers(search?: string): Supplier[] {
    let list = global.__DALA_SUPPLIERS__ || INITIAL_SUPPLIERS;
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.trade_name.toLowerCase().includes(q) ||
          s.corporate_name.toLowerCase().includes(q) ||
          (s.cnpj && s.cnpj.includes(q)) ||
          (s.category && s.category.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getSupplierById(id: string): Supplier | null {
    const list = global.__DALA_SUPPLIERS__ || INITIAL_SUPPLIERS;
    return list.find((s) => s.id === id) || null;
  },

  createSupplier(data: Omit<Supplier, "id" | "created_at" | "updated_at">): Supplier {
    const newId = `supp-${Date.now()}`;
    const now = new Date().toISOString();
    const newSupplier: Supplier = {
      ...data,
      id: newId,
      created_at: now,
      updated_at: now,
    };
    if (!global.__DALA_SUPPLIERS__) global.__DALA_SUPPLIERS__ = [];
    global.__DALA_SUPPLIERS__.unshift(newSupplier);
    return newSupplier;
  },

  updateSupplier(id: string, data: Partial<Supplier>): Supplier | null {
    if (!global.__DALA_SUPPLIERS__) return null;
    const idx = global.__DALA_SUPPLIERS__.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Supplier = {
      ...global.__DALA_SUPPLIERS__[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    global.__DALA_SUPPLIERS__[idx] = updated;
    return updated;
  },

  deleteSupplier(id: string): boolean {
    if (!global.__DALA_SUPPLIERS__) return false;
    const initialLen = global.__DALA_SUPPLIERS__.length;
    global.__DALA_SUPPLIERS__ = global.__DALA_SUPPLIERS__.filter((s) => s.id !== id);
    return global.__DALA_SUPPLIERS__.length < initialLen;
  },
};
