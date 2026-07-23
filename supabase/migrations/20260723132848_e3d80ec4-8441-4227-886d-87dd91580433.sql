DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.withdrawals REPLICA IDENTITY FULL;
ALTER TABLE public.wallets REPLICA IDENTITY FULL;