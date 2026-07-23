import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Invalid email").max(120),
  mobile: z.string().trim().regex(/^\d{10}$/, "10-digit mobile number required"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
});

const Auth = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav("/dashboard", { replace: true });
    });
  }, [nav]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { full_name, email, mobile, password } = parsed.data;

    // Uniqueness pre-check for friendly errors
    const { data: dup } = await supabase
      .from("profiles")
      .select("id")
      .or(`email.eq.${email},mobile.eq.${mobile}`)
      .limit(1);
    if (dup && dup.length > 0) {
      toast.error("Email or mobile already registered");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name, mobile },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Redirecting…");
    nav("/dashboard", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    nav("/dashboard", { replace: true });
  };

  const handleForgot = async () => {
    const email = prompt("Enter your registered email:");
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
  };

  const handleGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Wallet className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-gradient">SPK Wallet</span>
        </div>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Register or login to access your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="l-email">Email</Label>
                    <Input id="l-email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="l-password">Password</Label>
                    <Input id="l-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full gradient-primary border-0" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
                  </Button>
                  <button type="button" onClick={handleForgot} className="text-sm text-primary hover:underline w-full text-center">
                    Forgot Password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="r-name">Full Name</Label>
                    <Input id="r-name" name="full_name" required />
                  </div>
                  <div>
                    <Label htmlFor="r-email">Email (Gmail)</Label>
                    <Input id="r-email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="r-mobile">Mobile Number</Label>
                    <Input id="r-mobile" name="mobile" inputMode="numeric" maxLength={10} required />
                  </div>
                  <div>
                    <Label htmlFor="r-password">Password</Label>
                    <Input id="r-password" name="password" type="password" required />
                  </div>
                  <div>
                    <Label htmlFor="r-confirm">Confirm Password</Label>
                    <Input id="r-confirm" name="confirm" type="password" required />
                  </div>
                  <Button type="submit" className="w-full gradient-primary border-0" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
