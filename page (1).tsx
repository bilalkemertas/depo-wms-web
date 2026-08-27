import Link from 'next/link'

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ mesaj?: string }>
}) {
  const { mesaj } = await searchParams

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-lg font-semibold text-red-600">Bir sorun oluştu</p>
      <p className="text-sm text-slate-600">{mesaj ?? 'Beklenmeyen bir hata meydana geldi.'}</p>
      <Link href="/login" className="mt-2 text-sm font-medium text-teal-600 hover:underline">
        Giriş ekranına dön
      </Link>
    </div>
  )
}
