import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const HIDE_ON = ["/dashboard", "/scan", "/nutrition-results", "/progress", "/ai-coach", "/profile", "/profile-setup", "/onboarding"];

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [user, setUser] = useState<{ email?: string; user_metadata?: any } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isHidden = HIDE_ON.some(p => pathname.startsWith(p));
  if (isHidden) return null;

  const initial = user?.email?.[0]?.toUpperCase() ?? "";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="w-full border-b border-border/40 sticky top-0 z-50"
      style={{ background: "hsl(220 18% 8% / 0.85)", backdropFilter: "blur(16px)" }}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-heading font-bold text-xl gradient-text">
          Calor X
        </Link>

        <nav className="flex items-center gap-3">
          <Link to="/pricing" className="text-sm font-medium text-white/80 hover:text-accent transition-colors">
            {t("footer_pricing")}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2 text-sm text-white/90 hover:bg-white/10 hover:text-white">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm cursor-pointer shadow-lg active:scale-95 transition-transform overflow-hidden border border-white/20"
                onClick={() => navigate("/profile")}>
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="text-white/70 hover:text-destructive px-2 hover:bg-white/5">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigate("/auth")} className="text-white/90 hover:bg-white/10">{t("prof_logout") ? "Sign In" : "Login"}</Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="btn-glow hover:bg-opacity-90 border-0" style={{ background: "#6C63FF", color: "white" }}>{t("auth_sign_up") || "Sign Up"}</Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
