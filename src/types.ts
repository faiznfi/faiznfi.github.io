export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  tags: string[];
  icon: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string[];
  skills: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
}

export interface ResumeData {
  name: string;
  title: string;
  summary: string;
  email: string;
  github: string;
  linkedin: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
}
