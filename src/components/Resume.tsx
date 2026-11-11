import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Briefcase, GraduationCap, Code, Mail, Github, Linkedin } from "lucide-react";
import { resumeData } from "../data";
import { fadeUp } from "../lib/motion";
import { SectionHeader } from "./ui/SectionHeader";
import { TagList } from "./ui/Tag";
import { TimelineHeading, TimelineItem } from "./ui/TimelineItem";

interface ContactLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
}

function ContactLink({ href, icon, label, external = false }: ContactLinkProps) {
  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="flex items-center gap-4 text-white/70 hover:text-cyan-400 transition-colors group"
    >
      <span
        aria-hidden="true"
        className="w-8 h-8 shrink-0 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/30"
      >
        {icon}
      </span>
      <span className="text-[11px] font-mono uppercase tracking-widest truncate">{label}</span>
    </a>
  );
}

export function Resume() {
  const { summary, experiences, education, skills, email, github, linkedin } = resumeData;

  return (
    <section id="resume" aria-labelledby="resume-title" className="py-24 relative z-10 bg-[#0F0F12] scroll-mt-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <SectionHeader id="resume-title" label="PROFESSIONAL_RECORD" title={["Interactive", "Resume"]} />

        {summary && (
          <motion.p {...fadeUp()} className="mb-12 max-w-3xl text-white/70 leading-relaxed">
            {summary}
          </motion.p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-white/5 p-1">
          {/* Main column */}
          <div className="lg:col-span-8 bg-[#0A0A0C] p-8 md:p-12 space-y-16">
            <div>
              <TimelineHeading icon={<Briefcase className="w-4 h-4" />}>Experience</TimelineHeading>
              <ol className="space-y-12">
                {experiences.map((exp, index) => (
                  <TimelineItem key={exp.id} index={index}>
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <h4 className="text-xl font-bold text-[#E0E0E6] uppercase tracking-tight">{exp.role}</h4>
                        <span className="self-start shrink-0 text-[11px] font-mono text-cyan-500 uppercase tracking-widest border border-cyan-500/30 px-2 py-1 bg-cyan-500/5">
                          {exp.period}
                        </span>
                      </div>
                      <div className="text-white/70 text-xs font-mono uppercase tracking-widest">{exp.company}</div>
                    </div>

                    <ul className="space-y-3 mb-6 text-white/60 text-sm leading-relaxed">
                      {exp.description.map((desc) => (
                        <li key={desc} className="flex gap-3">
                          <span aria-hidden="true" className="text-cyan-500">▹</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>

                    <TagList items={exp.skills} />
                  </TimelineItem>
                ))}
              </ol>
            </div>

            <div>
              <TimelineHeading icon={<GraduationCap className="w-4 h-4" />}>Education</TimelineHeading>
              <ol className="space-y-12">
                {education.map((edu, index) => (
                  <TimelineItem key={edu.id} index={index}>
                    <h4 className="text-lg font-bold text-[#E0E0E6] uppercase tracking-tight">{edu.degree}</h4>
                    <div className="text-white/70 text-xs font-mono uppercase tracking-widest mt-1 mb-2">{edu.institution}</div>
                    <div className="text-cyan-500 text-[11px] font-mono uppercase">{edu.period}</div>
                  </TimelineItem>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-1">
            <motion.div {...fadeUp()} className="bg-[#0A0A0C] p-8 flex-1">
              <div className="flex items-center gap-3 mb-8">
                <div aria-hidden="true" className="w-8 h-8 border border-white/10 flex items-center justify-center text-cyan-500">
                  <Code className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#E0E0E6]">Core Capabilities</h3>
              </div>
              <TagList items={skills} />
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="bg-[#0A0A0C] p-8 flex-1">
              <h3 className="text-[11px] font-mono text-white/60 uppercase tracking-[0.2em] mb-6">Terminal / Comm</h3>
              <div className="space-y-6">
                <ContactLink href={`mailto:${email}`} icon={<Mail className="w-4 h-4" />} label={email} />
                <ContactLink href={`https://${github}`} icon={<Github className="w-4 h-4" />} label={github} external />
                <ContactLink href={`https://${linkedin}`} icon={<Linkedin className="w-4 h-4" />} label={linkedin} external />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
