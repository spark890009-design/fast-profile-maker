DROP POLICY IF EXISTS "Admins insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins update settings" ON public.app_settings;

CREATE POLICY "Primary admin inserts settings" ON public.app_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_primary_admin(auth.uid()));

CREATE POLICY "Primary admin updates settings" ON public.app_settings
FOR UPDATE TO authenticated
USING (public.is_primary_admin(auth.uid()))
WITH CHECK (public.is_primary_admin(auth.uid()));