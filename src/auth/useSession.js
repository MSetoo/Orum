import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

export function useSession() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session || null);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return { session, loading };
}