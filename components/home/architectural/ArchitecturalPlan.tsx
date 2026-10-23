"use client";

import {
  motion,
  type MotionValue,
} from "motion/react";

interface ArchitecturalPlanProps {
  opacity?: MotionValue<number> | number;
  scale?: MotionValue<number> | number;
  rotate?: MotionValue<number> | number;
  y?: MotionValue<number | string> | number | string;
  shadowOpacity?: MotionValue<number> | number;
  animated?: boolean;
  className?: string;
}

const EASE_ARCHITECTURAL = [
  0.22,
  1,
  0.36,
  0,
] as const;

/* ============================================================
   ROOM
   ============================================================ */

interface PlanRoomProps {
  name: string;
  number: string;
  delay: number;
  className: string;
}

function PlanRoom({
  name,
  number,
  delay,
  className,
}: PlanRoomProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE_ARCHITECTURAL,
      }}
      className={`
        absolute
        border
        border-[#1c1c1a]/35
        ${className}
      `}
    >
      <span
        className="
          absolute
          left-4
          top-4
          text-[8px]
          uppercase
          tracking-[0.22em]
          text-[#77736c]
        "
      >
        {name}
      </span>

      <span
        className="
          absolute
          bottom-3
          right-3
          text-[7px]
          tracking-[0.18em]
          text-[#a77b4e]
        "
      >
        {number}
      </span>
    </motion.div>
  );
}

/* ============================================================
   DIMENSION LINE
   ============================================================ */

interface DimensionLineProps {
  direction: "horizontal" | "vertical";
  value: string;
  delay: number;
  className: string;
}

