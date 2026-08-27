import IsEmirleriPaneli from './IsEmirleriPaneli'

export default function IsEmirleriPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">🏗️ İş Emirleri</h1>
      <p className="mb-6 text-sm text-slate-500">
        Açık talepleri iş emrine dönüştür, mevcut iş emirlerini takip et.
      </p>
      <IsEmirleriPaneli />
    </div>
  )
}
