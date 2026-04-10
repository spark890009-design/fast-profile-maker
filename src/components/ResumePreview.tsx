import { Mail, Phone, MapPin } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { forwardRef } from "react";

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
  const hasContent = data.fullName || data.educationLevel || data.jobTitle || data.skills;

  if (!hasContent) {
    return (
      <div className="w-full max-w-[595px] min-h-[842px] bg-card rounded-xl card-elevated flex items-center justify-center p-12">
        <p className="text-muted-foreground text-center">
          Apni details bharna shuru karein — resume yahan dikhega ✨
        </p>
      </div>
    );
  }

  const skillsList = data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div ref={ref} id="resume-print" className="w-full max-w-[595px] min-h-[842px] bg-card rounded-xl card-elevated overflow-hidden text-[11px] leading-relaxed print:shadow-none print:rounded-none">
      {/* Header */}
      <div className="gradient-primary px-8 py-6 text-primary-foreground print:bg-[hsl(174,62%,40%)]">
        <h1 className="text-2xl font-bold tracking-tight">
          {data.fullName || "Your Name"}
        </h1>
        {data.jobTitle && <p className="text-sm mt-1 opacity-90">{data.jobTitle}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-xs opacity-80">
          {data.email && (
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.email}</span>
          )}
          {data.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.phone}</span>
          )}
          {data.address && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.address}</span>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Summary */}
        {data.summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-foreground/80">{data.summary}</p>
          </section>
        )}

        {/* Education */}
        {(data.educationLevel || data.schoolOrCollege) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-1">
              {data.educationLevel && (
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">Level:</span>
                  <span className="text-foreground/80">{data.educationLevel}</span>
                </div>
              )}
              {data.isGraduate && (
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">Graduate:</span>
                  <span className="text-foreground/80">{data.isGraduate}</span>
                </div>
              )}
              {data.degree && (
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">Degree:</span>
                  <span className="text-foreground/80">{data.degree}</span>
                </div>
              )}
              {data.fieldOfStudy && (
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">Field:</span>
                  <span className="text-foreground/80">{data.fieldOfStudy}</span>
                </div>
              )}
              {data.schoolOrCollege && (
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">Institution:</span>
                  <span className="text-foreground/80">{data.schoolOrCollege}</span>
                </div>
              )}
              {data.percentage && (
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">Score:</span>
                  <span className="text-foreground/80">{data.percentage}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Job Preference */}
        {data.preferredJob && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Job Preference
            </h2>
            <p className="text-foreground/80">{data.preferredJob}</p>
          </section>
        )}

        {/* Skills */}
        {skillsList.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {skillsList.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
