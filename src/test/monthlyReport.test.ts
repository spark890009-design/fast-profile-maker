import { describe, expect, it } from "vitest";
import { getMonthlyReportTotals } from "@/lib/milk/monthlyReport";
import type { Entry, PaymentRow } from "@/lib/milk/data";

describe("monthly dairy report totals", () => {
  it("includes only the selected month's bill and both payment types", () => {
    const entries: Entry[] = [
      { id: "e1", dairy_id: "d1", entry_date: "2026-10-01", taken: true, litres: 2, rate: 60, status: "partial", paid_amount: 40, notes: null },
      { id: "e2", dairy_id: "d1", entry_date: "2026-10-02", taken: true, litres: 3, rate: 70, status: "unpaid", paid_amount: 0, notes: null },
      { id: "e3", dairy_id: "d1", entry_date: "2026-10-03", taken: false, litres: 0, rate: 70, status: "unpaid", paid_amount: 0, notes: null },
      { id: "e4", dairy_id: "d1", entry_date: "2026-09-30", taken: true, litres: 1, rate: 100, status: "paid", paid_amount: 100, notes: null },
    ];
    const payments: PaymentRow[] = [
      { id: "p1", dairy_id: "d1", pay_date: "2026-10-05", amount: 100, note: null },
      { id: "p2", dairy_id: "d1", pay_date: "2026-09-30", amount: 100, note: null },
    ];

    expect(getMonthlyReportTotals(entries, payments, "2026-10")).toEqual({
      bill: 330,
      paid: 140,
      balance: 190,
      litres: 5,
      milkDays: 2,
      noMilkDays: 1,
    });
  });
});