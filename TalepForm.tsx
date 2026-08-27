'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Satir = {
  sku: string
  urun_adi: string
  miktar: string
  birim: string
}

const bosSatir = (): Satir => ({ sku: '', urun_adi: '', miktar: '', birim: 'ADET' })

export default function TalepForm() {
  const router = useRouter()
  const supabase = createClient()

  const [birim, setBirim] = useState('')
  const [istasyon, setIstasyon] = useState('')
  const [terminTarihi, setTerminTarihi] = useState('')
  const [satirlar, setSatirlar] = useState<Satir[]>([bosSatir()])
  const [hata, setHata] = useState<string | null>(null)
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [basarili, setBasarili] = useState(false)

  const satirGuncelle = (index: number, alan: keyof Satir, deger: string) => {
    setSatirlar((mevcut) =>
      mevcut.map((s, i) => (i === index ? { ...s, [alan]: deger } : s))
    )
  }

  const satirEkle = () => setSatirlar((mevcut) => [...mevcut, bosSatir()])
  const satirSil = (index: number) =>
    setSatirlar((mevcut) => mevcut.filter((_, i) => i !== index))

  const gonder = async () => {
    setHata(null)
    setBasarili(false)

    const gecerliSatirlar = satirlar.filter((s) => s.sku.trim() && Number(s.miktar) > 0)
    if (!birim.trim()) {
      setHata('Birim alanı zorunlu.')
      return
    }
    if (gecerliSatirlar.length === 0) {
      setHata('En az bir satırda SKU ve miktar girmelisin.')
      return
    }

    setGonderiliyor(true)
    const { error } = await supabase.rpc('talep_olustur', {
      p_birim: birim,
      p_istasyon: istasyon || null,
      p_termin_tarihi: terminTarihi || null,
      p_satirlar: gecerliSatirlar.map((s) => ({
        sku: s.sku.trim().toUpperCase(),
        urun_adi: s.urun_adi.trim() || null,
        miktar: Number(s.miktar),
        birim: s.birim || 'ADET',
      })),
    })
    setGonderiliyor(false)

    if (error) {
      setHata(error.message)
      return
    }

    setBasarili(true)
    setBirim('')
    setIstasyon('')
    setTerminTarihi('')
    setSatirlar([bosSatir()])
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Birim *</label>
          <input
            value={birim}
            onChange={(e) => setBirim(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            placeholder="Örn: Üretim Hattı 2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">İstasyon/Makine</label>
          <input
            value={istasyon}
            onChange={(e) => setIstasyon(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            placeholder="Opsiyonel"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Termin Tarihi</label>
          <input
            type="date"
            value={terminTarihi}
            onChange={(e) => setTerminTarihi(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-2 text-sm font-medium text-slate-700">Malzeme Satırları</div>
      <div className="space-y-2">
        {satirlar.map((s, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              value={s.sku}
              onChange={(e) => satirGuncelle(i, 'sku', e.target.value)}
              placeholder="SKU"
              className="col-span-3 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
            <input
              value={s.urun_adi}
              onChange={(e) => satirGuncelle(i, 'urun_adi', e.target.value)}
              placeholder="Ürün Adı"
              className="col-span-4 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
            <input
              value={s.miktar}
              onChange={(e) => satirGuncelle(i, 'miktar', e.target.value)}
              placeholder="Miktar"
              type="number"
              min="0"
              step="0.01"
              className="col-span-2 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
            <input
              value={s.birim}
              onChange={(e) => satirGuncelle(i, 'birim', e.target.value)}
              placeholder="Birim"
              className="col-span-2 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => satirSil(i)}
              disabled={satirlar.length === 1}
              className="col-span-1 rounded-lg border border-slate-200 text-sm text-red-500 hover:bg-red-50 disabled:opacity-30"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={satirEkle}
        className="mt-3 text-sm font-medium text-teal-600 hover:underline"
      >
        + Satır Ekle
      </button>

      {hata && <p className="mt-4 text-sm text-red-600">⚠️ {hata}</p>}
      {basarili && <p className="mt-4 text-sm text-teal-600">✅ Talep oluşturuldu.</p>}

      <button
        type="button"
        onClick={gonder}
        disabled={gonderiliyor}
        className="mt-6 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
      >
        {gonderiliyor ? 'Gönderiliyor…' : 'Talebi Oluştur'}
      </button>
    </div>
  )
}
