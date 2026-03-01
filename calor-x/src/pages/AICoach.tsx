import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Bot, User, Dumbbell, Loader2, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";
import { StringKey } from "@/lib/i18n";

interface Message { role: "user" | "assistant"; content: string; }

const QUICK_PROMPT_KEYS: StringKey[] = ["qp1", "qp2", "qp3", "qp4", "qp5"];

const AICoach = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isPro, loading: planLoading } = usePlan();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("coach_greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { setUserId(data.user?.id ?? null); }); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setInput(""); setLoading(true);
    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke("coach", {
        body: { message: messageText, userId, conversationHistory: history },
      });
      if (error) {
        const msg = error.message ?? "Unknown error";
        if (msg.includes("GEMINI_API_KEY")) throw new Error("مفتاح Gemini API غير مضبوط.");
        throw error;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data?.reply ?? t("coach_error_msg") }]);
    } catch (err: any) {
      toast.error(err?.message ?? t("coach_error"));
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${err?.message ?? t("coach_error_msg")}` }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Green Header (always visible) ──────────────────────────────────────────
  const header = (
    <div className="p-4 text-white flex items-center gap-3 sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)" }}>
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="w-6 h-6" />
      </Button>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Dumbbell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">{t("coach_title")}</h1>
          <p className="text-xs opacity-80">{t("coach_subtitle")}</p>
        </div>
      </div>
      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">AI</Badge>
    </div>
  );

  // ── Paywall screen for free users ──────────────────────────────────────────
  if (!planLoading && !isPro) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#F9F9F2" }}>
        {header}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #D4AF37, #B8860B)" }}>
            <Lock className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#1B4332" }}>{t("coach_locked_title")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{t("coach_locked_desc")}</p>
          </div>

          {/* Feature highlights */}
          <Card className="w-full max-w-xs p-5 text-left space-y-3 premium-card">
            {[
              { icon: "💬", text: "نصائح غذائية مخصصة" },
              { icon: "📊", text: "تحليل وجباتك اليومية" },
              { icon: "🏋️", text: "خطط تمرين وتغذية" },
              { icon: "🎯", text: "متابعة أهدافك الصحية" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium" style={{ color: "#1B4332" }}>{text}</span>
              </div>
            ))}
          </Card>

          <Button
            className="w-full max-w-xs py-6 rounded-2xl font-bold text-lg btn-glow"
            style={{ background: "#1B4332" }}
            onClick={() => navigate("/pricing")}
          >
            <Zap className="w-5 h-5 mr-2" />
            {t("upgrade_btn")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("price_footer")}</p>
        </div>
      </div>
    );
  }

  // ── Full chat UI for Standard/Pro users ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F9F9F2" }}>
      {header}

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white ${msg.role === "user" ? "" : ""}`}
              style={{ background: msg.role === "user" ? "#1B4332" : "linear-gradient(135deg, #D4AF37, #1B4332)" }}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <Card
              className={`p-3 max-w-[80%] border-0 rounded-2xl ${msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
              style={msg.role === "user" ? { background: "#1B4332", color: "white" } : { background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #D4AF37, #1B4332)" }}>
              <Bot className="w-4 h-4" />
            </div>
            <Card className="p-3 border-0 rounded-2xl rounded-bl-sm" style={{ background: "white" }}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#1B4332" }} />
                <span className="text-sm text-muted-foreground">{t("coach_analyzing")}</span>
              </div>
            </Card>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">{t("coach_quick_title")}</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPT_KEYS.map((key) => (
              <button key={key} onClick={() => sendMessage(t(key))}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: "rgba(27, 67, 50, 0.2)", color: "#1B4332", background: "rgba(27, 67, 50, 0.05)" }}>
                {t(key)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t" style={{ background: "#F9F9F2", borderColor: "rgba(27, 67, 50, 0.1)" }}>
        <div className="flex gap-2 items-end">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={t("coach_placeholder")} className="resize-none min-h-[44px] max-h-[120px] text-sm rounded-2xl" rows={1} disabled={loading} />
          <Button onClick={() => sendMessage()} size="icon" disabled={loading || !input.trim()}
            className="flex-shrink-0 h-11 w-11 rounded-xl" style={{ background: "#1B4332" }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">{t("coach_send_hint")}</p>
      </div>
    </div>
  );
};

export default AICoach;
