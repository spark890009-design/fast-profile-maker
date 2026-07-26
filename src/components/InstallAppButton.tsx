import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallAppButton = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (standalone) setInstalled(true);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua));

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => { setInstalled(true); setDeferred(null); toast.success("App installed!"); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") toast.success("Installing app...");
      setDeferred(null);
      return;
    }
    if (isIOS) {
      toast.message("Install on iPhone", {
        description: "Tap the Share button in Safari, then 'Add to Home Screen'.",
        duration: 6000,
      });
      return;
    }
    toast.message("Install App", {
      description: "Open your browser menu and tap 'Install app' or 'Add to Home screen'.",
      duration: 6000,
    });
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      aria-label="Install app"
      className="fixed bottom-5 right-5 z-50 rounded-full shadow-2xl gradient-primary border-0 h-14 px-5 gap-2 animate-in fade-in slide-in-from-bottom-4"
    >
      <Download className="w-5 h-5" />
      <span className="font-semibold">Install App</span>
    </Button>
  );
};
