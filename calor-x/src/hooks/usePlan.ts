import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Plan = "free" | "standard" | "pro";

interface UsePlanResult {
    plan: Plan;
    isPro: boolean;
    isStandard: boolean; // standard OR pro
    scanLimit: number;   // 1 | 10 | Infinity
    loading: boolean;
}

export function usePlan(): UsePlanResult {
    const [plan, setPlan] = useState<Plan>("free");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { setLoading(false); return; }
                // Use explicit cast since 'plan' column may not be in generated types yet
                const { data } = await supabase
                    .from("profiles")
                    .select("plan")
                    .eq("id", user.id)
                    .single() as any;
                if (data?.plan && ["free", "standard", "pro"].includes(data.plan)) {
                    setPlan(data.plan as Plan);
                }
            } catch {
                // default to free on error
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const isPro = plan === "pro";
    const isStandard = plan === "standard" || plan === "pro";
    const scanLimit = plan === "free" ? 1 : plan === "standard" ? 10 : Infinity;

    return { plan, isPro, isStandard, scanLimit, loading };
}
