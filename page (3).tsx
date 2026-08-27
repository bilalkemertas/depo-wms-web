import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const { data: profil } = user
    ? await supabase.from('profiller').select('ad_soyad').eq('id', user.sub).single()
    : { data: null }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">
        Merhaba, {profil?.ad_soyad ?? 'kullanıcı'} 👋
      </h1>
      <p className="mb-8 text-sm text-slate-500">Ne yapmak istiyorsun?</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/talep"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-500 hover:shadow-md"
        >
          <div className="mb-2 text-3xl">📋</div>
          <div className="font-semibold text-slate-900">Talep Oluştur</div>
          <div className="mt-1 text-sm text-slate-500">
            Biriminiz için depodan malzeme talebi açın.
          </div>
        </Link>

        <Link
          href="/is-emirleri"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-500 hover:shadow-md"
        >
          <div className="mb-2 text-3xl">🏗️</div>
          <div className="font-semibold text-slate-900">İş Emirleri</div>
          <div className="mt-1 text-sm text-slate-500">
            Açık talepleri iş emrine dönüştürün, hazırlığı yönetin.
          </div>
        </Link>
      </div>
    </div>
  )
}
