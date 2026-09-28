/**
 * Papéis de usuário permitidos no sistema
 */
export type UserRole = "admin" | "manager" | "cashier";

/**
 * Tradução e rótulo legível dos papéis
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Operador de Caixa",
};

/**
 * Perfil do usuário vinculado ao Supabase Auth
 */
export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Configurações da loja e preferências do sistema
 */
export interface StoreSettings {
  storeName: string;
  responsibleName: string;
  currency: string;
  language: string;
  theme: "light" | "dark" | "system";
}

/**
 * Status do sistema
 */
export interface SystemStatus {
  online: boolean;
  databaseConnected: boolean;
  version: string;
  environment: string;
}

export * from "./product";
export * from "./customer";
export * from "./supplier";
export * from "./inventory";
export * from "./purchase";
export * from "./pos";
export * from "./finance";
