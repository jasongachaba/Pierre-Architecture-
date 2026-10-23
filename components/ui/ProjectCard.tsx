import Image from "next/image";

interface ProjectCardProps {
  title: string;
  category: string;
  location: string;
  image: string;
  large?: boolean;
}

export default function ProjectCard({
  title,
  category,
  location,
  image,
  large = false,
}: ProjectCardProps) {
  return (
    <article
      className={`group ${
        large ? "md:col-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          large
            ? "aspect-[16/9]"
            : "aspect-[4/5]"
        }`}
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes={large ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover transition duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/10" />

        <div className="absolute bottom-5 left-5 text-white">
          <p className="text-[9px] uppercase tracking-[0.3em]">
            {category}
          </p>

          <h3 className="mt-2 font-display text-3xl">
            {title}
          </h3>
        </div>
      </div>

      <div className="flex justify-between border-b border-[#1c1c1a]/10 py-4 text-xs text-[#77736c]">
        <span>{location}</span>
        <span>Voir le projet →</span>
      </div>
    </article>
  );
}