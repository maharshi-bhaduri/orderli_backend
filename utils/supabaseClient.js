import { createClient } from "@supabase/supabase-js";

// Public keys for client-side operations (if needed)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a client for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
