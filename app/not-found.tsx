export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] px-6">
      <section className="w-full max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-[#b58a5b]">
          404
        </p>

        <h1 className="mt-6 font-display text-6xl leading-none text-[#171717] md:text-9xl">
          Page introuvable
        </h1>

        <p className="mx-auto mt-8 max-w-lg text-base leading-7 text-[#706e69]">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <a
          href="/"
          className="mt-10 inline-flex rounded-full bg-[#171717] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#b58a5b]"
        >
          Retour à l'accueil
        </a>
      </section>
    </main>
  );
}