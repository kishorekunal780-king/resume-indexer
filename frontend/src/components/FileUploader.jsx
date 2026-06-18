import React, { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, FileCheck, CheckCircle2 } from "lucide-react";

export default function FileUploader({ onAnalyze, isLoading }) {
  const [resume, setResume] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [jdInputMode, setJdInputMode] = useState("text"); // "text" or "file"
  const [error, setError] = useState("");

  const resumeInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported for resumes.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Resume file size exceeds the 5MB limit.");
        return;
      }
      setResume(file);
      setError("");
    }
  };

  const handleJdFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported for job descriptions.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Job description file size exceeds the 5MB limit.");
        return;
      }
      setJdFile(file);
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resume) {
      setError("Please upload a resume first.");
      return;
    }
    setError("");
    onAnalyze({
      resume,
      jdFile: jdInputMode === "file" ? jdFile : null,
      jdText: jdInputMode === "text" ? jdText : "",
    });
  };

  const clearResume = () => {
    setResume(null);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const clearJdFile = () => {
    setJdFile(null);
    if (jdFileInputRef.current) jdFileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Resume Upload Zone */}
      <div className="space-y-4 glass-card rounded-2xl p-6 border border-white/10">
        <label className="block text-sm font-semibold tracking-wide text-sky-400 uppercase">
          1. Upload Resume (Required)
        </label>

        {!resume ? (
          <div
            onClick={() => resumeInputRef.current.click()}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-sky-500/30 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-sky-500/60 transition-all duration-300 cursor-pointer group"
          >
            <input
              type="file"
              ref={resumeInputRef}
              onChange={handleResumeChange}
              accept=".pdf"
              className="hidden"
            />
            <div className="p-4 mb-4 bg-sky-500/10 rounded-2xl">
              <Upload className="w-10 h-10 text-sky-400" />
            </div>
            <p className="text-lg font-medium text-slate-200">
              Drag and drop your resume PDF here, or{" "}
              <span className="text-sky-400 underline group-hover:text-sky-300">browse</span>
            </p>
            <p className="mt-3 text-sm text-slate-400">PDF formats only (Max 5MB)</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-sky-500/10">
                <FileCheck className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {resume.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(resume.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearResume}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Job Description Upload Zone (Optional) */}
      <div className="space-y-4 glass-card rounded-2xl p-6 border border-white/10 mt-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold tracking-wide text-sky-400 uppercase">
            2. Target Job Description (Optional)
          </label>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setJdInputMode("text")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all shadow-lg hover:scale-105 ${jdInputMode === "text"
                ? "bg-white text-slate-900 border border-white shadow-[0_0_10px_rgba(255,255,255,0.9)] hover:shadow-[0_0_25px_rgba(255,255,255,1)]"
                : "bg-slate-800 text-slate-300 border-slate-600 hover:border-sky-400 hover:shadow-sky-500/30"
                }`}
            >
              Copy-Paste
            </button>
            <button
              type="button"
              onClick={() => setJdInputMode("file")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all shadow-lg hover:scale-105 ${jdInputMode === "file"
                ? "bg-white text-slate-900 border border-white shadow-[0_0_10px_rgba(255,255,255,0.9)] hover:shadow-[0_0_25px_rgba(255,255,255,1)]"
                : "bg-slate-800 text-slate-300 border-slate-600 hover:border-indigo-400 hover:shadow-indigo-500/30"
                }`}
            >
              Upload PDF
            </button>
          </div>
        </div>

        {jdInputMode === "text" ? (
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste target job description details here to assess skill match percentage..."
            rows={5}
            style={{ color: "white", WebkitTextFillColor: "white" }}
            className="w-full p-4 rounded-2xl bg-[#0f172a] border border-white/10 text-white placeholder:text-slate-500 caret-white focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 resize-y appearance-none"
          />
        ) : (
          <div>
            {!jdFile ? (
              <div
                onClick={() => jdFileInputRef.current.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer bg-slate-900/30 border-slate-700/60 hover:bg-slate-900/50 hover:border-sky-500/40 transition-all duration-300 group"
              >
                <input
                  type="file"
                  ref={jdFileInputRef}
                  onChange={handleJdFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <div className="p-2 mb-2 bg-slate-800/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5 h-5 text-sky-400" />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Drag & drop JD PDF here, or{" "}
                  <span className="text-sky-400 underline group-hover:text-sky-300">browse</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">PDF formats only (Max 5MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-900/40 border-sky-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-sky-500/10">
                    <CheckCircle2 className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                      {jdFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(jdFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearJdFile}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isLoading || !resume}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isLoading || !resume
          ? "bg-white text-black font-black border border-white shadow-[0_0_20px_rgba(255,255,255,1)] hover:shadow-[0_0_25px_rgba(255,255,255,1)] hover:scale-100"
          : "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-[0_0_25px_rgba(59,130,246,0.7)] hover:shadow-[0_0_45px_rgba(59,130,246,1)] hover:scale-[1.02]"
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing Resume & Extraction...
          </>
        ) : (
          <span className="font-extrabold text-black text-lg tracking-wide">
            Run Analysis
          </span>
        )}
      </button>
    </form>
  );
}
