"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import { createBrowserClient } from "@supabase/ssr";

/* ============================================================
   SUPABASE
============================================================ */

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/* ============================================================
   TYPES
============================================================ */

type ProjectStatus =
  | "En cours"
  | "À valider"
  | "En attente"
  | "Terminé";

type RequestStatus =
  | "Nouveau"
  | "En analyse"
  | "En cours"
  | "Répondu";

type NotificationType =
  | "message"
  | "project"
  | "request"
  | "article"
  | "system";

interface Project {
  id: string;
  reference: string;
  name: string;
  client: string;
  location: string;
  type: string;
  progress: number;
  status: ProjectStatus;
  deadline: string;
  deadlineDate: string | null;
  budget: string;
  image: string;
}

interface Request {
  id: string;
  reference: string;
  name: string;
  project: string;
  location: string;
  date: string;
  status: RequestStatus;
  type: string;
}

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

interface ActivityItem {
  id: string;
  number: string;
  title: string;
  description: string;
  time: string;
  type: string;
}

interface QuickAction {
  number: string;
  title: string;
  description: string;
  href: string;
}

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

interface SearchResult {
  type: string;
  title: string;
  href: string;
}

interface DashboardData {
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    avatar_url: string | null;
  } | null;

  projects: Project[];
  requests: Request[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
  articles: ArticleItem[];

  projectCount: number;
  articleCount: number;
  messageCount: number;
  requestCount: number;

  unreadMessageCount: number;
  unreadNotificationCount: number;
  newRequestCount: number;

  publishedProjectCount: number;
  publishedArticleCount: number;

  currentProjectsCount: number;
  validationProjectsCount: number;
  completedProjectsCount: number;
  upcomingDeadlineCount: number;

  highPriorityRequestCount: number;

  mediaUsage: number;

  activityValues: number[];
}

/* ============================================================
   ICON COMPONENT
============================================================ */

function Icon({
  name,
  size = 18,
  strokeWidth = 1.4,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      );

    case "arrowUp":
      return (
        <svg {...common}>
          <path d="M12 19V5" />
          <path d="M6 11l6-6 6 6" />
        </svg>
      );

    case "arrowDown":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M18 13l-6 6-6-6" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="M15 15l5 5" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      );

    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      );

    case "project":
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V8l7-5 7 5v13" />
          <path d="M9 21v-5h6v5" />
          <path d="M8 10h2" />
          <path d="M14 10h2" />
        </svg>
      );

    case "article":
      return (
        <svg {...common}>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );

    case "message":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H8l-4 4V5z" />
          <path d="M8 9h8" />
          <path d="M8 12h5" />
        </svg>
      );

    case "request":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h5" />
        </svg>
      );

    case "media":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" />
          <circle cx="9" cy="10" r="2" />
          <path d="M3 17l5-5 4 4 3-3 6 6" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <path d="M16 5.5a3 3 0 010 5.8" />
          <path d="M18 14c2 .8 3 2.7 3 6" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 13.5a1.8 1.8 0 000-3L17.8 10a1.8 1.8 0 00-.2-1.7l.6-1.3-2-1.1-1 1.1a1.8 1.8 0 00-1.7-.2L13 5H11l-.5 1.8a1.8 1.8 0 00-1.7.2l-1-1.1-2 1.1.6 1.3A1.8 1.8 0 006.2 10L5 10.5v3l1.2.5a1.8 1.8 0 00.2 1.7l-.6 1.3 2 1.1 1-1.1a1.8 1.8 0 001.7.2L11 19h2l.5-1.8a1.8 1.8 0 001.7-.2l1 1.1 2-1.1-.6-1.3a1.8 1.8 0 00.2-1.7z" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M3 10h18" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="M5 12l4 4L19 6" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="M12 3l10 18H2L12 3z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 4H5v16h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M9 12h9" />
        </svg>
      );

    default:
      return null;
  }
}

/* ============================================================
   HELPERS
============================================================ */

function formatRelativeDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  const now = new Date();

  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "À l'instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  if (hours < 48) {
    return "Hier";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function formatMoney(
  value: number | null | undefined,
  currency = "USD",
) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value) + ` ${currency === "USD" ? "$" : currency}`;
}

function projectStatusFromDatabase(
  status: string | null,
  progress: number,
): ProjectStatus {
  if (status === "published" && progress >= 100) {
    return "Terminé";
  }

  if (status === "draft") {
    return "À valider";
  }

  if (status === "archived") {
    return "En attente";
  }

  return "En cours";
}

function requestStatusFromDatabase(
  status: string | null,
): RequestStatus {
  switch (status) {
    case "new":
      return "Nouveau";

    case "reviewing":
      return "En analyse";

    case "in_progress":
      return "En cours";

    case "contacted":
    case "completed":
      return "Répondu";

    case "rejected":
    case "cancelled":
      return "Répondu";

    default:
      return "Nouveau";
  }
}

function requestTypeLabel(value: string | null) {
  if (!value) {
    return "Demande de projet";
  }

  return value;
}

function projectTypeLabel(value: string | null) {
  if (!value) {
    return "Architecture";
  }

  return value;
}

