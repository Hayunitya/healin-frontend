import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="bg-linear-to-b from-[#edf4ff] to-[#f8fbff] px-6 py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
        
        {/* text */}
        <div>
          <h2 className="text-5xl font-bold text-gray-900">
            Tentang Kami
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-relaxed text-gray-600">
            <p>
              <span className="font-semibold text-blue-500">
                Heal.in
              </span>{" "}
              adalah platform yang dirancang untuk menyediakan
              ruang aman bagi individu untuk berbagi cerita dan
              mendapatkan dukungan emosional secara anonim.
            </p>

            <p>
              Kami percaya bahwa setiap orang berhak mendapatkan
              dukungan mental tanpa takut dihakimi atau identitasnya
              terbuka.
            </p>

            <p>
              Dengan sistem privasi yang terjamin, kami membantu
              pengguna merasa aman dan nyaman saat berbagi cerita.
            </p>
          </div>
        </div>

        {/* image */}
        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-blue-200 blur-3xl opacity-30" />

          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
            <Image
              src="/images/about/about-image.png"
              alt="About Heal.in"
              width={700}
              height={500}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}