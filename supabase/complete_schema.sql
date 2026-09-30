-- ==============================================================================
-- SISTEMA DE GESTÃO PARA LOJA DE ROUPAS (DALA)
-- SCHEMA COMPLETO CONSOLIDADO: Todos os módulos
-- Arquivo: supabase/complete_schema.sql
-- ==============================================================================

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Função utilitária para atualização do timestamp updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PERFIS DE USUÁRIOS
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'manager', 'cashier')) default 'cashier',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_active on public.profiles(active);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. CATEGORIAS DE VESTUÁRIO
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. PRODUTOS & VARIAÇÕES DE GRADE (TAMANHO E COR)
-- ------------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  cost_price numeric(10, 2) not null default 0.00 check (cost_price >= 0),
  sale_price numeric(10, 2) not null check (sale_price >= 0),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  sku_variant text not null unique,
  barcode text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_product_size_color unique (product_id, size, color)
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_variants_sku on public.product_variants(sku_variant);

-- ------------------------------------------------------------------------------
-- 5. CLIENTES (CUSTOMERS)
-- ------------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  cpf_cnpj text,
  birth_date date,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  notes text,
  active boolean not null default true,
  credit_limit numeric(12, 2) not null default 0.00,
  total_spent numeric(12, 2) not null default 0.00,
  orders_count integer not null default 0,
  last_purchase_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_customers_name on public.customers(name);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_customers_cpf on public.customers(cpf_cnpj);

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
  before update on public.customers
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. FORNECEDORES (SUPPLIERS)
-- ------------------------------------------------------------------------------
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  corporate_name text not null,
  trade_name text not null,
  cnpj text,
  email text,
  phone text,
  contact_person text,
  category text,
  street text,
  number text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_suppliers_trade_name on public.suppliers(trade_name);
create index if not exists idx_suppliers_cnpj on public.suppliers(cnpj);

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
  before update on public.suppliers
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. ESTOQUE & MOVIMENTAÇÕES (INVENTORY)
-- ------------------------------------------------------------------------------
create table if not exists public.inventory_levels (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  current_stock integer not null default 0,
  min_stock integer not null default 2,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  type text not null check (type in ('entry', 'exit', 'adjustment', 'sale', 'purchase')),
  quantity integer not null,
  previous_stock integer not null default 0,
  new_stock integer not null default 0,
  reason text not null,
  reference_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_stock_movements_variant on public.stock_movements(variant_id);
create index if not exists idx_stock_movements_created_at on public.stock_movements(created_at);

-- ------------------------------------------------------------------------------
-- 8. COMPRAS (PURCHASE ORDERS)
-- ------------------------------------------------------------------------------
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null check (status in ('draft', 'pending', 'received', 'cancelled')) default 'pending',
  payment_status text not null check (payment_status in ('pending', 'paid')) default 'pending',
  total_amount numeric(12, 2) not null default 0.00,
  expected_delivery date,
  received_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(10, 2) not null check (unit_cost >= 0),
  total_cost numeric(10, 2) not null check (total_cost >= 0)
);

create index if not exists idx_purchase_orders_supplier on public.purchase_orders(supplier_id);
create index if not exists idx_purchase_orders_status on public.purchase_orders(status);

-- ------------------------------------------------------------------------------
-- 9. CAIXA & SESSÕES DE TURNO (CASH SESSIONS)
-- ------------------------------------------------------------------------------
create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  opened_by text not null,
  closed_by text,
  initial_balance numeric(10, 2) not null default 0.00,
  final_balance numeric(10, 2),
  total_sales numeric(12, 2) not null default 0.00,
  total_cash numeric(12, 2) not null default 0.00,
  total_pix numeric(12, 2) not null default 0.00,
  total_card numeric(12, 2) not null default 0.00,
  status text not null check (status in ('open', 'closed')) default 'open',
  notes text,
  opened_at timestamptz not null default timezone('utc'::text, now()),
  closed_at timestamptz
);

create index if not exists idx_cash_sessions_status on public.cash_sessions(status);

