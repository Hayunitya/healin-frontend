import Link from "next/link";

export default function ChatAnonimFeaturePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#eef4ff] to-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
          ← Kembali ke Beranda
        </Link>

        <section className="mt-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 text-4xl text-white shadow-lg">
            💬
          </div>
          <h1 className="mt-5 text-5xl font-bold text-slate-900">Chat Anonim</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Berbagi cerita tanpa khawatir identitas Anda terbuka. Privasi dan kenyamanan
            adalah prioritas utama kami.
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Identitas Anda Terlindungi</h2>
            <p className="mt-3 text-slate-600">
              Saat Anda mendaftar di Heal.in, sistem akan otomatis membuat anonymous handle unik
              untuk Anda. Handle ini adalah identitas sementara yang digunakan selama sesi konsultasi.
            </p>
            <p className="mt-3 text-slate-600">
              Counselor tidak akan pernah mengetahui nama asli, email, atau informasi pribadi Anda.
              Yang mereka lihat hanya anonymous handle seperti <span className="font-semibold">anon_user123</span>.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Bagaimana Sistem Menjaga Identitas Anda</h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>✔ Tidak ada nama asli: Anda hanya perlu username dan email untuk mendaftar.</li>
              <li>✔ Anonymous handle otomatis: Sistem generate handle unik yang tidak bisa dilacak.</li>
              <li>✔ Chat tidak ditampilkan ke publik: Counselor hanya melihat handle anonim Anda.</li>
              <li>✔ Enkripsi end-to-end: Semua percakapan dienkripsi untuk keamanan maksimal.</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Kenyamanan dalam Bercerita</h2>
            <p className="mt-3 text-slate-600">
              Dengan anonimitas yang terjamin, Anda bisa lebih terbuka dan jujur tentang perasaan Anda
              tanpa rasa takut dihakimi atau identitas Anda diketahui orang lain.
            </p>
            <p className="mt-3 text-slate-600">
              Ini menciptakan ruang aman di mana Anda bisa mengekspresikan emosi dengan bebas dan
              mendapatkan dukungan yang Anda butuhkan tanpa beban sosial.
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-3xl bg-linear-to-r from-[#eaf2ff] to-[#dbe8ff] p-8 text-center shadow-sm">
          <h3 className="text-4xl font-bold text-slate-900">Siap Memulai Percakapan?</h3>
          <p className="mt-3 text-slate-600">Mulai berbagi cerita Anda dengan aman dan nyaman.</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-blue-600 px-10 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Mulai Sekarang
          </Link>
        </section>
      </div>
    </main>
  );
}
