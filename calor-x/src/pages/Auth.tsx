import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Auth = ({ mode }: { mode?: "login" | "signup" } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (mode === "signup") {
      setIsLogin(false);
    } else {
      const q = new URLSearchParams(location.search).get("mode");
      if (q === "signup") setIsLogin(false);
    }

    const checkRedirect = async (userId: string) => {
      const { data } = await supabase.from("profiles").select("onboarding_completed").eq("id", userId).single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((data as any)?.onboarding_completed) {
        navigate("/dashboard");
      } else {
        navigate("/profile-setup");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkRedirect(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) checkRedirect(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate, location.search, mode]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast.error("Google sign-in failed: " + error.message);
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message.includes("Invalid") ? "Invalid email or password" : error.message);
        else toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) toast.error(error.message);
        else toast.success("Account created! Check your email to verify.");
      }
    } catch {
      toast.error("An error occurred, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(220 18% 7%) 0%, hsl(220 14% 10%) 100%)" }}>
      <Card className="w-full max-w-md p-8 space-y-6 border-border/40 animate-fade-in"
        style={{ background: "hsl(220 16% 11%)" }}>
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-heading font-bold gradient-text">Calor X</h1>
          <h2 className="text-xl font-bold mt-3">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-3 border-border/60 hover:border-border py-5"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email / البريد الإلكتروني</label>
            <Input
              type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} disabled={loading} required
              className="bg-secondary/50 border-border/40 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password / كلمة المرور</label>
            <Input
              type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} disabled={loading} required minLength={6}
              className="bg-secondary/50 border-border/40 focus:border-primary"
            />
          </div>
          <Button type="submit" className="w-full py-5 btn-glow" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Sign In / تسجيل الدخول" : "Sign Up / إنشاء حساب"}
          </Button>
          {!isLogin && (
            <p className="text-xs text-center text-muted-foreground mt-1">
              By signing up you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          )}
        </form>

        <div className="text-center space-y-3">
          <button
            type="button" onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline" disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up →" : "Already have an account? Sign in →"}
          </button>
          <br />
          <button
            type="button" onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
            disabled={loading}
          >
            ← Back to Home
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
