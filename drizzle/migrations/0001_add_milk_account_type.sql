ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'customer';

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_account_type_valid
CHECK (account_type IN ('shop', 'customer'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_uid TEXT;
  admin_email TEXT := 'rajpandey565758@gmail.com';
  selected_account_type TEXT;
BEGIN
  new_uid := LPAD((10000000 + nextval('public.spk_user_seq'))::text, 8, '0');
  selected_account_type := CASE
    WHEN NEW.raw_user_meta_data->>'account_type' = 'shop' THEN 'shop'
    ELSE 'customer'
  END;
  INSERT INTO public.profiles (id, user_id, full_name, email, mobile, account_type)
  VALUES (
    NEW.id,
    new_uid,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    selected_account_type
  );
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0);
  IF lower(NEW.email) = admin_email THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;