function DimensionLine({
  direction,
  value,
  delay,
  className,
}: DimensionLineProps) {
  const horizontal = direction === "horizontal";

  return (
    <motion.div
      initial={{
        opacity: 0,
        scaleX: horizontal ? 0 : 1,
        scaleY: horizontal ? 1 : 0,
      }}
      animate={{
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE_ARCHITECTURAL,
      }}
      className={`
        absolute
        ${className}
      `}
    >
      {horizontal ? (
        <div className="relative h-px w-full bg-[#1c1c1a]/25">
          <span
            className="
              absolute
              left-1/2
              top-[-14px]
              -translate-x-1/2
              whitespace-nowrap
              text-[7px]
              uppercase
              tracking-[0.2em]
              text-[#77736c]
            "
          >
            {value}
          </span>

          <span
            className="
              absolute
              left-0
              top-[-3px]
              h-[7px]
              w-px
              bg-[#1c1c1a]/40
            "
          />

          <span
            className="
              absolute
              right-0
              top-[-3px]
              h-[7px]
              w-px
              bg-[#1c1c1a]/40
            "
          />
        </div>
      ) : (
        <div className="relative h-full w-px bg-[#1c1c1a]/25">
          <span
            className="
              absolute
              left-[-30px]
              top-1/2
              -translate-y-1/2
              -rotate-90
              whitespace-nowrap
              text-[7px]
              uppercase
              tracking-[0.2em]
              text-[#77736c]
            "
          >
            {value}
          </span>

          <span
            className="
              absolute
              left-[-3px]
              top-0
              h-px
              w-[7px]
              bg-[#1c1c1a]/40
            "
          />

          <span
            className="
              absolute
              bottom-0
              left-[-3px]
              h-px
              w-[7px]
              bg-[#1c1c1a]/40
            "
          />
        </div>
      )}
    </motion.div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function ArchitecturalPlan({
  opacity = 1,
  scale = 1,
  rotate = 0,
  y = 0,
  shadowOpacity = 0.12,
  animated = true,
  className = "",
}: ArchitecturalPlanProps) {
  return (
    <motion.div
      style={{
        opacity,
        scale,
        rotate,
        y,
      }}
      className={`
        absolute
        left-1/2
        top-1/2
        z-20
        h-[380px]
        w-[440px]
        -translate-x-1/2
        -translate-y-1/2
        md:h-[500px]
        md:w-[570px]
        ${className}
      `}
    >
      {/* ======================================================
          OMBRE
      ====================================================== */}

      <motion.div
        initial={
          animated
            ? {
                opacity: 0,
              }
            : false
        }
        animate={{
          opacity: Number(shadowOpacity) || 0,
        }}
        transition={{
          duration: 0.8,
          delay: animated ? 0.1 : 0,
        }}
        className="
          absolute
          left-[10%]
          top-[12%]
          h-[75%]
          w-[78%]
          bg-[#1c1c1a]
          blur-[45px]
        "
      />

      {/* ======================================================
          FEUILLE DU PLAN
      ====================================================== */}

      <div
        className="
          absolute
          inset-[7%]
          overflow-visible
          bg-[#f5f2ea]
          shadow-[0_20px_60px_rgba(28,28,26,0.10)]
        "
      >
        {/* ====================================================
            CADRE EXTERNE
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                  scale: 0.95,
                }
              : false
          }
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1,
            delay: animated ? 0.15 : 0,
            ease: EASE_ARCHITECTURAL,
          }}
          className="
            absolute
            inset-7
            border
            border-[#1c1c1a]/45
          "
        />

        {/* ====================================================
            AXE HORIZONTAL
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  scaleX: 0,
                  opacity: 0,
                }
              : false
          }
          animate={{
            scaleX: 1,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: animated ? 0.35 : 0,
            ease: EASE_ARCHITECTURAL,
          }}
          className="
            absolute
            left-7
            right-7
            top-1/2
            h-px
            origin-left
            bg-[#a77b4e]/30
          "
        />

        {/* ====================================================
            AXE VERTICAL
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  scaleY: 0,
                  opacity: 0,
                }
              : false
          }
          animate={{
            scaleY: 1,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: animated ? 0.45 : 0,
            ease: EASE_ARCHITECTURAL,
          }}
          className="
            absolute
            bottom-7
            left-1/2
            top-7
            w-px
            origin-top
            bg-[#a77b4e]/30
          "
        />

        {/* ====================================================
            SÉJOUR
        ==================================================== */}

        <PlanRoom
          name="Séjour"
          number="01"
          delay={animated ? 0.55 : 0}
          className="
            left-[10%]
            top-[12%]
            h-[35%]
            w-[39%]
          "
        />

        {/* ====================================================
            CUISINE
        ==================================================== */}

        <PlanRoom
          name="Cuisine"
          number="02"
          delay={animated ? 0.68 : 0}
          className="
            right-[10%]
            top-[12%]
            h-[25%]
            w-[32%]
          "
        />

        {/* ====================================================
            CHAMBRE
        ==================================================== */}

        <PlanRoom
          name="Chambre"
          number="03"
          delay={animated ? 0.81 : 0}
          className="
            left-[10%]
            bottom-[12%]
            h-[29%]
            w-[39%]
          "
        />

        {/* ====================================================
            BUREAU
        ==================================================== */}

        <PlanRoom
          name="Bureau"
          number="04"
          delay={animated ? 0.94 : 0}
          className="
            right-[10%]
            bottom-[12%]
            h-[22%]
            w-[32%]
          "
        />

        {/* ====================================================
            CIRCULATION
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                }
              : false
          }
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            delay: animated ? 1.05 : 0,
          }}
          className="
            absolute
            left-[49%]
            top-[35%]
            h-[30%]
            w-[4%]
            border-l
            border-r
            border-[#1c1c1a]/20
          "
        />

        {/* ====================================================
            PORTE SÉJOUR
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                  scaleX: 0,
                }
              : false
          }
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: animated ? 1.12 : 0,
          }}
          className="
            absolute
            left-[46%]
            top-[46%]
            h-px
            w-[8%]
            origin-left
            bg-[#a77b4e]
          "
        />

        {/* ====================================================
            PORTE CHAMBRE
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                  scaleX: 0,
                }
              : false
          }
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: animated ? 1.2 : 0,
          }}
          className="
            absolute
            left-[46%]
            bottom-[38%]
            h-px
            w-[8%]
            origin-left
            bg-[#a77b4e]
          "
        />

        {/* ====================================================
            FENÊTRE GAUCHE
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                  scaleX: 0,
                }
              : false
          }
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: animated ? 1.28 : 0,
          }}
          className="
            absolute
            left-[13%]
            top-[9%]
            h-1
            w-[30%]
            origin-left
            bg-[#a77b4e]/50
          "
        />

        {/* ====================================================
            FENÊTRE DROITE
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                  scaleX: 0,
                }
              : false
          }
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: animated ? 1.36 : 0,
          }}
          className="
            absolute
            right-[13%]
            top-[9%]
            h-1
            w-[24%]
            origin-right
            bg-[#a77b4e]/50
          "
        />

        {/* ====================================================
            COTE HORIZONTALE
        ==================================================== */}

        <DimensionLine
          direction="horizontal"
          value="12.40 m"
          delay={animated ? 1.45 : 0}
          className="
            left-[10%]
            right-[10%]
            top-[2%]
          "
        />

        {/* ====================================================
            COTE VERTICALE
        ==================================================== */}

        <DimensionLine
          direction="vertical"
          value="8.20 m"
          delay={animated ? 1.55 : 0}
          className="
            bottom-[12%]
            left-[2%]
            top-[12%]
          "
        />

        {/* ====================================================
            NORD
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                  y: -10,
                }
              : false
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: animated ? 1.65 : 0,
          }}
          className="
            absolute
            right-[4%]
            top-[3%]
            flex
            flex-col
            items-center
          "
        >
          <span
            className="
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-[#77736c]
            "
          >
            N
          </span>

          <span
            className="
              mt-1
              h-8
              w-px
              bg-[#1c1c1a]/40
            "
          />

          <span
            className="
              -mt-1
              h-0
              w-0
              border-l-[3px]
              border-r-[3px]
              border-b-[5px]
              border-l-transparent
              border-r-transparent
              border-b-[#a77b4e]
            "
          />
        </motion.div>

        {/* ====================================================
            TITRE
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                  x: -20,
                }
              : false
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
            delay: animated ? 1.75 : 0,
            ease: EASE_ARCHITECTURAL,
          }}
          className="
            absolute
            bottom-[4%]
            left-[6%]
          "
        >
          <p
            className="
              text-[7px]
              uppercase
              tracking-[0.3em]
              text-[#77736c]
            "
          >
            Plan conceptuel
          </p>

          <p
            className="
              mt-1
              font-display
              text-sm
              text-[#1c1c1a]
            "
          >
            Organisation spatiale
          </p>
        </motion.div>

        {/* ====================================================
            ECHELLE
        ==================================================== */}

        <motion.div
          initial={
            animated
              ? {
                  opacity: 0,
                }
              : false
          }
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            delay: animated ? 1.9 : 0,
          }}
          className="
            absolute
            bottom-[4%]
            right-[6%]
            flex
            items-end
            gap-1
          "
        >
          <span
            className="
              h-2
              w-10
              border-b
              border-l
              border-r
              border-[#1c1c1a]/40
            "
          />

          <span
            className="
              text-[7px]
              uppercase
              tracking-[0.15em]
              text-[#77736c]
            "
          >
            1:100
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}