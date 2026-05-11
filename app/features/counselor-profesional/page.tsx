import Link from "next/link";

export default function CounselorProfesionalFeaturePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#eef4ff] to-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
          ← Kembali ke Beranda
        </Link>

        <section className="mt-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-blue-700 text-4xl text-white shadow-lg">
            🧑‍⚕️
          </div>
          <h1 className="mt-5 text-5xl font-bold text-slate-900">Counselor Profesional</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Terhubung dengan counselor yang tepat berdasarkan keahlian, ketersediaan, dan kebutuhan
            topik konsultasi Anda.
          </p>
        </section>

        <section className="mt-10 space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Sistem Matching Otomatis</h2>
            <p className="mt-3 text-slate-600">
              Kami menggunakan sistem matching cerdas yang menghubungkan Anda dengan counselor yang
              paling sesuai berdasarkan:
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">Topik yang Dipilih</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Counselor dipilih berdasarkan keahlian mereka dalam topik yang Anda pilih.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">Ketersediaan</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Sistem menyocokkan dengan counselor yang sedang online dan siap membantu.
                </p>
              </div>
            </div>
            <p className="mt-4 text-slate-600">
              Proses matching biasanya hanya memakan waktu <b>beberapa detik hingga beberapa menit</b>.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Spesialisasi Counselor</h2>
            <p className="mt-3 text-slate-600">
              Counselor kami memiliki spesialisasi di berbagai topik untuk memastikan Anda mendapat
              dukungan yang tepat.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <TopicCard title="Burnout" className="from-orange-500 to-orange-400" />
              <TopicCard title="Relasi" className="from-pink-500 to-fuchsia-500" />
              <TopicCard title="Akademik" className="from-blue-600 to-blue-500" />
              <TopicCard title="Kecemasan" className="from-violet-600 to-purple-500" />
            </div>
          </article>
        </section>

        <section className="mt-10 rounded-3xl bg-linear-to-r from-[#e2f7ea] to-[#d4f0e1] p-8 text-center shadow-sm">
          <h3 className="text-4xl font-bold text-slate-900">Temui Counselor Anda Sekarang</h3>
          <p className="mt-3 text-slate-600">Mulai percakapan dengan counselor yang tepat untuk Anda.</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-emerald-500 px-10 py-3 text-lg font-semibold text-white transition hover:bg-emerald-600"
          >
            Mulai Sekarang
          </Link>
        </section>
      </div>
    </main>
  );
}

function TopicCard({ title, className }: { title: string; className: string }) {
  return (
    <div className={`rounded-2xl bg-linear-to-r p-4 text-white shadow-sm ${className}`}>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-white/90">Counselor terlatih khusus untuk topik ini</p>
    </div>
  );
}
