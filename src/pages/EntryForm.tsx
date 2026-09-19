import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { inr, todayISO, useDefaults, useEntries, type MilkEntry } from "@/lib/milk/store";

export default function EntryForm() {
  const { date: routeDate } = useParams();
  const navigate = useNavigate();
  const { byDate, save, remove } = useEntries();
  const { defaults, setDefaults } = useDefaults();

  const [date, setDate] = useState(routeDate || todayISO());
  const [taken, setTaken] = useState(true);
  const [litres, setLitres] = useState(String(defaults.litres));
  const [price, setPrice] = useState(String(defaults.pricePerLitre));
  const [status, setStatus] = useState<MilkEntry["status"]>("unpaid");
  const [paidAmount, setPaidAmount] = useState("0");
  const [notes, setNotes] = useState("");

  const existing = byDate(date);

  useEffect(() => {
    const e = byDate(date);
    if (e) {
      setTaken(e.taken);
      setLitres(String(e.litres));
      setPrice(String(e.pricePerLitre));
      setStatus(e.status);
      setPaidAmount(String(e.paidAmount || 0));
      setNotes(e.notes || "");
    } else {
      setTaken(true);
      setLitres(String(defaults.litres));
      setPrice(String(defaults.pricePerLitre));
      setStatus("unpaid");
      setPaidAmount("0");
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const amount = taken ? (Number(litres) || 0) * (Number(price) || 0) : 0;

  const onSave = () => {
    if (!date) return toast.error("Date select karein");
    const paid = status === "paid" ? amount : status === "unpaid" ? 0 : Number(paidAmount) || 0;
    save({
      id: existing?.id || crypto.randomUUID(),
      date,
      taken,
      litres: taken ? Number(litres) || 0 : 0,
      pricePerLitre: Number(price) || 0,
      status,
      paidAmount: paid,
      notes: notes.trim() || undefined,
    });
    setDefaults({ litres: Number(litres) || defaults.litres, pricePerLitre: Number(price) || defaults.pricePerLitre });
    toast.success("Entry saved · सेव हो गया");
    navigate("/calendar");
  };

  const onDelete = () => {
    if (!existing) return;
    remove(existing.id);
    toast.success("Entry deleted");
    navigate("/calendar");
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">{existing ? "Edit entry" : "Add entry"}</h2>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={taken ? "default" : "outline"}
            className="h-12"
            onClick={() => setTaken(true)}
          >
            ✅ Milk taken
          </Button>
          <Button
            type="button"
            variant={!taken ? "destructive" : "outline"}
            className="h-12"
            onClick={() => setTaken(false)}
          >
            ❌ No milk
          </Button>
        </div>

        {taken && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="litres">Quantity (litre)</Label>
              <Input id="litres" type="number" inputMode="decimal" step="0.25" value={litres} onChange={(e) => setLitres(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price / litre</Label>
              <Input id="price" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
        )}

        <div className="rounded-xl bg-muted p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Day amount</span>
          <span className="text-2xl font-display font-bold text-primary">{inr(amount)}</span>
        </div>

        <div className="space-y-2">
          <Label>Payment status</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["paid", "unpaid", "partial"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-xl border py-2 text-sm capitalize transition-colors",
                  status === s ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {status === "partial" && (
          <div className="space-y-2">
            <Label htmlFor="paid">Paid amount</Label>
            <Input id="paid" type="number" inputMode="decimal" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 h-12" onClick={onSave}>
            Save
          </Button>
          {existing && (
            <Button variant="outline" size="icon" className="h-12 w-12 text-destructive" onClick={onDelete} aria-label="Delete entry">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
