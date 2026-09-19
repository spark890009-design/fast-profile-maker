import { NavLink } from "react-router-dom";
import { Home, CalendarDays, PlusCircle, Wallet, ListOrdered, Milk } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/add", label: "Add", icon: PlusCircle },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/history", label: "History", icon: ListOrdered },
];

export default function MilkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
        <div className="mx-auto w-full max-w-2xl px-4 py-3 flex items-center gap-2">
          <Milk className="w-6 h-6" />
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Milk Tracker</h1>
            <p className="text-xs opacity-85">दूध हिसाब · Attendance &amp; Payment</p>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-4 pb-28">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-2xl grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
