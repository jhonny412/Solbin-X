// Configuración de Supabase
const SUPABASE_URL = 'https://afhjtkifntysqnlquuyk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaGp0a2lmbnR5c3FubHF1dXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NDE2NzQsImV4cCI6MjA4NDAxNzY3NH0.A1zdONDkqc2gTS-nk_Yyb8ls2L-7av8h-pUlB-IOOhE';

let supabaseClient;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabaseClient;
        window.supabase = supabaseClient; // Compatibilidad
        
        return true;
    }
    return false;
}

if (!initSupabase()) {
    // Retry shortly in case of async load
    setTimeout(() => {
        if (!initSupabase()) {
            // Fallback: check if 'supabase' global exists but is not yet initialized as client
            if (typeof window.supabase !== 'undefined') {
                console.warn('Supabase global found but check failed. Retrying...');
                initSupabase();
            } else {
                console.error('Supabase library missing after timeout.');
            }
        } else {
            
        }
    }, 500);
}
