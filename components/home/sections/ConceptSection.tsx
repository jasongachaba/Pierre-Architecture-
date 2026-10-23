
"use client";

import Image from "next/image";

import {
  motion,
  MotionValue,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import {
  useRef,
  useState,
  type ReactNode,
} from "react";

import SectionLabel from "../../ui/SectionLabel";

/* ============================================================
   TYPES
   ============================================================ */

interface ConceptSectionProps {
  progress: MotionValue<number>;
}

interface AnimatedLineProps {
  delay?: number;
  className?: string;
  children: ReactNode;
}

interface AnnotationProps {
  number: string;
  title: string;
  description: string;
  delay: number;
}

interface PlanRoomProps {
  name: string;
  className: string;
  delay: number;
}

interface DimensionLineProps {
  direction: "horizontal" | "vertical";
  value: string;
  delay: number;
  className?: string;
}

/* ============================================================
   CONSTANTES
   ============================================================ */

const EASE_ARCHITECTURAL = [
  0.22,
  1,
  0.36,
  1,
] as const;

const EASE_SOFT = [
  0.16,
  1,
  0.3,
  1,
] as const;

/* ============================================================
   PETIT COMPOSANT : LIGNE ANIMÉE
   ============================================================ */

function AnimatedLine({
  delay = 0,
  className = "",
  children,
}: AnimatedLineProps) {
  return (
    <motion.div
      initial={{
        opacity: 1,

        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE_ARCHITECTURAL,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   COMPOSANT : PIÈCE DU PLAN
   ============================================================ */

function PlanRoom({
  name,
  className,
  delay,
}: PlanRoomProps) {
  return (
    <motion.div
      initial={{
        opacity: 1,

        scale: 0.92,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: EASE_ARCHITECTURAL,
      }}
      className={`absolute border border-[#1c1c1a]/35 ${className}`}
    >
      <motion.span
        initial={{
          opacity: 1,

          y: 5,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: delay + 0.25,
        }}
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          whitespace-nowrap
          text-[8px]
          uppercase
          tracking-[0.18em]
          text-[#77736c]
        "
      >
        {name}
      </motion.span>
    </motion.div>
  );
}

/* ============================================================
   COMPOSANT : LIGNE DE COTE
   ============================================================ */

function DimensionLine({
  direction,
  value,
  delay,
  className = "",
}: DimensionLineProps) {
  const horizontal = direction === "horizontal";

  return (
    <motion.div
      initial={{
       
       
       
        // opacity: 1,

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
        flex
        items-center
        justify-center
        ${horizontal ? "h-px" : "w-px"}
        ${className}
      `}
    >
      {horizontal ? (
        <>
          <span className="absolute left-0 h-3 w-px bg-[#a77b4e]" />
          <span className="absolute right-0 h-3 w-px bg-[#a77b4e]" />

          <span
            className="
              absolute
              left-1/2
              -translate-x-1/2
              -translate-y-4
              
              px-2
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-[#a77b4e]
            "
          >
            {value}
          </span>
        </>
      ) : (
        <>
          <span className="absolute top-0 h-px w-3 bg-[#a77b4e]" />
          <span className="absolute bottom-0 h-px w-3 bg-[#a77b4e]" />

          <span
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              
              px-2
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-[#a77b4e]
            "
          >
            {value}
          </span>
        </>
      )}
    </motion.div>
  );
}

/* ============================================================
   COMPOSANT : ANNOTATION
   ============================================================ */

function Annotation({
  number,
  title,
  description,
  delay,
}: AnnotationProps) {
  return (
    <motion.div
      initial={{
        // opacity: 1,

        x: 35,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE_ARCHITECTURAL,
      }}
      className="
        grid
        grid-cols-[auto_1fr]
        gap-4
        border-t
        border-[#1c1c1a]/10
        pt-5
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          border
          border-[#a77b4e]/40
          text-[10px]
          text-[#a77b4e]
        "
      >
        {number}
      </div>

      <div>
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-[#1c1c1a]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-2
            max-w-xs
            text-xs
            leading-6
            text-[#77736c]
          "
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ============================================================
   COMPOSANT : PLAN ARCHITECTURAL
   ============================================================ */

function AnimatedFloorPlan({
  visible,
  progress,
}: {
  visible: boolean;
  progress: MotionValue<number>;
}) {
  const planScale = useTransform(
    progress,
    [0.2, 0.42, 0.7],
    [0.65, 1, 1]
  );

  const planRotate = useTransform(
    progress,
    [0.2, 0.42, 0.7],
    [-8, 0, 0]
  );

  const planY = useTransform(
    progress,
    [0.2, 0.42, 0.7],
    [80, 0, -10]
  );

  const planOpacity = useTransform(
    progress,
    [0.15, 0.32, 0.75],
    [0, 1, 1]
  );

  const shadowOpacity = useTransform(
    progress,
    [0.2, 0.42, 0.7],
    [0, 0.12, 0.18]
  );

  return (
    <motion.div
      style={{
        opacity: visible ? planOpacity : 0,
        scale: planScale,
        rotate: planRotate,
        y: planY,
      }}
      className="
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
      "
    >
      {/* ======================================================
         OMBRE
         ====================================================== */}

      <motion.div
        style={{
          opacity: shadowOpacity,
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
          
          shadow-[0_20px_60px_rgba(28,28,26,0.10)]
        "
      >

        {/* ====================================================
           CADRE EXTERNE
           ==================================================== */}

        <motion.div
          initial={{
            scale: 0.95,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.15,
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
           AXES
           ==================================================== */}

        <motion.div
          initial={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.35,
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

        <motion.div
          initial={{
            scaleY: 0,
          }}
          animate={{
            scaleY: 1,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.45,
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
           PIÈCES
           ==================================================== */}

        <PlanRoom
          name="Séjour"
          delay={0.55}
          className="
            left-[10%]
            top-[12%]
            h-[35%]
            w-[39%]
          "
        />

        <PlanRoom
          name="Cuisine"
          delay={0.68}
          className="
            right-[10%]
            top-[12%]
            h-[25%]
            w-[32%]
          "
        />

        <PlanRoom
          name="Chambre"
          delay={0.81}
          className="
            left-[10%]
            bottom-[12%]
            h-[29%]
            w-[39%]
          "
        />

        <PlanRoom
          name="Bureau"
          delay={0.94}
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
          initial={{
            opacity: 0.7,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 1.05,
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
          initial={{
            scaleX: 0,
          }}
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 1.12,
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
          initial={{
            opacity: 0.7,
            scaleX: 0,
          }}
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 1.2,
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
           FENÊTRES
           ==================================================== */}

        <motion.div
          initial={{
            opacity: 0.7,
            scaleX: 0,
          }}
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 1.28,
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

        <motion.div
          initial={{
            opacity: 1,

            scaleX: 0,
          }}
          animate={{
            opacity: 1,
            scaleX: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 1.36,
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
          delay={1.45}
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
          delay={1.55}
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
          initial={{
            opacity: 1,

            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 1.65,
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
           TITRE DU PLAN
           ==================================================== */}

        <motion.div
          initial={{
            opacity: 1,

            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 1.75,
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
          initial={{
            opacity: 1,

          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 1.9,
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

/* ============================================================
   COMPOSANT PRINCIPAL
   ============================================================ */

export default function ConceptSection({
  progress,
}: ConceptSectionProps) {

  /* ==========================================================
     RÉFÉRENCE DE LA SECTION
     ========================================================== */

  const sectionRef = useRef<HTMLElement | null>(null);

  /* ==========================================================
     PROGRESSION LOCALE
     ========================================================== */

  const {
    scrollYProgress: sectionProgress,
  } = useScroll({
    target: sectionRef,
    offset: [
      "start end",
      "end start",
    ],
  });

  /* ==========================================================
     PROGRESSION LISSÉE
     ========================================================== */

  const smoothProgress = useSpring(
    sectionProgress,
    {
      stiffness: 80,
      damping: 24,
      mass: 0.8,
    }
  );

  /* ==========================================================
     PREMIER SCROLL
     ========================================================== */

  const sectionOpacity = useTransform(
    smoothProgress,
    [0, 0.12, 0.25],
    [0.35, 0.8, 1]
  );

  const sectionY = useTransform(
    smoothProgress,
    [0, 0.2],
    [80, 0]
  );

  /* ==========================================================
     IMAGE
     ========================================================== */

  const imageY = useTransform(
    smoothProgress,
    [0, 0.25, 0.55, 1],
    [120, 20, -20, -70]
  );

  const imageScale = useTransform(
    smoothProgress,
    [0, 0.25, 0.55],
    [1.12, 1.03, 1]
  );

  const imageOpacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.32],
    [0, 0.5, 1]
  );

  const imageRotate = useTransform(
    smoothProgress,
    [0, 0.35],
    [2, 0]
  );

  /* ==========================================================
     OVERLAY IMAGE
     ========================================================== */

  const imageOverlayOpacity = useTransform(
    smoothProgress,
    [0.15, 0.35, 0.6],
    [0.5, 0.2, 0]
  );

  /* ==========================================================
     LABEL
     ========================================================== */

  const labelY = useTransform(
    smoothProgress,
    [0.08, 0.24],
    [35, 0]
  );

  const labelOpacity = useTransform(
    smoothProgress,
    [0.08, 0.22],
    [0, 1]
  );

  /* ==========================================================
     TITRE
     ========================================================== */

  const titleY = useTransform(
    smoothProgress,
    [0.12, 0.32],
    [90, 0]
  );

  const titleOpacity = useTransform(
    smoothProgress,
    [0.12, 0.3],
    [0, 1]
  );

  /* ==========================================================
     DESCRIPTION
     ========================================================== */

  const descriptionY = useTransform(
    smoothProgress,
    [0.22, 0.38],
    [45, 0]
  );

  const descriptionOpacity = useTransform(
    smoothProgress,
    [0.22, 0.4],
    [0, 1]
  );

  /* ==========================================================
     STATISTIQUES
     ========================================================== */

  const statsY = useTransform(
    smoothProgress,
    [0.3, 0.48],
    [45, 0]
  );

  const statsOpacity = useTransform(
    smoothProgress,
    [0.3, 0.48],
    [0, 1]
  );

  /* ==========================================================
     BLOC IMAGE
     ========================================================== */

  const imageCardY = useTransform(
    smoothProgress,
    [0.35, 0.55],
    [80, 0]
  );

  const imageCardOpacity = useTransform(
    smoothProgress,
    [0.35, 0.55],
    [0, 1]
  );

  /* ==========================================================
     LIGNE DECORATIVE
     ========================================================== */

  const lineScale = useTransform(
    smoothProgress,
    [0.25, 0.45],
    [0, 1]
  );

  /* ==========================================================
     SECOND SCROLL
     ========================================================== */

  const objectReveal = useTransform(
    smoothProgress,
    [0.35, 0.45, 0.62],
    [0, 1, 1]
  );

  /* ==========================================================
     ANNOTATIONS
     ========================================================== */

  const annotationsOpacity = useTransform(
    smoothProgress,
    [0.52, 0.68],
    [0, 1]
  );

  const annotationsY = useTransform(
    smoothProgress,
    [0.52, 0.68],
    [50, 0]
  );

  /* ==========================================================
     INDICATEUR DE SCROLL
     ========================================================== */

  const scrollIndicatorOpacity = useTransform(
    smoothProgress,
    [0.7, 0.9],
    [1, 0]
  );

  /* ==========================================================
     DÉTECTION DE VISIBILITÉ
     ========================================================== */

  const isInView = useInView(
    sectionRef,
    {
      amount: 0.15,
    }
  );

  const [hasEntered, setHasEntered] = useState(false);

  if (isInView && !hasEntered) {
    setHasEntered(true);
  }

  /* ==========================================================
     RENDU
     ========================================================== */

  return (
    <section
      ref={sectionRef}
      className="
        relative
        min-h-[170vh]
        overflow-hidden
        bg-white
        px-6
        py-32
        md:px-10
        md:py-40
      "
    >

      {/* ======================================================
          BACKGROUND
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <motion.div
          style={{
            opacity: sectionOpacity,
          }}
          className="
            absolute
            -right-[15%]
            top-[8%]
            h-[650px]
            w-[650px]
            rounded-full
            
            blur-3xl
          "
        />

        <motion.div
          style={{
            opacity: sectionOpacity,
          }}
          className="
            absolute
            -left-[20%]
            bottom-[5%]
            h-[500px]
            w-[500px]
            rounded-full
            /60
            blur-3xl
          "
        />
      </div>

      {/* ======================================================
          GRILLE ARCHITECTURALE
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.045]
        "
      >
        <div
          className="
            absolute
            inset-y-0
            left-[12%]
            w-px
            bg-[#1c1c1a]
          "
        />

        <div
          className="
            absolute
            inset-y-0
            left-[50%]
            w-px
            bg-[#1c1c1a]
          "
        />

        <div
          className="
            absolute
            inset-y-0
            right-[12%]
            w-px
            bg-[#1c1c1a]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            top-[30%]
            h-px
            bg-[#1c1c1a]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            top-[65%]
            h-px
            bg-[#1c1c1a]
          "
        />
      </div>

      {/* ======================================================
          CONTENEUR PRINCIPAL
          ====================================================== */}

      <motion.div
        style={{
          y: sectionY,
        }}
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
        "
      >

        {/* ====================================================
            HEADER
            ==================================================== */}

        <div
          className="
            grid
            gap-12
            md:grid-cols-[0.75fr_1.25fr]
            md:gap-20
          "
        >

          {/* ==================================================
              COLONNE GAUCHE
              ================================================== */}

          <div>

            {/* =================================================
                LABEL
                ================================================= */}

            <motion.div
              style={{
                opacity: labelOpacity,
                y: labelY,
              }}
            >
              <SectionLabel
                number="02"
                label="Concept"
              />
            </motion.div>

            {/* =================================================
                TITRE
                ================================================= */}

            <motion.div
              style={{
                // opacity: titleOpacity,
                y: titleY,
              }}
              className="mt-8 overflow-hidden"
            >
              <h2
                className="
                  font-display
                  text-5xl
                  leading-[0.92]
                  tracking-[-0.05em]
                  md:text-7xl
                  lg:text-[88px]
                "
              >
                <span className="block">
                  L'idée
                </span>

                <span className="block">
                  devient
                </span>

                <span className="block text-[#a77b4e]">
                  espace.
                </span>
              </h2>
            </motion.div>

            {/* =================================================
                DESCRIPTION
                ================================================= */}

            <motion.div
              style={{
                // opacity: descriptionOpacity,
                y: descriptionY,
              }}
              className="
                mt-8
                max-w-md
              "
            >
              <p
                className="
                  text-sm
                  leading-7
                  text-[#6f6b64]
                "
              >
                Chaque projet commence par une intention.
                Nous transformons cette intention en une
                organisation spatiale claire, fonctionnelle
                et sensible.
              </p>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    h-px
                    w-10
                    bg-[#a77b4e]
                  "
                />

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.25em]
                    text-[#77736c]
                  "
                >
                  De l'idée au plan
                </span>
              </div>
            </motion.div>

            {/* =================================================
                STATISTIQUES
                ================================================= */}

            <motion.div
              style={{
                opacity: statsOpacity,
                y: statsY,
              }}
              className="
                mt-10
                grid
                max-w-md
                grid-cols-2
                gap-8
                border-t
                border-[#1c1c1a]/10
                pt-6
              "
            >

              <div>
                <p
                  className="
                    font-display
                    text-3xl
                  "
                >
                  01
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-[#77736c]
                  "
                >
                  Analyse
                </p>

                <p
                  className="
                    mt-3
                    text-xs
                    leading-5
                    text-[#99948b]
                  "
                >
                  Comprendre le site,
                  les usages et les contraintes.
                </p>
              </div>

              <div>
                <p
                  className="
                    font-display
                    text-3xl
                  "
                >
                  02
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-[#77736c]
                  "
                >
                  Concept
                </p>

                <p
                  className="
                    mt-3
                    text-xs
                    leading-5
                    text-[#99948b]
                  "
                >
                  Traduire l'intention
                  en organisation spatiale.
                </p>
              </div>
            </motion.div>

          </div>

          {/* ==================================================
              COLONNE DROITE
              ================================================== */}

          <div
            className="
              relative
              min-h-[680px]
              md:min-h-[760px]
            "
          >

            {/* ================================================
                IMAGE PRINCIPALE
                ================================================ */}

            <motion.div
              style={{
                // opacity: imageOpacity,
                // y: imageY,
                scale: imageScale,
                // rotate: imageRotate,
              }}
              className="
                absolute
                right-0
                top-0
                h-[340px]
                w-[80%]
                overflow-hidden
                md:h-[480px]
                md:w-[80%]
              "
            >
              <Image
                src="/images/projets/projet-space.jpg"
                alt="Projet architectural"
                fill
                priority={false}
                sizes="
                  (max-width: 768px) 88vw,
                  50vw
                "
                className="
                  object-cover
                "
              />

              <motion.div
                style={{
                  opacity: imageOverlayOpacity,
                }}
                className="
                  absolute
                  inset-0
                  bg-[#1c1c1a]
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#1c1c1a]/30
                  via-transparent
                  to-transparent
                "
              />

              <motion.div
                initial={{
                  opacity: 1,

                  x: -20,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.35,
                  ease: EASE_ARCHITECTURAL,
                }}
                className="
                  absolute
                  bottom-6
                  left-6
                  max-w-[220px]
                  text-white
                "
              >
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.3em]
                    text-white/70
                  "
                >
                  Étude
                </p>

                <p
                  className="
                    mt-2
                    font-display
                    text-2xl
                  "
                >
                  La matière
                  comme point de départ.
                </p>
              </motion.div>
            </motion.div>

            {/* ================================================
                LIGNE DECORATIVE
                ================================================ */}

            <motion.div
              style={{
                scaleX: lineScale,
              }}
              className="
                absolute
                right-[8%]
                top-[548px]
                h-px
                w-[70%]
                origin-right
                bg-[#1c1c1a]/20
                md:top-[610px]
              "
            />

            {/* ================================================
                PETITE CARTE
                ================================================ */}

            <motion.div
              style={{
                // opacity: imageCardOpacity,

                y: imageCardY,
              }}
              className="
                absolute
                bottom-[40px]
                left-0
                z-10
                w-[78%]
                
                p-7
                md:w-[62%]
                md:p-9
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-[#a77b4e]
                "
              >
                Étude architecturale
              </p>

              <p
                className="
                  mt-4
                  font-display
                  text-2xl
                  md:text-3xl
                "
              >
                Organisation
                des volumes
              </p>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-[#77736c]
                "
              >
                Orientation, circulation,
                lumière et rapport au paysage.
              </p>

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-between
                  border-t
                  border-[#1c1c1a]/10
                  pt-4
                "
              >
                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.2em]
                    text-[#77736c]
                  "
                >
                  Phase
                </span>

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.2em]
                    text-[#1c1c1a]
                  "
                >
                  Concept
                </span>
              </div>
            </motion.div>

          </div>

        </div>

        {/* ====================================================
            DEUXIÈME PARTIE :
            OBJET ARCHITECTURAL
            ==================================================== */}

       <div
  className="
    relative
    mt-32
    min-h-[820px]
    md:mt-44
    md:min-h-[900px]
  "
>
  {/* ==========================================================
      TITRE / INTRODUCTION — GAUCHE
  ========================================================== */}

  <motion.div
    style={{
      opacity: objectReveal,
      y: useTransform(
        smoothProgress,
        [0.3, 0.48],
        [60, 0]
      ),
    }}
    className="
      absolute
      left-0
      top-0
      z-30
      w-full
      max-w-sm
      md:w-[32%]
    "
  >
    <p
      className="
        text-[10px]
        uppercase
        tracking-[0.3em]
        text-[#a77b4e]
      "
    >
      Deuxième mouvement
    </p>

    <h3
      className="
        mt-4
        font-display
        text-4xl
        leading-[0.95]
        tracking-[-0.04em]
        md:text-5xl
      "
    >
      L'espace
      <br />
      prend forme.
    </h3>

    <p
      className="
        mt-5
        max-w-sm
        text-sm
        leading-7
        text-[#77736c]
      "
    >
      Au deuxième scroll, l'intention abstraite
      devient une organisation lisible.
      Le plan révèle les relations entre les espaces,
      les circulations et la lumière.
    </p>
  </motion.div>


  {/* ==========================================================
      IMAGE — PROJECTION DU PLAN SUR LE TERRAIN
      DROITE / HAUT

      L'image reste volontairement petite.
  ========================================================== */}

  <motion.div
    style={{
      opacity: useTransform(
        smoothProgress,
        [0.38, 0.48, 0.65],
        [0, 1, 1]
      ),

      y: useTransform(
        smoothProgress,
        [0.38, 0.55],
        [40, 0]
      ),
    }}
    className="
      absolute
      right-0
      top-[6%]
      z-20
      hidden
      w-[260px]
      md:block
      lg:w-[285px]
    "
  >
    {/* Image */}

    <div
      className="
        relative
        aspect-[4/5]
        w-full
        overflow-hidden
        bg-[#e9e5dc]
      "
    >
      <img
        src="/images/architectural-projection.jpg"
        alt="Projection d'un plan architectural sur un terrain"
        className="
          h-full
          w-full
          object-cover
        "
      />

      {/* voile léger */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/20
          via-transparent
          to-transparent
        "
      />

      {/* petit repère */}
      <div
        className="
          absolute
          left-4
          top-4
          flex
          h-7
          w-7
          items-center
          justify-center
          border
          border-white/70
          text-[9px]
          text-white
        "
      >
        02
      </div>
    </div>

    {/* Légende */}

    <div
      className="
        mt-4
        flex
        items-start
        justify-between
        gap-5
      "
    >
      <div>
        <p
          className="
            text-[9px]
            uppercase
            tracking-[0.22em]
            text-[#a77b4e]
          "
        >
          Projection
        </p>

        <p
          className="
            mt-2
            text-[11px]
            leading-5
            text-[#77736c]
          "
        >
          Le plan devient une
          <br />
          lecture du terrain.
        </p>
      </div>

      <span
        className="
          pt-1
          text-[9px]
          tracking-[0.15em]
          text-[#99958e]
        "
      >
        02 / 04
      </span>
    </div>
  </motion.div>


  {/* ==========================================================
      PETITE LIGNE DE CONNEXION VISUELLE

      Relie discrètement l'image au plan.
  ========================================================== */}

  <motion.div
    style={{
      opacity: useTransform(
        smoothProgress,
        [0.45, 0.55],
        [0, 1]
      ),
    }}
    className="
      absolute
      right-[285px]
      top-[28%]
      hidden
      h-px
      w-[100px]
      origin-right
      bg-[#a77b4e]/30
      md:block
    "
  />

  {/* petit point de repère */}

  <motion.div
    style={{
      opacity: useTransform(
        smoothProgress,
        [0.45, 0.55],
        [0, 1]
      ),
    }}
    className="
      absolute
      right-[380px]
      top-[calc(28%-2px)]
      hidden
      h-[5px]
      w-[5px]
      rounded-full
      bg-[#a77b4e]
      md:block
    "
  />


  {/* ==========================================================
      PLAN ARCHITECTURAL

      Votre ArchitecturalObject / plan reste au centre.
      Ne rien mettre ici si le plan est déjà rendu ailleurs
      par ArchitecturalObject.
  ========================================================== */}


  {/* ==========================================================
      ANNOTATIONS GAUCHES — BAS
  ========================================================== */}

  <motion.div
    style={{
      opacity: annotationsOpacity,
      y: annotationsY,
    }}
    className="
      absolute
      bottom-0
      left-0
      z-30
      w-full
      md:w-[30%]
    "
  >
    <Annotation
      number="01"
      title="Orientation"
      description="
        Le projet est organisé selon la lumière
        naturelle et les orientations principales
        du terrain.
      "
      delay={0.1}
    />

    <div className="mt-6">
      <Annotation
        number="02"
        title="Circulation"
        description="
          Les parcours sont hiérarchisés pour créer
          une lecture fluide et intuitive du projet.
        "
        delay={0.2}
      />
    </div>
  </motion.div>


  {/* ==========================================================
      ANNOTATIONS DROITES — BAS
  ========================================================== */}

  <motion.div
    style={{
      opacity: annotationsOpacity,
      y: annotationsY,
    }}
    className="
      absolute
      bottom-0
      right-0
      z-30
      w-full
      md:w-[30%]
    "
  >
    <Annotation
      number="03"
      title="Lumière"
      description="
        Les ouvertures structurent les vues
        et apportent une lumière naturelle
        maîtrisée dans les espaces.
      "
      delay={0.3}
    />

    <div className="mt-6">
      <Annotation
        number="04"
        title="Usage"
        description="
          Chaque volume répond à une fonction
          précise tout en conservant une relation
          cohérente avec l'ensemble.
        "
        delay={0.4}
      />
    </div>
  </motion.div>


  {/* ==========================================================
      INDICATION DISCRÈTE DE SCROLL
  ========================================================== */}

  <motion.div
    style={{
      opacity: useTransform(
        smoothProgress,
        [0.25, 0.40],
        [0, 1]
      ),
    }}
    className="
      absolute
      bottom-[43%]
      left-1/2
      z-20
      hidden
      -translate-x-1/2
      md:block
    "
  >
    <div
      className="
        flex
        items-center
        gap-3
        text-[9px]
        uppercase
        tracking-[0.25em]
        text-[#99958e]
      "
    >
      <span className="h-px w-8 bg-[#a77b4e]/40" />

      Développement du plan

      <span className="h-px w-8 bg-[#a77b4e]/40" />
    </div>
  </motion.div>
</div>

        {/* ====================================================
            INDICATEUR DE CONTINUATION
            ==================================================== */}

        <motion.div
          style={{
            opacity: scrollIndicatorOpacity,
          }}
          className="
            absolute
            bottom-10
            left-1/2
            z-40
            hidden
            -translate-x-1/2
            flex-col
            items-center
            gap-3
            md:flex
          "
        >
          <span
            className="
              text-[8px]
              uppercase
              tracking-[0.3em]
              text-[#77736c]
            "
          >
            Continuer
          </span>

          <motion.span
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              h-8
              w-px
              bg-[#a77b4e]
            "
          />
        </motion.div>

      </motion.div>

      {/* ======================================================
          NUMÉRO DE SECTION
          ====================================================== */}

      <motion.div
        initial={{
          opacity: 1,

        }}
        whileInView={{
          opacity: 1,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 1,
          delay: 0.3,
        }}
        className="
          pointer-events-none
          absolute
          bottom-10
          right-8
          hidden
          font-display
          text-[120px]
          leading-none
          text-[#1c1c1a]/[0.035]
          md:block
        "
      >
        02
      </motion.div>

    </section>
  );
}
