'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type TalepSatiri = {
  id: number
  sku: string
  urun_adi: string | null
  miktar: number
  karsilanan_miktar: number
  birim: string | null
}

type Talep = {
  id: number
  birim: string
  istasyon: string | null
  termin_tarihi: string | null
  durum: string
  created_at: string
  talep_satirlari: TalepSatiri[]
}

type IsEmri = {
  id: number
  durum: string
  created_at: string
  talepler: { birim: string } | null
  is_emri_satirlari: { id: number }[]
}

export default function IsEmirleriPaneli() {
  const supabase = createClient()
  const [talepler, setTalepler] = useState<Talep[]>([])
  const [isEmirleri, setIsEmirleri] = useState<IsEmri[]>([])
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null)
  const [olusturuluyorId, setOlusturuluyorId] = useState<number | null>(null)

  const veriYukle = useCallback(async () => {
    setYukleniyor(true)
    setHata(null)

    const [talepSonuc, isEmriSonuc] = await Promise.all([
      supabase
        .from('talepler')
        .select('id, birim, istasyon, termin_tarihi, durum, created_at, talep_satirlari(id, sku, urun_adi, miktar, karsilanan_miktar, birim)')
        .in('durum', ['acik', 'kismi'])
        .order('created_at', { ascending: false }),
      supabase
        .from('is_emirleri')
        .select('id, durum, created_at, talepler(birim), is_emri_satirlari(id)')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (talepSonuc.error) setHata(talepSonuc.error.message)
    else setTalepler(talepSonuc.data as unknown as Talep[])

    if (isEmriSonuc.error) setHata((h) => h ?? isEmriSonuc.error.message)
    else setIsEmirleri(isEmriSonuc.data as unknown as IsEmri[])

    setYukleniyor(false)
  }, [supabase])

  useEffect(() => {
    // Sayfa açılışında verileri sunucudan çek. Bu, dış sistemden (Supabase)
    // veri senkronize eden kasıtlı bir efekt — lint kuralı state-değişim
    // sıklığı için genel bir uyarı veriyor, burada beklenen davranış bu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    veriYukle()
  }, [veriYukle])

  const isEmriOlustur = async (talepId: number) => {
    setOlusturuluyorId(talepId)
    const { error } = await supabase.rpc('is_emri_olustur', { p_talep_id: talepId })
    setOlusturuluyorId(null)
    if (error) {
      setHata(error.message)
      return
    }
    veriYukle()
  }

  if (yukleniyor) return <p className="text-sm text-slate-500">Yükleniyor…</p>

  return (
    <div className="space-y-8">
      {hata && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">⚠️ {hata}</p>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Açık Talepler</h2>
          <button onClick={veriYukle} className="text-xs text-teal-600 hover:underline">
            🔄 Yenile
          </button>
        </div>

        {talepler.length === 0 && (
          <p className="text-sm text-slate-400">Açık talep yok.</p>
        )}

        <div className="space-y-3">
          {talepler.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900">{t.birim}</span>
                  {t.istasyon && <span className="ml-2 text-sm text-slate-500">· {t.istasyon}</span>}
                  {t.termin_tarihi && (
                    <span className="ml-2 text-xs text-slate-400">Termin: {t.termin_tarihi}</span>
                  )}
                </div>
                <button
                  onClick={() => isEmriOlustur(t.id)}
                  disabled={olusturuluyorId === t.id}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {olusturuluyorId === t.id ? 'Oluşturuluyor…' : '🚀 İş Emri Oluştur'}
                </button>
              </div>
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-1 pr-2">SKU</th>
                    <th className="py-1 pr-2">Ürün</th>
                    <th className="py-1 pr-2">İstenen</th>
                    <th className="py-1 pr-2">Karşılanan</th>
                  </tr>
                </thead>
                <tbody>
                  {t.talep_satirlari?.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="py-1 pr-2 font-mono">{s.sku}</td>
                      <td className="py-1 pr-2">{s.urun_adi}</td>
                      <td className="py-1 pr-2">{s.miktar} {s.birim}</td>
                      <td className="py-1 pr-2">{s.karsilanan_miktar} {s.birim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Son İş Emirleri</h2>
        {isEmirleri.length === 0 && (
          <p className="text-sm text-slate-400">Henüz iş emri yok.</p>
        )}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Birim</th>
                <th className="px-4 py-2">Durum</th>
                <th className="px-4 py-2">Hazırlanan Satır</th>
                <th className="px-4 py-2">Oluşturma</th>
              </tr>
            </thead>
            <tbody>
              {isEmirleri.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-mono">{e.id}</td>
                  <td className="px-4 py-2">{e.talepler?.birim}</td>
                  <td className="px-4 py-2">{e.durum}</td>
                  <td className="px-4 py-2">{e.is_emri_satirlari?.length ?? 0}</td>
                  <td className="px-4 py-2 text-xs text-slate-400">
                    {new Date(e.created_at).toLocaleString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
