// src/services/push/registerPush.ts
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import { api } from "../api";

export async function registerPushToken() {
  if (!("Notification" in window)) return;

  const permission = await Notification.requestPermission();

  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  if (!token) return;

  const ua = navigator.userAgent.toLowerCase();

  const platform = /android/.test(ua)
    ? "android"
    : /iphone|ipad|ipod/.test(ua)
      ? "ios"
      : "desktop";

  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  await api.post("/private/push-token", {
    token,
    plataform: isPWA ? "pwa" : platform,
  });
}
