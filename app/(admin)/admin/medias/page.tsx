"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  AlertCircle,
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Cloud,
  Copy,
  Download,
  File,
  FileImage,
  FileText,
  Film,
  Folder,
  FolderOpen,
  Grid2X2,
  HardDrive,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Move,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
  Upload,
  Video,
  X,
  ZoomIn,
} from "lucide-react";

import { getSupabaseClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

type MediaType =
  | "image"
  | "video"
  | "document"
  | "other";

type ViewMode = "grid" | "list";

type SortField =
  | "name"
  | "size"
  | "created_at"
  | "type";

type SortDirection = "asc" | "desc";

type BucketName =
  | "profile-images"
  | "profile-cv"
  | "project-images"
  | "site-media";

type StorageItem = {
  id: string;
  name: string;
  bucket: BucketName;
  path: string;
  type: MediaType;
  mimeType: string;
  size: number;
  createdAt: string | null;
  updatedAt: string | null;
  url: string | null;
  isFolder: boolean;
  childrenCount?: number;
};

/* ============================================================
   CONFIGURATION
============================================================ */

const BUCKETS: Array<{
  name: BucketName;
  label: string;
  description: string;
  icon: typeof Folder;
}> = [
  {
    name: "profile-images",
    label: "Profil",
    description: "Images du profil",
    icon: ImageIcon,
  },
  {
    name: "profile-cv",
    label: "CV",
    description: "Documents professionnels",
    icon: FileText,
  },
  {
    name: "project-images",
    label: "Projets",
    description: "Images des projets",
    icon: FolderOpen,
  },
  {
    name: "site-media",
    label: "Site",
    description: "Médias éditoriaux",
    icon: Archive,
  },
];

const MAX_PREVIEW_SIZE = 80 * 1024 * 1024;

/* ============================================================
   HELPERS
============================================================ */

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : index >= 3 ? 2 : 1,
  )} ${units[index]}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

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

function getExtension(name: string): string {
  const parts = name.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts.pop()?.toLowerCase() ?? "";
}

function getMediaType(
  name: string,
  mimeType?: string | null,
): MediaType {
  const mime = mimeType?.toLowerCase() ?? "";
  const extension = getExtension(name);

  if (
    mime.startsWith("image/") ||
    [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "svg",
      "avif",
      "bmp",
      "tiff",
      "ico",
    ].includes(extension)
  ) {
    return "image";
  }

  if (
    mime.startsWith("video/") ||
    ["mp4", "webm", "mov", "avi", "mkv", "m4v"].includes(
      extension,
    )
  ) {
    return "video";
  }

  if (
    mime.includes("pdf") ||
    mime.includes("document") ||
    mime.includes("word") ||
    mime.includes("text") ||
    [
      "pdf",
      "doc",
      "docx",
      "txt",
      "rtf",
      "xls",
      "xlsx",
      "csv",
      "ppt",
      "pptx",
    ].includes(extension)
  ) {
    return "document";
  }

  return "other";
}

function getFileIcon(type: MediaType) {
  switch (type) {
    case "image":
      return FileImage;

    case "video":
      return Film;

    case "document":
      return FileText;

    default:
      return File;
  }
}

function getTypeLabel(type: MediaType): string {
  switch (type) {
    case "image":
      return "Image";

    case "video":
      return "Vidéo";

    case "document":
      return "Document";

    default:
      return "Autre";
  }
}

function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function getParentPath(path: string): string {
  const normalized = normalizePath(path);

  if (!normalized.includes("/")) {
    return "";
  }

  return normalized.split("/").slice(0, -1).join("/");
}

function getFolderName(path: string): string {
  const normalized = normalizePath(path);

  if (!normalized) {
    return "";
  }

  return normalized.split("/").pop() ?? normalized;
}

function getFolderDepth(path: string): number {
  const normalized = normalizePath(path);

  if (!normalized) {
    return 0;
  }

  return normalized.split("/").length;
}

function isImagePreviewable(item: StorageItem): boolean {
  return (
    item.type === "image" &&
    !!item.url &&
    item.size <= MAX_PREVIEW_SIZE
  );
}

