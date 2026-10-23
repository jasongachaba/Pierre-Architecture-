"use client";

import { motion, MotionValue } from "motion/react";

interface ElevationProps {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export default function Elevation({
  opacity,
  scale,
}: ElevationProps) {
  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute left-1/2 top-1/2 h-[280px] w-[330px] -translate-x-1/2 -translate-y-1/2 md:h-[360px] md:w-[460px]"
    >
      {/* Bâtiment */}
      <div className="absolute bottom-[15%] left-[8%] h-[62%] w-[84%] border border-[#1c1c1a] bg-white/50">

        {/* Niveau 1 */}
        <div className="absolute left-0 top-0 h-1/2 w-full border-b border-[#1c1c1a]">
          <div className="absolute left-[8%] top-[22%] h-[48%] w-[16%] border border-[#1c1c1a]" />
          <div className="absolute left-[30%] top-[22%] h-[48%] w-[16%] border border-[#1c1c1a]" />
          <div className="absolute right-[30%] top-[22%] h-[48%] w-[16%] border border-[#1c1c1a]" />
          <div className="absolute right-[8%] top-[22%] h-[48%] w-[16%] border border-[#1c1c1a]" />
        </div>

        {/* Niveau 2 */}
        <div className="absolute bottom-0 left-0 h-1/2 w-full">
          <div className="absolute left-[12%] top-[22%] h-[48%] w-[18%] border border-[#1c1c1a]" />
          <div className="absolute left-[41%] top-[22%] h-[48%] w-[18%] border border-[#1c1c1a]" />
          <div className="absolute right-[12%] top-[22%] h-[48%] w-[18%] border border-[#1c1c1a]" />
        </div>
      </div>

      {/* Toit */}
      <div className="absolute bottom-[77%] left-[5%] h-px w-[90%] bg-[#1c1c1a]" />

      <div className="absolute bottom-[77%] left-[12%] h-[35px] w-[76%] border-x border-t border-[#1c1c1a]" />

      {/* Sol */}
      <div className="absolute bottom-[12%] left-0 h-px w-full bg-[#1c1c1a]" />

      {/* Cotes */}
      <div className="absolute right-[-30px] top-[15%] h-[65%] border-r border-[#a77b4e]">
        <span className="absolute right-[-20px] top-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-[8px] tracking-[0.2em] text-[#77736c]">
          9.80 m
        </span>
      </div>

      <span className="absolute bottom-[-32px] left-0 text-[8px] uppercase tracking-[0.25em] text-[#77736c]">
        ÉLÉVATION — FAÇADE PRINCIPALE
      </span>
    </motion.div>
  );
}