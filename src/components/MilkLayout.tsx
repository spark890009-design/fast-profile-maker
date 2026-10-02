import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, CalendarDays, PlusCircle, Wallet, ListOrdered, Milk, Plus, Settings2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentDairy } from "@/lib/milk/useCurrentDairy";
import { inr, summarise, useEntries, usePayments } from "@/lib/milk/data";
import DairyManager from "./DairyManager";
import Auth from "@/pages/Auth";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/add", label: "Add", icon: PlusCircle },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/history", label: "History", icon: ListOrdered },
];

export default function MilkLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { dairies, current, loading: dl, select } = useCurrentDairy();
  const [mgr, setMgr] = useState(false);
  const { data: entries = [] } = useEntries(current?.id);
  const { data: payments = [] } = usePayments(current?.id);
  const total = summarise(entries, payments);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Auth />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
        <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-2 flex items-center gap-2">
          <Milk className="w-6 h-6" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg leading-tight">Milk Tracker</h1>
            <p className="text-xs opacity-85">दूध हिसाब</p>
          </div>
          <Button size="icon" variant="secondary" onClick={() => setMgr(true)} aria-label="Dairies"><Settings2 className="w-4 h-4" /></Button>
          <Button size="icon" variant="secondary" onClick={signOut} aria-label="Logout"><LogOut className="w-4 h-4" /></Button>
        </div>
        {dairies.length > 0 && (
          <div className="mx-auto w-full max-w-2xl px-4 pb-2 flex gap-2 overflow-x-auto">
            {dairies.map((d) => (
              <button key={d.id} onClick={() => select(d.id)}
                className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-medium border",
                  current?.id === d.id ? "bg-primary-foreground text-primary border-transparent" : "border-primary-foreground/40")}>
                {d.name}
              </button>
            ))}
            <button onClick={() => setMgr(true)} className="shrink-0 rounded-full px-3 py-1 text-sm border border-primary-foreground/40 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Dairy
            </button>
          </div>
        )}
        {current && (
          <div className="mx-auto w-full max-w-2xl px-4 pb-3 grid grid-cols-3 text-center text-xs">
            <div><p className="opacity-80">Total bill</p><p className="text-base font-display font-bold">{inr(total.bill)}</p></div>
            <div><p className="opacity-80">Paid</p><p className="text-base font-display font-bold">{inr(total.paid)}</p></div>
            <div><p className="opacity-80">बाकी</p><p className="text-base font-display font-bold">{inr(total.balance)}</p></div>
          </div>
        )}
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-4 pb-28">
        {dl ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : !current ? (
          <div className="text-center space-y-4 py-16">
            <Milk className="w-12 h-12 mx-auto text-primary" />
            <p className="font-display text-xl font-bold">Pehle apni dairy add karein</p>
            <p className="text-sm text-muted-foreground">Har dairy ka hisaab alag rahega.</p>
            <Button size="lg" onClick={() => setMgr(true)}><Plus className="w-4 h-4 mr-1" /> Add dairy</Button>
          </div>
        ) : children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-2xl grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn("flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground")}>
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <DairyManager open={mgr} onOpenChange={setMgr} />
    </div>
  );
}
