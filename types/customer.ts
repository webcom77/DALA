export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cpf_cnpj?: string | null;
  birth_date?: string | null;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  } | null;
  notes?: string | null;
  active: boolean;
  total_spent: number;
  orders_count: number;
  last_purchase_at?: string | null;
  created_at: string;
  updated_at: string;
}
