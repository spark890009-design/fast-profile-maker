import { Link } from "react-router-dom";
import { ArrowRight, Wand2, Captions, Scissors, Sparkles, Gauge, Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";
import { BRAND, TEMPLATES } from "@/lib/clipora/constants";

const FEATURES = [
  { icon: Scissors, title: "Auto moment detection", body: "AI scans the full video and pulls the moments most likely to hold attention." },
  { icon: Captions, title: "Word-by-word captions", body: "Six caption styles built for retention — creator, cinematic, viral, neon and more." },
  { icon: Wand2, title: "Pro editor", body: "Timeline, trims, crops, B-roll, overlays and audio tools in one dark studio." },
  { icon: Gauge, title: "Virality score", body: "Every clip gets a score and a plain-English reason it was chosen." },
  { icon: Share2, title: "Platform presets", body: "9:16 exports tuned for Shorts, Reels, TikTok and Facebook." },
  { icon: ShieldCheck, title: "Your content only", body: "Sources are validated — process videos you own or are licensed for." },
];

const STEPS = [
  { n: "01", t: "Add your video", d: "Paste a link or upload a file up to feature length." },
  { n: "02", t: "AI analyses it", d: "Transcript, speakers and the strongest moments." },
  { n: "03", t: "Pick your clips", d: "Ranked shorts with hooks, captions and hashtags." },
  { n: "04", t: "Polish & export", d: "Fine-tune in the editor, then render per platform." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/75 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/pricing">Pricing</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="gradient-brand text-primary-foreground border-0">
              <Link to="/studio">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full glass">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> AI clipping studio for creators
        </span>
        <h1 className="mt-6 font-display font-extrabold text-4xl sm:text-6xl leading-[1.05]">
          Long videos in.
          <br />
          <span className="text-gradient">Perfect shorts out.</span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto text-lg">
          {BRAND.name} finds your best moments, writes the hooks, burns the captions and exports
          ready-to-post verticals for every platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gradient-brand text-primary-foreground border-0 h-12 px-7">
            <Link to="/studio">Create your first clip <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-7">
            <Link to="/templates">Browse templates</Link>
          </Button>
        </div>

        <div className="mt-14 glass rounded-3xl p-4 sm:p-6 neon-violet">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[9/16] rounded-2xl border border-white/5 relative overflow-hidden"
                style={{ background: `linear-gradient(160deg, hsl(${186 + i * 30} 90% 55% / .25), hsl(${272 + i * 15} 90% 60% / .18))` }}>
                <div className="absolute inset-x-3 bottom-3">
                  <div className="h-2 rounded-full bg-white/70 w-3/4 mb-1.5" />
                  <div className="h-2 rounded-full bg-white/40 w-1/2" />
                </div>
                <span className="absolute top-3 left-3 text-[10px] font-display font-bold px-2 py-1 rounded-full bg-background/70">
                  {94 - i * 4}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display font-bold text-3xl text-center">How it works</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="glass glass-hover rounded-2xl p-5">
              <span className="font-display font-extrabold text-2xl text-gradient">{s.n}</span>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display font-bold text-3xl text-center">Built for serious creators</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass glass-hover rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display font-bold text-3xl text-center">Ten styled templates</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TEMPLATES.map((t) => (
            <span key={t.id} className="px-4 py-2 rounded-full glass text-sm">{t.name}</span>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-3xl p-10 neon-cyan">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">Ready to clip?</h2>
          <p className="text-muted-foreground mt-3">Start free. Upgrade when you need 4K and unlimited exports.</p>
          <Button asChild size="lg" className="mt-7 gradient-brand text-primary-foreground border-0 h-12 px-8">
            <Link to="/studio">Open the studio <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}
      </footer>
    </div>
  );
}
