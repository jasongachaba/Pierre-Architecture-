
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

/* ============================================================
   TYPES
   ============================================================ */

type ContactChannel =
  | "whatsapp"
  | "instagram"
  | "telegram"
  | "facebook"
  | "gmail"
  | "website";

/* ============================================================
   ICONS
   ============================================================ */

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path
        d="M20.1 3.9A11.9 11.9 0 0 0 12.05.55C5.55.55.26 5.84.26 12.34c0 2.08.54 4.1 1.57 5.9L.17 23.45l5.35-1.63a11.8 11.8 0 0 0 6.52 1.91h.01c6.5 0 11.78-5.29 11.78-11.79 0-3.15-1.22-6.12-3.73-8.04Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M8.2 6.9c.25-.07.53-.04.73.3l.91 1.55c.16.28.14.6-.04.84l-.56.72c-.15.19-.17.45-.04.67.42.74 1.08 1.45 1.79 2.02.79.64 1.7 1.13 2.58 1.39.24.07.5-.01.65-.21l.61-.78c.19-.24.52-.33.8-.21l1.68.72c.34.15.51.52.39.87-.18.53-.5 1.2-.96 1.43-.63.32-1.61.4-2.66.06-1.16-.38-2.61-1.2-3.88-2.33-1.11-.99-2.11-2.2-2.64-3.29-.5-1.02-.61-1.96-.35-2.6.18-.45.72-.99.99-1.08Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <circle
        cx="17.4"
        cy="6.7"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path
        d="M21.5 3.8 18.2 20c-.25 1.15-.92 1.43-1.87.9l-5.14-3.79-2.48 2.39c-.27.27-.5.5-1.02.5l.37-5.24 9.53-8.61c.41-.37-.09-.58-.63-.21L5.18 13.55.1 11.96c-1.1-.34-1.12-1.1.23-1.6L20.2 2.72c.92-.34 1.72.21 1.3 1.08Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path
        d="M13.4 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.52-1.46h1.62V4a21.7 21.7 0 0 0-2.36-.12c-2.34 0-3.94 1.43-3.94 4.05V10H7.6v3h2.64v8h3.16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path
        d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2 .95-4.04A7.5 7.5 0 1 1 20 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 11.5h.01M12 11.5h.01M16 11.5h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /*
   * Panneau de communication
   */
  const [contactPanelOpen, setContactPanelOpen] = useState(false);

  /*
   * Formulaire interne
   */
  const [websiteFormOpen, setWebsiteFormOpen] = useState(false);

  /*
   * État d'envoi
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSent, setFormSent] = useState(false);

  /*
   * Données du formulaire
   */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const navLinks = [
    {
      name: "Projets",
      href: "#projets",
    },
    {
      name: "Vision",
      href: "#vision",
    },
    {
      name: "Studio",
      href: "#studio",
    },
    {
      name: "Contact",
      href: "#contact",
    },
  ];

  /* ==========================================================
     SCROLL
     ========================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ==========================================================
     ESCAPE
     ========================================================== */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContactPanelOpen(false);
        setWebsiteFormOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ==========================================================
     BLOQUER LE SCROLL QUAND LE PANNEAU EST OUVERT
     ========================================================== */

  useEffect(() => {
    const shouldLock =
      contactPanelOpen || mobileMenuOpen;

    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [contactPanelOpen, mobileMenuOpen]);

  /* ==========================================================
     OUVRIR LE PANNEAU
     ========================================================== */

  const openContactPanel = () => {
    setMobileMenuOpen(false);
    setContactPanelOpen(true);
    setWebsiteFormOpen(false);
    setFormSent(false);
  };

  /* ==========================================================
     FERMER LE PANNEAU
     ========================================================== */

  const closeContactPanel = () => {
    setContactPanelOpen(false);
    setWebsiteFormOpen(false);
  };

  /* ==========================================================
     FORMULAIRE
     ========================================================== */

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ==========================================================
     ENVOI DU FORMULAIRE
     ========================================================== */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);

    /*
     * Pour l'instant, on simule l'envoi.
     *
     * Plus tard, cette partie pourra devenir :
     *
     * await fetch("/api/contact", {
     *   method: "POST",
     *   headers: {
     *     "Content-Type": "application/json",
     *   },
     *   body: JSON.stringify(formData),
     * });
     */

    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    console.log("Demande de contact :", formData);

    setIsSubmitting(false);
    setFormSent(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      projectType: "",
      message: "",
    });
  };

  /* ==========================================================
     LIENS EXTERNES
     ========================================================== */

  const whatsappMessage = encodeURIComponent(
    "Bonjour Pierre Architecture, je souhaite discuter d'un projet architectural."
  );

  const externalLinks = {
    whatsapp: `https://wa.me/243000000000?text=${whatsappMessage}`,

    instagram:
      "https://instagram.com/pierre.architecture",

    telegram:
      "https://t.me/pierre_architecture",

    facebook:
      "https://facebook.com/pierre.architecture",

    gmail:
      "mailto:contact@pierre-architecture.com?subject=Projet architectural&body=Bonjour Pierre Architecture,%0A%0AJe souhaite discuter d'un projet architectural.",
  };

  /* ==========================================================
     CANAUX DE COMMUNICATION
     ========================================================== */

  const channels = [
    {
      id: "whatsapp" as ContactChannel,
      name: "WhatsApp",
      description: "Échange direct et rapide",
      icon: <WhatsAppIcon />,
      href: externalLinks.whatsapp,
    },
    {
      id: "instagram" as ContactChannel,
      name: "Instagram",
      description: "Découvrir le studio",
      icon: <InstagramIcon />,
      href: externalLinks.instagram,
    },
    {
      id: "telegram" as ContactChannel,
      name: "Telegram",
      description: "Nous écrire directement",
      icon: <TelegramIcon />,
      href: externalLinks.telegram,
    },
    {
      id: "facebook" as ContactChannel,
      name: "Facebook",
      description: "Nous retrouver sur Messenger",
      icon: <FacebookIcon />,
      href: externalLinks.facebook,
    },
    {
      id: "gmail" as ContactChannel,
      name: "Gmail",
      description: "Envoyer un e-mail",
      icon: <MailIcon />,
      href: externalLinks.gmail,
    },
  ];

  return (
    <>
      {/* ======================================================
          HEADER
          ====================================================== */}

      <motion.header
        initial={{
          y: -100,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.6,
          ease: [0.25, 1, 0.5, 1],
        }}
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50
          px-6
          md:px-12
          transition-all
          duration-500
          ${
            isScrolled
              ? "py-4 bg-[#eee9df]/90 backdrop-blur-md border-b border-[#1c1c1a]/10 shadow-sm"
              : "py-6 bg-transparent"
          }
        `}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">

          {/* ==================================================
              LOGO
              ================================================== */}

          <Link
            href="/"
            className="
              font-display
              text-lg
              tracking-tight
              uppercase
              text-[#1c1c1a]
            "
          >
            Pierre{" "}
            <span className="font-light text-[#9b7b54]">
              Architecture
            </span>
          </Link>

          {/* ==================================================
              DESKTOP NAVIGATION
              ================================================== */}

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  text-[#625f59]
                  hover:text-[#1c1c1a]
                  transition-colors
                  relative
                  group
                  py-1
                "
              >
                <span>{link.name}</span>

                <span
                  className="
                    absolute
                    bottom-0
                    left-0
                    w-0
                    h-px
                    bg-[#9b7b54]
                    transition-all
                    duration-300
                    group-hover:w-full
                  "
                />
              </Link>
            ))}
          </nav>

          {/* ==================================================
              BOUTON CONTACT DESKTOP
              ================================================== */}

          <div className="hidden md:block">
            <button
              type="button"
              onClick={openContactPanel}
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                border-[#1c1c1a]/20
                bg-transparent
                px-5
                py-2.5
                text-xs
                uppercase
                tracking-[0.15em]
                text-[#1c1c1a]
                transition-all
                duration-300
                hover:bg-[#1c1c1a]
                hover:text-white
                hover:border-[#1c1c1a]
              "
            >
              Discuter d'un projet
            </button>
          </div>

          {/* ==================================================
              BURGER MOBILE
              ================================================== */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className="
              md:hidden
              relative
              z-[70]
              flex
              flex-col
              justify-center
              items-center
              w-10
              h-10
              gap-1.5
              focus:outline-none
            "
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <motion.span
              animate={
                mobileMenuOpen
                  ? {
                      rotate: 45,
                      y: 6,
                    }
                  : {
                      rotate: 0,
                      y: 0,
                    }
              }
              className="
                w-6
                h-0.5
                bg-[#1c1c1a]
                block
              "
            />

            <motion.span
              animate={
                mobileMenuOpen
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 1,
                    }
              }
              className="
                w-6
                h-0.5
                bg-[#1c1c1a]
                block
              "
            />

            <motion.span
              animate={
                mobileMenuOpen
                  ? {
                      rotate: -45,
                      y: -6,
                    }
                  : {
                      rotate: 0,
                      y: 0,
                    }
              }
              className="
                w-6
                h-0.5
                bg-[#1c1c1a]
                block
              "
            />
          </button>
        </div>
      </motion.header>

      {/* ======================================================
          MENU MOBILE
          ====================================================== */}

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="
              fixed
              inset-0
              z-[60]
              bg-[#eee9df]
              px-6
              pt-32
              pb-12
              flex
              flex-col
              justify-between
              md:hidden
            "
          >
            <div className="flex flex-col gap-6">

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-[#9b7b54]
                "
              >
                Menu de navigation
              </p>

              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="
                      font-display
                      text-4xl
                      tracking-tight
                      text-[#1c1c1a]
                      hover:text-[#9b7b54]
                      transition-colors
                    "
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div
              className="
                space-y-6
                pt-8
                border-t
                border-[#1c1c1a]/15
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-1
                  text-xs
                  text-[#625f59]
                "
              >
                <p className="text-[#1c1c1a] font-medium">
                  Bureau Kinshasa
                </p>

                <p>
                  contact@pierre-architecture.com
                </p>
              </div>

              <button
                type="button"
                onClick={openContactPanel}
                className="
                  w-full
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  bg-[#1c1c1a]
                  py-4
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  text-white
                "
              >
                Discuter d'un projet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          OVERLAY CONTACT
          ====================================================== */}

      <AnimatePresence>
        {contactPanelOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            onClick={closeContactPanel}
            className="
              fixed
              inset-0
              z-[80]
              bg-[#1c1c1a]/25
              backdrop-blur-[2px]
            "
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          PANNEAU CONTACT GAUCHE
          ====================================================== */}

      <AnimatePresence>
        {contactPanelOpen && (
          <motion.aside
            initial={{
              x: "-100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "-100%",
            }}
            transition={{
              duration: 0.55,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="
              fixed
              top-0
              left-0
              bottom-0
              z-[90]
              w-full
              sm:w-[440px]
              bg-[#eee9df]
              text-[#1c1c1a]
              shadow-2xl
              overflow-y-auto
            "
          >
            {/* ==================================================
                HEADER DU PANNEAU
                ================================================== */}

            <div
              className="
                sticky
                top-0
                z-10
                bg-[#eee9df]/95
                backdrop-blur-md
                border-b
                border-[#1c1c1a]/10
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-6
                  py-5
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.3em]
                      text-[#9b7b54]
                      mb-1
                    "
                  >
                    Communication
                  </p>

                  <h2
                    className="
                      font-display
                      text-xl
                      tracking-tight
                    "
                  >
                    Parlons de votre projet
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeContactPanel}
                  aria-label="Fermer"
                  className="
                    w-10
                    h-10
                    rounded-full
                    border
                    border-[#1c1c1a]/15
                    flex
                    items-center
                    justify-center
                    text-[#625f59]
                    hover:bg-[#1c1c1a]
                    hover:text-white
                    transition-colors
                  "
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* ==================================================
                CONTENU
                ================================================== */}

            <div className="px-6 py-8">

              <AnimatePresence mode="wait">

                {!websiteFormOpen ? (
                  <motion.div
                    key="channels"
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -15,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    {/* INTRODUCTION */}

                    
                    {/* ==================================================
                        CANAUX EXTERNES
                        ================================================== */}

                    <div className="space-y-2">

                      {channels.map((channel, index) => (
                        <motion.a
                          key={channel.id}
                          href={channel.href}
                          target={
                            channel.id === "gmail"
                              ? undefined
                              : "_blank"
                          }
                          rel={
                            channel.id === "gmail"
                              ? undefined
                              : "noopener noreferrer"
                          }
                          initial={{
                            opacity: 0,
                            x: -20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: index * 0.06,
                            duration: 0.35,
                          }}
                          className="
                            group
                            flex
                            items-center
                            gap-4
                            p-4
                            border
                            border-[#1c1c1a]/10
                            bg-[#f5f2ea]/50
                            hover:bg-[#f5f2ea]
                            hover:border-[#9b7b54]/40
                            transition-all
                            duration-300
                          "
                        >

                          {/* ICON */}

                          <span
                            className="
                              flex
                              items-center
                              justify-center
                              w-11
                              h-11
                              shrink-0
                              rounded-full
                              border
                              border-[#1c1c1a]/10
                              text-[#625f59]
                              group-hover:text-[#9b7b54]
                              group-hover:border-[#9b7b54]/40
                              transition-all
                            "
                          >
                            {channel.icon}
                          </span>

                          {/* TEXTE */}

                          <span className="flex-1">

                            <span
                              className="
                                block
                                text-sm
                                font-medium
                                text-[#1c1c1a]
                              "
                            >
                              {channel.name}
                            </span>

                            <span
                              className="
                                block
                                mt-0.5
                                text-[11px]
                                text-[#7a766f]
                              "
                            >
                              {channel.description}
                            </span>

                          </span>

                          {/* ARROW */}

                          <span
                            className="
                              text-[#9b7b54]
                              opacity-50
                              group-hover:opacity-100
                              group-hover:translate-x-1
                              transition-all
                            "
                          >
                            <ArrowIcon />
                          </span>

                        </motion.a>
                      ))}

                    </div>

                    {/* ==================================================
                        SEPARATEUR
                        ================================================== */}

                    <div className="flex items-center gap-4 my-7">

                      <div className="h-px flex-1 bg-[#1c1c1a]/10" />

                      <span
                        className="
                          text-[9px]
                          uppercase
                          tracking-[0.25em]
                          text-[#9b7b54]
                        "
                      >
                        ou
                      </span>

                      <div className="h-px flex-1 bg-[#1c1c1a]/10" />

                    </div>

                    {/* ==================================================
                        FORMULAIRE INTERNE
                        ================================================== */}

                    <button
                      type="button"
                      onClick={() => {
                        setWebsiteFormOpen(true);
                        setFormSent(false);
                      }}
                      className="
                        group
                        w-full
                        flex
                        items-center
                        gap-4
                        p-4
                        text-left
                        bg-[#1c1c1a]
                        text-white
                        transition-all
                        duration-300
                        hover:bg-[#292925]
                      "
                    >

                      <span
                        className="
                          flex
                          items-center
                          justify-center
                          w-11
                          h-11
                          shrink-0
                          rounded-full
                          border
                          border-white/15
                          text-[#d2b58d]
                        "
                      >
                        <MessageIcon />
                      </span>

                      <span className="flex-1">

                        <span
                          className="
                            block
                            text-sm
                            font-medium
                          "
                        >
                          Depuis le site
                        </span>

                        <span
                          className="
                            block
                            mt-0.5
                            text-[11px]
                            text-white/55
                          "
                        >
                          Envoyer une demande de projet
                        </span>

                      </span>

                      <span
                        className="
                          text-[#d2b58d]
                          group-hover:translate-x-1
                          transition-transform
                        "
                      >
                        <ArrowIcon />
                      </span>

                    </button>

                    {/* ==================================================
                        FOOTER
                        ================================================== */}

                    <div className="mt-10">

                      <div
                        className="
                          border-t
                          border-[#1c1c1a]/10
                          pt-5
                        "
                      >

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.25em]
                            text-[#9b7b54]
                            mb-2
                          "
                        >
                          Bureau
                        </p>

                        <p
                          className="
                            text-xs
                            text-[#625f59]
                          "
                        >
                          Kinshasa, RDC
                        </p>

                        <p
                          className="
                            text-xs
                            text-[#625f59]
                            mt-1
                          "
                        >
                          contact@pierre-architecture.com
                        </p>

                      </div>

                    </div>

                  </motion.div>

                ) : (

                  /* ====================================================
                     FORMULAIRE
                     ==================================================== */

                  <motion.div
                    key="form"
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 15,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >

                    {/* RETOUR */}

                    <button
                      type="button"
                      onClick={() => {
                        setWebsiteFormOpen(false);
                        setFormSent(false);
                      }}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-[10px]
                        uppercase
                        tracking-[0.2em]
                        text-[#625f59]
                        hover:text-[#9b7b54]
                        transition-colors
                        mb-7
                      "
                    >
                      <span className="rotate-180">
                        <ArrowIcon />
                      </span>

                      Retour
                    </button>

                    {!formSent ? (

                      <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                      >

                        {/* INTRO */}

                        <div className="mb-7">

                          <p
                            className="
                              text-sm
                              leading-relaxed
                              text-[#625f59]
                            "
                          >
                            Décrivez-nous votre projet.
                            Nous reviendrons vers vous
                            pour poursuivre l'échange.
                          </p>

                        </div>

                        {/* NOM */}

                        <div>

                          <label
                            htmlFor="name"
                            className="
                              block
                              mb-2
                              text-[9px]
                              uppercase
                              tracking-[0.2em]
                              text-[#625f59]
                            "
                          >
                            Nom complet
                          </label>

                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Votre nom"
                            className="
                              w-full
                              bg-transparent
                              border-b
                              border-[#1c1c1a]/20
                              py-3
                              text-sm
                              text-[#1c1c1a]
                              placeholder:text-[#625f59]/50
                              outline-none
                              focus:border-[#9b7b54]
                              transition-colors
                            "
                          />

                        </div>

                        {/* EMAIL */}

                        <div>

                          <label
                            htmlFor="email"
                            className="
                              block
                              mb-2
                              text-[9px]
                              uppercase
                              tracking-[0.2em]
                              text-[#625f59]
                            "
                          >
                            E-mail
                          </label>

                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="vous@exemple.com"
                            className="
                              w-full
                              bg-transparent
                              border-b
                              border-[#1c1c1a]/20
                              py-3
                              text-sm
                              text-[#1c1c1a]
                              placeholder:text-[#625f59]/50
                              outline-none
                              focus:border-[#9b7b54]
                              transition-colors
                            "
                          />

                        </div>

                        {/* TELEPHONE */}

                        <div>

                          <label
                            htmlFor="phone"
                            className="
                              block
                              mb-2
                              text-[9px]
                              uppercase
                              tracking-[0.2em]
                              text-[#625f59]
                            "
                          >
                            Téléphone / WhatsApp
                          </label>

                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+243 ..."
                            className="
                              w-full
                              bg-transparent
                              border-b
                              border-[#1c1c1a]/20
                              py-3
                              text-sm
                              text-[#1c1c1a]
                              placeholder:text-[#625f59]/50
                              outline-none
                              focus:border-[#9b7b54]
                              transition-colors
                            "
                          />

                        </div>

                        {/* TYPE DE PROJET */}

                        <div>

                          <label
                            htmlFor="projectType"
                            className="
                              block
                              mb-2
                              text-[9px]
                              uppercase
                              tracking-[0.2em]
                              text-[#625f59]
                            "
                          >
                            Type de projet
                          </label>

                          <select
                            id="projectType"
                            name="projectType"
                            required
                            value={formData.projectType}
                            onChange={handleInputChange}
                            className="
                              w-full
                              bg-transparent
                              border-b
                              border-[#1c1c1a]/20
                              py-3
                              text-sm
                              text-[#1c1c1a]
                              outline-none
                              focus:border-[#9b7b54]
                              transition-colors
                            "
                          >

                            <option value="">
                              Sélectionner
                            </option>

                            <option value="Maison">
                              Maison individuelle
                            </option>

                            <option value="Immeuble">
                              Immeuble
                            </option>

                            <option value="Bureau">
                              Bureau
                            </option>

                            <option value="Commerce">
                              Commerce
                            </option>

                            <option value="Renovation">
                              Rénovation
                            </option>

                            <option value="Interieur">
                              Aménagement intérieur
                            </option>

                            <option value="Autre">
                              Autre
                            </option>

                          </select>

                        </div>

                        {/* MESSAGE */}

                        <div>

                          <label
                            htmlFor="message"
                            className="
                              block
                              mb-2
                              text-[9px]
                              uppercase
                              tracking-[0.2em]
                              text-[#625f59]
                            "
                          >
                            Votre projet
                          </label>

                          <textarea
                            id="message"
                            name="message"
                            required
                            rows={4}
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Parlez-nous de votre projet..."
                            className="
                              w-full
                              resize-none
                              bg-transparent
                              border
                              border-[#1c1c1a]/15
                              p-3
                              text-sm
                              text-[#1c1c1a]
                              placeholder:text-[#625f59]/50
                              outline-none
                              focus:border-[#9b7b54]
                              transition-colors
                            "
                          />

                        </div>

                        {/* SUBMIT */}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="
                            w-full
                            mt-3
                            flex
                            items-center
                            justify-center
                            gap-3
                            rounded-full
                            bg-[#1c1c1a]
                            text-white
                            py-4
                            px-5
                            text-[10px]
                            uppercase
                            tracking-[0.2em]
                            transition-all
                            duration-300
                            hover:bg-[#9b7b54]
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >

                          {isSubmitting ? (
                            <>
                              <motion.span
                                animate={{
                                  rotate: 360,
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="
                                  w-4
                                  h-4
                                  rounded-full
                                  border
                                  border-white/30
                                  border-t-white
                                "
                              />

                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              Envoyer ma demande

                              <ArrowIcon />
                            </>
                          )}

                        </button>

                      </form>

                    ) : (

                      /* ==================================================
                         SUCCÈS
                         ================================================== */

                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.96,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        className="
                          min-h-[430px]
                          flex
                          flex-col
                          items-center
                          justify-center
                          text-center
                        "
                      >

                        <div
                          className="
                            w-16
                            h-16
                            rounded-full
                            bg-[#1c1c1a]
                            text-[#d2b58d]
                            flex
                            items-center
                            justify-center
                            mb-6
                          "
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-6 h-6"
                          >
                            <path
                              d="m5 12 4 4L19 6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.3em]
                            text-[#9b7b54]
                            mb-3
                          "
                        >
                          Demande envoyée
                        </p>

                        <h3
                          className="
                            font-display
                            text-2xl
                            tracking-tight
                            mb-4
                          "
                        >
                          Merci pour votre message.
                        </h3>

                        <p
                          className="
                            max-w-xs
                            text-sm
                            leading-relaxed
                            text-[#625f59]
                          "
                        >
                          Votre demande a bien été
                          prise en compte. Nous vous
                          contacterons prochainement.
                        </p>

                        <button
                          type="button"
                          onClick={closeContactPanel}
                          className="
                            mt-8
                            rounded-full
                            border
                            border-[#1c1c1a]/20
                            px-6
                            py-3
                            text-[10px]
                            uppercase
                            tracking-[0.2em]
                            hover:bg-[#1c1c1a]
                            hover:text-white
                            transition-all
                          "
                        >
                          Fermer
                        </button>

                      </motion.div>

                    )}

                  </motion.div>

                )}

              </AnimatePresence>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
