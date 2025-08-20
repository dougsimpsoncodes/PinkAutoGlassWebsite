export default function TailwindTest() {
  return (
    <main className="min-h-screen bg-gradient-primary text-white flex items-center justify-center p-8">
      <div className="max-w-xl w-full rounded-2xl shadow-xl bg-white/10 backdrop-blur border border-white/20 p-8">
        <h1 className="text-4xl font-bold">Tailwind OK</h1>
        <p className="mt-2 text-white/80">If you see a gradient background and this rounded card, Tailwind compiled.</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="h-12 rounded-lg bg-brand-pink" />
          <div className="h-12 rounded-lg bg-brand-navy" />
          <div className="h-12 rounded-lg bg-white/20" />
        </div>
        <a href="/" className="mt-8 inline-flex items-center rounded-lg bg-white text-black px-4 py-2 font-semibold hover:bg-white/90">Back Home</a>
      </div>
    </main>
  );
}
