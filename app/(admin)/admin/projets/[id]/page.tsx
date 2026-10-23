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

import { motion, AnimatePresence } from "motion/react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileImage,
  FolderOpen,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
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

type GalleryImage = {
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
  display_order: number | null;
  is_visible: boolean;
  created_at: string;
};

type NewGalleryImage = {
  id: string;
  file: File;
  preview: string;
  title: string;
  caption: string;
  altText: string;
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

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(value: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
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

function dateToInput(value: string | null) {
  if (!value) return "";

  return value.slice(0, 10);
}

/* ============================================================
   PAGE
============================================================ */

export default function ProjectAdminPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = useMemo(() => {
    const value = params?.id;

    if (Array.isArray(value)) {
      return value[0] ?? "";
    }

    return value ?? "";
  }, [params]);

  const supabase = useMemo(
    () => getSupabaseClient(),
    [],
  );

  /* ==========================================================
     DATA
  ========================================================== */

  const [project, setProject] =
    useState<Project | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [gallery, setGallery] =
    useState<GalleryImage[]>([]);

  /* ==========================================================
     FORM
  ========================================================== */

  const [title, setTitle] =
    useState("");

  const [subtitle, setSubtitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [projectType, setProjectType] =
    useState("");

  const [clientName, setClientName] =
    useState("");

  const [shortDescription, setShortDescription] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [city, setCity] =
    useState("");

  const [province, setProvince] =
    useState("");

  const [country, setCountry] =
    useState("RDC");

  const [year, setYear] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [completionDate, setCompletionDate] =
    useState("");

  const [deadline, setDeadline] =
    useState("");

  const [surfaceArea, setSurfaceArea] =
    useState("");

  const [surfaceUnit, setSurfaceUnit] =
    useState("m²");

  const [budget, setBudget] =
    useState("");

  const [budgetCurrency, setBudgetCurrency] =
    useState("USD");

  const [progress, setProgress] =
    useState("0");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [status, setStatus] =
    useState<ProjectStatus>("draft");

  const [featured, setFeatured] =
    useState(false);

  const [displayOrder, setDisplayOrder] =
    useState("0");

  /* ==========================================================
     FILES
  ========================================================== */

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [coverPreview, setCoverPreview] =
    useState<string | null>(null);

  const [newGallery, setNewGallery] =
    useState<NewGalleryImage[]>([]);

  /* ==========================================================
     UI
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState<GalleryImage | null>(null);

  const [dirty, setDirty] =
    useState(false);

  /* ==========================================================
     LOAD PROJECT
  ========================================================== */

  const loadProject = useCallback(
    async () => {
      if (!projectId) {
        setError(
          "Identifiant du projet manquant.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        /* ----------------------------------------------------
           AUTH
        ---------------------------------------------------- */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        /* ----------------------------------------------------
           PROFILE
        ---------------------------------------------------- */

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, role, is_active",
          )
          .eq("id", user.id)
          .maybeSingle();

        if (
          profileError ||
          !profile ||
          !profile.is_active ||
          !["admin", "editor"].includes(
            profile.role,
          )
        ) {
          router.replace("/login");
          return;
        }

        /* ----------------------------------------------------
           PROJECT
        ---------------------------------------------------- */

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
            updated_at
          `)
          .eq("id", projectId)
          .maybeSingle();

        if (projectError) {
          throw projectError;
        }

        if (!projectData) {
          setError(
            "Projet introuvable.",
          );
          return;
        }

        const loadedProject =
          projectData as Project;

        setProject(
          loadedProject,
        );

        /* ----------------------------------------------------
           FILL FORM
        ---------------------------------------------------- */

        setTitle(
          loadedProject.title ?? "",
        );

        setSubtitle(
          loadedProject.subtitle ?? "",
        );

        setSlug(
          loadedProject.slug ?? "",
        );

        setCategoryId(
          loadedProject.category_id ??
            "",
        );

        setProjectType(
          loadedProject.project_type ??
            "",
        );

        setClientName(
          loadedProject.client_name ??
            "",
        );

        setShortDescription(
          loadedProject.short_description ??
            "",
        );

        setDescription(
          loadedProject.description ??
            "",
        );

        setLocation(
          loadedProject.location ?? "",
        );

        setCity(
          loadedProject.city ?? "",
        );

        setProvince(
          loadedProject.province ??
            "",
        );

        setCountry(
          loadedProject.country ??
            "RDC",
        );

        setYear(
          loadedProject.year
            ? String(
                loadedProject.year,
              )
            : "",
        );

        setStartDate(
          dateToInput(
            loadedProject.start_date,
          ),
        );

        setCompletionDate(
          dateToInput(
            loadedProject.completion_date,
          ),
        );

        setDeadline(
          dateToInput(
            loadedProject.deadline,
          ),
        );

        setSurfaceArea(
          loadedProject.surface_area !==
          null
            ? String(
                loadedProject.surface_area,
              )
            : "",
        );

        setSurfaceUnit(
          loadedProject.surface_unit ??
            "m²",
        );

        setBudget(
          loadedProject.budget !==
          null
            ? String(
                loadedProject.budget,
              )
            : "",
        );

        setBudgetCurrency(
          loadedProject.budget_currency ??
            "USD",
        );

        setProgress(
          String(
            loadedProject.progress ??
              0,
          ),
        );

        setLatitude(
          loadedProject.latitude !==
          null
            ? String(
                loadedProject.latitude,
              )
            : "",
        );

        setLongitude(
          loadedProject.longitude !==
          null
            ? String(
                loadedProject.longitude,
              )
            : "",
        );

        setStatus(
          loadedProject.status,
        );

        setFeatured(
          loadedProject.featured,
        );

        setDisplayOrder(
          String(
            loadedProject.display_order ??
              0,
          ),
        );

        setCoverPreview(
          loadedProject.cover_image_url ??
            null,
        );

        /* ----------------------------------------------------
           CATEGORIES
        ---------------------------------------------------- */

        const {
          data: categoryData,
        } = await supabase
          .from("project_categories")
          .select("id, name")
          .order("name", {
            ascending: true,
          });

        setCategories(
          (categoryData ??
            []) as Category[],
        );

        /* ----------------------------------------------------
           GALLERY
        ---------------------------------------------------- */

        const {
          data: galleryData,
          error: galleryError,
        } = await supabase
          .from("project_gallery")
          .select(`
            id,
            project_id,
            image_url,
            storage_path,
            title,
            caption,
            alt_text,
            image_type,
            width,
            height,
            display_order,
            is_visible,
            created_at
          `)
          .eq(
            "project_id",
            projectId,
          )
          .order("display_order", {
            ascending: true,
          });

        if (galleryError) {
          console.warn(
            galleryError,
          );
        }

        setGallery(
          (galleryData ??
            []) as GalleryImage[],
        );

        setDirty(false);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le projet.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      projectId,
      router,
      supabase,
    ],
  );

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  /* ==========================================================
     TITLE -> SLUG
  ========================================================== */

  const handleTitleChange = (
    value: string,
  ) => {
    setTitle(value);
    setDirty(true);

    if (
      !slug ||
      slug ===
        slugify(
          project?.title ?? "",
        )
    ) {
      setSlug(
        slugify(value),
      );
    }
  };

  /* ==========================================================
     COVER
  ========================================================== */

  const handleCoverChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Le fichier de couverture doit être une image.",
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "L'image de couverture ne doit pas dépasser 10 Mo.",
      );
      return;
    }

    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    const preview =
      URL.createObjectURL(file);

    setCoverFile(file);
    setCoverPreview(preview);
    setDirty(true);
    setError(null);
  };

  /* ==========================================================
     GALLERY FILES
  ========================================================== */

  const handleGalleryChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (files.length === 0) return;

    const validFiles =
      files.filter((file) => {
        if (
          !file.type.startsWith(
            "image/",
          )
        ) {
          return false;
        }

        if (
          file.size >
          10 * 1024 * 1024
        ) {
          return false;
        }

        return true;
      });

    const entries =
      validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview:
          URL.createObjectURL(
            file,
          ),
        title: "",
        caption: "",
        altText: title,
      }));

    setNewGallery((current) => [
      ...current,
      ...entries,
    ]);

    setDirty(true);

    event.target.value = "";
  };

  /* ==========================================================
     REMOVE NEW GALLERY IMAGE
  ========================================================== */

  const removeNewGalleryImage = (
    id: string,
  ) => {
    setNewGallery((current) => {
      const item = current.find(
        (image) =>
          image.id === id,
      );

      if (item) {
        URL.revokeObjectURL(
          item.preview,
        );
      }

      return current.filter(
        (image) =>
          image.id !== id,
      );
    });

    setDirty(true);
  };

  /* ==========================================================
     UPDATE NEW GALLERY META
  ========================================================== */

  const updateNewGalleryImage = (
    id: string,
    field:
      | "title"
      | "caption"
      | "altText",
    value: string,
  ) => {
    setNewGallery((current) =>
      current.map((image) =>
        image.id === id
          ? {
              ...image,
              [field]: value,
            }
          : image,
      ),
    );

    setDirty(true);
  };

  /* ==========================================================
     DELETE EXISTING GALLERY IMAGE
  ========================================================== */

  const deleteGalleryImage = async (
    image: GalleryImage,
  ) => {
    const confirmed =
      window.confirm(
        "Supprimer cette image de la galerie ?",
      );

    if (!confirmed) return;

    try {
      setError(null);

      if (image.storage_path) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("project-images")
          .remove([
            image.storage_path,
          ]);

        if (storageError) {
          console.warn(
            storageError,
          );
        }
      }

      const {
        error: deleteError,
      } = await supabase
        .from("project_gallery")
        .delete()
        .eq(
          "id",
          image.id,
        );

      if (deleteError) {
        throw deleteError;
      }

      setGallery((current) =>
        current.filter(
          (item) =>
            item.id !==
            image.id,
        ),
      );

      setSuccess(
        "Image supprimée.",
      );

      setDirty(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cette image.",
      );
    }
  };

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!project) return;

    if (!title.trim()) {
      setError(
        "Le titre du projet est obligatoire.",
      );
      return;
    }

    if (!slug.trim()) {
      setError(
        "Le slug du projet est obligatoire.",
      );
      return;
    }

    const parsedProgress =
      Number(progress);

    if (
      Number.isNaN(
        parsedProgress,
      ) ||
      parsedProgress < 0 ||
      parsedProgress > 100
    ) {
      setError(
        "La progression doit être comprise entre 0 et 100.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      /* ------------------------------------------------------
         AUTH
      ------------------------------------------------------ */

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      /* ------------------------------------------------------
         CHECK SLUG
      ------------------------------------------------------ */

      const {
        data: existingSlug,
      } = await supabase
        .from("projects")
        .select("id")
        .eq(
          "slug",
          slug.trim(),
        )
        .neq(
          "id",
          project.id,
        )
        .maybeSingle();

      if (existingSlug) {
        setError(
          "Ce slug est déjà utilisé par un autre projet.",
        );
        return;
      }

      /* ------------------------------------------------------
         COVER UPLOAD
      ------------------------------------------------------ */

      let newCoverUrl =
        project.cover_image_url;

      let newCoverPath =
        project.cover_image_path;

      let uploadedCoverPath:
        | string
        | null = null;

      if (coverFile) {
        const extension =
          coverFile.name
            .split(".")
            .pop()
            ?.toLowerCase() ??
          "jpg";

        const path = `projects/${project.id}/cover-${Date.now()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("project-images")
          .upload(
            path,
            coverFile,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                coverFile.type,
            },
          );

        if (uploadError) {
          throw uploadError;
        }

        uploadedCoverPath =
          path;

        const {
          data: publicData,
        } =
          supabase.storage
            .from(
              "project-images",
            )
            .getPublicUrl(
              path,
            );

        newCoverUrl =
          publicData.publicUrl;

        newCoverPath =
          path;
      }

      /* ------------------------------------------------------
         PUBLISHED DATE
      ------------------------------------------------------ */

      let publishedAt =
        project.published_at;

      if (
        status === "published" &&
        !publishedAt
      ) {
        publishedAt =
          new Date().toISOString();
      }

      if (
        status !== "published"
      ) {
        publishedAt = null;
      }

      /* ------------------------------------------------------
         UPDATE PROJECT
      ------------------------------------------------------ */

      const {
        data: updatedProject,
        error: updateError,
      } = await supabase
        .from("projects")
        .update({
          title:
            title.trim(),
          slug:
            slug.trim(),
          subtitle:
            subtitle.trim() ||
            null,
          category_id:
            categoryId ||
            null,
          short_description:
            shortDescription.trim() ||
            null,
          description:
            description.trim() ||
            null,
          project_type:
            projectType.trim() ||
            null,
          client_name:
            clientName.trim() ||
            null,
          location:
            location.trim() ||
            null,
          city:
            city.trim() ||
            null,
          province:
            province.trim() ||
            null,
          country:
            country.trim() ||
            null,
          year: year
            ? Number(year)
            : null,
          start_date:
            startDate ||
            null,
          completion_date:
            completionDate ||
            null,
          deadline:
            deadline ||
            null,
          surface_area:
            surfaceArea
              ? Number(
                  surfaceArea,
                )
              : null,
          surface_unit:
            surfaceUnit.trim() ||
            null,
          budget:
            budget
              ? Number(budget)
              : null,
          budget_currency:
            budgetCurrency.trim() ||
            null,
          progress:
            parsedProgress,
          latitude:
            latitude
              ? Number(
                  latitude,
                )
              : null,
          longitude:
            longitude
              ? Number(
                  longitude,
                )
              : null,
          cover_image_url:
            newCoverUrl,
          cover_image_path:
            newCoverPath,
          status,
          featured,
          display_order:
            displayOrder
              ? Number(
                  displayOrder,
                )
              : 0,
          published_at:
            publishedAt,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          project.id,
        )
        .select()
        .single();

      if (updateError) {
        if (
          uploadedCoverPath
        ) {
          await supabase.storage
            .from(
              "project-images",
            )
            .remove([
              uploadedCoverPath,
            ]);
        }

        throw updateError;
      }

      /* ------------------------------------------------------
         REMOVE OLD COVER
      ------------------------------------------------------ */

      if (
        coverFile &&
        project.cover_image_path &&
        project.cover_image_path !==
          newCoverPath
      ) {
        await supabase.storage
          .from(
            "project-images",
          )
          .remove([
            project.cover_image_path,
          ]);
      }

      /* ------------------------------------------------------
         NEW GALLERY
      ------------------------------------------------------ */

      const uploadedGalleryPaths: string[] =
        [];

      for (
        let index = 0;
        index <
        newGallery.length;
        index++
      ) {
        const image =
          newGallery[index];

        const extension =
          image.file.name
            .split(".")
            .pop()
            ?.toLowerCase() ??
          "jpg";

        const path = `projects/${project.id}/gallery-${Date.now()}-${index}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("project-images")
          .upload(
            path,
            image.file,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                image.file.type,
            },
          );

        if (uploadError) {
          throw uploadError;
        }

        uploadedGalleryPaths.push(
          path,
        );

        const {
          data: publicData,
        } =
          supabase.storage
            .from(
              "project-images",
            )
            .getPublicUrl(
              path,
            );

        const {
          error: galleryError,
        } = await supabase
          .from("project_gallery")
          .insert({
            project_id:
              project.id,
            image_url:
              publicData.publicUrl,
            storage_path:
              path,
            title:
              image.title.trim() ||
              null,
            caption:
              image.caption.trim() ||
              null,
            alt_text:
              image.altText.trim() ||
              title.trim(),
            image_type:
              "gallery",
            display_order:
              gallery.length +
              index,
            is_visible:
              true,
          });

        if (galleryError) {
          throw galleryError;
        }
      }

      /* ------------------------------------------------------
         ACTIVITY LOG
      ------------------------------------------------------ */

      await supabase
        .from("activity_logs")
        .insert({
          user_id: user.id,
          action: "updated",
          entity_type: "project",
          entity_id: project.id,
          title: `Projet modifié : ${title.trim()}`,
          description: `Mise à jour du projet ${project.reference ?? ""}`,
          metadata: {
            reference:
              project.reference,
            status,
            progress:
              parsedProgress,
          },
        });

      /* ------------------------------------------------------
         CLEANUP NEW PREVIEWS
      ------------------------------------------------------ */

      newGallery.forEach(
        (image) => {
          URL.revokeObjectURL(
            image.preview,
          );
        },
      );

      setNewGallery([]);
      setCoverFile(null);

      setProject(
        (updatedProject ??
          project) as Project,
      );

      setCoverPreview(
        newCoverUrl,
      );

      setSuccess(
        "Les modifications ont été enregistrées.",
      );

      setDirty(false);

      await loadProject();
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
  };

  /* ==========================================================
     DELETE PROJECT
  ========================================================== */

  const handleDelete = async () => {
    if (!project) return;

    try {
      setDeleting(true);
      setError(null);

      const galleryPaths =
        gallery
          .map(
            (image) =>
              image.storage_path,
          )
          .filter(
            (
              path,
            ): path is string =>
              Boolean(path),
          );

      if (
        galleryPaths.length > 0
      ) {
        await supabase.storage
          .from("project-images")
          .remove(
            galleryPaths,
          );
      }

      if (
        project.cover_image_path
      ) {
        await supabase.storage
          .from("project-images")
          .remove([
            project.cover_image_path,
          ]);
      }

      const {
        error: deleteError,
      } = await supabase
        .from("projects")
        .delete()
        .eq(
          "id",
          project.id,
        );

      if (deleteError) {
        throw deleteError;
      }

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("activity_logs")
          .insert({
            user_id: user.id,
            action: "deleted",
            entity_type: "project",
            entity_id: project.id,
            title: `Projet supprimé : ${project.title}`,
            description: `Suppression du projet ${project.reference ?? ""}`,
            metadata: {
              reference:
                project.reference,
              title:
                project.title,
            },
          });
      }

      router.replace(
        "/admin/projets",
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le projet.",
      );

      setDeleting(false);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f7f4]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2
              size={23}
              strokeWidth={1.3}
              className="animate-spin text-[#9b7b54]"
            />

            <p className="mt-4 text-[9px] uppercase tracking-[0.3em] text-[#8f8b84]">
              Chargement du projet
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     NOT FOUND
  ========================================================== */

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f8f7f4]">
        <div className="px-6 py-12 lg:px-12">
          <Link
            href="/admin/projets"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#77736c]"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.4}
            />

            Retour aux projets
          </Link>

          <div className="flex min-h-[60vh] items-center justify-center text-center">
            <div>
              <FolderOpen
                size={32}
                strokeWidth={1.1}
                className="mx-auto text-[#aaa69f]"
              />

              <h1 className="mt-6 text-3xl font-light">
                Projet introuvable
              </h1>

              <p className="mt-3 text-sm text-[#77736c]">
                {error ??
                  "Ce projet n'existe pas."}
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
      <form
        onSubmit={handleSubmit}
        className="px-6 py-10 lg:px-12 lg:py-12"
      >
        {/* ======================================================
           HEADER
        ====================================================== */}

        <motion.header
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="border-b border-[#e4e1db] pb-7"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Link
                href="/admin/projets"
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#77736c] transition hover:text-[#292824]"
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.4}
                />

                Tous les projets
              </Link>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
                  {project.reference ??
                    "Projet"}
                </p>

                <span className="h-1 w-1 rounded-full bg-[#c5b9a8]" />

                <span
                  className={`border px-2.5 py-1 text-[8px] uppercase tracking-[0.15em] ${getStatusClasses(
                    status,
                  )}`}
                >
                  {getStatusLabel(
                    status,
                  )}
                </span>

                {dirty && (
                  <span className="text-[9px] uppercase tracking-[0.14em] text-[#a56759]">
                    Modifications non
                    enregistrées
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-4xl font-light tracking-[-0.045em] sm:text-5xl">
                {title ||
                  "Projet sans titre"}
              </h1>

              <p className="mt-3 text-sm text-[#77736c]">
                Modification directe du
                projet.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(
                    true,
                  )
                }
                className="inline-flex h-11 items-center gap-2 border border-[#ead8d3] bg-[#fff9f7] px-4 text-[10px] uppercase tracking-[0.16em] text-[#8d574d] transition hover:bg-[#fff3ef]"
              >
                <Trash2
                  size={14}
                  strokeWidth={1.4}
                />

                Supprimer
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 bg-[#292824] px-6 text-[10px] uppercase tracking-[0.17em] text-white transition hover:bg-[#3b3934] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={14}
                      strokeWidth={1.5}
                      className="animate-spin"
                    />

                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save
                      size={14}
                      strokeWidth={1.4}
                    />

                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.header>

        {/* ======================================================
           ALERTS
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
              className="overflow-hidden"
            >
              <div className="mt-6 flex items-start gap-3 border border-[#ead8d3] bg-[#fff8f6] px-5 py-4">
                <CircleAlert
                  size={17}
                  strokeWidth={1.4}
                  className="mt-0.5 text-[#a56759]"
                />

                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8d574d]">
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
                >
                  <X
                    size={16}
                    strokeWidth={1.4}
                    className="text-[#9b827c]"
                  />
                </button>
              </div>
            </motion.div>
          )}

          {success && (
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
              <div className="mt-6 flex items-center gap-3 border border-[#d8e7dc] bg-[#f2f8f3] px-5 py-4 text-[#4f765b]">
                <Check
                  size={17}
                  strokeWidth={1.5}
                />

                <p className="text-sm">
                  {success}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSuccess(null)
                  }
                  className="ml-auto"
                >
                  <X
                    size={15}
                    strokeWidth={1.4}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================
           MAIN GRID
        ====================================================== */}

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_350px]">
          {/* ====================================================
             LEFT
          ==================================================== */}

          <div className="space-y-8">
            {/* --------------------------------------------------
               GENERAL INFORMATION
            -------------------------------------------------- */}

            <AdminCard>
              <SectionTitle
                eyebrow="01"
                title="Informations générales"
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Titre"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Ex. Résidence M"
                />

                <Field
                  label="Sous-titre"
                  value={subtitle}
                  onChange={(value) => {
                    setSubtitle(value);
                    setDirty(true);
                  }}
                  placeholder="Ex. Résidence contemporaine"
                />

                <Field
                  label="Slug"
                  value={slug}
                  onChange={(value) => {
                    setSlug(
                      slugify(value),
                    );
                    setDirty(true);
                  }}
                  placeholder="residence-m"
                />

                <SelectField
                  label="Catégorie"
                  value={categoryId}
                  onChange={(value) => {
                    setCategoryId(value);
                    setDirty(true);
                  }}
                  options={[
                    {
                      value: "",
                      label:
                        "Aucune catégorie",
                    },
                    ...categories.map(
                      (category) => ({
                        value:
                          category.id,
                        label:
                          category.name,
                      }),
                    ),
                  ]}
                />

                <SelectField
                  label="Type de projet"
                  value={projectType}
                  onChange={(value) => {
                    setProjectType(value);
                    setDirty(true);
                  }}
                  options={[
                    {
                      value: "",
                      label:
                        "Sélectionner",
                    },
                    {
                      value:
                        "residential",
                      label:
                        "Résidentiel",
                    },
                    {
                      value:
                        "institutional",
                      label:
                        "Institutionnel",
                    },
                    {
                      value:
                        "commercial",
                      label:
                        "Commercial",
                    },
                    {
                      value:
                        "industrial",
                      label:
                        "Industriel",
                    },
                    {
                      value:
                        "cultural",
                      label:
                        "Culturel",
                    },
                    {
                      value: "other",
                      label:
                        "Autre",
                    },
                  ]}
                />

                <Field
                  label="Client"
                  value={clientName}
                  onChange={(value) => {
                    setClientName(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="Nom du client"
                />
              </div>

              <div className="mt-5">
                <TextArea
                  label="Résumé court"
                  value={
                    shortDescription
                  }
                  onChange={(value) => {
                    setShortDescription(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="Présentation courte du projet..."
                  rows={3}
                />
              </div>

              <div className="mt-5">
                <TextArea
                  label="Description complète"
                  value={description}
                  onChange={(value) => {
                    setDescription(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="Décrivez le projet, sa conception, ses intentions architecturales..."
                  rows={8}
                />
              </div>
            </AdminCard>

            {/* --------------------------------------------------
               LOCATION
            -------------------------------------------------- */}

            <AdminCard>
              <SectionTitle
                eyebrow="02"
                title="Localisation"
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Adresse / localisation"
                  value={location}
                  onChange={(value) => {
                    setLocation(value);
                    setDirty(true);
                  }}
                  placeholder="Quartier, avenue..."
                />

                <Field
                  label="Ville"
                  value={city}
                  onChange={(value) => {
                    setCity(value);
                    setDirty(true);
                  }}
                  placeholder="Kinshasa"
                />

                <Field
                  label="Province"
                  value={province}
                  onChange={(value) => {
                    setProvince(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="Kinshasa"
                />

                <Field
                  label="Pays"
                  value={country}
                  onChange={(value) => {
                    setCountry(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="RDC"
                />

                <Field
                  label="Latitude"
                  value={latitude}
                  onChange={(value) => {
                    setLatitude(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="-4.3167"
                />

                <Field
                  label="Longitude"
                  value={longitude}
                  onChange={(value) => {
                    setLongitude(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="15.3000"
                />
              </div>

              <div className="mt-6 flex items-start gap-3 border border-[#e8e4dd] bg-[#faf9f7] p-4">
                <MapPin
                  size={16}
                  strokeWidth={1.3}
                  className="mt-0.5 text-[#9b7b54]"
                />

                <p className="text-xs leading-5 text-[#77736c]">
                  Les coordonnées peuvent
                  être utilisées plus tard
                  pour afficher le projet sur
                  une carte publique.
                </p>
              </div>
            </AdminCard>

            {/* --------------------------------------------------
               PLANNING
            -------------------------------------------------- */}

            <AdminCard>
              <SectionTitle
                eyebrow="03"
                title="Planning & avancement"
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Année"
                  type="number"
                  value={year}
                  onChange={(value) => {
                    setYear(value);
                    setDirty(true);
                  }}
                  placeholder="2026"
                />

                <Field
                  label="Début"
                  type="date"
                  value={startDate}
                  onChange={(value) => {
                    setStartDate(
                      value,
                    );
                    setDirty(true);
                  }}
                />

                <Field
                  label="Échéance"
                  type="date"
                  value={deadline}
                  onChange={(value) => {
                    setDeadline(
                      value,
                    );
                    setDirty(true);
                  }}
                />

                <Field
                  label="Achèvement"
                  type="date"
                  value={completionDate}
                  onChange={(value) => {
                    setCompletionDate(
                      value,
                    );
                    setDirty(true);
                  }}
                />
              </div>

              <div className="mt-7 border-t border-[#eeeae4] pt-7">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-[#77736c]">
                    Avancement
                  </label>

                  <span className="text-2xl font-light text-[#9b7b54]">
                    {progress}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(event) => {
                    setProgress(
                      event.target.value,
                    );
                    setDirty(true);
                  }}
                  className="mt-5 w-full accent-[#9b7b54]"
                />

                <div className="mt-2 flex justify-between text-[8px] uppercase tracking-[0.15em] text-[#aaa69f]">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </AdminCard>

            {/* --------------------------------------------------
               BUDGET / SURFACE
            -------------------------------------------------- */}

            <AdminCard>
              <SectionTitle
                eyebrow="04"
                title="Données techniques"
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Surface"
                  type="number"
                  value={surfaceArea}
                  onChange={(value) => {
                    setSurfaceArea(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="320"
                />

                <SelectField
                  label="Unité"
                  value={surfaceUnit}
                  onChange={(value) => {
                    setSurfaceUnit(
                      value,
                    );
                    setDirty(true);
                  }}
                  options={[
                    {
                      value: "m²",
                      label: "m²",
                    },
                    {
                      value: "ft²",
                      label: "ft²",
                    },
                  ]}
                />

                <Field
                  label="Budget"
                  type="number"
                  value={budget}
                  onChange={(value) => {
                    setBudget(value);
                    setDirty(true);
                  }}
                  placeholder="150000"
                />

                <SelectField
                  label="Devise"
                  value={
                    budgetCurrency
                  }
                  onChange={(value) => {
                    setBudgetCurrency(
                      value,
                    );
                    setDirty(true);
                  }}
                  options={[
                    {
                      value: "USD",
                      label: "USD",
                    },
                    {
                      value: "CDF",
                      label: "CDF",
                    },
                    {
                      value: "EUR",
                      label: "EUR",
                    },
                  ]}
                />
              </div>
            </AdminCard>

            {/* --------------------------------------------------
               COVER
            -------------------------------------------------- */}

            <AdminCard>
              <SectionTitle
                eyebrow="05"
                title="Image de couverture"
              />

              <div className="mt-7">
                <label
                  htmlFor="cover-upload"
                  className="group relative block cursor-pointer overflow-hidden border border-[#dedbd4] bg-[#eeece7]"
                >
                  <div className="aspect-[16/7]">
                    {coverPreview ? (
                      <img
                        src={
                          coverPreview
                        }
                        alt={title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center">
                        <ImagePlus
                          size={28}
                          strokeWidth={1.2}
                          className="text-[#aaa69f]"
                        />

                        <p className="mt-4 text-[9px] uppercase tracking-[0.22em] text-[#96928b]">
                          Ajouter une couverture
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                    <span className="inline-flex items-center gap-2 bg-white px-4 py-2 text-[9px] uppercase tracking-[0.16em] text-[#45423d] opacity-0 transition group-hover:opacity-100">
                      <Upload
                        size={13}
                        strokeWidth={1.4}
                      />

                      Remplacer
                    </span>
                  </div>

                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleCoverChange
                    }
                    className="hidden"
                  />
                </label>

                <p className="mt-3 text-[9px] text-[#aaa69f]">
                  JPG, PNG ou WebP ·
                  maximum 10 Mo
                </p>
              </div>
            </AdminCard>

            {/* --------------------------------------------------
               GALLERY
            -------------------------------------------------- */}

            <AdminCard>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <SectionTitle
                  eyebrow="06"
                  title="Galerie"
                />

                <label
                  htmlFor="gallery-upload"
                  className="inline-flex h-10 cursor-pointer items-center gap-2 border border-[#dedbd4] bg-white px-4 text-[9px] uppercase tracking-[0.17em] text-[#66625b] transition hover:bg-[#faf9f7]"
                >
                  <ImagePlus
                    size={14}
                    strokeWidth={1.4}
                  />

                  Ajouter des images

                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleGalleryChange
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* EXISTING */}

              {gallery.length > 0 && (
                <div className="mt-7">
                  <p className="mb-4 text-[9px] uppercase tracking-[0.18em] text-[#aaa69f]">
                    Images existantes
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map(
                      (
                        image,
                        index,
                      ) => (
                        <div
                          key={
                            image.id
                          }
                          className="group relative overflow-hidden bg-[#eeece7]"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImage(
                                image,
                              )
                            }
                            className="block aspect-[4/3] w-full"
                          >
                            <img
                              src={
                                image.image_url
                              }
                              alt={
                                image.alt_text ??
                                title
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteGalleryImage(
                                image,
                              )
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/95 text-[#9a7d74] opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-[#fff5f2] hover:text-[#8d574d]"
                            title="Supprimer"
                          >
                            <Trash2
                              size={13}
                              strokeWidth={
                                1.4
                              }
                            />
                          </button>

                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2 pt-7 pointer-events-none">
                            <p className="text-[9px] text-white">
                              {image.title ??
                                `Image ${
                                  index +
                                  1
                                }`}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* NEW */}

              {newGallery.length >
                0 && (
                <div className="mt-8 border-t border-[#eeeae4] pt-7">
                  <p className="mb-4 text-[9px] uppercase tracking-[0.18em] text-[#9b7b54]">
                    Nouvelles images
                  </p>

                  <div className="space-y-4">
                    {newGallery.map(
                      (
                        image,
                        index,
                      ) => (
                        <div
                          key={
                            image.id
                          }
                          className="grid gap-5 border border-[#e5e1da] bg-[#faf9f7] p-4 sm:grid-cols-[180px_1fr]"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e7e2]">
                            <img
                              src={
                                image.preview
                              }
                              alt={
                                image.altText ||
                                title
                              }
                              className="h-full w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeNewGalleryImage(
                                  image.id,
                                )
                              }
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/95 text-[#9a7d74]"
                            >
                              <X
                                size={14}
                                strokeWidth={
                                  1.4
                                }
                              />
                            </button>
                          </div>

                          <div>
                            <p className="text-[9px] uppercase tracking-[0.17em] text-[#aaa69f]">
                              Nouvelle image{" "}
                              {index +
                                1}
                            </p>

                            <div className="mt-4 grid gap-3">
                              <Field
                                label="Titre"
                                value={
                                  image.title
                                }
                                onChange={(
                                  value,
                                ) =>
                                  updateNewGalleryImage(
                                    image.id,
                                    "title",
                                    value,
                                  )
                                }
                                placeholder="Vue extérieure"
                              />

                              <Field
                                label="Texte alternatif"
                                value={
                                  image.altText
                                }
                                onChange={(
                                  value,
                                ) =>
                                  updateNewGalleryImage(
                                    image.id,
                                    "altText",
                                    value,
                                  )
                                }
                                placeholder="Description de l'image"
                              />

                              <TextArea
                                label="Légende"
                                value={
                                  image.caption
                                }
                                onChange={(
                                  value,
                                ) =>
                                  updateNewGalleryImage(
                                    image.id,
                                    "caption",
                                    value,
                                  )
                                }
                                placeholder="Légende facultative..."
                                rows={
                                  2
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {gallery.length === 0 &&
                newGallery.length ===
                  0 && (
                  <div className="mt-7 border border-dashed border-[#ddd9d1] bg-[#faf9f7] px-6 py-14 text-center">
                    <ImageIcon
                      size={25}
                      strokeWidth={1.2}
                      className="mx-auto text-[#aaa69f]"
                    />

                    <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-[#99958e]">
                      Galerie vide
                    </p>

                    <p className="mt-2 text-xs text-[#aaa69f]">
                      Ajoutez les images
                      complémentaires du
                      projet.
                    </p>
                  </div>
                )}
            </AdminCard>
          </div>

          {/* ====================================================
             SIDEBAR
          ==================================================== */}

          <aside className="space-y-6">
            {/* --------------------------------------------------
               PUBLICATION
            -------------------------------------------------- */}

            <AdminCard>
              <SectionTitle
                eyebrow="Publication"
                title="Visibilité"
              />

              <div className="mt-6">
                <SelectField
                  label="Statut"
                  value={status}
                  onChange={(value) => {
                    setStatus(
                      value as ProjectStatus,
                    );
                    setDirty(true);
                  }}
                  options={[
                    {
                      value:
                        "draft",
                      label:
                        "Brouillon",
                    },
                    {
                      value:
                        "published",
                      label:
                        "Publié",
                    },
                    {
                      value:
                        "archived",
                      label:
                        "Archivé",
                    },
                  ]}
                />
              </div>

              <div className="mt-5 border-t border-[#eeeae4] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setFeatured(
                      (value) =>
                        !value,
                    );
                    setDirty(true);
                  }}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center ${
                        featured
                          ? "bg-[#fcf8f0] text-[#9b7b54]"
                          : "bg-[#f3f2ef] text-[#aaa69f]"
                      }`}
                    >
                      <Star
                        size={15}
                        fill={
                          featured
                            ? "currentColor"
                            : "none"
                        }
                        strokeWidth={
                          1.2
                        }
                      />
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-[#45423d]">
                        Projet à la une
                      </p>

                      <p className="mt-1 text-[9px] text-[#aaa69f]">
                        Afficher dans les
                        projets mis en avant
                      </p>
                    </div>
                  </div>

                  <div
                    className={`relative h-5 w-9 rounded-full transition ${
                      featured
                        ? "bg-[#9b7b54]"
                        : "bg-[#d8d5ce]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${
                        featured
                          ? "left-5"
                          : "left-1"
                      }`}
                    />
                  </div>
                </button>
              </div>

              <div className="mt-5">
                <Field
                  label="Ordre d'affichage"
                  type="number"
                  value={
                    displayOrder
                  }
                  onChange={(value) => {
                    setDisplayOrder(
                      value,
                    );
                    setDirty(true);
                  }}
                  placeholder="0"
                />
              </div>
            </AdminCard>

            {/* --------------------------------------------------
               REFERENCE
            -------------------------------------------------- */}

            <AdminCard>
              <SectionTitle
                eyebrow="Référence"
                title="Identité"
              />

              <div className="mt-6 space-y-4">
                <ReadonlyItem
                  label="Référence"
                  value={
                    project.reference ??
                    "—"
                  }
                />

                <ReadonlyItem
                  label="Identifiant"
                  value={
                    project.id
                  }
                  mono
                />

                <ReadonlyItem
                  label="Créé le"
                  value={formatDate(
                    project.created_at,
                  )}
                />

                <ReadonlyItem
                  label="Modifié le"
                  value={formatDate(
                    project.updated_at,
                  )}
                />
              </div>
            </AdminCard>

            {/* --------------------------------------------------
               SAVE REMINDER
            -------------------------------------------------- */}

            <div className="border border-[#e4e1db] bg-[#faf9f7] p-6">
              <div className="flex items-start gap-3">
                <Save
                  size={17}
                  strokeWidth={1.3}
                  className="mt-0.5 text-[#9b7b54]"
                />

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#9b7b54]">
                    Enregistrement
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#77736c]">
                    Toutes les modifications
                    effectuées sur cette page
                    sont enregistrées avec le
                    bouton principal.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>

      {/* ========================================================
         IMAGE LIGHTBOX
      ======================================================== */}

      <AnimatePresence>
        {selectedImage && (
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#292824]/80 p-5 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedImage(
                  null,
                );
              }
            }}
          >
            <button
              type="button"
              onClick={() =>
                setSelectedImage(
                  null,
                )
              }
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/20 text-white"
            >
              <X
                size={18}
                strokeWidth={1.4}
              />
            </button>

            <img
              src={
                selectedImage.image_url
              }
              alt={
                selectedImage.alt_text ??
                title
              }
              className="max-h-[88vh] max-w-[90vw] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
         DELETE MODAL
      ======================================================== */}

      <AnimatePresence>
        {showDeleteModal && (
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#292824]/30 px-5 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowDeleteModal(
                  false,
                );
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
                    setShowDeleteModal(
                      false,
                    )
                  }
                >
                  <X
                    size={18}
                    strokeWidth={1.4}
                    className="text-[#99958e]"
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
                <strong className="font-medium text-[#45423d]">
                  {project.title}
                </strong>{" "}
                et toutes les images
                associées seront
                définitivement supprimés.
              </p>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(
                      false,
                    )
                  }
                  disabled={deleting}
                  className="h-11 flex-1 border border-[#dedbd4] bg-white text-[10px] uppercase tracking-[0.17em] text-[#66625b]"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={deleting}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 bg-[#8d574d] text-[10px] uppercase tracking-[0.17em] text-white disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />

                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={14}
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
   ADMIN CARD
============================================================ */

function AdminCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#e4e1db] bg-white p-6 sm:p-8">
      {children}
    </section>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.27em] text-[#9b7b54]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-light tracking-[-0.03em] text-[#35332f]">
        {title}
      </h2>
    </div>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#77736c]">
        {label}

        {required && (
          <span className="ml-1 text-[#9b7b54]">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        required={required}
        className="h-11 w-full border border-[#dedbd4] bg-[#faf9f7] px-3 text-sm text-[#3f3c37] outline-none transition placeholder:text-[#aaa69f] focus:border-[#b9a68e] focus:bg-white"
      />
    </label>
  );
}

/* ============================================================
   TEXTAREA
============================================================ */

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#77736c]">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y border border-[#dedbd4] bg-[#faf9f7] px-3 py-3 text-sm leading-6 text-[#3f3c37] outline-none transition placeholder:text-[#aaa69f] focus:border-[#b9a68e] focus:bg-white"
      />
    </label>
  );
}

/* ============================================================
   SELECT
============================================================ */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#77736c]">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-11 w-full appearance-none border border-[#dedbd4] bg-[#faf9f7] px-3 pr-9 text-sm text-[#3f3c37] outline-none transition focus:border-[#b9a68e] focus:bg-white"
        >
          {options.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {option.label}
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
  );
}

/* ============================================================
   READONLY ITEM
============================================================ */

function ReadonlyItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-b border-[#eeeae4] pb-4 last:border-b-0 last:pb-0">
      <p className="text-[8px] uppercase tracking-[0.18em] text-[#aaa69f]">
        {label}
      </p>

      <p
        className={`mt-2 break-all text-xs text-[#5f5c56] ${
          mono
            ? "font-mono text-[9px]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}