export type ProjectIcon = "fingerprint" | "bar-chart" | "map-pin" | "sparkles";

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  tags: string[];
  icon: ProjectIcon;
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
  /** Optional short bio; rendered in the resume section when non-empty. */
  summary?: string;
  email: string;
  github: string;
  linkedin: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
}
