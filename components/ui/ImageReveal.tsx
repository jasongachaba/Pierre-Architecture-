"use client";

import Image from "next/image";
import { motion, MotionValue, useTransform } from "motion/react";

interface ImageRevealProps {
  src: string;
  alt: string;
  progress: MotionValue<number>;
  className?: string;
}

export default function ImageReveal({
  src,
  alt,
  progress,
  className = "",
}: ImageRevealProps) {
  const scale = useTransform(progress, [0, 1], [1.08, 1]);
  const y = useTransform(progress, [0, 1], [30, -20]);

  return (
    <motion.div
      style={{ scale, y }}
      className={`relative overflow-hidden ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-cover"
        priority={false}
      />
    </motion.div>
  );
}