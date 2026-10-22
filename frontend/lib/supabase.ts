import { createClient } from "@supabase/supabase-js";

// 🚨 TEST TEMPORAIRE : Clés en dur pour voir si ça marche
const supabaseUrl = "https://dldbvjqviaqevohxjonm.supabase.co"; 
const supabaseAnonKey = "sb_publishable_16VHNPq2LNnl-KcoBwgdXg_EQODar_Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
