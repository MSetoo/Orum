import { supabase } from "../api/supabaseClient";

export function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
    return supabase.auth.signOut();
}

export function getSession() {
    return supabase.auth.getSession();
}