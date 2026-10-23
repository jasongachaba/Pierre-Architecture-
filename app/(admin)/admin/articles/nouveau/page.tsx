"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  Star,
  X,
} from "lucide-react";

import { motion } from "motion/react";

import { getSupabaseClient } from "@/lib/supabase/client";

type ArticleStatus = "draft" | "published" | "archived";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();

  const local = new Date(
    date.getTime() - offset * 60 * 1000,
  );

  return local.toISOString().slice(0, 16);
}

export default function NewArticlePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [status, setStatus] =
    useState<ArticleStatus>("draft");

  const [featured, setFeatured] = useState(false);

  const [displayOrder, setDisplayOrder] = useState("0");

  const [publishedAt, setPublishedAt] = useState("");

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [coverPreview, setCoverPreview] = useState("");

  /*
   * ----------------------------------------------------------
   * AUTH
   * ----------------------------------------------------------
   */

  useEffect(() => {
    async function init() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

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

      setUserId(user.id);

      setPublishedAt(
        formatDateTimeLocal(new Date()),
      );

      setChecking(false);
    }

    void init();
  }, [router, supabase]);

  /*
   * ----------------------------------------------------------
   * AUTO SLUG
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  /*
   * ----------------------------------------------------------
   * PREVIEW CLEANUP
   * ----------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  /*
   * ----------------------------------------------------------
   * COVER
   * ----------------------------------------------------------
   */

  function handleCoverChange(
    file: File | null,
  ) {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverFile(file);

    setCoverPreview(
      file ? URL.createObjectURL(file) : "",
    );
  }

  function removeCover() {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverFile(null);
    setCoverPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /*
   * ----------------------------------------------------------
   * TAGS
   * ----------------------------------------------------------
   */

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

  const tags = parseTags();

  /*
   * ----------------------------------------------------------
   * SUBMIT
   * ----------------------------------------------------------
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!userId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!title.trim()) {
        throw new Error(
          "Le titre est obligatoire.",
        );
      }

      if (!slug.trim()) {
        throw new Error(
          "Le slug est obligatoire.",
        );
      }

      const cleanSlug = slugify(slug);

      /*
       * Vérification du slug
       */

      const {
        data: existingSlug,
        error: slugError,
      } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (slugError) {
        throw slugError;
      }

      if (existingSlug) {
        throw new Error(
          "Ce slug existe déjà. Veuillez en choisir un autre.",
        );
      }

      /*
       * Upload couverture
       */

      let coverImageUrl: string | null = null;
      let coverImagePath: string | null = null;

      if (coverFile) {
        const extension =
          coverFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const safeExtension =
          extension.replace(
            /[^a-z0-9]/g,
            "",
          ) || "jpg";

        const path =
          `articles/${crypto.randomUUID()}/cover.${safeExtension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("site-media")
          .upload(path, coverFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: coverFile.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrl,
        } = supabase.storage
          .from("site-media")
          .getPublicUrl(path);

        coverImageUrl =
          publicUrl.publicUrl;

        coverImagePath = path;
      }

      /*
       * Publication
       */

      const finalPublishedAt =
        status === "published"
          ? publishedAt
            ? new Date(
                publishedAt,
              ).toISOString()
            : new Date().toISOString()
          : publishedAt
            ? new Date(
                publishedAt,
              ).toISOString()
            : null;

      /*
       * Création
       */

      const {
        data: article,
        error: insertError,
      } = await supabase
        .from("articles")
        .insert({
          author_id: userId,
          title: title.trim(),
          slug: cleanSlug,
          excerpt:
            excerpt.trim() || null,
          content: content || null,
          cover_image_url:
            coverImageUrl,
          cover_image_path:
            coverImagePath,
          category:
            category.trim() || null,
          tags,
          status,
          featured,
          display_order:
            Number.parseInt(
              displayOrder,
              10,
            ) || 0,
          published_at:
            finalPublishedAt,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      /*
       * Activity log
       */

      await supabase
        .from("activity_logs")
        .insert({
          user_id: userId,
          action: "create",
          entity_type: "article",
          entity_id: article.id,
          description:
            `Création de l'article "${title.trim()}"`,
        });

      setSuccess(
        "Article créé avec succès.",
      );

      setTimeout(() => {
        router.push(
          `/admin/articles`,
        );
      }, 600);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f4f1]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-white">
            <Loader2
              size={20}
              className="animate-spin text-[#9b7b54]"
              strokeWidth={1.5}
            />
          </div>

          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Vérification de l'accès
          </span>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------------------------
   * UI
   * ----------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#f5f4f1] text-[#191917]">
      <div className="mx-auto max-w-[1540px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <header className="mb-8">
          <div className="flex flex-col gap-5 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/admin/articles"
                className="group mb-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.17em] text-neutral-400 transition hover:text-[#9b7b54]"
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:-translate-x-1"
                />

                Articles
              </Link>

              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#9b7b54]" />

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#9b7b54]">
                  Éditorial · Nouveau contenu
                </span>
              </div>

              <h1 className="mt-3 text-[38px] font-light leading-none tracking-[-0.045em] sm:text-[48px]">
                Nouvel article
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                Créez une publication éditoriale destinée
                à présenter les idées, projets et réflexions
                du studio.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                  Statut
                </div>

                <div className="mt-1 flex items-center justify-end gap-2 text-xs text-neutral-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  Brouillon
                </div>
              </div>

              <button
                form="article-form"
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 bg-[#1b1b19] px-5 text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-[#9b7b54] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                    strokeWidth={1.5}
                  />
                ) : (
                  <Save
                    size={15}
                    strokeWidth={1.5}
                  />
                )}

                {saving
                  ? "Enregistrement"
                  : "Publier / enregistrer"}
              </button>
            </div>
          </div>
        </header>

        {/* ====================================================
            ALERTS
        ==================================================== */}

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
            className="mb-6 flex items-center justify-between border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <div className="flex items-center gap-3">
              <X size={16} />

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={15} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <Check size={16} />

            {success}
          </motion.div>
        )}

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          id="article-form"
          onSubmit={handleSubmit}
        >
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* =================================================
                MAIN COLUMN
            ================================================= */}

            <div className="min-w-0 space-y-6">
              {/* -----------------------------------------------
                  TITLE / SLUG
              ------------------------------------------------ */}

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
                <div className="p-6 sm:p-8">
                  <SectionHeading
                    number="01"
                    eyebrow="Identité"
                    title="Donnez une voix au contenu"
                  />

                  <div className="space-y-6">
                    <Field
                      label="Titre de l'article"
                      required
                    >
                      <input
                        value={title}
                        onChange={(event) =>
                          setTitle(
                            event.target.value,
                          )
                        }
                        placeholder="Ex. Repenser l'habitat contemporain à Kinshasa"
                        className="w-full border-0 border-b border-neutral-200 bg-transparent px-0 py-3 text-[25px] font-light tracking-[-0.025em] outline-none transition placeholder:text-neutral-300 focus:border-[#9b7b54] sm:text-[30px]"
                        required
                      />
                    </Field>

                    <Field
                      label="Adresse web"
                      required
                    >
                      <div className="flex items-center border-b border-neutral-200">
                        <span className="mr-2 shrink-0 text-xs text-neutral-300">
                          /articles/
                        </span>

                        <input
                          value={slug}
                          onChange={(event) => {
                            setSlugManuallyEdited(
                              true,
                            );

                            setSlug(
                              slugify(
                                event.target.value,
                              ),
                            );
                          }}
                          placeholder="titre-de-larticle"
                          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-neutral-600 outline-none"
                          required
                        />
                      </div>
                    </Field>

                    <Field label="Extrait">
                      <textarea
                        value={excerpt}
                        onChange={(event) =>
                          setExcerpt(
                            event.target.value,
                          )
                        }
                        placeholder="Une courte introduction qui donnera envie de découvrir l'article..."
                        rows={4}
                        className="w-full resize-none border border-neutral-200 bg-[#fafaf8] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-neutral-300 focus:border-[#9b7b54]"
                      />

                      <div className="mt-2 text-right text-[10px] text-neutral-300">
                        {excerpt.length} caractères
                      </div>
                    </Field>
                  </div>
                </div>
              </motion.section>

              {/* -----------------------------------------------
                  CONTENT
              ------------------------------------------------ */}

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
                  delay: 0.06,
                }}
                className="border border-neutral-200 bg-white"
              >
                <div className="p-6 sm:p-8">
                  <SectionHeading
                    number="02"
                    eyebrow="Rédaction"
                    title="Corps de l'article"
                  />

                  <div className="overflow-hidden border border-neutral-200">
                    <div className="flex items-center justify-between border-b border-neutral-100 bg-[#fafaf8] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText
                          size={15}
                          strokeWidth={1.4}
                          className="text-[#9b7b54]"
                        />

                        <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                          Éditeur de contenu
                        </span>
                      </div>

                      <span className="text-[10px] text-neutral-300">
                        {content.length} caractères
                      </span>
                    </div>

                    <textarea
                      value={content}
                      onChange={(event) =>
                        setContent(
                          event.target.value,
                        )
                      }
                      placeholder={`Commencez à rédiger votre article...

Développez ici vos réflexions, votre approche architecturale, l'histoire d'un projet ou tout autre contenu éditorial du studio.`}
                      rows={26}
                      className="block min-h-[600px] w-full resize-y border-0 bg-white px-5 py-6 text-[15px] font-light leading-8 text-neutral-700 outline-none placeholder:text-neutral-300 sm:px-7 sm:py-8"
                    />
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-neutral-400">
                    Le contenu est enregistré comme texte.
                    L'intégration d'un éditeur riche pourra être
                    ajoutée ultérieurement sans modifier la
                    structure de la base de données.
                  </p>
                </div>
              </motion.section>

              {/* -----------------------------------------------
                  COVER
              ------------------------------------------------ */}

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
                  delay: 0.12,
                }}
                className="border border-neutral-200 bg-white"
              >
                <div className="p-6 sm:p-8">
                  <SectionHeading
                    number="03"
                    eyebrow="Visuel"
                    title="Image de couverture"
                  />

                  <div
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className={`group relative min-h-[330px] cursor-pointer overflow-hidden border border-neutral-200 ${
                      coverPreview
                        ? "bg-neutral-900"
                        : "bg-[#fafaf8]"
                    }`}
                  >
                    {coverPreview ? (
                      <>
                        <img
                          src={coverPreview}
                          alt="Aperçu de la couverture"
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.015] group-hover:opacity-80"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100" />

                        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-5 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="text-white">
                            <div className="text-xs">
                              {coverFile?.name}
                            </div>

                            <div className="mt-1 text-[10px] text-white/60">
                              Cliquer pour remplacer
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeCover();
                            }}
                            className="flex h-9 w-9 items-center justify-center bg-white text-neutral-700 transition hover:bg-[#9b7b54] hover:text-white"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
                        <motion.div
                          whileHover={{
                            y: -4,
                          }}
                          className="mb-5 flex h-16 w-16 items-center justify-center border border-neutral-200 bg-white text-[#9b7b54]"
                        >
                          <ImageIcon
                            size={26}
                            strokeWidth={1.2}
                          />
                        </motion.div>

                        <div className="text-sm text-neutral-700">
                          Ajouter une image de couverture
                        </div>

                        <div className="mt-2 text-xs text-neutral-400">
                          JPG, PNG ou WebP · Recommandé 1600 × 900
                        </div>

                        <div className="mt-5 inline-flex h-9 items-center gap-2 border border-neutral-200 bg-white px-4 text-[10px] uppercase tracking-[0.12em] text-neutral-500 transition group-hover:border-[#9b7b54] group-hover:text-[#9b7b54]">
                          Parcourir
                          <ArrowUpRight
                            size={13}
                          />
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) =>
                        handleCoverChange(
                          event.target.files?.[0] ||
                            null,
                        )
                      }
                    />
                  </div>
                </div>
              </motion.section>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="space-y-5 xl:sticky xl:top-6">
              {/* -----------------------------------------------
                  PUBLICATION
              ------------------------------------------------ */}

              <motion.section
                initial={{
                  opacity: 0,
                  x: 10,
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
                <div className="p-5">
                  <SectionHeading
                    number="04"
                    eyebrow="Diffusion"
                    title="Publication"
                    compact
                  />

                  <div className="space-y-5">
                    <Field label="Statut">
                      <div className="grid grid-cols-3 gap-1 border border-neutral-200 bg-[#fafaf8] p-1">
                        <StatusButton
                          active={
                            status === "draft"
                          }
                          onClick={() =>
                            setStatus("draft")
                          }
                          label="Brouillon"
                        />

                        <StatusButton
                          active={
                            status === "published"
                          }
                          onClick={() =>
                            setStatus("published")
                          }
                          label="Publié"
                        />

                        <StatusButton
                          active={
                            status === "archived"
                          }
                          onClick={() =>
                            setStatus("archived")
                          }
                          label="Archivé"
                        />
                      </div>
                    </Field>

                    <Field label="Date de publication">
                      <input
                        type="datetime-local"
                        value={publishedAt}
                        onChange={(event) =>
                          setPublishedAt(
                            event.target.value,
                          )
                        }
                        className="w-full border border-neutral-200 bg-[#fafaf8] px-3 py-3 text-xs outline-none transition focus:border-[#9b7b54]"
                      />
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
                        className="w-full border border-neutral-200 bg-[#fafaf8] px-3 py-3 text-sm outline-none transition focus:border-[#9b7b54]"
                      />
                    </Field>

                    <button
                      type="button"
                      onClick={() =>
                        setFeatured(
                          (value) => !value,
                        )
                      }
                      className={`flex w-full items-center justify-between border px-4 py-4 text-left transition ${
                        featured
                          ? "border-[#d8c6af] bg-[#faf6f0]"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center ${
                            featured
                              ? "bg-[#9b7b54] text-white"
                              : "bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          <Star
                            size={16}
                            fill={
                              featured
                                ? "currentColor"
                                : "none"
                          }
                          strokeWidth={1.4}
                        />
                        </div>

                        <div>
                          <div className="text-xs text-neutral-800">
                            Article à la une
                          </div>

                          <div className="mt-1 text-[10px] text-neutral-400">
                            Mettre en évidence
                          </div>
                        </div>
                      </div>

                      <div
                        className={`h-4 w-7 rounded-full p-[2px] transition ${
                          featured
                            ? "bg-[#9b7b54]"
                            : "bg-neutral-200"
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full bg-white transition-transform ${
                            featured
                              ? "translate-x-3"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </motion.section>

              {/* -----------------------------------------------
                  CLASSIFICATION
              ------------------------------------------------ */}

              <motion.section
                initial={{
                  opacity: 0,
                  x: 10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: 0.06,
                }}
                className="border border-neutral-200 bg-white"
              >
                <div className="p-5">
                  <SectionHeading
                    number="05"
                    eyebrow="Organisation"
                    title="Classification"
                    compact
                  />

                  <div className="space-y-5">
                    <Field label="Catégorie">
                      <input
                        value={category}
                        onChange={(event) =>
                          setCategory(
                            event.target.value,
                          )
                        }
                        placeholder="Architecture"
                        className="w-full border border-neutral-200 bg-[#fafaf8] px-3 py-3 text-sm outline-none transition placeholder:text-neutral-300 focus:border-[#9b7b54]"
                      />
                    </Field>

                    <Field label="Tags">
                      <input
                        value={tagsInput}
                        onChange={(event) =>
                          setTagsInput(
                            event.target.value,
                          )
                        }
                        placeholder="architecture, design, RDC"
                        className="w-full border border-neutral-200 bg-[#fafaf8] px-3 py-3 text-sm outline-none transition placeholder:text-neutral-300 focus:border-[#9b7b54]"
                      />

                      <p className="mt-2 text-[10px] leading-5 text-neutral-400">
                        Séparez les mots-clés par des virgules.
                      </p>

                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-[#dfd2c3] bg-[#faf6f0] px-2.5 py-1 text-[10px] text-[#8c6d4c]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Field>
                  </div>
                </div>
              </motion.section>

              {/* -----------------------------------------------
                  SUMMARY
              ------------------------------------------------ */}

              <motion.section
                initial={{
                  opacity: 0,
                  x: 10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: 0.12,
                }}
                className="border border-neutral-200 bg-[#1b1b19] p-5 text-white"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    Aperçu
                  </span>

                  <FileText
                    size={15}
                    strokeWidth={1.2}
                    className="text-[#c9aa87]"
                  />
                </div>

                <h3 className="line-clamp-3 text-xl font-light leading-7 tracking-[-0.025em]">
                  {title ||
                    "Le titre de votre article apparaîtra ici"}
                </h3>

                <p className="mt-4 line-clamp-3 text-xs leading-5 text-white/45">
                  {excerpt ||
                    "L'extrait de votre article sera visible dans cet aperçu."}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/35">
                    {category ||
                      "Sans catégorie"}
                  </span>

                  <span className="text-[9px] text-white/30">
                    {tags.length} tag
                    {tags.length > 1
                      ? "s"
                      : ""}
                  </span>
                </div>
              </motion.section>

              {/* -----------------------------------------------
                  SAVE
              ------------------------------------------------ */}

              <div className="border border-neutral-200 bg-white p-3">
                <button
                  type="submit"
                  form="article-form"
                  disabled={saving}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-[#1b1b19] text-[10px] uppercase tracking-[0.17em] text-white transition hover:bg-[#9b7b54] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving
                    ? "Création en cours..."
                    : "Créer l'article"}
                </button>

                <p className="mt-3 text-center text-[9px] leading-4 text-neutral-400">
                  Les modifications seront enregistrées
                  dans Supabase.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  number,
  eyebrow,
  title,
  compact = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 border-b border-neutral-100 ${
        compact
          ? "mb-5 pb-4"
          : "mb-7 pb-5"
      }`}
    >
      <span className="pt-0.5 text-[10px] font-medium tracking-[0.15em] text-[#9b7b54]">
        {number}
      </span>

      <div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">
          {eyebrow}
        </div>

        <h2
          className={`mt-1 font-light tracking-[-0.025em] ${
            compact
              ? "text-base"
              : "text-xl"
          }`}
        >
          {title}
        </h2>
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
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-[9px] uppercase tracking-[0.17em] text-neutral-400">
        {label}

        {required && (
          <span className="ml-1 text-[#9b7b54]">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

/* ============================================================
   STATUS BUTTON
============================================================ */

function StatusButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-2 text-[9px] uppercase tracking-[0.08em] transition ${
        active
          ? "bg-[#1b1b19] text-white"
          : "text-neutral-400 hover:bg-white hover:text-neutral-700"
      }`}
    >
      {label}
    </button>
  );
}