import { useEffect, useState } from "react";
import logo from "@/assets/milk-logo.png.asset.json";

export default function AppSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-fade-out [animation-delay:1.1s] [animation-fill-mode:forwards]">
      <div className="relative animate-scale-in">
        <div className="absolute inset-2 rounded-full bg-primary/20 animate-ping" />
        <img src={logo.url} alt="Milk Tracker" className="relative h-32 w-32 rounded-3xl object-contain shadow-xl" />
      </div>
      <p className="mt-5 font-display text-xl font-bold text-primary animate-fade-in">Milk Tracker</p>
      <p className="mt-1 text-sm text-muted-foreground animate-fade-in">दूध का पूरा हिसाब</p>
    </div>
  );
}