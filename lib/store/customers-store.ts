import type { Customer } from "@/types";

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Mariana Albuquerque",
    email: "mariana.albuquerque@email.com",
    phone: "(11) 98765-4321",
    cpf_cnpj: "234.567.890-12",
    birth_date: "1994-05-18",
    address: {
      street: "Rua Oscar Freire",
      number: "1230",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zip_code: "01426-001",
    },
    notes: "Prefere vestidos mídi e peças em linho. Cliente VIP.",
    active: true,
    total_spent: 1249.70,
    orders_count: 5,
    last_purchase_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "cust-2",
    name: "Beatriz Nogueira",
    email: "beatriz.nogueira@email.com",
    phone: "(11) 97654-3210",
    cpf_cnpj: "345.678.901-23",
    birth_date: "1988-11-24",
    address: {
      street: "Av. Paulista",
      number: "800",
      complement: "Apto 102",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zip_code: "01310-100",
    },
    notes: "Compra principalmente calças de alfaiataria tamanho 38.",
    active: true,
    total_spent: 879.80,
    orders_count: 3,
    last_purchase_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "cust-3",
    name: "Camila Fernandes",
    email: "camila.f@email.com",
    phone: "(11) 99123-4567",
    cpf_cnpj: "456.789.012-34",
    birth_date: "1997-02-10",
    notes: "Gosta de conjuntos e cores neutras.",
    active: true,
    total_spent: 459.90,
    orders_count: 2,
    last_purchase_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __DALA_CUSTOMERS__: Customer[] | undefined;
}

if (!global.__DALA_CUSTOMERS__) {
  global.__DALA_CUSTOMERS__ = [...INITIAL_CUSTOMERS];
}

export const customersStore = {
  getCustomers(search?: string): Customer[] {
    let list = global.__DALA_CUSTOMERS__ || INITIAL_CUSTOMERS;
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.cpf_cnpj && c.cpf_cnpj.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getCustomerById(id: string): Customer | null {
    const list = global.__DALA_CUSTOMERS__ || INITIAL_CUSTOMERS;
    return list.find((c) => c.id === id) || null;
  },

  createCustomer(data: Omit<Customer, "id" | "created_at" | "updated_at" | "total_spent" | "orders_count">): Customer {
    const newId = `cust-${Date.now()}`;
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...data,
      id: newId,
      total_spent: 0,
      orders_count: 0,
      created_at: now,
      updated_at: now,
    };
    if (!global.__DALA_CUSTOMERS__) global.__DALA_CUSTOMERS__ = [];
    global.__DALA_CUSTOMERS__.unshift(newCustomer);
    return newCustomer;
  },

  updateCustomer(id: string, data: Partial<Customer>): Customer | null {
    if (!global.__DALA_CUSTOMERS__) return null;
    const idx = global.__DALA_CUSTOMERS__.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated: Customer = {
      ...global.__DALA_CUSTOMERS__[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    global.__DALA_CUSTOMERS__[idx] = updated;
    return updated;
  },

  deleteCustomer(id: string): boolean {
    if (!global.__DALA_CUSTOMERS__) return false;
    const initialLen = global.__DALA_CUSTOMERS__.length;
    global.__DALA_CUSTOMERS__ = global.__DALA_CUSTOMERS__.filter((c) => c.id !== id);
    return global.__DALA_CUSTOMERS__.length < initialLen;
  },

  registerPurchase(customerId: string, amount: number) {
    const customer = this.getCustomerById(customerId);
    if (customer) {
      this.updateCustomer(customerId, {
        total_spent: Number((customer.total_spent + amount).toFixed(2)),
        orders_count: customer.orders_count + 1,
        last_purchase_at: new Date().toISOString(),
      });
    }
  },
};
