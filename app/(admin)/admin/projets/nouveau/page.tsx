"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  FileImage,
  FolderOpen,
  ImagePlus,
  Loader2,
  MapPin,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { getSupabaseClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

type ProjectStatus = "draft" | "published" | "archived";

type Category = {
  id: string;
  name: string;
  slug: string | null;
  description?: string | null;
};

type GalleryPreview = {
  id: string;
  file: File;
  preview: string;
};

type FormState = {
  reference: string;
  title: string;
  slug: string;
  subtitle: string;
  short_description: string;
  description: string;

  category_id: string;
  project_type: string;
  client_name: string;

  location: string;
  city: string;
  province: string;
  country: string;

  year: string;
  start_date: string;
  completion_date: string;
  deadline: string;

  surface_area: string;
  surface_unit: string;

  budget: string;
  budget_currency: string;

  progress: string;

  latitude: string;
  longitude: string;

  status: ProjectStatus;
  featured: boolean;
  display_order: string;
};

const INITIAL_FORM: FormState = {
  reference: "",
  title: "",
  slug: "",
  subtitle: "",
  short_description: "",
  description: "",

  category_id: "",
  project_type: "",
  client_name: "",

  location: "",
  city: "",
  province: "",
  country: "RDC",

  year: new Date().getFullYear().toString(),
  start_date: "",
  completion_date: "",
  deadline: "",

  surface_area: "",
  surface_unit: "m²",

  budget: "",
  budget_currency: "USD",

  progress: "0",

  latitude: "",
  longitude: "",

  status: "draft",
  featured: false,
  display_order: "0",
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  return extension || "jpg";
}

/* ============================================================
   PAGE
============================================================ */

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [gallery, setGallery] = useState<GalleryPreview[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ----------------------------------------------------------
     LOAD CATEGORIES
  ---------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setLoadingCategories(true);

      const { data, error } = await supabase
        .from("project_categories")
        .select("id, name, slug, description")
        .order("name", { ascending: true });

      if (!mounted) {
        return;
      }

      if (error) {
        setError(
          `Impossible de charger les catégories : ${error.message}`,
        );

        setLoadingCategories(false);
        return;
      }

      setCategories(data ?? []);
      setLoadingCategories(false);
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* ----------------------------------------------------------
     FORM HELPERS
  ---------------------------------------------------------- */

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugify(value),
    }));

    setError("");
    setSuccess("");
  }

  /* ----------------------------------------------------------
     COVER IMAGE
  ---------------------------------------------------------- */

  function handleCoverChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("La couverture doit être une image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "L'image de couverture ne doit pas dépasser 10 MB.",
      );
      return;
    }

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    const preview = URL.createObjectURL(file);

    setCoverImage(file);
    setCoverPreview(preview);
    setError("");
  }

  function removeCover() {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverImage(null);
    setCoverPreview(null);
  }

  /* ----------------------------------------------------------
     GALLERY
  ---------------------------------------------------------- */

  function handleGalleryChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        return false;
      }

      return true;
    });

    if (!validFiles.length) {
      setError(
        "Aucune image valide. Chaque image doit être une image de moins de 10 MB.",
      );
      return;
    }

    const previews: GalleryPreview[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setGallery((current) => [...current, ...previews]);

    setError("");
  }

  function removeGalleryImage(id: string) {
    setGallery((current) => {
      const image = current.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  /* ----------------------------------------------------------
     REFERENCE
  ---------------------------------------------------------- */

  async function generateNextReference() {
    const { data, error } = await supabase
      .from("projects")
      .select("reference")
      .like("reference", "PRJ-%")
      .order("reference", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(
        `Impossible de générer la référence : ${error.message}`,
      );
    }

    let maxNumber = 0;

    for (const project of data ?? []) {
      const match = project.reference?.match(/^PRJ-(\d+)$/i);

      if (!match) {
        continue;
      }

      const number = Number(match[1]);

      if (Number.isFinite(number)) {
        maxNumber = Math.max(maxNumber, number);
      }
    }

    return `PRJ-${String(maxNumber + 1).padStart(3, "0")}`;
  }

  /* ----------------------------------------------------------
     AUTH CHECK
  ---------------------------------------------------------- */

  async function ensureStaff() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return null;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      throw new Error(
        "Votre profil administrateur est introuvable.",
      );
    }

    if (
      !profile.is_active ||
      !["admin", "editor"].includes(profile.role)
    ) {
      router.push("/login");
      return null;
    }

    return {
      user,
      profile,
    };
  }

  /* ----------------------------------------------------------
     STORAGE
  ---------------------------------------------------------- */

  async function uploadImage(
    file: File,
    folder: string,
    projectId: string,
  ) {
    const extension = getFileExtension(file);

    const safeName = slugify(
      file.name.replace(/\.[^/.]+$/, ""),
    );

    const fileName = `${crypto.randomUUID()}-${safeName}.${extension}`;

    const path = `${folder}/${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `Échec de l'upload de "${file.name}" : ${uploadError.message}`,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    return {
      path,
      publicUrl,
    };
  }

  /* ----------------------------------------------------------
     SUBMIT
  ---------------------------------------------------------- */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    const title = form.title.trim();

    if (!title) {
      setError("Le titre du projet est obligatoire.");
      return;
    }

    if (!form.category_id) {
      setError("Veuillez sélectionner une catégorie.");
      return;
    }

    if (!form.project_type.trim()) {
      setError("Le type de projet est obligatoire.");
      return;
    }

    const progress = Number(form.progress);

    if (
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      setError(
        "La progression doit être comprise entre 0 et 100.",
      );
      return;
    }

    const surfaceArea = form.surface_area
      ? Number(form.surface_area)
      : null;

    if (
      surfaceArea !== null &&
      (!Number.isFinite(surfaceArea) || surfaceArea < 0)
    ) {
      setError("La surface doit être un nombre positif.");
      return;
    }

    const budget = form.budget
      ? Number(form.budget)
      : null;

    if (
      budget !== null &&
      (!Number.isFinite(budget) || budget < 0)
    ) {
      setError("Le budget doit être un nombre positif.");
      return;
    }

    const latitude = form.latitude
      ? Number(form.latitude)
      : null;

    const longitude = form.longitude
      ? Number(form.longitude)
      : null;

    if (
      latitude !== null &&
      (!Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90)
    ) {
      setError("La latitude doit être comprise entre -90 et 90.");
      return;
    }

    if (
      longitude !== null &&
      (!Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      setError(
        "La longitude doit être comprise entre -180 et 180.",
      );
      return;
    }

    setSaving(true);

    try {
      /* ------------------------------------------------------
         AUTH
      ------------------------------------------------------ */

      const staff = await ensureStaff();

      if (!staff) {
        return;
      }

      /* ------------------------------------------------------
         REFERENCE
      ------------------------------------------------------ */

      const reference =
        form.reference.trim() || (await generateNextReference());

      /* ------------------------------------------------------
         SLUG
      ------------------------------------------------------ */

      const slug =
        form.slug.trim() || slugify(title);

      if (!slug) {
        throw new Error(
          "Impossible de générer le slug du projet.",
        );
      }

      /* ------------------------------------------------------
         CREATE PROJECT
      ------------------------------------------------------ */

      const { data: project, error: projectError } =
        await supabase
          .from("projects")
          .insert({
            reference,
            title,
            slug,

            subtitle: form.subtitle.trim() || null,
            short_description:
              form.short_description.trim() || null,
            description: form.description.trim() || null,

            category_id: form.category_id,
            project_type: form.project_type.trim(),
            client_name: form.client_name.trim() || null,

            location: form.location.trim() || null,
            city: form.city.trim() || null,
            province: form.province.trim() || null,
            country: form.country.trim() || "RDC",

            year: form.year
              ? Number(form.year)
              : null,

            start_date:
              form.start_date || null,
            completion_date:
              form.completion_date || null,
            deadline:
              form.deadline || null,

            surface_area: surfaceArea,
            surface_unit:
              form.surface_unit.trim() || "m²",

            budget,
            budget_currency:
              form.budget_currency || "USD",

            progress,

            latitude,
            longitude,

            status: form.status,
            featured: form.featured,
            display_order: Number(
              form.display_order || 0,
            ),

            published_at:
              form.status === "published"
                ? new Date().toISOString()
                : null,
          })
          .select(
            "id, reference, title, slug, status",
          )
          .single();

      if (projectError || !project) {
        throw new Error(
          projectError?.message ||
            "Impossible de créer le projet.",
        );
      }

      /* ------------------------------------------------------
         COVER IMAGE
      ------------------------------------------------------ */

      let coverImageUrl: string | null = null;
      let coverImagePath: string | null = null;

      if (coverImage) {
        const uploaded = await uploadImage(
          coverImage,
          "covers",
          project.id,
        );

        coverImageUrl = uploaded.publicUrl;
        coverImagePath = uploaded.path;

        const { error: updateCoverError } =
          await supabase
            .from("projects")
            .update({
              cover_image_url: coverImageUrl,
              cover_image_path: coverImagePath,
            })
            .eq("id", project.id);

        if (updateCoverError) {
          throw new Error(
            `Le projet a été créé mais la couverture n'a pas pu être enregistrée : ${updateCoverError.message}`,
          );
        }
      }

      /* ------------------------------------------------------
         GALLERY
      ------------------------------------------------------ */

      if (gallery.length > 0) {
        const galleryRows: Array<{
          project_id: string;
          image_url: string;
          storage_path: string;
          title: string;
          alt_text: string;
          display_order: number;
          is_visible: boolean;
        }> = [];

        for (let index = 0; index < gallery.length; index++) {
          const item = gallery[index];

          const uploaded = await uploadImage(
            item.file,
            "gallery",
            project.id,
          );

          galleryRows.push({
            project_id: project.id,
            image_url: uploaded.publicUrl,
            storage_path: uploaded.path,
            title: item.file.name,
            alt_text: `${title} — image ${index + 1}`,
            display_order: index,
            is_visible: true,
          });
        }

        if (galleryRows.length > 0) {
          const { error: galleryError } =
            await supabase
              .from("project_gallery")
              .insert(galleryRows);

          if (galleryError) {
            throw new Error(
              `Le projet a été créé mais la galerie n'a pas pu être enregistrée : ${galleryError.message}`,
            );
          }
        }
      }

      /* ------------------------------------------------------
         ACTIVITY LOG
      ------------------------------------------------------ */

      const { error: activityError } =
        await supabase.from("activity_logs").insert({
          user_id: staff.user.id,
          action: "create",
          entity_type: "project",
          entity_id: project.id,
          title: `Projet créé : ${project.title}`,
          description: `Le projet ${project.reference} a été créé depuis l'administration.`,
          metadata: {
            reference: project.reference,
            status: project.status,
          },
        });

      /*
       * L'échec du journal d'activité ne doit pas faire croire
       * à l'utilisateur que le projet n'a pas été créé.
       */
      if (activityError) {
        console.warn(
          "Activity log error:",
          activityError.message,
        );
      }

      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      setSuccess(
        `Le projet ${project.reference} a été créé avec succès.`,
      );

      setTimeout(() => {
        router.push("/admin/projets");
        router.refresh();
      }, 700);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Une erreur inattendue est survenue.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------------------------------------
     CANCEL
  ---------------------------------------------------------- */

  function handleCancel() {
    if (saving) {
      return;
    }

    router.push("/admin/projets");
  }

  /* ----------------------------------------------------------
     COMPUTED
  ---------------------------------------------------------- */

  const progress = Math.min(
    100,
    Math.max(0, Number(form.progress) || 0),
  );

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category.id === form.category_id,
      ),
    [categories, form.category_id],
  );

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#181818]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-black/10 bg-white transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Retour aux projets"
              >
                <ArrowLeft size={18} strokeWidth={1.7} />
              </button>

              <div>
                <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-black/40">
                  <FolderOpen size={13} />
                  Administration
                </div>

                <h1 className="text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                  Nouveau projet
                </h1>

                <p className="mt-1 text-sm text-black/50">
                  Ajouter un nouveau projet à votre portfolio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="h-11 border border-black/10 bg-white px-5 text-sm transition hover:border-black/20 hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                form="new-project-form"
                disabled={saving}
                className="flex h-11 items-center gap-2 bg-[#181818] px-6 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Enregistrer le projet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        {/* ALERTS */}

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
            <CircleAlert
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-medium">
                Impossible de terminer l'opération
              </p>
              <p className="mt-1 text-red-700/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 transition hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        <form
          id="new-project-form"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* ==================================================
                LEFT COLUMN
            ================================================== */}

            <div className="space-y-6">
              {/* ------------------------------------------------
                  GENERAL INFORMATION
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-6 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Informations générales
                  </p>

                  <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                    Identité du projet
                  </h2>
                </div>

                <div className="grid gap-5 px-6 py-6">
                  {/* TITLE */}

                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Titre du projet{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="title"
                      value={form.title}
                      onChange={(event) =>
                        handleTitleChange(
                          event.target.value,
                        )
                      }
                      placeholder="Ex. Résidence M"
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      required
                    />
                  </div>

                  {/* SUBTITLE */}

                  <div>
                    <label
                      htmlFor="subtitle"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Sous-titre
                    </label>

                    <input
                      id="subtitle"
                      value={form.subtitle}
                      onChange={(event) =>
                        updateField(
                          "subtitle",
                          event.target.value,
                        )
                      }
                      placeholder="Ex. Architecture contemporaine résidentielle"
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                    />
                  </div>

                  {/* CATEGORY / TYPE */}

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="category"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Catégorie{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          id="category"
                          value={form.category_id}
                          onChange={(event) =>
                            updateField(
                              "category_id",
                              event.target.value,
                            )
                          }
                          disabled={loadingCategories}
                          className="h-12 w-full appearance-none border border-black/10 bg-white px-4 pr-10 text-sm outline-none transition focus:border-black/40 disabled:bg-black/[0.03]"
                          required
                        >
                          <option value="">
                            {loadingCategories
                              ? "Chargement..."
                              : "Sélectionner une catégorie"}
                          </option>

                          {categories.map((category) => (
                            <option
                              key={category.id}
                              value={category.id}
                            >
                              {category.name}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
                        />
                      </div>

                      {selectedCategory?.description && (
                        <p className="mt-2 text-[11px] text-black/40">
                          {selectedCategory.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="project_type"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Type de projet{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="project_type"
                        value={form.project_type}
                        onChange={(event) =>
                          updateField(
                            "project_type",
                            event.target.value,
                          )
                        }
                        placeholder="Ex. Résidentiel"
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                        required
                      />
                    </div>
                  </div>

                  {/* CLIENT */}

                  <div>
                    <label
                      htmlFor="client_name"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Client
                    </label>

                    <input
                      id="client_name"
                      value={form.client_name}
                      onChange={(event) =>
                        updateField(
                          "client_name",
                          event.target.value,
                        )
                      }
                      placeholder="Nom du client ou de l'organisation"
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                    />
                  </div>

                  {/* SHORT DESCRIPTION */}

                  <div>
                    <label
                      htmlFor="short_description"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Description courte
                    </label>

                    <textarea
                      id="short_description"
                      value={form.short_description}
                      onChange={(event) =>
                        updateField(
                          "short_description",
                          event.target.value,
                        )
                      }
                      rows={3}
                      placeholder="Une présentation courte qui pourra être affichée dans les listes de projets."
                      className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Description complète
                    </label>

                    <textarea
                      id="description"
                      value={form.description}
                      onChange={(event) =>
                        updateField(
                          "description",
                          event.target.value,
                        )
                      }
                      rows={8}
                      placeholder="Présentez le projet, ses enjeux, son concept architectural, les choix techniques, etc."
                      className="w-full resize-y border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-black/25 focus:border-black/40"
                    />
                  </div>
                </div>
              </section>

              {/* ------------------------------------------------
                  LOCATION
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-6 py-5">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={16}
                      className="text-black/40"
                    />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                        Localisation
                      </p>

                      <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                        Où se situe le projet ?
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 px-6 py-6">
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Adresse / localisation
                    </label>

                    <input
                      id="location"
                      value={form.location}
                      onChange={(event) =>
                        updateField(
                          "location",
                          event.target.value,
                        )
                      }
                      placeholder="Ex. Avenue de la Justice, Gombe"
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Ville
                      </label>

                      <input
                        id="city"
                        value={form.city}
                        onChange={(event) =>
                          updateField(
                            "city",
                            event.target.value,
                          )
                        }
                        placeholder="Kinshasa"
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="province"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Province
                      </label>

                      <input
                        id="province"
                        value={form.province}
                        onChange={(event) =>
                          updateField(
                            "province",
                            event.target.value,
                          )
                        }
                        placeholder="Kinshasa"
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Pays
                      </label>

                      <input
                        id="country"
                        value={form.country}
                        onChange={(event) =>
                          updateField(
                            "country",
                            event.target.value,
                          )
                        }
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="latitude"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Latitude
                      </label>

                      <input
                        id="latitude"
                        type="number"
                        step="any"
                        value={form.latitude}
                        onChange={(event) =>
                          updateField(
                            "latitude",
                            event.target.value,
                          )
                        }
                        placeholder="-4.3167"
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="longitude"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Longitude
                      </label>

                      <input
                        id="longitude"
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={(event) =>
                          updateField(
                            "longitude",
                            event.target.value,
                          )
                        }
                        placeholder="15.3000"
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ------------------------------------------------
                  TECHNICAL / FINANCIAL
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-6 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Données du projet
                  </p>

                  <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                    Informations techniques et financières
                  </h2>
                </div>

                <div className="grid gap-5 px-6 py-6">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor="year"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Année
                      </label>

                      <input
                        id="year"
                        type="number"
                        min="1900"
                        max="2200"
                        value={form.year}
                        onChange={(event) =>
                          updateField(
                            "year",
                            event.target.value,
                          )
                        }
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="surface_area"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Surface
                      </label>

                      <input
                        id="surface_area"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.surface_area}
                        onChange={(event) =>
                          updateField(
                            "surface_area",
                            event.target.value,
                          )
                        }
                        placeholder="320"
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="surface_unit"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Unité
                      </label>

                      <div className="relative">
                        <select
                          id="surface_unit"
                          value={form.surface_unit}
                          onChange={(event) =>
                            updateField(
                              "surface_unit",
                              event.target.value,
                            )
                          }
                          className="h-12 w-full appearance-none border border-black/10 bg-white px-4 pr-10 text-sm outline-none transition focus:border-black/40"
                        >
                          <option value="m²">
                            m²
                          </option>
                          <option value="ft²">
                            ft²
                          </option>
                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="budget"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Budget
                      </label>

                      <input
                        id="budget"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.budget}
                        onChange={(event) =>
                          updateField(
                            "budget",
                            event.target.value,
                          )
                        }
                        placeholder="150000"
                        className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="budget_currency"
                        className="mb-2 block text-xs font-medium text-black/70"
                      >
                        Devise
                      </label>

                      <div className="relative">
                        <select
                          id="budget_currency"
                          value={form.budget_currency}
                          onChange={(event) =>
                            updateField(
                              "budget_currency",
                              event.target.value,
                            )
                          }
                          className="h-12 w-full appearance-none border border-black/10 bg-white px-4 pr-10 text-sm outline-none transition focus:border-black/40"
                        >
                          <option value="USD">
                            USD — Dollar américain
                          </option>
                          <option value="CDF">
                            CDF — Franc congolais
                          </option>
                          <option value="EUR">
                            EUR — Euro
                          </option>
                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ------------------------------------------------
                  DATES
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-6 py-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={16}
                      className="text-black/40"
                    />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                        Calendrier
                      </p>

                      <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                        Dates du projet
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 px-6 py-6 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="start_date"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Début
                    </label>

                    <input
                      id="start_date"
                      type="date"
                      value={form.start_date}
                      onChange={(event) =>
                        updateField(
                          "start_date",
                          event.target.value,
                        )
                      }
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/40"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="completion_date"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Achèvement
                    </label>

                    <input
                      id="completion_date"
                      type="date"
                      value={form.completion_date}
                      onChange={(event) =>
                        updateField(
                          "completion_date",
                          event.target.value,
                        )
                      }
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/40"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="deadline"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Échéance
                    </label>

                    <input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(event) =>
                        updateField(
                          "deadline",
                          event.target.value,
                        )
                      }
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/40"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ==================================================
                RIGHT COLUMN
            ================================================== */}

            <div className="space-y-6">
              {/* ------------------------------------------------
                  COVER
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Visuel principal
                  </p>

                  <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                    Image de couverture
                  </h2>
                </div>

                <div className="p-5">
                  {coverPreview ? (
                    <div className="relative overflow-hidden bg-black/[0.03]">
                      <img
                        src={coverPreview}
                        alt="Aperçu de la couverture"
                        className="aspect-[4/3] w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={removeCover}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
                        aria-label="Supprimer la couverture"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <label className="group flex aspect-[4/3] cursor-pointer flex-col items-center justify-center border border-dashed border-black/15 bg-[#fafafa] text-center transition hover:border-black/30 hover:bg-black/[0.02]">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center border border-black/10 bg-white transition group-hover:border-black/20">
                        <ImagePlus
                          size={20}
                          strokeWidth={1.5}
                        />
                      </div>

                      <span className="text-sm font-medium">
                        Ajouter une couverture
                      </span>

                      <span className="mt-1 max-w-[230px] text-xs leading-5 text-black/40">
                        JPG, PNG ou WebP · 10 MB maximum
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {coverImage && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-black/45">
                      <FileImage size={14} />

                      <span className="truncate">
                        {coverImage.name}
                      </span>

                      <span className="shrink-0">
                        {formatFileSize(
                          coverImage.size,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* ------------------------------------------------
                  GALLERY
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Galerie
                  </p>

                  <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                    Images du projet
                  </h2>
                </div>

                <div className="p-5">
                  <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-black/15 px-4 py-4 text-sm text-black/60 transition hover:border-black/30 hover:bg-black/[0.02]">
                    <Upload size={16} />

                    Ajouter des images

                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleGalleryChange}
                      className="hidden"
                    />
                  </label>

                  {gallery.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {gallery.map((item, index) => (
                        <div
                          key={item.id}
                          className="group relative overflow-hidden border border-black/10 bg-black/[0.03]"
                        >
                          <img
                            src={item.preview}
                            alt={`Galerie ${index + 1}`}
                            className="aspect-square w-full object-cover"
                          />

                          <div className="absolute inset-x-0 bottom-0 bg-black/65 px-2 py-2 text-[10px] text-white">
                            <div className="flex items-center justify-between gap-2">
                              <span>
                                #{index + 1}
                              </span>

                              <span className="truncate opacity-70">
                                {formatFileSize(
                                  item.file.size,
                                )}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeGalleryImage(
                                item.id,
                              )
                            }
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-white text-black opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-black hover:text-white"
                            aria-label="Supprimer l'image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {gallery.length === 0 && (
                    <p className="mt-4 text-center text-xs text-black/35">
                      Aucune image supplémentaire.
                    </p>
                  )}
                </div>
              </section>

              {/* ------------------------------------------------
                  PUBLICATION
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Publication
                  </p>

                  <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                    État du projet
                  </h2>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Statut
                    </label>

                    <div className="relative">
                      <select
                        id="status"
                        value={form.status}
                        onChange={(event) =>
                          updateField(
                            "status",
                            event.target
                              .value as ProjectStatus,
                          )
                        }
                        className="h-12 w-full appearance-none border border-black/10 bg-white px-4 pr-10 text-sm outline-none transition focus:border-black/40"
                      >
                        <option value="draft">
                          Brouillon
                        </option>

                        <option value="published">
                          Publié
                        </option>

                        <option value="archived">
                          Archivé
                        </option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
                      />
                    </div>
                  </div>

                  {/* PROGRESS */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="progress"
                        className="text-xs font-medium text-black/70"
                      >
                        Progression
                      </label>

                      <span className="text-sm font-medium">
                        {progress}%
                      </span>
                    </div>

                    <input
                      id="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(event) =>
                        updateField(
                          "progress",
                          event.target.value,
                        )
                      }
                      className="w-full accent-black"
                    />

                    <div className="mt-2 h-1.5 overflow-hidden bg-black/[0.07]">
                      <div
                        className="h-full bg-[#181818] transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* FEATURED */}

                  <label className="flex cursor-pointer items-start gap-3 border border-black/[0.08] p-4 transition hover:bg-black/[0.02]">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) =>
                        updateField(
                          "featured",
                          event.target.checked,
                        )
                      }
                      className="mt-0.5 h-4 w-4 accent-black"
                    />

                    <span>
                      <span className="block text-sm font-medium">
                        Projet à la une
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-black/40">
                        Mettre ce projet en évidence sur le
                        site public.
                      </span>
                    </span>
                  </label>

                  {/* DISPLAY ORDER */}

                  <div>
                    <label
                      htmlFor="display_order"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Ordre d'affichage
                    </label>

                    <input
                      id="display_order"
                      type="number"
                      min="0"
                      value={form.display_order}
                      onChange={(event) =>
                        updateField(
                          "display_order",
                          event.target.value,
                        )
                      }
                      className="h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/40"
                    />
                  </div>
                </div>
              </section>

              {/* ------------------------------------------------
                  IDENTIFIERS
              ------------------------------------------------ */}

              <section className="border border-black/[0.08] bg-white">
                <div className="border-b border-black/[0.07] px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Référencement
                  </p>

                  <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                    Identifiants
                  </h2>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <label
                      htmlFor="reference"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Référence
                    </label>

                    <input
                      id="reference"
                      value={form.reference}
                      onChange={(event) =>
                        updateField(
                          "reference",
                          event.target.value.toUpperCase(),
                        )
                      }
                      placeholder="Automatique : PRJ-005"
                      className="h-12 w-full border border-black/10 bg-white px-4 font-mono text-sm outline-none transition placeholder:font-sans placeholder:text-black/25 focus:border-black/40"
                    />

                    <p className="mt-2 text-[11px] leading-5 text-black/40">
                      Laissez vide pour générer automatiquement
                      la prochaine référence.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="slug"
                      className="mb-2 block text-xs font-medium text-black/70"
                    >
                      Slug
                    </label>

                    <input
                      id="slug"
                      value={form.slug}
                      onChange={(event) =>
                        updateField(
                          "slug",
                          slugify(event.target.value),
                        )
                      }
                      className="h-12 w-full border border-black/10 bg-white px-4 font-mono text-sm outline-none transition focus:border-black/40"
                    />

                    <p className="mt-2 truncate text-[11px] text-black/40">
                      /projets/{form.slug || "nom-du-projet"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ==================================================
              MOBILE / BOTTOM ACTIONS
          ================================================== */}

          <div className="mt-6 flex flex-col-reverse gap-3 border border-black/[0.08] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-black/40">
              <Check size={14} />
              Les données seront enregistrées directement dans
              Supabase.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="h-11 flex-1 border border-black/10 px-5 text-sm transition hover:bg-black/[0.03] disabled:opacity-50 sm:flex-none"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex h-11 flex-1 items-center justify-center gap-2 bg-[#181818] px-6 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Créer le projet
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}