function getInitials(
  firstName: string,
  lastName: string,
  fullName?: string | null,
) {
  if (firstName || lastName) {
    return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
      .trim()
      .toUpperCase();
  }

  if (fullName) {
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  return "AD";
}

function activityPath(
  values: number[],
) {
  if (!values.length) {
    return "M0 190 C80 175 110 180 160 150 C210 120 240 140 290 125 C340 110 370 120 420 92 C470 65 520 100 570 72 C620 45 670 78 720 54 C770 31 820 62 870 38 C920 15 960 30 1000 12";
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => {
    const x =
      values.length === 1
        ? 0
        : (index / (values.length - 1)) * 1000;

    const normalized =
      (value - min) / range;

    const y =
      185 -
      normalized * 155;

    return {
      x,
      y,
    };
  });

  if (points.length === 1) {
    return `M0 ${points[0].y}`;
  }

  let path = `M${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const current = points[index];

    const controlOffset =
      (current.x - previous.x) * 0.35;

    path += ` C${previous.x + controlOffset} ${previous.y} ${current.x - controlOffset
      } ${current.y} ${current.x} ${current.y}`;
  }

  return path;
}

/* ============================================================
   DATA LOADING
============================================================ */

async function loadDashboardData(
  period: string,
): Promise<DashboardData> {
  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    throw new Error("Utilisateur non authentifié.");
  }

  const periodDays =
    period === "7 jours"
      ? 7
      : period === "3 mois"
        ? 90
        : 30;

  const periodStart = new Date();

  periodStart.setDate(
    periodStart.getDate() - periodDays,
  );

  const periodStartIso =
    periodStart.toISOString();

  const [
    profileResult,
    projectsResult,
    requestsResult,
    notificationsResult,
    activitiesResult,
    articlesResult,
    projectCountResult,
    publishedProjectCountResult,
    requestCountResult,
    newRequestCountResult,
    messageCountResult,
    unreadMessageCountResult,
    articleCountResult,
    publishedArticleCountResult,
    unreadNotificationCountResult,
    currentProjectsResult,
    validationProjectsResult,
    completedProjectsResult,
    highPriorityRequestResult,
    recentProjectActivityResult,
    recentRequestActivityResult,
    recentMessageActivityResult,
    recentArticleActivityResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "first_name,last_name,full_name,role,is_active,avatar_url",
      )
      .eq("id", user.id)
      .single(),

    supabase
      .from("projects")
      .select(
        `
          id,
          reference,
          title,
          project_type,
          city,
          province,
          country,
          progress,
          budget,
          budget_currency,
          cover_image_url,
          status,
          deadline,
          client_name,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    supabase
      .from("project_requests")
      .select(
        `
          id,
          reference,
          first_name,
          last_name,
          email,
          phone,
          company,
          project_name,
          project_type,
          city,
          province,
          country,
          status,
          priority,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    supabase
      .from("notifications")
      .select(
        `
          id,
          type,
          title,
          description,
          reference_id,
          reference_type,
          is_read,
          created_at
        `,
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    supabase
      .from("activity_logs")
      .select(
        `
          id,
          action,
          entity_type,
          entity_id,
          title,
          description,
          metadata,
          created_at,
          user_id
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    supabase
      .from("articles")
      .select(
        `
          id,
          title,
          slug,
          excerpt,
          category,
          status,
          featured,
          published_at,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(8),

    supabase
      .from("projects")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("projects")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "published"),

    supabase
      .from("project_requests")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("project_requests")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "new"),

    supabase
      .from("messages")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("messages")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "unread"),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "published"),

    supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false),

    supabase
      .from("projects")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "published")
      .lt("progress", 100),

    supabase
      .from("projects")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "draft"),

    supabase
      .from("projects")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("progress", 100),

    supabase
      .from("project_requests")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("priority", ["high", "urgent"]),

    supabase
      .from("projects")
      .select("created_at")
      .gte("created_at", periodStartIso)
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("project_requests")
      .select("created_at")
      .gte("created_at", periodStartIso)
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("messages")
      .select("created_at")
      .gte("created_at", periodStartIso)
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("articles")
      .select("created_at")
      .gte("created_at", periodStartIso)
      .order("created_at", {
        ascending: true,
      }),
  ]);

  const queryErrors = [
    profileResult.error,
    projectsResult.error,
    requestsResult.error,
    notificationsResult.error,
    activitiesResult.error,
    articlesResult.error,
    projectCountResult.error,
    publishedProjectCountResult.error,
    requestCountResult.error,
    newRequestCountResult.error,
    messageCountResult.error,
    unreadMessageCountResult.error,
    articleCountResult.error,
    publishedArticleCountResult.error,
    unreadNotificationCountResult.error,
    currentProjectsResult.error,
    validationProjectsResult.error,
    completedProjectsResult.error,
    highPriorityRequestResult.error,
    recentProjectActivityResult.error,
    recentRequestActivityResult.error,
    recentMessageActivityResult.error,
    recentArticleActivityResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    console.error(
      "Erreur Supabase dashboard:",
      queryErrors,
    );
  }

  const profile = profileResult.data;

  if (
    !profile ||
    !profile.is_active ||
    !["admin", "editor"].includes(
      profile.role,
    )
  ) {
    await supabase.auth.signOut();

    window.location.href = "/login";

    throw new Error(
      "Accès administrateur non autorisé.",
    );
  }

  const projectRows =
    projectsResult.data ?? [];

  const requestRows =
    requestsResult.data ?? [];

  const notificationRows =
    notificationsResult.data ?? [];

  const activityRows =
    activitiesResult.data ?? [];

  const articleRows =
    articlesResult.data ?? [];

  const projects: Project[] =
    projectRows.map((project) => {
      const progress =
        Number(project.progress ?? 0);

      const location = [
        project.city,
        project.province,
        project.country,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: String(project.id),
        reference:
          project.reference ??
          "PRJ",
        name:
          project.title ??
          "Projet sans titre",
        client:
          project.client_name ??
          "Client non renseigné",
        location:
          location ||
          "Localisation non renseignée",
        type: projectTypeLabel(
          project.project_type,
        ),
        progress,
        status:
          projectStatusFromDatabase(
            project.status,
            progress,
          ),
        deadline:
          formatDate(project.deadline),
        deadlineDate:
          project.deadline ?? null,
        budget: formatMoney(
          project.budget,
          project.budget_currency ??
          "USD",
        ),
        image:
          project.cover_image_url ??
          "/images/placeholder-project.jpg",
      };
    });

  const requests: Request[] =
    requestRows.map((request) => {
      const name = [
        request.first_name,
        request.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      const location = [
        request.city,
        request.province,
        request.country,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: String(request.id),
        reference:
          request.reference ??
          "REQ",
        name:
          name ||
          request.company ||
          request.email ||
          "Demandeur",
        project:
          request.project_name ??
          "Projet sans nom",
        location:
          location ||
          "Localisation non renseignée",
        date:
          formatRelativeDate(
            request.created_at,
          ),
        status:
          requestStatusFromDatabase(
            request.status,
          ),
        type: requestTypeLabel(
          request.project_type,
        ),
      };
    });

  const notifications: NotificationItem[] =
    notificationRows.map(
      (notification) => ({
        id: String(notification.id),
        type:
          notification.type ===
            "message" ||
            notification.type ===
            "project" ||
            notification.type ===
            "request" ||
            notification.type ===
            "article" ||
            notification.type ===
            "system"
            ? notification.type
            : "system",
        title:
          notification.title ??
          "Notification",
        description:
          notification.description ??
          "",
        time:
          formatRelativeDate(
            notification.created_at,
          ),
        unread:
          Boolean(notification.is_read) ===
          false,
      }),
    );

  const activities: ActivityItem[] =
    activityRows.map(
      (activity, index) => ({
        id: String(activity.id),
        number:
          String(index + 1).padStart(
            2,
            "0",
          ),
        title:
          activity.title ??
          activity.action ??
          "Activité",
        description:
          activity.description ??
          "",
        time:
          formatRelativeDate(
            activity.created_at,
          ),
        type:
          activity.entity_type ??
          "Système",
      }),
    );

  const articles: ArticleItem[] =
    articleRows.map((article) => ({
      id: String(article.id),
      title:
        article.title ??
        "Article sans titre",
      slug:
        article.slug ??
        String(article.id),
      excerpt:
        article.excerpt ??
        "",
      category:
        article.category ??
        "Article",
      status:
        article.status ??
        "draft",
      publishedAt:
        article.published_at ??
        null,
      createdAt:
        article.created_at,
    }));

  const activityDates = [
    ...(recentProjectActivityResult.data ??
      []),
    ...(recentRequestActivityResult.data ??
      []),
    ...(recentMessageActivityResult.data ??
      []),
    ...(recentArticleActivityResult.data ??
      []),
  ]
    .map((item) =>
      new Date(item.created_at),
    )
    .filter((date) => !Number.isNaN(date.getTime()));

  const bucketCount =
    periodDays <= 7
      ? 7
      : periodDays <= 30
        ? 5
        : 6;

  const activityValues = Array.from(
    {
      length: bucketCount,
    },
    () => 0,
  );

  activityDates.forEach((date) => {
    const elapsed =
      Date.now() -
      date.getTime();

    const ageDays =
      elapsed / 86400000;

    if (
      ageDays < 0 ||
      ageDays > periodDays
    ) {
      return;
    }

    const position =
      Math.min(
        bucketCount - 1,
        Math.floor(
          ((periodDays - ageDays) /
            periodDays) *
          bucketCount,
        ),
      );

    activityValues[
      Math.max(0, position)
    ] += 1;
  });

  const today = new Date();

  const upcomingDeadlineCount =
    projectRows.filter((project) => {
      if (!project.deadline) {
        return false;
      }

      const deadline =
        new Date(project.deadline);

      const difference =
        deadline.getTime() -
        today.getTime();

      const days =
        difference /
        86400000;

      return (
        days >= 0 &&
        days <= 30
      );
    }).length;

  return {
    profile: {
      firstName:
        profile.first_name ?? "",

      lastName:
        profile.last_name ?? "",

      fullName:
        profile.full_name ??
        [
          profile.first_name,
          profile.last_name,
        ]
          .filter(Boolean)
          .join(" "),

      role:
        profile.role === "admin"
          ? "Administrateur"
          : "Éditeur",

      avatar_url:
        profile.avatar_url ?? null,
    },
    projects,
    requests,
    notifications,
    activities,
    articles,

    projectCount:
      projectCountResult.count ?? 0,

    articleCount:
      articleCountResult.count ?? 0,

    messageCount:
      messageCountResult.count ?? 0,

    requestCount:
      requestCountResult.count ?? 0,

    unreadMessageCount:
      unreadMessageCountResult.count ?? 0,

    unreadNotificationCount:
      unreadNotificationCountResult.count ??
      0,

    newRequestCount:
      newRequestCountResult.count ?? 0,

    publishedProjectCount:
      publishedProjectCountResult.count ??
      0,

    publishedArticleCount:
      publishedArticleCountResult.count ??
      0,

    currentProjectsCount:
      currentProjectsResult.count ?? 0,

    validationProjectsCount:
      validationProjectsResult.count ??
      0,

    completedProjectsCount:
      completedProjectsResult.count ??
      0,

    upcomingDeadlineCount,

    highPriorityRequestCount:
      highPriorityRequestResult.count ??
      0,

    /*
     * Le bucket site_media pourra alimenter
     * ce chiffre lorsque le stockage sera
     * relié à une mesure de capacité.
     *
     * On ne fabrique donc pas de valeur.
     */
    mediaUsage: 0,

    activityValues,
  };
}

/* ============================================================
   STATUS HELPERS
============================================================ */

function projectStatusClass(
  status: ProjectStatus,
) {
  switch (status) {
    case "En cours":
      return "text-[#9b7b54]";

    case "À valider":
      return "text-[#8b6b3f]";

    case "En attente":
      return "text-[#77736c]";

    case "Terminé":
      return "text-[#4f6354]";

    default:
      return "text-[#77736c]";
  }
}

function requestStatusClass(
  status: RequestStatus,
) {
  switch (status) {
    case "Nouveau":
      return "border-[#9b7b54]/40 bg-[#9b7b54]/10 text-[#8c6d49]";

    case "En analyse":
      return "border-[#1c1c1a]/10 bg-[#1c1c1a]/5 text-[#77736c]";

    case "En cours":
      return "border-[#9b7b54]/20 bg-[#9b7b54]/5 text-[#77736c]";

    case "Répondu":
      return "border-[#1c1c1a]/10 bg-transparent text-[#aaa69e]";

    default:
      return "border-[#1c1c1a]/10 text-[#77736c]";
  }
}

/* ============================================================
   STAT BLOCK
============================================================ */

function DashboardStat({
  number,
  label,
  description,
  variation,
  index,
}: {
  number: string;
  label: string;
  description: string;
  variation: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
      }}
      className="group relative border-t border-[#1c1c1a]/10 py-7"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#77736c]">
            {label}
          </p>

          <p className="mt-3 max-w-[180px] text-[11px] leading-5 text-[#aaa69e]">
            {description}
          </p>
        </div>

        <div className="text-right">
          <p className="text-4xl font-light tracking-[-0.05em] sm:text-5xl">
            {number}
          </p>

          <p className="mt-2 text-[8px] uppercase tracking-[0.18em] text-[#9b7b54]">
            {variation}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#9b7b54] transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  eyebrow,
  title,
  action,
  actionHref,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6">
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-light tracking-[-0.035em] sm:text-3xl">
          {title}
        </h2>
      </div>

      {action && actionHref ? (
        <Link
          href={actionHref}
          className="group hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-[#77736c] transition-colors hover:text-[#9b7b54] sm:flex"
        >
          <span>{action}</span>

          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

/* ============================================================
   PROJECT CARD
============================================================ */

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
      }}
      className="group overflow-hidden border border-[#1c1c1a]/10"
    >
      <div className="relative h-[190px] overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="h-full w-full object-cover grayscale-[25%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1a]/60 via-transparent to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="border border-white/30 bg-[#1c1c1a]/30 px-3 py-1.5 text-[8px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {project.reference}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/70">
              {project.type}
            </p>

            <h3 className="mt-1 text-xl font-light text-white">
              {project.name}
            </h3>
          </div>

          <span
            className={`px-2 py-1 text-[8px] uppercase tracking-[0.15em] ${projectStatusClass(
              project.status,
            )}`}
          >
            {project.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.18em] text-[#aaa69e]">
              Localisation
            </p>

            <p className="mt-1 text-[10px]">
              {project.location}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] uppercase tracking-[0.18em] text-[#aaa69e]">
              Échéance
            </p>

            <p className="mt-1 text-[10px]">
              {project.deadline}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[8px] uppercase tracking-[0.18em] text-[#77736c]">
              Progression
            </span>

            <span className="text-[9px] text-[#9b7b54]">
              {project.progress}%
            </span>
          </div>

          <div className="h-[2px] w-full bg-[#1c1c1a]/10">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${project.progress}%`,
              }}
              transition={{
                duration: 1,
                delay: 0.3 + index * 0.1,
              }}
              className="h-full bg-[#9b7b54]"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#1c1c1a]/10 pt-4">
          <span className="text-[9px] text-[#77736c]">
            {project.client}
          </span>

          <Link
            href={`/admin/projets/${project.id}`}
            className="group/link flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#77736c] hover:text-[#9b7b54]"
          >
            Ouvrir
            <span className="transition-transform group-hover/link:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================================================
   REQUEST ROW
============================================================ */

function RequestRow({
  request,
  index,
}: {
  request: Request;
  index: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -15,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
      }}
      className="group grid grid-cols-[38px_1fr_auto] items-center gap-4 border-b border-[#1c1c1a]/10 py-5 md:grid-cols-[45px_1.4fr_1fr_auto_auto]"
    >
      <span className="text-[9px] text-[#aaa69e]">
        {request.reference}
      </span>

      <div>
        <p className="text-[11px] uppercase tracking-[0.05em]">
          {request.project}
        </p>

        <p className="mt-1 text-[9px] text-[#77736c]">
          {request.name} ·{" "}
          {request.location}
        </p>
      </div>

      <p className="hidden text-[9px] text-[#77736c] md:block">
        {request.type}
      </p>

      <span
        className={`hidden whitespace-nowrap border px-2.5 py-1 text-[7px] uppercase tracking-[0.12em] md:inline-block ${requestStatusClass(
          request.status,
        )}`}
      >
        {request.status}
      </span>

      <div className="flex items-center gap-3">
        <span className="hidden text-[8px] text-[#aaa69e] sm:block">
          {request.date}
        </span>

        <Icon
          name="arrow"
          size={14}
          strokeWidth={1}
        />
      </div>
    </motion.div>
  );
}

