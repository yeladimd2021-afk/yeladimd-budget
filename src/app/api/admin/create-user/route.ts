import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/create-user
 *
 * Creates a new Supabase Auth user + public.users profile row.
 * Uses SUPABASE_SERVICE_ROLE_KEY (server-side only — never exposed to the browser).
 *
 * Body: { email, password, displayName, role }
 */
export async function POST(request: Request) {
  // Only allow authenticated requests — basic server-side guard
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: { email: string; password: string; displayName: string; role: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password, displayName, role } = body;

  if (!email || !password || !displayName || !role) {
    return NextResponse.json(
      { error: 'חסרים שדות: email, password, displayName, role' },
      { status: 400 }
    );
  }

  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return NextResponse.json({ error: 'תפקיד לא חוקי' }, { status: 400 });
  }

  // 1. Create auth user (email already confirmed for internal app)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { display_name: displayName },
    email_confirm: true,
  });

  if (authError) {
    const msg =
      authError.message === 'User already registered'
        ? 'משתמש עם אימייל זה כבר קיים'
        : authError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // 2. Insert public profile row
  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    email,
    display_name: displayName,
    role,
    is_active: true,
    created_at: new Date().toISOString(),
  });

  if (profileError) {
    // Rollback: delete the auth user we just created
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, uid: authData.user.id });
}
