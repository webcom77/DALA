-- ==============================================================================
-- CRIAÇÃO DO USUÁRIO ADMINISTRADOR NO SUPABASE
-- Arquivo: supabase/seed_admin.sql
-- Credenciais:
--   E-mail: admin@dala.com.br
--   Senha:  admin123
-- ==============================================================================

do $$
declare
  new_user_id uuid := gen_random_uuid();
begin
  -- Insere o usuário na tabela auth.users se ainda não existir
  if not exists (select 1 from auth.users where email = 'admin@dala.com.br') then
    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    ) values (
      new_user_id,
      '00000000-0000-00-00-00-000000000000',
      'admin@dala.com.br',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrador DALA","role":"admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated',
      encode(gen_random_bytes(32), 'hex')
    );

    -- Insere ou atualiza o perfil em public.profiles
    insert into public.profiles (id, full_name, role, active, created_at, updated_at)
    values (new_user_id, 'Administrador DALA', 'admin', true, now(), now())
    on conflict (id) do update set
      full_name = 'Administrador DALA',
      role = 'admin',
      active = true;
  end if;
end $$;