function isVideoPreviewable(item: StorageItem): boolean {
  return (
    item.type === "video" &&
    !!item.url &&
    item.size <= MAX_PREVIEW_SIZE
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function MediaLibraryPage() {
  const supabase = getSupabaseClient();

  /* ----------------------------------------------------------
     AUTH
  ---------------------------------------------------------- */

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  /* ----------------------------------------------------------
     DATA
  ---------------------------------------------------------- */

  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------------------------
     NAVIGATION
  ---------------------------------------------------------- */

  const [activeBucket, setActiveBucket] =
    useState<BucketName>("project-images");

  const [currentPath, setCurrentPath] = useState("");

  /* ----------------------------------------------------------
     FILTERS
  ---------------------------------------------------------- */

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<"all" | MediaType>("all");

  const [sortField, setSortField] =
    useState<SortField>("created_at");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */

  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [previewItem, setPreviewItem] =
    useState<StorageItem | null>(null);

  const [showUpload, setShowUpload] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showMoveModal, setShowMoveModal] =
    useState(false);

  const [showRenameModal, setShowRenameModal] =
    useState(false);

  const [actionItem, setActionItem] =
    useState<StorageItem | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [copied, setCopied] =
    useState<string | null>(null);

  /* ----------------------------------------------------------
     UPLOAD
  ---------------------------------------------------------- */

  const [uploadFiles, setUploadFiles] =
    useState<File[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [dragActive, setDragActive] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* ----------------------------------------------------------
     RENAME
  ---------------------------------------------------------- */

  const [renameValue, setRenameValue] =
    useState("");

  /* ----------------------------------------------------------
     MOVE
  ---------------------------------------------------------- */

  const [moveDestination, setMoveDestination] =
    useState("");

  /* ==========================================================
     AUTH GUARD
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function verifyAccess() {
      setCheckingAuth(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.href = "/login";
          return;
        }

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
          window.location.href = "/login";
          return;
        }

        if (mounted) {
          setAuthorized(true);
        }
      } catch (authError) {
        console.error(authError);
        window.location.href = "/login";
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    }

    verifyAccess();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* ==========================================================
     STORAGE
  ========================================================== */

  const createPublicUrl = useCallback(
    (bucket: BucketName, path: string) => {
      const {
        data,
      } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl ?? null;
    },
    [supabase],
  );

  const listAllFiles = useCallback(
    async (
      bucket: BucketName,
      prefix = "",
    ): Promise<StorageItem[]> => {
      const collected: StorageItem[] = [];

      let offset = 0;

      const limit = 100;

      while (true) {
        const {
          data,
          error: listError,
        } = await supabase.storage
          .from(bucket)
          .list(prefix, {
            limit,
            offset,
            sortBy: {
              column: "name",
              order: "asc",
            },
          });

        if (listError) {
          throw listError;
        }

        if (!data || data.length === 0) {
          break;
        }

        for (const entry of data) {
          const entryPath = prefix
            ? `${prefix}/${entry.name}`
            : entry.name;

          const isFolder =
            !entry.metadata ||
            Object.keys(entry.metadata).length === 0;

          if (isFolder) {
            const nested = await listAllFiles(
              bucket,
              entryPath,
            );

            collected.push(...nested);
          } else {
            const mimeType =
              entry.metadata?.mimetype ??
              entry.metadata?.contentType ??
              "";

            const size = Number(
              entry.metadata?.size ?? 0,
            );

            collected.push({
              id: `${bucket}:${entryPath}`,
              name: entry.name,
              bucket,
              path: entryPath,
              type: getMediaType(
                entry.name,
                mimeType,
              ),
              mimeType,
              size,
              createdAt:
                entry.created_at ??
                entry.updated_at ??
                null,
              updatedAt:
                entry.updated_at ??
                entry.created_at ??
                null,
              url: createPublicUrl(
                bucket,
                entryPath,
              ),
              isFolder: false,
            });
          }
        }

        if (data.length < limit) {
          break;
        }

        offset += limit;
      }

      return collected;
    },
    [createPublicUrl, supabase],
  );

  const loadStorage = useCallback(
    async (silent = false) => {
      if (!authorized) {
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const results = await Promise.all(
          BUCKETS.map((bucket) =>
            listAllFiles(bucket.name),
          ),
        );

        setItems(results.flat());
      } catch (storageError) {
        console.error(
          "Media library error:",
          storageError,
        );

        setError(
          storageError instanceof Error
            ? storageError.message
            : "Impossible de charger les médias.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authorized, listAllFiles],
  );

  useEffect(() => {
    if (authorized) {
      loadStorage();
    }
  }, [authorized, loadStorage]);

  /* ==========================================================
     CURRENT FILES
  ========================================================== */

  const currentBucketItems = useMemo(() => {
    return items.filter(
      (item) => item.bucket === activeBucket,
    );
  }, [activeBucket, items]);

  const currentDirectoryItems = useMemo(() => {
    const prefix = normalizePath(currentPath);

    const folders = new Map<
      string,
      StorageItem
    >();

    const files: StorageItem[] = [];

    for (const item of currentBucketItems) {
      const itemPath = normalizePath(item.path);

      if (prefix) {
        if (
          itemPath !== prefix &&
          !itemPath.startsWith(`${prefix}/`)
        ) {
          continue;
        }
      }

      const remaining = prefix
        ? itemPath.slice(prefix.length).replace(
            /^\/+/,
            "",
          )
        : itemPath;

      if (!remaining) {
        continue;
      }

      const parts = remaining.split("/");

      if (parts.length > 1) {
        const folderName = parts[0];

        const folderPath = prefix
          ? `${prefix}/${folderName}`
          : folderName;

        if (!folders.has(folderPath)) {
          const folderChildren = currentBucketItems.filter(
            (candidate) =>
              candidate.path.startsWith(
                `${folderPath}/`,
              ),
          );

          folders.set(folderPath, {
            id: `${activeBucket}:folder:${folderPath}`,
            name: folderName,
            bucket: activeBucket,
            path: folderPath,
            type: "other",
            mimeType: "",
            size: folderChildren.reduce(
              (total, child) =>
                total + child.size,
              0,
            ),
            createdAt: null,
            updatedAt: null,
            url: null,
            isFolder: true,
            childrenCount:
              folderChildren.length,
          });
        }

        continue;
      }

      files.push(item);
    }

    return [
      ...Array.from(folders.values()),
      ...files,
    ];
  }, [
    activeBucket,
    currentBucketItems,
    currentPath,
  ]);

  /* ==========================================================
     SEARCH + FILTER + SORT
  ========================================================== */

  const filteredItems = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const result = currentDirectoryItems.filter(
      (item) => {
        if (
          normalizedSearch &&
          !item.name
            .toLowerCase()
            .includes(normalizedSearch) &&
          !item.path
            .toLowerCase()
            .includes(normalizedSearch)
        ) {
          return false;
        }

        if (
          !item.isFolder &&
          typeFilter !== "all" &&
          item.type !== typeFilter
        ) {
          return false;
        }

        return true;
      },
    );

    result.sort((a, b) => {
      if (a.isFolder && !b.isFolder) {
        return -1;
      }

      if (!a.isFolder && b.isFolder) {
        return 1;
      }

      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(
            b.name,
            "fr",
          );
          break;

        case "size":
          comparison = a.size - b.size;
          break;

        case "type":
          comparison = a.type.localeCompare(
            b.type,
          );
          break;

        case "created_at":
        default:
          comparison =
            new Date(
              a.createdAt ?? 0,
            ).getTime() -
            new Date(
              b.createdAt ?? 0,
            ).getTime();
          break;
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    currentDirectoryItems,
    search,
    sortDirection,
    sortField,
    typeFilter,
  ]);

  /* ==========================================================
     GLOBAL STATISTICS
  ========================================================== */

  const statistics = useMemo(() => {
    const files = items.filter(
      (item) => !item.isFolder,
    );

    const images = files.filter(
      (item) => item.type === "image",
    );

    const videos = files.filter(
      (item) => item.type === "video",
    );

    const documents = files.filter(
      (item) => item.type === "document",
    );

    const others = files.filter(
      (item) => item.type === "other",
    );

    const totalBytes = files.reduce(
      (total, item) => total + item.size,
      0,
    );

    const bucketStats = BUCKETS.map(
      (bucket) => {
        const bucketFiles = files.filter(
          (item) =>
            item.bucket === bucket.name,
        );

        return {
          ...bucket,
          files: bucketFiles.length,
          bytes: bucketFiles.reduce(
            (total, item) =>
              total + item.size,
            0,
          ),
        };
      },
    );

    return {
      files: files.length,
      images: images.length,
      videos: videos.length,
      documents: documents.length,
      others: others.length,
      totalBytes,
      bucketStats,
    };
  }, [items]);

  const currentBucketStats = useMemo(() => {
    const files =
      currentBucketItems.filter(
        (item) => !item.isFolder,
      );

    return {
      files: files.length,
      bytes: files.reduce(
        (total, item) => total + item.size,
        0,
      ),
    };
  }, [currentBucketItems]);

  /* ==========================================================
     BREADCRUMB
  ========================================================== */

  const breadcrumb = useMemo(() => {
    const parts = normalizePath(
      currentPath,
    )
      ? normalizePath(currentPath).split("/")
      : [];

    const result: Array<{
      label: string;
      path: string;
    }> = [
      {
        label:
          BUCKETS.find(
            (bucket) =>
              bucket.name === activeBucket,
          )?.label ?? activeBucket,
        path: "",
      },
    ];

    let accumulated = "";

    for (const part of parts) {
      accumulated = accumulated
        ? `${accumulated}/${part}`
        : part;

      result.push({
        label: part,
        path: accumulated,
      });
    }

    return result;
  }, [activeBucket, currentPath]);

  /* ==========================================================
     SELECTION
  ========================================================== */

  const selectableItems = useMemo(
    () =>
      filteredItems.filter(
        (item) => !item.isFolder,
      ),
    [filteredItems],
  );

  const allVisibleSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) =>
      selectedIds.includes(item.id),
    );

  const toggleSelection = (
    item: StorageItem,
  ) => {
    if (item.isFolder) {
      return;
    }

    setSelectedIds((current) =>
      current.includes(item.id)
        ? current.filter(
            (id) => id !== item.id,
          )
        : [...current, item.id],
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !selectableItems.some(
              (item) => item.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...selectableItems.map(
          (item) => item.id,
        ),
      ]),
    ]);
  };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const openFolder = (path: string) => {
    setCurrentPath(normalizePath(path));
    setSelectedIds([]);
    setSearch("");
  };

  const selectBucket = (
    bucket: BucketName,
  ) => {
    setActiveBucket(bucket);
    setCurrentPath("");
    setSelectedIds([]);
    setSearch("");
    setTypeFilter("all");
  };

  const navigateUp = () => {
    setCurrentPath(
      getParentPath(currentPath),
    );
    setSelectedIds([]);
  };

  /* ==========================================================
     COPY URL
  ========================================================== */

  const copyUrl = async (
    item: StorageItem,
  ) => {
    if (!item.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        item.url,
      );

      setCopied(item.id);

      window.setTimeout(() => {
        setCopied(null);
      }, 1800);
    } catch (copyError) {
      console.error(copyError);
    }
  };

  /* ==========================================================
     DOWNLOAD
  ========================================================== */

  const downloadItem = async (
    item: StorageItem,
  ) => {
    if (!item.url) {
      return;
    }

    try {
      const response = await fetch(item.url);

      if (!response.ok) {
        throw new Error(
          "Téléchargement impossible.",
        );
      }

      const blob = await response.blob();

      const blobUrl =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = blobUrl;
      anchor.download = item.name;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      console.error(
        downloadError,
      );

      window.open(
        item.url,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  const openDeleteModal = (
    item?: StorageItem,
  ) => {
    if (item) {
      setActionItem(item);
    } else {
      setActionItem(null);
    }

    setShowDeleteModal(true);
  };

  const deleteItems = async () => {
    setActionLoading(true);

    try {
      const targets = actionItem
        ? [actionItem]
        : items.filter((item) =>
            selectedIds.includes(
              item.id,
            ),
          );

      if (targets.length === 0) {
        setShowDeleteModal(false);
        return;
      }

      const grouped = new Map<
        BucketName,
        string[]
      >();

      for (const target of targets) {
        const paths =
          grouped.get(target.bucket) ??
          [];

        paths.push(target.path);

        grouped.set(
          target.bucket,
          paths,
        );
      }

      for (const [
        bucket,
        paths,
      ] of grouped) {
        const {
          error: removeError,
        } = await supabase.storage
          .from(bucket)
          .remove(paths);

        if (removeError) {
          throw removeError;
        }
      }

      setItems((current) =>
        current.filter(
          (item) =>
            !targets.some(
              (target) =>
                target.id === item.id,
            ),
        ),
      );

      setSelectedIds([]);

      setShowDeleteModal(false);
      setActionItem(null);
    } catch (deleteError) {
      console.error(
        "Delete media error:",
        deleteError,
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer les médias.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ==========================================================
     RENAME
  ========================================================== */

  const openRenameModal = (
    item: StorageItem,
  ) => {
    setActionItem(item);
    setRenameValue(item.name);
    setShowRenameModal(true);
  };

  const renameItem = async () => {
    if (!actionItem) {
      return;
    }

    const nextName =
      renameValue.trim();

    if (
      !nextName ||
      nextName === actionItem.name
    ) {
      setShowRenameModal(false);
      return;
    }

    setActionLoading(true);

    try {
      const parent =
        getParentPath(actionItem.path);

      const destination =
        parent
          ? `${parent}/${nextName}`
          : nextName;

      const {
        error: moveError,
      } = await supabase.storage
        .from(actionItem.bucket)
        .move(
          actionItem.path,
          destination,
        );

      if (moveError) {
        throw moveError;
      }

      const nextUrl =
        createPublicUrl(
          actionItem.bucket,
          destination,
        );

      setItems((current) =>
        current.map((item) =>
          item.id === actionItem.id
            ? {
                ...item,
                name: nextName,
                path: destination,
                url: nextUrl,
                id: `${actionItem.bucket}:${destination}`,
              }
            : item,
        ),
      );

      setShowRenameModal(false);
      setActionItem(null);
      setRenameValue("");
    } catch (renameError) {
      console.error(
        "Rename media error:",
        renameError,
      );

      setError(
        renameError instanceof Error
          ? renameError.message
          : "Impossible de renommer le média.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ==========================================================
     MOVE
  ========================================================== */

  const openMoveModal = (
    item: StorageItem,
  ) => {
    setActionItem(item);
    setMoveDestination(
      getParentPath(item.path),
    );
    setShowMoveModal(true);
  };

  const moveItem = async () => {
    if (!actionItem) {
      return;
    }

    const destinationFolder =
      normalizePath(
        moveDestination,
      );

    const destination =
      destinationFolder
        ? `${destinationFolder}/${actionItem.name}`
        : actionItem.name;

    if (
      destination === actionItem.path
    ) {
      setShowMoveModal(false);
      return;
    }

    setActionLoading(true);

    try {
      const {
        error: moveError,
      } = await supabase.storage
        .from(actionItem.bucket)
        .move(
          actionItem.path,
          destination,
        );

      if (moveError) {
        throw moveError;
      }

      const nextUrl =
        createPublicUrl(
          actionItem.bucket,
          destination,
        );

      setItems((current) =>
        current.map((item) =>
          item.id === actionItem.id
            ? {
                ...item,
                path: destination,
                url: nextUrl,
                id: `${actionItem.bucket}:${destination}`,
              }
            : item,
        ),
      );

      setShowMoveModal(false);
      setActionItem(null);
      setMoveDestination("");
    } catch (moveError) {
      console.error(
        "Move media error:",
        moveError,
      );

      setError(
        moveError instanceof Error
          ? moveError.message
          : "Impossible de déplacer le média.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ==========================================================
     UPLOAD
  ========================================================== */

  const addFiles = (
    files: FileList | File[],
  ) => {
    const incoming = Array.from(files);

    if (incoming.length === 0) {
      return;
    }

    setUploadFiles((current) => [
      ...current,
      ...incoming,
    ]);

    setShowUpload(true);
  };

  const removeUploadFile = (
    index: number,
  ) => {
    setUploadFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index,
      ),
    );
  };

  const uploadMedia = async () => {
    if (uploadFiles.length === 0) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploaded: StorageItem[] = [];

      for (
        let index = 0;
        index < uploadFiles.length;
        index++
      ) {
        const file = uploadFiles[index];

        const safeName =
          file.name
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              "",
            )
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "-",
            )
            .replace(
              /-+/g,
              "-",
            );

        const fileName =
          `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

        const path =
          currentPath
            ? `${currentPath}/${fileName}`
            : fileName;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(activeBucket)
          .upload(
            path,
            file,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                file.type ||
                "application/octet-stream",
            },
          );

        if (uploadError) {
          throw uploadError;
        }

        const url =
          createPublicUrl(
            activeBucket,
            path,
          );

        uploaded.push({
          id: `${activeBucket}:${path}`,
          name: fileName,
          bucket: activeBucket,
          path,
          type: getMediaType(
            fileName,
            file.type,
          ),
          mimeType:
            file.type ||
            "application/octet-stream",
          size: file.size,
          createdAt:
            new Date().toISOString(),
          updatedAt:
            new Date().toISOString(),
          url,
          isFolder: false,
        });

        setUploadProgress(
          Math.round(
            ((index + 1) /
              uploadFiles.length) *
              100,
          ),
        );
      }

      setItems((current) => [
        ...current,
        ...uploaded,
      ]);

      setUploadFiles([]);
      setShowUpload(false);
    } catch (uploadError) {
      console.error(
        "Upload media error:",
        uploadError,
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Impossible d'importer les médias.",
      );
    } finally {
      setUploading(false);
    }
  };

  /* ==========================================================
     ACTION MENU
  ========================================================== */

  const selectedItems = useMemo(
    () =>
      items.filter((item) =>
        selectedIds.includes(item.id),
      ),
    [items, selectedIds],
  );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#f5f4f1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border border-[#d9d4cc] border-t-[#9b7b54] animate-spin" />

          <p className="text-[11px] uppercase tracking-[0.22em] text-[#77716a]">
            Vérification de l'accès
          </p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#f5f4f1] text-[#242321]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[#dedbd5] bg-[#f8f7f4]">
        <div className="mx-auto max-w-[1800px] px-5 py-5 md:px-8 lg:px-10">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8a847c]">
                <Link
                  href="/admin"
                  className="transition-colors hover:text-[#9b7b54]"
                >
                  Administration
                </Link>

                <span>/</span>

                <span className="text-[#9b7b54]">
                  Médias
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="hidden h-12 w-px bg-[#9b7b54] sm:block" />

                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-[#9b7b54]">
                    Digital Asset Library
                  </p>

                  <h1 className="font-serif text-3xl tracking-[-0.03em] text-[#242321] md:text-4xl">
                    Bibliothèque médias
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77716a]">
                    Centralisez, organisez et contrôlez
                    les ressources visuelles et
                    documentaires du studio.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadStorage(true)
                }
                disabled={refreshing}
                className="inline-flex h-11 items-center gap-2 border border-[#d8d4ce] bg-white px-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#4c4945] transition hover:border-[#9b7b54] hover:text-[#9b7b54] disabled:opacity-50"
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

              <button
                type="button"
                onClick={() =>
                  setShowUpload(true)
                }
                className="inline-flex h-11 items-center gap-2 bg-[#242321] px-5 text-[11px] font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[#9b7b54]"
              >
                <Plus size={16} />

                Importer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-[1800px] px-5 py-6 md:px-8 lg:px-10">
        {/* ====================================================
            GLOBAL STATS
        ==================================================== */}

        <section className="grid grid-cols-2 gap-px overflow-hidden border border-[#dedbd5] bg-[#dedbd5] md:grid-cols-4">
          <StatCard
            label="Fichiers"
            value={formatNumber(
              statistics.files,
            )}
            detail="tous espaces"
            icon={File}
          />

          <StatCard
            label="Stockage"
            value={formatBytes(
              statistics.totalBytes,
            )}
            detail="poids total"
            icon={HardDrive}
            featured
          />

          <StatCard
            label="Images"
            value={formatNumber(
              statistics.images,
            )}
            detail="ressources visuelles"
            icon={ImageIcon}
          />

          <StatCard
            label="Documents"
            value={formatNumber(
              statistics.documents,
            )}
            detail={`${formatNumber(
              statistics.videos,
            )} vidéos · ${formatNumber(
              statistics.others,
            )} autres`}
            icon={FileText}
          />
        </section>

        {/* ====================================================
            MAIN
        ==================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside className="self-start lg:sticky lg:top-6">
            <div className="border border-[#dedbd5] bg-white">
              <div className="border-b border-[#dedbd5] px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#f0ece5] text-[#9b7b54]">
                    <Server size={17} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#9b7b54]">
                      Storage
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      Architecture
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {BUCKETS.map((bucket) => {
                  const Icon =
                    bucket.icon;

                  const stats =
                    statistics.bucketStats.find(
                      (entry) =>
                        entry.name ===
                        bucket.name,
                    );

                  const active =
                    activeBucket ===
                    bucket.name;

                  return (
                    <button
                      key={bucket.name}
                      type="button"
                      onClick={() =>
                        selectBucket(
                          bucket.name,
                        )
                      }
                      className={`group mb-1 flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                        active
                          ? "bg-[#f1eee8]"
                          : "hover:bg-[#f7f6f3]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                          active
                            ? "bg-[#242321] text-white"
                            : "bg-[#f5f4f1] text-[#7b766f] group-hover:text-[#9b7b54]"
                        }`}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-xs font-medium ${
                              active
                                ? "text-[#242321]"
                                : "text-[#4f4b46]"
                            }`}
                          >
                            {bucket.label}
                          </span>

                          <span className="text-[9px] tabular-nums text-[#99938b]">
                            {stats?.files ?? 0}
                          </span>
                        </div>

                        <p className="mt-0.5 truncate text-[10px] text-[#99938b]">
                          {bucket.name}
                        </p>
                      </div>

                      {active && (
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-[#9b7b54]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#dedbd5] p-5">
                <p className="mb-3 text-[9px] uppercase tracking-[0.2em] text-[#99938b]">
                  Utilisation
                </p>

                <div className="mb-2 flex items-end justify-between gap-3">
                  <span className="font-serif text-xl">
                    {formatBytes(
                      statistics.totalBytes,
                    )}
                  </span>

                  <span className="text-[10px] text-[#99938b]">
                    {formatNumber(
                      statistics.files,
                    )}{" "}
                    fichiers
                  </span>
                </div>

                <div className="h-1 bg-[#ece9e4]">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width:
                        statistics.files >
                        0
                          ? "100%"
                          : "0%",
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full bg-[#9b7b54]"
                  />
                </div>

                <p className="mt-3 text-[10px] leading-4 text-[#aaa49c]">
                  La taille affichée est calculée
                  à partir des objets réellement
                  présents dans les buckets.
                </p>
              </div>
            </div>
          </aside>

          {/* ==================================================
              LIBRARY
          ================================================== */}

          <section className="min-w-0">
            {/* TOOLBAR */}

            <div className="border border-[#dedbd5] bg-white">
              <div className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa49c]"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Rechercher un média ou un chemin..."
                    className="h-11 w-full border border-[#e1ded8] bg-[#faf9f7] pl-10 pr-4 text-sm outline-none transition focus:border-[#9b7b54]"
                  />
                </div>

                <SelectControl
                  value={typeFilter}
                  onChange={(value) =>
                    setTypeFilter(
                      value as
                        | "all"
                        | MediaType,
                    )
                  }
                  options={[
                    {
                      value: "all",
                      label: "Tous les types",
                    },
                    {
                      value: "image",
                      label: "Images",
                    },
                    {
                      value: "video",
                      label: "Vidéos",
                    },
                    {
                      value: "document",
                      label: "Documents",
                    },
                    {
                      value: "other",
                      label: "Autres",
                    },
                  ]}
                />

                <SelectControl
                  value={sortField}
                  onChange={(value) =>
                    setSortField(
                      value as SortField,
                    )
                  }
                  options={[
                    {
                      value: "created_at",
                      label: "Date",
                    },
                    {
                      value: "name",
                      label: "Nom",
                    },
                    {
                      value: "size",
                      label: "Taille",
                    },
                    {
                      value: "type",
                      label: "Type",
                    },
                  ]}
                />

                <button
                  type="button"
                  onClick={() =>
                    setSortDirection(
                      (current) =>
                        current === "asc"
                          ? "desc"
                          : "asc",
                    )
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#e1ded8] bg-[#faf9f7] text-[#68635c] transition hover:border-[#9b7b54] hover:text-[#9b7b54]"
                  title="Inverser le tri"
                >
                  {sortDirection ===
                  "asc" ? (
                    <ArrowUp size={15} />
                  ) : (
                    <ArrowDown size={15} />
                  )}
                </button>

                <div className="flex h-11 border border-[#e1ded8] bg-[#faf9f7]">
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("grid")
                    }
                    className={`flex w-11 items-center justify-center ${
                      viewMode === "grid"
                        ? "bg-[#242321] text-white"
                        : "text-[#77716a] hover:text-[#9b7b54]"
                    }`}
                  >
                    <Grid2X2
                      size={15}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("list")
                    }
                    className={`flex w-11 items-center justify-center ${
                      viewMode === "list"
                        ? "bg-[#242321] text-white"
                        : "text-[#77716a] hover:text-[#9b7b54]"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

              {/* BREADCRUMB */}

              <div className="flex flex-wrap items-center gap-1 border-t border-[#dedbd5] px-4 py-3">
                {currentPath && (
                  <button
                    type="button"
                    onClick={navigateUp}
                    className="mr-2 flex h-7 w-7 items-center justify-center border border-[#e1ded8] text-[#77716a] transition hover:border-[#9b7b54] hover:text-[#9b7b54]"
                    title="Dossier parent"
                  >
                    <ChevronLeft
                      size={14}
                    />
                  </button>
                )}

                {breadcrumb.map(
                  (
                    crumb,
                    index,
                  ) => (
                    <div
                      key={
                        crumb.path ||
                        "root"
                      }
                      className="flex items-center gap-1"
                    >
                      {index > 0 && (
                        <ChevronRight
                          size={12}
                          className="text-[#c4beb5]"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          openFolder(
                            crumb.path,
                          )
                        }
                        className={`px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition ${
                          index ===
                          breadcrumb.length -
                            1
                            ? "font-medium text-[#242321]"
                            : "text-[#8c867e] hover:text-[#9b7b54]"
                        }`}
                      >
                        {crumb.label}
                      </button>
                    </div>
                  ),
                )}

                <div className="ml-auto flex items-center gap-3">
                  <span className="text-[10px] text-[#99938b]">
                    {formatNumber(
                      currentBucketStats.files,
                    )}{" "}
                    fichiers ·{" "}
                    {formatBytes(
                      currentBucketStats.bytes,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* SELECTION BAR */}

            <AnimatePresence>
              {selectedIds.length > 0 && (
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
                  className="sticky top-4 z-30 mt-3 flex flex-col gap-3 border border-[#cfc8be] bg-[#242321] p-3 text-white shadow-xl md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-white/10">
                      <Check size={15} />
                    </div>

                    <span className="text-xs">
                      <strong>
                        {selectedIds.length}
                      </strong>{" "}
                      élément
                      {selectedIds.length >
                      1
                        ? "s"
                        : ""}{" "}
                      sélectionné
                      {selectedIds.length >
                      1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          selectedItems.length ===
                          1
                        ) {
                          copyUrl(
                            selectedItems[0],
                          );
                        }
                      }}
                      disabled={
                        selectedItems.length !==
                        1
                      }
                      className="inline-flex h-9 items-center gap-2 border border-white/15 px-3 text-[10px] uppercase tracking-[0.1em] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Copy size={13} />
                      Copier
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openMoveModal(
                          selectedItems[0],
                        )
                      }
                      disabled={
                        selectedItems.length !==
                        1
                      }
                      className="inline-flex h-9 items-center gap-2 border border-white/15 px-3 text-[10px] uppercase tracking-[0.1em] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Move size={13} />
                      Déplacer
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteModal()
                      }
                      className="inline-flex h-9 items-center gap-2 bg-[#9b7b54] px-3 text-[10px] uppercase tracking-[0.1em] transition hover:bg-[#b18e64]"
                    >
                      <Trash2
                        size={13}
                      />
                      Supprimer
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIds([])
                      }
                      className="flex h-9 w-9 items-center justify-center text-white/60 transition hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RESULTS HEADER */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9b7b54]">
                  Collection
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <h2 className="font-serif text-2xl tracking-[-0.02em]">
                    {BUCKETS.find(
                      (bucket) =>
                        bucket.name ===
                        activeBucket,
                    )?.label ??
                      activeBucket}
                  </h2>

                  <span className="text-xs text-[#99938b]">
                    {formatNumber(
                      filteredItems.length,
                    )}{" "}
                    éléments
                  </span>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-[#77716a]">
                <input
                  type="checkbox"
                  checked={
                    allVisibleSelected
                  }
                  onChange={
                    toggleSelectAll
                  }
                  className="h-4 w-4 accent-[#9b7b54]"
                />

                Tout sélectionner
              </label>
            </div>

            {/* ERROR */}

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
                  className="mt-4 flex items-start gap-3 border border-[#dfc8c4] bg-[#fff9f8] p-4 text-sm text-[#8b4c45]"
                >
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      Une opération a rencontré
                      un problème.
                    </p>

                    <p className="mt-1 text-xs leading-5 opacity-80">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError(null)
                    }
                    className="shrink-0"
                  >
                    <X size={15} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CONTENT */}

            {loading ? (
              <LoadingLibrary />
            ) : filteredItems.length ===
              0 ? (
              <EmptyLibrary
                search={search}
                onUpload={() =>
                  setShowUpload(true)
                }
              />
            ) : viewMode ===
              "grid" ? (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map(
                    (item, index) =>
                      item.isFolder ? (
                        <FolderCard
                          key={item.id}
                          item={item}
                          index={index}
                          onOpen={() =>
                            openFolder(
                              item.path,
                            )
                          }
                        />
                      ) : (
                        <MediaCard
                          key={item.id}
                          item={item}
                          index={index}
                          selected={selectedIds.includes(
                            item.id,
                          )}
                          copied={
                            copied ===
                            item.id
                          }
                          onSelect={() =>
                            toggleSelection(
                              item,
                            )
                          }
                          onPreview={() =>
                            setPreviewItem(
                              item,
                            )
                          }
                          onCopy={() =>
                            copyUrl(item)
                          }
                          onDownload={() =>
                            downloadItem(
                              item,
                            )
                          }
                          onRename={() =>
                            openRenameModal(
                              item,
                            )
                          }
                          onMove={() =>
                            openMoveModal(
                              item,
                            )
                          }
                          onDelete={() =>
                            openDeleteModal(
                              item,
                            )
                          }
                        />
                      ),
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <MediaList
                items={filteredItems}
                selectedIds={selectedIds}
                copied={copied}
                onSelect={toggleSelection}
                onOpenFolder={openFolder}
                onPreview={setPreviewItem}
                onCopy={copyUrl}
                onDownload={downloadItem}
                onRename={openRenameModal}
                onMove={openMoveModal}
                onDelete={openDeleteModal}
              />
            )}
          </section>
        </div>
      </div>

      {/* ======================================================
          UPLOAD MODAL
      ====================================================== */}

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            files={uploadFiles}
            uploading={uploading}
            progress={uploadProgress}
            currentPath={
              currentPath || "/"
            }
            bucket={activeBucket}
            dragActive={dragActive}
            setDragActive={setDragActive}
            onClose={() => {
              if (!uploading) {
                setShowUpload(false);
                setUploadFiles([]);
              }
            }}
            onFiles={addFiles}
            onRemove={removeUploadFile}
            onUpload={uploadMedia}
            fileInputRef={fileInputRef}
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          PREVIEW
      ====================================================== */}

      <AnimatePresence>
        {previewItem && (
          <PreviewModal
            item={previewItem}
            onClose={() =>
              setPreviewItem(null)
            }
            onCopy={() =>
              copyUrl(previewItem)
            }
            onDownload={() =>
              downloadItem(
                previewItem,
              )
            }
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            count={
              actionItem
                ? 1
                : selectedIds.length
            }
            loading={actionLoading}
            onClose={() => {
              if (!actionLoading) {
                setShowDeleteModal(
                  false,
                );
                setActionItem(null);
              }
            }}
            onConfirm={deleteItems}
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          RENAME MODAL
      ====================================================== */}

      <AnimatePresence>
        {showRenameModal &&
          actionItem && (
            <RenameModal
              item={actionItem}
              value={renameValue}
              loading={actionLoading}
              onChange={setRenameValue}
              onClose={() => {
                if (!actionLoading) {
                  setShowRenameModal(
                    false,
                  );
                }
              }}
              onConfirm={renameItem}
            />
          )}
      </AnimatePresence>

      {/* ======================================================
          MOVE MODAL
      ====================================================== */}

      <AnimatePresence>
        {showMoveModal &&
          actionItem && (
            <MoveModal
              item={actionItem}
              value={moveDestination}
              loading={actionLoading}
              onChange={
                setMoveDestination
              }
              onClose={() => {
                if (!actionLoading) {
                  setShowMoveModal(
                    false,
                  );
                }
              }}
              onConfirm={moveItem}
            />
          )}
      </AnimatePresence>
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  featured = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof File;
  featured?: boolean;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`relative min-w-0 p-5 md:p-6 ${
        featured
          ? "bg-[#242321] text-white"
          : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-[9px] uppercase tracking-[0.2em] ${
              featured
                ? "text-white/50"
                : "text-[#99938b]"
            }`}
          >
            {label}
          </p>

          <p className="mt-3 font-serif text-2xl tracking-[-0.02em] md:text-3xl">
            {value}
          </p>

          <p
            className={`mt-1 text-[10px] ${
              featured
                ? "text-white/50"
                : "text-[#aaa49c]"
            }`}
          >
            {detail}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center ${
            featured
              ? "bg-white/10 text-[#c5a57d]"
              : "bg-[#f4f1eb] text-[#9b7b54]"
          }`}
        >
          <Icon size={16} />
        </div>
      </div>

      {featured && (
        <div className="absolute bottom-0 left-0 h-px w-1/3 bg-[#9b7b54]" />
      )}
    </motion.div>
  );
}

/* ============================================================
   SELECT
============================================================ */

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 min-w-[145px] appearance-none border border-[#e1ded8] bg-[#faf9f7] pl-3 pr-9 text-[11px] text-[#57534e] outline-none transition focus:border-[#9b7b54]"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8d877f]"
      />
    </div>
  );
}

/* ============================================================
   FOLDER CARD
============================================================ */

function FolderCard({
  item,
  index,
  onOpen,
}: {
  item: StorageItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(index * 0.025, 0.2),
      }}
      type="button"
      onDoubleClick={onOpen}
      onClick={onOpen}
      className="group relative overflow-hidden border border-[#dedbd5] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#b9aa98] hover:shadow-[0_15px_35px_rgba(36,35,33,0.08)]"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-[#f4f1eb]">
        <div className="relative">
          <FolderOpen
            size={52}
            strokeWidth={1}
            className="text-[#9b7b54] transition-transform duration-500 group-hover:scale-110"
          />

          <div className="absolute -bottom-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-[#242321] px-1 text-[8px] text-white">
            {item.childrenCount ?? 0}
          </div>
        </div>
      </div>

      <div className="border-t border-[#e5e1db] p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-[#3f3c38]">
            {item.name}
          </p>

          <ArrowUpRight
            size={13}
            className="shrink-0 text-[#b0aaa2] transition group-hover:text-[#9b7b54]"
          />
        </div>

        <p className="mt-1 text-[10px] text-[#aaa49c]">
          {item.childrenCount ?? 0}{" "}
          éléments · {formatBytes(item.size)}
        </p>
      </div>
    </motion.button>
  );
}

/* ============================================================
   MEDIA CARD
============================================================ */

function MediaCard({
  item,
  index,
  selected,
  copied,
  onSelect,
  onPreview,
  onCopy,
  onDownload,
  onRename,
  onMove,
  onDelete,
}: {
  item: StorageItem;
  index: number;
  selected: boolean;
  copied: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const Icon = getFileIcon(
    item.type,
  );

  const previewable =
    isImagePreviewable(item);

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(index * 0.025, 0.2),
      }}
      className={`group relative overflow-hidden border bg-white transition ${
        selected
          ? "border-[#9b7b54] ring-1 ring-[#9b7b54]"
          : "border-[#dedbd5] hover:border-[#b9aa98] hover:shadow-[0_15px_35px_rgba(36,35,33,0.08)]"
      }`}
    >
      {/* PREVIEW */}

      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#eeece8]"
        onDoubleClick={
          previewable
            ? onPreview
            : undefined
        }
      >
        {previewable ? (
          <img
            src={item.url ?? ""}
            alt={item.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : item.type ===
          "video" ? (
          <div className="flex h-full w-full items-center justify-center bg-[#e9e6e1]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-[#9b7b54] shadow-sm">
              <Video
                size={23}
                strokeWidth={1.4}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#f0eee9]">
            <Icon
              size={42}
              strokeWidth={1}
              className="text-[#9b7b54]"
            />

            <span className="mt-3 text-[9px] uppercase tracking-[0.16em] text-[#918b83]">
              {getExtension(
                item.name,
              ) || getTypeLabel(item.type)}
            </span>
          </div>
        )}

        {/* GRADIENT */}

        {previewable && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        {/* CHECKBOX */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          className={`absolute left-3 top-3 flex h-6 w-6 items-center justify-center border transition ${
            selected
              ? "border-[#9b7b54] bg-[#9b7b54] text-white"
              : "border-white/80 bg-black/15 text-transparent backdrop-blur-sm hover:border-white hover:bg-black/30"
          }`}
        >
          <Check size={13} />
        </button>

        {/* PREVIEW */}

        {previewable && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPreview();
            }}
            className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center bg-white/90 text-[#4e4a45] opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-[#9b7b54]"
            title="Prévisualiser"
          >
            <ZoomIn size={14} />
          </button>
        )}

        {/* MENU */}

        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(
                (current) =>
                  !current,
              );
            }}
            className="flex h-7 w-7 items-center justify-center bg-white/90 text-[#57534e] opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-[#9b7b54]"
          >
            <MoreHorizontal
              size={15}
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: -3,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: -3,
                }}
                className="absolute right-0 top-9 z-20 w-44 border border-[#dedbd5] bg-white p-1 shadow-[0_15px_40px_rgba(36,35,33,0.15)]"
              >
                {previewable && (
                  <MenuButton
                    icon={ZoomIn}
                    label="Aperçu"
                    onClick={() => {
                      setMenuOpen(
                        false,
                      );
                      onPreview();
                    }}
                  />
                )}

                <MenuButton
                  icon={Copy}
                  label="Copier l'URL"
                  onClick={() => {
                    setMenuOpen(
                      false,
                    );
                    onCopy();
                  }}
                />

                <MenuButton
                  icon={Download}
                  label="Télécharger"
                  onClick={() => {
                    setMenuOpen(
                      false,
                    );
                    onDownload();
                  }}
                />

                <MenuButton
                  icon={Pencil}
                  label="Renommer"
                  onClick={() => {
                    setMenuOpen(
                      false,
                    );
                    onRename();
                  }}
                />

                <MenuButton
                  icon={Move}
                  label="Déplacer"
                  onClick={() => {
                    setMenuOpen(
                      false,
                    );
                    onMove();
                  }}
                />

                <div className="my-1 border-t border-[#eeeae5]" />

                <MenuButton
                  icon={Trash2}
                  label="Supprimer"
                  danger
                  onClick={() => {
                    setMenuOpen(
                      false,
                    );
                    onDelete();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COPIED */}

        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{
                opacity: 0,
                y: 4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 4,
              }}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#242321] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.08em] text-white"
            >
              <Check size={11} />
              Copié
            </motion.div>
          )}
        )
        </AnimatePresence>
      </div>

      {/* INFO */}

      <div className="border-t border-[#e5e1db] p-3">
        <p
          className="truncate text-xs font-medium text-[#3f3c38]"
          title={item.name}
        >
          {item.name}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-[9px] uppercase tracking-[0.1em] text-[#a09a92]">
            {getTypeLabel(item.type)}
          </span>

          <span className="shrink-0 text-[10px] tabular-nums text-[#77716a]">
            {formatBytes(item.size)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================================================
   MENU BUTTON
============================================================ */

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] transition ${
        danger
          ? "text-[#9a5149] hover:bg-[#fff5f3]"
          : "text-[#57534e] hover:bg-[#f5f3ef] hover:text-[#9b7b54]"
      }`}
    >
      <Icon size={13} />

      {label}
    </button>
  );
}

/* ============================================================
   MEDIA LIST
============================================================ */

function MediaList({
  items,
  selectedIds,
  copied,
  onSelect,
  onOpenFolder,
  onPreview,
  onCopy,
  onDownload,
  onRename,
  onMove,
  onDelete,
}: {
  items: StorageItem[];
  selectedIds: string[];
  copied: string | null;
  onSelect: (item: StorageItem) => void;
  onOpenFolder: (path: string) => void;
  onPreview: (item: StorageItem) => void;
  onCopy: (item: StorageItem) => void;
  onDownload: (item: StorageItem) => void;
  onRename: (item: StorageItem) => void;
  onMove: (item: StorageItem) => void;
  onDelete: (item: StorageItem) => void;
}) {
  return (
    <div className="mt-4 overflow-hidden border border-[#dedbd5] bg-white">
      <div className="hidden grid-cols-[42px_minmax(250px,1.7fr)_120px_120px_150px_150px_90px] gap-3 border-b border-[#dedbd5] bg-[#faf9f7] px-4 py-3 text-[9px] uppercase tracking-[0.16em] text-[#99938b] md:grid">
        <span />

        <span>Nom</span>

        <span>Type</span>

        <span>Taille</span>

        <span>Emplacement</span>

        <span>Ajouté</span>

        <span />
      </div>

      {items.map((item, index) => {
        if (item.isFolder) {
          return (
            <button
              key={item.id}
              type="button"
              onDoubleClick={() =>
                onOpenFolder(
                  item.path,
                )
              }
              onClick={() =>
                onOpenFolder(
                  item.path,
                )
              }
              className="flex w-full items-center gap-3 border-b border-[#eeeae5] px-4 py-4 text-left transition hover:bg-[#faf9f7]"
            >
              <div className="flex h-8 w-8 items-center justify-center bg-[#f2eee7] text-[#9b7b54]">
                <Folder
                  size={16}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {item.name}
                </p>

                <p className="mt-1 text-[9px] text-[#aaa49c]">
                  {item.childrenCount ??
                    0}{" "}
                  éléments
                </p>
              </div>

              <ArrowUpRight
                size={14}
                className="text-[#aaa49c]"
              />
            </button>
          );
        }

        const Icon =
          getFileIcon(item.type);

        const selected =
          selectedIds.includes(
            item.id,
          );

        return (
          <div
            key={item.id}
            className={`group grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#eeeae5] px-4 py-3 transition md:grid-cols-[42px_minmax(250px,1.7fr)_120px_120px_150px_150px_90px] ${
              selected
                ? "bg-[#faf7f2]"
                : "hover:bg-[#fcfbf9]"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                onSelect(item)
              }
              className={`flex h-5 w-5 items-center justify-center border ${
                selected
                  ? "border-[#9b7b54] bg-[#9b7b54] text-white"
                  : "border-[#cfc9c0] text-transparent hover:border-[#9b7b54]"
              }`}
            >
              <Check size={11} />
            </button>

            <button
              type="button"
              onDoubleClick={() =>
                onPreview(item)
              }
              onClick={() =>
                onPreview(item)
              }
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <div className="hidden h-10 w-12 shrink-0 overflow-hidden bg-[#eeece8] sm:block">
                {isImagePreviewable(
                  item,
                ) ? (
                  <img
                    src={item.url ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#9b7b54]">
                    <Icon
                      size={17}
                      strokeWidth={1.3}
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="truncate text-xs font-medium text-[#403d39]"
                  title={item.name}
                >
                  {item.name}
                </p>

                <p
                  className="mt-1 truncate text-[9px] text-[#aaa49c]"
                  title={item.path}
                >
                  {item.path}
                </p>
              </div>
            </button>

            <span className="hidden text-[10px] text-[#77716a] md:block">
              {getTypeLabel(
                item.type,
              )}
            </span>

            <span className="hidden text-[10px] tabular-nums text-[#77716a] md:block">
              {formatBytes(
                item.size,
              )}
            </span>

            <span className="hidden truncate text-[10px] text-[#99938b] md:block">
              {item.bucket}
            </span>

            <span className="hidden text-[10px] text-[#99938b] md:block">
              {formatDate(
                item.createdAt,
              )}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  onCopy(item)
                }
                className="flex h-8 w-8 items-center justify-center text-[#aaa49c] transition hover:text-[#9b7b54]"
                title="Copier URL"
              >
                {copied ===
                item.id ? (
                  <Check
                    size={14}
                  />
                ) : (
                  <Copy
                    size={14}
                  />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingLibrary() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({
        length: 10,
      }).map((_, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: index * 0.03,
          }}
          className="overflow-hidden border border-[#dedbd5] bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-[#eae7e2]" />

          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse bg-[#eae7e2]" />

            <div className="h-2 w-1/2 animate-pulse bg-[#eeeae5]" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyLibrary({
  search,
  onUpload,
}: {
  search: string;
  onUpload: () => void;
}) {
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
      className="mt-4 border border-dashed border-[#d2cdc5] bg-white px-6 py-20 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#f2eee7] text-[#9b7b54]">
        {search ? (
          <Search
            size={24}
            strokeWidth={1.3}
          />
        ) : (
          <Cloud
            size={25}
            strokeWidth={1.3}
          />
        )}
      </div>

      <h3 className="mt-5 font-serif text-xl">
        {search
          ? "Aucun média trouvé"
          : "Ce dossier est vide"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#99938b]">
        {search
          ? "Aucun fichier ne correspond à votre recherche ou aux filtres actuels."
          : "Importez vos premières ressources dans cet espace pour commencer à construire votre bibliothèque."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-6 inline-flex h-10 items-center gap-2 bg-[#242321] px-5 text-[10px] uppercase tracking-[0.12em] text-white transition hover:bg-[#9b7b54]"
        >
          <Upload size={14} />
          Importer des médias
        </button>
      )}
    </motion.div>
  );
}

/* ============================================================
   UPLOAD MODAL
============================================================ */

function UploadModal({
  files,
  uploading,
  progress,
  currentPath,
  bucket,
  dragActive,
  setDragActive,
  onClose,
  onFiles,
  onRemove,
  onUpload,
  fileInputRef,
}: {
  files: File[];
  uploading: boolean;
  progress: number;
  currentPath: string;
  bucket: BucketName;
  dragActive: boolean;
  setDragActive: (
    value: boolean,
  ) => void;
  onClose: () => void;
  onFiles: (
    files: FileList | File[],
  ) => void;
  onRemove: (index: number) => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <ModalShell
      onClose={onClose}
      disabled={uploading}
    >
      <div className="flex items-start justify-between gap-5 border-b border-[#dedbd5] p-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#9b7b54]">
            Importation
          </p>

          <h2 className="mt-2 font-serif text-2xl">
            Ajouter des médias
          </h2>

          <p className="mt-1 text-xs text-[#99938b]">
            {bucket} ·{" "}
            {currentPath}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={uploading}
          className="flex h-9 w-9 items-center justify-center border border-[#dedbd5] text-[#77716a] hover:text-[#9b7b54] disabled:opacity-40"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            if (
              event.target.files
            ) {
              onFiles(
                event.target.files,
              );
              event.target.value =
                "";
            }
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);

            if (
              event.dataTransfer.files
            ) {
              onFiles(
                event.dataTransfer.files,
              );
            }
          }}
          onClick={() =>
            fileInputRef.current?.click()
          }
          className={`flex min-h-[220px] w-full flex-col items-center justify-center border border-dashed px-6 text-center transition ${
            dragActive
              ? "border-[#9b7b54] bg-[#faf6ef]"
              : "border-[#cec8bf] bg-[#faf9f7] hover:border-[#9b7b54] hover:bg-[#fcfaf7]"
          } disabled:cursor-not-allowed`}
        >
          <div className="flex h-14 w-14 items-center justify-center bg-[#f0ece5] text-[#9b7b54]">
            <Upload
              size={23}
              strokeWidth={1.4}
            />
          </div>

          <p className="mt-5 text-sm font-medium">
            Déposez vos fichiers ici
          </p>

          <p className="mt-1 text-[11px] text-[#99938b]">
            ou cliquez pour parcourir votre
            ordinateur
          </p>

          <span className="mt-4 text-[9px] uppercase tracking-[0.15em] text-[#b0aaa2]">
            Import multiple autorisé
          </span>
        </button>

        {files.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#77716a]">
                Fichiers sélectionnés
              </p>

              <span className="text-[10px] text-[#aaa49c]">
                {files.length} fichier
                {files.length > 1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {files.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 border border-[#e3dfd9] bg-[#faf9f7] p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-[#9b7b54]">
                      {file.type.startsWith(
                        "image/",
                      ) ? (
                        <FileImage
                          size={15}
                        />
                      ) : file.type.startsWith(
                          "video/",
                        ) ? (
                        <Film
                          size={15}
                        />
                      ) : (
                        <File
                          size={15}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {file.name}
                      </p>

                      <p className="mt-1 text-[9px] text-[#aaa49c]">
                        {formatBytes(
                          file.size,
                        )}
                      </p>
                    </div>

                    {!uploading && (
                      <button
                        type="button"
                        onClick={() =>
                          onRemove(
                            index,
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center text-[#aaa49c] hover:text-[#9a5149]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[10px]">
              <span className="text-[#77716a]">
                Importation en cours...
              </span>

              <span className="font-medium tabular-nums text-[#9b7b54]">
                {progress}%
              </span>
            </div>

            <div className="h-1 bg-[#e8e4de]">
              <motion.div
                animate={{
                  width: `${progress}%`,
                }}
                className="h-full bg-[#9b7b54]"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="h-11 border border-[#dedbd5] px-5 text-[10px] uppercase tracking-[0.12em] text-[#68635c] transition hover:border-[#9b7b54] hover:text-[#9b7b54] disabled:opacity-40"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onUpload}
            disabled={
              uploading ||
              files.length === 0
            }
            className="inline-flex h-11 items-center gap-2 bg-[#242321] px-6 text-[10px] uppercase tracking-[0.12em] text-white transition hover:bg-[#9b7b54] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Upload size={14} />
            )}

            {uploading
              ? "Importation..."
              : "Importer"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   PREVIEW MODAL
============================================================ */

function PreviewModal({
  item,
  onClose,
  onCopy,
  onDownload,
}: {
  item: StorageItem;
  onClose: () => void;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <ModalShell
      onClose={onClose}
      dark
    >
      <div className="relative">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#242321] px-5 py-4 text-white">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              {item.name}
            </p>

            <p className="mt-1 text-[9px] text-white/40">
              {item.bucket} ·{" "}
              {formatBytes(item.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-white/60 transition hover:border-[#9b7b54] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex min-h-[55vh] max-h-[72vh] items-center justify-center overflow-auto bg-[#181817] p-5 md:p-10">
          {isImagePreviewable(item) ? (
            <img
              src={item.url ?? ""}
              alt={item.name}
              className="max-h-[65vh] max-w-full object-contain shadow-2xl"
            />
          ) : isVideoPreviewable(
              item,
            ) ? (
            <video
              src={item.url ?? ""}
              controls
              className="max-h-[65vh] max-w-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-white/60">
              <File
                size={54}
                strokeWidth={1}
              />

              <p className="mt-5 text-sm">
                Aperçu indisponible pour ce
                format.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 bg-[#242321] p-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="truncate text-[10px] text-white/50">
              {item.path}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-[9px] uppercase tracking-[0.1em] text-white/70 transition hover:border-[#9b7b54] hover:text-white"
            >
              <Copy size={13} />
              Copier URL
            </button>

            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-9 items-center gap-2 bg-[#9b7b54] px-3 text-[9px] uppercase tracking-[0.1em] text-white transition hover:bg-[#b18e64]"
            >
              <Download size={13} />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   DELETE MODAL
============================================================ */

function DeleteModal({
  count,
  loading,
  onClose,
  onConfirm,
}: {
  count: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      onClose={onClose}
      disabled={loading}
    >
      <div className="p-7">
        <div className="flex h-12 w-12 items-center justify-center bg-[#fff0ed] text-[#a05249]">
          <Trash2
            size={20}
            strokeWidth={1.4}
          />
        </div>

        <h2 className="mt-5 font-serif text-2xl">
          Supprimer{" "}
          {count > 1
            ? "ces médias"
            : "ce média"}{" "}
          ?
        </h2>

        <p className="mt-2 max-w-md text-xs leading-5 text-[#8f8981]">
          Cette opération supprime définitivement{" "}
          <strong className="text-[#5a554f]">
            {count} élément
            {count > 1
              ? "s"
              : ""}
          </strong>{" "}
          du stockage Supabase. Elle ne peut pas
          être annulée.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 border border-[#dedbd5] px-5 text-[10px] uppercase tracking-[0.1em] text-[#68635c] disabled:opacity-40"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 bg-[#9a5149] px-5 text-[10px] uppercase tracking-[0.1em] text-white transition hover:bg-[#843f38] disabled:opacity-40"
          >
            {loading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={14} />
            )}

            Supprimer définitivement
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   RENAME MODAL
============================================================ */

function RenameModal({
  item,
  value,
  loading,
  onChange,
  onClose,
  onConfirm,
}: {
  item: StorageItem;
  value: string;
  loading: boolean;
  onChange: (
    value: string,
  ) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      onClose={onClose}
      disabled={loading}
    >
      <div className="p-7">
        <div className="flex h-12 w-12 items-center justify-center bg-[#f2eee7] text-[#9b7b54]">
          <Pencil
            size={19}
            strokeWidth={1.4}
          />
        </div>

        <h2 className="mt-5 font-serif text-2xl">
          Renommer le média
        </h2>

        <p className="mt-2 text-xs text-[#99938b]">
          {item.path}
        </p>

        <input
          autoFocus
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              onConfirm();
            }
          }}
          className="mt-5 h-11 w-full border border-[#dcd7d0] bg-[#faf9f7] px-3 text-sm outline-none transition focus:border-[#9b7b54]"
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 border border-[#dedbd5] px-5 text-[10px] uppercase tracking-[0.1em] text-[#68635c] disabled:opacity-40"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={
              loading ||
              !value.trim()
            }
            className="inline-flex h-10 items-center gap-2 bg-[#242321] px-5 text-[10px] uppercase tracking-[0.1em] text-white transition hover:bg-[#9b7b54] disabled:opacity-40"
          >
            {loading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Check size={14} />
            )}

            Enregistrer
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   MOVE MODAL
============================================================ */

function MoveModal({
  item,
  value,
  loading,
  onChange,
  onClose,
  onConfirm,
}: {
  item: StorageItem;
  value: string;
  loading: boolean;
  onChange: (
    value: string,
  ) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      onClose={onClose}
      disabled={loading}
    >
      <div className="p-7">
        <div className="flex h-12 w-12 items-center justify-center bg-[#f2eee7] text-[#9b7b54]">
          <Move
            size={19}
            strokeWidth={1.4}
          />
        </div>

        <h2 className="mt-5 font-serif text-2xl">
          Déplacer le média
        </h2>

        <p className="mt-2 truncate text-xs text-[#99938b]">
          {item.name}
        </p>

        <label className="mt-5 block">
          <span className="mb-2 block text-[9px] uppercase tracking-[0.16em] text-[#77716a]">
            Dossier de destination
          </span>

          <input
            autoFocus
            value={value}
            onChange={(event) =>
              onChange(
                event.target.value,
              )
            }
            placeholder="ex. projects/mon-projet/gallery"
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                onConfirm();
              }
            }}
            className="h-11 w-full border border-[#dcd7d0] bg-[#faf9f7] px-3 text-sm outline-none transition focus:border-[#9b7b54]"
          />
        </label>

        <p className="mt-2 text-[10px] leading-4 text-[#aaa49c]">
          Laissez vide pour déplacer le fichier
          à la racine du bucket.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 border border-[#dedbd5] px-5 text-[10px] uppercase tracking-[0.1em] text-[#68635c] disabled:opacity-40"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 bg-[#242321] px-5 text-[10px] uppercase tracking-[0.1em] text-white transition hover:bg-[#9b7b54] disabled:opacity-40"
          >
            {loading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Move size={14} />
            )}

            Déplacer
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   MODAL SHELL
============================================================ */

function ModalShell({
  children,
  onClose,
  disabled = false,
  dark = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  disabled?: boolean;
  dark?: boolean;
}) {
  return (
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          if (!disabled) {
            onClose();
          }
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
          y: 10,
          scale: 0.98,
        }}
        transition={{
          duration: 0.2,
        }}
        className={`max-h-[92vh] w-full max-w-3xl overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.22)] ${
          dark
            ? "bg-[#242321]"
            : "bg-white"
        }`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
