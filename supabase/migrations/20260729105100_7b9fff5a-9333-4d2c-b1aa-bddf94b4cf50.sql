
CREATE OR REPLACE FUNCTION public.request_withdrawal(_upi_id text, _amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal numeric;
  _new_bal numeric;
  _blocked boolean;
  _wid uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount IS NULL OR _amount < 10 THEN RAISE EXCEPTION 'Minimum withdrawal is 10'; END IF;
  IF _upi_id IS NULL OR _upi_id !~ '^[\w.\-]+@[\w.\-]+$' THEN RAISE EXCEPTION 'Invalid UPI ID'; END IF;

  SELECT blocked INTO _blocked FROM public.profiles WHERE id = _uid;
  IF _blocked THEN RAISE EXCEPTION 'Account is blocked'; END IF;

  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _bal IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  _new_bal := ROUND(_bal - _amount, 2);
  UPDATE public.wallets SET balance = _new_bal, updated_at = now() WHERE user_id = _uid;

  INSERT INTO public.withdrawals (user_id, upi_id, amount, status)
    VALUES (_uid, _upi_id, _amount, 'pending')
    RETURNING id INTO _wid;

  INSERT INTO public.wallet_transactions (user_id, amount, type, note)
    VALUES (_uid, _amount, 'debit', 'Withdrawal pending (' || _upi_id || ')');

  INSERT INTO public.notifications (user_id, title, message)
    VALUES (_uid, 'Withdrawal Requested',
      'Your withdrawal of ₹' || _amount || ' to ' || _upi_id || ' is pending. Balance debited. New balance: ₹' || _new_bal);

  RETURN _wid;
END;
$$;

REVOKE ALL ON FUNCTION public.request_withdrawal(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(text, numeric) TO authenticated;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own subscriptions"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://hxlhcbsyvkiambmgtyll.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'message', NEW.message,
      'id', NEW.id
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_push_on_notification ON public.notifications;
CREATE TRIGGER trg_push_on_notification
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_notification();
