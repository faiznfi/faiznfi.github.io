import { motion } from "motion/react";
import { Briefcase, GraduationCap, Code, Mail, Github, Linkedin } from "lucide-react";
import { resumeData } from "../data";

export function Resume() {
  return (
    <section id="resume" className="py-24 relative z-10 bg-[#0F0F12]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8"
        >
          <div>
            <span className="font-mono text-cyan-500 text-[10px] mb-2 block uppercase tracking-widest">// PROFESSIONAL_RECORD</span>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none text-[#E0E0E6]">Interactive<br/>Resume</h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-white/5 p-1">
          {/* Main Content Column */}
          <div className="lg:col-span-8 bg-[#0A0A0C] p-8 md:p-12 space-y-16">
            
            {/* Experience Section */}
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.2 }}
                className="flex items-center gap-3 mb-10"
              >
                <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-cyan-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-widest">Experience</h3>
              </motion.div>
              
              <div className="space-y-12 relative">
                {resumeData.experiences.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative pl-6 border-l border-white/10 hover:border-cyan-500/50 transition-colors"
                  >
                    {/* Timeline node */}
                    <div className="absolute -left-[5px] top-2 w-2 h-2 bg-cyan-500 rounded-none rotate-45"></div>
                    
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <h4 className="text-xl font-bold text-[#E0E0E6] uppercase tracking-tight">{exp.role}</h4>
                        <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest border border-cyan-500/30 px-2 py-1 bg-cyan-500/5">
                          {exp.period}
                        </span>
                      </div>
                      <div className="text-white/60 text-xs font-mono uppercase tracking-widest">{exp.company}</div>
                    </div>
                    
                    <ul className="space-y-3 mb-6 text-white/40 text-xs leading-relaxed uppercase">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-cyan-500 mt-0.5">▹</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 text-white/60 uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.2 }}
                className="flex items-center gap-3 mb-10"
              >
                <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-cyan-500">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-widest">Education</h3>
              </motion.div>
              
              <div className="space-y-12 relative">
                {resumeData.education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative pl-6 border-l border-white/10 hover:border-cyan-500/50 transition-colors"
                  >
                     <div className="absolute -left-[5px] top-2 w-2 h-2 bg-cyan-500 rounded-none rotate-45"></div>
                    <div>
                      <h4 className="text-lg font-bold text-[#E0E0E6] uppercase tracking-tight">{edu.degree}</h4>
                      <div className="text-white/60 text-xs font-mono uppercase tracking-widest mt-1 mb-2">{edu.institution}</div>
                      <div className="text-cyan-500 text-[10px] font-mono uppercase">{edu.period}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-1 bg-transparent">
            {/* Skills */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ amount: 0.2 }}
               transition={{ duration: 0.5 }}
               className="bg-[#0A0A0C] p-8 flex-1"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-cyan-500">
                  <Code className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#E0E0E6]">Core Capabilities</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-white/5 border border-white/10 text-[10px] uppercase font-mono text-white/60">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ amount: 0.2 }}
               transition={{ duration: 0.5, delay: 0.1 }}
               className="bg-[#0A0A0C] p-8 flex-1"
            >
              <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mb-6">Terminal / Comm</h3>
              <div className="space-y-6">
                <a href={`mailto:${resumeData.email}`} className="flex items-center gap-4 text-white/60 hover:text-cyan-400 transition-colors group">
                  <div className="w-8 h-8 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest truncate">{resumeData.email}</span>
                </a>
                <a href={`https://${resumeData.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-white/60 hover:text-cyan-400 transition-colors group">
                  <div className="w-8 h-8 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/30">
                    <Github className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest truncate">{resumeData.github}</span>
                </a>
                <a href={`https://${resumeData.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-white/60 hover:text-cyan-400 transition-colors group">
                  <div className="w-8 h-8 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/30">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest truncate">{resumeData.linkedin}</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
