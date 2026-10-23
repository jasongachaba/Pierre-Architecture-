"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import AdminIcon from "./AdminIcon";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const mainNavigation = [
  {
    number: "01",
    label: "Vue d'ensemble",
    href: "/admin",
    icon: "dashboard",
  },
  {
    number: "02",
    label: "Articles",
    href: "/admin/articles",
    icon: "articles",
  },
  {
    number: "03",
    label: "Projets",
    href: "/admin/projets",
    icon: "projects",
  },
  {
    number: "04",
    label: "Catégories",
    href: "/admin/categories",
    icon: "categories",
  },
  {
    number: "05",
    label: "Messages",
    href: "/admin/messages",
    icon: "messages",
  },
  {
    number: "06",
    label: "Demandes",
    href: "/admin/demandes",
    icon: "requests",
  },
  {
    number: "07",
    label: "Médias",
    href: "/admin/medias",
    icon: "media",
  },
  {
    number: "08",
    label: "Utilisateurs",
    href: "/admin/utilisateurs",
    icon: "users",
  },
];

const settingsNavigation = [
  {
    number: "09",
    label: "Paramètres",
    href: "/admin/parametres",
    icon: "settings",
  },
];

export default function AdminSidebar({
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#1c1c1a]/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col
          border-r border-[#1c1c1a]/10 bg-[#f5f2ea]
          transition-transform duration-500
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ==================================================
            BRAND
        ================================================== */}
        <div className="flex h-[100px] items-center justify-between border-b border-[#1c1c1a]/10 px-8">
          <Link
            href="/admin"
            onClick={onClose}
            className="group"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.32em]">
              Pierre
            </div>

            <div className="mt-1 text-[10px] uppercase tracking-[0.32em] text-[#77736c]">
              Architecture
            </div>

            <div className="mt-3 h-px w-7 bg-[#9b7b54] transition-all duration-500 group-hover:w-14" />
          </Link>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center text-[#77736c] hover:text-[#1c1c1a] lg:hidden"
            aria-label="Fermer"
          >
            <AdminIcon name="close" size={18} />
          </button>
        </div>

        {/* ==================================================
            STUDIO LABEL
        ================================================== */}
        <div className="px-8 pb-4 pt-8">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
            Administration
          </p>
        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}
        <nav className="flex-1 overflow-y-auto px-4">
          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group relative flex h-12 items-center gap-4
                    px-4 transition-colors
                    ${
                      active
                        ? "bg-[#1c1c1a] text-[#f5f2ea]"
                        : "text-[#77736c] hover:bg-[#1c1c1a]/5 hover:text-[#1c1c1a]"
                    }
                  `}
                >
                  <span
                    className={`
                      w-6 text-[9px] tracking-[0.15em]
                      ${
                        active
                          ? "text-[#9b7b54]"
                          : "text-[#aaa69e]"
                      }
                    `}
                  >
                    {item.number}
                  </span>

                  <span
                    className={`
                      transition-colors
                      ${
                        active
                          ? "text-[#f5f2ea]"
                          : "text-[#77736c]"
                      }
                    `}
                  >
                    <AdminIcon name={item.icon} size={16} />
                  </span>

                  <span className="text-[11px] uppercase tracking-[0.12em]">
                    {item.label}
                  </span>

                  {active && (
                    <motion.span
                      layoutId="admin-active-line"
                      className="absolute right-0 top-0 h-full w-[2px] bg-[#9b7b54]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ==================================================
              SETTINGS
          ================================================== */}
          <div className="mt-10 border-t border-[#1c1c1a]/10 pt-6">
            <p className="mb-3 px-4 text-[8px] uppercase tracking-[0.3em] text-[#aaa69e]">
              Configuration
            </p>

            {settingsNavigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group relative flex h-12 items-center gap-4
                    px-4 transition-colors
                    ${
                      active
                        ? "bg-[#1c1c1a] text-[#f5f2ea]"
                        : "text-[#77736c] hover:bg-[#1c1c1a]/5 hover:text-[#1c1c1a]"
                    }
                  `}
                >
                  <span
                    className={`
                      w-6 text-[9px]
                      ${
                        active
                          ? "text-[#9b7b54]"
                          : "text-[#aaa69e]"
                      }
                    `}
                  >
                    {item.number}
                  </span>

                  <AdminIcon name={item.icon} size={16} />

                  <span className="text-[11px] uppercase tracking-[0.12em]">
                    {item.label}
                  </span>

                  {active && (
                    <span className="absolute right-0 top-0 h-full w-[2px] bg-[#9b7b54]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ==================================================
            USER
        ================================================== */}
        <div className="border-t border-[#1c1c1a]/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#1c1c1a] text-[10px] text-white">
              PG
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] uppercase tracking-[0.1em]">
                Pierre Gachaba
              </p>

              <p className="mt-1 truncate text-[9px] text-[#77736c]">
                Administrateur
              </p>
            </div>

            <button
              className="text-[#77736c] transition-colors hover:text-[#9b7b54]"
              title="Déconnexion"
            >
              <AdminIcon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}