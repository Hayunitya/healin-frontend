import Image from "next/image";

const features = [
  {
    title: "Chat Anonim",
    desc: "Berbagi cerita tanpa khawatir identitas Anda terbuka.",
    image: "/images/hero/anonim.jpg",
  },
  {
    title: "Counselor Profesional",
    desc: "Terhubung dengan counselor terlatih yang siap mendengarkan.",
    image: "/images/hero/profesional.png",
  },
  {
    title: "Deteksi Risiko",
    desc: "Sistem otomatis mendeteksi kata sensitif untuk bantuan segera.",
    image: "/images/hero/deteksi.jpg",
  },
  {
    title: "Privasi Terjamin",
    desc: "Data Anda aman. Kami tidak menyimpan isi percakapan.",
    image: "/images/hero/privasi.png",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Fitur Unggulan</h2>
          <p className="mt-4 text-lg text-gray-500">
            Platform yang dirancang untuk kenyamanan dan keamanan pengguna
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative mb-6 h-52 overflow-hidden rounded-2xl">
                <Image src={feature.image} alt={feature.title} fill className="object-cover" />
              </div>

              <h3 className="text-2xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-4 leading-relaxed text-gray-500">{feature.desc}</p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
