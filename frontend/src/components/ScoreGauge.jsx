import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScoreGauge({ score, label = "ATS SCORE" }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius; // ~565.48
  const [offset, setOffset] = useState(circumference);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Circle progress animation
    const timer = setTimeout(() => {
      const progressOffset = circumference - (score / 100) * circumference;
      setOffset(progressOffset);
    }, 200);

    return () => clearTimeout(timer);
  }, [score, circumference]);

  useEffect(() => {
    // Numerical count-up animation
    let start = 0;
    const end = Math.round(score);
    if (end === 0) {
      const t = setTimeout(() => setDisplayScore(0), 0);
      return () => clearTimeout(t);
    }
    
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / end), 10);
    
    const timer = setInterval(() => {
      start += 1;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Determine colors based on rating levels
  const getRatingStyle = (val) => {
    if (val < 50) {
      return {
        color: "#EF4444", // Danger
        glowClass: "shadow-red-500/10 border-red-500/20",
        textClass: "text-brand-danger"
      };
    }
    if (val >= 50 && val < 70) {
      return {
        color: "#F59E0B", // Warning
        glowClass: "shadow-amber-500/10 border-amber-500/20",
        textClass: "text-brand-warning"
      };
    }
    return {
      color: "#22C55E", // Success
      glowClass: "shadow-emerald-500/10 border-emerald-500/20",
      textClass: "text-brand-success"
    };
  };

  const style = getRatingStyle(score);

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border glass-card shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.01] w-full ${style.glowClass}`}>
      
      {/* Background soft glow glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500" 
        style={{ backgroundColor: style.color }}
      />

      <div className="relative w-[240px] h-[240px] z-10 flex items-center justify-center">
        {/* SVG Circular Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220">
          {/* Background track circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="var(--color-brand-border)"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated active progress circle */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            stroke={style.color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${style.color}cc)`
            }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Centered Score Label */}
        <div className="absolute flex flex-col items-center justify-center select-none">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-6xl font-black tracking-tighter text-brand-text font-sans leading-none flex items-baseline justify-center"
          >
            {displayScore}
            <span className="text-sm font-semibold text-brand-text-muted/60 tracking-normal ml-0.5">/100</span>
          </motion.span>
          <span className="text-[10px] font-bold tracking-[0.25em] text-brand-text-muted uppercase mt-2">
            Match Index
          </span>
        </div>
      </div>

      <p className="mt-6 text-xs font-black tracking-[0.3em] text-brand-text-muted uppercase z-10">
        {label}
      </p>
    </div>
  );
}
