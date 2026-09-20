import { useEffect, useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  inr,
  useDeleteEntry,
  useSaveEntry,
  type Dairy,
  type Entry,
} from "@/lib/milk/data";

const QUICK_L = [0.5, 1, 1.5, 2, 2.5, 3];

export default function EntryWizard({
  open,
  onOpenChange,
  dairy,
  date,
  existing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dairy: Dairy;
  date: string;
  existing?: Entry;
}) {
  const save = useSaveEntry();
  const del = useDeleteEntry();

  const [step, setStep] = useState(1);
  const [taken, setTaken] = useState(true);
  const [litres, setLitres] = useState(String(dairy.default_litres));
  const [rate, setRate] = useState(String(dairy.default_rate));
  const [status, setStatus] = useState<Entry["status"]>("unpaid");
  const [paidAmount, setPaidAmount] = useState("0");

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setTaken(existing ? existing.taken : true);
    setLitres(String(existing ? existing.litres : dairy.default_litres));
    setRate(String(existing ? existing.rate : dairy.default_rate));
    setStatus(existing?.status ?? "unpaid");
    setPaidAmount(String(existing?.paid_amount ?? 0));
  }, [open, existing, dairy]);

  const amount = taken ? (Number(litres) || 0) * (Number(rate) || 0) : 0;

  const pretty = new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const finish = async (over?: Partial<Entry>) => {
    const s = over?.status ?? status;
    const paid = s === "paid" ? amount : s === "unpaid" ? 0 : Number(paidAmount) || 0;
    await save.mutateAsync({
      id: existing?.id,
      dairy_id: dairy.id,
      entry_date: date,
      taken: over?.taken ?? taken,
      litres: (over?.taken ?? taken) ? Number(litres) || 0 : 0,
      rate: Number(rate) || 0,
      status: s,
      paid_amount: paid,
      notes: existing?.notes ?? null,
    });
    toast.success("Save ho gaya · सेव हो गया");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            {pretty}
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              {dairy.name} · Step {step} / 4
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <p className="font-display font-semibold text-lg">आज दूध लिया?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-16 text-base"
                onClick={() => {
                  setTaken(true);
                  setStep(2);
                }}
              >
                <Check className="w-5 h-5 mr-1" /> हाँ लिया
              </Button>
              <Button
                variant="destructive"
                className="h-16 text-base"
                onClick={() => {
                  setTaken(false);
                  finish({ taken: false, status: "unpaid" });
                }}
              >
                <X className="w-5 h-5 mr-1" /> नहीं लिया
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <p className="font-display font-semibold text-lg">कितने लीटर दूध लिया?</p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_L.map((l) => (
                <Button
                  key={l}
                  variant={Number(litres) === l ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setLitres(String(l))}
                >
                  {l} L
                </Button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wl">Custom litre</Label>
              <Input id="wl" type="number" inputMode="decimal" step="0.25" value={litres} onChange={(e) => setLitres(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                पीछे
              </Button>
              <Button className="flex-1 h-12" onClick={() => setStep(3)}>
                आगे
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <p className="font-display font-semibold text-lg">रेट कितना है? (₹ / लीटर)</p>
            <Input
              type="number"
              inputMode="decimal"
              className="h-14 text-2xl font-display font-bold text-center"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <div className="rounded-xl bg-muted p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {litres} L × {inr(Number(rate) || 0)}
              </span>
              <span className="text-2xl font-display font-bold text-primary">{inr(amount)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>
                पीछे
              </Button>
              <Button className="flex-1 h-12" onClick={() => setStep(4)}>
                आगे
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 animate-fade-in">
            <p className="font-display font-semibold text-lg">भुगतान किया?</p>
            <p className="text-sm text-muted-foreground">आज का amount {inr(amount)}</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["paid", "हाँ (Paid)"],
                  ["unpaid", "नहीं (Unpaid)"],
                  ["partial", "कुछ (Partial)"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={cn(
                    "rounded-xl border py-3 text-xs font-medium transition-colors",
                    status === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {status === "partial" && (
              <div className="space-y-1.5">
                <Label htmlFor="wp">कितने पैसे दिए?</Label>
                <Input id="wp" type="number" inputMode="decimal" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(3)}>
                पीछे
              </Button>
              <Button className="flex-1 h-12" disabled={save.isPending} onClick={() => finish()}>
                Save
              </Button>
            </div>
          </div>
        )}

        {existing && (
          <Button
            variant="ghost"
            className="text-destructive h-10"
            onClick={async () => {
              await del.mutateAsync(existing.id);
              toast.success("Entry delete ho gayi");
              onOpenChange(false);
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" /> इस दिन की entry हटाएँ
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
