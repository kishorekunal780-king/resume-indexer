import { useState } from "react";
import { Cpu, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "./components/FileUploader";
import ResultsPanel from "./components/ResultsPanel";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState("");


  const handleAnalyze = async ({ resume, jdFile, jdText }) => {
    setIsLoading(true);
    setError("");
    setAnalysisData(null);

    const formData = new FormData();
    formData.append("resume", resume);

    if (jdFile) {
      formData.append("job_description_file", jdFile);
    } else if (jdText && jdText.trim()) {
      formData.append("job_description_text", jdText.trim());
    }

    try {
      const response = await fetch("https://resume-indexer-api.onrender.com/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || "Failed to analyze the resume document. Please check the backend connection.");
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-brand-accent/30 selection:text-brand-text bg-brand-primary">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] accent-glow-primary rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] accent-glow-secondary rounded-full blur-3xl pointer-events-none" />

      {/* FIXED TOP HEADER - 70px */}
      <header className="fixed top-0 left-0 right-0 h-[70px] z-50 glass-card bg-brand-primary/80 backdrop-blur-xl border-b border-brand-border flex items-center justify-between px-6 md:px-16">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
          <div className="p-2 bg-gradient-to-tr from-brand-accent to-brand-accent-sec rounded-xl shadow-lg shadow-brand-accent/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-brand-text font-sans">
            RESUME INDEXER
          </span>
        </div>

        <div className="hidden sm:block text-xs font-semibold tracking-[0.25em] text-brand-text-muted uppercase">
          {analysisData ? "Analysis Report" : "Resume Intelligence"}
        </div>

        <div className="flex items-center gap-4">
          {analysisData && (
            <button
              onClick={handleReset}
              className="px-4 py-1.5 rounded-lg border border-brand-border bg-brand-card text-xs font-bold uppercase tracking-wider text-brand-text hover:bg-brand-border transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload New
            </button>
          )}


        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-[110px] pb-16 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {!analysisData ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full flex flex-col items-center"
            >
              {/* HERO SECTION */}
              <div className="text-center space-y-4 max-w-3xl mx-auto mb-12 relative">

                
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-brand-text font-sans">
                  Resume Intelligence <br className="hidden md:inline" />
                  <span className="bg-gradient-to-r from-brand-accent via-indigo-400 to-brand-accent-sec bg-clip-text text-transparent">
                    Platform
                  </span>
                </h2>
                
                <p className="text-brand-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  Analyze resumes, identify skill gaps, improve ATS scores, and optimize job alignment using AI-powered insights.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-[900px] mb-6 flex items-center gap-3 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-4 rounded-2xl text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Analysis Failed</p>
                    <p className="text-xs opacity-80 mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Main Drag-Drop Card */}
              <div className="w-full max-w-[900px]">
                <FileUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="space-y-8 w-full"
            >
              {/* Results Top Header */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-brand-border pb-6">
                <div className="text-center md:text-left space-y-1">
                  <h2 className="text-3xl font-black text-brand-text tracking-tight font-sans">
                    Resume Analysis Outcomes
                  </h2>
                  <p className="text-brand-text-muted text-sm">
                    Review matching parameters, skills gaps, and checklist recommendations below.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-border text-sm font-semibold text-brand-text hover:text-white transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Analyze New File
                  </button>
                </div>
              </div>

              {/* Main Dashboard Panel Component */}
              <ResultsPanel data={analysisData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 text-center text-xs text-brand-text-muted border-t border-brand-border bg-brand-primary/40 relative z-10">
        <p>© Solvrex. Developed for Solverex.</p>
      </footer>
    </div>
  );
}
