export type PurchaseOrderStatus = "draft" | "pending" | "received" | "cancelled";

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id?: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  sku_variant: string;
  size: string;
  color: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  status: PurchaseOrderStatus;
  payment_status: "pending" | "paid";
  total_amount: number;
  expected_delivery?: string | null;
  received_at?: string | null;
  notes?: string | null;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}
