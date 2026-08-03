import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { registerPush } from "@/lib/push";
import { isSoundEnabled, playRing, playRingtone } from "@/lib/sound";
import { toast } from "sonner";

interface AlertRow {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const GlobalAlerts = () => {
  useEffect(() => {
    let activeUserId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const stopChannel = () => {
      if (channel) void supabase.removeChannel(channel);
      channel = null;
    };

    const startForUser = (userId: string) => {
      if (activeUserId === userId && channel) return;
      activeUserId = userId;
      stopChannel();
      void registerPush(userId);

      channel = supabase
        .channel(`global-alerts-${userId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
          const row = payload.new as AlertRow;
          if (row.user_id !== userId && row.user_id !== null) return;

          window.dispatchEvent(new CustomEvent("spark-notification", { detail: row }));
          toast.message(row.title, { description: row.message });

          if (/ring alert/i.test(row.title)) {
            void playRingtone(10);
            return;
          }
          if (!isSoundEnabled()) return;
          const text = `${row.title} ${row.message}`.toLowerCase();
          const variant = /approve|credit|success/.test(text)
            ? "success"
            : /reject|debit|block|fail/.test(text)
              ? "error"
              : "info";
          void playRing(variant);
        })
        .subscribe();
    };

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) startForUser(data.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) startForUser(session.user.id);
      else {
        activeUserId = null;
        stopChannel();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      stopChannel();
    };
  }, []);

  return null;
};

export default GlobalAlerts;