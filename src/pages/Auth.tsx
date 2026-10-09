import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Phone, Store, UserRound } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/milk-logo.png.asset.json";

type Mode = "signin" | "signup";
type AccountType = "shop" | "customer";

const emailSchema = z.string().trim().email("Sahi email address likhein").max(255);
const passwordSchema = z.string().min(6, "Password kam se kam 6 characters ka rakhein").max(72);
const phoneSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "10 digit mobile number likhein");

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const googleSignIn = async () => {
    if (!accountType) return toast.error("Pehle apna account type chunein");
    setBusy(true);
    window.localStorage.setItem("milk.pendingAccountType", accountType);
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!accountType) return toast.error("Pehle apna account type chunein");
    const checkedEmail = emailSchema.safeParse(email);
    const checkedPassword = passwordSchema.safeParse(password);
    if (!checkedEmail.success) return toast.error(checkedEmail.error.issues[0]?.message);
    if (!checkedPassword.success) return toast.error(checkedPassword.error.issues[0]?.message);
    setBusy(true);
    if (mode === "signup") {
      const checkedPhone = phoneSchema.safeParse(mobile);
      if (!fullName.trim() || fullName.trim().length > 80) {
        setBusy(false);
        return toast.error("Apna poora naam likhein");
      }
      if (!checkedPhone.success) {
        setBusy(false);
        return toast.error(checkedPhone.error.issues[0]?.message);
      }
      const { data, error } = await supabase.auth.signUp({
        email: checkedEmail.data,
        password: checkedPassword.data,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName.trim(), mobile: checkedPhone.data, account_type: accountType },
        },
      });
      setBusy(false);
      if (error) return toast.error(error.message.includes("profiles_mobile_unique") ? "Ye mobile number pehle se registered hai" : error.message);
      if (!data.session) {
        toast.success("Account request ho gayi — sign in karne se pehle apna email confirm karein");
        setMode("signin");
        return;
      }
      toast.success("Account ban gaya — aap sign in ho gaye hain");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: checkedEmail.data, password: checkedPassword.data });
    setBusy(false);
    if (error) return toast.error("Email ya password sahi nahi hai");
  };

  const forgotPassword = async () => {
    const checked = emailSchema.safeParse(email);
    if (!checked.success) return toast.error("Pehle apna registered email likhein");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(checked.data, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset link email par bhej diya");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md p-6 space-y-5 animate-fade-in">
        <img src={logo.url} alt="Milk Tracker" className="mx-auto h-24 w-24 rounded-2xl object-contain shadow-md" />
        <div>
          <h1 className="font-display text-2xl font-bold text-center text-primary">Milk Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            दूध हिसाब · हर डेयरी का रोज़ का हिसाब, अपने आप सुरक्षित
          </p>
        </div>

        <div className="space-y-2">
          <Label>Aap Milk Tracker kaise use karenge?</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant={accountType === "shop" ? "default" : "outline"} className="h-auto py-3 flex-col gap-1" onClick={() => setAccountType("shop")}><Store className="h-5 w-5" /><span>Meri dairy shop</span><span className="text-[11px] opacity-75 font-normal">Main doodh deta hoon</span></Button>
            <Button type="button" variant={accountType === "customer" ? "default" : "outline"} className="h-auto py-3 flex-col gap-1" onClick={() => setAccountType("customer")}><UserRound className="h-5 w-5" /><span>Main customer</span><span className="text-[11px] opacity-75 font-normal">Main doodh leta hoon</span></Button>
          </div>
        </div>

        <div className="grid grid-cols-2 rounded-md bg-muted p-1">
          <Button type="button" variant={mode === "signin" ? "secondary" : "ghost"} onClick={() => setMode("signin")}>Sign in</Button>
          <Button type="button" variant={mode === "signup" ? "secondary" : "ghost"} onClick={() => setMode("signup")}>Sign up</Button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <><div className="space-y-1.5"><Label htmlFor="full-name">Full name</Label><Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} autoComplete="name" required /></div><div className="space-y-1.5"><Label htmlFor="mobile">Mobile number</Label><div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="mobile" className="pl-9" inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} autoComplete="tel" required /></div></div></>}
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" className="pl-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div></div>
          <div className="space-y-1.5"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" className="pr-10" type={showPassword ? "text" : "password"} minLength={6} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} required /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></div>
          {mode === "signin" && <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={forgotPassword} disabled={busy}>Forgot password?</Button>}
          <Button className="w-full h-11" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Account banayein" : "Sign in karein"}</Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
        <Button className="w-full h-11" variant="outline" onClick={googleSignIn} disabled={busy}>Gmail se continue karein</Button>
        <p className="text-xs text-muted-foreground text-center">Aapka dairy-wise hisaab account mein online safe rahega.</p>
      </Card>
    </div>
  );
}
