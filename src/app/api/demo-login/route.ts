import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? requestUrl.host;
  const protocol =
    request.headers.get('x-forwarded-proto') ?? requestUrl.protocol.slice(0, -1);
  if (origin !== `${protocol}://${host}`) {
    return NextResponse.json(
      { error: 'Demo sign-in requests must come from this application.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const demoEmail = process.env.SUPABASE_DEMO_EMAIL;
  const demoPassword = process.env.SUPABASE_DEMO_PASSWORD;

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured for demo sign-in.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (!demoEmail || !demoPassword) {
    return NextResponse.json(
      { error: 'Set the server-only SUPABASE_DEMO_EMAIL and SUPABASE_DEMO_PASSWORD to enable demo sign-in.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (error) {
    return NextResponse.json(
      { error: `Unable to sign in to the configured demo account: ${error.message}` },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!data.user) {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    return NextResponse.json(
      {
        error: signOutError
          ? `Supabase did not return the configured demo user, and the session could not be cleared: ${signOutError.message}`
          : 'Supabase did not return the configured demo user.',
      },
      { status: signOutError ? 500 : 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, is_seed')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    return NextResponse.json(
      {
        error: signOutError
          ? `Unable to verify the demo account permissions: ${profileError.message}. The session could not be cleared: ${signOutError.message}`
          : `Unable to verify the demo account permissions: ${profileError.message}`,
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (profile && (profile.role !== 'other_official' || profile.is_seed)) {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    return NextResponse.json(
      {
        error: signOutError
          ? `The configured demo account must have a non-seed other_official profile. The session could not be cleared: ${signOutError.message}`
          : 'The configured demo account must have a non-seed other_official profile.',
      },
      { status: signOutError ? 500 : 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
