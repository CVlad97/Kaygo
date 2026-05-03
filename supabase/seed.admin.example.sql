-- Secure admin seed template.
-- Do not commit real passwords or hashes.
-- Generate the password_hash through the kaygo-api PBKDF2 helper or a secure internal script,
-- then run this manually in Supabase SQL editor for the target project.

insert into public.kaygo_users (
  email,
  password_hash,
  role,
  first_name,
  last_name,
  verification_status
) values (
  'admin@example.invalid',
  'pbkdf2$120000$REPLACE_WITH_BASE64URL_SALT$REPLACE_WITH_BASE64URL_HASH',
  'admin',
  'Admin',
  'KayGo',
  'verified'
)
on conflict (email) do update set
  password_hash = excluded.password_hash,
  role = 'admin',
  verification_status = 'verified',
  updated_at = now();
