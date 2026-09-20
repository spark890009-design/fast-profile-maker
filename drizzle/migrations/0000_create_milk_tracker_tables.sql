CREATE TABLE public.dairies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  owner_name text,
  phone text,
  default_litres numeric NOT NULL DEFAULT 1,
  default_rate numeric NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dairies TO authenticated;
GRANT ALL ON public.dairies TO service_role;
ALTER TABLE public.dairies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dairies" ON public.dairies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.milk_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dairy_id uuid NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  taken boolean NOT NULL DEFAULT true,
  litres numeric NOT NULL DEFAULT 0,
  rate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid',
  paid_amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dairy_id, entry_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.milk_entries TO authenticated;
GRANT ALL ON public.milk_entries TO service_role;
ALTER TABLE public.milk_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entries" ON public.milk_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.milk_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dairy_id uuid NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
  pay_date date NOT NULL,
  amount numeric NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.milk_payments TO authenticated;
GRANT ALL ON public.milk_payments TO service_role;
ALTER TABLE public.milk_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own payments" ON public.milk_payments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER milk_entries_touch BEFORE UPDATE ON public.milk_entries
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();