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
  total_debt?: number; // Saldo devedor total em notinhas
  overdue_debt?: number; // Valor de parcelas vencidas em atraso
  overdue_count?: number; // Número de parcelas vencidas
  credit_limit?: number | null; // Limite de crediário
  created_at: string;
  updated_at: string;
}
