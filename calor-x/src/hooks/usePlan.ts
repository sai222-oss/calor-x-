import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Plan = "free" | "pro";

interface UsePlanResult {
    plan: Plan;
    isPro: boolean;
    scanLimit: number;   // 1 | Infinity
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
                const { data } = await supabase
                    .from("profiles")
                    .select("plan")
                    .eq("id", user.id)
                    .single() as any;
                if (data?.plan && ["free", "pro"].includes(data.plan)) {
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
    const scanLimit = plan === "free" ? 1 : Infinity;

    return { plan, isPro, scanLimit, loading };
}
