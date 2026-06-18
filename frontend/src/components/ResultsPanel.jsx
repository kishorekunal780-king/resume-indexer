import React, { useState } from "react";
import { Check, CheckCircle, ShieldAlert, Briefcase, Mail, Phone, ExternalLink, Link, Award, FileText, Eye } from "lucide-react";

export default function ResultsPanel({ data }) {
  const [activeTab, setActiveTab] = useState("recommendations");

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



  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Column 1: Breakdown & Metadata */}
      <div className="space-y-6 lg:col-span-1">

        {/* Education Section */}
        {education && education.length > 0 && (
          <div className="p-6 rounded-2xl border glass-card space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-sky-400 uppercase">
              Education Found
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {education.map((edu, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Column 2 & 3: Tabs & Skills Analysis */}
      <div className="space-y-6 lg:col-span-2">

        {/* Advice Tabs Panel */}
        <div className="border rounded-2xl glass-card overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-800 bg-slate-900/60 p-1">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all ${activeTab === "recommendations"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Recommendations ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab("strengths")}
              className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all ${activeTab === "strengths"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Strengths ({strengths.length})
            </button>
            <button
              onClick={() => setActiveTab("weaknesses")}
              className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all ${activeTab === "weaknesses"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Weaknesses ({weaknesses.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[200px]">
            {activeTab === "strengths" && (
              <ul className="space-y-3">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "weaknesses" && (
              <ul className="space-y-3">
                {weaknesses.map((wk, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "recommendations" && (
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="p-6 rounded-2xl border glass-card space-y-6">

          {/* Section: JD Match Details */}
          {skill_match && skill_match.matched_skills && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-sky-400 uppercase">
                Job Alignment Report
              </h3>

              {/* Matched Skills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Matched Skills ({skill_match.matched_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skill_match.matched_skills.length > 0 ? (
                    skill_match.matched_skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No direct matches.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block">
                  Missing Skills ({skill_match.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skill_match.missing_skills.length > 0 ? (
                    skill_match.missing_skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-900/40 text-slate-400 border border-dashed border-slate-700/60">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No missing skills. Perfect match!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section: Raw Categorized Skills */}
          <div className="space-y-4 border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-semibold tracking-wider text-sky-400 uppercase">
              Candidate Skills Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(skills).map(([category, list]) => (
                <div key={category} className="space-y-1.5 p-3 rounded-xl bg-slate-900/20 border border-slate-800/60">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {category}
                  </span>
                  <div className="flex flex-wrap gap-6 mt-2">
                    {list.map((skill, idx) => (
                      <span key={idx} className="text-slate-200 text-sm">
                        {skill + " . "}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
