import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import { Database } from "@/src/types/database.types";

/**
 * Server-side Supabase client for RSC/layouts/route handlers.
 * Next.js 15+: cookies() is async — await it here, and expose sync get/set/remove to Supabase.
 */
export async function createClient() {
  const cookieStore = await nextCookies(); // unwrap the Promise

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // In server components this may be read-only; ignore failures.
          try {
            // Next >=15 supports (name, value, options)
            cookieStore.set(name, value, options as any);
          } catch {
            /* no-op */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...(options as any), maxAge: 0 });
          } catch {
            /* no-op */
          }
        },
      },
    }
  );
}
