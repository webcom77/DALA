export interface Supplier {
  id: string;
  corporate_name: string; // Razão Social
  trade_name: string;     // Nome Fantasia
  cnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_person?: string | null;
  category?: string | null; // ex: Tecidos, Confecção, Aviamentos, Calçados
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  } | null;
  notes?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
