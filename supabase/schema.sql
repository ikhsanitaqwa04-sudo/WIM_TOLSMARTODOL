-- TOLSMART-ODOL Supabase Auth + role-based access
-- Jalankan seluruh skrip ini di Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  role text not null default 'observer' check (role in ('admin','operator','observer')),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id,email,full_name,role,approval_status)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),'observer','pending')
  on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
create or replace function public.current_user_role()
returns text language sql stable security definer set search_path=public
as $$
 select role from public.profiles where id=auth.uid() and approval_status='approved' limit 1;
$$;
create or replace function public.current_user_approved()
returns boolean language sql stable security definer set search_path=public
as $$
 select exists(select 1 from public.profiles where id=auth.uid() and approval_status='approved');
$$;
drop policy if exists "Read own profile or admin" on public.profiles;
create policy "Read own profile or admin" on public.profiles
for select to authenticated using (id=auth.uid() or public.current_user_role()='admin');
drop policy if exists "Admin manage profiles" on public.profiles;
create policy "Admin manage profiles" on public.profiles
for update to authenticated using (public.current_user_role()='admin')
with check (public.current_user_role()='admin');
-- Bootstrap: setelah akun pertama mendaftar dan email terkonfirmasi,
-- jalankan query ini dengan email akun pemilik proyek:
-- update public.profiles set role='admin', approval_status='approved'
-- where email='EMAIL_ADMIN_KAMU';
-- Persetujuan akun lain:
-- update public.profiles set role='operator', approval_status='approved'
-- where email='EMAIL_PETUGAS';
-- update public.profiles set role='observer', approval_status='approved'
-- where email='EMAIL_PENGAMAT';
