import React, { useState } from "react";
import { Sparkles, RefreshCw, AlertCircle, Cpu } from "lucide-react";
import FileUploader from "./components/FileUploader";
import ScoreGauge from "./components/ScoreGauge";
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
      // Direct call to FastAPI backend
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
      setError(JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-sky-500/30 selection:text-sky-200">

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-20 py-6 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center justify-left gap-2.5 ml-8">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-xl shadow-lg shadow-sky-500/10">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-white ">
              RESUME INDEXER
            </h1>
          </div>
        </div>

      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 flex flex-col justify-center">

        {/* Upload State */}
        {!analysisData ? (
          <div className="max-w-2xl mx-auto w-full space-y-4 py-2 -mt-8">
            <div className="text-center space-y-1">

              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Optimize Your Resume for
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Scan your resume PDF, extract matching core keywords, and receive technical feedback mapping to hiring profiles.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-950/40 border border-red-500/20 text-red-300 p-4 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 rounded-2xl border glass-card shadow-2xl relative overflow-hidden">
              {/* Glow overlay */}
              <div className="absolute top-0 right-1/4 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <FileUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          /* Results Dashboard State */
          <div className="space-y-6 animate-fadeIn py-4">

            {/* Summary Top Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800/60 pb-6">
              <div className="text-center md:text-left space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Resume Analysis Outcomes
                </h2>
                <p className="text-slate-400 text-sm">
                  Review matching parameters, skills gaps, and checklist recommendations below.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyze New File
                </button>
              </div>
            </div>

            {/* Score Showcase widget */}
            <div className="flex justify-center mb-10">
              <div className="w-full md:w-auto">
                <ScoreGauge score={analysisData.ats_score} />
              </div>
            </div>

            {/* Comprehensive Results Tabs panels */}
            <ResultsPanel data={analysisData} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-600 border-t border-slate-900/60">
        <p>© Resume Indexer. Developed for Solverex.</p>
      </footer>
    </div>
  );
}