/* ============================================================
   NOTIFICATION PANEL
============================================================ */

function NotificationPanel({
  open,
  onClose,
  notifications: notificationItems,
  onMarkAll,
}: {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAll: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
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
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-[#1c1c1a]/20 backdrop-blur-sm"
          />

          <motion.aside
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-[430px] flex-col border-l border-[#1c1c1a]/10"
          >
            <div className="flex h-[90px] items-center justify-between border-b border-[#1c1c1a]/10 px-7">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
                  Centre de contrôle
                </p>

                <h2 className="mt-1 text-xl font-light">
                  Notifications
                </h2>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center border border-[#1c1c1a]/10 text-[#77736c] hover:border-[#9b7b54] hover:text-[#9b7b54]"
              >
                <Icon name="close" size={17} />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-[#1c1c1a]/10 px-7 py-4">
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#77736c]">
                {
                  notificationItems.filter(
                    (item) => item.unread,
                  ).length
                }{" "}
                non lues
              </span>

              <button
                onClick={onMarkAll}
                className="text-[8px] uppercase tracking-[0.2em] text-[#9b7b54] hover:opacity-70"
              >
                Tout marquer comme lu
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notificationItems.length > 0 ? (
                notificationItems.map(
                  (
                    notification,
                    index,
                  ) => (
                    <motion.div
                      key={notification.id}
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                      className={`border-b border-[#1c1c1a]/10 px-7 py-6 ${notification.unread
                        ? "bg-[#9b7b54]/[0.035]"
                        : ""
                        }`}
                    >
                      <div className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#1c1c1a]/10 text-[#9b7b54]">
                          <Icon
                            name={
                              notification.type ===
                                "message"
                                ? "message"
                                : notification.type ===
                                  "project"
                                  ? "project"
                                  : notification.type ===
                                    "request"
                                    ? "request"
                                    : notification.type ===
                                      "article"
                                      ? "article"
                                      : "activity"
                            }
                            size={15}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] uppercase tracking-[0.08em]">
                              {
                                notification.title
                              }
                            </p>

                            {notification.unread ? (
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9b7b54]" />
                            ) : null}
                          </div>

                          <p className="mt-2 text-[10px] leading-5 text-[#77736c]">
                            {
                              notification.description
                            }
                          </p>

                          <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-[#aaa69e]">
                            {
                              notification.time
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ),
                )
              ) : (
                <div className="px-7 py-12 text-center">
                  <p className="text-sm font-light">
                    Aucune notification.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-[#1c1c1a]/10 p-7">
              <Link
                href="/admin/messages"
                onClick={onClose}
                className="group flex h-12 items-center justify-between border border-[#1c1c1a]/10 px-5 text-[9px] uppercase tracking-[0.2em] hover:border-[#9b7b54]"
              >
                <span>
                  Voir toute l'activité
                </span>

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   QUICK ACTION PANEL
============================================================ */

function QuickActionPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const quickActions: QuickAction[] = [
    {
      number: "01",
      title: "Nouveau projet",
      description:
        "Ajouter un projet architectural",
      href: "/admin/projets/nouveau",
    },
    {
      number: "02",
      title: "Nouvel article",
      description:
        "Publier une nouvelle réflexion",
      href: "/admin/articles/nouveau",
    },
    {
      number: "03",
      title: "Voir les demandes",
      description:
        "Consulter les projets reçus",
      href: "/admin/demandes",
    },
    {
      number: "04",
      title: "Médiathèque",
      description:
        "Gérer les images et documents",
      href: "/admin/medias",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
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
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-[#1c1c1a]/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            className="fixed left-1/2 top-1/2 z-[100] w-[calc(100%-32px)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 border border-[#1c1c1a]/10 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1c1c1a]/10 px-7 py-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
                  Actions rapides
                </p>

                <h2 className="mt-2 text-2xl font-light">
                  Que souhaitez-vous faire ?
                </h2>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center border border-[#1c1c1a]/10 text-[#77736c] hover:border-[#9b7b54]"
              >
                <Icon name="close" size={17} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2">
              {quickActions.map(
                (action) => (
                  <Link
                    key={action.number}
                    href={action.href}
                    onClick={onClose}
                    className="group border-b border-r border-[#1c1c1a]/10 p-7 transition-colors hover:bg-[#1c1c1a] hover:text-[#f5f2ea]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] text-[#9b7b54]">
                        {action.number}
                      </span>

                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                    <h3 className="mt-8 text-lg font-light">
                      {action.title}
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-[#77736c] group-hover:text-[#aaa69e]">
                      {
                        action.description
                      }
                    </p>
                  </Link>
                ),
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   SEARCH PANEL
============================================================ */

function SearchPanel({
  open,
  onClose,
  projects,
  articles,
  requests,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  articles: ArticleItem[];
  requests: Request[];
}) {
  const [query, setQuery] =
    useState("");

  const results = useMemo(() => {
    const allResults: SearchResult[] = [
      ...projects.map(
        (project) => ({
          type: "Projet",
          title: project.name,
          href: `/admin/projets/${project.id}`,
        }),
      ),

      ...articles.map(
        (article) => ({
          type: "Article",
          title: article.title,
          href: `/admin/articles/${article.slug}`,
        }),
      ),

      ...requests.map(
        (request) => ({
          type: "Demande",
          title: request.project,
          href: `/admin/demandes`,
        }),
      ),
    ];

    if (!query.trim()) {
      return allResults.slice(0, 5);
    }

    const normalized =
      query.toLowerCase().trim();

    return allResults.filter(
      (result) =>
        result.title
          .toLowerCase()
          .includes(normalized),
    );
  }, [
    query,
    projects,
    articles,
    requests,
  ]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
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
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-[#1c1c1a]/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              y: -30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -30,
            }}
            className="fixed left-1/2 top-[12%] z-[100] w-[calc(100%-32px)] max-w-[720px] -translate-x-1/2 border border-[#1c1c1a]/10 shadow-2xl"
          >
            <div className="flex items-center gap-4 border-b border-[#1c1c1a]/10 px-6">
              <Icon
                name="search"
                size={18}
                strokeWidth={1.2}
              />

              <input
                autoFocus
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
                placeholder="Rechercher un projet, un article, une demande..."
                className="h-16 flex-1 bg-transparent text-sm outline-none placeholder:text-[#aaa69e]"
              />

              <button
                onClick={onClose}
                className="text-[8px] uppercase tracking-[0.2em] text-[#77736c]"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              <div className="px-6 py-4">
                <p className="text-[8px] uppercase tracking-[0.25em] text-[#aaa69e]">
                  Résultats
                </p>
              </div>

              {results.length > 0 ? (
                results.map(
                  (result, index) => (
                    <Link
                      key={`${result.type}-${result.title}-${index}`}
                      href={result.href}
                      onClick={onClose}
                      className="group flex items-center justify-between border-t border-[#1c1c1a]/10 px-6 py-5 hover:bg-[#1c1c1a] hover:text-[#f5f2ea]"
                    >
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-[#9b7b54]">
                          {result.type}
                        </p>

                        <p className="mt-2 text-sm">
                          {result.title}
                        </p>
                      </div>

                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ),
                )
              ) : (
                <div className="border-t border-[#1c1c1a]/10 px-6 py-12 text-center">
                  <p className="text-sm font-light">
                    Aucun résultat.
                  </p>

                  <p className="mt-2 text-[10px] text-[#77736c]">
                    Essayez une autre
                    recherche.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   MAIN DASHBOARD
============================================================ */

export default function AdminDashboardPage() {
  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    quickActionsOpen,
    setQuickActionsOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    selectedPeriod,
    setSelectedPeriod,
  ] = useState("30 jours");

  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardData | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    notificationState,
    setNotificationState,
  ] = useState<
    NotificationItem[]
  >([]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoading(true);

        const data =
          await loadDashboardData(
            selectedPeriod,
          );

        if (!mounted) {
          return;
        }

        setDashboard(data);
        setNotificationState(
          data.notifications,
        );
      } catch (error) {
        console.error(
          "Impossible de charger le dashboard:",
          error,
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [selectedPeriod]);

  const unreadNotifications =
    notificationState.filter(
      (item) => item.unread,
    ).length;

  /* ==========================================================
     KEYBOARD SHORTCUTS
  ========================================================== */

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent,
    ) => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
        "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === "Escape") {
        setNotificationOpen(false);
        setQuickActionsOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
  }, []);

  /* ==========================================================
     MARK NOTIFICATIONS
  ========================================================== */

  const markAllNotifications =
    async () => {
      if (!dashboard) {
        return;
      }

      const unreadIds =
        notificationState
          .filter(
            (notification) =>
              notification.unread,
          )
          .map(
            (notification) =>
              notification.id,
          );

      if (!unreadIds.length) {
        return;
      }

      const {
        error,
      } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .in(
          "id",
          unreadIds,
        );

      if (error) {
        console.error(
          "Erreur lors de la mise à jour des notifications:",
          error,
        );

        return;
      }

      setNotificationState(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              unread: false,
            }),
          ),
      );
    };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout =
    async () => {
      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Erreur de déconnexion:",
          error,
        );

        return;
      }

      window.location.href =
        "/login";
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading || !dashboard) {
    return (
      <div className="min-h-screen text-[#1c1c1a]">
        <div className="mx-auto flex min-h-screen max-w-[1600px] items-center justify-center px-5 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="mx-auto h-px w-16 bg-[#9b7b54]" />

            <p className="mt-6 text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
              Administration
            </p>

            <p className="mt-3 text-sm font-light text-[#77736c]">
              Chargement des données...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const profile =
    dashboard.profile;

  const firstName =
    profile?.firstName ||
    profile?.fullName?.split(
      " ",
    )[0] ||
    "Administrateur";

  const lastName =
    profile?.lastName || "";

  const displayName =
    profile?.fullName ||
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ");

  const initials = getInitials(
    firstName,
    lastName,
    displayName,
  );

  const graphPath =
    activityPath(
      dashboard.activityValues,
    );

  const graphAreaPath =
    `${graphPath} L1000 230 L0 230 Z`;

  const currentProjects =
    dashboard.projects.filter(
      (project) =>
        project.status ===
        "En cours",
    );

  const projectsToDisplay =
    currentProjects.length > 0
      ? currentProjects
      : dashboard.projects.slice(
        0,
        4,
      );

  const deadlines =
    [...dashboard.projects]
      .filter(
        (project) =>
          project.deadlineDate,
      )
      .sort(
        (a, b) =>
          new Date(
            a.deadlineDate!,
          ).getTime() -
          new Date(
            b.deadlineDate!,
          ).getTime(),
      )
      .slice(0, 4);

  const recentArticles =
    dashboard.articles.slice(
      0,
      3,
    );

  const attentionCount =
    dashboard.validationProjectsCount +
    dashboard.newRequestCount;

  const periodLabel =
    selectedPeriod ===
      "7 jours"
      ? "sur les 7 derniers jours"
      : selectedPeriod ===
        "3 mois"
        ? "sur les 3 derniers mois"
        : "sur les 30 derniers jours";

  return (
    <div className="min-h-screen text-[#1c1c1a]">
      {/* ======================================================
          GLOBAL OVERLAYS
      ====================================================== */}

      <NotificationPanel
        open={notificationOpen}
        onClose={() =>
          setNotificationOpen(false)
        }
        notifications={
          notificationState
        }
        onMarkAll={
          markAllNotifications
        }
      />

      <QuickActionPanel
        open={quickActionsOpen}
        onClose={() =>
          setQuickActionsOpen(false)
        }
      />

      <SearchPanel
        open={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
        projects={
          dashboard.projects
        }
        articles={
          dashboard.articles
        }
        requests={
          dashboard.requests
        }
      />

      {/* ======================================================
          DASHBOARD HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#1c1c1a]/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* ============================================================
        LEFT — BRAND / ADMINISTRATION
    ============================================================ */}

          <div className="flex items-center gap-5">

            {/* Brand */}
            <Link
              href="/admin"
              className="group hidden sm:block"
              aria-label="Retour au tableau de bord"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#1c1c1a] transition-colors duration-200 group-hover:text-[#9b7b54]">
                Pierre
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-[0.32em] text-[#77736c]">
                Architecture
              </div>
            </Link>

            {/* Separator */}
            <div className="hidden h-7 w-px bg-[#1c1c1a]/10 sm:block" />

            {/* Current section */}
            <div>
              <p className="text-[8px] uppercase tracking-[0.3em] text-[#9b7b54]">
                Administration
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#77736c]">
                Vue d&apos;ensemble
              </p>
            </div>
          </div>

          {/* ============================================================
        RIGHT
    ============================================================ */}

          <div className="flex items-center gap-2 sm:gap-4">

            {/* ========================================================
          SEARCH
      ======================================================== */}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex h-10 items-center gap-3 border border-[#1c1c1a]/10 px-3 text-[#77736c] transition-all duration-200 hover:border-[#9b7b54] hover:text-[#9b7b54] sm:px-4"
              aria-label="Rechercher"
            >
              <Icon
                name="search"
                size={16}
              />

              <span className="hidden text-[8px] uppercase tracking-[0.18em] md:block">
                Rechercher
              </span>

              <span className="hidden border border-[#1c1c1a]/10 px-1.5 py-0.5 text-[7px] tracking-[0.05em] text-[#77736c] sm:block">
                ⌘K
              </span>
            </button>

            {/* ========================================================
          NOTIFICATIONS
      ======================================================== */}

            <button
              type="button"
              onClick={() => setNotificationOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center border border-[#1c1c1a]/10 text-[#77736c] transition-all duration-200 hover:border-[#9b7b54] hover:text-[#9b7b54]"
              aria-label="Notifications"
            >
              <Icon
                name="bell"
                size={16}
              />

              {unreadNotifications > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9b7b54] px-1 text-[7px] font-medium text-white">
                  {unreadNotifications > 99
                    ? "99+"
                    : unreadNotifications}
                </span>
              ) : null}
            </button>

            {/* ========================================================
          USER / PROFILE
          Toute la zone est cliquable
      ======================================================== */}

            <Link
              href="/admin/profil"
              className="group hidden items-center gap-3 border-l border-[#1c1c1a]/10 pl-4 lg:flex"
              aria-label="Accéder à mon profil"
            >
              {/* User information */}
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[#1c1c1a] transition-colors duration-200 group-hover:text-[#9b7b54]">
                  {displayName}
                </p>

                <p className="mt-1 text-[7px] uppercase tracking-[0.18em] text-[#77736c]">
                  {profile?.role ?? "Administrateur"}
                </p>
              </div>

              {/* Avatar */}
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden bg-[#1c1c1a] text-[9px] font-medium text-white transition-all duration-200 group-hover:bg-[#9b7b54]">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}

                {/* Hover indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#1c1c1a]/0 opacity-0 transition-all duration-200 group-hover:bg-[#1c1c1a]/20 group-hover:opacity-100">
                  <Icon
                    name="arrow-up-right"
                    size={12}
                  />
                </div>
              </div>
            </Link>

            {/* ========================================================
          MOBILE PROFILE
      ======================================================== */}

            <Link
              href="/admin/profil"
              className="flex h-10 w-10 items-center justify-center overflow-hidden border border-[#1c1c1a]/10 bg-[#1c1c1a] text-[9px] font-medium text-white transition-all duration-200 hover:border-[#9b7b54] hover:bg-[#9b7b54] lg:hidden"
              aria-label="Mon profil"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </Link>

          </div>
        </div>
      </header>
      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        {/* ====================================================
            HERO
        ==================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="relative overflow-hidden border-b border-[#1c1c1a]/10 pb-12 lg:pb-16"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#9b7b54]" />

                <span className="text-[9px] uppercase tracking-[0.3em] text-[#77736c]">
                  Tableau de bord
                </span>
              </div>

              <p className="mt-8 max-w-xl text-sm leading-7 text-[#77736c]">
                Voici une vue globale de
                l&apos;activité du studio, de
                vos projets en cours et des
                nouvelles demandes reçues
                depuis la plateforme.
              </p>
            </div>

            {/* HERO ACTIONS */}

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                onClick={() =>
                  setQuickActionsOpen(
                    true,
                  )
                }
                className="group flex h-12 items-center justify-between gap-8 bg-[#1c1c1a] px-5 text-left text-white transition-colors hover:bg-[#9b7b54]"
              >
                <span className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em]">
                  <span className="flex h-5 w-5 items-center justify-center border border-white/20">
                    <Icon
                      name="plus"
                      size={12}
                    />
                  </span>

                  Nouvelle action
                </span>

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <Link
                href="/"
                className="group flex h-12 items-center justify-between gap-8 border border-[#1c1c1a]/15 px-5 text-[9px] uppercase tracking-[0.2em] text-[#77736c] transition-colors hover:border-[#9b7b54] hover:text-[#9b7b54]"
              >
                <span>
                  Voir le site
                </span>

                <span className="transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ====================================================
            ALERT BAR
        ==================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
            duration: 0.6,
          }}
          className="border-b border-[#1c1c1a]/10"
        >
          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[#9b7b54]/30 text-[#9b7b54]">
                <Icon
                  name="warning"
                  size={14}
                />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.18em]">
                  Attention requise
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#77736c]">
                  {attentionCount}{" "}
                  élément
                  {attentionCount >
                    1
                    ? "s"
                    : ""}{" "}
                  nécessit
                  {attentionCount >
                    1
                    ? "ent"
                    : "e"}{" "}
                  votre attention :
                  {" "}
                  {
                    dashboard.validationProjectsCount
                  }{" "}
                  projet
                  {dashboard.validationProjectsCount >
                    1
                    ? "s"
                    : ""}{" "}
                  à valider et{" "}
                  {
                    dashboard.newRequestCount
                  }{" "}
                  nouvelle
                  {dashboard.newRequestCount >
                    1
                    ? "s"
                    : ""}{" "}
                  demande
                  {dashboard.newRequestCount >
                    1
                    ? "s"
                    : ""}.
                </p>
              </div>
            </div>

            <Link
              href="/admin/demandes"
              className="group flex items-center gap-3 text-[8px] uppercase tracking-[0.2em] text-[#9b7b54]"
            >
              Examiner maintenant

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </motion.section>

        {/* ====================================================
            QUICK STATS
        ==================================================== */}

        <section className="py-12 lg:py-16">
          <div className="mb-7 flex items-center gap-4">
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
              Vue globale
            </span>

            <div className="h-px flex-1 bg-[#1c1c1a]/10" />

            <div className="hidden items-center gap-2 sm:flex">
              {[
                "7 jours",
                "30 jours",
                "3 mois",
              ].map(
                (period) => (
                  <button
                    key={period}
                    onClick={() =>
                      setSelectedPeriod(
                        period,
                      )
                    }
                    className={`px-3 py-1.5 text-[7px] uppercase tracking-[0.15em] transition-colors ${selectedPeriod ===
                      period
                      ? "bg-[#1c1c1a] text-white"
                      : "text-[#77736c] hover:text-[#9b7b54]"
                      }`}
                  >
                    {period}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-x-10 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStat
              number={String(
                dashboard.projectCount,
              ).padStart(2, "0")}
              label="Projets"
              description="Projets actuellement enregistrés dans le studio."
              variation={`${dashboard.publishedProjectCount} publiés`}
              index={0}
            />

            <DashboardStat
              number={String(
                dashboard.articleCount,
              ).padStart(2, "0")}
              label="Articles"
              description="Articles et réflexions publiés sur le site."
              variation={`${dashboard.publishedArticleCount} publiés`}
              index={1}
            />

            <DashboardStat
              number={String(
                dashboard.messageCount,
              ).padStart(2, "0")}
              label="Messages"
              description="Messages reçus depuis le formulaire de contact."
              variation={`${dashboard.unreadMessageCount} non lus`}
              index={2}
            />

            <DashboardStat
              number={String(
                dashboard.requestCount,
              ).padStart(2, "0")}
              label="Demandes"
              description="Demandes de projets et opportunités reçues."
              variation={`${dashboard.newRequestCount} nouvelles`}
              index={3}
            />
          </div>
        </section>

        {/* ====================================================
            PERFORMANCE OVERVIEW
        ==================================================== */}

        <section className="border-y border-[#1c1c1a]/10 py-12 lg:py-16">
          <div className="grid gap-12 xl:grid-cols-[1.4fr_0.6fr]">
            {/* CHART */}

            <div>
              <SectionTitle
                eyebrow="Performance"
                title="Activité de la plateforme"
              />

              <div className="relative h-[280px] border-t border-[#1c1c1a]/10 pt-8">
                {/* Chart grid */}

                <div className="absolute inset-x-0 bottom-10 top-8 flex flex-col justify-between">
                  <div className="border-t border-dashed border-[#1c1c1a]/[0.07]" />
                  <div className="border-t border-dashed border-[#1c1c1a]/[0.07]" />
                  <div className="border-t border-dashed border-[#1c1c1a]/[0.07]" />
                  <div className="border-t border-dashed border-[#1c1c1a]/[0.07]" />
                </div>

                {/* GRAPH — DESIGN CONSERVÉ */}

                <svg
                  viewBox="0 0 1000 230"
                  preserveAspectRatio="none"
                  className="absolute inset-x-0 bottom-10 top-8 h-[210px] w-full overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="dashboardArea"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#9b7b54"
                        stopOpacity="0.18"
                      />

                      <stop
                        offset="100%"
                        stopColor="#9b7b54"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d={graphAreaPath}
                    fill="url(#dashboardArea)"
                  />

                  <motion.path
                    d={graphPath}
                    fill="none"
                    stroke="#9b7b54"
                    strokeWidth="2"
                    initial={{
                      pathLength: 0,
                    }}
                    animate={{
                      pathLength: 1,
                    }}
                    transition={{
                      duration: 1.8,
                      ease: "easeOut",
                    }}
                  />
                </svg>

                {/* Graph labels */}

                <div className="absolute inset-x-0 bottom-0 flex justify-between text-[8px] uppercase tracking-[0.15em] text-[#aaa69e]">
                  <span>
                    {selectedPeriod ===
                      "7 jours"
                      ? "J-7"
                      : selectedPeriod ===
                        "3 mois"
                        ? "J-90"
                        : "J-30"}
                  </span>

                  <span>
                    {selectedPeriod ===
                      "7 jours"
                      ? "J-6"
                      : selectedPeriod ===
                        "3 mois"
                        ? "J-75"
                        : "J-21"}
                  </span>

                  <span>
                    {selectedPeriod ===
                      "7 jours"
                      ? "J-4"
                      : selectedPeriod ===
                        "3 mois"
                        ? "J-60"
                        : "J-14"}
                  </span>

                  <span>
                    {selectedPeriod ===
                      "7 jours"
                      ? "J-2"
                      : selectedPeriod ===
                        "3 mois"
                        ? "J-30"
                        : "J-7"}
                  </span>

                  <span>
                    Aujourd&apos;hui
                  </span>
                </div>
              </div>
            </div>

            {/* SUMMARY */}

            <div className="border-l-0 border-[#1c1c1a]/10 xl:border-l xl:pl-10">
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
                Synthèse
              </p>

              <p className="mt-5 text-5xl font-light tracking-[-0.05em]">
                {
                  dashboard.activityValues.reduce(
                    (
                      total,
                      value,
                    ) =>
                      total + value,
                    0,
                  )
                }
              </p>

              <p className="mt-3 max-w-xs text-xs leading-6 text-[#77736c]">
                événements enregistrés{" "}
                {periodLabel}.
              </p>

              <div className="mt-10 space-y-5">
                <div className="flex items-center justify-between border-t border-[#1c1c1a]/10 pt-4">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#77736c]">
                    Projets
                  </span>

                  <span className="text-sm">
                    {
                      dashboard.projectCount
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#1c1c1a]/10 pt-4">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#77736c]">
                    Contacts
                  </span>

                  <span className="text-sm">
                    {
                      dashboard.messageCount
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#1c1c1a]/10 pt-4">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#77736c]">
                    Conversion
                  </span>

                  <span className="text-sm">
                    {dashboard.requestCount >
                      0
                      ? `${(
                        (dashboard.newRequestCount /
                          dashboard.requestCount) *
                        100
                      ).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            CURRENT PROJECTS
        ==================================================== */}

        <section className="py-12 lg:py-16">
          <SectionTitle
            eyebrow="Production"
            title="Projets en cours"
            action="Voir tous les projets"
            actionHref="/admin/projets"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {projectsToDisplay.map(
              (project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                />
              ),
            )}
          </div>

          <Link
            href="/admin/projets"
            className="mt-6 flex items-center justify-center border border-[#1c1c1a]/10 py-4 text-[8px] uppercase tracking-[0.2em] text-[#77736c] hover:border-[#9b7b54] hover:text-[#9b7b54] sm:hidden"
          >
            Voir tous les projets
          </Link>
        </section>

        {/* ====================================================
            PROJECT SUMMARY
        ==================================================== */}

        <section className="border-y border-[#1c1c1a]/10 py-10">
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#aaa69e]">
                En cours
              </p>

              <p className="mt-2 text-3xl font-light">
                {String(
                  dashboard.currentProjectsCount,
                ).padStart(2, "0")}
              </p>

              <div className="mt-3 h-px bg-[#1c1c1a]/10">
                <div
                  className="h-px bg-[#9b7b54]"
                  style={{
                    width: `${Math.min(
                      100,
                      dashboard.projectCount
                        ? (dashboard.currentProjectsCount /
                          dashboard.projectCount) *
                        100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#aaa69e]">
                À valider
              </p>

              <p className="mt-2 text-3xl font-light">
                {String(
                  dashboard.validationProjectsCount,
                ).padStart(2, "0")}
              </p>

              <div className="mt-3 h-px bg-[#1c1c1a]/10">
                <div
                  className="h-px bg-[#9b7b54]"
                  style={{
                    width: `${Math.min(
                      100,
                      dashboard.projectCount
                        ? (dashboard.validationProjectsCount /
                          dashboard.projectCount) *
                        100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#aaa69e]">
                Échéance proche
              </p>

              <p className="mt-2 text-3xl font-light">
                {String(
                  dashboard.upcomingDeadlineCount,
                ).padStart(2, "0")}
              </p>

              <div className="mt-3 h-px bg-[#1c1c1a]/10">
                <div
                  className="h-px bg-[#9b7b54]"
                  style={{
                    width: `${Math.min(
                      100,
                      dashboard.projectCount
                        ? (dashboard.upcomingDeadlineCount /
                          dashboard.projectCount) *
                        100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#aaa69e]">
                Terminés
              </p>

              <p className="mt-2 text-3xl font-light">
                {String(
                  dashboard.completedProjectsCount,
                ).padStart(2, "0")}
              </p>

              <div className="mt-3 h-px bg-[#1c1c1a]/10">
                <div
                  className="h-px bg-[#9b7b54]"
                  style={{
                    width: `${Math.min(
                      100,
                      dashboard.projectCount
                        ? (dashboard.completedProjectsCount /
                          dashboard.projectCount) *
                        100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            REQUESTS + DEADLINES
        ==================================================== */}

        <section className="grid gap-14 py-12 lg:py-16 xl:grid-cols-[1.45fr_0.55fr]">
          {/* REQUESTS */}

          <div>
            <SectionTitle
              eyebrow="Entrées"
              title="Demandes récentes"
              action="Toutes les demandes"
              actionHref="/admin/demandes"
            />

            <div className="border-t border-[#1c1c1a]/10">
              {dashboard.requests.length >
                0 ? (
                dashboard.requests.map(
                  (
                    request,
                    index,
                  ) => (
                    <RequestRow
                      key={
                        request.id
                      }
                      request={
                        request
                      }
                      index={
                        index
                      }
                    />
                  ),
                )
              ) : (
                <div className="border-b border-[#1c1c1a]/10 py-10">
                  <p className="text-sm font-light">
                    Aucune demande
                    reçue.
                  </p>

                  <p className="mt-2 text-[9px] text-[#77736c]">
                    Les nouvelles
                    demandes
                    apparaîtront
                    ici.
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/admin/demandes"
              className="mt-5 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-[#77736c] sm:hidden"
            >
              Voir toutes les
              demandes →
            </Link>
          </div>

          {/* DEADLINES */}

          <div>
            <SectionTitle
              eyebrow="Planning"
              title="Échéances"
            />

            <div className="border-t border-[#1c1c1a]/10">
              {deadlines.length >
                0 ? (
                deadlines.map(
                  (project) => (
                    <div
                      key={
                        project.id
                      }
                      className="border-b border-[#1c1c1a]/10 py-5 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.18em] text-[#9b7b54]">
                            {formatShortDate(
                              project.deadlineDate,
                            )}
                          </p>

                          <p className="mt-2 text-xs">
                            {
                              project.name
                            }
                          </p>

                          <p className="mt-1 text-[9px] text-[#77736c]">
                            Échéance du
                            projet
                          </p>
                        </div>

                        <Icon
                          name="calendar"
                          size={16}
                        />
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="py-10">
                  <p className="text-sm font-light">
                    Aucune échéance
                    renseignée.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            ALERTS / STATUS
        ==================================================== */}

        <section className="border-y border-[#1c1c1a]/10 py-12 lg:py-16">
          <SectionTitle
            eyebrow="Surveillance"
            title="État du studio"
          />

          <div className="grid gap-px bg-[#1c1c1a]/10 md:grid-cols-2 xl:grid-cols-4">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center border border-[#1c1c1a]/10 text-[#9b7b54]">
                  <Icon
                    name="activity"
                    size={15}
                  />
                </span>

                <span className="flex items-center gap-2 text-[7px] uppercase tracking-[0.15em] text-[#4f6354]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4f6354]" />
                  Opérationnel
                </span>
              </div>

              <p className="mt-8 text-sm">
                Plateforme
              </p>

              <p className="mt-2 text-[9px] leading-5 text-[#77736c]">
                Les données du tableau
                de bord sont
                synchronisées avec
                Supabase.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center border border-[#1c1c1a]/10 text-[#9b7b54]">
                  <Icon
                    name="media"
                    size={15}
                  />
                </span>

                <span className="text-[7px] uppercase tracking-[0.15em] text-[#77736c]">
                  {dashboard.mediaUsage
                    ? `${dashboard.mediaUsage}%`
                    : "—"}
                </span>
              </div>

              <p className="mt-8 text-sm">
                Stockage média
              </p>

              <div className="mt-3 h-[2px] bg-[#1c1c1a]/10">
                <div
                  className="h-full bg-[#9b7b54]"
                  style={{
                    width: `${dashboard.mediaUsage}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-[9px] text-[#77736c]">
                Données de capacité
                non configurées.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center border border-[#1c1c1a]/10 text-[#9b7b54]">
                  <Icon
                    name="message"
                    size={15}
                  />
                </span>

                <span className="text-[7px] uppercase tracking-[0.15em] text-[#9b7b54]">
                  {String(
                    dashboard.unreadMessageCount,
                  ).padStart(2, "0")}
                </span>
              </div>

              <p className="mt-8 text-sm">
                Messages non lus
              </p>

              <p className="mt-2 text-[9px] leading-5 text-[#77736c]">
                {
                  dashboard.unreadMessageCount
                }{" "}
                conversation
                {dashboard.unreadMessageCount >
                  1
                  ? "s"
                  : ""}{" "}
                attend
                {dashboard.unreadMessageCount >
                  1
                  ? "ent"
                  : ""}{" "}
                une réponse.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center border border-[#1c1c1a]/10 text-[#9b7b54]">
                  <Icon
                    name="request"
                    size={15}
                  />
                </span>

                <span className="text-[7px] uppercase tracking-[0.15em] text-[#9b7b54]">
                  {String(
                    dashboard.newRequestCount,
                  ).padStart(2, "0")}
                </span>
              </div>

              <p className="mt-8 text-sm">
                Nouvelles demandes
              </p>

              <p className="mt-2 text-[9px] leading-5 text-[#77736c]">
                {
                  dashboard.newRequestCount
                }{" "}
                nouvelle
                {dashboard.newRequestCount >
                  1
                  ? "s"
                  : ""}{" "}
                demande
                {dashboard.newRequestCount >
                  1
                  ? "s"
                  : ""}{" "}
                reçue
                {dashboard.newRequestCount >
                  1
                  ? "s"
                  : ""}.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            ACTIVITY + CONTENT
        ==================================================== */}

        <section className="grid gap-14 py-12 lg:py-16 xl:grid-cols-[1fr_1fr]">
          {/* ACTIVITY */}

          <div>
            <SectionTitle
              eyebrow="Journal"
              title="Activité récente"
              action="Journal complet"
              actionHref="/admin/messages"
            />

            <div className="border-t border-[#1c1c1a]/10">
              {dashboard.activities.length >
                0 ? (
                dashboard.activities.map(
                  (
                    activity,
                    index,
                  ) => (
                    <motion.div
                      key={
                        activity.id
                      }
                      initial={{
                        opacity: 0,
                        x: -15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.06,
                        duration:
                          0.45,
                      }}
                      className="grid grid-cols-[32px_1fr_auto] gap-4 border-b border-[#1c1c1a]/10 py-5"
                    >
                      <span className="text-[9px] text-[#aaa69e]">
                        {
                          activity.number
                        }
                      </span>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.04em]">
                          {
                            activity.title
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-[#77736c]">
                          {
                            activity.description
                          }
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[7px] uppercase tracking-[0.15em] text-[#9b7b54]">
                            {
                              activity.type
                            }
                          </span>

                          <span className="h-1 w-1 rounded-full bg-[#aaa69e]" />

                          <span className="text-[7px] text-[#aaa69e]">
                            {
                              activity.time
                            }
                          </span>
                        </div>
                      </div>

                      <Icon
                        name="arrow"
                        size={13}
                        strokeWidth={1}
                      />
                    </motion.div>
                  ),
                )
              ) : (
                <div className="border-b border-[#1c1c1a]/10 py-10">
                  <p className="text-sm font-light">
                    Aucun journal
                    d&apos;activité.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RECENT CONTENT */}

          <div>
            <SectionTitle
              eyebrow="Éditorial"
              title="Contenus récents"
              action="Gérer les articles"
              actionHref="/admin/articles"
            />

            <div className="border-t border-[#1c1c1a]/10">
              {recentArticles.length >
                0 ? (
                recentArticles.map(
                  (
                    article,
                    index,
                  ) => (
                    <Link
                      key={
                        article.id
                      }
                      href={`/admin/articles/${article.slug}`}
                      className={`group block ${index <
                        recentArticles.length -
                        1
                        ? "border-b border-[#1c1c1a]/10"
                        : ""
                        } py-6`}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.2em] text-[#9b7b54]">
                            {
                              article.category
                            }{" "}
                            ·{" "}
                            {formatDate(
                              article.publishedAt ??
                              article.createdAt,
                            )}
                          </p>

                          <h3 className="mt-3 max-w-md text-lg font-light leading-6">
                            {
                              article.title
                            }
                          </h3>

                          <p className="mt-3 max-w-md text-[10px] leading-5 text-[#77736c]">
                            {
                              article.excerpt
                            }
                          </p>
                        </div>

                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </Link>
                  ),
                )
              ) : (
                <div className="py-10">
                  <p className="text-sm font-light">
                    Aucun article
                    récent.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <section className="border-t border-[#1c1c1a]/10 py-12 lg:py-16">
          <SectionTitle
            eyebrow="Raccourcis"
            title="Actions fréquentes"
          />

          <div className="grid gap-px bg-[#1c1c1a]/10 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                number: "01",
                title: "Nouveau projet",
                description:
                  "Ajouter un projet architectural",
                href: "/admin/projets/nouveau",
              },
              {
                number: "02",
                title: "Nouvel article",
                description:
                  "Publier une nouvelle réflexion",
                href: "/admin/articles/nouveau",
              },
              {
                number: "03",
                title: "Voir les demandes",
                description:
                  "Consulter les projets reçus",
                href: "/admin/demandes",
              },
              {
                number: "04",
                title: "Médiathèque",
                description:
                  "Gérer les images et documents",
                href: "/admin/medias",
              },
            ].map(
              (action) => (
                <Link
                  key={
                    action.number
                  }
                  href={action.href}
                  className="group p-7 transition-colors hover:bg-[#1c1c1a] hover:text-[#f5f2ea]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] text-[#9b7b54]">
                      {
                        action.number
                      }
                    </span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                  <h3 className="mt-12 text-lg font-light">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-[9px] leading-5 text-[#77736c] group-hover:text-[#aaa69e]">
                    {
                      action.description
                    }
                  </p>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="border-t border-[#1c1c1a]/10 py-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[8px] uppercase tracking-[0.25em] text-[#aaa69e]">
                Pierre Architecture
              </p>

              <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-[#aaa69e]">
                Administration ·
                Plateforme privée
              </p>
            </div>

            <div className="flex items-center gap-5">
              <Link
                href="/"
                className="text-[8px] uppercase tracking-[0.2em] text-[#77736c] hover:text-[#9b7b54]"
              >
                Site public
              </Link>

              <Link
                href="/admin/parametres"
                className="text-[8px] uppercase tracking-[0.2em] text-[#77736c] hover:text-[#9b7b54]"
              >
                Paramètres
              </Link>

              <button
                onClick={
                  handleLogout
                }
                className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-[#77736c] hover:text-[#9b7b54]"
              >
                <Icon
                  name="logout"
                  size={12}
                />

                Déconnexion
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}