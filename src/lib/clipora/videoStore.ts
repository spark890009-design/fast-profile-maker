/**
 * Local video store — keeps uploaded source videos in IndexedDB so a clip can
 * actually be played back (and survive a page reload) while running in local
 * preview mode. Nothing is uploaded anywhere.
 */

const DB_NAME = "clipora-media";
const STORE = "videos";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVideo(projectId: string, file: Blob): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, projectId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getVideoBlob(projectId: string): Promise<Blob | null> {
  try {
    const db = await open();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(projectId);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return blob;
  } catch {
    return null;
  }
}

export async function deleteVideo(projectId: string): Promise<void> {
  try {
    const db = await open();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(projectId);
    db.close();
  } catch {
    /* ignore */
  }
}

/** YouTube video id from any common link shape, or null. */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p === "shorts" || p === "embed");
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
    }
  } catch {
    /* not a url */
  }
  return null;
}

/** Vimeo video id, or null. */
export function vimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const id = u.pathname.split("/").filter(Boolean)[0];
    return /^\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** True when the URL points at a file a <video> tag can play directly. */
export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(url);
}
