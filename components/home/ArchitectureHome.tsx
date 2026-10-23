"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
  useScroll,
} from "motion/react";

import type { HomeData } from "./data/homeData";

import ArchitecturalObject from "./architectural/ArchitecturalObject";

import HeroArchitecture from "./sections/HeroArchitecture";
import ConceptSection from "./sections/ConceptSection";
import DesignSection from "./sections/DesignSection";
import ExpertiseSection from "./sections/ExpertiseSection";
import WorksSection from "./sections/WorksSection";
import ContactArchitecture from "./sections/ContactArchitecture";
import Navbar from "@/components/layout/Navbar";
/* ============================================================
   TYPES
============================================================ */

interface ArchitectureHomeProps {
  data: HomeData;
}

/* ============================================================
   PRELOADER
============================================================ */

function ArchitecturePreloader() {
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    /*
     * Durée visuelle du préloader.
     * Les données Supabase sont déjà chargées lorsque
     * ArchitectureHome est rendu.
     */
    const duration = 1300;

    const animate = (time: number) => {
      const elapsed = time - start;

      /*
       * Courbe douce permettant d'éviter une progression
       * trop mécanique.
       */
      const raw = Math.min(elapsed / duration, 1);

      const eased =
        1 - Math.pow(1 - raw, 3);

      setProgress(Math.round(eased * 100));

      if (raw < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setProgress(100);

        setTimeout(() => {
          setFinished(true);
        }, 180);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            overflow-hidden
            bg-[#f4f2ed]
            text-[#1c1c1a]
          "
          initial={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.7,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
        >
          {/* ==================================================
              STRUCTURE GRAPHIQUE
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
            "
          >
            <div
              className="
                absolute
                left-[8vw]
                top-0
                h-full
                w-px
                bg-[#1c1c1a]/[0.06]
              "
            />

            <div
              className="
                absolute
                right-[8vw]
                top-0
                h-full
                w-px
                bg-[#1c1c1a]/[0.06]
              "
            />

            <div
              className="
                absolute
                left-0
                top-[12vh]
                h-px
                w-full
                bg-[#1c1c1a]/[0.06]
              "
            />

            <div
              className="
                absolute
                bottom-[12vh]
                left-0
                h-px
                w-full
                bg-[#1c1c1a]/[0.06]
              "
            />
          </div>

          {/* ==================================================
              CONTENU
          ================================================== */}

          <div
            className="
              relative
              flex
              h-full
              w-full
              max-w-[1600px]
              flex-col
              justify-between
              px-8
              py-8
              md:px-12
              md:py-10
              lg:px-16
              lg:py-12
            "
          >
            {/* TOP */}

            <motion.div
              initial={{
                opacity: 0,
                y: -12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                flex
                items-start
                justify-between
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.34em]
                    text-[#1c1c1a]/50
                  "
                >
                  Studio
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-[0.28em]
                    text-[#1c1c1a]/30
                  "
                >
                  Architecture
                </p>
              </div>

              <div
                className="
                  text-right
                  text-[9px]
                  uppercase
                  tracking-[0.28em]
                  text-[#1c1c1a]/40
                "
              >
                <p>RDC</p>
                <p className="mt-1">
                  Kinshasa
                </p>
              </div>
            </motion.div>

            {/* CENTRE */}

            <div
              className="
                relative
                flex
                flex-1
                items-center
                justify-center
              "
            >
              {/* Ligne verticale centrale */}

              <motion.div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-[30vh]
                  w-px
                  origin-center
                  -translate-x-1/2
                  -translate-y-1/2
                  bg-[#9b7b54]/30
                "
                initial={{
                  scaleY: 0,
                }}
                animate={{
                  scaleY: 1,
                }}
                transition={{
                  duration: 1,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />

              <div
                className="
                  relative
                  z-10
                  text-center
                "
              >
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    mb-5
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.42em]
                    text-[#9b7b54]
                  "
                >
                  Architecture · Data · IA
                </motion.p>

                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    font-serif
                    text-[clamp(3rem,8vw,8rem)]
                    font-light
                    leading-[0.85]
                    tracking-[-0.055em]
                  "
                >
                  SHERIA
                </motion.h1>

                <motion.div
                  initial={{
                    opacity: 0,
                    scaleX: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scaleX: 1,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.45,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                  className="
                    mx-auto
                    mt-6
                    h-px
                    w-16
                    origin-center
                    bg-[#9b7b54]
                  "
                />

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    mt-5
                    text-[9px]
                    uppercase
                    tracking-[0.38em]
                    text-[#1c1c1a]/45
                  "
                >
                  Studio d'architecture
                </motion.p>
              </div>
            </div>

            {/* BOTTOM */}

            <div
              className="
                flex
                items-end
                justify-between
              "
            >
              {/* Indicateur */}

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.4,
                }}
                className="
                  flex
                  items-end
                  gap-4
                "
              >
                <span
                  className="
                    font-mono
                    text-[10px]
                    tabular-nums
                    text-[#1c1c1a]/50
                  "
                >
                  {String(progress).padStart(3, "0")}
                </span>

                <div
                  className="
                    h-px
                    w-24
                    overflow-hidden
                    bg-[#1c1c1a]/10
                    sm:w-40
                  "
                >
                  <motion.div
                    className="
                      h-full
                      origin-left
                      bg-[#1c1c1a]
                    "
                    animate={{
                      scaleX: progress / 100,
                    }}
                    transition={{
                      duration: 0.1,
                      ease: "linear",
                    }}
                  />
                </div>
              </motion.div>

              {/* Année */}

              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                }}
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.28em]
                  text-[#1c1c1a]/35
                "
              >
                2026
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   ARCHITECTURE HOME
============================================================ */

export default function ArchitectureHome({
  data,
}: ArchitectureHomeProps) {
  /* ==========================================================
     PROGRESSION GLOBALE
  ========================================================== */

  const {
    scrollYProgress: documentProgress,
  } = useScroll();

  /* ==========================================================
     RÉFÉRENCES DES SECTIONS
  ========================================================== */

  const heroRef = useRef<HTMLElement | null>(null);

  const conceptRef = useRef<HTMLElement | null>(null);

  const designRef = useRef<HTMLElement | null>(null);

  const projectRef = useRef<HTMLElement | null>(null);

  /* ==========================================================
     PROGRESSION HERO
  ========================================================== */

  const {
    scrollYProgress: heroProgress,
  } = useScroll({
    target: heroRef,
    offset: [
      "start start",
      "end start",
    ],
  });

  /* ==========================================================
     PROGRESSION CONCEPT
  ========================================================== */

  const {
    scrollYProgress: conceptProgress,
  } = useScroll({
    target: conceptRef,
    offset: [
      "start end",
      "end start",
    ],
  });

  /* ==========================================================
     PROGRESSION DESIGN
  ========================================================== */

  const {
    scrollYProgress: designProgress,
  } = useScroll({
    target: designRef,
    offset: [
      "start end",
      "end start",
    ],
  });

  /* ==========================================================
     PROGRESSION PROJECT
  ========================================================== */

  const {
    scrollYProgress: projectProgress,
  } = useScroll({
    target: projectRef,
    offset: [
      "start end",
      "end start",
    ],
  });

  /* ==========================================================
     PROJET PRINCIPAL
  ========================================================== */

  const featuredProject =
    data.featuredProject;

  /* ==========================================================
     RENDU
  ========================================================== */

  return (
    <>
      {/* ======================================================
          PRELOADER
      ====================================================== */}

      <ArchitecturePreloader />

      {/* ======================================================
          SITE PRINCIPAL
      ====================================================== */}
      <Navbar />
      <main
        className="
          relative
          overflow-x-hidden
          bg-[#f4f2ed]
          text-[#1c1c1a]
        "
      >
        {/* ====================================================
            OBJET ARCHITECTURAL GLOBAL
        ==================================================== */}

        <ArchitecturalObject
          documentProgress={
            documentProgress
          }
          heroProgress={
            heroProgress
          }
          conceptProgress={
            conceptProgress
          }
          designProgress={
            designProgress
          }
          projectProgress={
            projectProgress
          }
        />

        {/* ====================================================
            SECTION 01 — HERO
        ==================================================== */}

        <section
          id="accueil"
          ref={heroRef}
          className="
            relative
            scroll-mt-24
          "
        >
          <HeroArchitecture
            // !  profile={data.profile}
            progress={
              documentProgress
            }
          />
        </section>

        {/* ====================================================
            SECTION 02 — CONCEPT / VISION
        ==================================================== */}

        <section
          id="vision"
          ref={conceptRef}
          className="
            relative
            scroll-mt-24
          "
        >
          <ConceptSection
            // profile={data.profile}
            progress={
              documentProgress
            }
          />
        </section>

        {/* ====================================================
            SECTION 03 — DESIGN
        ==================================================== */}

        <section
          id="design"
          ref={designRef}
          className="
            relative
            scroll-mt-24
          "
        >
          <DesignSection
            // profile={data.profile}
            progress={
              documentProgress
            }
          />
        </section>

        {/* ====================================================
            SECTION 04 — PROJECT
        ==================================================== */}

        <section
          id="projet"
          ref={projectRef}
          className="
            relative
            scroll-mt-24
          "
        >

        </section>

        {/* ====================================================
            SECTION 05 — STUDIO / EXPERTISE
        ==================================================== */}

        <section
          id="studio"
          className="
            relative
            scroll-mt-24
          "
        >
          <ExpertiseSection
            gallery={data.gallery}
            progress={
              documentProgress
            }
          />
        </section>

        {/* ====================================================
            SECTION 06 — PROJETS / WORKS
        ==================================================== */}

        <section
          id="projets"
          className="
            relative
            scroll-mt-24
          "
        >
          <WorksSection
            projects={
              data.projects
            }
            progress={
              documentProgress
            }
          />
        </section>

        {/* ====================================================
            SECTION 07 — CONTACT
        ==================================================== */}

        <section
          id="contact"
          className="
            relative
            scroll-mt-24
          "
        >
          <ContactArchitecture
            profile={data.profile}
            socialLinks={data.socialLinks}
          />
        </section>
      </main>
    </>
  );
}
