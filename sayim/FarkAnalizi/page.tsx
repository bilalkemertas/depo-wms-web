'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type FarkAnaliz = {
  id: number
  sayim_emri_id: number
  sayim_emri_no: string
  malzeme_kodu: string
  malzeme_adi: string
  ihtiyac_miktari: number
  sayilan_miktar: number
  fark: number
  fark_orani: number
  durum: string
  depo: string
}

export default function FarkAnaliziPage() {
  const supabase = createClient()
  const [farklar, setFarklar] = useState<FarkAnaliz[]>([])
  const [filtreliFarklar, setFiltreliFarklar] = useState<FarkAnaliz[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)
  const [secilenSatirlar, setSecilenSatirlar] = useState<Set<number>>(new Set())
  const [filtre, setFiltre] = useState({
    turu: 'tumu', // tumu, fazla, eksik
    depo: 'tumu',
  })

  const veriYukle = useCallback(async () => {
    setYukleniyor(true)
    setHata(null)

    const { data, error } = await supabase
      .from('sayim_satirlari')
      .select(`
        id,
        sayim_emri_id,
        sayim_emirleri(sayim_emri_no, depo),
        malzeme_kodu,
        malzeme_adi,
        ihtiyac_miktari,
        sayilan_miktar,
        fark,
        durum
      `)
      .not('fark', 'is', null)
      .neq('fark', 0)

    if (error) {
      setHata(error.message)
      setFarklar([])
    } else {
      const tipliFarklar = (data as any[]).map((item: any) => ({
        id: item.id,
        sayim_emri_id: item.sayim_emri_id,
        sayim_emri_no: item.sayim_emirleri?.sayim_emri_no || '',
        malzeme_kodu: item.malzeme_kodu,
        malzeme_adi: item.malzeme_adi,
        ihtiyac_miktari: item.ihtiyac_miktari,
        sayilan_miktar: item.sayilan_miktar || 0,
        fark: item.fark,
        fark_orani: item.ihtiyac_miktari > 0 ? ((item.fark / item.ihtiyac_miktari) * 100).toFixed(1) : 0,
        durum: item.durum,
        depo: item.sayim_emirleri?.depo || '',
      }))
      setFarklar(tipliFarklar)
    }
    setYukleniyor(false)
  }, [supabase])

  useEffect(() => {
    veriYukle()
  }, [veriYukle])

  useEffect(() => {
    let sonuc = farklar
    if (filtre.turu !== 'tumu') {
      sonuc = sonuc.filter((f) => (filtre.turu === 'fazla' ? f.fark > 0 : f.fark < 0))
    }
    if (filtre.depo !== 'tumu') {
      sonuc = sonuc.filter((f) => f.depo === filtre.depo)
    }
    setFiltreliFarklar(sonuc)
  }, [farklar, filtre])

  const farkRengi = (fark: number) => {
    if (fark > 0) return 'bg-orange-100 text-orange-700'
    if (fark < 0) return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-700'
  }

  const tumunuSec = () => {
    setSecilenSatirlar(new Set(filtreliFarklar.map((f) => f.id)))
  }

  const secimKaldir = () => {
    setSecilenSatirlar(new Set())
  }

  const satirSeci = (id: number) => {
    const yeni = new Set(secilenSatirlar)
    if (yeni.has(id)) {
      yeni.delete(id)
    } else {
      yeni.add(id)
    }
    setSecilenSatirlar(yeni)
  }

  const farkMutabakat = async (satirId: number, onaylandimi: boolean) => {
    const { error } = await supabase
      .from('sayim_satirlari')
      .update({
        durum: onaylandimi ? 'onaylandi' : 'reddedildi',
      })
      .eq('id', satirId)

    if (error) {
      setHata(error.message)
    } else {
      setFarklar(farklar.map((f) => (f.id === satirId ? { ...f, durum: onaylandimi ? 'onaylandi' : 'reddedildi' } : f)))
    }
  }

  if (yukleniyor) return <p className="text-sm text-slate-500">Yükleniyor…</p>

  const toplamFark = filtreliFarklar.reduce((sum, f) => sum + Math.abs(f.fark), 0)
  const fazlaBirlikler = filtreliFarklar.filter((f) => f.fark > 0).length
  const eksisBirlikler = filtreliFarklar.filter((f) => f.fark < 0).length

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">📊 Sayım Farkları Analizi</h1>
        <p className="text-sm text-slate-500">Sistem ve sayılan miktarlar arasındaki farklılıkları incele ve onayla.</p>
      </div>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">⚠️ {hata}</p>
      )}

      {/* KPI Kartları */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-600">Toplam Fark</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{toplamFark}</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="text-xs text-orange-600">Fazla</div>
          <div className="mt-1 text-2xl font-bold text-orange-700">{fazlaBirlikler}</div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-xs text-red-600">Eksik</div>
          <div className="mt-1 text-2xl font-bold text-red-700">{eksisBirlikler}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-600">Toplam Kayıt</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{filtreliFarklar.length}</div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fark Türü</label>
            <select
              value={filtre.turu}
              onChange={(e) => setFiltre({ ...filtre, turu: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="tumu">Tümü</option>
              <option value="fazla">Fazla</option>
              <option value="eksik">Eksik</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Depo</label>
            <select
              value={filtre.depo}
              onChange={(e) => setFiltre({ ...filtre, depo: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="tumu">Tümü</option>
              <option value="DP01">DP01</option>
              <option value="DP02">DP02</option>
              <option value="DP03">DP03</option>
            </select>
          </div>
          <div className="flex gap-2 pt-5">
            <button
              onClick={tumunuSec}
              className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
            >
              Tümünü Seç
            </button>
            <button
              onClick={secimKaldir}
              className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
            >
              Seçimi Kaldır
            </button>
          </div>
        </div>
      </div>

      {/* Farklar Tablosu */}
      {filtreliFarklar.length === 0 ? (
        <p className="text-center text-sm text-slate-400">Fark bulunamadı.</p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-slate-700 w-8">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700">Emir No</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Malzeme</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Sistem</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Sayılan</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Fark</th>
                <th className="px-4 py-2 font-semibold text-slate-700">%</th>
                <th className="px-4 py-2 font-semibold text-slate-700">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtreliFarklar.map((f) => (
                <tr key={f.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={secilenSatirlar.has(f.id)}
                      onChange={() => satirSeci(f.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-2 font-mono font-semibold text-slate-900">{f.sayim_emri_no}</td>
                  <td className="px-4 py-2">
                    <div className="font-semibold text-slate-900">{f.malzeme_adi}</div>
                    <div className="text-xs text-slate-600">{f.malzeme_kodu}</div>
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-900">{f.ihtiyac_miktari}</td>
                  <td className="px-4 py-2 font-semibold text-slate-900">{f.sayilan_miktar}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 font-semibold text-xs ${farkRengi(f.fark)}`}>
                      {f.fark > 0 ? '+' : ''}{f.fark}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-600">{f.fark_orani}%</td>
                  <td className="px-4 py-2 flex gap-1">
                    <button
                      onClick={() => farkMutabakat(f.id, true)}
                      disabled={f.durum === 'onaylandi'}
                      className="text-green-600 hover:underline text-xs font-medium disabled:text-slate-400"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => farkMutabakat(f.id, false)}
                      disabled={f.durum === 'reddedildi'}
                      className="text-red-600 hover:underline text-xs font-medium disabled:text-slate-400"
                    >
                      ✕
                    </button>
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
