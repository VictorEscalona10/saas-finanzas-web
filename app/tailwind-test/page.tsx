import Link from "next/link";

export default function TailwindTest() {
  return (
    <div className="min-h-screen p-8 bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b pb-4">
          <h1 className="text-3xl font-bold text-finance-primary">Tailwind CSS v4 Verification</h1>
          <p className="text-muted-foreground mt-2">Checking custom theme colors and utility classes.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-4">Finance Theme Colors</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-finance-primary"></div>
                <span>Primary (Emerald)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-finance-secondary"></div>
                <span>Secondary (Sky)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-finance-accent"></div>
                <span>Accent (Amber)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-4">Status Colors</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-success">
                <div className="w-8 h-8 rounded bg-success"></div>
                <span>Success Status</span>
              </div>
              <div className="flex items-center gap-3 text-danger">
                <div className="w-8 h-8 rounded bg-danger"></div>
                <span>Danger Status</span>
              </div>
            </div>
          </div>
        </section>

        <section className="p-8 rounded-2xl bg-zinc-900 text-white flex flex-col items-center text-center space-y-4">
          <h2 className="text-2xl font-bold">Dark Mode and Modern UI</h2>
          <p className="max-w-lg opacity-80">
            If you see this box with rounded corners, a dark background, and emerald button, Tailwind 4 is working perfectly!
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-finance-primary hover:bg-finance-primary/90 rounded-lg font-medium transition-colors">
              Working!
            </button>
            <Link href="/" className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors">
              Go Home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
