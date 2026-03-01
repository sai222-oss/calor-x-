import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, MailCheck, AlertCircle } from "lucide-react";

const Auth = ({ mode }: { mode?: "login" | "signup" } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // New State for Professional UI
  const [errorMsg, setErrorMsg] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<"signup" | "login">("signup");

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
      // Only redirect if confirmed
      if (session && session.user.email_confirmed_at) {
        checkRedirect(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && session.user.email_confirmed_at) {
        checkRedirect(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, location.search, mode]);

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setErrorMsg("Google sign-in failed: " + error.message);
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMsg(error.message.includes("Invalid") ? "Invalid email or password" : error.message);
        } else if (data.user && !data.user.email_confirmed_at) {
          // Block access if email is not verified
          await supabase.auth.signOut();
          setVerificationType("login");
          setShowVerificationModal(true);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setVerificationType("signup");
          setShowVerificationModal(true);
        }
      }
    } catch {
      setErrorMsg("An error occurred, please try again");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setErrorMsg("");
    if (location.pathname === "/signup" && !isLogin) {
      navigate("/auth");
    } else if (location.pathname === "/auth" && isLogin) {
      navigate("/signup");
    } else {
      setIsLogin(!isLogin);
    }
  };

  if (showVerificationModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FFF5F0" }}>
        <Card className="w-full max-w-md p-8 text-center space-y-6 premium-card animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-[#FF4500]/10 rounded-full flex items-center justify-center mb-4">
            <MailCheck className="h-8 w-8 text-[#FF4500]" />
          </div>
          <h2 className="text-2xl font-bold text-[#FF4500]">
            {verificationType === "signup" ? "Check your email" : "Email Verification Required"}
          </h2>
          <p className="text-muted-foreground">
            {verificationType === "signup"
              ? "We've sent a verification link to your email address. Please verify your email to continue."
              : "You must verify your email address before you can log in to Calor X. Please check your inbox for the verification link."}
          </p>
          <Button onClick={() => setShowVerificationModal(false)} className="w-full py-5 btn-glow mt-4 rounded-full text-white font-bold" style={{ background: "#FF4500" }}>
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FFF5F0" }}>
      <Card className="w-full max-w-md p-8 space-y-6 premium-card animate-fade-in">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-heading font-bold text-[#FF4500]">Calor <span className="text-[#FF8C00]">X</span></h1>
          <h2 className="text-xl font-bold mt-3 text-gray-900">
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
          className="w-full gap-3 border-gray-200 hover:bg-gray-50 py-5 rounded-full text-gray-700 font-medium"
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
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-md bg-red-950/50 border border-red-900/50 flex items-center gap-2 text-red-200 text-sm animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email / البريد الإلكتروني</label>
            <Input
              type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} disabled={loading} required
              className="bg-[#FFF5F0] border-gray-200 focus:border-[#FF4500] rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password / كلمة المرور</label>
            <Input
              type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} disabled={loading} required minLength={6}
              className="bg-[#FFF5F0] border-gray-200 focus:border-[#FF4500] rounded-xl"
            />
          </div>
          <Button type="submit" className="w-full py-5 btn-glow rounded-full text-white font-bold" style={{ background: "#FF4500" }} disabled={loading}>
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
            type="button" onClick={toggleAuthMode}
            className="text-sm text-[#FF4500] font-semibold hover:underline" disabled={loading}
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

