-- ==============================================================================
-- SISTEMA DE GESTÃO PARA LOJA DE ROUPAS (DALA)
-- Módulo 2: Catálogo de Produtos, Categorias e Grade de Vestuário
-- Arquivo: supabase/products_schema.sql
-- ==============================================================================

-- 1. TABELA DE CATEGORIAS
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.categories is 'Categorias de vestuário (ex: Vestidos, Camisas, Calças, Acessórios)';

-- 2. TABELA DE PRODUTOS BASE
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

comment on table public.products is 'Modelos base de peças da loja de roupas';
comment on column public.products.sku is 'Código de referência base da peça (ex: REF-001)';

-- 3. TABELA DE VARIAÇÕES DE GRADE (TAMANHO E COR)
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

comment on table public.product_variants is 'Variações de tamanho e cor específicas para vestuário';

-- 4. ÍNDICES DE OTIMIZAÇÃO
create index if not exists idx_categories_active on public.categories(active);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_variants_sku on public.product_variants(sku_variant);

-- 5. TRIGGERS PARA UPDATED_AT
drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
  before update on public.product_variants
  for each row execute procedure public.handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;

-- Categorias: Usuários autenticados podem visualizar e gerenciar
create policy "Authenticated users can select categories"
  on public.categories for select to authenticated using (true);

create policy "Authenticated users can insert/update categories"
  on public.categories for all to authenticated using (true) with check (true);

-- Produtos: Usuários autenticados podem visualizar e gerenciar
create policy "Authenticated users can select products"
  on public.products for select to authenticated using (true);

create policy "Authenticated users can manage products"
  on public.products for all to authenticated using (true) with check (true);

-- Variações: Usuários autenticados podem visualizar e gerenciar
create policy "Authenticated users can select variants"
  on public.product_variants for select to authenticated using (true);

create policy "Authenticated users can manage variants"
  on public.product_variants for all to authenticated using (true) with check (true);

-- 7. DADOS INICIAIS (SEED) DE CATEGORIAS TÍPICAS DE VESTUÁRIO
insert into public.categories (name, slug, description) values
  ('Vestidos', 'vestidos', 'Vestidos curtos, mídis, longos e de festa'),
  ('Camisas e Blusas', 'camisas-e-blusas', 'Camisaria, t-shirts, blusas e croppeds'),
  ('Calças e Jeans', 'calcas-e-jeans', 'Calças alfaiataria, jeans, pantalonas e leggings'),
  ('Saias e Shorts', 'saias-e-shorts', 'Saias mídi, curtas, shorts e bermudas'),
  ('Casacos e Jaquetas', 'casacos-e-jaquetas', 'Blazers, jaquetas, sobretudos e cardigãs'),
  ('Acessórios', 'acessorios', 'Cintos, bolsas, lenços e bijuterias')
on conflict (slug) do nothing;
