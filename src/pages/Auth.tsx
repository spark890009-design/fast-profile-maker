import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const signIn = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Sign in nahi ho paya, dobara koshish karein");
      return;
    }
    if (result.redirected) return;
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <Card className="w-full max-w-sm p-7 text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
          <Milk className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Milk Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            दूध हिसाब · हर डेयरी का रोज़ का हिसाब, अपने आप सुरक्षित
          </p>
        </div>
        <Button className="w-full h-12 text-base" onClick={signIn} disabled={busy}>
          Gmail se sign in karein
        </Button>
        <p className="text-xs text-muted-foreground">
          Sign in karne par aapka data online save rahega — phone badalne par bhi milega.
        </p>
      </Card>
    </div>
  );
}
