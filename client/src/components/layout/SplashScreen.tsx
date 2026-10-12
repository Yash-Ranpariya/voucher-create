import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#E8EDF4]"
      exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-[#4667A8] blur-[60px] opacity-10 animate-pulse" />
        <div className="relative bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-xl">
          <Wallet className="w-20 h-20 text-[#4667A8]" strokeWidth={1.5} />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-10 text-center"
      >
        <h1 className="text-5xl font-extrabold text-[#1E293B] tracking-widest mb-3">
          EXPENSE<span className="text-[#4667A8] font-light">MGR</span>
        </h1>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="text-[#64748B] tracking-[0.3em] text-sm uppercase font-medium"
        >
          Secure Fintech Edition
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
