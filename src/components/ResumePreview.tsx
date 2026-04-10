import { Mail, Phone, MapPin } from "lucide-react";
import { ResumeData, educationLevels } from "@/types/resume";

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview = ({ data }: ResumePreviewProps) => {
  const { personalInfo, education, experience, skills } = data;
  const hasContent =
    personalInfo.fullName || education.length > 0 || experience.length > 0 || skills.length > 0;

  if (!hasContent) {
    return (
      <div className="w-full max-w-[595px] min-h-[842px] bg-card rounded-xl card-elevated flex items-center justify-center p-12">
        <p className="text-muted-foreground text-center">
          Start filling in your details on the left to see your resume preview here ✨
        </p>
      </div>
    );
  }

  // Sort education by level order
  const levelOrder = educationLevels.map(l => l.value);
  const sortedEducation = [...education].sort(
    (a, b) => levelOrder.indexOf(b.level) - levelOrder.indexOf(a.level)
  );

  return (
    <div className="w-full max-w-[595px] min-h-[842px] bg-card rounded-xl card-elevated overflow-hidden text-[11px] leading-relaxed">
      {/* Header */}
      <div className="gradient-primary px-8 py-6 text-primary-foreground">
        <h1 className="text-2xl font-bold tracking-tight">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-sm mt-1 opacity-90">{personalInfo.jobTitle}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-xs opacity-80">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {personalInfo.phone}
            </span>
          )}
          {personalInfo.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {personalInfo.address}
            </span>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Summary */}
        {personalInfo.summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-foreground/80">{personalInfo.summary}</p>
          </section>
        )}

        {/* Education */}
        {sortedEducation.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-3">
              {sortedEducation.map((edu) => {
                const levelInfo = educationLevels.find(l => l.value === edu.level);
                return (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-foreground">
                        {edu.level === '10th' || edu.level === '12th'
                          ? `${levelInfo?.label}${edu.field ? ` — ${edu.field}` : ''}`
                          : `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`
                        }
                      </h3>
                      <span className="text-muted-foreground text-[10px]">
                        {edu.startDate} {edu.startDate && edu.endDate && "–"} {edu.endDate}
                      </span>
                    </div>
                    <p className="text-primary font-medium text-[10px]">{edu.school}</p>
                    {edu.percentage && (
                      <p className="text-foreground/60 text-[10px]">Score: {edu.percentage}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Work Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-foreground">{exp.position || "Position"}</h3>
                    <span className="text-muted-foreground text-[10px]">
                      {exp.startDate} {exp.startDate && exp.endDate && "–"} {exp.endDate}
                    </span>
                  </div>
                  <p className="text-primary font-medium text-[10px]">{exp.company}</p>
                  {exp.description && (
                    <p className="text-foreground/70 mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
