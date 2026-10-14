import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/pandey-dhoodh-dairy-logo.png.asset.json";

export default function AppSplash() {
  const [stage, setStage] = useState<"splash" | "welcome" | "done">("splash");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setStage("welcome"), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (stage === "done") return null;

  const playWelcome = () => {
    if (!("speechSynthesis" in window)) {
      setStage("done");
      return;
    }
    window.speechSynthesis.cancel();
    const greeting = new SpeechSynthesisUtterance("पांडेय दूध डेयरी में आपका स्वागत है");
    greeting.lang = "hi-IN";
    greeting.rate = 0.92;
    greeting.onstart = () => setSpeaking(true);
    greeting.onend = () => {
      setSpeaking(false);
      setStage("done");
    };
    greeting.onerror = () => {
      setSpeaking(false);
      setStage("done");
    };
    window.speechSynthesis.speak(greeting);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-5 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="w-full max-w-sm text-center">
        <div className="relative mx-auto w-fit animate-scale-in">
          {stage === "splash" && <div className="absolute inset-2 rounded-full bg-primary/20 animate-ping" />}
          <img src={logo.url} alt="Pandey Dhoodh Dairy logo" className="relative h-36 w-36 rounded-3xl object-contain shadow-xl" />
        </div>
        {stage === "splash" ? (
          <div className="mt-5 animate-fade-in">
            <h1 className="font-display text-xl font-bold text-primary">Pandey Dhoodh Dairy</h1>
            <p className="mt-1 text-sm text-muted-foreground">दूध का पूरा हिसाब</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div>
              <h1 id="welcome-title" className="font-display text-2xl font-bold text-primary">Pandey Dhoodh Dairy</h1>
              <p className="mt-2 text-lg font-semibold">आपका स्वागत है</p>
              <p className="mt-1 text-sm text-muted-foreground">Pandey Dhoodh Dairy mein aapka swagat hai</p>
            </div>
            <div className="grid gap-2">
              <Button className="w-full" onClick={playWelcome} disabled={speaking}>
                <Volume2 className="mr-2 h-4 w-4" />{speaking ? "स्वागत है…" : "आवाज़ सुनें और आगे बढ़ें"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStage("done")}>आगे बढ़ें</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}