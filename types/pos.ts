export type PaymentMethod = "money" | "pix" | "credit_card" | "debit_card";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  money: "Dinheiro",
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
};

export interface SaleItem {
  id?: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  sku_variant: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface Sale {
  id: string;
  sale_number: string;
  customer_id?: string | null;
  customer_name?: string | null;
  cash_session_id?: string | null;
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  amount_received?: number | null;
  change_amount?: number | null;
  installments?: number;
  items: SaleItem[];
  status: "completed" | "cancelled";
  created_at: string;
}

export interface CashSession {
  id: string;
  opened_by: string;
  opened_at: string;
  closed_by?: string | null;
  closed_at?: string | null;
  initial_balance: number; // Fundo de caixa
  final_balance?: number | null;
  total_sales: number;
  total_cash: number;
  total_pix: number;
  total_card: number;
  status: "open" | "closed";
  notes?: string | null;
}
