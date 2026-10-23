"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  Star,
  Tag,
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
   HELPERS
============================================================ */

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const local = new Date(
    date.getTime() - offset * 60 * 1000,
  );

  return local.toISOString().slice(0, 16);
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* ============================================================
   PAGE
============================================================ */

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseClient();

  const articleId = params.id;

  /* ============================================================
     STATE
  ============================================================ */

  const [article, setArticle] = useState<Article | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [status, setStatus] =
    useState<ArticleStatus>("draft");

  const [featured, setFeatured] = useState(false);

  const [displayOrder, setDisplayOrder] = useState("0");

  const [publishedAt, setPublishedAt] = useState("");

  const [newCoverFile, setNewCoverFile] =
    useState<File | null>(null);

  const [newCoverPreview, setNewCoverPreview] =
    useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  /* ============================================================
     LOAD ARTICLE
  ============================================================ */

  const loadArticle = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const {
        data: profile,
        error: profileError,
      } = await supabase
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

      const {
        data,
        error: articleError,
      } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .maybeSingle();

      if (articleError) {
        throw articleError;
      }

      if (!data) {
        router.replace("/admin/articles");
        return;
      }

      const loaded = data as Article;

      setArticle(loaded);

      setTitle(loaded.title);
      setSlug(loaded.slug);
      setExcerpt(loaded.excerpt || "");
      setContent(loaded.content || "");
      setCategory(loaded.category || "");
      setTagsInput((loaded.tags || []).join(", "));
      setStatus(loaded.status);
      setFeatured(loaded.featured);
      setDisplayOrder(String(loaded.display_order));
      setPublishedAt(
        toDateTimeLocal(loaded.published_at),
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger cet article.",
      );
    } finally {
      setLoading(false);
    }
  }, [articleId, router, supabase]);

  useEffect(() => {
    void loadArticle();
  }, [loadArticle]);

  /* ============================================================
     CLEAN PREVIEW URL
  ============================================================ */

  useEffect(() => {
    return () => {
      if (newCoverPreview) {
        URL.revokeObjectURL(newCoverPreview);
      }
    };
  }, [newCoverPreview]);

  /* ============================================================
     COVER
  ============================================================ */

  function handleCoverChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] || null;

    if (newCoverPreview) {
      URL.revokeObjectURL(newCoverPreview);
    }

    setNewCoverFile(file);

    setNewCoverPreview(
      file ? URL.createObjectURL(file) : "",
    );

    event.target.value = "";
  }

  function cancelCoverReplacement() {
    if (newCoverPreview) {
      URL.revokeObjectURL(newCoverPreview);
    }

    setNewCoverPreview("");
    setNewCoverFile(null);
  }

  /* ============================================================
     TAGS
  ============================================================ */

  function parseTags() {
    return Array.from(
      new Set(
        tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    );
  }

  const parsedTags = useMemo(() => {
    return parseTags();
  }, [tagsInput]);

  /* ============================================================
     SAVE
  ============================================================ */

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!article || !userId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!title.trim()) {
        throw new Error("Le titre est obligatoire.");
      }

      if (!slug.trim()) {
        throw new Error("Le slug est obligatoire.");
      }

      const cleanSlug = slugify(slug);

      const {
        data: duplicate,
        error: duplicateError,
      } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", cleanSlug)
        .neq("id", article.id)
        .maybeSingle();

      if (duplicateError) {
        throw duplicateError;
      }

      if (duplicate) {
        throw new Error(
          "Ce slug est déjà utilisé par un autre article.",
        );
      }

      /* --------------------------------------------------------
         COVER
      -------------------------------------------------------- */

      let coverImageUrl = article.cover_image_url;
      let coverImagePath = article.cover_image_path;

      if (newCoverFile) {
        const extension =
          newCoverFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const safeExtension =
          extension.replace(/[^a-z0-9]/g, "") || "jpg";

        const path = `articles/${article.id}/cover-${Date.now()}.${safeExtension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("site-media")
          .upload(path, newCoverFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: newCoverFile.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrl,
        } = supabase.storage
          .from("site-media")
          .getPublicUrl(path);

        coverImageUrl = publicUrl.publicUrl;
        coverImagePath = path;
      }

      /* --------------------------------------------------------
         PUBLICATION DATE
      -------------------------------------------------------- */

      let finalPublishedAt: string | null = null;

      if (status === "published") {
        finalPublishedAt = publishedAt
          ? new Date(publishedAt).toISOString()
          : article.published_at ||
            new Date().toISOString();
      } else {
        finalPublishedAt = publishedAt
          ? new Date(publishedAt).toISOString()
          : article.published_at;
      }

      /* --------------------------------------------------------
         UPDATE
      -------------------------------------------------------- */

      const {
        data: updated,
        error: updateError,
      } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          slug: cleanSlug,
          excerpt: excerpt.trim() || null,
          content: content || null,
          cover_image_url: coverImageUrl,
          cover_image_path: coverImagePath,
          category: category.trim() || null,
          tags: parseTags(),
          status,
          featured,
          display_order:
            Number.parseInt(displayOrder, 10) || 0,
          published_at: finalPublishedAt,
        })
        .eq("id", article.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      /* --------------------------------------------------------
         REMOVE OLD COVER
      -------------------------------------------------------- */

      if (
        newCoverFile &&
        article.cover_image_path &&
        article.cover_image_path !== coverImagePath
      ) {
        await supabase.storage
          .from("site-media")
          .remove([article.cover_image_path]);
      }

      /* --------------------------------------------------------
         ACTIVITY LOG
      -------------------------------------------------------- */

      await supabase.from("activity_logs").insert({
        user_id: userId,
        action: "update",
        entity_type: "article",
        entity_id: article.id,
        description: `Modification de l'article "${title.trim()}"`,
      });

      /* --------------------------------------------------------
         UPDATE LOCAL STATE
      -------------------------------------------------------- */

      const updatedArticle = updated as Article;

      setArticle(updatedArticle);

      setTitle(updatedArticle.title);
      setSlug(updatedArticle.slug);
      setExcerpt(updatedArticle.excerpt || "");
      setContent(updatedArticle.content || "");
      setCategory(updatedArticle.category || "");
      setTagsInput(
        (updatedArticle.tags || []).join(", "),
      );
      setStatus(updatedArticle.status);
      setFeatured(updatedArticle.featured);
      setDisplayOrder(
        String(updatedArticle.display_order),
      );
      setPublishedAt(
        toDateTimeLocal(updatedArticle.published_at),
      );

      setNewCoverFile(null);

      if (newCoverPreview) {
        URL.revokeObjectURL(newCoverPreview);
      }

      setNewCoverPreview("");

      setSuccess(
        "Les modifications ont été enregistrées.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer les modifications.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function handleDelete() {
    if (!article || !userId) return;

    setDeleting(true);
    setError("");

    try {
      if (article.cover_image_path) {
        await supabase.storage
          .from("site-media")
          .remove([article.cover_image_path]);
      }

      const {
        error: deleteError,
      } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);

      if (deleteError) {
        throw deleteError;
      }

      await supabase.from("activity_logs").insert({
        user_id: userId,
        action: "delete",
        entity_type: "article",
        entity_id: article.id,
        description: `Suppression de l'article "${article.title}"`,
      });

      router.replace("/admin/articles");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cet article.",
      );

      setDeleting(false);
    }
  }

  /* ============================================================
     STATUS
  ============================================================ */

  const statusConfig = {
    draft: {
      label: "Brouillon",
      description: "Non publié",
      className:
        "border-neutral-200 bg-neutral-50 text-neutral-600",
      dot: "bg-neutral-400",
    },
    published: {
      label: "Publié",
      description: "Visible sur le site",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    archived: {
      label: "Archivé",
      description: "Retiré de la publication",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
  }[status];

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f5f2]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white">
            <Loader2
              size={22}
              className="animate-spin text-[#9b7b54]"
              strokeWidth={1.4}
            />
          </div>

          <span className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">
            Chargement de l'article
          </span>
        </motion.div>
      </main>
    );
  }

  if (!article) {
    return null;
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1d1d1b]">
      {/* ========================================================
          TOP HEADER
      ======================================================== */}

      <header className="border-b border-neutral-200/80 bg-[#f6f5f2]">
        <div className="mx-auto max-w-[1560px] px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <Link
                href="/admin/articles"
                className="group mb-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition hover:text-[#9b7b54]"
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.4}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Retour aux articles
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#9b7b54]">
                  Éditorial
                </span>

                <span className="h-px w-8 bg-[#d8c7b1]" />

                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  Étude & modification
                </span>
              </div>

              <h1 className="mt-4 max-w-5xl text-3xl font-light leading-[1.08] tracking-[-0.045em] sm:text-4xl lg:text-[46px]">
                {article.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-neutral-400">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={13} />
                  Créé le {formatShortDate(article.created_at)}
                </span>

                <span className="hidden h-3 w-px bg-neutral-300 sm:block" />

                <span className="inline-flex items-center gap-2">
                  <Clock3 size={13} />
                  Modifié le {formatShortDate(article.updated_at)}
                </span>

                <span className="hidden h-3 w-px bg-neutral-300 sm:block" />

                <span className="font-mono text-[10px] text-[#9b7b54]">
                  {article.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`inline-flex h-10 items-center gap-2 border px-3 ${statusConfig.className}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                />

                <span className="text-[10px] uppercase tracking-[0.12em]">
                  {statusConfig.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(true)
                }
                className="inline-flex h-10 items-center gap-2 border border-red-100 bg-white px-4 text-[10px] uppercase tracking-[0.14em] text-red-600 transition hover:border-red-200 hover:bg-red-50"
              >
                <Trash2
                  size={14}
                  strokeWidth={1.5}
                />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <div className="mx-auto max-w-[1560px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {/* ======================================================
            ALERTS
        ====================================================== */}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-start justify-between border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-red-500">
                    Erreur
                  </div>

                  <span>{error}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-4 text-red-400 transition hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                <div className="flex h-7 w-7 items-center justify-center border border-emerald-200 bg-white">
                  <Check size={15} />
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-emerald-600">
                    Enregistrement
                  </div>

                  <div className="mt-0.5">
                    {success}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave}>
          <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_370px]">
            {/* ==================================================
                LEFT COLUMN
            ================================================== */}

            <div className="min-w-0 space-y-7">
              {/* ==================================================
                  EDITORIAL CONTENT
              ================================================== */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="border border-neutral-200 bg-white"
              >
                <SectionHeader
                  number="01"
                  eyebrow="Éditorial"
                  title="Contenu de l'article"
                  description="Structurez le titre, le résumé et le contenu principal."
                />

                <div className="p-5 sm:p-8">
                  <div className="space-y-7">
                    <Field
                      label="Titre"
                      required
                    >
                      <input
                        value={title}
                        onChange={(event) =>
                          setTitle(event.target.value)
                        }
                        placeholder="Titre de l'article"
                        className="editor-input h-14 text-lg font-light tracking-[-0.02em]"
                      />
                    </Field>

                    <Field
                      label="Slug"
                      required
                      hint="Identifiant URL"
                    >
                      <div className="flex h-12 overflow-hidden border border-neutral-200 bg-[#fafaf8]">
                        <div className="flex items-center border-r border-neutral-200 px-4 font-mono text-[11px] text-neutral-400">
                          /articles/
                        </div>

                        <input
                          value={slug}
                          onChange={(event) =>
                            setSlug(
                              event.target.value,
                            )
                          }
                          className="min-w-0 flex-1 bg-transparent px-4 font-mono text-[12px] text-[#5f584f] outline-none"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Extrait"
                      hint={`${excerpt.length} caractères`}
                    >
                      <textarea
                        value={excerpt}
                        onChange={(event) =>
                          setExcerpt(
                            event.target.value,
                          )
                        }
                        rows={4}
                        placeholder="Présentez brièvement le sujet de cet article..."
                        className="editor-input resize-y leading-6"
                      />
                    </Field>

                    <Field
                      label="Contenu"
                      hint={`${content.length} caractères`}
                    >
                      <div className="overflow-hidden border border-neutral-200 bg-[#fcfcfa]">
                        <div className="flex h-10 items-center justify-between border-b border-neutral-200 px-4">
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                            <FileText
                              size={13}
                              strokeWidth={1.4}
                            />
                            Éditeur
                          </div>

                          <span className="font-mono text-[9px] text-neutral-300">
                            TEXTE
                          </span>
                        </div>

                        <textarea
                          value={content}
                          onChange={(event) =>
                            setContent(
                              event.target.value,
                            )
                          }
                          rows={26}
                          placeholder="Rédigez le contenu complet de l'article..."
                          className="block min-h-[560px] w-full resize-y bg-transparent p-5 font-mono text-[13px] leading-7 text-neutral-700 outline-none placeholder:text-neutral-300 sm:p-7"
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </motion.section>

              {/* ==================================================
                  COVER
              ================================================== */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: 0.05,
                }}
                className="border border-neutral-200 bg-white"
              >
                <SectionHeader
                  number="02"
                  eyebrow="Média"
                  title="Image de couverture"
                  description="Cette image représentera l'article dans les différentes vues éditoriales."
                />

                <div className="p-5 sm:p-8">
                  <div className="relative overflow-hidden border border-neutral-200 bg-[#ebe9e4]">
                    {newCoverPreview ? (
                      <>
                        <img
                          src={newCoverPreview}
                          alt="Nouvelle couverture"
                          className="aspect-[16/8] w-full object-cover"
                        />

                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 bg-[#1d1d1b] px-3 py-2 text-[9px] uppercase tracking-[0.13em] text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d8b58c]" />
                          Nouvelle image
                        </div>
                      </>
                    ) : article.cover_image_url ? (
                      <>
                        <img
                          src={
                            article.cover_image_url
                          }
                          alt={article.title}
                          className="aspect-[16/8] w-full object-cover"
                        />

                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 bg-white/90 px-3 py-2 text-[9px] uppercase tracking-[0.13em] text-neutral-500 backdrop-blur-sm">
                          <ImageIcon
                            size={12}
                            strokeWidth={1.4}
                          />
                          Couverture actuelle
                        </div>
                      </>
                    ) : (
                      <div className="flex aspect-[16/8] flex-col items-center justify-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center border border-neutral-200 bg-white">
                          <ImageIcon
                            size={25}
                            strokeWidth={1.2}
                            className="text-neutral-300"
                          />
                        </div>

                        <span className="text-[10px] uppercase tracking-[0.17em] text-neutral-400">
                          Aucune image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 border border-[#1d1d1b] bg-[#1d1d1b] px-5 text-[10px] uppercase tracking-[0.13em] text-white transition hover:bg-[#9b7b54]">
                        <ImageIcon
                          size={15}
                          strokeWidth={1.5}
                        />

                        {newCoverFile
                          ? "Changer l'image"
                          : article.cover_image_url
                            ? "Remplacer l'image"
                            : "Ajouter une image"}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={
                            handleCoverChange
                          }
                        />
                      </label>

                      <p className="mt-2 text-[10px] text-neutral-400">
                        JPG, PNG ou WebP · image
                        recommandée en format paysage
                      </p>
                    </div>

                    {newCoverFile && (
                      <button
                        type="button"
                        onClick={
                          cancelCoverReplacement
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 border border-red-100 px-4 text-[10px] uppercase tracking-[0.1em] text-red-600 transition hover:bg-red-50"
                      >
                        <X size={14} />
                        Annuler
                      </button>
                    )}
                  </div>

                  {newCoverFile && (
                    <div className="mt-5 border border-[#e4d8ca] bg-[#faf7f2] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#dfcfbd] bg-white text-[#9b7b54]">
                          <ImageIcon
                            size={16}
                            strokeWidth={1.4}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs text-neutral-700">
                            {newCoverFile.name}
                          </p>

                          <p className="mt-1 text-[10px] text-neutral-400">
                            {(
                              newCoverFile.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            Mo · sera envoyée lors de
                            l'enregistrement
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>

            {/* ==================================================
                RIGHT SIDEBAR
            ================================================== */}

            <aside className="space-y-6 xl:sticky xl:top-6">
              {/* ==================================================
                  PUBLICATION
              ================================================== */}

              <motion.section
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="border border-neutral-200 bg-white"
              >
                <SectionHeader
                  number="03"
                  eyebrow="Publication"
                  title="État de l'article"
                />

                <div className="p-5">
                  <div className="space-y-5">
                    <Field label="Statut">
                      <div className="grid gap-2">
                        <StatusOption
                          active={status === "draft"}
                          color="neutral"
                          label="Brouillon"
                          description="Article non publié"
                          onClick={() =>
                            setStatus("draft")
                          }
                        />

                        <StatusOption
                          active={
                            status === "published"
                          }
                          color="green"
                          label="Publié"
                          description="Visible sur le site"
                          onClick={() =>
                            setStatus("published")
                          }
                        />

                        <StatusOption
                          active={
                            status === "archived"
                          }
                          color="amber"
                          label="Archivé"
                          description="Retiré de la publication"
                          onClick={() =>
                            setStatus("archived")
                          }
                        />
                      </div>
                    </Field>

                    <Field label="Date de publication">
                      <div className="relative">
                        <CalendarDays
                          size={15}
                          strokeWidth={1.4}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                          type="datetime-local"
                          value={publishedAt}
                          onChange={(event) =>
                            setPublishedAt(
                              event.target.value,
                            )
                          }
                          className="editor-input h-11 pl-10 text-xs"
                        />
                      </div>
                    </Field>

                    <Field label="Ordre d'affichage">
                      <input
                        type="number"
                        min="0"
                        value={displayOrder}
                        onChange={(event) =>
                          setDisplayOrder(
                            event.target.value,
                          )
                        }
                        className="editor-input h-11"
                      />
                    </Field>

                    <button
                      type="button"
                      onClick={() =>
                        setFeatured(
                          (current) => !current,
                        )
                      }
                      className={`flex w-full items-center justify-between border p-4 text-left transition ${
                        featured
                          ? "border-[#ddc9b0] bg-[#fbf7f1]"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Star
                            size={15}
                            strokeWidth={1.4}
                            className={
                              featured
                                ? "text-[#9b7b54]"
                                : "text-neutral-300"
                            }
                            fill={
                              featured
                                ? "currentColor"
                                : "none"
                            }
                          />

                          <span className="text-xs">
                            Article à la une
                          </span>
                        </div>

                        <p className="mt-1 pl-[23px] text-[10px] leading-4 text-neutral-400">
                          Mettre en évidence cet
                          article.
                        </p>
                      </div>

                      <div
                        className={`relative h-5 w-9 border transition ${
                          featured
                            ? "border-[#9b7b54] bg-[#9b7b54]"
                            : "border-neutral-300 bg-neutral-100"
                        }`}
                      >
                        <span
                          className={`absolute top-[3px] h-3 w-3 bg-white transition-transform ${
                            featured
                              ? "translate-x-[18px]"
                              : "translate-x-[3px]"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </motion.section>

              {/* ==================================================
                  CLASSIFICATION
              ================================================== */}

              <motion.section
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: 0.05,
                }}
                className="border border-neutral-200 bg-white"
              >
                <SectionHeader
                  number="04"
                  eyebrow="Organisation"
                  title="Classification"
                />

                <div className="p-5">
                  <div className="space-y-5">
                    <Field label="Catégorie">
                      <div className="relative">
                        <Tag
                          size={14}
                          strokeWidth={1.4}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                          value={category}
                          onChange={(event) =>
                            setCategory(
                              event.target.value,
                            )
                          }
                          placeholder="Architecture"
                          className="editor-input h-11 pl-9"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Tags"
                      hint="Séparés par des virgules"
                    >
                      <input
                        value={tagsInput}
                        onChange={(event) =>
                          setTagsInput(
                            event.target.value,
                          )
                        }
                        placeholder="architecture, design, RDC"
                        className="editor-input h-11"
                      />

                      {parsedTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {parsedTags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-neutral-200 bg-[#fafaf8] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.08em] text-neutral-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Field>
                  </div>
                </div>
              </motion.section>

              {/* ==================================================
                  INFORMATION
              ================================================== */}

              <motion.section
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: 0.1,
                }}
                className="border border-neutral-200 bg-[#fafaf8]"
              >
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center border border-neutral-200 bg-white">
                      <FileText
                        size={14}
                        strokeWidth={1.4}
                        className="text-[#9b7b54]"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                        Informations
                      </p>

                      <p className="mt-0.5 text-xs text-neutral-700">
                        Métadonnées
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-neutral-200 pt-4">
                    <InfoRow
                      label="Création"
                      value={formatDate(
                        article.created_at,
                      )}
                    />

                    <InfoRow
                      label="Dernière modification"
                      value={formatDate(
                        article.updated_at,
                      )}
                    />

                    <InfoRow
                      label="Identifiant"
                      value={article.id}
                      mono
                    />
                  </div>
                </div>
              </motion.section>

              {/* ==================================================
                  SAVE
              ================================================== */}

              <div className="sticky bottom-5 z-20">
                <div className="border border-neutral-200 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="group flex h-13 w-full items-center justify-center gap-3 bg-[#1d1d1b] px-5 text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-[#9b7b54] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={16}
                        strokeWidth={1.5}
                      />
                    )}

                    <span>
                      {saving
                        ? "Enregistrement..."
                        : "Enregistrer les modifications"}
                    </span>
                  </button>

                  <p className="mt-3 text-center text-[9px] uppercase tracking-[0.1em] text-neutral-300">
                    Les modifications seront
                    immédiatement enregistrées
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#151513]/40 p-5 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !deleting
              ) {
                setShowDeleteModal(false);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 18,
                scale: 0.98,
              }}
              transition={{
                duration: 0.22,
              }}
              className="w-full max-w-lg border border-neutral-200 bg-white shadow-2xl"
            >
              <div className="border-b border-neutral-200 px-6 py-5">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center border border-red-100 bg-red-50 text-red-600">
                      <Trash2
                        size={19}
                        strokeWidth={1.4}
                      />
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-red-500">
                        Action définitive
                      </div>

                      <h2 className="mt-1 text-xl font-light tracking-[-0.02em]">
                        Supprimer l'article
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowDeleteModal(false)
                    }
                    disabled={deleting}
                    className="text-neutral-300 transition hover:text-neutral-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm leading-6 text-neutral-500">
                  Vous êtes sur le point de supprimer
                  définitivement cet article ainsi que
                  sa relation avec son image de couverture.
                </p>

                <div className="mt-5 border border-neutral-200 bg-[#fafaf8] p-4">
                  <div className="text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                    Article sélectionné
                  </div>

                  <div className="mt-2 text-sm leading-6 text-neutral-800">
                    {article.title}
                  </div>

                  <div className="mt-2 font-mono text-[9px] text-neutral-400">
                    {article.id}
                  </div>
                </div>

                <div className="mt-4 border-l-2 border-red-200 pl-4 text-[11px] leading-5 text-neutral-400">
                  Cette opération ne peut pas être
                  annulée. L'image stockée dans
                  <span className="mx-1 font-mono text-neutral-600">
                    site-media
                  </span>
                  sera également supprimée.
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 bg-[#fafaf8] px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                  disabled={deleting}
                  className="h-11 border border-neutral-200 bg-white px-5 text-[10px] uppercase tracking-[0.13em] text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="inline-flex h-11 items-center justify-center gap-2 bg-red-600 px-5 text-[10px] uppercase tracking-[0.13em] text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {deleting
                    ? "Suppression..."
                    : "Supprimer définitivement"}
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
   SECTION HEADER
============================================================ */

function SectionHeader({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-neutral-200 px-5 py-5 sm:px-8">
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#ddcbb5] bg-[#fbf8f3] font-mono text-[10px] text-[#9b7b54]">
          {number}
        </div>

        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.2em] text-[#9b7b54]">
            {eyebrow}
          </div>

          <h2 className="mt-1 text-lg font-light tracking-[-0.025em]">
            {title}
          </h2>

          {description && (
            <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          {label}

          {required && (
            <span className="ml-1 text-[#9b7b54]">
              *
            </span>
          )}
        </span>

        {hint && (
          <span className="text-[9px] text-neutral-300">
            {hint}
          </span>
        )}
      </div>

      {children}
    </label>
  );
}

/* ============================================================
   STATUS OPTION
============================================================ */

function StatusOption({
  active,
  color,
  label,
  description,
  onClick,
}: {
  active: boolean;
  color: "neutral" | "green" | "amber";
  label: string;
  description: string;
  onClick: () => void;
}) {
  const colors = {
    neutral: {
      active:
        "border-neutral-300 bg-neutral-50",
      dot: "bg-neutral-400",
    },
    green: {
      active:
        "border-emerald-200 bg-emerald-50/70",
      dot: "bg-emerald-500",
    },
    amber: {
      active:
        "border-amber-200 bg-amber-50/70",
      dot: "bg-amber-500",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between border p-3.5 text-left transition ${
        active
          ? colors[color].active
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2 w-2 rounded-full ${colors[color].dot}`}
        />

        <div>
          <div className="text-xs text-neutral-700">
            {label}
          </div>

          <div className="mt-0.5 text-[9px] text-neutral-400">
            {description}
          </div>
        </div>
      </div>

      <div
        className={`flex h-5 w-5 items-center justify-center border ${
          active
            ? "border-[#9b7b54] bg-[#9b7b54] text-white"
            : "border-neutral-200 bg-white text-transparent"
        }`}
      >
        <Check size={11} />
      </div>
    </button>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[9px] uppercase tracking-[0.08em] text-neutral-400">
        {label}
      </span>

      <span
        className={`max-w-[210px] text-right text-[10px] leading-4 text-neutral-600 ${
          mono ? "font-mono text-[9px]" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}