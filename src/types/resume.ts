export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  jobTitle: string;
}

export type EducationLevel = '10th' | '12th' | 'diploma' | 'graduation' | 'post-graduation' | 'phd' | 'other';

export interface Education {
  id: string;
  level: EducationLevel;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  percentage: string;
  isOptional?: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
}

export const educationLevels: { value: EducationLevel; label: string; optional?: boolean }[] = [
  { value: '10th', label: '10th (High School)' },
  { value: '12th', label: '12th (Intermediate)', optional: true },
  { value: 'diploma', label: 'Diploma', optional: true },
  { value: 'graduation', label: 'Graduation (Bachelor\'s)' },
  { value: 'post-graduation', label: 'Post Graduation (Master\'s)', optional: true },
  { value: 'phd', label: 'PhD / Doctorate', optional: true },
  { value: 'other', label: 'Other', optional: true },
];

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    jobTitle: '',
  },
  education: [],
  experience: [],
  skills: [],
};
