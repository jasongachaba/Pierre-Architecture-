"use client";

import { motion, type MotionValue } from "motion/react";

interface HouseProps {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export default function House({
  opacity,
  scale,
}: HouseProps) {
  return (
    <motion.div
      style={{ opacity, scale }}
      className="
        absolute
        left-1/2
        top-1/2
        h-[260px]
        w-[300px]
        -translate-x-1/2
        -translate-y-1/2
        md:h-[360px]
        md:w-[420px]
      "
    >
      {/* =====================================================
          CONSTRUCTION / LIGNES DE PROJET
      ===================================================== */}

      {/* Ligne verticale de référence */}
      <div
        className="
          absolute
          left-1/2
          top-[3%]
          h-[94%]
          w-px
          bg-[#a77b4e]/20
        "
      />

      {/* Ligne horizontale de référence */}
      <div
        className="
          absolute
          bottom-[8%]
          left-[-8%]
          h-px
          w-[116%]
          bg-[#1c1c1a]/20
        "
      />

      {/* Petite ligne de cote gauche */}
      <div
        className="
          absolute
          left-[-5%]
          top-[24%]
          h-[48%]
          w-px
          bg-[#1c1c1a]/20
        "
      />

      <div
        className="
          absolute
          left-[-7%]
          top-[24%]
          h-px
          w-[4%]
          bg-[#1c1c1a]/30
        "
      />

      <div
        className="
          absolute
          left-[-7%]
          bottom-[28%]
          h-px
          w-[4%]
          bg-[#1c1c1a]/30
        "
      />

      {/* =====================================================
          OMBRE AU SOL
      ===================================================== */}

      <div
        className="
          absolute
          bottom-[5%]
          left-[8%]
          h-[8%]
          w-[84%]
          rounded-[50%]
          bg-black/[0.06]
          blur-[8px]
        "
      />

      {/* =====================================================
          VOLUME PRINCIPAL
      ===================================================== */}

      <div
        className="
          absolute
          bottom-[13%]
          left-[10%]
          h-[55%]
          w-[80%]
          border
          border-[#1c1c1a]
          bg-white/80
        "
      >
        {/* =================================================
            LIGNE DE PLINTHE
        ================================================= */}

        <div
          className="
            absolute
            bottom-[8%]
            left-0
            h-px
            w-full
            bg-[#1c1c1a]/30
          "
        />

        {/* =================================================
            PORTE PRINCIPALE
        ================================================= */}

        <div
          className="
            absolute
            bottom-0
            left-1/2
            h-[48%]
            w-[19%]
            -translate-x-1/2
            border-x
            border-t
            border-[#1c1c1a]
            bg-[#f5f3ef]/70
          "
        >
          {/* Panneau intérieur */}
          <div
            className="
              absolute
              inset-[10%]
              border
              border-[#1c1c1a]/30
            "
          />

          {/* Poignée */}
          <div
            className="
              absolute
              right-[12%]
              top-1/2
              h-[3px]
              w-[3px]
              rounded-full
              bg-[#1c1c1a]
            "
          />
        </div>

        {/* =================================================
            FENÊTRE GAUCHE
        ================================================= */}

        <div
          className="
            absolute
            left-[10%]
            top-[22%]
            h-[25%]
            w-[22%]
            border
            border-[#1c1c1a]
            bg-[#e9e5dc]/40
          "
        >
          {/* cadre vertical */}
          <div
            className="
              absolute
              left-1/2
              top-0
              h-full
              w-px
              -translate-x-1/2
              bg-[#1c1c1a]
            "
          />

          {/* cadre horizontal */}
          <div
            className="
              absolute
              left-0
              top-1/2
              h-px
              w-full
              -translate-y-1/2
              bg-[#1c1c1a]
            "
          />

          {/* profondeur */}
          <div
            className="
              absolute
              -right-[4px]
              top-[4px]
              h-full
              w-[3px]
              border-r
              border-[#1c1c1a]/30
            "
          />
        </div>

        {/* =================================================
            FENÊTRE DROITE
        ================================================= */}

        <div
          className="
            absolute
            right-[10%]
            top-[22%]
            h-[25%]
            w-[22%]
            border
            border-[#1c1c1a]
            bg-[#e9e5dc]/40
          "
        >
          {/* cadre vertical */}
          <div
            className="
              absolute
              left-1/2
              top-0
              h-full
              w-px
              -translate-x-1/2
              bg-[#1c1c1a]
            "
          />

          {/* cadre horizontal */}
          <div
            className="
              absolute
              left-0
              top-1/2
              h-px
              w-full
              -translate-y-1/2
              bg-[#1c1c1a]
            "
          />

          {/* profondeur */}
          <div
            className="
              absolute
              -right-[4px]
              top-[4px]
              h-full
              w-[3px]
              border-r
              border-[#1c1c1a]/30
            "
          />
        </div>

        {/* =================================================
            LIGNE HORIZONTALE ARCHITECTURALE
        ================================================= */}

        <div
          className="
            absolute
            left-[5%]
            right-[5%]
            top-[56%]
            h-px
            bg-[#1c1c1a]/15
          "
        />
      </div>

      {/* =====================================================
          TOIT — VOLUME ARCHITECTURAL
      ===================================================== */}

      <div
        className="
          absolute
          left-[7%]
          top-[17%]
          h-[29%]
          w-[86%]
        "
      >
        {/* versant gauche */}
        <div
          className="
            absolute
            left-[2%]
            top-[8%]
            h-px
            w-[49%]
            origin-left
            rotate-[-25deg]
            bg-[#1c1c1a]
          "
        />

        {/* versant droit */}
        <div
          className="
            absolute
            right-[2%]
            top-[8%]
            h-px
            w-[49%]
            origin-right
            rotate-[25deg]
            bg-[#1c1c1a]
          "
        />

        {/* ligne basse du toit */}
        <div
          className="
            absolute
            bottom-[0]
            left-[5%]
            h-px
            w-[90%]
            bg-[#1c1c1a]/40
          "
        />

        {/* axe central du toit */}
        <div
          className="
            absolute
            left-1/2
            top-[8%]
            h-[38%]
            w-px
            -translate-x-1/2
            bg-[#a77b4e]/45
          "
        />
      </div>

      {/* =====================================================
          PETIT VOLUME LATÉRAL
          
          Donne plus de profondeur à la maison.
      ===================================================== */}

      <div
        className="
          absolute
          bottom-[13%]
          right-[8%]
          h-[40%]
          w-[13%]
          border
          border-[#1c1c1a]/50
          bg-[#f1eee8]/50
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-[20%]
            h-[25%]
            w-[55%]
            -translate-x-1/2
            border
            border-[#1c1c1a]/50
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-1/2
            h-[35%]
            w-[40%]
            -translate-x-1/2
            border-x
            border-t
            border-[#1c1c1a]/50
          "
        />
      </div>

      {/* =====================================================
          ESCALIER / SOCLE
      ===================================================== */}

      <div
        className="
          absolute
          bottom-[11%]
          left-[38%]
          h-[3%]
          w-[24%]
          border
          border-[#1c1c1a]/40
          bg-white/60
        "
      />

      <div
        className="
          absolute
          bottom-[9%]
          left-[34%]
          h-[2%]
          w-[32%]
          border
          border-[#1c1c1a]/30
        "
      />

      {/* =====================================================
          SOL
      ===================================================== */}

      <div
        className="
          absolute
          bottom-[7%]
          left-[2%]
          h-px
          w-[96%]
          bg-[#1c1c1a]
        "
      />

      {/* Ligne secondaire du sol */}
      <div
        className="
          absolute
          bottom-[4%]
          left-[14%]
          h-px
          w-[72%]
          bg-[#1c1c1a]/15
        "
      />

      {/* =====================================================
          LIGNES DE CONSTRUCTION VERTICALES
      ===================================================== */}

      <div
        className="
          absolute
          left-[10%]
          top-[13%]
          h-[74%]
          w-px
          bg-[#a77b4e]/15
        "
      />

      <div
        className="
          absolute
          right-[10%]
          top-[13%]
          h-[74%]
          w-px
          bg-[#a77b4e]/15
        "
      />

      {/* =====================================================
          PETITS POINTS DE REPÈRE
      ===================================================== */}

      <div
        className="
          absolute
          left-[5%]
          top-[18%]
          h-[3px]
          w-[3px]
          rounded-full
          bg-[#a77b4e]/50
        "
      />

      <div
        className="
          absolute
          right-[5%]
          top-[18%]
          h-[3px]
          w-[3px]
          rounded-full
          bg-[#a77b4e]/50
        "
      />

      <div
        className="
          absolute
          left-[5%]
          bottom-[12%]
          h-[3px]
          w-[3px]
          rounded-full
          bg-[#a77b4e]/50
        "
      />

      <div
        className="
          absolute
          right-[5%]
          bottom-[12%]
          h-[3px]
          w-[3px]
          rounded-full
          bg-[#a77b4e]/50
        "
      />
    </motion.div>
  );
}