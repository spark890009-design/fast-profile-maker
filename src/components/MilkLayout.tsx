import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, CalendarDays, PlusCircle, Wallet, ListOrdered, Milk, Plus, Settings2, UserRound, ShieldCheck, Mail, Phone, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const { user, profile, isAdmin, loading, signOut } = useAuth();
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" aria-label="Profile" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                    {(profile?.full_name || user.email || "U").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate font-semibold">{profile?.full_name || user.user_metadata?.full_name || "Milk Tracker user"}</span>
                <span className="mt-1 flex items-center gap-2 break-all text-xs font-normal text-muted-foreground"><Mail className="h-3.5 w-3.5 shrink-0" />{user.email || "Email not available"}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 px-2 py-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 shrink-0" />{profile?.account_type === "shop" ? "Dairy shop" : "Customer"}</p>
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{profile?.mobile || "Mobile not added"}</p>
                <p className="break-all">User ID: {profile?.user_id || user.id}</p>
              </div>
              {isAdmin && <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/admin" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Admin · Users</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void signOut()}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
              </>}
            </DropdownMenuContent>
          </DropdownMenu>
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
        ) : !current && !isAdmin ? (
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
