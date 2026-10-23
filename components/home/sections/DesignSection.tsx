"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  type MotionValue,
  type Variants,
  useTransform,
  useScroll,
  useSpring,
} from "motion/react";
import SectionLabel from "../../ui/SectionLabel";

interface DesignStep {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  extendedDetails: string;
  image: string;
  blueprintImage?: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

const designSteps: DesignStep[] = [
  {
    id: "01",
    number: "01",
    title: "Le Trait Initial",
    subtitle: "Esquisses & Intention",
    category: "Recherche & Concept",
    description:
      "Tout commence par un geste brut, une confrontation directe entre la feuille blanche et l'intuition spatiale. Les premières lignes posent les bases volumétriques et l'orientation du projet.",
    extendedDetails:
      "Étude contextuelle approfondie, relevé solaire et analyse topographique pour ancrer durablement le bâtiment dans son environnement naturel et urbain.",
    image: "/images/studio/pr3.jpg",
    metrics: [
      { label: "Échelle", value: "1:500" },
      { label: "Phase", value: "Esquisse (ESQ)" },
      { label: "Temps", value: "3 Semaines" },
    ],
  },

  {
    id: "02",
    number: "02",
    title: "L'Épure des Volumes",
    subtitle: "Plans & Proportions",
    category: "Architecture & Spatialité",
    description:
      "Traduction géométrique des idées. Les espaces intérieurs se répondent, les circulations s'affinent et les pleins dialoguent avec les vides pour sculpter la lumière naturelle.",
    extendedDetails:
      "Modélisation paramétrique avancée et simulations d'éclairage zénithal pour optimiser les apports thermiques et le confort visuel des usagers.",
    image: "/images/studio/pr2.jpg",
    metrics: [
      { label: "Échelle", value: "1:100" },
      { label: "Phase", value: "Avant-Projet (APS/APD)" },
      { label: "Précision", value: "Millimétrique" },
    ],
  },

  {
    id: "03",
    number: "03",
    title: "Matières & Texture",
    subtitle: "Pérennité & Écriture",
    category: "Détails Exécutifs",
    description:
      "Le choix des matériaux définit la matérialité finale : béton banché, bois brûlé ou acier patiné. Chaque jonction est pensée pour traverser le temps avec élégance et sobriété.",
    extendedDetails:
      "Sélection rigoureuse de filières courtes et biosourcées, garantissant une empreinte carbone maîtrisée et une résistance structurelle irréprochable.",
    image: "/images/studio/pr1.jpg",
    metrics: [
      { label: "Échelle", value: "1:10 / 1:1" },
      { label: "Phase", value: "PRO / DCE" },
      { label: "Matériaux", value: "Bruts & Locaux" },
    ],
  },
];

interface DesignSectionProps {
  progress: MotionValue<number>;
}

export default function DesignSection({
  progress,
}: DesignSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // SCROLL LOCAL DE LA SECTION
  // ============================================================

  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
  });

  // ============================================================
  // TRANSFORMATIONS LIÉES AU SCROLL
  // ============================================================

  const bgScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1.03, 1, 1.03]
  );

  const globalOpacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.85, 1],
    [0.4, 1, 1, 0.4]
  );

  // ============================================================
  // VARIANTS DU SLIDER
  //
  // IMPORTANT :
  // Le type Variants corrige l'erreur :
  // Type 'string' is not assignable to AnimationGeneratorType
  // ============================================================

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      y: dir > 0 ? "15%" : "-15%",
      skewX: dir > 0 ? 12 : -12,
      opacity: 0,
      scale: 1.05,
      filter: "blur(12px)",
    }),

    center: {
      x: "0%",
      y: "0%",
      skewX: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",

      transition: {
        x: {
          type: "spring",
          stiffness: 220,
          damping: 28,
        },

        y: {
          type: "spring",
          stiffness: 220,
          damping: 28,
        },

        skewX: {
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        },

        opacity: {
          duration: 0.5,
          ease: "easeInOut",
        },

        scale: {
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        },

        filter: {
          duration: 0.6,
        },
      },
    },

    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      y: dir > 0 ? "-15%" : "15%",
      skewX: dir > 0 ? -12 : 12,
      opacity: 0,
      scale: 0.95,
      filter: "blur(12px)",

      transition: {
        x: {
          duration: 0.7,
          ease: [0.77, 0, 0.175, 1],
        },

        y: {
          duration: 0.7,
          ease: [0.77, 0, 0.175, 1],
        },

        skewX: {
          duration: 0.7,
          ease: [0.77, 0, 0.175, 1],
        },

        opacity: {
          duration: 0.5,
          ease: "easeInOut",
        },

        scale: {
          duration: 0.7,
        },

        filter: {
          duration: 0.5,
        },
      },
    }),
  };

  // ============================================================
  // AUTO PLAY
  // ============================================================

  useEffect(() => {
    if (!isAutoPlaying) {
      return;
    }

    timerRef.current = setInterval(() => {
      setDirection(1);

      setCurrentIndex(
        (prev) => (prev + 1) % designSteps.length
      );
    }, 6500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAutoPlaying]);

  // ============================================================
  // NAVIGATION MANUELLE
  // ============================================================

  const handleManualNav = (newIndex: number) => {
    setIsAutoPlaying(false);

    const dir = newIndex > currentIndex ? 1 : -1;

    setDirection(dir);
    setCurrentIndex(newIndex);
  };

  const currentStep = designSteps[currentIndex];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity: globalOpacity }}
      className="
        relative
        min-h-[110vh]
        overflow-hidden
        bg-[#e8e4db]
        px-6
        py-28
        md:px-12
        lg:px-20
        flex
        flex-col
        justify-between
        selection:bg-[#a77b4e]
        selection:text-white
      "
    >
      {/* ========================================================
          TEXTURE D'ARRIÈRE-PLAN
      ======================================================== */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.035]
          pointer-events-none
          bg-[radial-gradient(#1a1816_1.5px,transparent_1.5px)]
          [background-size:32px_32px]
        "
      />

      {/* ========================================================
          LIGNES ARCHITECTURALES
      ======================================================== */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          flex
          justify-between
          max-w-7xl
          mx-auto
          px-6
          opacity-[0.06]
        "
      >
        <div className="w-[1px] h-full bg-stone-900" />

        <div className="w-[1px] h-full bg-stone-900 hidden md:block" />

        <div className="w-[1px] h-full bg-stone-900" />
      </div>

      {/* ========================================================
          CONTENU PRINCIPAL
      ======================================================== */}

      <div
        className="
          mx-auto
          max-w-7xl
          w-full
          relative
          z-10
          flex
          flex-col
          flex-grow
          justify-between
        "
      >
        {/* ======================================================
            EN-TÊTE
        ====================================================== */}

        <div>
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-end
              justify-between
              gap-6
              border-b
              border-stone-400/30
              pb-8
            "
          >
            {/* LABEL */}

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <SectionLabel
                number="03"
                label="Processus de Conception"
              />
            </motion.div>

            {/* PAGINATION */}

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-3"
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-[0.25em]
                  text-[#77736c]
                  mr-2
                "
              >
                Étape {currentStep.number} / 0
                {designSteps.length}
              </span>

              {designSteps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => handleManualNav(idx)}
                  aria-label={`Aller à l'étape ${step.number}`}
                  className="
                    group
                    relative
                    h-2.5
                    transition-all
                    duration-500
                    cursor-pointer
                  "
                  style={{
                    width:
                      currentIndex === idx
                        ? "50px"
                        : "16px",
                  }}
                >
                  <div
                    className="
                      absolute
                      inset-0
                      rounded-full
                      bg-stone-400/40
                      group-hover:bg-stone-500
                      transition-colors
                    "
                  />

                  {currentIndex === idx && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="
                        absolute
                        inset-0
                        rounded-full
                        bg-[#a77b4e]
                      "
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* ====================================================
              GRILLE PRINCIPALE
          ==================================================== */}

          <div
            className="
              grid
              gap-12
              lg:grid-cols-12
              lg:items-end
            "
          >
            {/* ==================================================
                TEXTE
            ================================================== */}

            <div className="lg:col-span-7">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-4
                  "
                >
                  <span
                    className="
                      h-[1px]
                      w-10
                      bg-[#a77b4e]
                    "
                  />

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-[0.3em]
                      text-[#a77b4e]
                      font-semibold
                    "
                  >
                    {currentStep.category}
                  </span>
                </div>

                <h2
                  className="
                    font-display
                    text-5xl
                    leading-[0.92]
                    tracking-[-0.05em]
                    md:text-7xl
                    lg:text-8xl
                    text-stone-900
                  "
                >
                  Du dessin
                  <br />

                  <span
                    className="
                      text-[#77736c]
                      italic
                      font-light
                    "
                  >
                    à la matière.
                  </span>
                </h2>
              </motion.div>

              {/* DESCRIPTION */}

              <div
                className="
                  relative
                  mt-8
                  min-h-[110px]
                  max-w-xl
                "
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{
                      opacity: 0,
                      y: 15,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -15,
                      filter: "blur(6px)",
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <h3
                      className="
                        font-display
                        text-xl
                        text-stone-900
                        mb-2
                      "
                    >
                      {currentStep.title} —

                      <span
                        className="
                          text-[#a77b4e]
                          font-normal
                        "
                      >
                        {" "}
                        {currentStep.subtitle}
                      </span>
                    </h3>

                    <p
                      className="
                        text-sm
                        leading-7
                        text-[#625f59]
                      "
                    >
                      {currentStep.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ==================================================
                IMAGE / SLIDER
            ================================================== */}

            <div
              className="
                lg:col-span-5
                flex
                flex-col
                justify-between
                h-full
                lg:text-right
              "
            >
              <motion.div
                style={{
                  scale: bgScale,
                }}
                className="
                  relative
                  mt-14
                  h-[55vh]
                  min-h-[460px]
                  lg:h-[62vh]
                  w-full
                  overflow-hidden
                  rounded-sm
                  shadow-2xl
                  shadow-stone-900/15
                  bg-stone-300
                "
              >
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={currentStep.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                    "
                  >
                    <Image
                      src={currentStep.image}
                      alt={currentStep.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority
                    />

                    {/* VOILE */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-stone-950/40
                        via-transparent
                        to-stone-950/10
                        pointer-events-none
                      "
                    />

                    {/* BADGE */}

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 25,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        delay: 0.35,
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="
                        absolute
                        bottom-8
                        left-8
                        bg-white/95
                        backdrop-blur-md
                        px-7
                        py-5
                        rounded-xs
                        border
                        border-white/20
                        shadow-xl
                        max-w-md
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          mb-1
                        "
                      >
                        <span
                          className="
                            w-2
                            h-2
                            rounded-full
                            bg-[#a77b4e]
                          "
                        />

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.3em]
                            text-[#a77b4e]
                            font-bold
                          "
                        >
                          {currentStep.category} —{" "}
                          {currentStep.id}
                        </p>
                      </div>

                      <p
                        className="
                          font-display
                          text-2xl
                          text-stone-900
                        "
                      >
                        {currentStep.title}
                      </p>

                      <p
                        className="
                          text-xs
                          text-stone-600
                          mt-1
                        "
                      >
                        {currentStep.subtitle}
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* =================================================
                    CONTRÔLES
                ================================================= */}

                <div
                  className="
                    absolute
                    bottom-8
                    right-8
                    z-20
                    flex
                    gap-2
                  "
                >
                  <button
                    onClick={() => {
                      const prev =
                        (currentIndex -
                          1 +
                          designSteps.length) %
                        designSteps.length;

                      handleManualNav(prev);
                    }}
                    aria-label="Étape précédente"
                    className="
                      w-12
                      h-12
                      rounded-full
                      bg-white/90
                      backdrop-blur-md
                      border
                      border-white/40
                      flex
                      items-center
                      justify-center
                      text-stone-800
                      hover:bg-stone-900
                      hover:text-white
                      hover:border-stone-900
                      transition-all
                      duration-300
                      shadow-lg
                      cursor-pointer
                    "
                  >
                    ←
                  </button>

                  <button
                    onClick={() => {
                      const next =
                        (currentIndex + 1) %
                        designSteps.length;

                      handleManualNav(next);
                    }}
                    aria-label="Étape suivante"
                    className="
                      w-12
                      h-12
                      rounded-full
                      bg-white/90
                      backdrop-blur-md
                      border
                      border-white/40
                      flex
                      items-center
                      justify-center
                      text-stone-800
                      hover:bg-stone-900
                      hover:text-white
                      hover:border-stone-900
                      transition-all
                      duration-300
                      shadow-lg
                      cursor-pointer
                    "
                  >
                    →
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}