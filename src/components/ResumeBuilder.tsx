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
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resumeData.fullName || "Resume"} - Resume</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; background: white; }
          .resume { max-width: 595px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, hsl(174, 62%, 40%), hsl(200, 80%, 55%)); padding: 32px; color: white; }
          .header h1 { font-size: 24px; font-weight: 700; }
          .header .subtitle { font-size: 14px; margin-top: 4px; opacity: 0.9; }
          .header .contacts { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 12px; opacity: 0.8; }
          .content { padding: 32px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: hsl(174, 62%, 40%); border-bottom: 2px solid hsl(174, 62%, 40%, 0.2); padding-bottom: 4px; margin-bottom: 8px; }
          .section p { font-size: 11px; line-height: 1.6; color: #333; }
          .row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; font-size: 11px; }
          .row .label { font-weight: 600; color: #111; }
          .row .value { color: #555; }
          .skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
          .skill-tag { padding: 2px 8px; border-radius: 6px; background: hsl(174, 62%, 40%, 0.1); color: hsl(174, 62%, 40%); font-size: 10px; font-weight: 500; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="resume">
          <div class="header">
            <h1>${resumeData.fullName || "Your Name"}</h1>
            ${resumeData.jobTitle ? `<div class="subtitle">${resumeData.jobTitle}</div>` : ""}
            <div class="contacts">
              ${resumeData.email ? `<span>✉ ${resumeData.email}</span>` : ""}
              ${resumeData.phone ? `<span>☎ ${resumeData.phone}</span>` : ""}
              ${resumeData.address ? `<span>📍 ${resumeData.address}</span>` : ""}
            </div>
          </div>
          <div class="content">
            ${resumeData.summary ? `
              <div class="section">
                <div class="section-title">Professional Summary</div>
                <p>${resumeData.summary}</p>
              </div>
            ` : ""}
            ${resumeData.educationLevel || resumeData.schoolOrCollege ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${resumeData.educationLevel ? `<div class="row"><span class="label">Level:</span><span class="value">${resumeData.educationLevel}</span></div>` : ""}
                ${resumeData.isGraduate ? `<div class="row"><span class="label">Graduate:</span><span class="value">${resumeData.isGraduate}</span></div>` : ""}
                ${resumeData.degree ? `<div class="row"><span class="label">Degree:</span><span class="value">${resumeData.degree}</span></div>` : ""}
                ${resumeData.fieldOfStudy ? `<div class="row"><span class="label">Field:</span><span class="value">${resumeData.fieldOfStudy}</span></div>` : ""}
                ${resumeData.schoolOrCollege ? `<div class="row"><span class="label">Institution:</span><span class="value">${resumeData.schoolOrCollege}</span></div>` : ""}
                ${resumeData.percentage ? `<div class="row"><span class="label">Score:</span><span class="value">${resumeData.percentage}</span></div>` : ""}
              </div>
            ` : ""}
            ${resumeData.preferredJob ? `
              <div class="section">
                <div class="section-title">Job Preference</div>
                <p>${resumeData.preferredJob}</p>
              </div>
            ` : ""}
            ${resumeData.skills ? `
              <div class="section">
                <div class="section-title">Skills</div>
                <div class="skills">
                  ${resumeData.skills.split(",").map(s => s.trim()).filter(Boolean).map(s => `<span class="skill-tag">${s}</span>`).join("")}
                </div>
              </div>
            ` : ""}
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
        <Button onClick={handleDownloadPDF} className="gradient-primary border-0 text-primary-foreground gap-2">
          <Download className="w-4 h-4" />
          Download PDF
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
