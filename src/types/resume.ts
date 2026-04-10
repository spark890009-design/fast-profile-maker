export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string;
  summary: string;
  educationLevel: string;
  isGraduate: string;
  preferredJob: string;
  schoolOrCollege: string;
  degree: string;
  fieldOfStudy: string;
  percentage: string;
  skills: string;
}

export const educationOptions = [
  "8th Pass",
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Graduation (Bachelor's)",
  "Post Graduation (Master's)",
  "PhD / Doctorate",
];

export const defaultResumeData: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  jobTitle: "",
  summary: "",
  educationLevel: "",
  isGraduate: "",
  preferredJob: "",
  schoolOrCollege: "",
  degree: "",
  fieldOfStudy: "",
  percentage: "",
  skills: "",
};
