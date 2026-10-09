-- Comunicados: an admin writes a notice (optionally in ES / CA / EN) and
-- sends it to everyone, a group or hand-picked people. Each recipient gets
-- an in-app notification (type 'announcement') pointing here, so the bell
-- can show it in their own language; push and the optional email are sent
-- from the app. There's no announcements list in the UI: the table only
-- holds the text the notifications point to.

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title_es text,
  body_es text,
  title_ca text,
  body_ca text,
  title_en text,
  body_en text,
  audience_type text not null check (audience_type in ('all', 'coworkers', 'guests', 'plan', 'contacts')),
  audience_plan_id uuid references plans (id),
  send_email boolean not null default false,
  recipient_count integer not null default 0,
  sent_by uuid references contacts (id),
  created_at timestamptz not null default now(),
  constraint announcements_has_text check (
    (coalesce(title_es, '') <> '' and coalesce(body_es, '') <> '') or
    (coalesce(title_ca, '') <> '' and coalesce(body_ca, '') <> '') or
    (coalesce(title_en, '') <> '' and coalesce(body_en, '') <> '')
  )
);

alter table announcements enable row level security;

-- Admins, and anyone it was sent to (they have a notification for it).
create policy "announcements: recipients or admin" on announcements
  for select using (
    auth_is_admin() or exists (
      select 1 from notifications n
      where n.type = 'announcement'
        and n.related_id = announcements.id
        and n.recipient_contact_id = auth_contact_id()
    )
  );

grant select on announcements to authenticated;
grant select, insert, update, delete on announcements to service_role;
