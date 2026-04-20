import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || "/account";

  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true });
  }, [user, authLoading, navigate, from]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = emailSchema.safeParse(email);
    const pwCheck = passwordSchema.safeParse(password);
    if (!emailCheck.success) return toast({ title: "Invalid email", description: emailCheck.error.issues[0].message, variant: "destructive" });
    if (!pwCheck.success) return toast({ title: "Invalid password", description: pwCheck.error.issues[0].message, variant: "destructive" });

    setSubmitting(true);
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email to confirm your account, or sign in directly if confirmation is disabled." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/account`,
    });
    if (result.error) {
      toast({ title: "Google sign-in failed", description: result.error.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl font-light tracking-wide">My Account</h1>
            <p className="text-sm text-muted-foreground mt-2">Sign in or create an account to continue</p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="transition-all duration-300">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="transition-all duration-300">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 animate-fade-in">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2 transition-all duration-200 focus-within:translate-x-0.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="space-y-2 transition-all duration-200 focus-within:translate-x-0.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" />
                </div>
                <Button type="submit" className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 animate-fade-in">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2 transition-all duration-200 focus-within:translate-x-0.5">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="space-y-2 transition-all duration-200 focus-within:translate-x-0.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="space-y-2 transition-all duration-200 focus-within:translate-x-0.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="transition-all duration-200 focus:ring-2 focus:ring-primary/30" />
                </div>
                <Button type="submit" className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md" disabled={submitting}>
                  {submitting ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:border-primary/40"
            onClick={handleGoogle}
            disabled={submitting}
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-500 group-hover:rotate-[360deg]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="story-link inline-block transition-colors hover:text-foreground">← Back to shop</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
