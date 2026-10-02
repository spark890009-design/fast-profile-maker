import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { inr, setSelectedDairy, useDeleteDairy, useSaveDairy, type Dairy } from "@/lib/milk/data";
import { useCurrentDairy } from "@/lib/milk/useCurrentDairy";

export default function DairyManager({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { dairies } = useCurrentDairy();
  const save = useSaveDairy();
  const del = useDeleteDairy();
  const [edit, setEdit] = useState<Dairy | null>(null);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [litres, setLitres] = useState("1");
  const [rate, setRate] = useState("60");

  const reset = () => {
    setEdit(null); setName(""); setOwner(""); setPhone(""); setLitres("1"); setRate("60");
  };

  const submit = async () => {
    if (!name.trim()) return toast.error("Dairy ka naam daalein");
    try {
      const id = await save.mutateAsync({
        id: edit?.id, name: name.trim(), owner_name: owner || null, phone: phone || null,
        default_litres: Number(litres) || 1, default_rate: Number(rate) || 60,
      });
      setSelectedDairy(id);
      toast.success(edit ? "Dairy update ho gayi" : "Dairy add ho gayi");
      reset();
      if (!edit) onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-sm rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{edit ? "Dairy edit karein" : "नई डेयरी जोड़ें"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Dairy name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="जैसे: Sharma Dairy" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label>Owner</Label><Input value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
            <div className="space-y-1"><Label>Phone</Label><Input value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="space-y-1"><Label>Roz ka litre</Label><Input type="number" inputMode="decimal" value={litres} onChange={(e) => setLitres(e.target.value)} /></div>
            <div className="space-y-1"><Label>Rate ₹/L</Label><Input type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
          </div>
          <Button className="w-full h-12" onClick={submit} disabled={save.isPending}>{edit ? "Update" : "Add dairy"}</Button>
        </div>
        {dairies.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-semibold">Meri dairies</p>
            {dairies.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border p-2">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.default_litres} L · {inr(d.default_rate)}/L</p>
                </div>
                <div className="flex">
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => {
                    setEdit(d); setName(d.name); setOwner(d.owner_name ?? ""); setPhone(d.phone ?? "");
                    setLitres(String(d.default_litres)); setRate(String(d.default_rate));
                  }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" aria-label="Delete" onClick={async () => {
                    if (!confirm(`${d.name} aur iska saara hisaab delete karein?`)) return;
                    await del.mutateAsync(d.id);
                    toast.success("Dairy delete ho gayi");
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
