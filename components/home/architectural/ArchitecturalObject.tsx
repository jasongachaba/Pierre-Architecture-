"use client";

import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import House from "./House";
import Elevation from "./Elevation";
import BuildingVolume from "./BuildingVolume";
import ArchitecturalPlan from "./ArchitecturalPlan";

interface ArchitecturalObjectProps {
  documentProgress: MotionValue<number>;
  heroProgress: MotionValue<number>;
  conceptProgress: MotionValue<number>;
  designProgress: MotionValue<number>;
  projectProgress: MotionValue<number>;
}

export default function ArchitecturalObject({
  documentProgress,
  heroProgress,
  conceptProgress,
  designProgress,
  projectProgress,
}: ArchitecturalObjectProps) {
  /* ==========================================================
     SPRINGS
  ========================================================== */

  const smoothDocument = useSpring(
    documentProgress,
    {
      stiffness: 100,
      damping: 28,
      mass: 0.7,
    }
  );

  const smoothHero = useSpring(
    heroProgress,
    {
      stiffness: 95,
      damping: 27,
      mass: 0.7,
    }
  );

  const smoothConcept = useSpring(
    conceptProgress,
    {
      stiffness: 85,
      damping: 26,
      mass: 0.7,
    }
  );

  const smoothDesign = useSpring(
    designProgress,
    {
      stiffness: 90,
      damping: 27,
      mass: 0.7,
    }
  );

  const smoothProject = useSpring(
    projectProgress,
    {
      stiffness: 90,
      damping: 27,
      mass: 0.7,
    }
  );

  /* ==========================================================
     GLOBAL VISIBILITY
  ========================================================== */

  const projectVisibility = useTransform(
    smoothProject,
    [
      0,
      0.04,
      0.08,
      0.12,
    ],
    [
      1,
      0.75,
      0.3,
      0,
    ]
  );

  const documentOpacity = useTransform(
    smoothDocument,
    [
      0,
      0.62,
      0.68,
      0.72,
    ],
    [
      1,
      1,
      0.8,
      0.2,
    ]
  );

  const finalOpacity = useTransform(
    [
      documentOpacity,
      projectVisibility,
    ],
    ([a, b]) =>
      Number(a) * Number(b)
  );

  /* ==========================================================
     GLOBAL SCENE

     IMPORTANT :

     Cette scène contient uniquement :

     - House
     - Elevation
     - BuildingVolume

     Le ArchitecturalPlan est volontairement EN DEHORS.

     Cela permet au plan de rester parfaitement horizontal
     pendant que la maison / élévation peuvent tourner.
  ========================================================== */

  const sceneX = useTransform(
    smoothDocument,
    [
      0,
      0.10,
      0.20,
      0.30,
      0.40,
      0.50,
      0.60,
      0.70,
    ],
    [
      "0vw",
      "0vw",
      "-1vw",
      "-2vw",
      "-1vw",
      "0vw",
      "0vw",
      "0vw",
    ]
  );

  const sceneY = useTransform(
    smoothDocument,
    [
      0,
      0.12,
      0.25,
      0.40,
      0.55,
      0.70,
    ],
    [
      "5vh",
      "0vh",
      "0vh",
      "2vh",
      "3vh",
      "3vh",
    ]
  );

  const sceneScale = useTransform(
    smoothDocument,
    [
      0,
      0.20,
      0.40,
      0.60,
      0.72,
    ],
    [
      1,
      1,
      0.98,
      0.95,
      0.92,
    ]
  );

  const sceneRotation = useTransform(
    smoothDocument,
    [
      0,
      0.08,
      0.16,
      0.24,
      0.32,
      0.40,
      0.48,
      0.56,
      0.64,
      0.68,
      0.72,
    ],
    [
      0,
      6,
      12,
      18,
      18,
      14,
      9,
      5,
      2,
      0,
      0,
    ]
  );

  /* ==========================================================
     HOUSE
  ========================================================== */

  const houseOpacity = useTransform(
    smoothHero,
    [
      0,
      0.35,
      0.52,
      0.68,
      0.84,
      1,
    ],
    [
      1,
      1,
      0.95,
      0.7,
      0.25,
      0,
    ]
  );

  const houseScale = useTransform(
    smoothHero,
    [
      0,
      0.30,
      0.55,
      0.75,
      1,
    ],
    [
      1,
      1.04,
      0.98,
      0.86,
      0.72,
    ]
  );

  const houseX = useTransform(
    smoothHero,
    [
      0,
      0.25,
      0.50,
      0.75,
      1,
    ],
    [
      "0vw",
      "0vw",
      "-2vw",
      "-5vw",
      "-8vw",
    ]
  );

  const houseY = useTransform(
    smoothHero,
    [
      0,
      0.30,
      0.60,
      1,
    ],
    [
      "5vh",
      "1vh",
      "-1vh",
      "0vh",
    ]
  );

  const houseRotation = useTransform(
    smoothHero,
    [
      0,
      0.25,
      0.50,
      0.75,
      1,
    ],
    [
      0,
      8,
      18,
      28,
      36,
    ]
  );

  /* ==========================================================
     PLAN — ENTRÉE

     Le plan commence hors de sa position finale.

     Il est incliné au début.

     Puis il vient se poser progressivement.

     NOTE :
     Les valeurs sont conservées même si le rendu actuel
     force x / rotation à 0 dans le composant visuel.

     Elles restent disponibles pour l'animation future.
  ========================================================== */

  const planX = useTransform(
    smoothConcept,
    [
      0,
      0.10,
      0.20,
      0.30,
      0.40,
      0.50,
      0.58,
      0.64,
      0.68,
      0.72,
      1,
    ],
    [
      "-16vw",
      "-16vw",
      "-12vw",
      "-7vw",
      "-2vw",
      "4vw",
      "8vw",
      "11vw",
      "13vw",
      "13vw",
      "13vw",
    ]
  );

  const planY = useTransform(
    smoothConcept,
    [
      0,
      0.10,
      0.20,
      0.30,
      0.40,
      0.50,
      0.58,
      0.64,
      0.68,
      0.72,
      1,
    ],
    [
      "-4vh",
      "-4vh",
      "0vh",
      "4vh",
      "8vh",
      "12vh",
      "16vh",
      "18vh",
      "20vh",
      "20vh",
      "20vh",
    ]
  );

  /* ==========================================================
     PLAN ROTATION

     IMPORTANT :

     Le plan arrive à 0deg.

     Et reste à 0deg.

     Aucun parent ne le fait tourner.

     La valeur est conservée pour permettre une réactivation
     ultérieure si nécessaire.
  ========================================================== */

  const planRotate = useTransform(
    smoothConcept,
    [
      0,
      0.10,
      0.20,
      0.30,
      0.40,
      0.50,
      0.58,
      0.64,
      0.68,
      0.72,
      1,
    ],
    [
      30,
      30,
      25,
      19,
      13,
      8,
      4,
      1,
      0,
      0,
      0,
    ]
  );

  /* ==========================================================
     PLAN SCALE
  ========================================================== */

  const planScale = useTransform(
    smoothConcept,
    [
      0,
      0.15,
      0.30,
      0.45,
      0.58,
      0.68,
      0.72,
      1,
    ],
    [
      0.72,
      0.74,
      0.80,
      0.88,
      0.95,
      1,
      1,
      1,
    ]
  );

  /* ==========================================================
     PLAN OPACITY
  ========================================================== */

  const planOpacity = useTransform(
    smoothConcept,
    [
      0,
      0.12,
      0.24,
      0.36,
      0.48,
      0.58,
      0.59,
      0.60,
      0.61,
      1,
    ],
    [
      0,
      0,
      0.15,
      0.4,
      0.7,
      1,
      0,
      0,
      0,
      0,
    ]
  );

  /* ==========================================================
     PLAN SHADOW
  ========================================================== */

  const planShadow = useTransform(
    smoothConcept,
    [
      0,
      0.25,
      0.50,
      0.68,
      0.80,
      1,
    ],
    [
      0,
      0.03,
      0.07,
      0.10,
      0.10,
      0.10,
    ]
  );

  /* ==========================================================
     FUSION

     Quand le plan animé arrive :

     0.60 → fusion commence
     0.70 → forte fusion
     0.80 → terminée
  ========================================================== */

  const fusion = useTransform(
    smoothConcept,
    [
      0.55,
      0.62,
      0.70,
      0.78,
      1,
    ],
    [
      0.55,
      0.62,
      0.70,
      0.78,
      1,
    ]
  );

  /* ==========================================================
     OBJECT PLAN OPACITY

     Le plan de l'objet diminue très légèrement après
     la fusion pour laisser le plan de Section 02 prendre
     visuellement le relais.
  ========================================================== */

  const objectPlanOpacity = useTransform(
    fusion,
    [
      0,
      0.7,
      1,
    ],
    [
      1,
      1,
      0.12,
    ]
  );

  /* ==========================================================
     ELEVATION
  ========================================================== */

  const elevationOpacity = useTransform(
    smoothDesign,
    [
      0,
      0.15,
      0.30,
      0.50,
      0.72,
      0.90,
      1,
    ],
    [
      0,
      0.1,
      0.5,
      1,
      1,
      0.45,
      0,
    ]
  );

  const elevationScale = useTransform(
    smoothDesign,
    [
      0,
      0.20,
      0.40,
      0.60,
      0.80,
      1,
    ],
    [
      0.72,
      0.82,
      0.94,
      1,
      0.92,
      0.78,
    ]
  );

  const elevationX = useTransform(
    smoothDesign,
    [
      0,
      0.20,
      0.40,
      0.60,
      0.80,
      1,
    ],
    [
      "12vw",
      "10vw",
      "5vw",
      "0vw",
      "-7vw",
      "-10vw",
    ]
  );

  const elevationY = useTransform(
    smoothDesign,
    [
      0,
      0.20,
      0.40,
      0.60,
      0.80,
      1,
    ],
    [
      "19vh",
      "13vh",
      "7vh",
      "2vh",
      "-3vh",
      "-5vh",
    ]
  );

  const elevationRotation = useTransform(
    smoothDesign,
    [
      0,
      0.20,
      0.40,
      0.60,
      0.80,
      1,
    ],
    [
      0,
      10,
      25,
      45,
      70,
      90,
    ]
  );

  /* ==========================================================
     BUILDING VOLUME

     Conservé mais invisible pour l'instant.
  ========================================================== */

  const volumeOpacity = useTransform(
    smoothDocument,
    [0, 1],
    [0, 0]
  );

  const volumeScale = useTransform(
    smoothDocument,
    [0, 1],
    [0.75, 0.75]
  );

  const volumeRotation = useTransform(
    smoothDocument,
    [0, 1],
    [0, 0]
  );

  /* ==========================================================
     RENDER

     ANIMATION D'ENTRÉE DU SITE

     Cette animation est indépendante du scroll.

     Départ :
       opacity = 0
       y       = 70px
       scale   = 0.86

     Arrivée :
       opacity = 1
       y       = 0
       scale   = 1

     Une fois terminée, le conteneur interne reprend
     le contrôle de l'opacité avec finalOpacity.
  ========================================================== */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 70,
        scale: 0.86,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 1.35,
        delay: 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        pointer-events-none
        fixed
        inset-0
        z-40
        will-change-transform
      "
    >
      {/* ======================================================
          CONTENEUR CONTRÔLÉ PAR LE SCROLL

          IMPORTANT :

          L'animation d'entrée est sur le parent.

          finalOpacity est uniquement appliqué ici.

          Ainsi les deux animations ne se battent pas
          pour modifier la même propriété CSS.
      ====================================================== */}

      <motion.div
        style={{
          opacity: finalOpacity,
        }}
        className="
          absolute
          inset-0
        "
      >

        {/* ====================================================
            SCÈNE MAISON / ÉLÉVATION

            CETTE SCÈNE PEUT TOURNER.

            LE PLAN N'EST PAS DEDANS.
        ==================================================== */}

        <motion.div
          style={{
            x: sceneX,
            y: sceneY,
            rotate: sceneRotation,
            scale: sceneScale,
          }}
          className="
            absolute
            inset-0
          "
        >

          {/* ==================================================
              MAISON
          ================================================== */}

          <motion.div
            style={{
              x: houseX,
              y: houseY,
              rotate: houseRotation,
            }}
            className="
              absolute
              inset-0
            "
          >
            <House
              opacity={houseOpacity}
              scale={houseScale}
            />
          </motion.div>


          {/* ==================================================
              ÉLÉVATION
          ================================================== */}

          <motion.div
            style={{
              x: elevationX,
              y: elevationY,
              rotate: elevationRotation,
              scale: elevationScale,
              opacity: elevationOpacity,
            }}
            className="
              absolute
              inset-0
            "
          >
            <Elevation
              opacity={elevationOpacity}
              scale={elevationScale}
            />
          </motion.div>


          {/* ==================================================
              BUILDING VOLUME
          ================================================== */}

          <motion.div
            style={{
              opacity: volumeOpacity,
              scale: volumeScale,
              rotate: volumeRotation,
            }}
            className="
              absolute
              inset-0
            "
          >
            <BuildingVolume
              opacity={volumeOpacity}
              scale={volumeScale}
              rotate={volumeRotation}
            />
          </motion.div>

        </motion.div>


        {/* ======================================================
            PLAN INDÉPENDANT

            IMPORTANT :

            Il n'est PAS enfant de la scène qui tourne.

            Donc :

            sceneRotation ≠ planRotation

            Quand planRotation = 0 :

            le plan est réellement à 0°.

            Les valeurs planX et planRotate sont volontairement
            conservées au-dessus pour ne pas perdre la logique
            de l'animation originale.
        ====================================================== */}

        <motion.div
          style={{
            /*
             * Pour l'instant, le plan doit rester exactement
             * dans la position de fusion définie avec la section.
             *
             * On conserve donc :
             *
             * x      = 0
             * rotate = 0
             *
             * afin qu'il puisse se poser parfaitement sur
             * le plan de la section.
             */

            y: planY,
            scale: planScale,
            opacity: objectPlanOpacity,
          }}
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
          "
        >

          <ArchitecturalPlan
            opacity={planOpacity}
            scale={1}
            rotate={0}
            y={0}
            shadowOpacity={planShadow}
            animated={false}
          />

        </motion.div>

      </motion.div>

    </motion.div>
  );
}