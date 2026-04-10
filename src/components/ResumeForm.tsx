import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, User, GraduationCap, Briefcase, Wrench } from "lucide-react";
import { ResumeData, Education, Experience } from "@/types/resume";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeForm = ({ data, onChange }: ResumeFormProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newSkill, setNewSkill] = useState("");

  const tabs = [
    { label: "Personal", icon: <User className="w-4 h-4" /> },
    { label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Skills", icon: <Wrench className="w-4 h-4" /> },
  ];

  const updatePersonal = (field: string, value: string) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      education: data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Education</h2>
            <Button onClick={addEducation} size="sm" className="gradient-primary border-0 text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {data.education.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">No education added yet. Click "Add" to start.</p>
          )}
          {data.education.map((edu) => (
            <div key={edu.id} className="bg-card rounded-xl p-4 card-elevated space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">Education Entry</span>
                <Button variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="text-destructive h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="School / University" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
                <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                <Input placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} />
                <div className="flex gap-2">
                  <Input type="text" placeholder="Start Year" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                  <Input type="text" placeholder="End Year" value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
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
