import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, CheckCircle2, ShieldAlert, 
  Mail, Phone, ExternalLink, Link, Award, 
  FileWarning 
} from "lucide-react";
import ScoreGauge from "./ScoreGauge";

export default function ResultsPanel({ data }) {
  const {
    ats_score,
    skill_match,
    contact_info,
    education,
    skills,
    strengths,
    weaknesses,
    recommendations,
    has_images
  } = data;

  const [activeTab, setActiveTab] = useState("recommendations");

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

  // Split a bullet string into title + description
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

  const tabs = [
    { id: "recommendations", label: "Recommendations", count: recommendations.length },
    { id: "strengths",       label: "Strengths",       count: strengths.length },
    { id: "improvements",    label: "Improvements",    count: weaknesses.length },
  ];

  return (
    <div className="space-y-8">

      {/* LAYOUT: left = gauge + info, right = alignment + tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6 lg:col-span-1">

          {/* 1. ATS Score gauge — centred, prominent */}
          <div className="flex justify-center">
            <div className="w-full">
              <ScoreGauge score={ats_score} />
            </div>
          </div>

          {/* 2. Candidate Information — compact */}
          <div className="p-6 rounded-3xl border glass-card space-y-4">
            <h3 className="text-xs font-black tracking-widest text-brand-accent uppercase border-b border-brand-border pb-3">
              Candidate Information
            </h3>

            {/* Contact rows */}
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

            {/* ATS image warning */}
            {has_images && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-warning/10 border border-brand-warning/20 text-brand-warning text-[10px] font-bold">
                <FileWarning className="w-4 h-4 shrink-0" />
                <span>Images detected. May disrupt standard ATS parse.</span>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div className="pt-3 border-t border-brand-border space-y-2.5">
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

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* 3. Job Alignment Report */}
          {skill_match && (
            <div className="p-6 rounded-3xl border glass-card space-y-5">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <h3 className="text-xs font-black tracking-widest text-brand-accent uppercase">
                  Job Alignment Report
                </h3>
                <span className="text-sm font-black text-brand-text">{skill_match.match_ratio}% Match</span>
              </div>

              <div className="w-full bg-brand-border h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-accent to-brand-accent-sec h-full rounded-full transition-all duration-1000"
                  style={{ width: `${skill_match.match_ratio}%` }}
                />
              </div>

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

          {/* 4. Tabbed Insights: Recommendations | Strengths | Improvements */}
          <div className="rounded-3xl border glass-card overflow-hidden">

            {/* Tab Bar */}
            <div className="flex border-b border-brand-border overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] py-3.5 px-4 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-brand-accent to-brand-accent-sec text-white shadow-inner"
                      : "text-brand-text-muted hover:text-brand-text hover:bg-brand-border/40"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-brand-border text-brand-text-muted"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">

                {activeTab === "recommendations" && (
                  <motion.div
                    key="recommendations"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {recommendations.map((rec, idx) => {
                      const { title, desc } = formatBullet(rec);
                      const priority = getPriority(rec);
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 0.995 }}
                          className="flex gap-4 p-4 rounded-2xl bg-brand-secondary/40 border border-brand-border hover:border-brand-accent/20 transition-all duration-200"
                        >
                          <div className="p-2 rounded-xl bg-brand-accent/10 border border-brand-accent/15 text-brand-accent shrink-0 h-fit mt-0.5">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                              <h4 className="text-sm font-bold text-brand-text">{title}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${priority.color}`}>
                                {priority.label}
                              </span>
                            </div>
                            <p className="text-xs text-brand-text-muted leading-relaxed">{desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {activeTab === "strengths" && (
                  <motion.div
                    key="strengths"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {strengths.map((str, idx) => {
                      const { title, desc } = formatBullet(str);
                      return (
                        <div key={idx} className="flex gap-3 text-xs bg-brand-success/5 border border-brand-success/10 p-4 rounded-2xl transition-all hover:bg-brand-success/10">
                          <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-brand-text text-sm">{title}</h4>
                            <p className="text-brand-text-muted/90 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {activeTab === "improvements" && (
                  <motion.div
                    key="improvements"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {weaknesses.map((wk, idx) => {
                      const { title, desc } = formatBullet(wk);
                      return (
                        <div key={idx} className="flex gap-3 text-xs bg-brand-danger/5 border border-brand-danger/10 p-4 rounded-2xl transition-all hover:bg-brand-danger/10">
                          <ShieldAlert className="w-4 h-4 text-brand-danger shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-brand-text text-sm">{title}</h4>
                            <p className="text-brand-text-muted/90 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* 5. Candidate Skills Profile */}
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
