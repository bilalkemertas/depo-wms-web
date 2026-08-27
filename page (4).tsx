import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4">
      <form
        action={login}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-bold text-slate-900">BRN Depo WMS</h1>
        <p className="mb-6 text-sm text-slate-500">Sisteme giriş yap</p>

        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
          placeholder="ad.soyad@brn.com.tr"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mb-6 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
          placeholder="••••••••"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Giriş Yap
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Hesabın yoksa depo yöneticinden hesap açmasını iste.
        </p>
      </form>
    </div>
  )
}
