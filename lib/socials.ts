import type { SocialLink } from "./types";

export interface SocialPreset {
  key: string;
  label: string;
  iconUrl: string;
  color: string;
  urlHint?: string;
}

// White-silhouette logos via Simple Icons CDN (https://simpleicons.org)
const SI = (slug: string) => `https://cdn.simpleicons.org/${slug}/ffffff`;

export const SOCIAL_PRESETS: SocialPreset[] = [
  { key: "facebook",  label: "Facebook",    iconUrl: SI("facebook"),   color: "#1877F2", urlHint: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram",   iconUrl: SI("instagram"),  color: "#E4405F", urlHint: "https://instagram.com/yourhandle" },
  { key: "whatsapp",  label: "WhatsApp",    iconUrl: SI("whatsapp"),   color: "#25D366", urlHint: "https://wa.me/919XXXXXXXXX" },
  { key: "youtube",   label: "YouTube",     iconUrl: SI("youtube"),    color: "#FF0000", urlHint: "https://youtube.com/@yourchannel" },
  { key: "justdial",  label: "JustDial",    iconUrl: "",                color: "#FFBA00", urlHint: "https://www.justdial.com/your-listing" },
  { key: "magicpin",  label: "MagicPin",    iconUrl: "",                color: "#E91E63", urlHint: "https://magicpin.in/your-listing" },
  { key: "google",    label: "Google",      iconUrl: SI("google"),     color: "#4285F4", urlHint: "https://g.page/your-business" },
  { key: "zomato",    label: "Zomato",      iconUrl: SI("zomato"),     color: "#E23744", urlHint: "https://zomato.com/your-listing" },
  { key: "swiggy",    label: "Swiggy",      iconUrl: SI("swiggy"),     color: "#FC8019", urlHint: "https://swiggy.com/your-listing" },
  { key: "twitter",   label: "X (Twitter)", iconUrl: SI("x"),          color: "#000000", urlHint: "https://x.com/yourhandle" },
  { key: "linkedin",  label: "LinkedIn",    iconUrl: SI("linkedin"),   color: "#0A66C2", urlHint: "https://linkedin.com/company/you" },
  { key: "pinterest", label: "Pinterest",   iconUrl: SI("pinterest"),  color: "#BD081C", urlHint: "https://pinterest.com/yourhandle" },
  { key: "snapchat",  label: "Snapchat",    iconUrl: SI("snapchat"),   color: "#FFFC00", urlHint: "https://snapchat.com/add/you" },
  { key: "telegram",  label: "Telegram",    iconUrl: SI("telegram"),   color: "#26A5E4", urlHint: "https://t.me/yourhandle" },
  { key: "threads",   label: "Threads",     iconUrl: SI("threads"),    color: "#000000", urlHint: "https://threads.net/@yourhandle" },
  { key: "custom",    label: "Custom",      iconUrl: "",                color: "#475569", urlHint: "https://example.com" },
];

export const MAX_SOCIALS = 15;

export function getPreset(key: string): SocialPreset | undefined {
  return SOCIAL_PRESETS.find((p) => p.key === key);
}

export function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function makeSocialFromPreset(key: string): SocialLink {
  const p = getPreset(key) || SOCIAL_PRESETS[SOCIAL_PRESETS.length - 1];
  return {
    id: newId(),
    platform: p.key,
    label: p.label,
    url: "",
    iconUrl: p.iconUrl || undefined,
    color: p.color,
  };
}

export const DEFAULT_SOCIALS: SocialLink[] = [
  { id: "s_fb",  platform: "facebook",  label: "Facebook",  url: "#",                                      iconUrl: SI("facebook"),  color: "#1877F2" },
  { id: "s_ig",  platform: "instagram", label: "Instagram", url: "https://www.instagram.com/mercuryignite23", iconUrl: SI("instagram"), color: "#E4405F" },
  { id: "s_wa",  platform: "whatsapp",  label: "WhatsApp",  url: "https://wa.me/919557149655",             iconUrl: SI("whatsapp"),  color: "#25D366" },
  { id: "s_yt",  platform: "youtube",   label: "YouTube",   url: "#",                                      iconUrl: SI("youtube"),   color: "#FF0000" },
];
