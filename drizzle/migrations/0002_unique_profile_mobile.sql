CREATE UNIQUE INDEX IF NOT EXISTS profiles_mobile_unique_nonempty
ON public.profiles (mobile)
WHERE mobile <> '';