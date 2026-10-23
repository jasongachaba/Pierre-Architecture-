"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center  px-6 text-white">
      <div className="w-full max-w-2xl text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#b58a5b]">
          Une erreur est survenue
        </p>

        <h1 className="font-display text-6xl leading-none md:text-8xl">
          Quelque chose
          <br />
          <span className="text-white/40">s'est mal passé.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-white/50">
          La page n'a pas pu être chargée correctement. Vous pouvez essayer
          de nouveau ou retourner à l'accueil.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-[#b58a5b] hover:text-white"
          >
            Réessayer
          </button>

          <a
            href="/"
            className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white transition hover:border-white/50"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </main>
  );
}