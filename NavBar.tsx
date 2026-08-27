import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cikisYap } from '@/app/login/actions'

const ROL_ETIKET: Record<string, string> = {
  admin: '👑 Admin',
  depo_ekip_lideri: '🧭 Depo Ekip Lideri',
  depo_personeli: '🧑‍🔧 Depo Personeli',
  talep_eden: '📋 Talep Eden',
}

export default async function NavBar() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) return null

  const { data: profil } = await supabase
    .from('profiller')
    .select('ad_soyad, rol')
    .eq('id', user.sub)
    .single()

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 bg-[#0b3c5d] px-4 py-3 text-white">
      <Link href="/" className="text-sm font-bold tracking-wide">
        🏢 BRN Depo WMS
      </Link>
      <nav className="flex gap-4 text-xs font-medium sm:text-sm">
        <Link href="/talep" className="hover:text-teal-300">
          Talep Oluştur
        </Link>
        <Link href="/is-emirleri" className="hover:text-teal-300">
          İş Emirleri
        </Link>
      </nav>
      <div className="flex items-center gap-3 text-xs">
        <div className="text-right leading-tight">
          <div className="font-semibold">{profil?.ad_soyad ?? user.email}</div>
          <div className="opacity-75">{ROL_ETIKET[profil?.rol as string] ?? profil?.rol}</div>
        </div>
        <form action={cikisYap}>
          <button
            type="submit"
            className="rounded-md border border-white/30 px-2 py-1 text-xs hover:bg-white/10"
          >
            Çıkış
          </button>
        </form>
      </div>
    </header>
  )
}
