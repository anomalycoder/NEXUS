import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const IntroScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0: loading, 1: authenticated, 2: exiting

  useEffect(() => {
    // Smooth progress animation over 1.2 seconds
    const duration = 1200;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);

      // Easing out curve
      const curve = 1 - Math.pow(1 - newProgress / 100, 3);
      setProgress(curve * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setPhase(1); // Set Authenticated

        setTimeout(() => {
          setPhase(2); // Trigger exit animations
          setTimeout(onComplete, 600); // Actually unmount
        }, 500);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#020617] text-white flex flex-col items-center justify-center font-mono overflow-hidden transition-all duration-700 ${phase === 2 ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>

      {/* Subtle Gradient Backlight */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vh] blur-[120px] rounded-full transition-colors duration-700 opacity-20 ${phase === 1 ? 'bg-emerald-500' : 'bg-indigo-600'}`}></div>

      {/* Central Brand */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Massive Typography */}
        <div className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.3em] ml-[0.3em] transition-all duration-700 mb-8 flex items-center justify-center ${phase === 1 ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' : 'text-white'}`}>
          NEXUS
        </div>

        {/* Core Status indicator box below text */}
        <div className="h-6 overflow-hidden flex items-center justify-center mb-12">
          <div className={`flex items-center gap-2 text-sm md:text-base font-bold tracking-[0.2em] transition-all duration-500 transform ${phase === 1 ? 'text-emerald-400 translate-y-0 opacity-100' : 'text-slate-500 translate-y-full opacity-0'}`}>
            <ShieldCheck size={18} />
            <span>SECURE_LINK_ESTABLISHED</span>
          </div>
          <div className={`flex items-center gap-2 text-sm md:text-base font-bold tracking-[0.2em] transition-all duration-500 transform absolute ${phase === 0 ? 'text-indigo-300 translate-y-0 opacity-100' : 'text-indigo-300 -translate-y-full opacity-0'}`}>
            <span>INITIALIZING_KERNEL</span>
            <span className="flex gap-1 items-center justify-center ml-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </div>
        </div>
      </div>

      {/* Precision Progress Bar - Spans entirely across viewport at the bottom third */}
      <div className="absolute bottom-[20%] w-full max-w-2xl px-8 flex flex-col gap-4">
        <div className="flex justify-between items-end w-full px-1">
          <span className="text-[10px] text-slate-500 font-bold tracking-[0.15em] uppercase">Boot Sequence</span>
          <span className={`text-xs font-black tracking-widest transition-colors duration-500 ${phase === 1 ? 'text-emerald-400' : 'text-indigo-400'}`}>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="w-full h-1 bg-white/5 relative overflow-hidden flex items-center">
          <div
            className={`absolute left-0 top-0 bottom-0 transition-opacity transition-colors duration-500 origin-left ease-out ${phase === 1 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

    </div>
  );
};

export default IntroScreen;