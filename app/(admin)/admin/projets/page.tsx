"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";

import {
  Archive,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Edit3,
  Eye,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { getSupabaseClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

type ProjectStatus =
  | "draft"
  | "published"
  | "archived";

type Project = {
  id: string;
  reference: string | null;
  category_id: string | null;

  title: string;
  slug: string | null;
  subtitle: string | null;
  short_description: string | null;

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

  progress: number | null;

  latitude: number | null;
  longitude: number | null;

  cover_image_url: string | null;
  cover_image_path: string | null;

  status: ProjectStatus;

  featured: boolean;

  display_order: number | null;

  published_at: string | null;

  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  name: string;
};

type Filter =
  | "all"
  | "published"
  | "draft"
  | "archived";

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("fr-FR").format(value);
}

function getStatusLabel(status: ProjectStatus) {
  switch (status) {
    case "published":
      return "Publié";

    case "draft":
      return "Brouillon";

    case "archived":
      return "Archivé";

    default:
      return status;
  }
}

function getStatusClasses(status: ProjectStatus) {
  switch (status) {
    case "published":
      return "border-[#d8e7dc] bg-[#f2f8f3] text-[#4f765b]";

    case "draft":
      return "border-[#e7dfd3] bg-[#faf7f1] text-[#9b7b54]";

    case "archived":
      return "border-[#dededb] bg-[#f5f5f3] text-[#77736c]";

    default:
      return "border-[#e5e2dc] bg-white text-[#77736c]";
  }
}

function getProgressLabel(progress: number | null) {
  if (progress === null || progress === undefined) {
    return "—";
  }

  return `${progress}%`;
}

/* ============================================================
   PAGE
============================================================ */

export default function ProjetsAdminPage() {
  const router = useRouter();

  const supabase = useMemo(
    () => getSupabaseClient(),
    [],
  );

  /* ==========================================================
     STATE
  ========================================================== */

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<Filter>("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title" | "progress"
  >("newest");

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  const loadProjects = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        /* ------------------------------------------------------
           AUTH
        ------------------------------------------------------ */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        /* ------------------------------------------------------
           PROFILE
        ------------------------------------------------------ */

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, role, is_active")
            .eq("id", user.id)
            .maybeSingle();

        if (
          profileError ||
          !profile ||
          !profile.is_active ||
          !["admin", "editor"].includes(profile.role)
        ) {
          router.replace("/login");
          return;
        }

        /* ------------------------------------------------------
           PROJECTS
        ------------------------------------------------------ */

        const {
          data: projectData,
          error: projectError,
        } = await supabase
          .from("projects")
          .select(`
            id,
            reference,
            category_id,
            title,
            slug,
            subtitle,
            short_description,
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
            updated_at
          `)
          .order("created_at", {
            ascending: false,
          });

        if (projectError) {
          throw projectError;
        }

        /* ------------------------------------------------------
           CATEGORIES
        ------------------------------------------------------ */

        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("project_categories")
          .select("id, name")
          .order("name", {
            ascending: true,
          });

        if (categoryError) {
          console.warn(
            "Impossible de charger les catégories:",
            categoryError,
          );
        }

        setProjects(
          (projectData ?? []) as Project[],
        );

        setCategories(
          (categoryData ?? []) as Category[],
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors du chargement des projets.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, supabase],
  );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /* ==========================================================
     CATEGORY MAP
  ========================================================== */

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    categories.forEach((category) => {
      map.set(category.id, category.name);
    });

    return map;
  }, [categories]);

  /* ==========================================================
     FILTERED PROJECTS
  ========================================================== */

  const filteredProjects = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    let result = [...projects];

    /* --------------------------------------------------------
       STATUS
    -------------------------------------------------------- */

    if (filter !== "all") {
      result = result.filter(
        (project) =>
          project.status === filter,
      );
    }

    /* --------------------------------------------------------
       CATEGORY
    -------------------------------------------------------- */

    if (categoryFilter !== "all") {
      result = result.filter(
        (project) =>
          project.category_id === categoryFilter,
      );
    }

    /* --------------------------------------------------------
       SEARCH
    -------------------------------------------------------- */

    if (normalizedSearch) {
      result = result.filter((project) => {
        const category =
          project.category_id
            ? categoryMap.get(
                project.category_id,
              )
            : "";

        const haystack = [
          project.title,
          project.reference,
          project.subtitle,
          project.short_description,
          project.project_type,
          project.client_name,
          project.location,
          project.city,
          project.province,
          project.country,
          category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(
          normalizedSearch,
        );
      });
    }

    /* --------------------------------------------------------
       SORT
    -------------------------------------------------------- */

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "title":
          return a.title.localeCompare(
            b.title,
            "fr",
          );

        case "progress":
          return (
            (b.progress ?? 0) -
            (a.progress ?? 0)
          );

        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [
    categoryFilter,
    categoryMap,
    filter,
    projects,
    search,
    sortBy,
  ]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics = useMemo(() => {
    const total = projects.length;

    const published = projects.filter(
      (project) =>
        project.status === "published",
    ).length;

    const drafts = projects.filter(
      (project) =>
        project.status === "draft",
    ).length;

    const archived = projects.filter(
      (project) =>
        project.status === "archived",
    ).length;

    const featured = projects.filter(
      (project) => project.featured,
    ).length;

    const averageProgress =
      total > 0
        ? Math.round(
            projects.reduce(
              (sum, project) =>
                sum + (project.progress ?? 0),
              0,
            ) / total,
          )
        : 0;

    return {
      total,
      published,
      drafts,
      archived,
      featured,
      averageProgress,
    };
  }, [projects]);

  /* ==========================================================
     DELETE
  ========================================================== */

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      setDeleting(true);

      setError(null);

      /* ------------------------------------------------------
         DELETE GALLERY STORAGE FILES
      ------------------------------------------------------ */

      const {
        data: gallery,
      } = await supabase
        .from("project_gallery")
        .select("storage_path")
        .eq(
          "project_id",
          selectedProject.id,
        );

      const galleryPaths =
        (gallery ?? [])
          .map(
            (item: { storage_path: string }) =>
              item.storage_path,
          )
          .filter(
            (
              path: string | null,
            ): path is string =>
              Boolean(path),
          );

      if (galleryPaths.length > 0) {
        await supabase.storage
          .from("project-images")
          .remove(galleryPaths);
      }

      /* ------------------------------------------------------
         DELETE COVER
      ------------------------------------------------------ */

      if (
        selectedProject.cover_image_path
      ) {
        await supabase.storage
          .from("project-images")
          .remove([
            selectedProject.cover_image_path,
          ]);
      }

      /* ------------------------------------------------------
         DELETE PROJECT
      ------------------------------------------------------ */

      const {
        error: deleteError,
      } = await supabase
        .from("projects")
        .delete()
        .eq(
          "id",
          selectedProject.id,
        );

      if (deleteError) {
        throw deleteError;
      }

      /* ------------------------------------------------------
         ACTIVITY LOG
      ------------------------------------------------------ */

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("activity_logs")
          .insert({
            user_id: user.id,
            action: "deleted",
            entity_type: "project",
            entity_id:
              selectedProject.id,
            title: `Projet supprimé : ${selectedProject.title}`,
            description:
              `Suppression du projet ${selectedProject.reference ?? ""}`,
            metadata: {
              reference:
                selectedProject.reference,
              title:
                selectedProject.title,
            },
          });
      }

      setProjects((current) =>
        current.filter(
          (project) =>
            project.id !==
            selectedProject.id,
        ),
      );

      setSelectedProject(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le projet.",
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f7f4]">
        <div className="px-6 py-12 lg:px-12">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2
                size={22}
                strokeWidth={1.4}
                className="animate-spin text-[#9b7b54]"
              />

              <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-[#8b8881]">
                Chargement des projets
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292824]">
      <div className="px-6 py-10 lg:px-12 lg:py-12">
        {/* ======================================================
           HEADER
        ====================================================== */}

        <motion.header
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="flex flex-col gap-8 border-b border-[#e4e1db] pb-8 xl:flex-row xl:items-end xl:justify-between"
        >
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
              Administration
            </p>

            <div className="mt-4 flex items-center gap-4">
              <h1 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl">
                Projets
              </h1>

              <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-[#dedbd4] bg-white px-2 text-[10px] text-[#77736c]">
                {statistics.total}
              </span>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#77736c]">
              Gestion des projets architecturaux
              du studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                loadProjects(true)
              }
              disabled={refreshing}
              className="inline-flex h-11 items-center gap-2 border border-[#dedbd4] bg-white px-4 text-[10px] uppercase tracking-[0.18em] text-[#5f5c56] transition hover:border-[#c9c4bb] hover:bg-[#fcfbf9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                strokeWidth={1.5}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Actualiser
            </button>

            <Link
              href="/admin/projets/nouveau"
              className="inline-flex h-11 items-center gap-2 bg-[#292824] px-5 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-[#3b3934]"
            >
              <Plus
                size={15}
                strokeWidth={1.5}
              />

              Nouveau projet
            </Link>
          </div>
        </motion.header>

        {/* ======================================================
           ERROR
        ====================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="mt-6 overflow-hidden"
            >
              <div className="flex items-start gap-3 border border-[#ead8d3] bg-[#fff8f6] px-5 py-4">
                <CircleAlert
                  size={17}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[#a56759]"
                />

                <div className="flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8f594d]">
                    Erreur
                  </p>

                  <p className="mt-1 text-sm text-[#76564f]">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError(null)
                  }
                  className="text-[#9b827c] transition hover:text-[#5e4944]"
                >
                  <X
                    size={16}
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================
           STATISTICS
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.08,
          }}
          className="mt-8 grid grid-cols-2 border border-[#e4e1db] bg-white sm:grid-cols-3 xl:grid-cols-6"
        >
          <Stat
            label="Total"
            value={statistics.total}
            icon={
              <FolderOpen
                size={16}
                strokeWidth={1.4}
              />
            }
          />

          <Stat
            label="Publiés"
            value={statistics.published}
            icon={
              <Check
                size={16}
                strokeWidth={1.4}
              />
            }
          />

          <Stat
            label="Brouillons"
            value={statistics.drafts}
            icon={
              <FileText
                size={16}
                strokeWidth={1.4}
              />
            }
          />

          <Stat
            label="Archivés"
            value={statistics.archived}
            icon={
              <Archive
                size={16}
                strokeWidth={1.4}
              />
            }
          />

          <Stat
            label="À la une"
            value={statistics.featured}
            icon={
              <Star
                size={16}
                strokeWidth={1.4}
              />
            }
          />

          <Stat
            label="Avancement moyen"
            value={`${statistics.averageProgress}%`}
            icon={
              <ArrowUpRight
                size={16}
                strokeWidth={1.4}
              />
            }
          />
        </motion.section>

        {/* ======================================================
           TOOLBAR
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.14,
          }}
          className="mt-8"
        >
          <div className="flex flex-col gap-3 xl:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={16}
                strokeWidth={1.4}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9891]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Rechercher un projet, une référence, une ville..."
                className="h-12 w-full border border-[#dedbd4] bg-white pl-11 pr-10 text-sm text-[#34322e] outline-none transition placeholder:text-[#aaa69e] focus:border-[#b9a68e]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9891] transition hover:text-[#44413c]"
                >
                  <X
                    size={15}
                    strokeWidth={1.5}
                  />
                </button>
              )}
            </div>

            {/* STATUS FILTERS */}

            <div className="flex overflow-x-auto border border-[#dedbd4] bg-white">
              <FilterButton
                active={filter === "all"}
                onClick={() =>
                  setFilter("all")
                }
                label="Tous"
                count={statistics.total}
              />

              <FilterButton
                active={
                  filter === "published"
                }
                onClick={() =>
                  setFilter("published")
                }
                label="Publiés"
                count={statistics.published}
              />

              <FilterButton
                active={
                  filter === "draft"
                }
                onClick={() =>
                  setFilter("draft")
                }
                label="Brouillons"
                count={statistics.drafts}
              />

              <FilterButton
                active={
                  filter === "archived"
                }
                onClick={() =>
                  setFilter("archived")
                }
                label="Archivés"
                count={statistics.archived}
              />
            </div>
          </div>

          {/* ADVANCED FILTERS */}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (value) => !value,
                )
              }
              className="inline-flex h-10 items-center gap-2 border border-[#dedbd4] bg-white px-4 text-[10px] uppercase tracking-[0.17em] text-[#77736c] transition hover:border-[#c8c3ba]"
            >
              <ChevronDown
                size={14}
                strokeWidth={1.4}
                className={
                  showFilters
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
              />

              Filtres avancés
            </button>

            <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a9790]">
              {filteredProjects.length}{" "}
              résultat
              {filteredProjects.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid gap-3 border border-[#dedbd4] bg-white p-4 md:grid-cols-2">
                  {/* CATEGORY */}

                  <label className="block">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-[#96928b]">
                      Catégorie
                    </span>

                    <div className="relative">
                      <select
                        value={
                          categoryFilter
                        }
                        onChange={(event) =>
                          setCategoryFilter(
                            event.target.value,
                          )
                        }
                        className="h-11 w-full appearance-none border border-[#e4e1db] bg-[#faf9f7] px-3 pr-9 text-sm text-[#45423d] outline-none focus:border-[#b9a68e]"
                      >
                        <option value="all">
                          Toutes les catégories
                        </option>

                        {categories.map(
                          (category) => (
                            <option
                              key={
                                category.id
                              }
                              value={
                                category.id
                              }
                            >
                              {category.name}
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown
                        size={14}
                        strokeWidth={1.4}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#96928b]"
                      />
                    </div>
                  </label>

                  {/* SORT */}

                  <label className="block">
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-[#96928b]">
                      Trier par
                    </span>

                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(event) =>
                          setSortBy(
                            event.target
                              .value as typeof sortBy,
                          )
                        }
                        className="h-11 w-full appearance-none border border-[#e4e1db] bg-[#faf9f7] px-3 pr-9 text-sm text-[#45423d] outline-none focus:border-[#b9a68e]"
                      >
                        <option value="newest">
                          Plus récents
                        </option>

                        <option value="oldest">
                          Plus anciens
                        </option>

                        <option value="title">
                          Nom du projet
                        </option>

                        <option value="progress">
                          Avancement
                        </option>
                      </select>

                      <ChevronDown
                        size={14}
                        strokeWidth={1.4}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#96928b]"
                      />
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ======================================================
           PROJECT LIST
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          className="mt-6"
        >
          {filteredProjects.length ===
          0 ? (
            <EmptyState
              search={search}
              filter={filter}
              onReset={() => {
                setSearch("");
                setFilter("all");
                setCategoryFilter(
                  "all",
                );
              }}
            />
          ) : (
            <div className="overflow-hidden border border-[#e4e1db] bg-white">
              {/* DESKTOP HEADER */}

              <div className="hidden border-b border-[#e4e1db] bg-[#faf9f7] px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-[#99958e] lg:grid lg:grid-cols-[minmax(280px,1.8fr)_140px_160px_150px_90px_48px] lg:items-center lg:gap-5">
                <span>Projet</span>
                <span>Catégorie</span>
                <span>Localisation</span>
                <span>Avancement</span>
                <span>Statut</span>
                <span />
              </div>

              <div>
                {filteredProjects.map(
                  (project, index) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      category ={
                        project.category_id
                          ? categoryMap.get(
                              project.category_id,
                            )
                          : null
                      }
                      index={index}
                      onDelete={() =>
                        setSelectedProject(
                          project,
                        )
                      }
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </motion.section>
      </div>

      {/* ========================================================
         DELETE MODAL
      ======================================================== */}

      <AnimatePresence>
        {selectedProject && (
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#292824]/30 px-5 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedProject(null);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              className="w-full max-w-md border border-[#dfdcd6] bg-white p-7 shadow-[0_25px_70px_rgba(40,38,34,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center border border-[#ead8d3] bg-[#fff8f6] text-[#a56759]">
                  <Trash2
                    size={19}
                    strokeWidth={1.4}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedProject(
                      null,
                    )
                  }
                  className="text-[#99958e] transition hover:text-[#393732]"
                >
                  <X
                    size={18}
                    strokeWidth={1.4}
                  />
                </button>
              </div>

              <p className="mt-7 text-[9px] uppercase tracking-[0.25em] text-[#9b7b54]">
                Suppression
              </p>

              <h2 className="mt-3 text-2xl font-light tracking-[-0.03em]">
                Supprimer ce projet ?
              </h2>

              <p className="mt-4 text-sm leading-6 text-[#77736c]">
                Le projet{" "}
                <span className="font-medium text-[#45423d]">
                  {selectedProject.title}
                </span>{" "}
                ainsi que sa galerie seront
                définitivement supprimés.
              </p>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedProject(
                      null,
                    )
                  }
                  disabled={deleting}
                  className="h-11 flex-1 border border-[#dedbd4] bg-white text-[10px] uppercase tracking-[0.17em] text-[#66625b] transition hover:bg-[#faf9f7] disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 bg-[#8d574d] text-[10px] uppercase tracking-[0.17em] text-white transition hover:bg-[#78483f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={14}
                        strokeWidth={1.5}
                        className="animate-spin"
                      />

                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={14}
                        strokeWidth={1.5}
                      />

                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ============================================================
   STAT COMPONENT
============================================================ */

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#e4e1db] px-5 py-5 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.18em] text-[#99958e]">
          {label}
        </span>

        <span className="text-[#b09a7c]">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-light tracking-[-0.03em] text-[#35332f]">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 shrink-0 items-center gap-2 border-r border-[#e4e1db] px-4 text-[10px] uppercase tracking-[0.15em] transition last:border-r-0 ${
        active
          ? "bg-[#292824] text-white"
          : "bg-white text-[#77736c] hover:bg-[#faf9f7]"
      }`}
    >
      {label}

      <span
        className={`text-[9px] ${
          active
            ? "text-[#d9d4cb]"
            : "text-[#aaa69f]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ============================================================
   PROJECT ROW
============================================================ */

function ProjectRow({
  project,
  category,
  index,
  onDelete,
}: {
  project: Project;
  category: string | null;
  index: number;
  onDelete: () => void;
}) {
  const progress = Math.min(
    100,
    Math.max(
      0,
      project.progress ?? 0,
    ),
  );

  return (
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
        duration: 0.35,
        delay: Math.min(
          index * 0.025,
          0.2,
        ),
      }}
      className="group border-b border-[#e8e5df] last:border-b-0"
    >
      {/* ======================================================
         DESKTOP
      ====================================================== */}

      <div className="hidden px-5 py-4 lg:grid lg:grid-cols-[minmax(280px,1.8fr)_140px_160px_150px_90px_48px] lg:items-center lg:gap-5">
        {/* PROJECT */}

        <div className="flex min-w-0 items-center gap-4">
          <ProjectThumbnail
            project={project}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[13px] font-medium text-[#35332f]">
                {project.title}
              </p>

              {project.featured && (
                <Star
                  size={12}
                  fill="currentColor"
                  strokeWidth={1.2}
                  className="shrink-0 text-[#9b7b54]"
                />
              )}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.16em] text-[#a09c95]">
                {project.reference ??
                  "Sans référence"}
              </span>

              {project.year && (
                <>
                  <span className="text-[#d0ccc5]">
                    /
                  </span>

                  <span className="text-[10px] text-[#96928b]">
                    {project.year}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY */}

        <div>
          <p className="text-xs text-[#5f5c56]">
            {category ?? "—"}
          </p>

          {project.project_type && (
            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#aaa69f]">
              {project.project_type}
            </p>
          )}
        </div>

        {/* LOCATION */}

        <div className="min-w-0">
          <p className="truncate text-xs text-[#5f5c56]">
            {project.city ??
              project.location ??
              "—"}
          </p>

          {project.province && (
            <p className="mt-1 truncate text-[10px] text-[#aaa69f]">
              {project.province}
            </p>
          )}
        </div>

        {/* PROGRESS */}

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#77736c]">
              {getProgressLabel(
                project.progress,
              )}
            </span>
          </div>

          <div className="mt-2 h-[3px] w-full bg-[#ece9e3]">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.7,
                delay:
                  0.1 +
                  index * 0.025,
              }}
              className="h-full bg-[#9b7b54]"
            />
          </div>
        </div>

        {/* STATUS */}

        <div>
          <span
            className={`inline-flex border px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] ${getStatusClasses(
              project.status,
            )}`}
          >
            {getStatusLabel(
              project.status,
            )}
          </span>
        </div>

        {/* ACTIONS */}

        <ProjectActions
          project={project}
          onDelete={onDelete}
        />
      </div>

      {/* ======================================================
         MOBILE / TABLET
      ====================================================== */}

      <div className="p-4 lg:hidden">
        <div className="flex gap-4">
          <ProjectThumbnail
            project={project}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-[#35332f]">
                    {project.title}
                  </p>

                  {project.featured && (
                    <Star
                      size={12}
                      fill="currentColor"
                      strokeWidth={1.2}
                      className="shrink-0 text-[#9b7b54]"
                    />
                  )}
                </div>

                <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#a09c95]">
                  {project.reference ??
                    "Sans référence"}
                </p>
              </div>

              <ProjectActions
                project={project}
                onDelete={onDelete}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] uppercase tracking-[0.17em] text-[#aaa69f]">
                  Catégorie
                </p>

                <p className="mt-1 text-xs text-[#5f5c56]">
                  {category ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-[8px] uppercase tracking-[0.17em] text-[#aaa69f]">
                  Localisation
                </p>

                <p className="mt-1 truncate text-xs text-[#5f5c56]">
                  {project.city ??
                    project.location ??
                    "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.13em] text-[#aaa69f]">
                    Avancement
                  </span>

                  <span className="text-[10px] text-[#77736c]">
                    {getProgressLabel(
                      project.progress,
                    )}
                  </span>
                </div>

                <div className="mt-2 h-[3px] bg-[#ece9e3]">
                  <div
                    className="h-full bg-[#9b7b54]"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              <span
                className={`shrink-0 border px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] ${getStatusClasses(
                  project.status,
                )}`}
              >
                {getStatusLabel(
                  project.status,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   PROJECT THUMBNAIL
============================================================ */

function ProjectThumbnail({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="relative h-[66px] w-[86px] shrink-0 overflow-hidden bg-[#eeece7]">
      {project.cover_image_url ? (
        <img
          src={project.cover_image_url}
          alt={project.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon
            size={18}
            strokeWidth={1.2}
            className="text-[#aaa69f]"
          />
        </div>
      )}

      {project.featured && (
        <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center bg-white/90 text-[#9b7b54]">
          <Star
            size={10}
            fill="currentColor"
            strokeWidth={1}
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PROJECT ACTIONS
============================================================ */

function ProjectActions({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/projets/${project.id}`}
        title="Voir"
        className="flex h-8 w-8 items-center justify-center text-[#929089] transition hover:bg-[#f5f3ef] hover:text-[#4a4741]"
      >
        <Eye
          size={15}
          strokeWidth={1.35}
        />
      </Link>

      <Link
        href={`/admin/projets/${project.id}/modifier`}
        title="Modifier"
        className="flex h-8 w-8 items-center justify-center text-[#929089] transition hover:bg-[#f5f3ef] hover:text-[#4a4741]"
      >
        <Edit3
          size={14}
          strokeWidth={1.35}
        />
      </Link>

      <button
        type="button"
        onClick={onDelete}
        title="Supprimer"
        className="flex h-8 w-8 items-center justify-center text-[#a18b84] transition hover:bg-[#fff5f2] hover:text-[#8d574d]"
      >
        <Trash2
          size={14}
          strokeWidth={1.35}
        />
      </button>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  search,
  filter,
  onReset,
}: {
  search: string;
  filter: Filter;
  onReset: () => void;
}) {
  const hasFilters =
    Boolean(search) ||
    filter !== "all";

  return (
    <div className="border border-[#e4e1db] bg-white px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#e3dfd8] bg-[#faf9f7]">
        <FolderOpen
          size={22}
          strokeWidth={1.2}
          className="text-[#aaa69f]"
        />
      </div>

      <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-[#9b7b54]">
        Aucun résultat
      </p>

      <h2 className="mt-3 text-2xl font-light tracking-[-0.03em]">
        {hasFilters
          ? "Aucun projet ne correspond"
          : "Aucun projet"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#85817a]">
        {hasFilters
          ? "Modifiez vos critères de recherche ou réinitialisez les filtres pour afficher les projets disponibles."
          : "Commencez par créer le premier projet architectural du studio."}
      </p>

      <div className="mt-7 flex justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center gap-2 border border-[#dedbd4] bg-white px-5 text-[10px] uppercase tracking-[0.17em] text-[#66625b] transition hover:bg-[#faf9f7]"
          >
            <RefreshCw
              size={14}
              strokeWidth={1.4}
            />

            Réinitialiser
          </button>
        )}

        {!hasFilters && (
          <Link
            href="/admin/projets/nouveau"
            className="inline-flex h-11 items-center gap-2 bg-[#292824] px-5 text-[10px] uppercase tracking-[0.17em] text-white transition hover:bg-[#3b3934]"
          >
            <Plus
              size={14}
              strokeWidth={1.4}
            />

            Créer un projet
          </Link>
        )}
      </div>
    </div>
  );
}