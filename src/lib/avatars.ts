// Preset anime-style avatars using DiceBear (no assets, CDN-served SVG)
export const AVATAR_PRESETS: { id: string; url: string; label: string }[] = [
  // Lorelei — soft anime portraits
  { id: "lorelei-1", label: "Sakura", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sakura&backgroundColor=b6e3f4" },
  { id: "lorelei-2", label: "Hinata", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Hinata&backgroundColor=ffd5dc" },
  { id: "lorelei-3", label: "Yuki",   url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Yuki&backgroundColor=c0aede" },
  { id: "lorelei-4", label: "Mei",    url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Mei&backgroundColor=ffdfbf" },
  { id: "lorelei-5", label: "Rin",    url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Rin&backgroundColor=a7f3d0" },

  // Adventurer — anime RPG style
  { id: "adv-1", label: "Ryo",    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ryo&backgroundColor=b6e3f4" },
  { id: "adv-2", label: "Kai",    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Kai&backgroundColor=ffdfbf" },
  { id: "adv-3", label: "Aoi",    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Aoi&backgroundColor=d1d4f9" },
  { id: "adv-4", label: "Sora",   url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sora&backgroundColor=fecaca" },
  { id: "adv-5", label: "Haru",   url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Haru&backgroundColor=fde68a" },
  { id: "adv-6", label: "Yuna",   url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Yuna&backgroundColor=fbcfe8" },

  // Micah — clean flat vector
  { id: "micah-1", label: "Ren",   url: "https://api.dicebear.com/9.x/micah/svg?seed=Ren&backgroundColor=c0aede" },
  { id: "micah-2", label: "Hana",  url: "https://api.dicebear.com/9.x/micah/svg?seed=Hana&backgroundColor=ffd5dc" },
  { id: "micah-3", label: "Kenzo", url: "https://api.dicebear.com/9.x/micah/svg?seed=Kenzo&backgroundColor=bae6fd" },
  { id: "micah-4", label: "Nao",   url: "https://api.dicebear.com/9.x/micah/svg?seed=Nao&backgroundColor=bbf7d0" },

  // Notionists — modern illustrated
  { id: "noti-1", label: "Kenji", url: "https://api.dicebear.com/9.x/notionists/svg?seed=Kenji&backgroundColor=b6e3f4" },
  { id: "noti-2", label: "Mika",  url: "https://api.dicebear.com/9.x/notionists/svg?seed=Mika&backgroundColor=ffdfbf" },
  { id: "noti-3", label: "Toru",  url: "https://api.dicebear.com/9.x/notionists/svg?seed=Toru&backgroundColor=e9d5ff" },
  { id: "noti-4", label: "Aya",   url: "https://api.dicebear.com/9.x/notionists/svg?seed=Aya&backgroundColor=fed7aa" },

  // Personas — friendly avatars
  { id: "per-1", label: "Taro", url: "https://api.dicebear.com/9.x/personas/svg?seed=Taro&backgroundColor=d1d4f9" },
  { id: "per-2", label: "Emi",  url: "https://api.dicebear.com/9.x/personas/svg?seed=Emi&backgroundColor=ffd5dc" },
  { id: "per-3", label: "Jin",  url: "https://api.dicebear.com/9.x/personas/svg?seed=Jin&backgroundColor=a7f3d0" },
  { id: "per-4", label: "Rei",  url: "https://api.dicebear.com/9.x/personas/svg?seed=Rei&backgroundColor=fecaca" },

  // Big-ears anime style
  { id: "big-1", label: "Kuro", url: "https://api.dicebear.com/9.x/big-ears/svg?seed=Kuro&backgroundColor=fde68a" },
  { id: "big-2", label: "Miku", url: "https://api.dicebear.com/9.x/big-ears/svg?seed=Miku&backgroundColor=bbf7d0" },
  { id: "big-3", label: "Shin", url: "https://api.dicebear.com/9.x/big-ears/svg?seed=Shin&backgroundColor=bae6fd" },
  { id: "big-4", label: "Nozomi", url: "https://api.dicebear.com/9.x/big-ears/svg?seed=Nozomi&backgroundColor=fbcfe8" },

  // Avataaars — classic anime-ish
  { id: "ava-1", label: "Daichi", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Daichi&backgroundColor=c0aede" },
  { id: "ava-2", label: "Sana",   url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sana&backgroundColor=ffdfbf" },
  { id: "ava-3", label: "Itsuki", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Itsuki&backgroundColor=a7f3d0" },
  { id: "ava-4", label: "Chika",  url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Chika&backgroundColor=fecaca" },
];

const KEY = (uid: string) => `spark-avatar:${uid}`;

export const getAvatar = (uid?: string | null): string | null => {
  if (!uid || typeof window === "undefined") return null;
  return localStorage.getItem(KEY(uid));
};

export const setAvatar = (uid: string, url: string) => {
  localStorage.setItem(KEY(uid), url);
  window.dispatchEvent(new CustomEvent("avatar-changed", { detail: { uid, url } }));
};

export const clearAvatar = (uid: string) => {
  localStorage.removeItem(KEY(uid));
  window.dispatchEvent(new CustomEvent("avatar-changed", { detail: { uid, url: null } }));
};
