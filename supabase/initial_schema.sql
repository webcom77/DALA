-- ==============================================================================
-- SISTEMA DE GESTÃO PARA LOJA DE ROUPAS
-- Migração Inicial: Autenticação e Perfis de Usuário
-- Arquivo: supabase/initial_schema.sql
-- ==============================================================================

-- 1. Criação da tabela de perfis de usuários vinculada ao Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'manager', 'cashier')) default 'cashier',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Comentários descritivos da tabela e colunas
comment on table public.profiles is 'Perfis e cargos dos usuários do sistema da loja';
comment on column public.profiles.id is 'Chave primária associada ao id em auth.users';
comment on column public.profiles.role is 'Papel do usuário: admin (administrador), manager (gerente), cashier (operador de caixa)';
comment on column public.profiles.active is 'Status de ativação do usuário no sistema';

-- 2. Índices para otimização de consultas frequentes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_active on public.profiles(active);

-- 3. Função e Trigger para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- 4. Função e Trigger para criar perfil automaticamente na criação do usuário em auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'cashier'),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- 5. Configuração de Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Política 1: Usuários autenticados podem visualizar seu próprio perfil
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Política 2: Administradores ativos podem visualizar todos os perfis
create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and active = true
    )
  );

-- Política 3: Usuários autenticados podem atualizar seus próprios dados de perfil
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Política 4: Administradores ativos podem atualizar perfis de outros usuários
create policy "Admins can update any profile"
  on public.profiles
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and active = true
    )
  );
