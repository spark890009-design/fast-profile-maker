import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ResumeData, defaultResumeData } from "@/types/resume";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";

interface ResumeBuilderProps {
  onBack: () => void;
}

const ResumeBuilder = ({ onBack }: ResumeBuilderProps) => {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Resume Builder</h1>
      </nav>
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        {/* Form */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
          <ResumeForm data={resumeData} onChange={setResumeData} />
        </div>
        {/* Preview */}
        <div className="w-full lg:w-1/2 p-6 bg-muted/50 overflow-y-auto max-h-[calc(100vh-65px)] flex justify-center">
          <ResumePreview data={resumeData} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
