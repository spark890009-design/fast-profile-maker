import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { entryAmount, inr, todayISO, useEntries, usePayments, type Payment } from "@/lib/milk/store";

export default function Payments() {
  const { entries } = useEntries();
  const { payments, save, remove } = usePayments();

  const [editing, setEditing] = useState<Payment | null>(null);
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const totalBill = entries.reduce((s, e) => s + entryAmount(e), 0);
  const paidInEntries = entries.reduce((s, e) => s + (e.paidAmount || 0), 0);
  const paidSeparate = payments.reduce((s, p) => s + p.amount, 0);
  const totalPaid = paidInEntries + paidSeparate;

  const reset = () => {
    setEditing(null);
    setDate(todayISO());
    setAmount("");
    setNote("");
  };

  const onSave = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Amount daalein");
    save({ id: editing?.id || crypto.randomUUID(), date, amount: amt, note: note.trim() || undefined });
    toast.success(editing ? "Payment updated" : "Payment added");
    reset();
  };

  const onEdit = (p: Payment) => {
    setEditing(p);
    setDate(p.date);
    setAmount(String(p.amount));
    setNote(p.note || "");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total bill</p>
          <p className="text-lg font-display font-bold">{inr(totalBill)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-lg font-display font-bold text-primary">{inr(totalPaid)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-lg font-display font-bold text-destructive">{inr(totalBill - totalPaid)}</p>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{editing ? "Edit payment" : "Add payment"}</p>
          {editing && (
            <Button variant="ghost" size="icon" onClick={reset} aria-label="Cancel edit">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="pdate">Date</Label>
            <Input id="pdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pamt">Amount</Label>
            <Input id="pamt" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pnote">Note</Label>
          <Input id="pnote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </div>
        <Button className="w-full h-12" onClick={onSave}>
          {editing ? "Update payment" : "Add payment"}
        </Button>
      </Card>

      <div className="space-y-2">
        <p className="font-semibold">Payment history</p>
        {payments.length === 0 && <p className="text-sm text-muted-foreground">Abhi koi payment nahi.</p>}
        {payments.map((p) => (
          <Card key={p.id} className="p-3 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-lg">{inr(p.amount)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                {p.note ? ` · ${p.note}` : ""}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(p)} aria-label="Edit payment">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => {
                  remove(p.id);
                  toast.success("Payment deleted");
                }}
                aria-label="Delete payment"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
