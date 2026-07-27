
-- Backfill existing profiles: SPKxxxx -> 8-digit numeric padded, prefixed with 1000 to guarantee 8 digits
UPDATE public.profiles
SET user_id = LPAD((10000000 + (regexp_replace(user_id, '\D', '', 'g'))::bigint % 10000000)::text, 8, '0')
WHERE user_id !~ '^\d{8}$';

-- Update trigger to emit 8-digit numeric IDs going forward
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_uid TEXT;
  admin_email TEXT := 'rajpandey565758@gmail.com';
BEGIN
  new_uid := LPAD((10000000 + nextval('public.spk_user_seq'))::text, 8, '0');
  INSERT INTO public.profiles (id, user_id, full_name, email, mobile)
  VALUES (
    NEW.id,
    new_uid,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mobile', '')
  );
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0);
  IF NEW.email = admin_email THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
