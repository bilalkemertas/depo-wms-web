'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type FarkOnay = {
  id: number
  sayim_satiri_id: number
  sayim_emri_no: string
  malzeme_kodu: string
  malzeme_adi: string
  sistem_miktari: number
  sayilan_miktari: number
  fark: number
  fark_orani: number
  durum: string
  onaylayan: string | null
  onay_tarihi: string | null
  not: string | null
}

export default function SayimOnayPage() {
  const supabase = createClient()
  const [onayPendingler, setOnayPendingler] = useState<FarkOnay[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)
  const [secilenId, setSecilenId] = useState<number | null>(null)
  const [not, setNot] = useState('')
  const [secimKumesi, setSecimKumesi] = useState<Set<number>>(new Set())

  const veriYukle = useCallback(async () => {
    setYukleniyor(true)
    setHata(null)

    const { data, error } = await supabase
      .from('sayim_satirlari')
      .select(`
        id,
        sayim_emri_id,
        sayim_emirleri(sayim_emri_no),
        malzeme_kodu,
        malzeme_adi,
        ihtiyac_miktari,
        sayilan_miktar,
        fark,
        durum
      `)
      .in('durum', ['onaylandi', 'reddedildi'])
      .order('id', { ascending: false })

    if (error) {
      setHata(error.message)
      setOnayPendingler([])
    } else {
      const tipliVeriler = (data as any[]).map((item: any) => ({
        id: item.id,
        sayim_satiri_id: item.id,
        sayim_emri_no: item.sayim_emirleri?.sayim_emri_no || '',
        malzeme_kodu: item.malzeme_kodu,
        malzeme_adi: item.malzeme_adi,
        sistem_miktari: item.ihtiyac_miktari,
        sayilan_miktari: item.sayilan_miktar || 0,
        fark: item.fark,
        fark_orani: item.ihtiyac_miktari > 0 ? ((item.fark / item.ihtiyac_miktari) * 100).toFixed(1) : 0,
        durum: item.durum,
        onaylayan: null,
        onay_tarihi: null,
        not: null,
      }))
      setOnayPendingler(tipliVeriler)
    }
    setYukleniyor(false)
  }, [supabase])

  useEffect(() => {
    veriYukle()
  }, [veriYukle])

  const onayKanunu = async (satirId: number, onaylandimi: boolean, notlar: string) => {
    const { error } = await supabase
      .from('sayim_satirlari')
      .update({
        durum: onaylandimi ? 'onaylandi' : 'reddedildi',
        onaylayan: 'Yönetici',
        onay_tarihi: new Date().toISOString(),
        onay_notu: notlar,
      })
      .eq('id', satirId)

    if (error) {
      setHata(error.message)
    } else {
      setOnayPendingler(onayPendingler.filter((o) => o.id !== satirId))
      setSecilenId(null)
      setNot('')
    }
  }

  const farkRengi = (fark: number) => {
    if (fark > 0) return 'bg-orange-100 text-orange-700'
    if (fark < 0) return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-700'
  }

  const toplamKabul = onayPendingler.filter((o) => o.durum === 'onaylandi').length
  const toplamRed = onayPendingler.filter((o) => o.durum === 'reddedildi').length
  const toplamBekliyor = onayPendingler.filter((o) => o.durum !== 'onaylandi' && o.durum !== 'reddedildi').length

  if (yukleniyor) return <p className="text-sm text-slate-500">Yükleniyor…</p>

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">✅ Fark Onayı</h1>
        <p className="text-sm text-slate-500">Sistem ve sayılan miktar arasındaki farklılıkları incele ve onayla.</p>
      </div>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">⚠️ {hata}</p>
      )}

      {/* KPI Kartları */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-600">Toplam Kayıt</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{onayPendingler.length}</div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs text-blue-600">Beklemede</div>
          <div className="mt-1 text-2xl font-bold text-blue-700">{toplamBekliyor}</div>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="text-xs text-green-600">Onaylanan</div>
          <div className="mt-1 text-2xl font-bold text-green-700">{toplamKabul}</div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-xs text-red-600">Reddedilen</div>
          <div className="mt-1 text-2xl font-bold text-red-700">{toplamRed}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Onay Listesi */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Kayıtlar</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {onayPendingler.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSecilenId(o.id)
                  setNot('')
                }}
                className={`w-full text-left rounded-lg p-2 text-xs transition ${
                  secilenId === o.id ? 'bg-teal-100 border-teal-300' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold text-slate-900">{o.sayim_emri_no}</div>
                <div className="text-slate-600">{o.malzeme_adi}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Fark: {o.fark > 0 ? '+' : ''}{o.fark} ({o.fark_orani}%)
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Onay Detayı */}
        {secilenId !== null && onayPendingler.find((o) => o.id === secilenId) ? (
          <div className="col-span-2 space-y-4">
            {(() => {
              const secili = onayPendingler.find((o) => o.id === secilenId)!
              return (
                <>
                  {/* Detay Kartı */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <h3 className="mb-4 text-sm font-semibold text-slate-700">İnceleme Detayı</h3>
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-600">Emir No</label>
                          <div className="mt-1 font-semibold text-slate-900">{secili.sayim_emri_no}</div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Malzeme Kodu</label>
                          <div className="mt-1 font-semibold text-slate-900">{secili.malzeme_kodu}</div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Malzeme Adı</label>
                          <div className="mt-1 font-semibold text-slate-900">{secili.malzeme_adi}</div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Sistem Miktarı</label>
                          <div className="mt-1 font-semibold text-slate-900">{secili.sistem_miktari}</div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Sayılan Miktar</label>
                          <div className="mt-1 font-semibold text-slate-900">{secili.sayilan_miktari}</div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Fark</label>
                          <div className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold inline-block ${farkRengi(secili.fark)}`}>
                            {secili.fark > 0 ? '+' : ''}{secili.fark}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Onay Formu */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <h3 className="mb-4 text-sm font-semibold text-slate-700">Karar Ver</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Açıklama/Not</label>
                        <textarea
                          value={not}
                          onChange={(e) => setNot(e.target.value)}
                          placeholder="Onay kararı hakkında açıklama..."
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onayKanunu(secili.id, true, not)}
                          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          ✓ Onayla
                        </button>
                        <button
                          onClick={() => onayKanunu(secili.id, false, not)}
                          className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          ✕ Reddet
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        ) : (
          <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-500">Kayıt seç ve karar ver</p>
          </div>
        )}
      </div>
    </div>
  )
}
