import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { entryAmount, inr, monthKey, monthLabel, shiftMonth, useEntries, useMonthSummary } from "@/lib/milk/store";

export default function History() {
  const [month, setMonth] = useState(monthKey(new Date()));
  const { remove } = useEntries();
  const s = useMonthSummary(month);

  const rows = [...s.monthEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="font-display font-semibold">{monthLabel(month)}</p>
        <Button variant="outline" size="icon" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Card className="p-4 text-sm grid grid-cols-2 gap-y-1">
        <span className="text-muted-foreground">Total days</span>
        <span className="text-right font-semibold">{s.totalDays}</span>
        <span className="text-muted-foreground">Milk taken / No milk</span>
        <span className="text-right font-semibold">
          {s.takenDays} / {s.noMilkDays}
        </span>
        <span className="text-muted-foreground">Total litres</span>
        <span className="text-right font-semibold">{s.litres} L</span>
        <span className="text-muted-foreground">Total bill</span>
        <span className="text-right font-semibold">{inr(s.bill)}</span>
        <span className="text-muted-foreground">Total paid</span>
        <span className="text-right font-semibold text-primary">{inr(s.paid)}</span>
        <span className="text-muted-foreground">Balance</span>
        <span className="text-right font-semibold text-destructive">{inr(s.balance)}</span>
      </Card>

      <p className="font-semibold">Milk entries</p>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Is mahine ki koi entry nahi.</p>}
      {rows.map((e) => (
        <Card key={e.id} className="p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium">
              {e.taken ? "✅" : "❌"}{" "}
              {new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {e.taken ? `${e.litres} L × ${inr(e.pricePerLitre)} · ${e.status}` : "No milk"}
              {e.notes ? ` · ${e.notes}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-display font-bold">{inr(entryAmount(e))}</span>
            <Button asChild variant="ghost" size="icon" aria-label="Edit entry">
              <Link to={`/add/${e.date}`}>
                <Pencil className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => {
                remove(e.id);
                toast.success("Entry deleted");
              }}
              aria-label="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
