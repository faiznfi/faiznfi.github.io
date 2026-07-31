import { ResumeData, Project } from "./types";

export const projectsData: Project[] = [
  {
    id: "followers-analysis",
    title: "Followers Analysis",
    description: "A client-side web application to quickly and securely analyze your Instagram followers, following, mutuals, fans, non-followers, recently unfollowed, blocked profiles, and pending requests.",
    link: "https://faiznfi.github.io/followers-analysis",
    tags: ["Analytics", "Data", "Instagram"],
    icon: "bar-chart",
  },
  {
    id: "jejak-indonesia",
    title: "Jejak Indonesia",
    description: "Interactive cartography of the archipelago. Mapping personal milestones across the Indonesian geography.",
    link: "https://faiznfi.github.io/jejakindonesia",
    tags: ["Map", "Geolocation", "Tracking"],
    icon: "map-pin",
  },
  {
    id: "e-commerce-prediction",
    title: "E-Commerce Prediction",
    description: "Ensemble learning models for predicting potential buyers. Developed for Master's thesis research.",
    link: "http://ijcs.net/ijcs/index.php/ijcs/article/view/3690/405",
    tags: ["Machine Learning", "AI", "Data Science"],
    icon: "sparkles",
  }
];

export const resumeData: ResumeData = {
  name: "Faiz Insani",
  title: "Data Enthusiast",
  summary: "",
  email: "faiznfi@gmail.com",
  github: "github.com/faiznfi",
  linkedin: "linkedin.com/in/faiznfi",
  skills: [
    "Data Analytics", "Machine Learning", "Kafka", "Spark", "Hive", "ClickHouse",
    "Airflow", "Google Analytics", "Looker Studio", "Python", "SQL", "CI/CD"
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Principal Data Engineer",
      company: "PT. GOTO GOJEK TOKOPEDIA TBK",
      period: "Sep 2025 - Present",
      description: [
        "Led end-to-end design and implementation of enterprise-level Supply SSOT tables.",
        "Designed and implemented a Data Quality Framework to proactively detect data anomalies.",
        "Built and optimized large-scale data pipelines using MaxCompute SQL, Airflow, and GitLab."
      ],
      skills: ["MaxCompute", "Airflow", "Data Quality", "SQL"]
    },
    {
      id: "exp-2",
      role: "Lead Data Engineer",
      company: "Bytedance Ltd",
      period: "Jan 2024 - Aug 2025",
      description: [
        "Developed a data quality framework across all data engineering processes.",
        "Led the migration of data pipelines from GCP to ByteDance's internal environment.",
        "Built and optimized ETL/ELT pipelines using Apache Kafka, Apache Spark, and HiveSQL."
      ],
      skills: ["Kafka", "Spark", "HiveSQL", "GCP"]
    },
    {
      id: "exp-3",
      role: "Senior Data Engineer",
      company: "PT. Tokopedia",
      period: "Oct 2018 - Dec 2023",
      description: [
        "Specialized in Google Tag Manager for version control and deployment across platforms.",
        "Expert in GA360 & GA4: Configured end-to-end setup and managed BigQuery exports.",
        "Led tracker development and QA efforts, identifying gaps in data capture."
      ],
      skills: ["GTM", "GA360", "GA4", "BigQuery"]
    },
    {
      id: "exp-4",
      role: "Software Engineer & Data Analyst",
      company: "PT. Pasifik Satelit Nusantara",
      period: "Mar 2018 - Sep 2018",
      description: [
        "Maintained and developed the C-BOSS ERP system using PHP-CodeIgniter.",
        "Led data migration using Python (ETL) from MySQL to NoSQL Cassandra Cluster."
      ],
      skills: ["Python", "Cassandra", "MySQL", "PHP"]
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Master of Information Technology",
      institution: "Universitas Indonesia",
      period: "2022 - 2024"
    },
    {
      id: "edu-2",
      degree: "Bachelor of Information System",
      institution: "Sepuluh Nopember Institute of Technology",
      period: "2014 - 2018"
    }
  ]
};
