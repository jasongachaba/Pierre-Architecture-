"use client";

import Link from "next/link";
import { motion } from "motion/react";
import AdminIcon from "./AdminIcon";

const requests = [
  {
    id: "01",
    name: "Villa résidentielle",
    location: "Kinshasa",
    type: "Projet résidentiel",
    status: "Nouveau",
  },
  {
    id: "02",
    name: "Immeuble administratif",
    location: "Kinshasa",
    type: "Marché",
    status: "En cours",
  },
  {
    id: "03",
    name: "Rénovation intérieure",
    location: "Goma",
    type: "Architecture intérieure",
    status: "Nouveau",
  },
  {
    id: "04",
    name: "Complexe commercial",
    location: "Lubumbashi",
    type: "Projet commercial",
    status: "À examiner",
  },
];

export default function RecentRequests() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">

        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#9b7b54]">
            Activité
          </p>

          <h2 className="mt-2 text-2xl font-light tracking-[-0.03em]">
            Demandes récentes
          </h2>
        </div>

        <Link
          href="/admin/demandes"
          className="group hidden items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#77736c] sm:flex"
        >
          Voir toutes

          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>

      <div className="border-t border-[#1c1c1a]/10">

        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.45,
              delay: index * 0.07,
            }}
            className="group grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b border-[#1c1c1a]/10 py-5 sm:grid-cols-[50px_1.5fr_1fr_auto]"
          >
            <span className="text-[9px] text-[#aaa69e]">
              {request.id}
            </span>

            <div>
              <p className="text-xs uppercase tracking-[0.08em]">
                {request.name}
              </p>

              <p className="mt-1 text-[10px] text-[#77736c]">
                {request.location}
              </p>
            </div>

            <p className="hidden text-[10px] text-[#77736c] sm:block">
              {request.type}
            </p>

            <div className="flex items-center gap-3">
              <span
                className={`
                  text-[8px] uppercase tracking-[0.15em]
                  ${
                    request.status === "Nouveau"
                      ? "text-[#9b7b54]"
                      : "text-[#77736c]"
                  }
                `}
              >
                {request.status}
              </span>

              <AdminIcon
                name="arrow"
                size={14}
                strokeWidth={1}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <Link
        href="/admin/demandes"
        className="mt-5 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#77736c] sm:hidden"
      >
        Voir toutes les demandes →
      </Link>
    </section>
  );
}