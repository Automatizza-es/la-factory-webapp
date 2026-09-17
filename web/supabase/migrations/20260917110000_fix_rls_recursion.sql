-- auth_contact_id() and auth_is_admin() both query `users`, but `users`
-- has its own RLS SELECT policy that calls auth_is_admin() -- since
-- neither function was SECURITY DEFINER, that inner query ran under the
-- caller's own RLS, re-entering the same policy and recursing until
-- Postgres hit "stack depth limit exceeded". Whether this actually
-- triggered depended on query-plan evaluation order (OR isn't guaranteed
-- left-to-right for arbitrary functions), which is why it only surfaced
-- for some accounts/queries and not others.
--
-- Fix: make both helpers SECURITY DEFINER so their internal `users` lookup
-- runs as the function owner and bypasses RLS entirely, breaking the
-- recursion for good.

create or replace function auth_contact_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select contact_id from users where id = auth.uid();
$$;

create or replace function auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from users where id = auth.uid()), false);
$$;
