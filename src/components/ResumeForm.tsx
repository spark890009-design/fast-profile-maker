import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ResumeData, educationOptions } from "@/types/resume";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeForm = ({ data, onChange }: ResumeFormProps) => {
  const update = (field: keyof ResumeData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Personal Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name / पूरा नाम</Label>
          <Input placeholder="e.g. Rahul Sharma" value={data.fullName} onChange={(e) => update("fullName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Phone / फ़ोन नंबर</Label>
          <Input placeholder="+91 98765 43210" value={data.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" placeholder="rahul@example.com" value={data.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Address / पता</Label>
          <Input placeholder="e.g. Delhi, India" value={data.address} onChange={(e) => update("address", e.target.value)} />
        </div>
      </div>

      {/* Education Section */}
      <div className="pt-2 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Education / पढ़ाई</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Education Level / कितने तक पढ़े हो?</Label>
            <select
              value={data.educationLevel}
              onChange={(e) => update("educationLevel", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select / चुनें</option>
              {educationOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Graduate हो?</Label>
            <select
              value={data.isGraduate}
              onChange={(e) => update("isGraduate", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select / चुनें</option>
              <option value="Yes">Yes / हाँ</option>
              <option value="No">No / नहीं</option>
              <option value="Pursuing">Pursuing / कर रहे हैं</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>School / College / Board</Label>
            <Input placeholder="e.g. CBSE, Delhi University" value={data.schoolOrCollege} onChange={(e) => update("schoolOrCollege", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Degree (अगर है तो)</Label>
            <Input placeholder="e.g. B.Tech, BA, BCA" value={data.degree} onChange={(e) => update("degree", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Field of Study / Subject</Label>
            <Input placeholder="e.g. Science, Commerce, CS" value={data.fieldOfStudy} onChange={(e) => update("fieldOfStudy", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Percentage / CGPA</Label>
            <Input placeholder="e.g. 85% or 8.5 CGPA" value={data.percentage} onChange={(e) => update("percentage", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Job Section */}
      <div className="pt-2 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Job Preference / नौकरी</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current / Desired Job Title</Label>
            <Input placeholder="e.g. Software Developer" value={data.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>किस तरह की Job चाहिए?</Label>
            <Input placeholder="e.g. IT, Teaching, Marketing" value={data.preferredJob} onChange={(e) => update("preferredJob", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Skills & Summary */}
      <div className="pt-2 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Skills & Summary</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Skills (comma se alag karein)</Label>
            <Input placeholder="e.g. MS Office, Communication, Hindi, English" value={data.skills} onChange={(e) => update("skills", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>About You / अपने बारे में कुछ लिखें</Label>
            <Textarea placeholder="Short summary about yourself..." rows={3} value={data.summary} onChange={(e) => update("summary", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
