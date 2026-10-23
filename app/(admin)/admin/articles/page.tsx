"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Archive,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { getSupabaseClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

type ArticleStatus = "draft" | "published" | "archived";

type Article = {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  cover_image_path: string | null;
  category: string | null;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  display_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const STATUS_CLASSES: Record<ArticleStatus, string> = {
  draft: "border-neutral-200 bg-neutral-100 text-neutral-600",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-amber-200 bg-amber-50 text-amber-700",
};

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getExcerpt(article: Article) {
  if (article.excerpt?.trim()) {
    return article.excerpt.trim();
  }

  const content =
    article.content?.replace(/<[^>]*>/g, "").trim() || "";

  if (!content) {
    return "Aucun extrait disponible.";
  }

  return content.length > 150
    ? `${content.slice(0, 150)}…`
    : content;
}

/* ============================================================
   PAGE
============================================================ */

export default function ArticlesAdminPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [articles, setArticles] = useState<Article[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | ArticleStatus
  >("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [sortAscending, setSortAscending] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Article | null>(null);

  const [deleting, setDeleting] = useState(false);

  /* ==========================================================
     AUTHORIZATION
  ========================================================== */

  const checkAccess = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return null;
    }

    const { data: profile, error: profileError } = await supabase
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
      return null;
    }

    return user;
  }, [router, supabase]);

  /* ==========================================================
     LOAD ARTICLES
  ========================================================== */

  const loadArticles = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const user = await checkAccess();

        if (!user) {
          return;
        }

        const { data, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .order("display_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: false,
          });

        if (articlesError) {
          throw articlesError;
        }

        setArticles((data || []) as Article[]);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les articles.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [checkAccess, supabase],
  );

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  /* ==========================================================
     CATEGORIES
  ========================================================== */

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        articles
          .map((article) => article.category?.trim())
          .filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b, "fr"));
  }, [articles]);

  /* ==========================================================
     STATS
  ========================================================== */

  const stats = useMemo(() => {
    return {
      total: articles.length,

      published: articles.filter(
        (article) => article.status === "published",
      ).length,

      drafts: articles.filter(
        (article) => article.status === "draft",
      ).length,

      archived: articles.filter(
        (article) => article.status === "archived",
      ).length,

      featured: articles.filter(
        (article) => article.featured,
      ).length,
    };
  }, [articles]);

  /* ==========================================================
     FILTERING
  ========================================================== */

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = articles.filter((article) => {
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.category?.toLowerCase().includes(query) ||
        article.tags?.some((tag) =>
          tag.toLowerCase().includes(query),
        );

      const matchesStatus =
        statusFilter === "all" ||
        article.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        article.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

    return [...result].sort((a, b) => {
      const first = new Date(a.created_at).getTime();
      const second = new Date(b.created_at).getTime();

      return sortAscending
        ? first - second
        : second - first;
    });
  }, [
    articles,
    search,
    statusFilter,
    categoryFilter,
    sortAscending,
  ]);

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const {
        data: currentUser,
      } = await supabase.auth.getUser();

      if (!currentUser.user) {
        router.replace("/login");
        return;
      }

      /*
       * Supprimer d'abord l'image associée
       * si elle existe dans Storage.
       */
      if (deleteTarget.cover_image_path) {
        const { error: storageError } = await supabase.storage
          .from("site-media")
          .remove([deleteTarget.cover_image_path]);

        if (storageError) {
          console.warn(
            "Impossible de supprimer l'image :",
            storageError,
          );
        }
      }

      /*
       * Suppression de l'article.
       */
      const { error: deleteError } = await supabase
        .from("articles")
        .delete()
        .eq("id", deleteTarget.id);

      if (deleteError) {
        throw deleteError;
      }

      /*
       * Journalisation.
       */
      await supabase.from("activity_logs").insert({
        user_id: currentUser.user.id,
        action: "delete",
        entity_type: "article",
        entity_id: deleteTarget.id,
        description: `Suppression de l'article "${deleteTarget.title}"`,
      });

      /*
       * Mise à jour locale.
       */
      setArticles((current) =>
        current.filter(
          (article) => article.id !== deleteTarget.id,
        ),
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cet article.",
      );
    } finally {
      setDeleting(false);
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#f7f6f3] text-[#1c1c1a]">
      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#9b7b54]">
                <FileText
                  size={14}
                  strokeWidth={1.5}
                />

                Administration
                <span className="text-neutral-300">
                  /
                </span>
                Éditorial
              </div>

              <h1 className="text-4xl font-light tracking-[-0.045em] sm:text-5xl">
                Articles
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                Bibliothèque éditoriale du site. Ouvrez un
                article pour consulter et gérer l'ensemble de
                son contenu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadArticles(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center gap-2 border border-neutral-200 bg-white px-4 text-[11px] uppercase tracking-[0.13em] text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Actualiser
              </button>

              <Link
                href="/admin/articles/nouveau"
                className="inline-flex h-11 items-center gap-2 bg-[#1d1d1b] px-5 text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-[#9b7b54]"
              >
                <Plus size={16} />

                Nouvel article
              </Link>
            </div>
          </div>
        </header>

        {/* ====================================================
            STATS
        ==================================================== */}

        <section className="mb-7 grid grid-cols-2 border border-neutral-200 bg-white sm:grid-cols-3 lg:grid-cols-5">
          <Stat
            label="Total"
            value={stats.total}
            icon={<FileText size={17} />}
          />

          <Stat
            label="Publiés"
            value={stats.published}
            icon={<CheckCircle2 size={17} />}
          />

          <Stat
            label="Brouillons"
            value={stats.drafts}
            icon={<Clock3 size={17} />}
          />

          <Stat
            label="Archivés"
            value={stats.archived}
            icon={<Archive size={17} />}
          />

          <Stat
            label="À la une"
            value={stats.featured}
            icon={<Star size={17} />}
          />
        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-6 flex items-start justify-between gap-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            FILTER BAR
        ==================================================== */}

        <section className="mb-7 border border-neutral-200 bg-white">
          <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher un article, une catégorie ou un tag..."
                className="h-11 w-full border border-neutral-200 bg-[#fafaf8] pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#9b7b54]"
              />
            </div>

            {/* FILTERS */}

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "all"
                        | ArticleStatus,
                    )
                  }
                  className="h-11 min-w-[155px] appearance-none border border-neutral-200 bg-white pl-9 pr-8 text-[10px] uppercase tracking-[0.09em] outline-none focus:border-[#9b7b54]"
                >
                  <option value="all">
                    Tous les statuts
                  </option>

                  <option value="published">
                    Publiés
                  </option>

                  <option value="draft">
                    Brouillons
                  </option>

                  <option value="archived">
                    Archivés
                  </option>
                </select>
              </div>

              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value,
                    )
                  }
                  className="h-11 min-w-[165px] border border-neutral-200 bg-white px-3 text-[10px] uppercase tracking-[0.09em] outline-none focus:border-[#9b7b54]"
                >
                  <option value="all">
                    Toutes les catégories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() =>
                  setSortAscending(
                    (current) => !current,
                  )
                }
                className="inline-flex h-11 items-center gap-2 border border-neutral-200 bg-white px-3 text-[10px] uppercase tracking-[0.09em] text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900"
                title="Modifier le tri"
              >
                {sortAscending ? (
                  <ArrowUpAZ size={15} />
                ) : (
                  <ArrowDownAZ size={15} />
                )}

                Date
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================
            RESULT COUNT
        ==================================================== */}

        {!loading && articles.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.13em] text-neutral-400">
              {filteredArticles.length} article
              {filteredArticles.length > 1
                ? "s"
                : ""}
            </div>

            {(search ||
              statusFilter !== "all" ||
              categoryFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#9b7b54] transition hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="flex min-h-[460px] items-center justify-center border border-neutral-200 bg-white">
            <div className="flex flex-col items-center gap-4 text-neutral-400">
              <Loader2
                size={28}
                strokeWidth={1.4}
                className="animate-spin"
              />

              <span className="text-[10px] uppercase tracking-[0.2em]">
                Chargement des articles
              </span>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          /* ==================================================
             EMPTY
          ================================================== */

          <div className="flex min-h-[460px] flex-col items-center justify-center border border-neutral-200 bg-white px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center border border-neutral-200 text-neutral-400">
              <FileText
                size={26}
                strokeWidth={1.2}
              />
            </div>

            <h2 className="text-xl font-light tracking-[-0.02em]">
              {articles.length === 0
                ? "Aucun article"
                : "Aucun résultat"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {articles.length === 0
                ? "Votre bibliothèque éditoriale est encore vide. Commencez par créer votre premier article."
                : "Aucun article ne correspond aux critères de recherche sélectionnés."}
            </p>

            {articles.length === 0 && (
              <Link
                href="/admin/articles/nouveau"
                className="mt-7 inline-flex h-11 items-center gap-2 bg-[#1d1d1b] px-5 text-[11px] uppercase tracking-[0.13em] text-white transition hover:bg-[#9b7b54]"
              >
                <Plus size={15} />

                Créer un article
              </Link>
            )}
          </div>
        ) : (
          /* ==================================================
             ARTICLE LIST
          ================================================== */

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredArticles.map(
                (article, index) => (
                  <motion.article
                    key={article.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.22,
                      delay: index * 0.015,
                    }}
                    className="group border border-neutral-200 bg-white transition hover:border-[#cfc5b8]"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* ==================================================
                          COVER
                      ================================================== */}

                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="relative block h-52 w-full shrink-0 overflow-hidden bg-neutral-100 sm:h-60 lg:h-auto lg:min-h-[270px] lg:w-[300px]"
                      >
                        {article.cover_image_url ? (
                          <img
                            src={
                              article.cover_image_url
                            }
                            alt={article.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="flex h-full min-h-[220px] w-full items-center justify-center text-neutral-300">
                            <FileText
                              size={42}
                              strokeWidth={1}
                            />
                          </div>
                        )}

                        {/* IMAGE OVERLAY */}

                        <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/10" />

                        {/* FEATURED */}

                        {article.featured && (
                          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-[#9b7b54] shadow-sm">
                            <Star
                              size={11}
                              fill="currentColor"
                            />

                            À la une
                          </div>
                        )}

                        {/* OPEN INDICATOR */}

                        <div className="absolute bottom-4 left-4 translate-y-2 border border-white/40 bg-black/55 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          Ouvrir l'article
                        </div>
                      </Link>

                      {/* ==================================================
                          BODY
                      ================================================== */}

                      <div className="min-w-0 flex-1 p-5 sm:p-7">
                        {/* META */}

                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`border px-2.5 py-1 text-[9px] uppercase tracking-[0.13em] ${STATUS_CLASSES[article.status]}`}
                          >
                            {
                              STATUS_LABELS[
                                article.status
                              ]
                            }
                          </span>

                          {article.category && (
                            <span className="border border-neutral-200 px-2.5 py-1 text-[9px] uppercase tracking-[0.13em] text-neutral-500">
                              {article.category}
                            </span>
                          )}
                        </div>

                        {/* TITLE */}

                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="block"
                        >
                          <h2 className="max-w-4xl text-2xl font-light leading-[1.15] tracking-[-0.035em] transition group-hover:text-[#9b7b54] sm:text-[28px]">
                            {article.title}
                          </h2>
                        </Link>

                        {/* SLUG */}

                        <div className="mt-2 text-[10px] tracking-[0.04em] text-neutral-400">
                          /articles/
                          {article.slug}
                        </div>

                        {/* EXCERPT */}

                        <p className="mt-5 max-w-3xl text-sm leading-6 text-neutral-500">
                          {getExcerpt(article)}
                        </p>

                        {/* INFORMATION */}

                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-neutral-400">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />

                            {article.status ===
                            "published"
                              ? formatDate(
                                  article.published_at,
                                )
                              : formatDate(
                                  article.created_at,
                                )}
                          </span>

                          <span>
                            Ordre{" "}
                            {article.display_order}
                          </span>

                          {article.tags?.length > 0 && (
                            <span className="flex flex-wrap gap-x-2">
                              {article.tags
                                .slice(0, 4)
                                .map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-neutral-400"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                            </span>
                          )}
                        </div>

                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-5">
                          {/* MAIN ACTION */}

                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="inline-flex h-10 items-center gap-2 bg-[#1d1d1b] px-4 text-[10px] uppercase tracking-[0.13em] text-white transition hover:bg-[#9b7b54]"
                          >
                            Étudier l'article

                            <ChevronRight
                              size={14}
                            />
                          </Link>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget(
                                article,
                              )
                            }
                            className="ml-auto inline-flex h-10 items-center gap-2 border border-red-100 px-3 text-[10px] uppercase tracking-[0.1em] text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          >
                            <Trash2 size={14} />

                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ),
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      <AnimatePresence>
        {deleteTarget && (
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5 backdrop-blur-[2px]"
            onClick={() => {
              if (!deleting) {
                setDeleteTarget(null);
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
                y: 15,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="w-full max-w-md border border-neutral-200 bg-white p-7 shadow-2xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center border border-red-100 bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>

              <h2 className="text-xl font-light tracking-[-0.02em]">
                Supprimer cet article ?
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                L'article{" "}
                <span className="font-medium text-neutral-800">
                  « {deleteTarget.title} »
                </span>{" "}
                sera définitivement supprimé.
              </p>

              <div className="mt-7 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  disabled={deleting}
                  className="h-10 border border-neutral-200 px-4 text-[10px] uppercase tracking-[0.1em] text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleDelete()
                  }
                  disabled={deleting}
                  className="inline-flex h-10 items-center gap-2 bg-red-600 px-4 text-[10px] uppercase tracking-[0.1em] text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  Supprimer
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
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-200 p-4 sm:border-r lg:border-b-0">
      <div className="text-[#9b7b54]">
        {icon}
      </div>

      <div>
        <div className="text-xl font-light tracking-[-0.02em]">
          {value}
        </div>

        <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
          {label}
        </div>
      </div>
    </div>
  );
}