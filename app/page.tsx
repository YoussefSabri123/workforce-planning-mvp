export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
        <div className="inline-flex w-fit rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
          Workforce Planning MVP
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          AI Workforce Planning Platform
        </h1>

        <p className="max-w-3xl text-lg text-slate-600">
          This is the starting point for the Workforce Planning module.
          We will build project creation, strategic inputs, workforce supply,
          future demand, gap analysis, and scenario planning step by step.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Projects</h2>
            <p className="mt-2 text-sm text-slate-600">
              Create and manage workforce planning projects.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Strategic Inputs</h2>
            <p className="mt-2 text-sm text-slate-600">
              Define growth, transformation, automation, and outsourcing assumptions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Scenario Planning</h2>
            <p className="mt-2 text-sm text-slate-600">
              Compare future workforce demand under multiple planning scenarios.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}