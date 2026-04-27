export default function CTA() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[3rem] bg-linear-to-br from-[#74A2E8] to-[#8CB2EB] px-8 py-20 text-center shadow-[0_25px_60px_rgba(59,130,246,0.25)] md:px-16">
          
          <h2 className="text-4xl font-bold text-white md:text-6xl">
            Mulai Perjalananmu Sekarang
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-blue-50 md:text-2xl">
            Jangan biarkan beban terpendam. Mari berbagi dan
            temukan dukungan yang Anda butuhkan.
          </p>

          <button className="mt-12 rounded-full bg-white px-10 py-4 text-lg font-semibold text-blue-500 shadow-xl transition hover:scale-105 hover:bg-blue-50">
            Mulai Chat
          </button>
        </div>
      </div>
    </section>
  );
}