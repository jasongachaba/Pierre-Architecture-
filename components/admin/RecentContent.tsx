"use client";

import Link from "next/link";
import { motion } from "motion/react";

const contents = [
  {
    number: "01",
    title: "Habiter autrement : penser l'espace contemporain",
    category: "Architecture",
    date: "28.09.2026",
    type: "Article",
  },
  {
    number: "02",
    title: "Villa K — Kinshasa",
    category: "Résidentiel",
    date: "24.09.2026",
    type: "Projet",
  },
  {
    number: "03",
    title: "La lumière comme matière architecturale",
    category: "Réflexion",
    date: "20.09.2026",
    type: "Article",
  },
];

export default function RecentContent() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">

        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
            Publication
          </p>

          <h2 className="mt-2 text-2xl font-light tracking-[-0.03em]">
            Contenus récents
          </h2>
        </div>

        <Link
          href="/admin/articles"
          className="hidden text-[9px] uppercase tracking-[0.2em] text-[#77736c] sm:block"
        >
          Tous les contenus →
        </Link>
      </div>

      <div className="border-t border-[#1c1c1a]/10">

        {contents.map((content, index) => (
          <motion.div
            key={content.number}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: index * 0.08,
            }}
            className="grid grid-cols-[35px_1fr] gap-4 border-b border-[#1c1c1a]/10 py-5 sm:grid-cols-[45px_1fr_auto]"
          >
            <span className="text-[9px] text-[#aaa69e]">
              {content.number}
            </span>

            <div>
              <p className="max-w-md text-xs leading-5">
                {content.title}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-[8px] uppercase tracking-[0.15em] text-[#77736c]">
                <span>{content.type}</span>

                <span className="h-1 w-1 rounded-full bg-[#9b7b54]" />

                <span>{content.category}</span>
              </div>
            </div>

            <span className="hidden text-[9px] text-[#77736c] sm:block">
              {content.date}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}