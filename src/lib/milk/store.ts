import { useCallback, useEffect, useState } from "react";

export interface MilkEntry {
  id: string;
  /** yyyy-mm-dd */
  date: string;
  taken: boolean;
  litres: number;
  pricePerLitre: number;
  status: "paid" | "unpaid" | "partial";
  paidAmount: number;
  notes?: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

const KEYS = {
  entries: "milk.entries",
  payments: "milk.payments",
  defaults: "milk.defaults",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("milk-store", { detail: key }));
}

function useSlice<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    window.addEventListener("milk-store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("milk-store", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((next: T) => write(key, next), [key]);
  return [value, set] as const;
}

export const entryAmount = (e: MilkEntry) => (e.taken ? e.litres * e.pricePerLitre : 0);

export function useEntries() {
  const [entries, setEntries] = useSlice<MilkEntry[]>(KEYS.entries, []);

  const save = (entry: MilkEntry) => {
    const rest = entries.filter((e) => e.id !== entry.id && e.date !== entry.date);
    setEntries([...rest, entry].sort((a, b) => a.date.localeCompare(b.date)));
  };
  const remove = (id: string) => setEntries(entries.filter((e) => e.id !== id));
  const byDate = (date: string) => entries.find((e) => e.date === date);

  return { entries, save, remove, byDate };
}

export function usePayments() {
  const [payments, setPayments] = useSlice<Payment[]>(KEYS.payments, []);
  const save = (p: Payment) => {
    const rest = payments.filter((x) => x.id !== p.id);
    setPayments([...rest, p].sort((a, b) => b.date.localeCompare(a.date)));
  };
  const remove = (id: string) => setPayments(payments.filter((p) => p.id !== id));
  return { payments, save, remove };
}

export interface MilkDefaults {
  litres: number;
  pricePerLitre: number;
}

export function useDefaults() {
  const [defaults, setDefaults] = useSlice<MilkDefaults>(KEYS.defaults, { litres: 1, pricePerLitre: 60 });
  return { defaults, setDefaults };
}

export const monthKey = (d: Date | string) =>
  typeof d === "string" ? d.slice(0, 7) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export function useMonthSummary(month: string) {
  const { entries } = useEntries();
  const { payments } = usePayments();

  const monthEntries = entries.filter((e) => e.date.startsWith(month));
  const monthPayments = payments.filter((p) => p.date.startsWith(month));

  const takenDays = monthEntries.filter((e) => e.taken).length;
  const noMilkDays = monthEntries.filter((e) => !e.taken).length;
  const litres = monthEntries.reduce((s, e) => s + (e.taken ? e.litres : 0), 0);
  const bill = monthEntries.reduce((s, e) => s + entryAmount(e), 0);
  const paidInEntries = monthEntries.reduce((s, e) => s + (e.paidAmount || 0), 0);
  const paidSeparate = monthPayments.reduce((s, p) => s + p.amount, 0);
  const paid = paidInEntries + paidSeparate;

  const [y, m] = month.split("-").map(Number);
  const totalDays = new Date(y, m, 0).getDate();

  return {
    totalDays,
    takenDays,
    noMilkDays,
    litres,
    bill,
    paid,
    balance: bill - paid,
    monthEntries,
    monthPayments,
  };
}

export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

export const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
};
