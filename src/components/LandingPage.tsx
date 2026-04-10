import { FileText, Zap, Download, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-resume.jpg";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  const features = [
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Professional Templates",
      description: "Beautiful, ATS-friendly resume templates that stand out.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Easy to Use",
      description: "Fill in your details and watch your resume come to life instantly.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Live Preview",
      description: "See changes in real-time as you type your information.",
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Download Ready",
      description: "Download your resume as a polished, print-ready document.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold text-foreground">ResumeKraft</span>
        </div>
        <Button onClick={onStart} size="sm" className="gradient-primary border-0 text-primary-foreground">
          Get Started
        </Button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
            Build Your{" "}
            <span className="text-gradient">Professional Resume</span>{" "}
            in Minutes
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Apni details bharo aur ek professional resume automatically ban jaaye. 
            No design skills needed — just fill and done!
          </p>
          <div className="flex gap-4">
            <Button
              onClick={onStart}
              size="lg"
              className="gradient-primary border-0 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Building →
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src={heroImage}
            alt="Professional Resume Preview"
            className="w-full max-w-md rounded-2xl card-elevated"
            width={800}
            height={1000}
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Why Choose <span className="text-gradient">ResumeKraft</span>?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 card-elevated flex flex-col items-start gap-4"
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-sm border-t border-border">
        © 2026 ResumeKraft. Build your future, one resume at a time.
      </footer>
    </div>
  );
};

export default LandingPage;