-- ------------------------------------------------------------------------------
-- 10. VENDAS & FRENTE DE CAIXA / PDV (SALES / ORDERS)
-- ------------------------------------------------------------------------------
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  sale_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  cash_session_id uuid references public.cash_sessions(id) on delete set null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount numeric(12, 2) not null default 0.00,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  payment_method text not null check (payment_method in ('money', 'pix', 'credit_card', 'debit_card', 'promissory')),
  amount_received numeric(12, 2),
  change_amount numeric(12, 2),
  installments integer default 1,
  down_payment numeric(12, 2) default 0.00,
  down_payment_method text,
  first_due_date date,
  status text not null check (status in ('completed', 'cancelled')) default 'completed',
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_name text,
  sku_variant text,
  size text,
  color text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  discount numeric(10, 2) not null default 0.00,
  total_price numeric(10, 2) not null check (total_price >= 0)
);

create index if not exists idx_sales_created_at on public.sales(created_at);
create index if not exists idx_sales_customer on public.sales(customer_id);

-- ------------------------------------------------------------------------------
-- 11. FINANCEIRO (CONTAS A PAGAR, RECEBER E TRANSAÇÕES)
-- ------------------------------------------------------------------------------
create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('payable', 'receivable')),
  category text not null,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  due_date date not null,
  paid_at timestamptz,
  status text not null check (status in ('pending', 'paid', 'overdue', 'cancelled')) default 'pending',
  payment_method text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  reference_id uuid,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_financial_type on public.financial_transactions(type);
create index if not exists idx_financial_status on public.financial_transactions(status);
create index if not exists idx_financial_due_date on public.financial_transactions(due_date);

-- ------------------------------------------------------------------------------
-- 12. HABILITAR RLS EM TODAS AS TABELAS
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.stock_movements enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.financial_transactions enable row level security;

-- Políticas gerais para chave pública (anon) e usuários autenticados da loja
drop policy if exists "Store access to profiles" on public.profiles;
create policy "Store access to profiles" on public.profiles for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to categories" on public.categories;
create policy "Store access to categories" on public.categories for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to products" on public.products;
create policy "Store access to products" on public.products for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to product_variants" on public.product_variants;
create policy "Store access to product_variants" on public.product_variants for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to customers" on public.customers;
create policy "Store access to customers" on public.customers for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to suppliers" on public.suppliers;
create policy "Store access to suppliers" on public.suppliers for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to inventory_levels" on public.inventory_levels;
create policy "Store access to inventory_levels" on public.inventory_levels for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to stock_movements" on public.stock_movements;
create policy "Store access to stock_movements" on public.stock_movements for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to purchase_orders" on public.purchase_orders;
create policy "Store access to purchase_orders" on public.purchase_orders for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to purchase_order_items" on public.purchase_order_items;
create policy "Store access to purchase_order_items" on public.purchase_order_items for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to cash_sessions" on public.cash_sessions;
create policy "Store access to cash_sessions" on public.cash_sessions for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to sales" on public.sales;
create policy "Store access to sales" on public.sales for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to sale_items" on public.sale_items;
create policy "Store access to sale_items" on public.sale_items for all to anon, authenticated using (true) with check (true);

drop policy if exists "Store access to financial_transactions" on public.financial_transactions;
create policy "Store access to financial_transactions" on public.financial_transactions for all to anon, authenticated using (true) with check (true);

-- ------------------------------------------------------------------------------
-- 13. DADOS INICIAIS BASE (APENAS CATEGORIAS OFICIAIS - SEM DADOS DE TESTE)
-- ------------------------------------------------------------------------------
insert into public.categories (name, slug, description)
values
  ('Vestidos', 'vestidos', 'Vestidos casuais, festa, mídi e longos'),
  ('Lingeries & Sleepwear', 'lingeries-sleepwear', 'Conjuntos íntimos, lingeries finas, pijamas e robes acetinados'),
  ('Camisas e Blusas', 'camisas-blusas', 'Camisas sociais, blusas em seda, linho e algodão nobre'),
  ('Calças e Jeans', 'calcas-jeans', 'Calças alfaiataria, pantalonas, jeans e modelagens refinadas'),
  ('Saias e Shorts', 'saias-shorts', 'Saias mídi, lápis, plissadas e shorts sofisticados'),
  ('Casacos e Jaquetas', 'casacos-jaquetas', 'Blazers de corte fino, trench coats, casacos e jaquetas'),
  ('Acessórios', 'acessorios', 'Cintos de couro, bolsas, lenços de seda e bijuterias finas')
on conflict (slug) do nothing;
