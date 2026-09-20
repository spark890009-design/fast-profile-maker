import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Dairy {
  id: string;
  name: string;
  owner_name: string | null;
  phone: string | null;
  default_litres: number;
  default_rate: number;
}

export interface Entry {
  id: string;
  dairy_id: string;
  entry_date: string;
  taken: boolean;
  litres: number;
  rate: number;
  status: "paid" | "unpaid" | "partial";
  paid_amount: number;
  notes: string | null;
}

export interface PaymentRow {
  id: string;
  dairy_id: string;
  pay_date: string;
  amount: number;
  note: string | null;
}

export const inr = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const monthKey = (d: Date | string) =>
  typeof d === "string" ? d.slice(0, 7) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

export const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
};

export const entryAmount = (e: Entry) => (e.taken ? Number(e.litres) * Number(e.rate) : 0);

const SELECTED_KEY = "milk.selectedDairy";
export const getSelectedDairy = () => localStorage.getItem(SELECTED_KEY);
export const setSelectedDairy = (id: string) => {
  localStorage.setItem(SELECTED_KEY, id);
  window.dispatchEvent(new CustomEvent("milk-dairy"));
};

export function useDairies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dairies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dairies")
        .select("id,name,owner_name,phone,default_litres,default_rate")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Dairy[];
    },
  });
}

export function useSaveDairy() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Partial<Dairy> & { name: string }) => {
      if (!user) throw new Error("not signed in");
      const row = {
        name: d.name,
        owner_name: d.owner_name ?? null,
        phone: d.phone ?? null,
        default_litres: d.default_litres ?? 1,
        default_rate: d.default_rate ?? 60,
        user_id: user.id,
      };
      if (d.id) {
        const { error } = await supabase.from("dairies").update(row).eq("id", d.id);
        if (error) throw error;
        return d.id;
      }
      const { data, error } = await supabase.from("dairies").insert(row).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairies"] }),
  });
}

export function useDeleteDairy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dairies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairies"] });
      qc.invalidateQueries({ queryKey: ["entries"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useEntries(dairyId?: string | null) {
  return useQuery({
    queryKey: ["entries", dairyId],
    enabled: !!dairyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milk_entries")
        .select("id,dairy_id,entry_date,taken,litres,rate,status,paid_amount,notes")
        .eq("dairy_id", dairyId!)
        .order("entry_date");
      if (error) throw error;
      return (data ?? []) as Entry[];
    },
  });
}

export function useSaveEntry() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: Omit<Entry, "id"> & { id?: string }) => {
      if (!user) throw new Error("not signed in");
      const row = {
        user_id: user.id,
        dairy_id: e.dairy_id,
        entry_date: e.entry_date,
        taken: e.taken,
        litres: e.litres,
        rate: e.rate,
        status: e.status,
        paid_amount: e.paid_amount,
        notes: e.notes,
      };
      const { error } = await supabase.from("milk_entries").upsert(row, { onConflict: "dairy_id,entry_date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("milk_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function usePayments(dairyId?: string | null) {
  return useQuery({
    queryKey: ["payments", dairyId],
    enabled: !!dairyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milk_payments")
        .select("id,dairy_id,pay_date,amount,note")
        .eq("dairy_id", dairyId!)
        .order("pay_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PaymentRow[];
    },
  });
}

export function useSavePayment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<PaymentRow, "id"> & { id?: string }) => {
      if (!user) throw new Error("not signed in");
      const row = {
        user_id: user.id,
        dairy_id: p.dairy_id,
        pay_date: p.pay_date,
        amount: p.amount,
        note: p.note,
      };
      if (p.id) {
        const { error } = await supabase.from("milk_payments").update(row).eq("id", p.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("milk_payments").insert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("milk_payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function summarise(entries: Entry[], payments: PaymentRow[], month?: string) {
  const es = month ? entries.filter((e) => e.entry_date.startsWith(month)) : entries;
  const ps = month ? payments.filter((p) => p.pay_date.startsWith(month)) : payments;

  const takenDays = es.filter((e) => e.taken).length;
  const noMilkDays = es.filter((e) => !e.taken).length;
  const litres = es.reduce((s, e) => s + (e.taken ? Number(e.litres) : 0), 0);
  const bill = es.reduce((s, e) => s + entryAmount(e), 0);
  const paid =
    es.reduce((s, e) => s + Number(e.paid_amount || 0), 0) + ps.reduce((s, p) => s + Number(p.amount), 0);

  let totalDays = 0;
  if (month) {
    const [y, m] = month.split("-").map(Number);
    totalDays = new Date(y, m, 0).getDate();
  }

  return { entries: es, payments: ps, takenDays, noMilkDays, litres, bill, paid, balance: bill - paid, totalDays };
}
