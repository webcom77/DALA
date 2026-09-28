import type { Supplier } from "@/types";

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "supp-1",
    trade_name: "Confecções Estilo & Arte",
    corporate_name: "Estilo & Arte Indústria do Vestuário Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@estiloeartemoda.com.br",
    phone: "(11) 3322-1100",
    contact_person: "Renato Mendes",
    category: "Vestidos e Alfaiataria",
    address: {
      street: "Rua Miller",
      number: "450",
      neighborhood: "Brás",
      city: "São Paulo",
      state: "SP",
      zip_code: "03011-011",
    },
    notes: "Fornecedor principal da linha de vestidos e alfaiataria premium.",
    active: true,
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: "supp-2",
    trade_name: "Tecelagem & Jeans Brasil",
    corporate_name: "Brasil Denim & Co. S/A",
    cnpj: "98.765.432/0001-10",
    email: "pedidos@brasildenim.com.br",
    phone: "(19) 3456-7890",
    contact_person: "Vanessa Rocha",
    category: "Jeans e Sarjas",
    address: {
      street: "Rodovia Anhanguera",
      number: "Km 128",
      neighborhood: "Distrito Industrial",
      city: "Americana",
      state: "SP",
      zip_code: "13470-000",
    },
    notes: "Excelente qualidade de lavagem jeans e corte wide leg.",
    active: true,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: "supp-3",
    trade_name: "Linhos & Tramas Naturais",
    corporate_name: "Linho Puro Tecidos Finos Eireli",
    cnpj: "45.123.789/0001-55",
    email: "vendas@linhosetramas.com.br",
    phone: "(47) 3344-5566",
    contact_person: "Eduardo Krause",
    category: "Camisaria e Linho",
    address: {
      street: "Rua XV de Novembro",
      number: "1500",
      neighborhood: "Centro",
      city: "Blumenau",
      state: "SC",
      zip_code: "89010-000",
    },
    notes: "Especialista em camisas de linho misto e puro.",
    active: true,
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __DALA_SUPPLIERS__: Supplier[] | undefined;
}

if (!global.__DALA_SUPPLIERS__) {
  global.__DALA_SUPPLIERS__ = [...INITIAL_SUPPLIERS];
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
