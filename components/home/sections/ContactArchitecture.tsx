"use client";

import Link from "next/link";

import type {
  HomeProfile,
  HomeSocialLink,
} from "@/components/home/data/homeData";

/* ============================================================
   TYPES
============================================================ */

interface FooterProps {
  profile: HomeProfile | null;
  socialLinks: HomeSocialLink[];
}

/* ============================================================
   HELPERS
============================================================ */

function getSocialLabel(platform: string): string {
  const normalized = platform.trim().toLowerCase();

  const labels: Record<string, string> = {
    instagram: "Instagram",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    behance: "Behance",
    pinterest: "Pinterest",
    youtube: "YouTube",
    twitter: "Twitter",
    x: "X",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    github: "GitHub",
    tiktok: "TikTok",
  };

  if (labels[normalized]) {
    return labels[normalized];
  }

  return (
    platform.charAt(0).toUpperCase() +
    platform.slice(1)
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function Footer({
  profile,
  socialLinks,
}: FooterProps) {
  /* ==========================================================
     PROFILE
  ========================================================== */

  const displayName =
    profile?.full_name?.trim() ||
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Architecture Studio";

  const professionalTitle =
    profile?.professional_title?.trim() ||
    "Architecture & Design";

  const description =
    profile?.bio?.trim() ||
    "Conception architecturale, design d’intérieur et urbanisme durable.";

  const email =
    profile?.email?.trim() || null;

  const phone =
    profile?.phone?.trim() || null;

  const phoneSecondary =
    profile?.phone_secondary?.trim() || null;

  const websiteUrl =
    profile?.website_url?.trim() || null;

  const availability =
    profile?.availability?.trim() || null;

  /* ==========================================================
     SOCIAL LINKS
  ========================================================== */

  const visibleSocialLinks = [...socialLinks]
    .filter(
      (link) =>
        link.is_visible &&
        Boolean(link.url?.trim()),
    )
    .sort(
      (a, b) =>
        a.display_order - b.display_order,
    );

  /* ==========================================================
     CURRENT YEAR
  ========================================================== */

  const currentYear = new Date().getFullYear();

  /* ==========================================================
     PHONE NORMALIZATION
  ========================================================== */

  const normalizePhone = (value: string) =>
    value.replace(/[^\d+]/g, "");

  return (
    <footer className="relative border-t border-[#1c1c1a]/15 bg-[#eee9df] px-6 py-16 text-[#1c1c1a] md:px-12">

      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="grid grid-cols-1 gap-12 border-b border-[#1c1c1a]/10 pb-16 md:grid-cols-4">

          {/* ==================================================
              COLUMN 1
              BRAND / PROFILE
          ================================================== */}

          <div className="space-y-5 md:col-span-1">

            <Link
              href="/"
              aria-label={`Accueil — ${displayName}`}
              className="group inline-block"
            >
              <h3 className="font-display text-xl uppercase tracking-tight transition-opacity duration-300 group-hover:opacity-70">
                {displayName}
              </h3>
            </Link>

            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9b7b54]">
              {professionalTitle}
            </p>

            <p className="max-w-xs text-xs leading-relaxed text-[#625f59]">
              {description}
            </p>

            {profile?.years_experience !== null &&
              profile?.years_experience !== undefined && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#625f59]">
                  {profile.years_experience}{" "}
                  {profile.years_experience > 1
                    ? "années"
                    : "année"}{" "}
                  d’expérience
                </p>
              )}

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1c1c1a] transition-colors hover:text-[#9b7b54]"
              >
                Visiter le site →
              </a>
            )}
          </div>

          {/* ==================================================
              COLUMN 2
              NAVIGATION
          ================================================== */}

          <div className="space-y-5">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9b7b54]">
              Navigation
            </p>

            <ul className="space-y-3 text-xs text-[#625f59]">

              <li>
                <Link
                  href="#projets"
                  className="transition-colors hover:text-[#1c1c1a]"
                >
                  Projets
                </Link>
              </li>

              <li>
                <Link
                  href="#vision"
                  className="transition-colors hover:text-[#1c1c1a]"
                >
                  Vision
                </Link>
              </li>

              <li>
                <Link
                  href="#studio"
                  className="transition-colors hover:text-[#1c1c1a]"
                >
                  Studio
                </Link>
              </li>

              <li>
                <Link
                  href="#contact"
                  className="transition-colors hover:text-[#1c1c1a]"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/projets"
                  className="transition-colors hover:text-[#1c1c1a]"
                >
                  Tous les projets
                </Link>
              </li>

              <li>
                <Link
                  href="/articles"
                  className="transition-colors hover:text-[#1c1c1a]"
                >
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* ==================================================
              COLUMN 3
              SOCIAL LINKS
          ================================================== */}

          <div className="space-y-5">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9b7b54]">
              Suivez-nous
            </p>

            {visibleSocialLinks.length > 0 ? (
              <ul className="space-y-3 text-xs text-[#625f59]">

                {visibleSocialLinks.map(
                  (social) => {
                    const label =
                      getSocialLabel(
                        social.platform,
                      );

                    return (
                      <li key={social.id}>

                        <a
                          href={social.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center gap-2 transition-colors hover:text-[#1c1c1a]"
                        >
                          <span>
                            {label}
                          </span>

                          {social.username && (
                            <span className="text-[10px] text-[#9b7b54] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              @{social.username}
                            </span>
                          )}

                          <span className="text-[10px] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                            ↗
                          </span>
                        </a>

                      </li>
                    );
                  },
                )}

              </ul>
            ) : (
              <p className="max-w-xs text-xs leading-relaxed text-[#625f59]">
                Aucun réseau social public
                pour le moment.
              </p>
            )}
          </div>

          {/* ==================================================
              COLUMN 4
              CONTACT
          ================================================== */}

          <div className="space-y-5">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9b7b54]">
              Contact
            </p>

            {/* EMAIL */}

            {email && (
              <div className="space-y-2">

                <p className="text-[9px] uppercase tracking-[0.2em] text-[#9b7b54]">
                  Email
                </p>

                <a
                  href={`mailto:${email}`}
                  className="block break-all text-xs font-medium text-[#1c1c1a] transition-colors hover:text-[#9b7b54]"
                >
                  {email}
                </a>

              </div>
            )}

            {/* PHONE PRINCIPAL */}

            {phone && (
              <div className="space-y-2">

                <p className="text-[9px] uppercase tracking-[0.2em] text-[#9b7b54]">
                  Téléphone
                </p>

                <a
                  href={`tel:${normalizePhone(
                    phone,
                  )}`}
                  className="block text-xs text-[#625f59] transition-colors hover:text-[#1c1c1a]"
                >
                  {phone}
                </a>

              </div>
            )}

            {/* PHONE SECONDARY */}

            {phoneSecondary && (
              <div className="space-y-2">

                <p className="text-[9px] uppercase tracking-[0.2em] text-[#9b7b54]">
                  Téléphone secondaire
                </p>

                <a
                  href={`tel:${normalizePhone(
                    phoneSecondary,
                  )}`}
                  className="block text-xs text-[#625f59] transition-colors hover:text-[#1c1c1a]"
                >
                  {phoneSecondary}
                </a>

              </div>
            )}

            {/* AVAILABILITY */}

            {availability && (
              <div className="space-y-2">

                <p className="text-[9px] uppercase tracking-[0.2em] text-[#9b7b54]">
                  Disponibilité
                </p>

                <p className="text-xs leading-relaxed text-[#625f59]">
                  {availability}
                </p>

              </div>
            )}

            {/* FALLBACK */}

            {!email &&
              !phone &&
              !phoneSecondary && (
                <p className="text-xs leading-relaxed text-[#625f59]">
                  Les informations de contact
                  ne sont pas encore disponibles.
                </p>
              )}

            {/* CONTACT CTA */}

            <Link
              href="#contact"
              className="inline-flex pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1c1c1a] transition-colors hover:text-[#9b7b54]"
            >
              Demander un projet →
            </Link>
          </div>
        </div>

        {/* ====================================================
            BOTTOM BAR
        ==================================================== */}

        <div className="flex flex-col items-center justify-between gap-5 pt-8 text-xs text-[#625f59] md:flex-row">

          <p className="text-center md:text-left">
            © {currentYear} {displayName}.
            Tous droits réservés.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.18em]">

            <span>Architecture</span>

            <span
              aria-hidden="true"
              className="text-[#9b7b54]"
            >
              ·
            </span>

            <span>Design</span>

            <span
              aria-hidden="true"
              className="text-[#9b7b54]"
            >
              ·
            </span>

            <span>RDC</span>

          </div>
        </div>

      </div>
    </footer>
  );
}