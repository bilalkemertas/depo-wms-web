import TalepForm from './TalepForm'

export default function TalepPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">📋 Yeni Talep</h1>
      <p className="mb-6 text-sm text-slate-500">
        Hangi istasyon/hat için, hangi malzemeden ne kadar ihtiyacın var?
      </p>
      <TalepForm />
    </div>
  )
}
