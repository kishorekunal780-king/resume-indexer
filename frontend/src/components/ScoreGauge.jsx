import React, { useEffect, useState } from "react";

export default function ScoreGauge({ score, label = "ATS SCORE" }) {
  const [offset, setOffset] = useState(314);
  const radius = 100;
  const circumference = 2 * Math.PI * radius; // ~314.159

  useEffect(() => {
    // Small delay to trigger initial page transition animation
    const timer = setTimeout(() => {
      const progressOffset = circumference - (score / 100) * circumference;
      setOffset(progressOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  // Determine colors based on thresholds
  const getColorClasses = (val) => {
    if (val < 50) return {
      progressColor: "#ef4444"
    };
    if (val >= 50 && val < 70) return {
      progressColor: "#f59e0b"
    };
    return {
      progressColor: "#059669"

    };
  };

  const style = getColorClasses(score);
  console.log(radius);

  return (
    <div className={`flex flex-col items-center justify-center p-10 rounded-2xl border glass-card ${style.bg} ${style.border} ${style.glow} shadow-xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02]`}>
      <div
        className="relative w-[300px] h-[300px]"
      >
        {/* Background track circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 250 250">
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="#334155"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated active progress circle */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke={style.progressColor}
            style={{
              filter: `drop-shadow(0 0 12px ${style.progressColor})`
            }}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Centered Score Label */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
        >
          <span
            className={`font-black leading-none ${style.text}`}
            style={{ fontSize: "100px" }}
          >
            {score.toFixed(0)}
          </span>
          <span className="text-lg text-slate-400 -mt-1">
            /100
          </span>
        </div>
      </div>
      <p className="mt-8 text-lg font-bold tracking-[0.4em] text-slate-300 uppercase">
        {label}
      </p>
    </div>
  );
}
