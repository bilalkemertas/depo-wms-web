'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type StokDuzeltme = {
  id: number
  sayim_satiri_id: number
  sayim_emri_no: string
  malzeme_kodu: string
  malzeme_adi: string
  eski_miktar: number
  yeni_miktar: number
  duzeltme_miktari: number
  neden: string
  belge_no: string
  durum: string
  olusturma_tarihi: string
  tamamlama_tarihi: string | null
}

export default function StokDuzeltmePage() {
  const supabase = createClient()
  const [duzeltmeler, setDuzeltmeler] = useState<StokDuzeltme[]>([])
  const [filtreliFarklar, setFiltreliFarklar] = useState<StokDuzeltme[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)
  const [filtre, setFiltre] = useState({
    durum: 'tumu', // tumu, bekliyor, isleniyor, tamamlandi
  })

  const veriYukle = useCallback(async () => {
    setYukleniyor(true)
    setHata(null)

    // Onaylanmış farklara dayalı stok düzeltmeleri yükle
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
      .eq('durum', 'onaylandi')
      .order('id', { ascending: false })

    if (error) {
      setHata(error.message)
      setDuzeltmeler([])
    } else {
      const tipliVeriler = (data as any[]).map((item: any, index: number) => ({
        id: item.id,
        sayim_satiri_id: item.id,
        sayim_emri_no: item.sayim_emirleri?.sayim_emri_no || '',
        malzeme_kodu: item.malzeme_kodu,
        malzeme_adi: item.malzeme_adi,
        eski_miktar: item.ihtiyac_miktari,
        yeni_miktar: item.sayilan_miktar || 0,
        duzeltme_miktari: item.fark,
        neden: `Fiziki sayım farkı`,
        belge_no: `STK-${new Date().getFullYear()}-${String(index + 1).padStart(5, '0')}`,
        durum: 'bekliyor',
        olusturma_tarihi: new Date().toISOString(),
        tamamlama_tarihi: null,
      }))
      setDuzeltmeler(tipliVeriler)
    }
    setYukleniyor(false)
  }, [supabase])

  useEffect(() => {
    veriYukle()
  }, [veriYukle])

  useEffect(() => {
    let sonuc = duzeltmeler
    if (filtre.durum !== 'tumu') {
      sonuc = sonuc.filter((d) => d.durum === filtre.durum)
    }
    setFiltreliFarklar(sonuc)
  }, [duzeltmeler, filtre])

  const duzeltmeIsle = async (duzeltmeId: number, yeniDurum: string) => {
    const { error } = await supabase
      .from('sayim_satirlari')
      .update({
        durum: 'duzeltildi',
      })
      .eq('id', duzeltmeId)

    if (error) {
      setHata(error.message)
    } else {
      setDuzeltmeler(
        duzeltmeler.map((d) =>
          d.id === duzeltmeId ? { ...d, durum: yeniDurum, tamamlama_tarihi: new Date().toISOString() } : d
        )
      )
    }
  }

  const durumRengi = (durum: string) => {
    const renkler: Record<string, string> = {
      'bekliyor': 'bg-slate-100 text-slate-700',
      'isleniyor': 'bg-blue-100 text-blue-700',
      'tamamlandi': 'bg-green-100 text-green-700',
    }
    return renkler[durum] || 'bg-slate-100 text-slate-700'
  }

  const duzeltmeRengi = (duzeltme: number) => {
    if (duzeltme > 0) return 'text-orange-600'
    if (duzeltme < 0) return 'text-red-600'
    return 'text-slate-600'
  }

  if (yukleniyor) return <p className="text-sm text-slate-500">Yükleniyor…</p>

  const beklemede = filtreliFarklar.filter((d) => d.durum === 'bekliyor').length
  const isleniyor = filtreliFarklar.filter((d) => d.durum === 'isleniyor').length
  const tamamlandi = filtreliFarklar.filter((d) => d.durum === 'tamamlandi').length
  const toplamDuzeltme = filtreliFarklar.reduce((sum, d) => sum + Math.abs(d.duzeltme_miktari), 0)

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">📝 Stok Düzeltme İşlemleri</h1>
        <p className="text-sm text-slate-500">Sayım farklarına dayalı stok düzeltme belgelerini oluştur ve işle.</p>
      </div>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">⚠️ {hata}</p>
      )}

      {/* KPI Kartları */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-600">Toplam Belge</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{filtreliFarklar.length}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-600">Beklemede</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{beklemede}</div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs text-blue-600">İşlemde</div>
          <div className="mt-1 text-2xl font-bold text-blue-700">{isleniyor}</div>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="text-xs text-green-600">Tamamlandı</div>
          <div className="mt-1 text-2xl font-bold text-green-700">{tamamlandi}</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="text-xs text-orange-600">Toplam Düzeltme</div>
          <div className="mt-1 text-2xl font-bold text-orange-700">{toplamDuzeltme}</div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Durum</label>
            <select
              value={filtre.durum}
              onChange={(e) => setFiltre({ ...filtre, durum: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="tumu">Tümü</option>
              <option value="bekliyor">Beklemede</option>
              <option value="isleniyor">İşlemde</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
          </div>
          <button
            onClick={veriYukle}
            className="rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Düzeltme Belgesi Tablosu */}
      {filtreliFarklar.length === 0 ? (
        <p className="text-center text-sm text-slate-400">Düzeltme belgesi bulunamadı.</p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-slate-700">Belge No</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Emir No</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Malzeme</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Eski</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Yeni</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Düzeltme</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Neden</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Durum</th>
                <th className="px-4 py-2 font-semibold text-slate-700">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtreliFarklar.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono font-semibold text-slate-900">{d.belge_no}</td>
                  <td className="px-4 py-2 font-mono text-slate-600">{d.sayim_emri_no}</td>
                  <td className="px-4 py-2">
                    <div className="font-semibold text-slate-900">{d.malzeme_adi}</div>
                    <div className="text-xs text-slate-600">{d.malzeme_kodu}</div>
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-900">{d.eski_miktar}</td>
                  <td className="px-4 py-2 font-semibold text-slate-900">{d.yeni_miktar}</td>
                  <td className={`px-4 py-2 font-semibold ${duzeltmeRengi(d.duzeltme_miktari)}`}>
                    {d.duzeltme_miktari > 0 ? '+' : ''}{d.duzeltme_miktari}
                  </td>
                  <td className="px-4 py-2 text-slate-600 max-w-xs truncate">{d.neden}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 font-semibold text-xs ${durumRengi(d.durum)}`}>
                      {d.durum}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {d.durum === 'bekliyor' && (
                      <button
                        onClick={() => duzeltmeIsle(d.id, 'isleniyor')}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        İşle →
                      </button>
                    )}
                    {d.durum === 'isleniyor' && (
                      <button
                        onClick={() => duzeltmeIsle(d.id, 'tamamlandi')}
                        className="text-green-600 hover:underline text-xs font-medium"
                      >
                        Tamamla ✓
                      </button>
                    )}
                    {d.durum === 'tamamlandi' && (
                      <span className="text-slate-400 text-xs">Tamamlandı</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
