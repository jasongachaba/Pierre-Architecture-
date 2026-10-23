"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";

import {
  AnimatePresence,
  motion,
  MotionValue,
  useTransform,
} from "motion/react";

import SectionLabel from "../../ui/SectionLabel";

/* ============================================================
   TYPES
============================================================ */

interface Project {
  id: string;

  title?: string | null;
  slug?: string | null;

  description?: string | null;
  excerpt?: string | null;

  location?: string | null;
  city?: string | null;
  province?: string | null;

  category?: string | null;
  type?: string | null;

  cover_image_url?: string | null;
  image_url?: string | null;
  cover_image?: string | null;

  status?: string | null;

  featured?: boolean | null;

  [key: string]: unknown;
}

interface WorksSectionProps {
  projects: Project[];
  progress: MotionValue<number>;
}

/* ============================================================
   HELPERS
============================================================ */

function getProjectImage(project: Project): string | null {
  return (
    project.cover_image_url ||
    project.image_url ||
    project.cover_image ||
    null
  );
}

function getProjectLocation(project: Project): string {
  if (project.location) return project.location;

  const parts = [project.city, project.province].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "RDC";
}

function getProjectSubtitle(project: Project): string {
  return (
    project.category ||
    project.type ||
    "Projet architectural"
  );
}

