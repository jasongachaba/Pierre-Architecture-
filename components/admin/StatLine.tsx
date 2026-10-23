
"use client";

import { motion } from "motion/react";

interface StatLineProps {
  number: string;
  label: string;
  description: string;
  index: number;
}

export default function StatLine({
  number,
  label,
  description,
  index,
}: StatLineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
      }}
      className="group border-t border-[#1c1c1a]/10 py-6"
    >
      <div className="grid grid-cols-[1fr_auto] items-end gap-6">

        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#77736c]">
            {label}
          </p>

          <p className="mt-2 text-xs text-[#77736c]">
            {description}
          </p>
        </div>

        <p className="text-4xl font-light tracking-[-0.04em] transition-colors duration-300 group-hover:text-[#9b7b54] sm:text-5xl">
          {number}
        </p>

      </div>
    </motion.div>
  );
}