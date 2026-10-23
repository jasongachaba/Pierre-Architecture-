"use client";

import { motion } from "motion/react";
import AdminIcon from "./AdminIcon";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[84px] items-center justify-between border-b border-[#1c1c1a]/10 /95 px-6 backdrop-blur-md sm:px-8 lg:px-12">

      {/* LEFT */}
      <div className="flex items-center gap-5">

        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center border border-[#1c1c1a]/10 text-[#77736c] transition-colors hover:border-[#9b7b54] hover:text-[#9b7b54] lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <AdminIcon name="menu" size={18} />
        </button>

        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
            Studio
          </p>

          <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[#77736c]">
            Administration
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <button
          className="hidden h-10 w-10 items-center justify-center text-[#77736c] transition-colors hover:text-[#9b7b54] sm:flex"
          title="Rechercher"
        >
          <AdminIcon name="search" size={17} />
        </button>

        {/* Notifications */}
        <button
          className="relative flex h-10 w-10 items-center justify-center text-[#77736c] transition-colors hover:text-[#9b7b54]"
          title="Notifications"
        >
          <AdminIcon name="bell" size={17} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#9b7b54]" />
        </button>

        {/* Separator */}
        <div className="hidden h-7 w-px bg-[#1c1c1a]/10 sm:block" />

        {/* Profile */}
        <motion.div
          whileHover={{ y: -1 }}
          className="hidden items-center gap-3 sm:flex"
        >
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.12em]">
              Pierre Gachaba
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-[#77736c]">
              Administrateur
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center bg-[#1c1c1a] text-[9px] text-white">
            PG
          </div>
        </motion.div>
      </div>
    </header>
  );
}