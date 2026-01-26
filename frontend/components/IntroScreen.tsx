import React, { useEffect, useState } from 'react';
import { ScanEye, Fingerprint, Lock, ChevronRight } from 'lucide-react';

const IntroScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setStep(1), 500),  // Biometric Scan
      setTimeout(() => setStep(2), 1500), // Decrypting
      setTimeout(() => setStep(3), 2200), // Access Granted
      setTimeout(() => onComplete(), 2800) // Exit
    ];
    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center font-mono">
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        {/* Animated Rings */}
        <div className={`absolute inset-0 border border-white/20 rounded-full ${step >= 0 ? 'animate-[spin_3s_linear_infinite]' : ''}`}></div>
        <div className={`absolute inset-4 border border-indigo-500/30 rounded-full border-t-transparent ${step >= 0 ? 'animate-[spin_2s_linear_infinite_reverse]' : ''}`}></div>
        <div className={`absolute inset-12 border border-rose-500/20 rounded-full border-b-transparent ${step >= 0 ? 'animate-[spin_4s_linear_infinite]' : ''}`}></div>
        
        {/* Center Icon Changing */}
        <div className="relative z-10 transition-all duration-500 transform">
            {step === 0 && <Lock size={48} className="text-white/50" />}
            {step === 1 && <Fingerprint size={48} className="text-indigo-500 animate-pulse" />}
            {step >= 2 && <ScanEye size={48} className="text-emerald-500" />}
        </div>
      </div>

      {/* Text Sequence */}
      <div className="h-8 flex flex-col items-center justify-center overflow-hidden">
        {step === 0 && <span className="text-xs tracking-[0.3em] text-white/40 animate-pulse">ESTABLISHING SECURE LINK...</span>}
        {step === 1 && <span className="text-xs tracking-[0.3em] text-indigo-400">VERIFYING BIOMETRICS...</span>}
        {step === 2 && <span className="text-xs tracking-[0.3em] text-white">DECRYPTING LEDGER...</span>}
        {step === 3 && <span className="text-sm font-bold tracking-[0.5em] text-emerald-400">ACCESS GRANTED</span>}
      </div>

      {/* Loading Bar */}
      <div className="w-48 h-0.5 bg-white/10 mt-8 rounded-full overflow-hidden">
        <div 
            className="h-full bg-indigo-500 transition-all duration-700 ease-out" 
            style={{ width: step === 0 ? '10%' : step === 1 ? '40%' : step === 2 ? '80%' : '100%' }}
        ></div>
      </div>
    </div>
  );
};

export default IntroScreen;