// ======================================================
// API ABSTRACTION LAYER (Supabase-backed)
// Safe, singleton-style, no redeclaration issues
// ======================================================

// ---------- CONFIG ----------
const API_CONFIG = {
    supabaseUrl: "https://mtreiepuuoiashsjaaaj.supabase.co",
    supabaseAnonKey: "sb_publishable_6vsPhkgaF0HX5SF7KlCY5A_noG9YbiB"
};

// ======================================================
// SUPABASE CLIENT (SAFE SINGLE INSTANCE)
// ======================================================

// Use a singleton pattern to prevent redeclaration errors
const supabaseClient =
    window.__supabaseClient ??
    (window.__supabaseClient = window.supabase.createClient(
        API_CONFIG.supabaseUrl,
        API_CONFIG.supabaseAnonKey
    ));

// ======================================================
// API WRAPPER CLASS
// ======================================================

class ApiClient {

    // -------------------------
    // AUTH
    // -------------------------

    async signUp(email, password) {
        const { data, error } =
            await supabaseClient.auth.signUp({
                email,
                password
            });

        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    }

    async getUser() {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return data.user;
    }

    async isAuthenticated() {
        const { data } = await supabaseClient.auth.getSession();
        return !!data.session;
    }

    // -------------------------
    // DATABASE (CRUD)
    // -------------------------

    async list(table, filters = {}) {
        let query = supabaseClient.from(table).select("*");

        for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase list error:", error);
            throw error;
        }

        return data;
    }

    async get(table, id) {
        const { data, error } = await supabaseClient
            .from(table)
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    }

    async create(table, payload) {
        const { data, error } = await supabaseClient
            .from(table)
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(table, id, payload) {
        const { data, error } = await supabaseClient
            .from(table)
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async remove(table, id) {
        const { error } = await supabaseClient
            .from(table)
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
}

// ======================================================
// GLOBAL API INSTANCE (SAFE)
// ======================================================

window.api = window.api ?? new ApiClient();

async function test() {
    const users = await api.list("profiles");
    console.log("Users:", users);
}

test();