"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  motion,
  type MotionValue,
  useTransform,
} from "motion/react";

import { ArrowUpRight, MapPin } from "lucide-react";

import SectionLabel from "../../ui/SectionLabel";
import { getSupabaseClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

interface ProjectCategory {
  id: string;
  name: string | null;
}

interface Project {
  id: string;
  reference: string | null;
  category_id: string | null;

  title: string;
  slug: string;

  subtitle: string | null;
  short_description: string | null;
  description: string | null;

  project_type: string | null;

  client_name: string | null;

  location: string | null;
  city: string | null;
  province: string | null;
  country: string | null;

  year: number | null;
  start_date: string | null;
  completion_date: string | null;
  deadline: string | null;

  surface_area: number | null;
  surface_unit: string | null;

  budget: number | null;
  budget_currency: string | null;

  progress: number;

  latitude: number | null;
  longitude: number | null;

  cover_image_url: string | null;
  cover_image_path: string | null;

  status: "draft" | "published" | "archived";

  featured: boolean;
  display_order: number;

  published_at: string | null;
  created_at: string;
  updated_at: string;

  project_categories?: ProjectCategory | null;
}

interface ProjectSectionProps {
  progress: MotionValue<number>;
}

/* ============================================================
   HELPERS
============================================================ */

function formatSurface(
  value: number | null,
  unit: string | null,
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);

  return `${formatted} ${unit || "m²"}`;
}

