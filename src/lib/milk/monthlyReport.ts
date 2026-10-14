import jsPDF from "jspdf";
import { entryAmount, monthLabel, type Entry, type PaymentRow } from "@/lib/milk/data";

export type MonthlyReportTotals = {
  bill: number;
  paid: number;
  balance: number;
  litres: number;
  milkDays: number;
  noMilkDays: number;
};

export function getMonthlyReportTotals(
  entries: Entry[],
  payments: PaymentRow[],
  month: string,
): MonthlyReportTotals {
  const monthEntries = entries.filter((entry) => entry.entry_date.startsWith(month));
  const monthPayments = payments.filter((payment) => payment.pay_date.startsWith(month));
  const bill = monthEntries.reduce((sum, entry) => sum + entryAmount(entry), 0);
  const paid = monthEntries.reduce((sum, entry) => sum + Number(entry.paid_amount || 0), 0)
    + monthPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return {
    bill,
    paid,
    balance: bill - paid,
    litres: monthEntries.reduce((sum, entry) => sum + (entry.taken ? Number(entry.litres) : 0), 0),
    milkDays: monthEntries.filter((entry) => entry.taken).length,
    noMilkDays: monthEntries.filter((entry) => !entry.taken).length,
  };
}

const rupees = (amount: number) => `Rs. ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function downloadMonthlyDairyReport(
  dairyName: string,
  month: string,
  entries: Entry[],
  payments: PaymentRow[],
) {
  const doc = new jsPDF();
  const totals = getMonthlyReportTotals(entries, payments, month);
  const monthEntries = entries.filter((entry) => entry.entry_date.startsWith(month)).sort((a, b) => a.entry_date.localeCompare(b.entry_date));
  const monthPayments = payments.filter((payment) => payment.pay_date.startsWith(month)).sort((a, b) => a.pay_date.localeCompare(b.pay_date));

  doc.setFontSize(18);
  doc.text("Pandey Dhoodh Dairy", 14, 18);
  doc.setFontSize(13);
  doc.text("Monthly Milk & Payment Report", 14, 27);
  doc.setFontSize(11);
  doc.text(`${dairyName}  |  ${monthLabel(month)}`, 14, 36);

  doc.setFontSize(11);
  doc.text(`Total bill: ${rupees(totals.bill)}`, 14, 49);
  doc.text(`Payments received: ${rupees(totals.paid)}`, 14, 57);
  doc.text(`Balance remaining: ${rupees(totals.balance)}`, 14, 65);
  doc.text(`Milk: ${totals.litres.toLocaleString("en-IN")} L  |  Milk days: ${totals.milkDays}  |  No-milk days: ${totals.noMilkDays}`, 14, 73);

  let y = 86;
  const ensureSpace = () => {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
  };
  doc.setFontSize(12);
  doc.text("Daily entries", 14, y);
  y += 8;
  doc.setFontSize(9);
  if (monthEntries.length === 0) {
    doc.text("No milk entries for this month.", 14, y);
    y += 7;
  }
  for (const entry of monthEntries) {
    ensureSpace();
    const summary = entry.taken
      ? `${entry.litres} L x ${rupees(entry.rate)}/L | Bill ${rupees(entryAmount(entry))} | Paid ${rupees(entry.paid_amount)}`
      : "No milk";
    doc.text(`${entry.entry_date}  ${summary}`, 14, y);
    y += 6;
  }

  y += 5;
  ensureSpace();
  doc.setFontSize(12);
  doc.text("Separate payments", 14, y);
  y += 8;
  doc.setFontSize(9);
  if (monthPayments.length === 0) {
    doc.text("No separate payments for this month.", 14, y);
  } else {
    for (const payment of monthPayments) {
      ensureSpace();
      doc.text(`${payment.pay_date}  ${rupees(payment.amount)}${payment.note ? `  |  ${payment.note}` : ""}`, 14, y);
      y += 6;
    }
  }

  const safeName = dairyName.trim().replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-|-$/g, "") || "dairy";
  doc.save(`${safeName}-${month}-report.pdf`);
}