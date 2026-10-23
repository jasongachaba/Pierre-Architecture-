"use client";

import Image from "next/image";
import {
  motion,
  MotionValue,
  useTransform,
} from "motion/react";

import SectionLabel from "../../ui/SectionLabel";

interface HeroArchitectureProps {
  progress: MotionValue<number>;
}

export default function HeroArchitecture({
  progress,
}: HeroArchitectureProps) {

  /*
   * =========================================================
   * SCROLL DU HERO
   * =========================================================
   */

  const heroProgress = useTransform(
    progress,
    [0, 0.18],
    [0, 1]
  );
const scrollOpacity = useTransform(
  heroProgress,
  [0, 0.5, 1],
  [1, 0.8, 0]
);
  /*
   * =========================================================
   * SORTIE DU HERO AU SCROLL
   * =========================================================
   */

  const contentScrollY = useTransform(
    heroProgress,
    [0, 1],
    [0, -100]
  );

  const contentScrollOpacity = useTransform(
    heroProgress,
    [0, 0.7, 1],
    [1, 1, 0]
  );

  const imageScrollX = useTransform(
    heroProgress,
    [0, 1],
    [0, 80]
  );

  const imageScrollY = useTransform(
    heroProgress,
    [0, 1],
    [0, -50]
  );

  const imageScrollScale = useTransform(
    heroProgress,
    [0, 1],
    [1, 1.08]
  );

  const imageScrollOpacity = useTransform(
    heroProgress,
    [0, 0.75, 1],
    [1, 1, 0]
  );

  /*
   * =========================================================
   * CADRE AU SCROLL
   * =========================================================
   */

  const frameScrollX = useTransform(
    heroProgress,
    [0, 1],
    [0, 100]
  );

  const frameScrollY = useTransform(
    heroProgress,
    [0, 1],
    [0, -50]
  );

  const frameScrollOpacity = useTransform(
    heroProgress,
    [0, 0.7, 1],
    [1, 1, 0]
  );

  /*
   * =========================================================
   * IMAGE D'ENTRÉE
   * =========================================================
   */

  return (
    <section
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#eee9df]
      "
    >

      {/* =====================================================
          IMAGE
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 1.16,
          x: 90,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
        }}
        transition={{
          opacity: {
            duration: 0.8,
            ease: "easeOut",
          },
          scale: {
            duration: 1.8,
            ease: [0.22, 1, 0.36, 1],
          },
          x: {
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        style={{
          x: imageScrollX,
          y: imageScrollY,
          scale: imageScrollScale,
          opacity: imageScrollOpacity,
        }}
        className="
          absolute
          right-0
          top-0
          h-[85vh]
          w-full
          md:h-[100vh]
          md:w-[62%]
        "
      >
        <Image
          src="/images/hero/maison-hero.jpg"
          alt="Architecture contemporaine"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 62vw"
          className="object-cover"
        />

        {/* voile initial */}

        <motion.div
          initial={{
            opacity: 0.55,
          }}
          animate={{
            opacity: 0,
          }}
          transition={{
            delay: 0.45,
            duration: 1.2,
            ease: "easeOut",
          }}
          className="
            absolute
            inset-0
            bg-[#1c1c1a]
          "
        />

        {/* fondu vers le texte */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#eee9df]
            via-[#eee9df]/10
            to-transparent
          "
        />

      </motion.div>

      {/* =====================================================
          CONTENU GAUCHE
      ===================================================== */}

      <motion.div
        style={{
          y: contentScrollY,
          opacity: contentScrollOpacity,
        }}
        className="
          relative
          z-20
          mx-auto
          flex
          min-h-screen
          max-w-7xl
          items-center
          px-6
          md:px-10
        "
      >
        <div className="max-w-2xl">

          {/* =================================================
              LABEL
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.75,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <SectionLabel
              number="01"
              label="Architecture & design"
            />
          </motion.div>

          {/* =================================================
              TITRE
          ================================================= */}

          <div
            className="
              mt-8
              overflow-hidden
            "
          >
            <motion.div
              initial={{
                y: "110%",
              }}
              animate={{
                y: 0,
              }}
              transition={{
                delay: 0.95,
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h1
                className="
                  font-display
                  text-[clamp(4rem,9vw,9rem)]
                  leading-[0.82]
                  tracking-[-0.07em]
                  text-[#1c1c1a]
                "
              >
                Habiter
              </h1>
            </motion.div>
          </div>

          <div
            className="
              overflow-hidden
            "
          >
            <motion.div
              initial={{
                y: "110%",
              }}
              animate={{
                y: 0,
              }}
              transition={{
                delay: 1.08,
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h1
                className="
                  font-display
                  text-[clamp(4rem,9vw,9rem)]
                  leading-[0.82]
                  tracking-[-0.07em]
                  text-[#8c877e]
                "
              >
                autrement.
              </h1>
            </motion.div>
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <motion.p
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.45,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mt-10
              max-w-md
              text-sm
              leading-7
              text-[#625f59]
              md:text-base
            "
          >
            Nous concevons des espaces pensés autour
            des usages, de la lumière, de la matière
            et du contexte.
          </motion.p>

          {/* =================================================
              BOUTONS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.7,
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mt-10
              flex
              flex-wrap
              gap-3
            "
          >
            <a
              href="/projets"
              className="
                rounded-full
                bg-[transparent]
                border
                px-7
                py-3.5
                text-sm
                text-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#a77b4e]
              "
            >
              Découvrir les projets
            </a>

            <a
              href="/contact"
              className="
                rounded-full
                border
                border-[#1c1c1a]/20
                bg-white/40
                px-7
                py-3.5
                text-sm
                backdrop-blur-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#1c1c1a]
                hover:bg-white/70
              "
            >
              Votre projet
            </a>
          </motion.div>

        </div>
      </motion.div>

      {/* =====================================================
          CADRE ARCHITECTURAL
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.88,
          x: 50,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
        }}
        transition={{
          delay: 1.15,
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          x: frameScrollX,
          y: frameScrollY,
          opacity: frameScrollOpacity,
        }}
        className="
          pointer-events-none
          absolute
          right-[4%]
          top-[16%]
          z-20
          hidden
          h-[500px]
          w-[520px]
          lg:block
        "
      >

        {/* cadre extérieur */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 1.35,
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            inset-0
            border
            border-[#1c1c1a]/15
          "
        />

        {/* ligne horizontale */}

        <motion.div
          initial={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1,
          }}
          transition={{
            delay: 1.55,
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            left-0
            top-1/2
            h-px
            w-full
            origin-left
            bg-[#a77b4e]/45
          "
        />

        {/* ligne verticale */}

        <motion.div
          initial={{
            scaleY: 0,
          }}
          animate={{
            scaleY: 1,
          }}
          transition={{
            delay: 1.65,
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            left-1/2
            top-0
            h-full
            w-px
            origin-top
            bg-[#a77b4e]/45
          "
        />

        {/* coin supérieur */}

        <motion.div
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 1.8,
            duration: 0.6,
          }}
          className="
            absolute
            right-5
            top-5
            text-[8px]
            uppercase
            tracking-[0.3em]
            text-[#77736c]
          "
        >
          Étude volumétrique
        </motion.div>

        {/* coin inférieur */}

        <motion.div
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 1.95,
            duration: 0.6,
          }}
          className="
            absolute
            bottom-5
            left-5
            text-[8px]
            uppercase
            tracking-[0.3em]
            text-[#77736c]
          "
        >
          01 — Maison
        </motion.div>

        {/* dimension */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 2.1,
            duration: 0.6,
          }}
          className="
            absolute
            left-1/2
            top-[-28px]
            -translate-x-1/2
            text-[8px]
            tracking-[0.25em]
            text-[#77736c]
          "
        >
          12.40 m
        </motion.div>

      </motion.div>

      {/* =====================================================
          TEXTE SUR L'IMAGE
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: 30,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 1.9,
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          opacity: contentScrollOpacity,
        }}
        className="
          absolute
          bottom-[18%]
          right-[7%]
          z-30
          hidden
          max-w-[180px]
          lg:block
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
          Architecture
        </p>

        <p
          className="
            mt-3
            font-display
            text-xl
            leading-tight
            text-white
          "
        >
          Forme,
          <br />
          lumière,
          <br />
          matière.
        </p>
      </motion.div>

      {/* =====================================================
          SCROLL
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 2.3,
          duration: 0.8,
        }}
        style={{
          opacity: scrollOpacity,
        }}
        className="
          absolute
          bottom-8
          left-6
          z-40
          flex
          items-center
          gap-4
          text-[9px]
          uppercase
          tracking-[0.3em]
          text-[#77736c]
          md:left-10
        "
      >
        <span>Scroll</span>

        <motion.span
          animate={{
            scaleX: [1, 0.35, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            h-px
            w-16
            origin-left
            bg-[#a77b4e]
          "
        />

        <span>01 / 07</span>
      </motion.div>

    </section>
  );
}
