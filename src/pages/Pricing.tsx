import { Check } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/clipora/store";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["3 videos per month", "Up to 10 clips per video", "1080p exports", "All caption styles", "Watermarked exports"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "₹999",
    period: "per month",
    features: ["Unlimited videos", "Unlimited clips", "4K UHD exports", "No watermark", "Priority render queue", "Team sharing"],
  },
];

export default function Pricing() {
  const { plan, setPlan } = usePlan();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">Simple pricing</h1>
          <p className="text-muted-foreground mt-2">Start free. Go Pro when your shorts start working.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          {PLANS.map((p) => {
            const active = plan === p.id;
            return (
              <div key={p.id} className={`glass rounded-3xl p-7 ${p.id === "pro" ? "neon-violet" : ""}`}>
                <h2 className="font-display font-bold text-xl">{p.name}</h2>
                <p className="mt-3">
                  <span className="font-display font-extrabold text-4xl text-gradient">{p.price}</span>
                  <span className="text-muted-foreground text-sm ml-2">{p.period}</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-7 ${p.id === "pro" ? "gradient-brand text-primary-foreground border-0" : ""}`}
                  variant={p.id === "pro" ? "default" : "outline"}
                  disabled={active}
                  onClick={() => { setPlan(p.id); toast.success(`Switched to ${p.name}`); }}
                >
                  {active ? "Current plan" : p.id === "pro" ? "Upgrade to Pro" : "Switch to Free"}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Plan switching is local for now — connect a payment provider to charge real cards.
        </p>
      </div>
    </AppShell>
  );
}
