
import { getSupabaseServerClient } from "@/lib/supabase/server";

/* ============================================================
   TYPES
============================================================ */

export type HomeProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  professional_title: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  phone_secondary: string | null;
  avatar_url: string | null;
  cv_url: string | null;
  website_url: string | null;
  years_experience: number | null;
  availability: string | null;
  specialties: string[];
  languages: string[];
};

export type HomeSocialLink = {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  username: string | null;
  display_name: string | null;
  is_visible: boolean;
  display_order: number;
};

export type HomeProject = {
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
  start_date: string | null;
  completion_date: string | null;
  deadline: string | null;
  surface_area: number | null;
  surface_unit: string | null;
  budget: number | null;
  budget_currency: string | null;
  progress: number;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  cover_image_path: string | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  display_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HomeProjectGalleryImage = {
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
};

export type HomeProjectGallery = {
  project: HomeProject;
  images: HomeProjectGalleryImage[];
};

export type HomeArticle = {
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
  status: "draft" | "published" | "archived";
  featured: boolean;
  display_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HomeData = {
  profile: HomeProfile | null;
  socialLinks: HomeSocialLink[];
  projects: HomeProject[];
  featuredProject: HomeProject | null;
  gallery: HomeProjectGallery[];
  articles: HomeArticle[];
};

/* ============================================================
   SUPABASE ERROR LOGGING
============================================================ */

type SupabaseQueryError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function logSupabaseError(
  label: string,
  error: SupabaseQueryError | null,
): void {
  if (!error) return;

  console.error(`[getHomeData] ${label}`, {
    code: error.code ?? null,
    message: error.message ?? "Unknown Supabase error",
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
}

/* ============================================================
   DATA LOADER
============================================================ */

export async function getHomeData(): Promise<HomeData> {
  const supabase = await getSupabaseServerClient();

  /* ----------------------------------------------------------
     PROFILE
  ---------------------------------------------------------- */

  const profileResult = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      full_name,
      professional_title,
      bio,
      email,
      phone,
      phone_secondary,
      avatar_url,
      cv_url,
      website_url,
      years_experience,
      availability,
      specialties,
      languages
    `)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  logSupabaseError("Profile query failed", profileResult.error);

  /* ----------------------------------------------------------
     SOCIAL LINKS
  ---------------------------------------------------------- */

  const socialResult = await supabase
    .from("profile_social_links")
    .select(`
      id,
      profile_id,
      platform,
      url,
      username,
      display_name,
      is_visible,
      display_order
    `)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  logSupabaseError(
    "Social links query failed",
    socialResult.error,
  );

  /* ----------------------------------------------------------
     PUBLISHED PROJECTS
  ---------------------------------------------------------- */

  const projectsResult = await supabase
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
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  logSupabaseError("Projects query failed", projectsResult.error);

  /* ----------------------------------------------------------
     PUBLISHED ARTICLES
  ---------------------------------------------------------- */

  const articlesResult = await supabase
    .from("articles")
    .select(`
      id,
      author_id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      cover_image_path,
      category,
      tags,
      status,
      featured,
      display_order,
      published_at,
      created_at,
      updated_at
    `)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  logSupabaseError("Articles query failed", articlesResult.error);

  /* ----------------------------------------------------------
     NORMALISE RESULTS

     A failed query is logged and does not crash the loader
     solely because its data is null.
  ---------------------------------------------------------- */

  const profile: HomeProfile | null = profileResult.data
    ? {
        ...profileResult.data,
        specialties: profileResult.data.specialties ?? [],
        languages: profileResult.data.languages ?? [],
      }
    : null;

  const socialLinks: HomeSocialLink[] =
    socialResult.data ?? [];

  const projects: HomeProject[] =
    (projectsResult.data ?? []) as HomeProject[];

  const articles: HomeArticle[] =
    (articlesResult.data ?? []) as HomeArticle[];

  /* ----------------------------------------------------------
     PROJECT GALLERY

     Load visible images only for published projects.
  ---------------------------------------------------------- */

  let galleryImages: HomeProjectGalleryImage[] = [];

  if (projects.length > 0) {
    const projectIds = projects.map((project) => project.id);

    const galleryResult = await supabase
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
        is_visible
      `)
      .in("project_id", projectIds)
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    logSupabaseError(
      "Project gallery query failed",
      galleryResult.error,
    );

    if (!galleryResult.error) {
      galleryImages = (
        galleryResult.data ?? []
      ) as HomeProjectGalleryImage[];
    }
  }

  /* ----------------------------------------------------------
     GROUP IMAGES BY PROJECT
  ---------------------------------------------------------- */

  const imagesByProject = new Map<
    string,
    HomeProjectGalleryImage[]
  >();

  for (const image of galleryImages) {
    const projectImages =
      imagesByProject.get(image.project_id) ?? [];

    projectImages.push(image);
    imagesByProject.set(image.project_id, projectImages);
  }

  const gallery: HomeProjectGallery[] = projects
    .map((project) => ({
      project,
      images: imagesByProject.get(project.id) ?? [],
    }))
    .filter(({ images }) => images.length > 0);

  /* ----------------------------------------------------------
     FEATURED PROJECT
  ---------------------------------------------------------- */

  const featuredProject =
    projects.find((project) => project.featured) ??
    projects[0] ??
    null;

  /* ----------------------------------------------------------
     RETURN HOME DATA
  ---------------------------------------------------------- */

  return {
    profile,
    socialLinks,
    projects,
    featuredProject,
    gallery,
    articles,
  };
}
