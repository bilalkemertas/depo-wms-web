# BRN Depo WMS — Web (Faz 1)

Talep + iş emri akışının web arayüzü. Next.js (App Router) + Supabase.

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

`http://localhost:3000` adresini aç. `.env.local` içinde Supabase bağlantı bilgileri zaten dolu (proje: `puvevqydesacaxboevlr`).

## İlk kullanıcıyı oluşturma

Şu an genel kayıt (signup) ekranı **yok** — bu bilinçli bir tercih, çünkü bir depo/ERP uygulamasında herkesin kendi kendine hesap açması istenmez. İlk kullanıcıyı Supabase Dashboard'dan oluştur:

1. Dashboard → Authentication → Users → **Add user** (e-posta + şifre gir, "Auto Confirm User" işaretli olsun).
2. Kullanıcı oluşunca `profiller` tablosunda otomatik bir satır açılır (varsayılan rol: `depo_personeli`).
3. Rolü değiştirmek istersen: Dashboard → Table Editor → `profiller` → ilgili satırda `rol` sütununu `admin`, `depo_ekip_lideri`, `depo_personeli` veya `talep_eden` yap.
4. Bu bilgilerle `/login` ekranından giriş yap.

## Neler var

- `/login` — Supabase Auth ile giriş (Server Action)
- `/` — özet ekran
- `/talep` — yeni talep oluşturma (birim, istasyon, termin + çok satırlı malzeme listesi)
- `/is-emirleri` — açık talepleri listeler, "İş Emri Oluştur" ile talebi iş emrine çevirir, son iş emirlerini gösterir
- PWA: `manifest.webmanifest` hazır — telefonda tarayıcıdan "Ana Ekrana Ekle" ile kurulabilir. Mağaza (Play Store/App Store) paketlemesi (Capacitor) sonraki adımda eklenecek.

## Mimari notu

Ayrı bir backend sunucusu yok. İş kuralları (`talep_olustur`, `is_emri_olustur`, `is_emri_satiri_hazirla`) Supabase içinde Postgres fonksiyonu (RPC) olarak çalışıyor — bkz. proje dokümanındaki `wms_faz1_rpc.sql`. Sayfalar bu fonksiyonları `supabase.rpc(...)` ile çağırıyor.

## Online yayınlama (deploy)

En hızlı yol Vercel:

```bash
npm i -g vercel
vercel
```

Vercel'de proje ayarlarına `.env.local` içindeki iki değişkeni (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) ekle. Deploy sonrası verilen URL, hem bilgisayardan hem telefondan (PWA olarak kurulabilir şekilde) erişilebilir olacak.

## Sırada ne var

- Mobil/PWA hazırlama ekranı (kamera ile barkod okuma, `is_emri_satiri_hazirla` RPC'sini çağıracak)
- Supabase Realtime ile anlık bildirim
- Capacitor ile Android/iOS mağaza paketi
