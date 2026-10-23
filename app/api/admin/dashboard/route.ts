import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  professional_title: string | null;
  email: string | null;
  role: "admin" | "editor";
  is_active: boolean;
  avatar_url: string | null;
};

type Project = {
  id: string;
  reference: string;
  title: string;
  subtitle: string | null;
  project_type: string | null;
  location: string | null;
  city: string | null;
  province: string | null;
  progress: number;
  status: "draft" | "published" | "archived";
  featured: boolean;
  deadline: string | null;
  cover_image_url: string | null;
  created_at: string;
};

type ProjectRequest = {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  project_name: string | null;
  project_type: string | null;
  location: string | null;
  status:
    | "new"
    | "reviewing"
    | "contacted"
    | "in_progress"
    | "completed"
    | "rejected"
    | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
};

type Message = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
};

type Notification = {
  id: string;
  type:
    | "message"
    | "project"
    | "request"
    | "article"
    | "system";
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
};

type Activity = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  title: string;
  description: string | null;
  created_at: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  published_at: string | null;
  created_at: string;
};

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getInitials(profile: Profile) {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  }

  if (profile.full_name) {
    return profile.full_name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return "AD";
}

function getProjectStatusLabel(status: Project["status"]) {
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

function getProjectStatusClass(status: Project["status"]) {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "draft":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "archived":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getRequestStatusLabel(status: ProjectRequest["status"]) {
  switch (status) {
    case "new":
      return "Nouvelle";
    case "reviewing":
      return "En étude";
    case "contacted":
      return "Contactée";
    case "in_progress":
      return "En cours";
    case "completed":
      return "Terminée";
    case "rejected":
      return "Rejetée";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
}

function getRequestStatusClass(status: ProjectRequest["status"]) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "reviewing":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "contacted":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "in_progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    case "cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getPriorityClass(priority: ProjectRequest["priority"]) {
  switch (priority) {
    case "urgent":
      return "bg-red-50 text-red-700 border-red-200";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "normal":
      return "bg-slate-50 text-slate-600 border-slate-200";
    case "low":
      return "bg-slate-50 text-slate-500 border-slate-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getPriorityLabel(priority: ProjectRequest["priority"]) {
  switch (priority) {
    case "urgent":
      return "Urgente";
    case "high":
      return "Prioritaire";
    case "normal":
      return "Normale";
    case "low":
      return "Faible";
    default:
      return priority;
  }
}

function getActivityIcon(entityType: string) {
  switch (entityType) {
    case "project":
      return "⌂";
    case "article":
      return "▤";
    case "request":
      return "↗";
    case "message":
      return "✉";
    case "profile":
      return "○";
    case "system":
      return "⚙";
    default:
      return "•";
  }
}

function getActivityIconClass(entityType: string) {
  switch (entityType) {
    case "project":
      return "bg-blue-50 text-blue-700";
    case "article":
      return "bg-violet-50 text-violet-700";
    case "request":
      return "bg-amber-50 text-amber-700";
    case "message":
      return "bg-emerald-50 text-emerald-700";
    case "profile":
      return "bg-cyan-50 text-cyan-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServerClient();

  /*
   * --------------------------------------------------------------------------
   * 1. AUTHENTIFICATION
   * --------------------------------------------------------------------------
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * --------------------------------------------------------------------------
   * 2. PROFIL ADMINISTRATEUR
   * --------------------------------------------------------------------------
   */

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      full_name,
      professional_title,
      email,
      role,
      is_active,
      avatar_url
    `)
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profileData ||
    !profileData.is_active ||
    !["admin", "editor"].includes(profileData.role)
  ) {
    redirect("/");
  }

  const profile = profileData as Profile;

  /*
   * --------------------------------------------------------------------------
   * 3. CHARGEMENT DES DONNÉES
   * --------------------------------------------------------------------------
   */

  const [
    projectsResult,
    requestsResult,
    messagesResult,
    notificationsResult,
    activitiesResult,
    articlesResult,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(`
        id,
        reference,
        title,
        subtitle,
        project_type,
        location,
        city,
        province,
        progress,
        status,
        featured,
        deadline,
        cover_image_url,
        created_at
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("project_requests")
      .select(`
        id,
        reference,
        first_name,
        last_name,
        email,
        project_name,
        project_type,
        location,
        status,
        priority,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("messages")
      .select(`
        id,
        first_name,
        last_name,
        email,
        subject,
        message,
        status,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("notifications")
      .select(`
        id,
        type,
        title,
        description,
        is_read,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("activity_logs")
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        title,
        description,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("articles")
      .select(`
        id,
        title,
        slug,
        status,
        featured,
        published_at,
        created_at
      `)
      .order("created_at", { ascending: false }),
  ]);

  /*
   * --------------------------------------------------------------------------
   * 4. DONNÉES AVEC FALLBACK
   * --------------------------------------------------------------------------
   */

  const projects = (projectsResult.data ?? []) as Project[];
  const requests = (requestsResult.data ?? []) as ProjectRequest[];
  const messages = (messagesResult.data ?? []) as Message[];
  const notifications = (notificationsResult.data ?? []) as Notification[];
  const activities = (activitiesResult.data ?? []) as Activity[];
  const articles = (articlesResult.data ?? []) as Article[];

  /*
   * --------------------------------------------------------------------------
   * 5. STATISTIQUES
   * --------------------------------------------------------------------------
   */

  const totalProjects = projects.length;

  const publishedProjects = projects.filter(
    (project) => project.status === "published",
  ).length;

  const activeProjects = projects.filter(
    (project) =>
      project.status === "published" &&
      project.progress < 100,
  ).length;

  const completedProjects = projects.filter(
    (project) => project.progress >= 100,
  ).length;

  const totalRequests = requests.length;

  const newRequests = requests.filter(
    (request) => request.status === "new",
  ).length;

  const urgentRequests = requests.filter(
    (request) =>
      request.priority === "urgent" ||
      request.priority === "high",
  ).length;

  const unreadMessages = messages.filter(
    (message) => message.status === "unread",
  ).length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const publishedArticles = articles.filter(
    (article) => article.status === "published",
  ).length;

  const draftArticles = articles.filter(
    (article) => article.status === "draft",
  ).length;

  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (total, project) => total + (project.progress ?? 0),
            0,
          ) / projects.length,
        )
      : 0;

  /*
   * --------------------------------------------------------------------------
   * 6. PROJETS À AFFICHER
   * --------------------------------------------------------------------------
   */

  const recentProjects = projects.slice(0, 5);

  const upcomingProjects = projects
    .filter(
      (project) =>
        project.deadline &&
        project.progress < 100,
    )
    .sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;

      return (
        new Date(a.deadline).getTime() -
        new Date(b.deadline).getTime()
      );
    })
    .slice(0, 4);

  /*
   * --------------------------------------------------------------------------
   * 7. ACTIVITÉS
   * --------------------------------------------------------------------------
   */

  const recentActivities = activities.slice(0, 6);

  /*
   * --------------------------------------------------------------------------
   * 8. UTILISATEUR
   * --------------------------------------------------------------------------
   */

  const displayName =
    profile.full_name ||
    `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
    "Administrateur";

  const initials = getInitials(profile);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8 lg:px-10">

        {/* ================================================================
            HEADER
        ================================================================= */}

        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#777]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#171717]">
                Administration
                
              </div>

              <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                {getGreeting()}, {profile.first_name || displayName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777]">
                Vue générale du studio, des projets, des demandes et
                du contenu éditorial.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#deded9] bg-white px-5 text-sm font-medium transition hover:border-[#171717]"
              >
                <span>↗</span>
                Voir le site
              </Link>

              <div className="flex h-11 items-center gap-3 rounded-full border border-[#deded9] bg-white px-2 pr-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold text-white">
                    {initials}
                  </div>
                )}

                <div className="hidden sm:block">
                  <p className="text-xs font-semibold leading-none">
                    {displayName}
                  </p>
                  <p className="mt-1 text-[10px] text-[#888]">
                    {profile.role === "admin"
                      ? "Administrateur"
                      : "Éditeur"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================================
            ALERTES
        ================================================================= */}

        {(newRequests > 0 ||
          unreadMessages > 0 ||
          unreadNotifications > 0) && (
          <section className="mb-7">
            <div className="flex flex-col gap-3 rounded-2xl border border-[#e4e0d7] bg-[#fffdf7] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-sm text-white">
                  !
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Votre attention est requise
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#777]">
                    {newRequests > 0 &&
                      `${newRequests} demande${
                        newRequests > 1 ? "s" : ""
                      } nouvelle${
                        newRequests > 1 ? "s" : ""
                      }`}

                    {newRequests > 0 &&
                      unreadMessages > 0 &&
                      " · "}

                    {unreadMessages > 0 &&
                      `${unreadMessages} message${
                        unreadMessages > 1 ? "s" : ""
                      } non lu${
                        unreadMessages > 1 ? "s" : ""
                      }`}

                    {(newRequests > 0 || unreadMessages > 0) &&
                      unreadNotifications > 0 &&
                      " · "}

                    {unreadNotifications > 0 &&
                      `${unreadNotifications} notification${
                        unreadNotifications > 1 ? "s" : ""
                      } non lue${
                        unreadNotifications > 1 ? "s" : ""
                      }`}
                  </p>
                </div>
              </div>

              <Link
                href="/admin/requests"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#171717] px-4 text-xs font-semibold text-white transition hover:bg-[#333]"
              >
                Consulter
              </Link>
            </div>
          </section>
        )}

        {/* ================================================================
            KPI
        ================================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {/* Projects */}
          <Link
            href="/admin/projects"
            className="group rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bcbcb6]"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                Projets
              </span>

              <span className="text-lg text-[#999] transition group-hover:text-[#171717]">
                ↗
              </span>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <span className="text-3xl font-medium tracking-[-0.04em]">
                {totalProjects}
              </span>

              <span className="text-xs text-[#888]">
                {publishedProjects} publiés
              </span>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#eeeeeb]">
              <div
                className="h-full rounded-full bg-[#171717]"
                style={{
                  width:
                    totalProjects > 0
                      ? `${Math.min(
                          (publishedProjects / totalProjects) * 100,
                          100,
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </Link>

          {/* Demandes */}
          <Link
            href="/admin/requests"
            className="group rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bcbcb6]"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                Demandes
              </span>

              <span className="text-lg text-[#999] transition group-hover:text-[#171717]">
                ↗
              </span>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <span className="text-3xl font-medium tracking-[-0.04em]">
                {totalRequests}
              </span>

              <span className="text-xs text-[#888]">
                {newRequests} nouvelles
              </span>
            </div>

            <div className="mt-5 flex gap-1">
              {Array.from({ length: 10 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    index < Math.min(newRequests, 10)
                      ? "bg-[#171717]"
                      : "bg-[#eeeeeb]"
                  }`}
                />
              ))}
            </div>
          </Link>

          {/* Messages */}
          <Link
            href="/admin/messages"
            className="group rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bcbcb6]"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                Messages
              </span>

              <span className="text-lg text-[#999] transition group-hover:text-[#171717]">
                ↗
              </span>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <span className="text-3xl font-medium tracking-[-0.04em]">
                {messages.length}
              </span>

              <span className="text-xs text-[#888]">
                {unreadMessages} non lus
              </span>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#eeeeeb]">
              <div
                className="h-full rounded-full bg-[#171717]"
                style={{
                  width:
                    messages.length > 0
                      ? `${Math.min(
                          (unreadMessages / messages.length) * 100,
                          100,
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </Link>

          {/* Articles */}
          <Link
            href="/admin/articles"
            className="group rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bcbcb6]"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                Articles
              </span>

              <span className="text-lg text-[#999] transition group-hover:text-[#171717]">
                ↗
              </span>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <span className="text-3xl font-medium tracking-[-0.04em]">
                {articles.length}
              </span>

              <span className="text-xs text-[#888]">
                {publishedArticles} publiés
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] text-[#888]">
              <span>{draftArticles} brouillons</span>

              <span>
                {publishedArticles > 0
                  ? "Contenu actif"
                  : "À publier"}
              </span>
            </div>
          </Link>
        </section>

        {/* ================================================================
            ACTIONS RAPIDES
        ================================================================= */}

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                Actions rapides
              </p>
              <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                Gérer le studio
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            <Link
              href="/admin/projects/new"
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:border-[#171717] hover:bg-[#171717] hover:text-white"
            >
              <span className="text-2xl">＋</span>

              <div>
                <p className="text-sm font-semibold">
                  Nouveau projet
                </p>
                <p className="mt-1 text-[11px] opacity-60">
                  Ajouter une réalisation
                </p>
              </div>
            </Link>

            <Link
              href="/admin/articles/new"
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:border-[#171717] hover:bg-[#171717] hover:text-white"
            >
              <span className="text-2xl">✎</span>

              <div>
                <p className="text-sm font-semibold">
                  Nouvel article
                </p>
                <p className="mt-1 text-[11px] opacity-60">
                  Publier une idée
                </p>
              </div>
            </Link>

            <Link
              href="/admin/requests"
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:border-[#171717] hover:bg-[#171717] hover:text-white"
            >
              <span className="text-2xl">↗</span>

              <div>
                <p className="text-sm font-semibold">
                  Demandes
                </p>
                <p className="mt-1 text-[11px] opacity-60">
                  Voir les marchés reçus
                </p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-[#e3e3df] bg-white p-5 transition hover:border-[#171717] hover:bg-[#171717] hover:text-white"
            >
              <span className="text-2xl">⚙</span>

              <div>
                <p className="text-sm font-semibold">
                  Paramètres
                </p>
                <p className="mt-1 text-[11px] opacity-60">
                  Configuration du site
                </p>
              </div>
            </Link>

          </div>
        </section>

        {/* ================================================================
            COLONNE PRINCIPALE
        ================================================================= */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">

          {/* ==============================================================
              PROJETS
          =============================================================== */}

          <div className="overflow-hidden rounded-2xl border border-[#e3e3df] bg-white">

            <div className="flex flex-col gap-3 border-b border-[#eeeeeb] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                  Portfolio
                </p>

                <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                  Projets récents
                </h2>
              </div>

              <Link
                href="/admin/projects"
                className="text-xs font-semibold text-[#555] transition hover:text-[#171717]"
              >
                Voir tous les projets →
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f4f1] text-xl">
                  ⌂
                </div>

                <p className="mt-4 text-sm font-medium">
                  Aucun projet
                </p>

                <p className="mt-1 text-xs text-[#888]">
                  Commencez par ajouter votre première réalisation.
                </p>

                <Link
                  href="/admin/projects/new"
                  className="mt-5 inline-flex h-9 items-center rounded-full bg-[#171717] px-4 text-xs font-semibold text-white"
                >
                  Ajouter un projet
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#eeeeeb]">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="group block px-5 py-5 transition hover:bg-[#fafaf8] sm:px-6"
                  >
                    <div className="flex gap-4">

                      {/* Image */}
                      <div className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f0f0ed] sm:block">
                        {project.cover_image_url ? (
                          <img
                            src={project.cover_image_url}
                            alt={project.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl text-[#aaa]">
                            ⌂
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] font-semibold text-[#999]">
                                {project.reference}
                              </span>

                              <span
                                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getProjectStatusClass(
                                  project.status,
                                )}`}
                              >
                                {getProjectStatusLabel(
                                  project.status,
                                )}
                              </span>
                            </div>

                            <h3 className="truncate text-sm font-semibold">
                              {project.title}
                            </h3>

                            <p className="mt-1 truncate text-xs text-[#888]">
                              {project.project_type ||
                                "Projet architectural"}

                              {project.city &&
                                ` · ${project.city}`}

                              {project.location &&
                                ` · ${project.location}`}
                            </p>
                          </div>

                          <span className="hidden text-xs text-[#999] sm:block">
                            {project.progress ?? 0}%
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between text-[10px] text-[#888]">
                            <span>
                              Progression du projet
                            </span>

                            <span className="sm:hidden">
                              {project.progress ?? 0}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[#eeeeeb]">
                            <div
                              className="h-full rounded-full bg-[#171717] transition-all"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    project.progress ?? 0,
                                    0,
                                  ),
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-[#999]">
                          {project.deadline && (
                            <span>
                              Échéance :{" "}
                              <strong className="font-medium text-[#666]">
                                {formatDate(project.deadline)}
                              </strong>
                            </span>
                          )}

                          {project.featured && (
                            <span className="text-[#666]">
                              ★ Mis en avant
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="hidden self-center text-lg text-[#aaa] transition group-hover:translate-x-1 group-hover:text-[#171717] sm:block">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ==============================================================
              PROGRESSION
          =============================================================== */}

          <div className="rounded-2xl border border-[#e3e3df] bg-white">

            <div className="border-b border-[#eeeeeb] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                Vue projet
              </p>

              <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">
                État du portfolio
              </h2>
            </div>

            <div className="p-5">

              <div className="flex items-center justify-center py-5">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[#f2f2ef]">
                  <div
                    className="absolute inset-2 rounded-full"
                    style={{
                      background: `conic-gradient(#171717 ${
                        averageProgress * 3.6
                      }deg, #e7e7e3 0deg)`,
                    }}
                  />

                  <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-medium tracking-[-0.04em]">
                      {averageProgress}%
                    </span>

                    <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#999]">
                      progression
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">

                <div className="rounded-xl bg-[#f7f7f5] p-4">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#999]">
                    En cours
                  </span>

                  <p className="mt-2 text-xl font-medium">
                    {activeProjects}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f7f7f5] p-4">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#999]">
                    Terminés
                  </span>

                  <p className="mt-2 text-xl font-medium">
                    {completedProjects}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f7f7f5] p-4">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#999]">
                    Publiés
                  </span>

                  <p className="mt-2 text-xl font-medium">
                    {publishedProjects}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f7f7f5] p-4">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#999]">
                    Prioritaires
                  </span>

                  <p className="mt-2 text-xl font-medium">
                    {urgentRequests}
                  </p>
                </div>

              </div>

              <Link
                href="/admin/projects"
                className="mt-4 flex h-10 items-center justify-center rounded-full border border-[#deded9] text-xs font-semibold transition hover:border-[#171717]"
              >
                Gérer les projets
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            DEMANDES + MESSAGES
        ================================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* DEMANDES */}

          <div className="overflow-hidden rounded-2xl border border-[#e3e3df] bg-white">

            <div className="flex items-center justify-between border-b border-[#eeeeeb] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                  Prospects
                </p>

                <h2 className="mt-1 text-lg font-medium">
                  Dernières demandes
                </h2>
              </div>

              <Link
                href="/admin/requests"
                className="text-xs font-semibold text-[#555] hover:text-[#171717]"
              >
                Tout voir →
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#888]">
                Aucune demande pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-[#eeeeeb]">
                {requests.slice(0, 5).map((request) => (
                  <Link
                    key={request.id}
                    href={`/admin/requests/${request.id}`}
                    className="group block px-5 py-4 transition hover:bg-[#fafaf8] sm:px-6"
                  >
                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0f0ed] text-[10px] font-semibold">
                        {request.first_name?.[0]}
                        {request.last_name?.[0]}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="truncate text-sm font-semibold">
                            {request.first_name}{" "}
                            {request.last_name}
                          </p>

                          <span className="text-[10px] text-[#999]">
                            {formatDate(request.created_at)}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-[#777]">
                          {request.project_name ||
                            request.project_type ||
                            "Demande de projet"}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getRequestStatusClass(
                              request.status,
                            )}`}
                          >
                            {getRequestStatusLabel(
                              request.status,
                            )}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getPriorityClass(
                              request.priority,
                            )}`}
                          >
                            {getPriorityLabel(
                              request.priority,
                            )}
                          </span>
                        </div>
                      </div>

                      <span className="pt-1 text-sm text-[#aaa] transition group-hover:translate-x-1 group-hover:text-[#171717]">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* MESSAGES */}

          <div className="overflow-hidden rounded-2xl border border-[#e3e3df] bg-white">

            <div className="flex items-center justify-between border-b border-[#eeeeeb] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                  Communication
                </p>

                <h2 className="mt-1 text-lg font-medium">
                  Derniers messages
                </h2>
              </div>

              <Link
                href="/admin/messages"
                className="text-xs font-semibold text-[#555] hover:text-[#171717]"
              >
                Tout voir →
              </Link>
            </div>

            {messages.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#888]">
                Aucun message pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-[#eeeeeb]">
                {messages.slice(0, 5).map((message) => (
                  <Link
                    key={message.id}
                    href={`/admin/messages/${message.id}`}
                    className="group block px-5 py-4 transition hover:bg-[#fafaf8] sm:px-6"
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs ${
                          message.status === "unread"
                            ? "bg-[#171717] text-white"
                            : "bg-[#f0f0ed] text-[#777]"
                        }`}
                      >
                        ✉
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p
                            className={`truncate text-sm ${
                              message.status === "unread"
                                ? "font-semibold"
                                : "font-medium"
                            }`}
                          >
                            {message.first_name}{" "}
                            {message.last_name}
                          </p>

                          <span className="text-[10px] text-[#999]">
                            {formatDate(message.created_at)}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs font-medium text-[#555]">
                          {message.subject ||
                            "Message sans objet"}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-[#999]">
                          {message.message}
                        </p>
                      </div>

                      {message.status === "unread" && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#171717]" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            ÉCHÉANCES + ACTIVITÉS
        ================================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">

          {/* ÉCHÉANCES */}

          <div className="rounded-2xl border border-[#e3e3df] bg-white">

            <div className="flex items-center justify-between border-b border-[#eeeeeb] px-5 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                  Planning
                </p>

                <h2 className="mt-1 text-lg font-medium">
                  Prochaines échéances
                </h2>
              </div>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#999]">
                Projet
              </span>
            </div>

            {upcomingProjects.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium">
                  Aucune échéance
                </p>

                <p className="mt-1 text-xs text-[#888]">
                  Aucun projet en cours avec une date limite.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#eeeeeb]">
                {upcomingProjects.map((project) => {

                  const deadline = project.deadline
                    ? new Date(project.deadline)
                    : null;

                  const daysRemaining = deadline
                    ? Math.ceil(
                        (deadline.getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;

                  const deadlineClass =
                    daysRemaining !== null &&
                    daysRemaining <= 7
                      ? "text-red-600"
                      : daysRemaining !== null &&
                          daysRemaining <= 30
                        ? "text-amber-600"
                        : "text-[#555]";

                  return (
                    <Link
                      key={project.id}
                      href={`/admin/projects/${project.id}`}
                      className="group block px-5 py-4 transition hover:bg-[#fafaf8]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {project.title}
                          </p>

                          <p className="mt-1 text-[10px] text-[#999]">
                            {project.reference}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-xs font-semibold ${deadlineClass}`}
                          >
                            {formatDate(project.deadline)}
                          </p>

                          {daysRemaining !== null && (
                            <p className="mt-1 text-[10px] text-[#999]">
                              {daysRemaining < 0
                                ? `${Math.abs(
                                    daysRemaining,
                                  )} j. dépassés`
                                : daysRemaining === 0
                                  ? "Aujourd'hui"
                                  : `${daysRemaining} j. restants`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#eeeeeb]">
                          <div
                            className="h-full rounded-full bg-[#171717]"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  project.progress ?? 0,
                                  0,
                                ),
                                100,
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="text-[9px] text-[#999]">
                          {project.progress ?? 0}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVITÉS */}

          <div className="rounded-2xl border border-[#e3e3df] bg-white">

            <div className="flex items-center justify-between border-b border-[#eeeeeb] px-5 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                  Journal
                </p>

                <h2 className="mt-1 text-lg font-medium">
                  Activité récente
                </h2>
              </div>

              <span className="text-xs text-[#999]">
                {activities.length} événements
              </span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium">
                  Aucune activité
                </p>

                <p className="mt-1 text-xs text-[#888]">
                  Les actions administratives apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#eeeeeb]">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 px-5 py-4 sm:px-6"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getActivityIconClass(
                        activity.entity_type,
                      )}`}
                    >
                      {getActivityIcon(
                        activity.entity_type,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm font-medium">
                          {activity.title}
                        </p>

                        <span className="shrink-0 text-[10px] text-[#999]">
                          {formatDateTime(
                            activity.created_at,
                          )}
                        </span>
                      </div>

                      {activity.description && (
                        <p className="mt-1 text-xs leading-5 text-[#888]">
                          {activity.description}
                        </p>
                      )}

                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#aaa]">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            NOTIFICATIONS
        ================================================================= */}

        <section className="mt-6 rounded-2xl border border-[#e3e3df] bg-white">

          <div className="flex flex-col gap-2 border-b border-[#eeeeeb] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888]">
                Système
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Notifications
              </h2>
            </div>

            <span className="text-xs text-[#999]">
              {unreadNotifications} non lue
              {unreadNotifications > 1 ? "s" : ""}
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#888]">
              Aucune notification.
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-[#eeeeeb] md:grid-cols-2 md:divide-x md:divide-y-0">
              {notifications.slice(0, 6).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 px-5 py-4 sm:px-6 ${
                    !notification.is_read
                      ? "bg-[#fafaf8]"
                      : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f0ed] text-xs">
                    {notification.type === "message"
                      ? "✉"
                      : notification.type === "project"
                        ? "⌂"
                        : notification.type ===
                            "request"
                          ? "↗"
                          : notification.type ===
                              "article"
                            ? "▤"
                            : "•"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#171717]" />
                      )}

                      <p className="truncate text-sm font-medium">
                        {notification.title}
                      </p>
                    </div>

                    {notification.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#888]">
                        {notification.description}
                      </p>
                    )}

                    <p className="mt-1 text-[9px] text-[#aaa]">
                      {formatDateTime(
                        notification.created_at,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================================================================
            FOOTER ADMIN
        ================================================================= */}

        <footer className="mt-10 flex flex-col gap-3 border-t border-[#deded9] py-6 text-[10px] text-[#999] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Administration · {profile.full_name || "Studio"}
          </p>

          <div className="flex gap-5">
            <Link
              href="/"
              className="transition hover:text-[#171717]"
            >
              Site public
            </Link>

            <Link
              href="/admin/settings"
              className="transition hover:text-[#171717]"
            >
              Paramètres
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}