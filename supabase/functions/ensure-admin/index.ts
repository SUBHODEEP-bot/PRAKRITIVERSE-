import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const adminEmail = 'admin@ecolearn.com';
    const adminPassword = 'ADMIN@123';
    const adminName = 'SUBHODEEP PAL';

    // First, check if admin user exists
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    
    let adminUser = list.users.find((u: any) => u.email?.toLowerCase() === adminEmail);
    
    if (!adminUser) {
      // Create admin user if doesn't exist
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminName, role: 'admin' }
      });
      if (createErr) throw createErr;
      adminUser = created.user;
    } else {
      // If user exists but not confirmed, confirm them
      if (!adminUser.email_confirmed_at) {
        const { error: confirmErr } = await supabase.auth.admin.updateUserById(adminUser.id, {
          email_confirm: true
        });
        if (confirmErr) throw confirmErr;
      }
      
      // Update password in case it changed
      const { error: updateErr } = await supabase.auth.admin.updateUserById(adminUser.id, {
        password: adminPassword
      });
      if (updateErr) throw updateErr;
    }

    const adminUserId = adminUser.id;

    if (!adminUserId) {
      throw new Error('Unable to obtain admin user id');
    }

    // Ensure profile exists and is set to admin
    const { error: upsertProfileErr } = await supabase.from('profiles').upsert({
      user_id: adminUserId,
      email: adminEmail,
      full_name: adminName,
      role: 'admin',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (upsertProfileErr) throw upsertProfileErr;

    // Ensure eco pet exists
    const { data: pet, error: petErr } = await supabase
      .from('eco_pets')
      .select('id')
      .eq('user_id', adminUserId)
      .maybeSingle();
    if (petErr) throw petErr;
    if (!pet) {
      const { error: insertPetErr } = await supabase.from('eco_pets').insert({ user_id: adminUserId, name: 'Leafy' });
      if (insertPetErr) throw insertPetErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('ensure-admin error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
