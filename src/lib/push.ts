import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY =
  "BHlq8pDnMkP4O1sWMoKgt7i_naUeHVpH6L3T6-hq9wWhVPeMo4KE_KZ0XGK6fsEVxZoqE-krmEmqIQM9vs7NAh4";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bufToB64(buf: ArrayBuffer | null) {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function keysMatch(left: ArrayBuffer | null, right: Uint8Array) {
  if (!left) return false;
  const current = new Uint8Array(left);
  return current.length === right.length && current.every((value, index) => value === right[index]);
}

export async function registerPush(userId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await reg.update();

    let sub = await reg.pushManager.getSubscription();
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    if (sub && !keysMatch(sub.options.applicationServerKey, applicationServerKey)) {
      await sub.unsubscribe();
      sub = null;
    }
    if (!sub) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return false;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    const endpoint = json.endpoint ?? sub.endpoint;
    const p256dh = json.keys?.p256dh ?? bufToB64(sub.getKey("p256dh"));
    const auth = json.keys?.auth ?? bufToB64(sub.getKey("auth"));

    const { error } = await supabase.from("push_subscriptions").upsert(
      { user_id: userId, endpoint, p256dh, auth, user_agent: navigator.userAgent },
      { onConflict: "endpoint" },
    );
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("push register failed", e);
    return false;
  }
}