function getProjectDescription(project: Project): string {
  return (
    project.description ||
    project.excerpt ||
    "Une réalisation architecturale pensée autour des usages, des volumes et de son environnement."
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function WorksSection({
  projects,
  progress,
}: WorksSectionProps) {
  /* ==========================================================
     ANIMATION SECTION
  ========================================================== */

  const y = useTransform(progress, [0.7, 1], [100, 0]);

  /* ==========================================================
     PROJECTS
  ========================================================== */

  const validProjects = useMemo(() => {
    return (projects ?? []).filter((project) => {
      return Boolean(project?.id && project?.title);
    });
  }, [projects]);

  const [activeIndex, setActiveIndex] = useState(0);

  /* ==========================================================
     RESET ACTIVE INDEX
     Évite un index invalide lorsque les données Supabase
     changent dynamiquement.
  ========================================================== */

  useEffect(() => {
    if (activeIndex >= validProjects.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, validProjects.length]);

  /* ==========================================================
     AUTO SLIDER
  ========================================================== */

  useEffect(() => {
    if (validProjects.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        return (prev + 1) % validProjects.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [validProjects.length]);

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  if (validProjects.length === 0) {
    return (
      <section
        id="projets"
        className="relative overflow-hidden bg-[#eee9df] px-6 py-24 text-[#1c1c1a] md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <SectionLabel number="06" label="Réalisations" />

          <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="font-display text-5xl leading-[0.9] tracking-[-0.050em] md:text-8xl">
              Quelques
              <br />
              <span className="text-[#77736c]">projets.</span>
            </h2>

            <p className="max-w-sm text-sm leading-7 text-[#625f59]">
              Les réalisations seront présentées ici dès qu’elles seront
              disponibles.
            </p>
          </div>

          <motion.div
            style={{ y }}
            className="mt-16 flex h-[420px] items-center justify-center rounded-2xl border border-[#1c1c1a]/15 bg-[#e5dfd4] md:h-[500px]"
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#77736c]">
                Architecture Lab
              </p>

              <p className="mt-4 font-display text-3xl">
                Aucun projet publié
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const current = validProjects[activeIndex];

  const currentImage = getProjectImage(current);

  /* ============================================================
     PROJECT NUMBER
  ============================================================ */

  const currentNumber = String(activeIndex + 1).padStart(2, "0");

  const totalNumber = String(validProjects.length).padStart(2, "0");

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section
      id="projets"
      className="relative overflow-hidden bg-[#eee9df] px-6 py-24 text-[#1c1c1a] md:px-10"
    >
      <div className="mx-auto max-w-7xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <SectionLabel number="06" label="Réalisations" />

        <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 className="font-display text-5xl leading-[0.9] tracking-[-0.050em] md:text-8xl">
            Quelques
            <br />
            <span className="text-[#77736c]">projets.</span>
          </h2>

          <p className="max-w-sm text-sm leading-7 text-[#625f59]">
            Une sélection de projets présentés en immersion dynamique.
          </p>
        </div>

        {/* ======================================================
            MAIN PROJECT CONTAINER
        ====================================================== */}

        <motion.div
          style={{ y }}
          className="
            relative
            mt-16
            h-[620px]
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-[#1c1c1a]/15
            shadow-xl
            md:h-[700px]
          "
        >
          {/* ====================================================
              DYNAMIC BACKGROUND
          ==================================================== */}

          <div className="absolute inset-0">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={current.id}
                initial={{
                  opacity: 0,
                  scale: 1.04,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 1,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="absolute inset-0"
              >
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={current.title ?? "Projet architectural"}
                    fill
                    priority={activeIndex === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#d8d1c5]">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#625f59]">
                        Architecture Lab
                      </p>

                      <p className="mt-3 font-display text-3xl text-[#1c1c1a]">
                        {current.title}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Gradient gauche */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

            {/* Gradient bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          </div>

          {/* ====================================================
              TEXT CONTENT
          ==================================================== */}

          <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12">
            {/* ==================================================
                TOP BAR
            ================================================== */}

            <div className="flex items-center justify-between text-white/90">
              <span className="text-xs font-medium uppercase tracking-[0.3em]">
                Architecture Lab
              </span>

              <span className="font-mono text-sm tracking-widest text-white/70">
                {currentNumber} / {totalNumber}
              </span>
            </div>

            {/* ==================================================
                PROJECT INFORMATION
            ================================================== */}

            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -15,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                >
                  {/* Category */}
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
                    {getProjectSubtitle(current)}
                  </p>

                  {/* Title */}
                  <h3 className="font-display text-4xl uppercase leading-none tracking-tight text-white sm:text-6xl md:text-7xl">
                    {current.title}
                  </h3>

                  {/* Location */}
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/60">
                    {getProjectLocation(current)}
                  </p>

                  {/* Description */}
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                    {getProjectDescription(current)}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ==================================================
                BOTTOM CONTROLS
            ================================================== */}

            <div className="flex w-full items-end justify-between gap-6 pt-4">
              {/* =================================================
                  PREVIOUS / NEXT
              ================================================= */}

              <div className="hidden items-center gap-3 md:flex">
                <button
                  type="button"
                  aria-label="Projet précédent"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === 0
                        ? validProjects.length - 1
                        : prev - 1,
                    )
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/30
                    text-white
                    transition
                    hover:bg-white/20
                  "
                >
                  ←
                </button>

                <button
                  type="button"
                  aria-label="Projet suivant"
                  onClick={() =>
                    setActiveIndex(
                      (prev) =>
                        (prev + 1) % validProjects.length,
                    )
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/30
                    text-white
                    transition
                    hover:bg-white/20
                  "
                >
                  →
                </button>
              </div>

              {/* =================================================
                  PROJECT THUMBNAILS
              ================================================= */}

              <div className="scrollbar-none flex w-full gap-2.5 overflow-x-auto pb-1 md:w-auto">
                {validProjects.map((project, index) => {
                  const isActive = activeIndex === index;

                  const image = getProjectImage(project);

                  const number = String(index + 1).padStart(2, "0");

                  return (
                    <div
                      key={project.id}
                      onClick={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`
                        relative
                        h-[140px]
                        w-[100px]
                        flex-shrink-0
                        cursor-pointer
                        overflow-hidden
                        rounded-lg
                        border
                        transition-all
                        duration-500
                        md:h-[170px]
                        md:w-[120px]
                        ${
                          isActive
                            ? "scale-105 border-white shadow-lg ring-2 ring-white/50"
                            : "border-white/20 opacity-60 hover:opacity-100"
                        }
                      `}
                    >
                      {/* Thumbnail image */}
                      {image ? (
                        <Image
                          src={image}
                          alt={project.title ?? "Projet"}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#7c776e]" />
                      )}

                      {/* Thumbnail gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Thumbnail information */}
                      <div className="absolute inset-0 flex flex-col justify-between p-2.5 text-white">
                        <span className="font-mono text-[9px]">
                          {number}
                        </span>

                        <div>
                          <p className="truncate text-[8px] uppercase tracking-wider text-white/70">
                            {getProjectSubtitle(project)}
                          </p>

                          <p className="mt-0.5 line-clamp-1 text-[11px] font-bold leading-tight">
                            {project.title}
                          </p>
                        </div>
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeCardIndicatorLight"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-[#d4af37]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}