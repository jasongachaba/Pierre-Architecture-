"use client";

import { motion, type MotionValue } from "motion/react";

interface BuildingVolumeProps {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
  rotate: MotionValue<number>;
}

export default function BuildingVolume({
  opacity,
  scale,
  rotate,
}: BuildingVolumeProps) {
  return (
    <motion.div
      style={{
        opacity,
        scale,
        rotate,
      }}
      className="
        absolute
        left-1/2
        top-1/2
        h-[260px]
        w-[300px]
        -translate-x-1/2
        -translate-y-1/2
        md:h-[360px]
        md:w-[420px]
      "
    >
      {/* =====================================================
          FACE AVANT
      ====================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-0
          h-[72%]
          w-[72%]
          border
          border-[#1c1c1a]
          bg-white/70
        "
      >
        {/* Fenêtre gauche */}

        <div
          className="
            absolute
            left-[12%]
            top-[15%]
            h-[28%]
            w-[28%]
            border
            border-[#1c1c1a]
          "
        />

        {/* Fenêtre droite */}

        <div
          className="
            absolute
            right-[12%]
            top-[15%]
            h-[28%]
            w-[28%]
            border
            border-[#1c1c1a]
          "
        />

        {/* Porte */}

        <div
          className="
            absolute
            bottom-0
            left-[40%]
            h-[45%]
            w-[20%]
            border-x
            border-t
            border-[#1c1c1a]
          "
        />
      </div>

      {/* =====================================================
          FACE LATÉRALE
      ====================================================== */}

      <div
        className="
          absolute
          bottom-0
          right-0
          h-[72%]
          w-[28%]
          origin-left
          skew-y-[-25deg]
          border
          border-[#1c1c1a]
          bg-[#e8e3d9]
        "
      />

      {/* =====================================================
          TOIT
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          top-[14%]
          h-px
          w-[72%]
          bg-[#1c1c1a]
        "
      />

      <div
        className="
          absolute
          right-[28%]
          top-[14%]
          h-[78px]
          w-px
          origin-top
          rotate-[65deg]
          bg-[#1c1c1a]
        "
      />

      {/* =====================================================
          SOL
      ====================================================== */}

      <div
        className="
          absolute
          bottom-[-12px]
          left-[-10%]
          h-px
          w-[120%]
          bg-[#a77b4e]
        "
      />
    </motion.div>
  );
}