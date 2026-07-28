// Preset anime-style avatars using DiceBear (no assets, CDN-served SVG)
export const AVATAR_PRESETS: { id: string; url: string; label: string }[] = [
  { id: "lorelei-1", label: "Sakura", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sakura&backgroundColor=b6e3f4" },
  { id: "lorelei-2", label: "Hinata", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Hinata&backgroundColor=ffd5dc" },
  { id: "lorelei-3", label: "Yuki",   url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Yuki&backgroundColor=c0aede" },
  { id: "adv-1",     label: "Ryo",    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ryo&backgroundColor=b6e3f4" },
  { id: "adv-2",     label: "Kai",    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Kai&backgroundColor=ffdfbf" },
  { id: "adv-3",     label: "Aoi",    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Aoi&backgroundColor=d1d4f9" },
  { id: "micah-1",   label: "Ren",    url: "https://api.dicebear.com/9.x/micah/svg?seed=Ren&backgroundColor=c0aede" },
  { id: "micah-2",   label: "Hana",   url: "https://api.dicebear.com/9.x/micah/svg?seed=Hana&backgroundColor=ffd5dc" },
  { id: "noti-1",    label: "Kenji",  url: "https://api.dicebear.com/9.x/notionists/svg?seed=Kenji&backgroundColor=b6e3f4" },
  { id: "noti-2",    label: "Mika",   url: "https://api.dicebear.com/9.x/notionists/svg?seed=Mika&backgroundColor=ffdfbf" },
  { id: "per-1",     label: "Taro",   url: "https://api.dicebear.com/9.x/personas/svg?seed=Taro&backgroundColor=d1d4f9" },
  { id: "per-2",     label: "Emi",    url: "https://api.dicebear.com/9.x/personas/svg?seed=Emi&backgroundColor=ffd5dc" },
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
