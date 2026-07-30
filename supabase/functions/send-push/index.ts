// Sends Web Push notifications to all subscriptions for a given user.
// Triggered by DB trigger on public.notifications INSERT.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, title, message, id } = await req.json();

    // Fetch subscriptions: if user_id is null => broadcast to everyone
    const q = supabase.from("push_subscriptions").select("id,endpoint,p256dh,auth");
    const { data: subs, error } = user_id
      ? await q.eq("user_id", user_id)
      : await q;
    if (error) throw error;

    const payload = JSON.stringify({ title: title ?? "SPARK WALLET", body: message ?? "", id });
    const deadIds: string[] = [];
    let delivered = 0;
    let failed = 0;

    await Promise.all(
      (subs ?? []).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
          );
          delivered += 1;
        } catch (e: any) {
          failed += 1;
          if ([400, 401, 403, 404, 410].includes(e?.statusCode)) deadIds.push(s.id);
          console.error("push delivery failed", s.id, e?.statusCode, e?.body);
        }
      }),
    );
    if (deadIds.length) await supabase.from("push_subscriptions").delete().in("id", deadIds);

    return new Response(JSON.stringify({ attempted: (subs ?? []).length, delivered, failed, removed: deadIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
