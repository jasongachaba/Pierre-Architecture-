export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "admin" | "editor" | "user";
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: "draft" | "published";
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  category_id: string | null;
  cover_image: string | null;
  status: "draft" | "published";
  year: number | null;
  created_at: string;
  updated_at: string;
}