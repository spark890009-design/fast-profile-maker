import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Search, ShieldCheck, Store, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const [search, setSearch] = useState("");
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,user_id,full_name,email,mobile,account_type,blocked,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => [user.user_id, user.full_name, user.email, user.mobile].some((value) => value.toLowerCase().includes(term)));
  }, [search, users]);

  if (!loading && !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-secondary text-primary flex items-center justify-center"><ShieldCheck /></div><div><h2 className="font-display text-xl font-bold">Admin · Users</h2><p className="text-sm text-muted-foreground">Sabhi registered users ki details</p></div></div>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="User ID, naam, email ya mobile search karein" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <p className="text-sm font-medium">{filtered.length} users</p>
      {isLoading ? <p className="text-center text-muted-foreground py-10">Loading…</p> : filtered.map((user) => (
        <Card key={user.id} className="p-4 space-y-3">
          <div className="flex items-start gap-3"><div className="h-10 w-10 rounded-full bg-secondary text-primary flex items-center justify-center">{user.account_type === "shop" ? <Store className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="font-semibold truncate">{user.full_name}</p><p className="text-xs text-muted-foreground">User ID: {user.user_id}</p></div><Badge variant={user.blocked ? "destructive" : "secondary"}>{user.blocked ? "Blocked" : user.account_type === "shop" ? "Dairy shop" : "Customer"}</Badge></div>
          <div className="grid gap-1 text-sm"><p className="break-all"><span className="text-muted-foreground">Email:</span> {user.email}</p><p><span className="text-muted-foreground">Mobile:</span> {user.mobile || "Not added"}</p><p><span className="text-muted-foreground">Joined:</span> {new Date(user.created_at).toLocaleDateString("en-IN")}</p></div>
        </Card>
      ))}
    </div>
  );
}