function buildLocation(project: Project): string {
  const parts = [
    project.city,
    project.province,
    project.country,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return project.location || "RDC";
}

function getProjectImage(project: Project): string | null {
  return project.cover_image_url || null;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ProjectSection({
  progress,
}: ProjectSectionProps) {
  const supabase = getSupabaseClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  /* ==========================================================
     LOAD PROJECTS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
            id,
            reference,
            category_id,
            title,
            slug,
            subtitle,
            short_description,
            description,
            project_type,
            client_name,
            location,
            city,
            province,
            country,
            year,
            start_date,
            completion_date,
            deadline,
            surface_area,
            surface_unit,
            budget,
            budget_currency,
            progress,
            latitude,
            longitude,
            cover_image_url,
            cover_image_path,
            status,
            featured,
            display_order,
            published_at,
            created_at,
            updated_at,
            project_categories (
              id,
              name
            )
          `,
        )
        .eq("status", "published")
        .order("featured", {
          ascending: false,
        })
        .order("display_order", {
          ascending: true,
        })
        .order("published_at", {
          ascending: false,
        });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "[ProjectSection] Impossible de charger les projets :",
          error,
        );

        setProjects([]);
        setLoading(false);
        return;
      }

      setProjects((data as Project[]) || []);
      setLoading(false);
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  /* ==========================================================
     PROJECT DISPLAY
  ========================================================== */

  const project = useMemo(() => {
    return projects[0] ?? null;
  }, [projects]);

  /* ============================================================
     PROGRESSION GÉNÉRALE
  ============================================================ */

  const sectionOpacity = useTransform(
    progress,
    [0, 0.05, 0.15, 0.85, 1],
    [0.2, 1, 1, 1, 0.9],
  );

  /* ============================================================
     LABEL DE SECTION
  ============================================================ */

  const labelOpacity = useTransform(
    progress,
    [0, 0.15],
    [0, 1],
  );

  const labelY = useTransform(
    progress,
    [0, 0.15],
    [20, 0],
  );

  /* ============================================================
     INDEX
  ============================================================ */

  const indexOpacity = useTransform(
    progress,
    [0.02, 0.2],
    [0, 1],
  );

  const indexX = useTransform(
    progress,
    [0.02, 0.2],
    [20, 0],
  );

  /* ============================================================
     TEXTE PRINCIPAL
  ============================================================ */

  const textX = useTransform(
    progress,
    [0.02, 0.25, 0.75, 0.95],
    [-40, 0, 0, -10],
  );

  const textY = useTransform(
    progress,
    [0.02, 0.25],
    [25, 0],
  );

  const textOpacity = useTransform(
    progress,
    [0.02, 0.15, 0.8, 0.95],
    [0, 1, 1, 0.9],
  );

  /* ============================================================
     SUR-LIGNE
  ============================================================ */

  const eyebrowOpacity = useTransform(
    progress,
    [0.05, 0.2],
    [0, 1],
  );

  const eyebrowX = useTransform(
    progress,
    [0.05, 0.2],
    [-15, 0],
  );

  /* ============================================================
     TITRE
  ============================================================ */

  const titleOpacity = useTransform(
    progress,
    [0.08, 0.25],
    [0, 1],
  );

  const titleY = useTransform(
    progress,
    [0.08, 0.28],
    [35, 0],
  );

  const titleScale = useTransform(
    progress,
    [0.08, 0.28],
    [0.98, 1],
  );

  /* ============================================================
     LIGNE SOUS TITRE
  ============================================================ */

  const titleLineScale = useTransform(
    progress,
    [0.15, 0.35],
    [0, 1],
  );

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const descriptionOpacity = useTransform(
    progress,
    [0.18, 0.35],
    [0, 1],
  );

  const descriptionY = useTransform(
    progress,
    [0.18, 0.35],
    [20, 0],
  );

  /* ============================================================
     IMAGE
  ============================================================ */

  const imageY = useTransform(
    progress,
    [0.02, 0.25, 0.6, 0.9],
    [50, 20, -10, -40],
  );

  const imageX = useTransform(
    progress,
    [0.02, 0.25, 0.7],
    [30, 10, 0],
  );

  const imageScale = useTransform(
    progress,
    [0.02, 0.3, 0.8],
    [1.08, 1.03, 1],
  );

  const imageOpacity = useTransform(
    progress,
    [0.02, 0.15, 0.85, 1],
    [0, 1, 1, 0.9],
  );

  /* ============================================================
     CADRE IMAGE
  ============================================================ */

  const imageFrameY = useTransform(
    progress,
    [0.05, 0.3],
    [20, 0],
  );

  /* ============================================================
     OVERLAY
  ============================================================ */

  const imageOverlayOpacity = useTransform(
    progress,
    [0.05, 0.25, 0.75],
    [0.25, 0.06, 0.02],
  );

  /* ============================================================
     LIGNE OBLIQUE
  ============================================================ */

  const diagonalOpacity = useTransform(
    progress,
    [0.1, 0.3],
    [0, 1],
  );

  const diagonalScale = useTransform(
    progress,
    [0.1, 0.35],
    [0, 1],
  );

  /* ============================================================
     FICHE PROJET
  ============================================================ */

  const technicalOpacity = useTransform(
    progress,
    [0.25, 0.45],
    [0, 1],
  );

  const technicalY = useTransform(
    progress,
    [0.25, 0.45],
    [15, 0],
  );

  const detailsOpacity = useTransform(
    progress,
    [0.25, 0.45],
    [0, 1],
  );

  const detailsY = useTransform(
    progress,
    [0.25, 0.45],
    [20, 0],
  );

  /* ============================================================
     BADGE
  ============================================================ */

  const badgeOpacity = useTransform(
    progress,
    [0.15, 0.35],
    [0, 1],
  );

  const badgeX = useTransform(
    progress,
    [0.15, 0.35],
    [-20, 0],
  );

  const imageCaptionOpacity = useTransform(
    progress,
    [0.3, 0.5],
    [0, 1],
  );

  const imageCaptionY = useTransform(
    progress,
    [0.3, 0.5],
    [15, 0],
  );

  /* ============================================================
     INDICATEUR BAS
  ============================================================ */

  const bottomOpacity = useTransform(
    progress,
    [0.6, 0.75, 0.95],
    [0, 1, 0],
  );

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  if (!loading && !project) {
    return (
      <section
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          overflow-hidden
          bg-[#e8e4db]
          px-6
          py-28
          md:px-10
          md:py-36
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.035]
            [background-image:radial-gradient(#1c1c1a_0.8px,transparent_0.8px)]
            [background-size:22px_22px]
          "
        />

        <div
          className="
            relative
            z-10
            mx-auto
            w-full
            max-w-[1450px]
          "
        >
          <SectionLabel
            number="04"
            label="Projet"
          />

          <div
            className="
              mt-20
              max-w-2xl
              border-t
              border-[#1c1c1a]/15
              pt-8
            "
          >
            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.3em]
                text-[#a77b4e]
              "
            >
              Portfolio
            </p>

            <h2
              className="
                mt-5
                font-display
                text-[clamp(3rem,6vw,6rem)]
                leading-[0.85]
                tracking-[-0.06em]
                text-[#1c1c1a]
              "
            >
              Les projets
              <br />
              <span className="font-light italic text-[#77736c]">
                arrivent.
              </span>
            </h2>

            <p className="mt-8 max-w-md text-sm leading-7 text-[#625f59]">
              Les projets publiés apparaîtront ici automatiquement
              dès leur mise en ligne depuis l&apos;administration.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ============================================================
     DATA
  ============================================================ */

  const image = getProjectImage(project);

  const category =
    project.project_categories?.name ||
    project.project_type ||
    "Architecture";

  const location = buildLocation(project);

  const description =
    project.short_description ||
    project.description ||
    "Un projet architectural pensé autour des usages, de la matière et de son environnement.";

  const projectNumber = String(
    Math.max(1, projects.indexOf(project) + 1),
  ).padStart(2, "0");

  const totalProjects = String(
    Math.max(projects.length, 1),
  ).padStart(2, "0");

  const year =
    project.year ||
    (project.completion_date
      ? new Date(project.completion_date).getFullYear()
      : null);

  return (
    <section
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#e8e4db]
        px-6
        py-28
        md:px-10
        md:py-36
      "
    >
      {/* ========================================================
          TEXTURE
      ======================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#1c1c1a_0.8px,transparent_0.8px)]
          [background-size:22px_22px]
        "
      />

      {/* ========================================================
          GRILLE ARCHITECTURALE
      ======================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.16]
        "
      >
        <div className="absolute left-[8%] top-0 h-full w-px bg-[#1c1c1a]/10" />
        <div className="absolute left-[50%] top-0 h-full w-px bg-[#1c1c1a]/10" />
        <div className="absolute right-[8%] top-0 h-full w-px bg-[#1c1c1a]/10" />

        <div className="absolute left-0 top-[25%] h-px w-full bg-[#1c1c1a]/10" />
        <div className="absolute left-0 top-[75%] h-px w-full bg-[#1c1c1a]/10" />
      </div>

      {/* ========================================================
          CONTENU
      ======================================================== */}

      <motion.div
        style={{
          opacity: sectionOpacity,
        }}
        className="
          relative
          z-10
          mx-auto
          max-w-[1450px]
        "
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-start justify-between">
          <motion.div
            style={{
              opacity: labelOpacity,
              y: labelY,
            }}
          >
            <SectionLabel
              number="04"
              label="Projet"
            />
          </motion.div>

          <motion.div
            style={{
              opacity: indexOpacity,
              x: indexX,
            }}
            className="
              hidden
              items-center
              gap-4
              md:flex
            "
          >
            <span className="h-px w-12 bg-[#a77b4e]/50" />

            <span
              className="
                text-[9px]
                uppercase
                tracking-[0.32em]
                text-[#8b867e]
              "
            >
              {projectNumber} / {totalProjects}
            </span>
          </motion.div>
        </div>

        {/* ======================================================
            STRUCTURE PRINCIPALE
        ====================================================== */}

        <div
          className="
            relative
            mt-20
            grid
            gap-14
            md:mt-24
            md:grid-cols-[0.78fr_1.22fr]
            md:gap-0
          "
        >
          {/* ====================================================
              COLONNE GAUCHE
          ==================================================== */}

          <motion.div
            style={{
              x: textX,
              y: textY,
              opacity: textOpacity,
            }}
            className="
              relative
              z-20
              flex
              flex-col
              justify-center
              md:pr-16
              lg:pr-24
            "
          >
            {/* ==================================================
                SUR-LIGNE
            ================================================== */}

            <motion.div
              style={{
                opacity: eyebrowOpacity,
                x: eyebrowX,
              }}
              className="
                flex
                items-center
                gap-4
              "
            >
              <span
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.3em]
                  text-[#a77b4e]
                "
              >
                {category}
              </span>

              <span className="h-px w-12 bg-[#a77b4e]/50" />
            </motion.div>

            {/* ==================================================
                TITRE
            ================================================== */}

            <motion.h2
              style={{
                opacity: titleOpacity,
                y: titleY,
                scale: titleScale,
              }}
              className="
                mt-7
                origin-left
                font-display
                text-[clamp(3.5rem,6vw,7rem)]
                leading-[0.82]
                tracking-[-0.065em]
                text-[#1c1c1a]
              "
            >
              {project.title}
            </motion.h2>

            {/* ==================================================
                SOUS-TITRE
            ================================================== */}

            {project.subtitle ? (
              <motion.p
                style={{
                  opacity: titleOpacity,
                  y: titleY,
                }}
                className="
                  mt-5
                  max-w-xl
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  text-[#77736c]
                "
              >
                {project.subtitle}
              </motion.p>
            ) : null}

            {/* ==================================================
                LIGNE
            ================================================== */}

            <motion.div
              style={{
                scaleX: titleLineScale,
                transformOrigin: "left",
              }}
              className="
                mt-8
                h-px
                w-full
                max-w-md
                bg-[#1c1c1a]/15
              "
            />

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <motion.p
              style={{
                opacity: descriptionOpacity,
                y: descriptionY,
              }}
              className="
                mt-8
                max-w-md
                text-sm
                leading-7
                text-[#625f59]
              "
            >
              {description}
            </motion.p>

            {/* ==================================================
                FICHE PROJET
            ================================================== */}

            <motion.div
              style={{
                opacity: detailsOpacity,
                y: detailsY,
              }}
              className="
                mt-12
                grid
                grid-cols-2
                border-t
                border-[#1c1c1a]/15
              "
            >
              {/* SURFACE */}

              <div
                className="
                  border-r
                  border-[#1c1c1a]/15
                  py-5
                  pr-5
                "
              >
                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.28em]
                    text-[#8b867e]
                  "
                >
                  Surface utile
                </p>

                <p
                  className="
                    mt-3
                    font-display
                    text-3xl
                    tracking-[-0.04em]
                    text-[#1c1c1a]
                  "
                >
                  {formatSurface(
                    project.surface_area,
                    project.surface_unit,
                  )}
                </p>
              </div>

              {/* ANNÉE */}

              <div className="py-5 pl-5">
                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.28em]
                    text-[#8b867e]
                  "
                >
                  Année
                </p>

                <p
                  className="
                    mt-3
                    font-display
                    text-3xl
                    tracking-[-0.04em]
                    text-[#1c1c1a]
                  "
                >
                  {year || "—"}
                </p>
              </div>
            </motion.div>

            {/* ==================================================
                DONNÉES TECHNIQUES
            ================================================== */}

            <motion.div
              style={{
                opacity: technicalOpacity,
                y: technicalY,
              }}
              className="
                mt-8
                grid
                grid-cols-2
                gap-x-8
                gap-y-5
              "
            >
              {/* TYPE */}

              <div>
                <p className="text-[8px] uppercase tracking-[0.25em] text-[#a77b4e]">
                  01
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#4e4b46]">
                  Type
                </p>

                <p className="mt-1 text-[10px] text-[#77736c]">
                  {project.project_type || "Architecture"}
                </p>
              </div>

              {/* LOCALISATION */}

              <div>
                <p className="text-[8px] uppercase tracking-[0.25em] text-[#a77b4e]">
                  02
                </p>

                <p className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#4e4b46]">
                  <MapPin size={10} strokeWidth={1.5} />
                  Localisation
                </p>

                <p className="mt-1 line-clamp-2 text-[10px] text-[#77736c]">
                  {location}
                </p>
              </div>

              {/* CLIENT */}

              <div>
                <p className="text-[8px] uppercase tracking-[0.25em] text-[#a77b4e]">
                  03
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#4e4b46]">
                  Client
                </p>

                <p className="mt-1 line-clamp-1 text-[10px] text-[#77736c]">
                  {project.client_name || "Projet privé"}
                </p>
              </div>

              {/* RÉFÉRENCE */}

              <div>
                <p className="text-[8px] uppercase tracking-[0.25em] text-[#a77b4e]">
                  04
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#4e4b46]">
                  Référence
                </p>

                <p className="mt-1 text-[10px] text-[#77736c]">
                  {project.reference || "—"}
                </p>
              </div>
            </motion.div>

            {/* ==================================================
                CTA
            ================================================== */}

            <motion.div
              style={{
                opacity: detailsOpacity,
                y: detailsY,
              }}
              className="mt-10"
            >
              <Link
                href={`/projets/${project.slug}`}
                className="
                  group
                  inline-flex
                  items-center
                  gap-4
                  border-b
                  border-[#1c1c1a]/20
                  pb-3
                  text-[9px]
                  uppercase
                  tracking-[0.25em]
                  text-[#1c1c1a]
                  transition-colors
                  duration-300
                  hover:border-[#a77b4e]
                  hover:text-[#a77b4e]
                "
              >
                <span>
                  Étudier le projet
                </span>

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.4}
                  className="
                    transition-transform
                    duration-300
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </Link>
            </motion.div>
          </motion.div>

          {/* ====================================================
              IMAGE
          ==================================================== */}

          <motion.div
            style={{
              opacity: imageOpacity,
              y: imageFrameY,
            }}
            className="
              relative
              z-10
              min-h-[540px]
              md:h-[78vh]
              md:min-h-[620px]
            "
          >
            {/* CADRE EXTÉRIEUR */}

            <div
              className="
                absolute
                -right-3
                -top-3
                h-full
                w-full
                border
                border-[#1c1c1a]/10
                md:-right-6
                md:-top-6
              "
            />

            {/* ==================================================
                IMAGE
            ================================================== */}

            <div
              className="
                relative
                h-full
                min-h-[540px]
                overflow-hidden
                bg-[#d5d0c5]
                md:min-h-0
              "
            >
              {image ? (
                <motion.div
                  style={{
                    y: imageY,
                    x: imageX,
                    scale: imageScale,
                  }}
                  className="
                    absolute
                    -inset-[9%]
                  "
                >
                  <Image
                    src={image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 65vw"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              ) : (
                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-[#d5d0c5]
                  "
                >
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#77736c]">
                      Image indisponible
                    </p>

                    <p className="mt-3 font-display text-2xl text-[#1c1c1a]">
                      {project.title}
                    </p>
                  </div>
                </div>
              )}

              {/* OVERLAY */}

              <motion.div
                style={{
                  opacity: imageOverlayOpacity,
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[#1c1c1a]
                "
              />

              {/* GRADIENT */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#1c1c1a]/40
                  via-transparent
                  to-[#1c1c1a]/10
                "
              />

              {/* CADRE INTERNE */}

              <motion.div
                style={{
                  opacity: diagonalOpacity,
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-5
                  border
                  border-white/25
                  md:inset-8
                "
              />

              {/* ==================================================
                  BADGE
              ================================================== */}

              <motion.div
                style={{
                  opacity: badgeOpacity,
                  x: badgeX,
                }}
                className="
                  absolute
                  left-6
                  top-6
                  flex
                  items-center
                  gap-3
                  md:left-8
                  md:top-8
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    border
                    border-white/60
                    text-[9px]
                    text-white
                  "
                >
                  {projectNumber}
                </span>

                <span
                  className="
                    max-w-[180px]
                    text-[9px]
                    uppercase
                    tracking-[0.28em]
                    text-white/80
                  "
                >
                  {category}
                </span>
              </motion.div>

              {/* ==================================================
                  COORDONNÉES / LOCALISATION
              ================================================== */}

              <div
                className="
                  absolute
                  right-6
                  top-6
                  text-right
                  md:right-8
                  md:top-8
                "
              >
                <p className="text-[8px] uppercase tracking-[0.25em] text-white/55">
                  {project.country || "RDC"}
                </p>

                <p className="mt-1 max-w-[180px] text-[8px] uppercase tracking-[0.18em] text-white/55">
                  {location}
                </p>
              </div>

              {/* ==================================================
                  MARQUEUR
              ================================================== */}

              <div
                className="
                  absolute
                  bottom-8
                  left-8
                  hidden
                  md:block
                "
              >
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-white/50" />

                  <span className="text-[8px] uppercase tracking-[0.25em] text-white/65">
                    Architecture / {projectNumber}
                  </span>
                </div>
              </div>

              {/* ==================================================
                  ANNÉE
              ================================================== */}

              <div
                className="
                  absolute
                  bottom-8
                  right-8
                "
              >
                <span className="font-display text-3xl tracking-[-0.04em] text-white/90">
                  {year || "—"}
                </span>
              </div>
            </div>

            {/* ==================================================
                LIGNE OBLIQUE
            ================================================== */}

            <motion.div
              style={{
                opacity: diagonalOpacity,
                scaleY: diagonalScale,
                transformOrigin: "top",
              }}
              className="
                pointer-events-none
                absolute
                -left-8
                -top-[8%]
                hidden
                h-[116%]
                w-px
                bg-[#a77b4e]/60
                md:block
              "
            >
              <div
                className="
                  absolute
                  inset-0
                  origin-top
                  -rotate-[10deg]
                  bg-[#a77b4e]/70
                "
              />
            </motion.div>

            <motion.div
              style={{
                opacity: diagonalOpacity,
                scale: diagonalScale,
              }}
              className="
                absolute
                -left-[39px]
                top-[48%]
                hidden
                h-3
                w-3
                rounded-full
                border
                border-[#a77b4e]
                bg-[#e8e4db]
                md:block
              "
            />
          </motion.div>
        </div>

        {/* ========================================================
            LÉGENDE SOUS IMAGE
        ======================================================== */}

        <motion.div
          style={{
            opacity: imageCaptionOpacity,
            y: imageCaptionY,
          }}
          className="
            mt-10
            grid
            gap-6
            border-t
            border-[#1c1c1a]/15
            pt-6
            md:ml-[39%]
            md:grid-cols-[1fr_auto]
            md:items-start
          "
        >
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#a77b4e]">
              Projet {projectNumber}
            </p>

            <p className="mt-3 font-display text-2xl tracking-[-0.035em] text-[#1c1c1a] md:text-3xl">
              {project.subtitle || project.title}
            </p>
          </div>

          <div className="max-w-sm md:text-right">
            <p className="text-xs leading-6 text-[#77736c]">
              {description}
            </p>

            <Link
              href={`/projets/${project.slug}`}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                text-[8px]
                uppercase
                tracking-[0.25em]
                text-[#a77b4e]
                transition-colors
                duration-300
                hover:text-[#1c1c1a]
              "
            >
              Voir le projet

              <ArrowUpRight
                size={12}
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </motion.div>

        {/* ========================================================
            INDICATEUR BAS
        ======================================================== */}

        <motion.div
          style={{
            opacity: bottomOpacity,
          }}
          className="
            mt-20
            flex
            items-center
            justify-center
            gap-4
            md:mt-28
          "
        >
          <motion.span
            style={{
              scaleX: bottomOpacity,
              transformOrigin: "right",
            }}
            className="h-px w-12 bg-[#a77b4e]/40"
          />

          <span className="text-[9px] uppercase tracking-[0.3em] text-[#99958e]">
            Projet suivant
          </span>

          <motion.span
            style={{
              scaleX: bottomOpacity,
              transformOrigin: "left",
            }}
            className="h-px w-12 bg-[#a77b4e]/40"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}