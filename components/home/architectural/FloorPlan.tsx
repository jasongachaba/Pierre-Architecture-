"use client";

import { motion, type MotionValue } from "motion/react";

interface FloorPlanProps {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export default function FloorPlan({
  opacity,
  scale,
}: FloorPlanProps) {
  return (
    <motion.div
      style={{
        opacity,
        scale,
        rotate: 0,
      }}
      className="
        absolute
        left-1/2
        top-1/2
        h-[260px]
        w-[300px]
        -translate-x-1/2
        -translate-y-1/2
        md:h-[340px]
        md:w-[420px]
      "
    >
      {/* =====================================================
          CONTOUR PRINCIPAL DU PLAN
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          border-2
          border-[#1c1c1a]
          bg-[#f5f2ea]/20
        "
      />

      {/* =====================================================
          CHAMBRE
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          top-0
          h-1/2
          w-[48%]
          border-b
          border-r
          border-[#1c1c1a]
        "
      >
        <span
          className="
            absolute
            left-4
            top-4
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-[#77736c]
          "
        >
          Chambre
        </span>

        {/* Annotation */}

        <span
          className="
            absolute
            bottom-4
            left-4
            text-[7px]
            tracking-[0.15em]
            text-[#a77b4e]
          "
        >
          01
        </span>
      </div>

      {/* =====================================================
          SÉJOUR
      ====================================================== */}

      <div
        className="
          absolute
          right-0
          top-0
          h-1/2
          w-[52%]
          border-b
          border-[#1c1c1a]
        "
      >
        <span
          className="
            absolute
            left-4
            top-4
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-[#77736c]
          "
        >
          Séjour
        </span>

        <span
          className="
            absolute
            bottom-4
            left-4
            text-[7px]
            tracking-[0.15em]
            text-[#a77b4e]
          "
        >
          02
        </span>
      </div>

      {/* =====================================================
          BUREAU
      ====================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1/2
          w-[32%]
          border-r
          border-[#1c1c1a]
        "
      >
        <span
          className="
            absolute
            left-4
            top-4
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-[#77736c]
          "
        >
          Bureau
        </span>

        <span
          className="
            absolute
            bottom-4
            left-4
            text-[7px]
            tracking-[0.15em]
            text-[#a77b4e]
          "
        >
          03
        </span>
      </div>

      {/* =====================================================
          CUISINE
      ====================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-[32%]
          h-1/2
          w-[34%]
          border-r
          border-[#1c1c1a]
        "
      >
        <span
          className="
            absolute
            left-4
            top-4
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-[#77736c]
          "
        >
          Cuisine
        </span>

        <span
          className="
            absolute
            bottom-4
            left-4
            text-[7px]
            tracking-[0.15em]
            text-[#a77b4e]
          "
        >
          04
        </span>
      </div>

      {/* =====================================================
          TERRASSE
      ====================================================== */}

      <div
        className="
          absolute
          bottom-0
          right-0
          h-1/2
          w-[34%]
        "
      >
        <span
          className="
            absolute
            left-4
            top-4
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-[#77736c]
          "
        >
          Terrasse
        </span>

        <span
          className="
            absolute
            bottom-4
            left-4
            text-[7px]
            tracking-[0.15em]
            text-[#a77b4e]
          "
        >
          05
        </span>
      </div>

      {/* =====================================================
          AXE VERTICAL
      ====================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-[-25px]
          h-[calc(100%+50px)]
          w-px
          bg-[#a77b4e]/50
        "
      />

      {/* =====================================================
          AXE HORIZONTAL
      ====================================================== */}

      <div
        className="
          absolute
          left-[-25px]
          top-1/2
          h-px
          w-[calc(100%+50px)]
          bg-[#a77b4e]/50
        "
      />

      {/* =====================================================
          COTATION SUPÉRIEURE
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          top-[-18px]
          flex
          w-full
          justify-between
          text-[8px]
          text-[#77736c]
        "
      >
        <span>4.20 m</span>

        <span>8.60 m</span>

        <span>4.20 m</span>
      </div>

      {/* =====================================================
          LIGNE DE COTATION SUPÉRIEURE
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          top-[-10px]
          h-px
          w-full
          bg-[#77736c]/40
        "
      />

      {/* =====================================================
          COTATION GAUCHE
      ====================================================== */}

      <div
        className="
          absolute
          left-[-48px]
          top-1/2
          -translate-y-1/2
          -rotate-0
          whitespace-nowrap
          text-[8px]
          tracking-[0.15em]
          text-[#77736c]
        "
      >
        12.40 m
      </div>

      {/* =====================================================
          REPÈRE NORD
      ====================================================== */}

      <div
        className="
          absolute
          right-[-38px]
          top-[-38px]
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          border
          border-[#a77b4e]
          text-[8px]
          text-[#a77b4e]
        "
      >
        N
      </div>

      {/* =====================================================
          POINT CENTRAL
      ====================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-2
          w-2
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#a77b4e]
        "
      />

      {/* =====================================================
          IDENTIFICATION
      ====================================================== */}

      <div
        className="
          absolute
          bottom-[-28px]
          right-0
          text-[8px]
          uppercase
          tracking-[0.25em]
          text-[#77736c]
        "
      >
        PLAN — RDC
      </div>

      {/* =====================================================
          REPÈRE ARCHITECTURAL
      ====================================================== */}

      <div
        className="
          absolute
          bottom-[-52px]
          right-0
          text-[7px]
          uppercase
          tracking-[0.18em]
          text-[#a77b4e]
        "
      >
        ÉTUDE 01 / 04
      </div>
    </motion.div>
  );
}