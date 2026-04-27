export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#dfe9f7] via-[#edf3fb] to-white px-6 py-28 text-center md:py-40">
      {/* glow background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-7xl">
          Your Voice,
          <br />
          <span className="text-blue-500">
            Anonymously Heard
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-2xl">
          Connect with compassionate peer counselors who understand
          what you are going through.
        </p>

        <p className="mt-8 text-lg font-semibold text-gray-900 md:text-xl">
          Completely anonymous. Completely safe.
        </p>
      </div>
    </section>
  );
}