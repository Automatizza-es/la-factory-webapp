-- Community board. Mutations and reply notifications are atomic RPCs.
create table public.board_posts (
  id uuid primary key,
  author_contact_id uuid not null references public.contacts(id),
  author_name text not null,
  title text not null check (length(trim(title)) between 1 and 160),
  body text not null check (length(trim(body)) between 1 and 10000),
  attachments jsonb not null default '[]' check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 6),
  status text not null default 'active' check (status in ('active', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.board_comments (
  id uuid primary key,
  post_id uuid not null references public.board_posts(id) on delete cascade,
  author_contact_id uuid not null references public.contacts(id),
  author_name text not null,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index board_posts_status_created_idx on public.board_posts(status, created_at desc, id);
create index board_comments_post_idx on public.board_comments(post_id, created_at, id);
alter table public.board_posts enable row level security;
alter table public.board_comments enable row level security;

create policy "board posts: community or admin archive" on public.board_posts
  for select to authenticated using (
    public.auth_contact_id() is not null and (status <> 'archived' or public.auth_is_admin())
  );
create policy "board comments: visible post" on public.board_comments
  for select to authenticated using (exists (select 1 from public.board_posts p where p.id = post_id));
grant select on public.board_posts, public.board_comments to authenticated;
grant all on public.board_posts, public.board_comments to service_role;

create function public.board_can_write()
returns boolean language sql stable security definer set search_path = public as $$
  select auth_contact_id() is not null and (
    auth_is_admin() or (active_membership(auth_contact_id(), (now() at time zone 'Europe/Madrid')::date)).id is not null
  );
$$;
revoke all on function public.board_can_write() from public, anon;
grant execute on function public.board_can_write() to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('board', 'board', false, 10485760, array[
  'image/jpeg','image/png','image/webp','application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text','text/plain'
]);

create policy "board files: writer uploads own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'board' and public.board_can_write()
    and (storage.foldername(name))[1] = public.auth_contact_id()::text
  );
create policy "board files: visible post or own staging" on storage.objects
  for select to authenticated using (
    bucket_id = 'board' and public.auth_contact_id() is not null and (
      public.auth_is_admin() or
      (storage.foldername(name))[1] = public.auth_contact_id()::text or
      exists (select 1 from public.board_posts p, jsonb_array_elements(p.attachments) a where a->>'path' = name)
    )
  );
-- Bypasses post RLS solely for reference checks, so even an archived post
-- retains its files when its author can no longer read the post.
create function public.board_file_referenced(p_path text)
returns boolean language plpgsql volatile security definer set search_path = public as $$
begin
  -- Serialize cleanup with post saves so a failed/retried upload cannot
  -- delete an attachment while another request is publishing it.
  perform pg_advisory_xact_lock(hashtextextended(split_part(p_path, '/', 2), 0));
  return exists (
    select 1 from board_posts p, jsonb_array_elements(p.attachments) a where a->>'path' = p_path
  );
end;
$$;
revoke all on function public.board_file_referenced(text) from public, anon;
grant execute on function public.board_file_referenced(text) to authenticated;

create policy "board files: unreferenced only" on storage.objects
  for delete to authenticated using (
    bucket_id = 'board' and public.auth_contact_id() is not null
    and (public.auth_is_admin() or (storage.foldername(name))[1] = public.auth_contact_id()::text)
    and not public.board_file_referenced(name)
  );

create function public.save_board_post(
  p_id uuid, p_title text, p_body text, p_attachments jsonb,
  p_expected_updated_at timestamptz default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_old board_posts;
  v_file jsonb;
  v_name text;
  v_documents integer := 0;
begin
  if auth_contact_id() is null then raise exception 'NOT_AUTHORIZED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into v_old from board_posts where id = p_id for update;
  if v_old.id is null then
    if not board_can_write() or p_expected_updated_at is not null then raise exception 'NOT_AUTHORIZED'; end if;
  else
    if not (auth_is_admin() or (v_old.author_contact_id = auth_contact_id() and v_old.status <> 'archived')) then
      raise exception 'NOT_AUTHORIZED';
    end if;
    if p_expected_updated_at is distinct from v_old.updated_at then raise exception 'BOARD_CONFLICT'; end if;
  end if;
  if p_title is null or length(trim(p_title)) not between 1 and 160
    or p_body is null or length(trim(p_body)) not between 1 and 10000
    or p_attachments is null or jsonb_typeof(p_attachments) <> 'array' then raise exception 'BOARD_INVALID'; end if;
  if jsonb_array_length(p_attachments) > 6 then raise exception 'BOARD_INVALID'; end if;
  if (select count(distinct a->>'path') from jsonb_array_elements(p_attachments) a) <> jsonb_array_length(p_attachments) then
    raise exception 'BOARD_INVALID';
  end if;
  for v_file in select * from jsonb_array_elements(p_attachments) loop
    if jsonb_typeof(v_file->'name') is distinct from 'string' or length(v_file->>'name') not between 1 and 255
      or jsonb_typeof(v_file->'path') is distinct from 'string' then raise exception 'BOARD_INVALID'; end if;
    -- Existing attachments can be retained by an editor, new ones must be uploaded by this caller.
    if not exists (select 1 from jsonb_array_elements(coalesce(v_old.attachments, '[]')) a where a = v_file)
      and (v_file->>'path') not like auth_contact_id()::text || '/' || p_id::text || '/%' then
      raise exception 'NOT_AUTHORIZED';
    end if;
    if not exists (select 1 from storage.objects o where o.bucket_id = 'board' and o.name = v_file->>'path'
      and o.metadata->>'mimetype' = v_file->>'type'
      and (o.metadata->>'size')::bigint between 1 and 10485760) then raise exception 'BOARD_INVALID_FILE'; end if;
    if v_file->>'type' not in ('image/jpeg','image/png','image/webp') then v_documents := v_documents + 1; end if;
  end loop;
  if v_documents > 1 or jsonb_array_length(p_attachments) - v_documents > 5 then raise exception 'BOARD_INVALID'; end if;
  if v_old.id is null then
    select concat_ws(' ', first_name, last_name) into v_name from contacts where id = auth_contact_id();
    insert into board_posts(id, author_contact_id, author_name, title, body, attachments)
      values(p_id, auth_contact_id(), v_name, trim(p_title), trim(p_body), p_attachments);
  else
    update board_posts set title = trim(p_title), body = trim(p_body), attachments = p_attachments, updated_at = clock_timestamp()
      where id = p_id;
  end if;
  return p_id;
end;
$$;

create function public.change_board_post(p_id uuid, p_status text, p_expected_updated_at timestamptz)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_post board_posts;
begin
  if auth_contact_id() is null then raise exception 'NOT_AUTHORIZED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into v_post from board_posts where id = p_id for update;
  if v_post.id is null then raise exception 'BOARD_NOT_FOUND'; end if;
  if not auth_is_admin() and not (
    v_post.author_contact_id = auth_contact_id() and v_post.status = 'active' and p_status = 'closed'
  ) then raise exception 'NOT_AUTHORIZED'; end if;
  if p_expected_updated_at is distinct from v_post.updated_at then raise exception 'BOARD_CONFLICT'; end if;
  if p_status = 'deleted' then
    delete from notifications where type = 'board_reply' and related_id in (select id from board_comments where post_id = p_id);
    delete from board_posts where id = p_id;
    return v_post.attachments;
  end if;
  if p_status not in ('active', 'closed', 'archived') or p_status is null then raise exception 'BOARD_INVALID'; end if;
  update board_posts set status = p_status, updated_at = clock_timestamp() where id = p_id;
  return '[]'::jsonb;
end;
$$;

create function public.reply_board_post(p_id uuid, p_post_id uuid, p_body text)
returns table (id uuid, notify_contact_id uuid, author_is_admin boolean, post_title text)
language plpgsql security definer set search_path = public as $$
declare v_post board_posts; v_comment board_comments; v_name text; v_admin boolean;
begin
  if not board_can_write() then raise exception 'NOT_AUTHORIZED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_post_id::text, 0));
  select * into v_post from board_posts where board_posts.id = p_post_id for update;
  if v_post.id is null then raise exception 'BOARD_NOT_FOUND'; end if;
  select * into v_comment from board_comments where board_comments.id = p_id;
  if v_comment.id is not null then
    if v_comment.author_contact_id <> auth_contact_id() or v_comment.post_id <> p_post_id or v_comment.body <> trim(p_body) then
      raise exception 'BOARD_CONFLICT';
    end if;
    return query select v_comment.id, null::uuid, false, v_post.title;
    return;
  end if;
  if v_post.status <> 'active' then raise exception 'BOARD_CLOSED'; end if;
  if p_body is null or length(trim(p_body)) not between 1 and 4000 then raise exception 'BOARD_INVALID'; end if;
  select concat_ws(' ', first_name, last_name) into v_name from contacts where contacts.id = auth_contact_id();
  insert into board_comments(id, post_id, author_contact_id, author_name, body)
    values(p_id, p_post_id, auth_contact_id(), v_name, trim(p_body));
  if v_post.author_contact_id <> auth_contact_id()
    and exists (select 1 from contacts c join users u on u.contact_id = c.id where c.id = v_post.author_contact_id and c.status = 'active') then
    select exists(select 1 from users u where u.contact_id = v_post.author_contact_id and u.role = 'admin') into v_admin;
    insert into notifications(recipient_contact_id, type, title, body, link_path, related_id)
      values(v_post.author_contact_id, 'board_reply', v_post.title, trim(p_body),
        case when v_admin then '/admin/tablon/' else '/tablon/' end || p_post_id::text || '?comment=' || p_id::text || '#comment-' || p_id::text, p_id);
    return query select p_id, v_post.author_contact_id, v_admin, v_post.title;
  else
    return query select p_id, null::uuid, false, v_post.title;
  end if;
end;
$$;

-- Invoker security applies the same visibility rules to search and comments.
create function public.search_board(p_query text default '', p_status text default 'all', p_offset integer default 0)
returns table (
  id uuid, author_name text, title text, body text, status text, created_at timestamptz,
  comment_count bigint, comment_match text
) language sql stable security invoker set search_path = public as $$
  select p.id, p.author_name, p.title, p.body, p.status, p.created_at,
    (select count(*) from board_comments c where c.post_id = p.id),
    (select substring(c.body from greatest(1, strpos(lower(c.body), lower(trim(p_query))) - 80) for 300) from board_comments c where c.post_id = p.id
      and length(trim(coalesce(p_query,''))) > 0 and strpos(lower(c.body), lower(trim(p_query))) > 0
      order by c.created_at, c.id limit 1)
  from board_posts p
  where (case when p_status = 'archived' then p.status = 'archived'
    when p_status in ('active','closed') then p.status = p_status else p.status <> 'archived' end)
    and (length(trim(coalesce(p_query,''))) = 0
      or strpos(lower(p.title || ' ' || p.body), lower(trim(p_query))) > 0
      or exists(select 1 from board_comments c where c.post_id = p.id and strpos(lower(c.body), lower(trim(p_query))) > 0))
  order by p.created_at desc, p.id desc
  limit 21 offset greatest(0, least(coalesce(p_offset,0),100000));
$$;

revoke all on function public.save_board_post(uuid,text,text,jsonb,timestamptz) from public, anon;
revoke all on function public.change_board_post(uuid,text,timestamptz) from public, anon;
revoke all on function public.reply_board_post(uuid,uuid,text) from public, anon;
revoke all on function public.search_board(text,text,integer) from public, anon;
grant execute on function public.save_board_post(uuid,text,text,jsonb,timestamptz) to authenticated;
grant execute on function public.change_board_post(uuid,text,timestamptz) to authenticated;
grant execute on function public.reply_board_post(uuid,uuid,text) to authenticated;
grant execute on function public.search_board(text,text,integer) to authenticated;

-- Locate a reply even when newer replies have moved it to another page.
create function public.board_reply_page(p_id uuid)
returns integer language sql stable security invoker set search_path = public as $$
  select ((select count(*) from board_comments newer where newer.post_id = c.post_id
    and (newer.created_at, newer.id) > (c.created_at, c.id)) / 50 + 1)::integer
  from board_comments c where c.id = p_id;
$$;
revoke all on function public.board_reply_page(uuid) from public, anon;
grant execute on function public.board_reply_page(uuid) to authenticated;
