"use client";

import Image from "next/image";

import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useEffect, useMemo, useState } from "react";

import SectionLabel from "../../ui/SectionLabel";

/* ============================================================
   TYPES
============================================================ */

interface ExpertiseGalleryImage {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string | null;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  image_type: string | null;
  width: number | null;
  height: number | null;
  display_order: number;
  is_visible: boolean;
}

interface ExpertiseProject {
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
  surface_area: number | null;
  surface_unit: string | null;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  display_order: number;
}

interface ExpertiseGalleryGroup {
  project: ExpertiseProject;
  images: ExpertiseGalleryImage[];
}

interface ExpertiseSectionProps {
  progress: MotionValue<number>;
  gallery: ExpertiseGalleryGroup[];
}

/* ============================================================
   HELPERS
============================================================ */

function getProjectCategory(
  project: ExpertiseProject,
): string {
  return (
    project.project_type ||
    "Architecture & design"
  );
}

function getProjectDescription(
  project: ExpertiseProject,
): string {
  return (
    project.short_description ||
    project.description ||
    "Un projet pensé autour des usages, des proportions, de la lumière et de l'identité architecturale."
  );
}

function getProjectLocation(
  project: ExpertiseProject,
): string | null {
  const parts = [
    project.city,
    project.province,
    project.country,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return project.location || null;
}

function getProjectImage(
  project: ExpertiseProject,
  images: ExpertiseGalleryImage[],
): string | null {
  const galleryImage = images
    .filter(
      (image) =>
        image.is_visible &&
        Boolean(image.image_url),
    )
    .sort(
      (a, b) =>
        a.display_order -
        b.display_order,
    )[0];

  return (
    galleryImage?.image_url ||
    project.cover_image_url ||
    null
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ExpertiseSection({
  progress,
  gallery,
}: ExpertiseSectionProps) {
  /* ==========================================================
     GALLERY GROUPS
  ========================================================== */

  const projectGroups = useMemo(() => {
  return gallery
    .map((group) => ({
      project: group.project,
      images: [...group.images]
        .filter(
          (image) =>
            image.is_visible &&
            Boolean(image.image_url),
        )
        .sort(
          (a, b) =>
            a.display_order -
            b.display_order,
        ),
    }))
    .filter(
      (group) =>
        group.images.length > 0 ||
        Boolean(group.project.cover_image_url),
    );
}, [gallery]);

  /* ==========================================================
     STATE
  ========================================================== */

  const [selectedItem, setSelectedItem] =
    useState<ExpertiseGalleryGroup | null>(
      null,
    );

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [isImageLoaded, setIsImageLoaded] =
    useState(false);

  /* ==========================================================
     SECTION PARALLAX
  ========================================================== */

  const y = useTransform(
    progress,
    [0.55, 0.85],
    [80, -40],
  );

  /* ==========================================================
     MOUSE PARALLAX
  ========================================================== */

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 80,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 80,
    damping: 20,
  });

  const imageX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-12, 12],
  );

  const imageY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [-8, 8],
  );

  /* ==========================================================
     BODY SCROLL
  ========================================================== */

  useEffect(() => {
    document.body.style.overflow =
      selectedItem ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  /* ==========================================================
     CLOSE GALLERY
  ========================================================== */

  const closeGallery = () => {
    setSelectedItem(null);
    setSelectedImage(0);
    setIsImageLoaded(false);
  };

  /* ==========================================================
     NEXT IMAGE
  ========================================================== */

  const nextImage = () => {
    if (!selectedItem) return;

    const images = selectedItem.images;

    if (images.length === 0) return;

    setIsImageLoaded(false);

    setSelectedImage((current) =>
      current >= images.length - 1
        ? 0
        : current + 1,
    );
  };

  /* ==========================================================
     PREVIOUS IMAGE
  ========================================================== */

  const previousImage = () => {
    if (!selectedItem) return;

    const images = selectedItem.images;

    if (images.length === 0) return;

    setIsImageLoaded(false);

    setSelectedImage((current) =>
      current <= 0
        ? images.length - 1
        : current - 1,
    );
  };

  /* ==========================================================
     KEYBOARD
  ========================================================== */

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyboard = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, [selectedItem]);

  /* ==========================================================
     OPEN GALLERY
  ========================================================== */

  const openGallery = (
    item: ExpertiseGalleryGroup,
  ) => {
    if (item.images.length === 0) return;

    setSelectedItem(item);
    setSelectedImage(0);
    setIsImageLoaded(false);
  };

  /* ==========================================================
     MOUSE PARALLAX
  ========================================================== */

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
        rect.width -
      0.5;

    const mouseYPosition =
      (event.clientY - rect.top) /
        rect.height -
      0.5;

    mouseX.set(x);
    mouseY.set(mouseYPosition);
  };

  const resetMouse = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* =====================================================
          EXPERTISE
      ===================================================== */}

      <section className="relative min-h-screen overflow-hidden bg-white px-6 py-32 md:px-10">
        <div className="mx-auto max-w-7xl">

          {/* LABEL */}

          <SectionLabel
            number="05"
            label="Expertise"
          />

          {/* INTRO */}

          <div className="mt-10 flex flex-col justify-between gap-10 md:flex-row md:items-end">

            <motion.h2
              initial={{
                opacity: 0,
                y: 40,
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
                duration: 0.9,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="max-w-3xl font-display text-5xl leading-[0.9] tracking-[-0.05em] md:text-8xl"
            >
              Une vision
              <br />
              <span className="text-[#a77b4e]">
                globale.
              </span>
            </motion.h2>

            <motion.p
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
                delay: 0.15,
                duration: 0.8,
              }}
              className="max-w-sm text-sm leading-7 text-[#77736c]"
            >
              De l'architecture à
              l'aménagement intérieur,
              chaque détail participe à la
              cohérence du projet.
            </motion.p>
          </div>

          {/* =================================================
              PROJECT CARDS
          ================================================= */}

          <motion.div
            style={{ y }}
            className="mt-20 grid gap-6 md:grid-cols-3"
          >
            {projectGroups.map(
              (item, index) => {
                const projectImage =
                  getProjectImage(
                    item.project,
                    item.images,
                  );

                const location =
                  getProjectLocation(
                    item.project,
                  );

                return (
                  <motion.article
                    key={item.project.id}
                    initial={{
                      opacity: 0,
                      y: 80,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.15,
                    }}
                    transition={{
                      delay:
                        index * 0.12,
                      duration: 0.9,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    onClick={() =>
                      openGallery(item)
                    }
                    className="group cursor-pointer"
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e6df]">

                      {projectImage ? (
                        <Image
                          src={projectImage}
                          alt={
                            item.project
                              .title
                          }
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] uppercase tracking-[0.3em] text-[#77736c]">
                            Image indisponible
                          </span>
                        </div>
                      )}

                      {/* GRADIENT */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 opacity-70 transition duration-700 group-hover:opacity-100" />

                      {/* NUMBER */}

                      <div className="absolute left-5 top-5">
                        <span className="text-[9px] tracking-[0.35em] text-white">
                          {String(
                            index + 1,
                          ).padStart(2, "0")}
                        </span>
                      </div>

                      {/* YEAR */}

                      {item.project.year && (
                        <div className="absolute right-5 top-5">
                          <span className="rounded-full border border-white/20 bg-black/10 px-3 py-1 text-[8px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-md">
                            {
                              item
                                .project
                                .year
                            }
                          </span>
                        </div>
                      )}

                      {/* TITLE */}

                      <div className="absolute bottom-6 left-6 right-6">

                        <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-white/60">
                          {getProjectCategory(
                            item.project,
                          )}
                        </p>

                        <h3 className="font-display text-3xl text-white md:text-4xl">
                          {
                            item
                              .project
                              .title
                          }
                        </h3>

                        {location && (
                          <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-white/45">
                            {location}
                          </p>
                        )}
                      </div>

                      {/* ARROW */}

                      <motion.div
                        initial={{
                          scale: 0,
                          opacity: 0,
                        }}
                        whileHover={{
                          scale: 1,
                          opacity: 1,
                        }}
                        className="absolute right-5 top-16 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md"
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </motion.div>

                      {/* BOTTOM LINE */}

                      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#a77b4e] transition-all duration-700 group-hover:w-full" />
                    </div>

                    {/* CARD FOOTER */}

                    <div className="flex items-center justify-between border-b border-[#1c1c1a]/10 py-5">

                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[#77736c]">
                          Explorer
                        </p>

                        {item.project
                          .reference && (
                          <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#77736c]/60">
                            {
                              item
                                .project
                                .reference
                            }
                          </p>
                        )}
                      </div>

                      <span className="text-xs text-[#a77b4e]">
                        {String(
                          item.images
                            .length,
                        ).padStart(2, "0")}{" "}
                        images
                      </span>
                    </div>
                  </motion.article>
                );
              },
            )}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FULLSCREEN GALLERY
      ===================================================== */}

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.55,
              ease: "easeInOut",
            }}
            className="fixed inset-0 z-[200] overflow-hidden bg-[#11110f]"
          >

            {/* GRAIN */}

            <div
              className="pointer-events-none absolute inset-0 z-50 opacity-[0.035]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
              }}
            />

            {/* TOP BAR */}

            <motion.header
              initial={{
                y: -40,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                delay: 0.25,
                duration: 0.7,
              }}
              className="absolute left-0 right-0 top-0 z-40 flex items-start justify-between px-6 py-6 md:px-10 md:py-8"
            >
              <div>

                <div className="flex items-center gap-4">

                  <span className="text-[9px] tracking-[0.35em] text-[#a77b4e]">
                    {
                      selectedItem
                        .project
                        .reference ||
                      String(
                        projectGroups.findIndex(
                          (group) =>
                            group.project
                              .id ===
                            selectedItem
                              .project
                              .id,
                        ) + 1,
                      ).padStart(2, "0")
                    }
                  </span>

                  <span className="h-px w-8 bg-white/20" />

                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                    {getProjectCategory(
                      selectedItem.project,
                    )}
                  </span>
                </div>

                <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-white md:text-5xl">
                  {
                    selectedItem.project
                      .title
                  }
                </h2>
              </div>

              {/* CLOSE */}

              <button
                onClick={closeGallery}
                aria-label="Fermer"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md transition duration-500 hover:border-[#a77b4e]/70 hover:bg-white/[0.08]"
              >
                <span className="relative block h-5 w-5">

                  <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white transition group-hover:bg-[#a77b4e]" />

                  <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white transition group-hover:bg-[#a77b4e]" />

                </span>
              </button>
            </motion.header>

            {/* DESCRIPTION */}

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
                delay: 0.4,
                duration: 0.8,
              }}
              className="absolute left-6 top-40 z-30 max-w-xs md:left-10 md:top-44"
            >
              <p className="text-sm leading-7 text-white/45">
                {getProjectDescription(
                  selectedItem.project,
                )}
              </p>

              {getProjectLocation(
                selectedItem.project,
              ) && (
                <p className="mt-4 text-[9px] uppercase tracking-[0.25em] text-[#a77b4e]">
                  {getProjectLocation(
                    selectedItem.project,
                  )}
                </p>
              )}
            </motion.div>

            {/* IMAGE AREA */}

            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMouse}
              className="absolute inset-0 flex items-center justify-center px-5 pb-32 pt-32 md:px-24"
            >

              {/* IMAGE FRAME */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.88,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.15,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
                className="relative h-[62vh] w-full max-w-6xl md:h-[70vh]"
              >

                {/* SHADOW */}

                <div className="absolute inset-10 bg-black/50 blur-3xl" />

                {/* IMAGE */}

                <motion.div
                  style={{
                    x: imageX,
                    y: imageY,
                  }}
                  className="relative h-full w-full overflow-hidden"
                >

                  <AnimatePresence
                    mode="wait"
                  >
                    {selectedItem.images[
                      selectedImage
                    ] && (
                      <motion.div
                        key={
                          selectedItem
                            .images[
                            selectedImage
                          ].id
                        }
                        initial={{
                          opacity: 0,
                          scale: 1.08,
                        }}
                        animate={{
                          opacity:
                            isImageLoaded
                              ? 1
                              : 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.98,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: [
                            0.22,
                            1,
                            0.36,
                            1,
                          ],
                        }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={
                            selectedItem
                              .images[
                              selectedImage
                            ].image_url
                          }
                          alt={
                            selectedItem
                              .images[
                              selectedImage
                            ].alt_text ||
                            selectedItem
                              .images[
                              selectedImage
                            ].title ||
                            selectedItem
                              .project
                              .title
                          }
                          fill
                          priority
                          sizes="90vw"
                          onLoad={() =>
                            setIsImageLoaded(
                              true,
                            )
                          }
                          className="object-contain"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* FRAME */}

                <div className="pointer-events-none absolute inset-0 border border-white/[0.08]" />
              </motion.div>

              {/* PREVIOUS */}

              <button
                onClick={previousImage}
                aria-label="Image précédente"
                className="group absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 md:flex"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/10 backdrop-blur-md transition duration-500 group-hover:border-[#a77b4e]/70 group-hover:bg-white/[0.08]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.2"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </span>
              </button>

              {/* NEXT */}

              <button
                onClick={nextImage}
                aria-label="Image suivante"
                className="group absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 md:flex"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/10 backdrop-blur-md transition duration-500 group-hover:border-[#a77b4e]/70 group-hover:bg-white/[0.08]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>

            {/* =================================================
                BOTTOM
            ================================================= */}

            <motion.footer
              initial={{
                y: 60,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
                duration: 0.8,
              }}
              className="absolute bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#11110f]/70 px-6 py-5 backdrop-blur-xl md:px-10"
            >
              <div className="flex items-center justify-between gap-8">

                {/* THUMBNAILS */}

                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-none">

                  {selectedItem.images.map(
                    (image, index) => (
                      <motion.button
                        key={image.id}
                        whileHover={{
                          y: -4,
                        }}
                        onClick={() => {
                          setIsImageLoaded(
                            false,
                          );

                          setSelectedImage(
                            index,
                          );
                        }}
                        aria-label={`Afficher l'image ${
                          index + 1
                        }`}
                        className={`group relative h-12 w-16 flex-shrink-0 overflow-hidden md:h-14 md:w-20 ${
                          selectedImage ===
                          index
                            ? "ring-1 ring-[#a77b4e]"
                            : ""
                        }`}
                      >
                        <Image
                          src={
                            image.image_url
                          }
                          alt={
                            image.alt_text ||
                            image.title ||
                            selectedItem
                              .project
                              .title
                          }
                          fill
                          sizes="80px"
                          className={`object-cover transition duration-500 ${
                            selectedImage ===
                            index
                              ? "scale-110"
                              : "opacity-40 grayscale group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0"
                          }`}
                        />

                        {selectedImage ===
                          index && (
                          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#a77b4e]" />
                        )}
                      </motion.button>
                    ),
                  )}
                </div>

                {/* COUNTER */}

                <div className="flex items-center gap-3">

                  <motion.span
                    key={selectedImage}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="font-display text-xl text-white"
                  >
                    {String(
                      selectedImage + 1,
                    ).padStart(2, "0")}
                  </motion.span>

                  <span className="text-xs text-white/20">
                    /
                  </span>

                  <span className="text-xs text-white/40">
                    {String(
                      selectedItem.images
                        .length,
                    ).padStart(2, "0")}
                  </span>

                </div>
              </div>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
