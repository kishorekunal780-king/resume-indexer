import { motion } from "framer-motion";
import { 
  Check, CheckCircle2, ShieldAlert, 
  Mail, Phone, ExternalLink, Link, Award, 
  FileWarning 
} from "lucide-react";
import ScoreGauge from "./ScoreGauge";

export default function ResultsPanel({ data }) {
  const {
    ats_score,
    breakdown,
    skill_match,
    experience_years,
    required_experience,
    contact_info,
    education,
    skills,
    strengths,
    weaknesses,
    recommendations,
    pages_count,
    has_images
  } = data;

  // Programmatic priority selection
  const getPriority = (recText) => {
    const text = recText.toLowerCase();
    if (text.includes("add") || text.includes("contact") || text.includes("email") || text.includes("phone") || text.includes("linkedin")) {
      return { label: "High Priority", color: "bg-brand-danger/10 text-brand-danger border-brand-danger/20" };
    }
    if (text.includes("keyword") || text.includes("skill") || text.includes("project") || text.includes("missing")) {
      return { label: "Medium Priority", color: "bg-brand-warning/10 text-brand-warning border-brand-warning/20" };
    }
    return { label: "Optimization", color: "bg-brand-accent/10 text-brand-accent border-brand-accent/20" };
  };

  // Programmatic text formatting helper
  const formatBullet = (text) => {
    let title = "Details";
    let desc = text;
    if (text.includes(":")) {
      const parts = text.split(":");
      title = parts[0].trim();
      desc = parts[1].trim();
    } else {
      const words = text.split(" ");
      if (words.length > 4) {
        title = words.slice(0, 4).join(" ");
        desc = words.slice(4).join(" ");
      }
    }
    return { title, desc };
  };

  // Stagger animation rules
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-8">
      {/* 4 SUMMARY STAT CARDS */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: ATS Score */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border glass-card flex flex-col justify-between h-32 hover:border-brand-accent/30 transition-all duration-300">
          <span className="text-[10px] font-black tracking-widest text-brand-text-muted uppercase">ATS Score</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-brand-text">{ats_score.toFixed(0)}%</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              ats_score >= 70 ? "text-brand-success bg-brand-success/10 border-brand-success/20" :
              ats_score >= 50 ? "text-brand-warning bg-brand-warning/10 border-brand-warning/20" :
              "text-brand-danger bg-brand-danger/10 border-brand-danger/20"
            }`}>
              {ats_score >= 70 ? "Excellent" : ats_score >= 50 ? "Average" : "Needs Review"}
            </span>
          </div>
        </motion.div>

        {/* Card 2: Matched Skills */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border glass-card flex flex-col justify-between h-32 hover:border-brand-accent/30 transition-all duration-300">
          <span className="text-[10px] font-black tracking-widest text-brand-text-muted uppercase">Matched Skills</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-brand-text">
              {skill_match?.matched_skills?.length || 0}
            </span>
            <span className="text-[10px] font-bold text-brand-success">Aligned</span>
          </div>
        </motion.div>

        {/* Card 3: Missing Skills */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border glass-card flex flex-col justify-between h-32 hover:border-brand-accent/30 transition-all duration-300">
          <span className="text-[10px] font-black tracking-widest text-brand-text-muted uppercase">Missing Requirements</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-brand-text">
              {skill_match?.missing_skills?.length || 0}
            </span>
            <span className="text-[10px] font-bold text-brand-danger">Remaining</span>
          </div>
        </motion.div>

        {/* Card 4: Recommendations */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border glass-card flex flex-col justify-between h-32 hover:border-brand-accent/30 transition-all duration-300">
          <span className="text-[10px] font-black tracking-widest text-brand-text-muted uppercase">Recommendations</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-brand-text">
              {recommendations?.length || 0}
            </span>
            <span className="text-[10px] font-bold text-brand-accent">Actions</span>
          </div>
        </motion.div>
      </motion.div>

      {/* DASHBOARD GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: GAUGES & METADATA */}
        <div className="space-y-6 lg:col-span-1">
          {/* ATS Score Showcase card */}
          <div className="space-y-4">
            <ScoreGauge score={ats_score} />
            
            {/* Score Breakdown inside premium card */}
            <div className="p-6 rounded-3xl border glass-card space-y-4">
              <h3 className="text-xs font-black tracking-widest text-brand-accent uppercase border-b border-brand-border pb-3">
                Score Breakdown
              </h3>
              
              <div className="space-y-3.5">
                {/* Section completness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-brand-text-muted">Section Completeness</span>
                    <span className="text-brand-text">{breakdown.section_score}/20</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-accent h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(breakdown.section_score / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Skills Density */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-brand-text-muted">Role Skills Density</span>
                    <span className="text-brand-text">{breakdown.skills_score}/40</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(breakdown.skills_score / 40) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Experience Suitability */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-brand-text-muted">Tenure Suitability</span>
                    <span className="text-brand-text">{breakdown.experience_score}/20</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-accent-sec h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(breakdown.experience_score / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Formatting */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-brand-text-muted">Layout & Formatting</span>
                    <span className="text-brand-text">{breakdown.formatting_score}/20</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-success h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(breakdown.formatting_score / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Metadata profile */}
          <div className="p-6 rounded-3xl border glass-card space-y-4">
            <h3 className="text-xs font-black tracking-widest text-brand-accent uppercase border-b border-brand-border pb-3">
              Candidate Information
            </h3>
            
            {/* Contact Details */}
            <div className="space-y-3">
              {contact_info?.email && (
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="w-4 h-4 text-brand-accent shrink-0" />
                  <span className="text-brand-text truncate">{contact_info.email}</span>
                </div>
              )}
              {contact_info?.phone && (
                <div className="flex items-center gap-3 text-xs">
                  <Phone className="w-4 h-4 text-brand-accent shrink-0" />
                  <span className="text-brand-text">{contact_info.phone}</span>
                </div>
              )}
              {contact_info?.linkedin && (
                <a 
                  href={contact_info.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 text-xs text-brand-text-muted hover:text-brand-accent transition-colors"
                >
                  <Link className="w-4 h-4 text-brand-accent shrink-0" />
                  <span className="truncate underline">LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                </a>
              )}
              {contact_info?.github && (
                <a 
                  href={contact_info.github} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 text-xs text-brand-text-muted hover:text-brand-accent transition-colors"
                >
                  <Link className="w-4 h-4 text-brand-accent shrink-0" />
                  <span className="truncate underline">GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                </a>
              )}
            </div>

            {/* Experience tenure & pages */}
            <div className="pt-4 border-t border-brand-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-text-muted">Estimated Experience:</span>
                <span className="font-bold text-brand-text">{experience_years.toFixed(1)} Years</span>
              </div>
              {required_experience !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-brand-text-muted">Required Experience:</span>
                  <span className="font-bold text-brand-text">{required_experience.toFixed(1)} Years</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-brand-text-muted">Resume Page Count:</span>
                <span className="font-bold text-brand-text">{pages_count} Page{pages_count !== 1 ? "s" : ""}</span>
              </div>
              
              {has_images && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-warning/10 border border-brand-warning/20 text-brand-warning text-[10px] font-bold">
                  <FileWarning className="w-4 h-4 shrink-0" />
                  <span>Images detected. May disrupt standard ATS parse.</span>
                </div>
              )}
            </div>

            {/* Education details */}
            {education && education.length > 0 && (
              <div className="pt-4 border-t border-brand-border space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-muted block">Education</span>
                <ul className="space-y-2">
                  {education.map((edu, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-brand-text leading-snug">
                      <Award className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RECOMMENDATIONS, ALIGNMENT, STRENGTHS, SKILLS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* JOB ALIGNMENT REPORT */}
          {skill_match && (
            <div className="p-6 rounded-3xl border glass-card space-y-5">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h3 className="text-xs font-black tracking-widest text-brand-accent uppercase">
                  Job Alignment Report
                </h3>
                <span className="text-sm font-black text-brand-text">{skill_match.match_ratio}% Match</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-brand-border h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-brand-accent to-brand-accent-sec h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${skill_match.match_ratio}%` }}
                />
              </div>

              {/* Matched tags */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-brand-success uppercase tracking-wider block">
                  Matched Skills ({skill_match.matched_skills.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {skill_match.matched_skills.length > 0 ? (
                    skill_match.matched_skills.map((skill, idx) => (
                      <motion.span 
                        key={idx} 
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 text-xs font-bold rounded-xl bg-brand-success/10 text-brand-success border border-brand-success/20 cursor-default transition-all"
                      >
                        {skill}
                      </motion.span>
                    ))
                  ) : (
                    <span className="text-xs text-brand-text-muted italic">No matching skills detected.</span>
                  )}
                </div>
              </div>

              {/* Missing tags */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-black text-brand-danger uppercase tracking-wider block">
                  Missing Requirements ({skill_match.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {skill_match.missing_skills.length > 0 ? (
                    skill_match.missing_skills.map((skill, idx) => (
                      <motion.span 
                        key={idx} 
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 text-xs font-bold rounded-xl bg-brand-danger/5 text-brand-danger/90 border border-brand-danger/15 border-dashed cursor-default transition-all"
                      >
                        {skill}
                      </motion.span>
                    ))
                  ) : (
                    <span className="text-xs text-brand-text-muted italic">No missing skills. Matching is perfect!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACTION RECOMMENDATIONS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-widest text-brand-accent-sec uppercase px-1">
              Actionable Recommendations ({recommendations.length})
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {recommendations.map((rec, idx) => {
                const { title, desc } = formatBullet(rec);
                const priority = getPriority(rec);
                
                return (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 0.995, borderLeftColor: "var(--color-brand-accent)" }}
                    className="flex gap-4 p-5 rounded-2xl bg-brand-secondary/40 border border-brand-border hover:border-brand-border border-left-4 border-l-transparent transition-all duration-200"
                  >
                    <div className="p-2 rounded-xl bg-brand-accent/10 border border-brand-accent/15 text-brand-accent shrink-0 h-fit mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                        <h4 className="text-sm font-bold text-brand-text truncate pr-2">{title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text-muted leading-relaxed pr-2">{desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="p-6 rounded-3xl border glass-card space-y-4">
              <h3 className="text-xs font-black tracking-widest text-brand-success uppercase border-b border-brand-border pb-3">
                Strengths Detected ({strengths.length})
              </h3>
              <div className="space-y-3.5">
                {strengths.map((str, idx) => {
                  const { title, desc } = formatBullet(str);
                  return (
                    <div key={idx} className="flex gap-3 text-xs bg-brand-success/5 border border-brand-success/10 p-3.5 rounded-xl transition-all hover:bg-brand-success/10">
                      <CheckCircle2 className="w-4.5 h-4.5 text-brand-success shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-brand-text">{title}</h4>
                        <p className="text-brand-text-muted/90 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weaknesses Card */}
            <div className="p-6 rounded-3xl border glass-card space-y-4">
              <h3 className="text-xs font-black tracking-widest text-brand-danger uppercase border-b border-brand-border pb-3">
                Areas of Improvement ({weaknesses.length})
              </h3>
              <div className="space-y-3.5">
                {weaknesses.map((wk, idx) => {
                  const { title, desc } = formatBullet(wk);
                  return (
                    <div key={idx} className="flex gap-3 text-xs bg-brand-danger/5 border border-brand-danger/10 p-3.5 rounded-xl transition-all hover:bg-brand-danger/10">
                      <ShieldAlert className="w-4.5 h-4.5 text-brand-danger shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-brand-text">{title}</h4>
                        <p className="text-brand-text-muted/90 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CANDIDATE SKILLS PROFILE */}
          <div className="p-6 rounded-3xl border glass-card space-y-6">
            <h3 className="text-xs font-black tracking-widest text-brand-accent uppercase border-b border-brand-border pb-3">
              Candidate Skills Profile
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(skills).map(([category, list]) => {
                if (!list || list.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-3 p-4 rounded-2xl bg-brand-secondary/40 border border-brand-border">
                    <span className="text-[10px] font-black tracking-widest text-brand-accent-sec uppercase block">
                      {category}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {list.map((skill, idx) => (
                        <motion.span 
                          key={idx} 
                          whileHover={{ scale: 1.05, borderColor: "var(--color-brand-accent)" }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-card text-brand-text border border-brand-border cursor-default transition-all"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
