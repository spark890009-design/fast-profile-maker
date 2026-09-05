import { NavLink, Link } from "react-router-dom";
import { Clapperboard, LayoutGrid, Sparkles, Wand2, LayoutTemplate, CreditCard, Settings, Menu } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/clipora-logo.png";
import { BRAND } from "@/lib/clipora/constants";
import { usePlan } from "@/lib/clipora/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/studio", label: "Create", icon: Sparkles },
  { to: "/projects", label: "Projects", icon: LayoutGrid },
  { to: "/clips", label: "Clips", icon: Clapperboard },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/editor", label: "Editor", icon: Wand2 },
  { to: "/pricing", label: "Pro", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src={logo} alt={`${BRAND.name} logo`} className="w-9 h-9 rounded-xl object-cover" />
      {!compact && (
        <span className="font-display font-extrabold tracking-tight text-lg text-gradient">
          {BRAND.name}
        </span>
      )}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { plan } = usePlan();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-secondary text-foreground neon-cyan"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
            )
          }
        >
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-6 p-4 border-r border-border/60 sticky top-0 h-screen">
        <Logo />
        {nav}
        <div className="mt-auto glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Current plan</p>
          <p className="font-display font-bold capitalize">{plan}</p>
          {plan === "free" && (
            <Button asChild size="sm" className="w-full mt-3 gradient-brand text-primary-foreground border-0">
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
          )}
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <Menu className="w-5 h-5" />
        </Button>
      </header>
      {open && <div className="lg:hidden px-3 py-2 border-b border-border/60">{nav}</div>}

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
