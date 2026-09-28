export type TransactionType = "payable" | "receivable";
export type TransactionStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  due_date: string;
  paid_at?: string | null;
  status: TransactionStatus;
  payment_method?: string | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface FinancialSummary {
  current_balance: number;
  total_receivable_pending: number;
  total_payable_pending: number;
  total_received_month: number;
  total_paid_month: number;
  overdue_count: number;
}
