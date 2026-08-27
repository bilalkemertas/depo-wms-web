import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Sunucuda (Server Component / Server Action) çalışan Supabase istemcisi.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component içinden çağrıldıysa göz ardı edilebilir —
            // proxy.ts oturumu zaten tazeliyor.
          }
        },
      },
    }
  )
}
