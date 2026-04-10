import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ResumeData, defaultResumeData } from "@/types/resume";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";

interface ResumeBuilderProps {
  onBack: () => void;
}

const ResumeBuilder = ({ onBack }: ResumeBuilderProps) => {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resumeData.fullName || "Resume"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Resume Builder</h1>
        </div>
        <Button onClick={handleDownloadPDF} disabled={downloading} className="gradient-primary border-0 text-primary-foreground gap-2">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Downloading..." : "Download PDF"}
        </Button>
      </nav>
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
          <ResumeForm data={resumeData} onChange={setResumeData} />
        </div>
        <div className="w-full lg:w-1/2 p-6 bg-muted/50 overflow-y-auto max-h-[calc(100vh-65px)] flex justify-center">
          <ResumePreview ref={printRef} data={resumeData} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
