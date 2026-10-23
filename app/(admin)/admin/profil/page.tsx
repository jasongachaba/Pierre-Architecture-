"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import {
  Activity,
  ArrowUpRight,
  AtSign,
  Award,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleUserRound,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { getSupabaseClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  professional_title: string | null;
  bio: string | null;
  birth_date: string | null;
  email: string | null;
  phone: string | null;
  phone_secondary: string | null;
  avatar_url: string | null;
  cv_url: string | null;
  website_url: string | null;
  years_experience: number | null;
  availability: string | null;
  specialties: string[];
  languages: string[];
  role: "admin" | "editor";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Address = {
  id: string;
  profile_id: string;
  address_line: string | null;
  address_line_2: string | null;
  neighborhood: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

type SocialDraft = {
  id?: string;
  platform: string;
  url: string;
  username: string;
  display_name: string;
  is_visible: boolean;
  display_order: number;
};

type Tab =
  | "identity"
  | "contact"
  | "expertise"
  | "address"
  | "social";

type Toast = {
  type: "success" | "error";
  message: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const BUCKET_PROFILE = "profile-images";
const BUCKET_CV = "profile-cv";

const SOCIAL_PLATFORMS = [
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Globe2,
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: Globe2,
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Globe2,
  },
  {
    value: "x",
    label: "X / Twitter",
    icon: AtSign,
  },
  {
    value: "website",
    label: "Site web",
    icon: Globe2,
  },
  {
    value: "behance",
    label: "Behance",
    icon: Globe2,
  },
  {
    value: "dribbble",
    label: "Dribbble",
    icon: Globe2,
  },
  {
    value: "other",
    label: "Autre",
    icon: ExternalLink,
  },
];

/* ============================================================
   HELPERS
============================================================ */

/**
 * Nettoie une valeur quelle que soit sa nature.
 *
 * Avant :
 * value?.trim()
 *
 * Problème :
 * si value = 8, alors 8.trim() provoque :
 * TypeError: value?.trim is not a function
 */
function clean(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
}

/**
 * Nettoyage spécifique aux nombres.
 */
function cleanNumber(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(
  value: string | null | undefined,
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} o`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

function normalizeUrl(value: unknown) {
  const trimmed = clean(value);

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function extractStoragePath(
  publicUrl: string | null,
  bucket: string,
) {
  if (!publicUrl) {
    return null;
  }

  const marker = `/storage/v1/object/public/${bucket}/`;

  if (!publicUrl.includes(marker)) {
    return null;
  }

  return publicUrl.split(marker)[1] || null;
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#9b7b54]">
        <span className="h-px w-6 bg-[#9b7b54]" />
        {eyebrow}
      </div>

      <h2 className="font-serif text-[27px] font-medium tracking-[-0.025em] text-[#22211f]">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77736d]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
  rows = 5,
  required = false,
  disabled = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736d]">
        {label}

        {required && (
          <span className="ml-1 text-[#9b7b54]">
            *
          </span>
        )}
      </span>

      {textarea ? (
        <textarea
          value={value}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full resize-y border border-[#dfdcd5] bg-white px-4 py-3 text-sm leading-6 text-[#292825] outline-none transition placeholder:text-[#b3afa8] focus:border-[#9b7b54] focus:ring-1 focus:ring-[#9b7b54]/20 disabled:cursor-not-allowed disabled:bg-[#f5f4f1]"
        />
      ) : (
        <input
          value={value}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-12 w-full border border-[#dfdcd5] bg-white px-4 text-sm text-[#292825] outline-none transition placeholder:text-[#b3afa8] focus:border-[#9b7b54] focus:ring-1 focus:ring-[#9b7b54]/20 disabled:cursor-not-allowed disabled:bg-[#f5f4f1]"
        />
      )}

      {hint && (
        <span className="mt-1.5 block text-[11px] leading-5 text-[#a19d96]">
          {hint}
        </span>
      )}
    </label>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-[#e4e1db] bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center border border-[#e7e3dc] bg-[#faf9f6] text-[#9b7b54]">
          <Icon
            size={17}
            strokeWidth={1.5}
          />
        </div>

        <span className="text-[9px] uppercase tracking-[0.16em] text-[#aaa59d]">
          Profil
        </span>
      </div>

      <div className="mt-5">
        <div className="font-serif text-2xl text-[#242320]">
          {value}
        </div>

        <div className="mt-1 text-xs font-medium text-[#55514b]">
          {label}
        </div>

        <div className="mt-1 text-[11px] text-[#9b968e]">
          {detail}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-[#f3eee7] text-[#302d29]"
          : "text-[#77736d] hover:bg-[#faf9f6] hover:text-[#302d29]"
      }`}
    >
      <Icon
        size={16}
        strokeWidth={1.5}
        className={
          active
            ? "text-[#9b7b54]"
            : "text-[#aaa59d]"
        }
      />

      <span>{label}</span>

      {active && (
        <motion.span
          layoutId="profile-tab-indicator"
          className="absolute right-0 top-0 h-full w-0.5 bg-[#9b7b54]"
        />
      )}
    </button>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function ProfileAdminPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const avatarInputRef =
    useRef<HTMLInputElement | null>(null);

  const cvInputRef =
    useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [address, setAddress] =
    useState<Address | null>(null);

  const [socials, setSocials] =
    useState<SocialDraft[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);

  const [uploadingCv, setUploadingCv] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<Tab>("identity");

  const [toast, setToast] =
    useState<Toast | null>(null);

  const [specialtyInput, setSpecialtyInput] =
    useState("");

  const [languageInput, setLanguageInput] =
    useState("");

  const [newSocialOpen, setNewSocialOpen] =
    useState(false);

  const [newSocial, setNewSocial] =
    useState<SocialDraft>({
      platform: "linkedin",
      url: "",
      username: "",
      display_name: "",
      is_visible: true,
      display_order: 0,
    });

  /* ============================================================
     TOAST
  ============================================================ */

  const showToast = useCallback(
    (
      type: Toast["type"],
      message: string,
    ) => {
      setToast({
        type,
        message,
      });

      window.setTimeout(() => {
        setToast(null);
      }, 3500);
    },
    [],
  );

  /* ============================================================
     LOAD PROFILE
  ============================================================ */

  const loadProfile = useCallback(
    async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (
          profileError ||
          !profileData ||
          !profileData.is_active ||
          !["admin", "editor"].includes(
            profileData.role,
          )
        ) {
          router.replace("/login");
          return;
        }

        const [
          { data: addressData },
          { data: socialData },
        ] = await Promise.all([
          supabase
            .from("profile_addresses")
            .select("*")
            .eq("profile_id", user.id)
            .order("is_primary", {
              ascending: false,
            })
            .order("created_at", {
              ascending: true,
            })
            .limit(1)
            .maybeSingle(),

          supabase
            .from("profile_social_links")
            .select("*")
            .eq("profile_id", user.id)
            .order("display_order", {
              ascending: true,
            }),
        ]);

        setProfile({
          ...profileData,
          specialties: Array.isArray(
            profileData.specialties,
          )
            ? profileData.specialties
            : [],
          languages: Array.isArray(
            profileData.languages,
          )
            ? profileData.languages
            : [],
        });

        setAddress(addressData ?? null);

        setSocials(
          (socialData ?? []).map(
            (item: any) => ({
              id: item.id,
              platform:
                item.platform ?? "other",
              url: clean(item.url),
              username: clean(
                item.username,
              ),
              display_name: clean(
                item.display_name,
              ),
              is_visible:
                item.is_visible ?? true,
              display_order:
                cleanNumber(
                  item.display_order,
                ) ?? 0,
            }),
          ),
        );
      } catch (error) {
        console.error(
          "Erreur chargement profil:",
          error,
        );

        showToast(
          "error",
          "Impossible de charger les informations du profil.",
        );
      } finally {
        setLoading(false);
      }
    },
    [router, showToast, supabase],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const displayName = useMemo(() => {
    if (!profile) {
      return "Profil professionnel";
    }

    return (
      clean(profile.full_name) ||
      [
        clean(profile.first_name),
        clean(profile.last_name),
      ]
        .filter(Boolean)
        .join(" ") ||
      "Profil professionnel"
    );
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) {
      return "P";
    }

    const first = clean(
      profile.first_name,
    );

    const last = clean(
      profile.last_name,
    );

    if (first || last) {
      return `${first.charAt(0)}${last.charAt(
        0,
      )}`.toUpperCase();
    }

    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join("");
  }, [displayName, profile]);

  const profileCompletion = useMemo(() => {
    if (!profile) {
      return 0;
    }

    const checks = [
      !!clean(profile.first_name),
      !!clean(profile.last_name),
      !!clean(profile.professional_title),
      !!clean(profile.bio),
      !!clean(profile.email),
      !!clean(profile.phone),
      !!profile.avatar_url,
      !!profile.cv_url,
      !!clean(profile.website_url),
      profile.years_experience !== null &&
        profile.years_experience !== undefined,
      profile.specialties.length > 0,
      profile.languages.length > 0,
      !!clean(address?.city),
      socials.filter(
        (item) =>
          item.is_visible &&
          !!clean(item.url),
      ).length > 0,
    ];

    return Math.round(
      (checks.filter(Boolean).length /
        checks.length) *
        100,
    );
  }, [address, profile, socials]);

  const visibleSocials = socials.filter(
    (item) =>
      item.is_visible &&
      !!clean(item.url),
  );

  /* ============================================================
     PROFILE UPDATE
  ============================================================ */

  function updateProfile<
    K extends keyof Profile,
  >(
    key: K,
    value: Profile[K],
  ) {
    setProfile((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  }

  /* ============================================================
     ADDRESS UPDATE
  ============================================================ */

  function updateAddress<
    K extends keyof Address,
  >(
    key: K,
    value: Address[K],
  ) {
    setAddress((current) => {
      if (!current) {
        return {
          id: "",
          profile_id: profile?.id ?? "",
          address_line: null,
          address_line_2: null,
          neighborhood: null,
          city: null,
          province: null,
          country: "RDC",
          postal_code: null,
          latitude: null,
          longitude: null,
          is_primary: true,
          created_at: "",
          updated_at: "",
          [key]: value,
        } as Address;
      }

      return {
        ...current,
        [key]: value,
      };
    });
  }

  /* ============================================================
     SPECIALTIES
  ============================================================ */

  function addSpecialty() {
    const value = clean(
      specialtyInput,
    );

    if (!value || !profile) {
      return;
    }

    const exists =
      profile.specialties.some(
        (item) =>
          clean(item).toLowerCase() ===
          value.toLowerCase(),
      );

    if (exists) {
      setSpecialtyInput("");
      return;
    }

    updateProfile(
      "specialties",
      [
        ...profile.specialties,
        value,
      ],
    );

    setSpecialtyInput("");
  }

  function removeSpecialty(
    index: number,
  ) {
    if (!profile) {
      return;
    }

    updateProfile(
      "specialties",
      profile.specialties.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  }

  /* ============================================================
     LANGUAGES
  ============================================================ */

  function addLanguage() {
    const value = clean(
      languageInput,
    );

    if (!value || !profile) {
      return;
    }

    const exists =
      profile.languages.some(
        (item) =>
          clean(item).toLowerCase() ===
          value.toLowerCase(),
      );

    if (exists) {
      setLanguageInput("");
      return;
    }

    updateProfile(
      "languages",
      [
        ...profile.languages,
        value,
      ],
    );

    setLanguageInput("");
  }

  function removeLanguage(
    index: number,
  ) {
    if (!profile) {
      return;
    }

    updateProfile(
      "languages",
      profile.languages.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  }

  /* ============================================================
     SAVE PROFILE
  ============================================================ */

  async function saveProfile(
    event?: FormEvent,
  ) {
    event?.preventDefault();

    if (!profile) {
      return;
    }

    try {
      setSaving(true);

      const now =
        new Date().toISOString();

      const profilePayload = {
        first_name: clean(
          profile.first_name,
        ),

        last_name: clean(
          profile.last_name,
        ),

        full_name: clean(
          profile.full_name,
        ),

        professional_title: clean(
          profile.professional_title,
        ),

        bio: clean(profile.bio),

        birth_date:
          clean(profile.birth_date) ||
          null,

        email: clean(profile.email),

        phone: clean(profile.phone),

        phone_secondary: clean(
          profile.phone_secondary,
        ),

        avatar_url:
          profile.avatar_url || null,

        cv_url:
          profile.cv_url || null,

        website_url:
          clean(profile.website_url) ||
          null,

        years_experience:
          cleanNumber(
            profile.years_experience,
          ),

        availability:
          clean(profile.availability) ||
          null,

        specialties:
          Array.isArray(
            profile.specialties,
          )
            ? profile.specialties
                .map((item) =>
                  clean(item),
                )
                .filter(Boolean)
            : [],

        languages:
          Array.isArray(
            profile.languages,
          )
            ? profile.languages
                .map((item) =>
                  clean(item),
                )
                .filter(Boolean)
            : [],

        updated_at: now,
      };

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", profile.id);

      if (profileError) {
        throw profileError;
      }

      /* ========================================================
         ADDRESS
      ======================================================== */

      if (address) {
        const addressPayload = {
          profile_id: profile.id,

          address_line:
            clean(
              address.address_line,
            ) || null,

          address_line_2:
            clean(
              address.address_line_2,
            ) || null,

          neighborhood:
            clean(
              address.neighborhood,
            ) || null,

          city:
            clean(address.city) ||
            null,

          province:
            clean(
              address.province,
            ) || null,

          country:
            clean(address.country) ||
            "RDC",

          postal_code:
            clean(
              address.postal_code,
            ) || null,

          latitude: cleanNumber(
            address.latitude,
          ),

          longitude: cleanNumber(
            address.longitude,
          ),

          is_primary: true,

          updated_at: now,
        };

        if (address.id) {
          const {
            error: addressError,
          } = await supabase
            .from("profile_addresses")
            .update(addressPayload)
            .eq("id", address.id)
            .eq(
              "profile_id",
              profile.id,
            );

          if (addressError) {
            throw addressError;
          }
        } else {
          const {
            data: createdAddress,
            error:
              createAddressError,
          } = await supabase
            .from("profile_addresses")
            .insert(
              addressPayload,
            )
            .select("*")
            .single();

          if (createAddressError) {
            throw createAddressError;
          }

          setAddress(
            createdAddress,
          );
        }
      }

      /* ========================================================
         ACTIVITY LOG
      ======================================================== */

      const {
        error: activityError,
      } = await supabase
        .from("activity_logs")
        .insert({
          user_id: profile.id,
          action: "profile_updated",
          entity_type: "profile",
          entity_id: profile.id,
          description:
            "Mise à jour du profil professionnel",
          metadata: {
            completion:
              profileCompletion,
          },
        });

      if (activityError) {
        console.warn(
          "Activity log non enregistré:",
          activityError,
        );
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              ...profilePayload,
              updated_at: now,
            }
          : current,
      );

      showToast(
        "success",
        "Profil enregistré avec succès.",
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde profil:",
        error,
      );

      showToast(
        "error",
        "Une erreur est survenue pendant l'enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ============================================================
     AVATAR UPLOAD
  ============================================================ */

  async function handleAvatarUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file || !profile) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast(
        "error",
        "Veuillez sélectionner une image valide.",
      );

      return;
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      showToast(
        "error",
        "La photo ne doit pas dépasser 8 Mo.",
      );

      return;
    }

    try {
      setUploadingAvatar(true);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const path =
        `profiles/${profile.id}/avatar-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(BUCKET_PROFILE)
        .upload(
          path,
          file,
          {
            cacheControl:
              "3600",
            upsert: false,
            contentType:
              file.type,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: {
          publicUrl,
        },
      } = supabase.storage
        .from(BUCKET_PROFILE)
        .getPublicUrl(path);

      const oldAvatar =
        profile.avatar_url;

      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          profile.id,
        );

      if (updateError) {
        throw updateError;
      }

      /* ========================================================
         REMOVE OLD AVATAR
      ======================================================== */

      const oldPath =
        extractStoragePath(
          oldAvatar,
          BUCKET_PROFILE,
        );

      if (oldPath) {
        try {
          await supabase.storage
            .from(
              BUCKET_PROFILE,
            )
            .remove([oldPath]);
        } catch (storageError) {
          console.warn(
            "Ancienne photo non supprimée:",
            storageError,
          );
        }
      }

      const now =
        new Date().toISOString();

      setProfile((current) =>
        current
          ? {
              ...current,
              avatar_url:
                publicUrl,
              updated_at: now,
            }
          : current,
      );

      await supabase
        .from("activity_logs")
        .insert({
          user_id: profile.id,
          action:
            "profile_avatar_updated",
          entity_type:
            "profile",
          entity_id:
            profile.id,
          description:
            "Modification de la photo de profil",
        });

      showToast(
        "success",
        "Photo de profil mise à jour.",
      );
    } catch (error) {
      console.error(
        "Erreur avatar:",
        error,
      );

      showToast(
        "error",
        "Impossible de mettre à jour la photo.",
      );
    } finally {
      setUploadingAvatar(false);

      if (
        avatarInputRef.current
      ) {
        avatarInputRef.current.value =
          "";
      }
    }
  }

  /* ============================================================
     CV UPLOAD
  ============================================================ */

  async function handleCvUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file || !profile) {
      return;
    }

    const fileName =
      file.name.toLowerCase();

    const allowed =
      file.type ===
        "application/pdf" ||
      file.type.includes("word") ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx");

    if (!allowed) {
      showToast(
        "error",
        "Le CV doit être au format PDF, DOC ou DOCX.",
      );

      return;
    }

    if (
      file.size >
      15 * 1024 * 1024
    ) {
      showToast(
        "error",
        "Le CV ne doit pas dépasser 15 Mo.",
      );

      return;
    }

    try {
      setUploadingCv(true);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "pdf";

      const path =
        `profiles/${profile.id}/cv-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(BUCKET_CV)
        .upload(
          path,
          file,
          {
            cacheControl:
              "3600",
            upsert: false,
            contentType:
              file.type ||
              "application/octet-stream",
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: {
          publicUrl,
        },
      } = supabase.storage
        .from(BUCKET_CV)
        .getPublicUrl(path);

      const oldCv =
        profile.cv_url;

      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          cv_url: publicUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          profile.id,
        );

      if (updateError) {
        throw updateError;
      }

      /* ========================================================
         REMOVE OLD CV
      ======================================================== */

      const oldPath =
        extractStoragePath(
          oldCv,
          BUCKET_CV,
        );

      if (oldPath) {
        try {
          await supabase.storage
            .from(BUCKET_CV)
            .remove([
              oldPath,
            ]);
        } catch (storageError) {
          console.warn(
            "Ancien CV non supprimé:",
            storageError,
          );
        }
      }

      const now =
        new Date().toISOString();

      setProfile((current) =>
        current
          ? {
              ...current,
              cv_url: publicUrl,
              updated_at: now,
            }
          : current,
      );

      await supabase
        .from("activity_logs")
        .insert({
          user_id: profile.id,
          action:
            "profile_cv_updated",
          entity_type:
            "profile",
          entity_id:
            profile.id,
          description:
            "Modification du CV public",
          metadata: {
            file_name:
              file.name,
            file_size:
              file.size,
          },
        });

      showToast(
        "success",
        `CV mis à jour — ${formatFileSize(
          file.size,
        )}.`,
      );
    } catch (error) {
      console.error(
        "Erreur CV:",
        error,
      );

      showToast(
        "error",
        "Impossible de mettre à jour le CV.",
      );
    } finally {
      setUploadingCv(false);

      if (
        cvInputRef.current
      ) {
        cvInputRef.current.value =
          "";
      }
    }
  }

  /* ============================================================
     ADD SOCIAL
  ============================================================ */

  async function addSocial() {
    if (!profile) {
      return;
    }

    const url =
      normalizeUrl(
        newSocial.url,
      );

    if (!url) {
      showToast(
        "error",
        "Veuillez renseigner l'URL du réseau.",
      );

      return;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          "profile_social_links",
        )
        .insert({
          profile_id:
            profile.id,

          platform:
            newSocial.platform,

          url,

          username:
            clean(
              newSocial.username,
            ) || null,

          display_name:
            clean(
              newSocial.display_name,
            ) || null,

          is_visible:
            newSocial.is_visible,

          display_order:
            socials.length,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      setSocials((current) => [
        ...current,
        {
          id: data.id,
          platform:
            data.platform ??
            newSocial.platform,
          url: clean(data.url),
          username: clean(
            data.username,
          ),
          display_name: clean(
            data.display_name,
          ),
          is_visible:
            data.is_visible ??
            true,
          display_order:
            cleanNumber(
              data.display_order,
            ) ??
            current.length,
        },
      ]);

      setNewSocial({
        platform: "linkedin",
        url: "",
        username: "",
        display_name: "",
        is_visible: true,
        display_order:
          socials.length + 1,
      });

      setNewSocialOpen(false);

      showToast(
        "success",
        "Réseau social ajouté.",
      );
    } catch (error) {
      console.error(
        "Erreur ajout social:",
        error,
      );

      showToast(
        "error",
        "Impossible d'ajouter ce réseau social.",
      );
    }
  }

  /* ============================================================
     UPDATE SOCIAL
  ============================================================ */

  async function updateSocial(
    item: SocialDraft,
    patch: Partial<SocialDraft>,
  ) {
    if (
      !item.id ||
      !profile
    ) {
      return;
    }

    const next = {
      ...item,
      ...patch,
    };

    const url =
      normalizeUrl(next.url);

    try {
      const {
        error,
      } = await supabase
        .from(
          "profile_social_links",
        )
        .update({
          platform:
            next.platform,

          url,

          username:
            clean(
              next.username,
            ) || null,

          display_name:
            clean(
              next.display_name,
            ) || null,

          is_visible:
            next.is_visible,

          display_order:
            cleanNumber(
              next.display_order,
            ) ?? 0,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          item.id,
        )
        .eq(
          "profile_id",
          profile.id,
        );

      if (error) {
        throw error;
      }

      setSocials((current) =>
        current.map((social) =>
          social.id === item.id
            ? {
                ...next,
                url,
              }
            : social,
        ),
      );
    } catch (error) {
      console.error(
        "Erreur modification social:",
        error,
      );

      showToast(
        "error",
        "Impossible de modifier ce réseau.",
      );
    }
  }

  /* ============================================================
     DELETE SOCIAL
  ============================================================ */

  async function deleteSocial(
    id?: string,
  ) {
    if (!id || !profile) {
      return;
    }

    try {
      const {
        error,
      } = await supabase
        .from(
          "profile_social_links",
        )
        .delete()
        .eq(
          "id",
          id,
        )
        .eq(
          "profile_id",
          profile.id,
        );

      if (error) {
        throw error;
      }

      setSocials((current) =>
        current
          .filter(
            (item) =>
              item.id !== id,
          )
          .map(
            (item, index) => ({
              ...item,
              display_order:
                index,
            }),
          ),
      );

      showToast(
        "success",
        "Réseau social supprimé.",
      );
    } catch (error) {
      console.error(
        "Erreur suppression social:",
        error,
      );

      showToast(
        "error",
        "Impossible de supprimer ce réseau.",
      );
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f4f1]">
        <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-6">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center border border-[#dedbd4] bg-white">
              <Loader2
                size={19}
                className="animate-spin text-[#9b7b54]"
              />
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#8d8982]">
              Chargement du profil
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#f5f4f1] text-[#282622]">
      {/* ========================================================
          TOAST
      ======================================================== */}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -15,
            }}
            className={`fixed right-6 top-6 z-[100] flex max-w-sm items-center gap-3 border bg-white px-4 py-3 shadow-xl ${
              toast.type ===
              "success"
                ? "border-[#d8dfd5]"
                : "border-[#e6d3cf]"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                toast.type ===
                "success"
                  ? "bg-[#edf4ed] text-[#537354]"
                  : "bg-[#f8ece9] text-[#a65d50]"
              }`}
            >
              {toast.type ===
              "success" ? (
                <Check size={15} />
              ) : (
                <X size={15} />
              )}
            </div>

            <span className="text-sm text-[#4b4843]">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="border-b border-[#dedbd4] bg-[#f8f7f4]">
        <div className="mx-auto max-w-[1500px] px-6 py-5 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#98938b]">
                <Link
                  href="/admin"
                  className="transition hover:text-[#9b7b54]"
                >
                  Administration
                </Link>

                <ChevronRight size={11} />

                <span className="text-[#9b7b54]">
                  Profil
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden h-12 w-12 items-center justify-center border border-[#dfdbd3] bg-white text-[#9b7b54] sm:flex">
                  <CircleUserRound
                    size={21}
                    strokeWidth={1.4}
                  />
                </div>

                <div>
                  <h1 className="font-serif text-[34px] font-medium tracking-[-0.035em] text-[#25231f]">
                    Profil professionnel
                  </h1>

                  <p className="mt-1 text-sm text-[#858078]">
                    Identité, expertise,
                    coordonnées et
                    présence publique
                    du studio.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {profile.cv_url && (
                <a
                  href={
                    profile.cv_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 border border-[#dcd8d1] bg-white px-4 text-xs font-medium uppercase tracking-[0.12em] text-[#5e5952] transition hover:border-[#9b7b54] hover:text-[#9b7b54]"
                >
                  <Download size={15} />
                  CV public
                </a>
              )}

              <button
                type="button"
                onClick={() =>
                  void saveProfile()
                }
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 bg-[#2c2a26] px-5 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[#3a3732] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={15} />
                )}

                {saving
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <div className="mx-auto max-w-[1500px] px-6 py-7 lg:px-10">
        {/* ======================================================
            STATS
        ====================================================== */}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Complétion du profil"
            value={`${profileCompletion}%`}
            detail="Informations renseignées"
          />

          <StatCard
            icon={
              BriefcaseBusiness
            }
            label="Expérience"
            value={
              profile.years_experience !==
              null
                ? `${profile.years_experience} ans`
                : "—"
            }
            detail="Expérience professionnelle"
          />

          <StatCard
            icon={Globe2}
            label="Présence publique"
            value={`${visibleSocials.length}`}
            detail="Réseaux visibles"
          />

          <StatCard
            icon={FileText}
            label="CV"
            value={
              profile.cv_url
                ? "Actif"
                : "Absent"
            }
            detail={
              profile.cv_url
                ? "Document public disponible"
                : "Ajoutez votre CV"
            }
          />
        </section>

        {/* ======================================================
            MAIN GRID
        ====================================================== */}

        <div className="mt-7 grid gap-7 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
          {/* ====================================================
              LEFT NAVIGATION
          ==================================================== */}

          <aside className="h-fit border border-[#e2dfd8] bg-white">
            <div className="border-b border-[#e8e5df] px-5 py-5">
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9b7b54]">
                Configuration
              </div>

              <div className="mt-1 font-serif text-lg text-[#302e2a]">
                Votre profil
              </div>
            </div>

            <nav className="p-2">
              <TabButton
                active={
                  activeTab ===
                  "identity"
                }
                icon={UserRound}
                label="Identité"
                onClick={() =>
                  setActiveTab(
                    "identity",
                  )
                }
              />

              <TabButton
                active={
                  activeTab ===
                  "contact"
                }
                icon={Phone}
                label="Coordonnées"
                onClick={() =>
                  setActiveTab(
                    "contact",
                  )
                }
              />

              <TabButton
                active={
                  activeTab ===
                  "expertise"
                }
                icon={Award}
                label="Expertise"
                onClick={() =>
                  setActiveTab(
                    "expertise",
                  )
                }
              />

              <TabButton
                active={
                  activeTab ===
                  "address"
                }
                icon={MapPin}
                label="Adresse"
                onClick={() =>
                  setActiveTab(
                    "address",
                  )
                }
              />

              <TabButton
                active={
                  activeTab ===
                  "social"
                }
                icon={Globe2}
                label="Réseaux sociaux"
                onClick={() =>
                  setActiveTab(
                    "social",
                  )
                }
              />
            </nav>

            <div className="border-t border-[#e8e5df] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#98938b]">
                  Complétion
                </span>

                <span className="font-serif text-sm text-[#9b7b54]">
                  {profileCompletion}%
                </span>
              </div>

              <div className="mt-3 h-1 bg-[#eeeae4]">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${profileCompletion}%`,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  className="h-full bg-[#9b7b54]"
                />
              </div>
            </div>
          </aside>

          {/* ====================================================
              CENTER
          ==================================================== */}

          <form
            onSubmit={saveProfile}
            className="min-w-0"
          >
            <AnimatePresence mode="wait">
              {/* =================================================
                  IDENTITY
              ================================================= */}

              {activeTab ===
                "identity" && (
                <motion.div
                  key="identity"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <div className="border border-[#e2dfd8] bg-white p-6 lg:p-8">
                    <SectionTitle
                      eyebrow="01 — Identité"
                      title="Votre présence professionnelle"
                      description="Ces informations constituent l'identité principale affichée sur le site et dans les communications du studio."
                    />

                    <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)]">
                      {/* AVATAR */}

                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736d]">
                          Portrait
                        </div>

                        <div className="mt-3">
                          <div className="relative aspect-square w-full max-w-[180px] overflow-hidden border border-[#ddd9d2] bg-[#f1efeb]">
                            {profile.avatar_url ? (
                              <Image
                                src={
                                  profile.avatar_url
                                }
                                alt={
                                  displayName
                                }
                                fill
                                sizes="180px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#aaa49b]">
                                <UserRound
                                  size={46}
                                  strokeWidth={
                                    1
                                  }
                                />
                              </div>
                            )}

                            {uploadingAvatar && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Loader2
                                  size={24}
                                  className="animate-spin text-white"
                                />
                              </div>
                            )}
                          </div>

                          <input
                            ref={
                              avatarInputRef
                            }
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={
                              handleAvatarUpload
                            }
                          />

                          <button
                            type="button"
                            disabled={
                              uploadingAvatar
                            }
                            onClick={() =>
                              avatarInputRef.current?.click()
                            }
                            className="mt-3 inline-flex h-10 items-center gap-2 border border-[#dcd8d1] bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#5e5952] transition hover:border-[#9b7b54] hover:text-[#9b7b54] disabled:opacity-60"
                          >
                            {uploadingAvatar ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <ImagePlus
                                size={14}
                              />
                            )}

                            Changer
                          </button>

                          <p className="mt-2 max-w-[180px] text-[10px] leading-4 text-[#aaa59d]">
                            JPG, PNG ou
                            WEBP. 8 Mo
                            maximum.
                          </p>
                        </div>
                      </div>

                      {/* FIELDS */}

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          label="Prénom"
                          value={clean(
                            profile.first_name,
                          )}
                          required
                          onChange={(
                            value,
                          ) =>
                            updateProfile(
                              "first_name",
                              value,
                            )
                          }
                          placeholder="Prénom"
                        />

                        <Field
                          label="Nom"
                          value={clean(
                            profile.last_name,
                          )}
                          required
                          onChange={(
                            value,
                          ) =>
                            updateProfile(
                              "last_name",
                              value,
                            )
                          }
                          placeholder="Nom"
                        />

                        <div className="sm:col-span-2">
                          <Field
                            label="Nom affiché"
                            value={clean(
                              profile.full_name,
                            )}
                            onChange={(
                              value,
                            ) =>
                              updateProfile(
                                "full_name",
                                value,
                              )
                            }
                            placeholder="Nom complet affiché"
                            hint="Le nom utilisé comme signature publique."
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <Field
                            label="Titre professionnel"
                            value={clean(
                              profile.professional_title,
                            )}
                            required
                            onChange={(
                              value,
                            ) =>
                              updateProfile(
                                "professional_title",
                                value,
                              )
                            }
                            placeholder="Architecte · Designer · Directeur de studio..."
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <Field
                            label="Biographie"
                            value={clean(
                              profile.bio,
                            )}
                            textarea
                            rows={7}
                            onChange={(
                              value,
                            ) =>
                              updateProfile(
                                "bio",
                                value,
                              )
                            }
                            placeholder="Présentez votre parcours, votre approche de l'architecture et votre vision..."
                          />
                        </div>

                        <Field
                          label="Date de naissance"
                          type="date"
                          value={
                            clean(
                              profile.birth_date,
                            )
                          }
                          onChange={(
                            value,
                          ) =>
                            updateProfile(
                              "birth_date",
                              value ||
                                null,
                            )
                          }
                        />

                        <Field
                          label="Années d'expérience"
                          type="number"
                          value={
                            profile.years_experience !==
                            null
                              ? String(
                                  profile.years_experience,
                                )
                              : ""
                          }
                          onChange={(
                            value,
                          ) =>
                            updateProfile(
                              "years_experience",
                              cleanNumber(
                                value,
                              ),
                            )
                          }
                          placeholder="Ex. 8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CV */}

                  <div className="mt-6 border border-[#e2dfd8] bg-white p-6 lg:p-8">
                    <SectionTitle
                      eyebrow="Document public"
                      title="Curriculum vitae"
                      description="Le CV est hébergé publiquement afin de pouvoir être consulté par les visiteurs du site."
                    />

                    <input
                      ref={
                        cvInputRef
                      }
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      className="hidden"
                      onChange={
                        handleCvUpload
                      }
                    />

                    <div className="flex flex-col gap-5 border border-[#e6e2db] bg-[#faf9f6] p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#dfd9d0] bg-white text-[#9b7b54]">
                          <FileText
                            size={20}
                            strokeWidth={
                              1.4
                            }
                          />
                        </div>

                        <div>
                          <div className="text-sm font-medium text-[#393631]">
                            {profile.cv_url
                              ? "CV professionnel"
                              : "Aucun CV publié"}
                          </div>

                          <div className="mt-1 text-[11px] text-[#9a958d]">
                            {profile.cv_url
                              ? "Document public disponible"
                              : "Ajoutez votre document professionnel"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {profile.cv_url && (
                          <a
                            href={
                              profile.cv_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 border border-[#dcd8d1] bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d5953] transition hover:border-[#9b7b54] hover:text-[#9b7b54]"
                          >
                            <ExternalLink
                              size={13}
                            />
                            Consulter
                          </a>
                        )}

                        <button
                          type="button"
                          disabled={
                            uploadingCv
                          }
                          onClick={() =>
                            cvInputRef.current?.click()
                          }
                          className="inline-flex h-10 items-center gap-2 bg-[#2d2b27] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#3c3934] disabled:opacity-60"
                        >
                          {uploadingCv ? (
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                          ) : (
                            <Upload
                              size={13}
                            />
                          )}

                          {profile.cv_url
                            ? "Remplacer"
                            : "Importer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  CONTACT
              ================================================= */}

              {activeTab ===
                "contact" && (
                <motion.div
                  key="contact"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <div className="border border-[#e2dfd8] bg-white p-6 lg:p-8">
                    <SectionTitle
                      eyebrow="02 — Coordonnées"
                      title="Comment vous contacter"
                      description="Ces informations permettent aux visiteurs et clients de vous joindre directement."
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      <Field
                        label="Adresse e-mail"
                        type="email"
                        value={clean(
                          profile.email,
                        )}
                        required
                        onChange={(
                          value,
                        ) =>
                          updateProfile(
                            "email",
                            value,
                          )
                        }
                        placeholder="contact@example.com"
                      />

                      <Field
                        label="Téléphone principal"
                        value={clean(
                          profile.phone,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateProfile(
                            "phone",
                            value,
                          )
                        }
                        placeholder="+243 ..."
                      />

                      <Field
                        label="Téléphone secondaire"
                        value={clean(
                          profile.phone_secondary,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateProfile(
                            "phone_secondary",
                            value,
                          )
                        }
                        placeholder="+243 ..."
                      />

                      <Field
                        label="Site web"
                        value={clean(
                          profile.website_url,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateProfile(
                            "website_url",
                            value,
                          )
                        }
                        placeholder="www.votresite.com"
                      />
                    </div>
                  </div>

                  <div className="mt-6 border border-[#e2dfd8] bg-white p-6 lg:p-8">
                    <SectionTitle
                      eyebrow="Disponibilité"
                      title="Votre disponibilité"
                      description="Indiquez simplement aux visiteurs dans quel contexte vous êtes actuellement disponible."
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      {[
                        "Disponible pour de nouveaux projets",
                        "Sur projets en cours",
                        "Sur rendez-vous uniquement",
                        "Indisponible actuellement",
                      ].map(
                        (
                          option,
                        ) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() =>
                              updateProfile(
                                "availability",
                                option,
                              )
                            }
                            className={`flex min-h-[64px] items-center justify-between border px-4 text-left transition ${
                              profile.availability ===
                              option
                                ? "border-[#9b7b54] bg-[#faf6f0]"
                                : "border-[#e2dfd8] bg-white hover:border-[#c9c3ba]"
                            }`}
                          >
                            <span className="text-sm text-[#514d47]">
                              {
                                option
                              }
                            </span>

                            {profile.availability ===
                              option && (
                              <span className="flex h-6 w-6 items-center justify-center bg-[#9b7b54] text-white">
                                <Check
                                  size={
                                    13
                                  }
                                />
                              </span>
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  EXPERTISE
              ================================================= */}

              {activeTab ===
                "expertise" && (
                <motion.div
                  key="expertise"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <div className="border border-[#e2dfd8] bg-white p-6 lg:p-8">
                    <SectionTitle
                      eyebrow="03 — Expertise"
                      title="Compétences et domaines"
                      description="Structurez votre expertise pour permettre au site de présenter clairement votre positionnement professionnel."
                    />

                    {/* SPECIALTIES */}

                    <div>
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736d]">
                        Spécialités
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={
                            specialtyInput
                          }
                          onChange={(
                            event,
                          ) =>
                            setSpecialtyInput(
                              event
                                .target
                                .value,
                            )
                          }
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              event.preventDefault();
                              addSpecialty();
                            }
                          }}
                          placeholder="Architecture résidentielle..."
                          className="h-12 min-w-0 flex-1 border border-[#dfdcd5] bg-white px-4 text-sm outline-none placeholder:text-[#b3afa8] focus:border-[#9b7b54]"
                        />

                        <button
                          type="button"
                          onClick={
                            addSpecialty
                          }
                          className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#2d2b27] text-white transition hover:bg-[#3d3934]"
                        >
                          <Plus
                            size={17}
                          />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.specialties
                          .length ===
                          0 && (
                          <p className="text-xs text-[#aaa59d]">
                            Aucune
                            spécialité
                            ajoutée.
                          </p>
                        )}

                        {profile.specialties.map(
                          (
                            specialty,
                            index,
                          ) => (
                            <span
                              key={`${specialty}-${index}`}
                              className="inline-flex items-center gap-2 border border-[#ddd8d0] bg-[#faf9f6] px-3 py-2 text-xs text-[#55514b]"
                            >
                              {
                                specialty
                              }

                              <button
                                type="button"
                                onClick={() =>
                                  removeSpecialty(
                                    index,
                                  )
                                }
                                className="text-[#aaa39a] transition hover:text-[#9b7b54]"
                              >
                                <X
                                  size={
                                    12
                                  }
                                />
                              </button>
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    {/* LANGUAGES */}

                    <div className="mt-10 border-t border-[#ece9e3] pt-8">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736d]">
                        Langues
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={
                            languageInput
                          }
                          onChange={(
                            event,
                          ) =>
                            setLanguageInput(
                              event
                                .target
                                .value,
                            )
                          }
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              event.preventDefault();
                              addLanguage();
                            }
                          }}
                          placeholder="Français..."
                          className="h-12 min-w-0 flex-1 border border-[#dfdcd5] bg-white px-4 text-sm outline-none placeholder:text-[#b3afa8] focus:border-[#9b7b54]"
                        />

                        <button
                          type="button"
                          onClick={
                            addLanguage
                          }
                          className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#2d2b27] text-white transition hover:bg-[#3d3934]"
                        >
                          <Plus
                            size={17}
                          />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.languages
                          .length ===
                          0 && (
                          <p className="text-xs text-[#aaa59d]">
                            Aucune langue
                            ajoutée.
                          </p>
                        )}

                        {profile.languages.map(
                          (
                            language,
                            index,
                          ) => (
                            <span
                              key={`${language}-${index}`}
                              className="inline-flex items-center gap-2 border border-[#ddd8d0] bg-[#faf9f6] px-3 py-2 text-xs text-[#55514b]"
                            >
                              {
                                language
                              }

                              <button
                                type="button"
                                onClick={() =>
                                  removeLanguage(
                                    index,
                                  )
                                }
                                className="text-[#aaa39a] transition hover:text-[#9b7b54]"
                              >
                                <X
                                  size={
                                    12
                                  }
                                />
                              </button>
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  ADDRESS
              ================================================= */}

              {activeTab ===
                "address" && (
                <motion.div
                  key="address"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <div className="border border-[#e2dfd8] bg-white p-6 lg:p-8">
                    <SectionTitle
                      eyebrow="04 — Adresse"
                      title="Localisation professionnelle"
                      description="Cette adresse peut être utilisée sur la page contact et dans les informations publiques du studio."
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Field
                          label="Adresse"
                          value={clean(
                            address?.address_line,
                          )}
                          onChange={(
                            value,
                          ) =>
                            updateAddress(
                              "address_line",
                              value,
                            )
                          }
                          placeholder="Numéro, rue, avenue..."
                        />
                      </div>

                      <Field
                        label="Complément"
                        value={clean(
                          address?.address_line_2,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateAddress(
                            "address_line_2",
                            value,
                          )
                        }
                        placeholder="Immeuble, bureau..."
                      />

                      <Field
                        label="Quartier"
                        value={clean(
                          address?.neighborhood,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateAddress(
                            "neighborhood",
                            value,
                          )
                        }
                        placeholder="Quartier"
                      />

                      <Field
                        label="Ville"
                        value={clean(
                          address?.city,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateAddress(
                            "city",
                            value,
                          )
                        }
                        placeholder="Kinshasa"
                      />

                      <Field
                        label="Province"
                        value={clean(
                          address?.province,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateAddress(
                            "province",
                            value,
                          )
                        }
                        placeholder="Kinshasa"
                      />

                      <Field
                        label="Pays"
                        value={
                          clean(
                            address?.country,
                          ) ||
                          "RDC"
                        }
                        onChange={(
                          value,
                        ) =>
                          updateAddress(
                            "country",
                            value,
                          )
                        }
                        placeholder="RDC"
                      />

                      <Field
                        label="Code postal"
                        value={clean(
                          address?.postal_code,
                        )}
                        onChange={(
                          value,
                        ) =>
                          updateAddress(
                            "postal_code",
                            value,
                          )
                        }
                        placeholder="00000"
                      />
                    </div>

                    <div className="mt-8 border border-[#e5e1da] bg-[#faf9f6] p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#ddd8d0] bg-white text-[#9b7b54]">
                          <MapPin
                            size={17}
                            strokeWidth={
                              1.5
                            }
                          />
                        </div>

                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#55514b]">
                            Adresse
                            principale
                          </div>

                          <p className="mt-1 text-sm leading-6 text-[#89847c]">
                            L'adresse
                            marquée
                            comme
                            principale
                            est celle
                            qui sera
                            privilégiée
                            pour la
                            présentation
                            publique.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  SOCIAL
              ================================================= */}

              {activeTab ===
                "social" && (
                <motion.div
                  key="social"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <div className="border border-[#e2dfd8] bg-white p-6 lg:p-8">
                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <SectionTitle
                        eyebrow="05 — Réseaux"
                        title="Présence en ligne"
                        description="Gérez les plateformes professionnelles qui apparaissent sur votre site."
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setNewSocialOpen(
                            (
                              current,
                            ) =>
                              !current,
                          )
                        }
                        className="mb-7 inline-flex h-10 shrink-0 items-center gap-2 bg-[#2d2b27] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#3d3934]"
                      >
                        <Plus
                          size={14}
                        />
                        Ajouter
                      </button>
                    </div>

                    {/* ADD SOCIAL */}

                    <AnimatePresence>
                      {newSocialOpen && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="border border-[#ddd8d0] bg-[#faf9f6] p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                              <label>
                                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#77736d]">
                                  Plateforme
                                </span>

                                <select
                                  value={
                                    newSocial.platform
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setNewSocial(
                                      (
                                        current,
                                      ) => ({
                                        ...current,
                                        platform:
                                          event
                                            .target
                                            .value,
                                      }),
                                    )
                                  }
                                  className="h-11 w-full border border-[#ddd8d0] bg-white px-3 text-sm outline-none focus:border-[#9b7b54]"
                                >
                                  {SOCIAL_PLATFORMS.map(
                                    (
                                      platform,
                                    ) => (
                                      <option
                                        key={
                                          platform.value
                                        }
                                        value={
                                          platform.value
                                        }
                                      >
                                        {
                                          platform.label
                                        }
                                      </option>
                                    ),
                                  )}
                                </select>
                              </label>

                              <Field
                                label="URL"
                                value={
                                  newSocial.url
                                }
                                onChange={(
                                  value,
                                ) =>
                                  setNewSocial(
                                    (
                                      current,
                                    ) => ({
                                      ...current,
                                      url: value,
                                    }),
                                  )
                                }
                                placeholder="https://..."
                              />

                              <Field
                                label="Nom d'utilisateur"
                                value={
                                  newSocial.username
                                }
                                onChange={(
                                  value,
                                ) =>
                                  setNewSocial(
                                    (
                                      current,
                                    ) => ({
                                      ...current,
                                      username:
                                        value,
                                    }),
                                  )
                                }
                                placeholder="@utilisateur"
                              />

                              <Field
                                label="Nom affiché"
                                value={
                                  newSocial.display_name
                                }
                                onChange={(
                                  value,
                                ) =>
                                  setNewSocial(
                                    (
                                      current,
                                    ) => ({
                                      ...current,
                                      display_name:
                                        value,
                                    }),
                                  )
                                }
                                placeholder="Mon profil LinkedIn"
                              />
                            </div>

                            <div className="mt-5 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setNewSocialOpen(
                                    false,
                                  )
                                }
                                className="h-10 border border-[#ddd8d0] bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#77736d] transition hover:border-[#9b7b54]"
                              >
                                Annuler
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void addSocial()
                                }
                                className="h-10 bg-[#2d2b27] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#3d3934]"
                              >
                                Ajouter
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* SOCIAL LIST */}

                    <div className="space-y-3">
                      {socials.length ===
                      0 ? (
                        <div className="border border-dashed border-[#dcd8d1] px-6 py-12 text-center">
                          <Globe2
                            size={26}
                            strokeWidth={
                              1
                            }
                            className="mx-auto text-[#aaa59d]"
                          />

                          <p className="mt-3 text-sm text-[#77736d]">
                            Aucun réseau
                            social
                            configuré.
                          </p>

                          <p className="mt-1 text-xs text-[#aaa59d]">
                            Ajoutez vos
                            plateformes
                            professionnelles.
                          </p>
                        </div>
                      ) : (
                        socials.map(
                          (
                            social,
                          ) => {
                            const platform =
                              SOCIAL_PLATFORMS.find(
                                (
                                  item,
                                ) =>
                                  item.value ===
                                  social.platform,
                              );

                            const Icon =
                              platform?.icon ??
                              Globe2;

                            return (
                              <motion.div
                                layout
                                key={
                                  social.id
                                }
                                className="border border-[#e2dfd8] bg-white p-4"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                  <div className="flex items-center gap-3 lg:w-[180px]">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#e0dbd3] bg-[#faf9f6] text-[#9b7b54]">
                                      <Icon
                                        size={
                                          17
                                        }
                                        strokeWidth={
                                          1.5
                                        }
                                      />
                                    </div>

                                    <div>
                                      <div className="text-sm font-medium text-[#45413b]">
                                        {platform?.label ??
                                          social.platform}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void updateSocial(
                                            social,
                                            {
                                              is_visible:
                                                !social.is_visible,
                                            },
                                          )
                                        }
                                        className={`mt-0.5 text-[9px] uppercase tracking-[0.13em] ${
                                          social.is_visible
                                            ? "text-[#71806e]"
                                            : "text-[#aaa59d]"
                                        }`}
                                      >
                                        {social.is_visible
                                          ? "Visible"
                                          : "Masqué"}
                                      </button>
                                    </div>
                                  </div>

                                  <input
                                    value={
                                      social.url
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      setSocials(
                                        (
                                          current,
                                        ) =>
                                          current.map(
                                            (
                                              item,
                                            ) =>
                                              item.id ===
                                              social.id
                                                ? {
                                                    ...item,
                                                    url: event
                                                      .target
                                                      .value,
                                                  }
                                                : item,
                                          ),
                                      )
                                    }
                                    onBlur={() =>
                                      void updateSocial(
                                        social,
                                        {
                                          url: social.url,
                                        },
                                      )
                                    }
                                    placeholder="URL du profil"
                                    className="h-11 min-w-0 flex-1 border border-[#e0ddd7] bg-[#faf9f6] px-3 text-sm text-[#4e4a44] outline-none focus:border-[#9b7b54]"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void deleteSocial(
                                        social.id,
                                      )
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#e0d9d4] text-[#9b7b54] transition hover:bg-[#f8efec] hover:text-[#a95d4f]"
                                    title="Supprimer"
                                    aria-label="Supprimer le réseau"
                                  >
                                    <Trash2
                                      size={
                                        15
                                      }
                                      strokeWidth={
                                        1.5
                                      }
                                    />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          },
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MOBILE SAVE */}

            <div className="mt-6 flex justify-end xl:hidden">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center gap-2 bg-[#2d2b27] px-6 text-xs font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-[#3d3934] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={15} />
                )}

                Enregistrer les
                modifications
              </button>
            </div>
          </form>

          {/* ====================================================
              RIGHT SIDEBAR
          ==================================================== */}

          <aside className="space-y-5">
            {/* PUBLIC PREVIEW */}

            <div className="border border-[#e2dfd8] bg-white">
              <div className="border-b border-[#e8e5df] px-5 py-4">
                <div className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#9b7b54]">
                  Aperçu public
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-[#ded9d1] bg-[#f1efeb]">
                    {profile.avatar_url ? (
                      <Image
                        src={
                          profile.avatar_url
                        }
                        alt={
                          displayName
                        }
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#aaa59d]">
                        <UserRound
                          size={22}
                          strokeWidth={
                            1
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate font-serif text-lg text-[#302e2a]">
                      {
                        displayName
                      }
                    </div>

                    <div className="mt-1 truncate text-[11px] text-[#9b7b54]">
                      {clean(
                        profile.professional_title,
                      ) ||
                        "Titre professionnel"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-[#ece9e3] pt-4">
                  <p className="line-clamp-4 text-xs leading-5 text-[#77736d]">
                    {clean(
                      profile.bio,
                    ) ||
                      "Votre biographie professionnelle apparaîtra ici."}
                  </p>
                </div>

                {clean(
                  address?.city,
                ) && (
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-[#858078]">
                    <MapPin
                      size={13}
                      className="text-[#9b7b54]"
                    />

                    {
                      address?.city
                    }

                    {clean(
                      address?.province,
                    )
                      ? `, ${clean(
                          address?.province,
                        )}`
                      : ""}
                  </div>
                )}

                {profile.cv_url && (
                  <a
                    href={
                      profile.cv_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-between border border-[#ded9d1] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#5e5952] transition hover:border-[#9b7b54] hover:text-[#9b7b54]"
                  >
                    Consulter le CV

                    <ArrowUpRight
                      size={13}
                    />
                  </a>
                )}
              </div>
            </div>

            {/* PROFILE STATUS */}

            <div className="border border-[#e2dfd8] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-[#f2f5ef] text-[#65765e]">
                  <ShieldCheck
                    size={17}
                    strokeWidth={
                      1.5
                    }
                  />
                </div>

                <div>
                  <div className="text-sm font-medium text-[#45413b]">
                    {profile.is_active
                      ? "Compte actif"
                      : "Compte inactif"}
                  </div>

                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#8d8981]">
                    Accès{" "}
                    {
                      profile.role
                    }
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="border border-[#e7e3dc] bg-[#faf9f6] p-3">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-[#a09b93]">
                    Créé
                  </div>

                  <div className="mt-1 text-[11px] text-[#55514b]">
                    {formatDate(
                      profile.created_at,
                    )}
                  </div>
                </div>

                <div className="border border-[#e7e3dc] bg-[#faf9f6] p-3">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-[#a09b93]">
                    Modifié
                  </div>

                  <div className="mt-1 text-[11px] text-[#55514b]">
                    {formatDate(
                      profile.updated_at,
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT SNAPSHOT */}

            <div className="border border-[#e2dfd8] bg-white p-5">
              <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#9b7b54]">
                Coordonnées
              </div>

              <div className="space-y-3">
                {clean(
                  profile.email,
                ) && (
                  <div className="flex items-start gap-3">
                    <Mail
                      size={14}
                      className="mt-0.5 shrink-0 text-[#9b7b54]"
                    />

                    <span className="break-all text-xs text-[#77736d]">
                      {
                        profile.email
                      }
                    </span>
                  </div>
                )}

                {clean(
                  profile.phone,
                ) && (
                  <div className="flex items-center gap-3">
                    <Phone
                      size={14}
                      className="shrink-0 text-[#9b7b54]"
                    />

                    <span className="text-xs text-[#77736d]">
                      {
                        profile.phone
                      }
                    </span>
                  </div>
                )}

                {clean(
                  profile.website_url,
                ) && (
                  <a
                    href={normalizeUrl(
                      profile.website_url,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-xs text-[#77736d] transition hover:text-[#9b7b54]"
                  >
                    <Globe2
                      size={14}
                      className="shrink-0 text-[#9b7b54]"
                    />

                    <span className="truncate">
                      {
                        profile.website_url
                      }
                    </span>
                  </a>
                )}
              </div>
            </div>

            {/* SOCIAL PREVIEW */}

            {visibleSocials.length >
              0 && (
              <div className="border border-[#e2dfd8] bg-white p-5">
                <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#9b7b54]">
                  Réseaux visibles
                </div>

                <div className="space-y-2">
                  {visibleSocials.map(
                    (
                      social,
                    ) => {
                      const platform =
                        SOCIAL_PLATFORMS.find(
                          (
                            item,
                          ) =>
                            item.value ===
                            social.platform,
                        );

                      const Icon =
                        platform?.icon ??
                        Globe2;

                      return (
                        <a
                          key={
                            social.id
                          }
                          href={normalizeUrl(
                            social.url,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between border border-[#e9e5df] px-3 py-2.5 transition hover:border-[#cfc8bd]"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon
                              size={
                                14
                              }
                              strokeWidth={
                                1.5
                              }
                              className="text-[#9b7b54]"
                            />

                            <span className="text-xs text-[#66615a]">
                              {platform?.label ??
                                social.platform}
                            </span>
                          </span>

                          <ArrowUpRight
                            size={12}
                            className="text-[#aaa59d]"
                          />
                        </a>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* SAVE */}

            <div className="sticky top-6 hidden border border-[#ddd8d0] bg-[#2d2b27] p-5 text-white xl:block">
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c8aa84]">
                Modifications
              </div>

              <div className="mt-2 font-serif text-xl">
                Profil en cours
              </div>

              <p className="mt-2 text-xs leading-5 text-white/55">
                Pensez à enregistrer
                vos modifications
                avant de quitter
                cette page.
              </p>

              <button
                type="button"
                onClick={() =>
                  void saveProfile()
                }
                disabled={saving}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#2d2b27] transition hover:bg-[#f0ece5] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Save
                    size={14}
                  />
                )}

                {saving
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}