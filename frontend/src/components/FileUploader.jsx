import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle, FileCheck, CheckCircle2, Clipboard } from "lucide-react";

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

  const handlePasteJd = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setJdText(clipboardText);
      }
    } catch (err) {
      console.warn("Clipboard access denied or unsupported by browser:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger p-4 rounded-2xl text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Resume Upload Zone */}
      <div className="space-y-4 glass-card rounded-3xl p-6 md:p-8 border border-brand-border">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black tracking-widest text-brand-accent uppercase">
            1. Upload Resume (Required)
          </label>
          {resume && (
            <span className="px-2.5 py-0.5 rounded-full bg-brand-success/10 border border-brand-success/20 text-[10px] font-bold text-brand-success uppercase tracking-wider">
              Selected
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!resume ? (
            <motion.div
              key="empty-resume"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => resumeInputRef.current.click()}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-brand-accent/20 rounded-2xl bg-brand-secondary/40 hover:bg-brand-accent/5 hover:border-brand-accent/60 transition-all duration-300 cursor-pointer group"
              whileHover={{ scale: 0.995 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="file"
                ref={resumeInputRef}
                onChange={handleResumeChange}
                accept=".pdf"
                className="hidden"
              />
              <div className="p-4 mb-4 bg-brand-accent/15 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-brand-accent" />
              </div>
              <p className="text-base font-bold text-brand-text text-center">
                Drag & drop your resume PDF here, or{" "}
                <span className="text-brand-accent underline group-hover:text-indigo-400">browse</span>
              </p>
              <p className="mt-2 text-xs text-brand-text-muted">PDF format only (Max 5MB)</p>
            </motion.div>
          ) : (
            <motion.div
              key="selected-resume"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-center justify-between p-5 bg-brand-secondary/40 border border-brand-border rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-accent/10 border border-brand-accent/15">
                  <FileCheck className="w-6 h-6 text-brand-accent" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-brand-text truncate max-w-[200px] sm:max-w-md">
                    {resume.name}
                  </p>
                  <p className="text-xs text-brand-text-muted">
                    {(resume.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearResume}
                className="p-2 rounded-xl text-brand-text-muted hover:bg-brand-border hover:text-brand-text transition-colors"
                aria-label="Remove resume"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Job Description Upload Zone (Optional) */}
      <div className="space-y-4 glass-card rounded-3xl p-6 md:p-8 border border-brand-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="text-xs font-black tracking-widest text-brand-accent-sec uppercase">
            2. Target Job Description (Optional)
          </label>
          <div className="flex gap-2.5 bg-brand-secondary/60 p-1 rounded-xl border border-brand-border self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setJdInputMode("text")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                jdInputMode === "text"
                  ? "bg-brand-accent text-white shadow-md shadow-brand-accent/10"
                  : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Copy-Paste
            </button>
            <button
              type="button"
              onClick={() => setJdInputMode("file")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                jdInputMode === "file"
                  ? "bg-brand-accent-sec text-white shadow-md shadow-brand-accent-sec/10"
                  : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Upload PDF
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {jdInputMode === "text" ? (
            <motion.div
              key="jd-text-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative rounded-2xl border border-brand-border bg-brand-secondary/40 focus-within:border-brand-accent/50 focus-within:ring-2 focus-within:ring-brand-accent/15 transition-all p-3"
            >
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job description here to analyze matching skills and scoring criteria..."
                rows={5}
                className="w-full bg-transparent text-sm text-brand-text placeholder:text-brand-text-muted/50 caret-brand-accent focus:outline-none resize-none px-2 py-1 leading-relaxed"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/40 px-2">
                <button
                  type="button"
                  onClick={handlePasteJd}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-border text-xs font-bold text-brand-text-muted hover:text-brand-text transition-all"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  Paste
                </button>
                <div className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                  {jdText.length} Characters
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="jd-file-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              {!jdFile ? (
                <div
                  onClick={() => jdFileInputRef.current.click()}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl bg-brand-secondary/40 border-brand-accent-sec/20 hover:bg-brand-accent-sec/5 hover:border-brand-accent-sec/60 transition-all duration-300 cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={jdFileInputRef}
                    onChange={handleJdFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  <div className="p-3 mb-3 bg-brand-accent-sec/15 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-brand-accent-sec" />
                  </div>
                  <p className="text-sm font-bold text-brand-text text-center">
                    Drag & drop job description PDF here, or{" "}
                    <span className="text-brand-accent-sec underline group-hover:text-purple-400">browse</span>
                  </p>
                  <p className="mt-1.5 text-xs text-brand-text-muted">PDF format only (Max 5MB)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-brand-secondary/40 border border-brand-border rounded-xl animate-scaleUp">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-brand-accent-sec/10 border border-brand-accent-sec/15">
                      <CheckCircle2 className="w-5 h-5 text-brand-accent-sec" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-text truncate max-w-[200px] sm:max-w-md">
                        {jdFile.name}
                      </p>
                      <p className="text-xs text-brand-text-muted">
                        {(jdFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearJdFile}
                    className="p-2 rounded-xl text-brand-text-muted hover:bg-brand-border hover:text-brand-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Action */}
      <motion.button
        type="submit"
        disabled={isLoading || !resume}
        className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${
          isLoading || !resume
            ? "bg-brand-card border border-brand-border text-brand-text-muted cursor-not-allowed opacity-60"
            : "bg-gradient-to-r from-brand-accent via-indigo-600 to-brand-accent-sec hover:opacity-95 text-white hover:shadow-brand-accent/20"
        }`}
        whileHover={!isLoading && resume ? { scale: 1.01, y: -1 } : {}}
        whileTap={!isLoading && resume ? { scale: 0.99 } : {}}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing Resume & Matching Keywords...
          </>
        ) : (
          <span>Run Analysis</span>
        )}
      </motion.button>
    </form>
  );
}
