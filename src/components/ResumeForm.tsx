import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, User, GraduationCap, Briefcase, Wrench, ChevronDown, ChevronUp, Badge } from "lucide-react";
import { ResumeData, Education, Experience, educationLevels, EducationLevel } from "@/types/resume";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeForm = ({ data, onChange }: ResumeFormProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newSkill, setNewSkill] = useState("");
  const [expandedEdu, setExpandedEdu] = useState<string | null>(null);

  const tabs = [
    { label: "Personal", icon: <User className="w-4 h-4" /> },
    { label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Skills", icon: <Wrench className="w-4 h-4" /> },
  ];

  const updatePersonal = (field: string, value: string) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const addEducationLevel = (level: EducationLevel) => {
    const levelInfo = educationLevels.find(l => l.value === level);
    const newEdu: Education = {
      id: crypto.randomUUID(),
      level,
      school: "",
      degree: levelInfo?.label || "",
      field: "",
      startDate: "",
      endDate: "",
      percentage: "",
      isOptional: levelInfo?.optional,
    };
    onChange({ ...data, education: [...data.education, newEdu] });
    setExpandedEdu(newEdu.id);
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      education: data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });
    if (expandedEdu === id) setExpandedEdu(null);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      experience: data.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter((e) => e.id !== id) });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      onChange({ ...data, skills: [...data.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    onChange({ ...data, skills: data.skills.filter((_, i) => i !== index) });
  };

  const addedLevels = data.education.map(e => e.level);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i
                ? "gradient-primary text-primary-foreground shadow-md"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" value={data.personalInfo.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input placeholder="Software Engineer" value={data.personalInfo.jobTitle} onChange={(e) => updatePersonal("jobTitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" value={data.personalInfo.email} onChange={(e) => updatePersonal("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+91 98765 43210" value={data.personalInfo.phone} onChange={(e) => updatePersonal("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input placeholder="City, Country" value={data.personalInfo.address} onChange={(e) => updatePersonal("address", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Professional Summary</Label>
            <Textarea placeholder="A brief summary about yourself..." rows={4} value={data.personalInfo.summary} onChange={(e) => updatePersonal("summary", e.target.value)} />
          </div>
        </div>
      )}

      {/* Education */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Education</h2>
          <p className="text-sm text-muted-foreground">Apni education level select karein. Optional wale skip kar sakte hain.</p>

          {/* Education Level Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {educationLevels.map((level) => {
              const isAdded = addedLevels.includes(level.value);
              return (
                <button
                  key={level.value}
                  onClick={() => !isAdded && addEducationLevel(level.value)}
                  disabled={isAdded}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                    isAdded
                      ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                      : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isAdded ? "✓" : <Plus className="w-3.5 h-3.5" />}
                    {level.label}
                  </span>
                  {level.optional && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Optional</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Added Education Entries */}
          {data.education.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Added Education</h3>
              {data.education.map((edu) => {
                const isExpanded = expandedEdu === edu.id;
                const levelInfo = educationLevels.find(l => l.value === edu.level);
                return (
                  <div key={edu.id} className="bg-card rounded-xl card-elevated overflow-hidden">
                    <button
                      onClick={() => setExpandedEdu(isExpanded ? null : edu.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{levelInfo?.label}</span>
                        {edu.isOptional && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Optional</span>
                        )}
                        {edu.school && (
                          <span className="text-xs text-muted-foreground">• {edu.school}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }}
                          className="text-destructive h-7 w-7"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">School / Board / University</Label>
                            <Input placeholder="e.g. CBSE, Delhi University" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
                          </div>
                          {(edu.level !== '10th' && edu.level !== '12th') && (
                            <div className="space-y-1">
                              <Label className="text-xs">Degree</Label>
                              <Input placeholder="e.g. B.Tech, BA, BCA" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                            </div>
                          )}
                          <div className="space-y-1">
                            <Label className="text-xs">{edu.level === '10th' || edu.level === '12th' ? 'Stream / Subject' : 'Field of Study'}</Label>
                            <Input placeholder={edu.level === '12th' ? "e.g. Science, Commerce, Arts" : "e.g. Computer Science"} value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Percentage / CGPA</Label>
                            <Input placeholder="e.g. 85% or 8.5 CGPA" value={edu.percentage} onChange={(e) => updateEducation(edu.id, "percentage", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Start Year</Label>
                            <Input placeholder="e.g. 2018" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">End Year</Label>
                            <Input placeholder="e.g. 2020" value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
            <Button onClick={addExperience} size="sm" className="gradient-primary border-0 text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {data.experience.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">No experience added yet. Click "Add" to start.</p>
          )}
          {data.experience.map((exp) => (
            <div key={exp.id} className="bg-card rounded-xl p-4 card-elevated space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">Experience Entry</span>
                <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="text-destructive h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                <Input placeholder="Position" value={exp.position} onChange={(e) => updateExperience(exp.id, "position", e.target.value)} />
                <div className="flex gap-2">
                  <Input type="text" placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                  <Input type="text" placeholder="End Date" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                </div>
              </div>
              <Textarea placeholder="Job description and responsibilities..." rows={3} value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} />
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {activeTab === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Skills</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Type a skill (e.g. React, Python)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} className="gradient-primary border-0 text-primary-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {skill}
                <button onClick={() => removeSkill(i)} className="hover:text-destructive ml-1">
                  ×
                </button>
              </span>
            ))}
          </div>
          {data.skills.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">Add your skills above.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeForm;
