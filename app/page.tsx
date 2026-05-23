"use client";

export default function HomePage() {
  const goToProjects = () => {
    window.location.href = "/projects";
  };

  const goToNewProject = () => {
    window.location.href = "/projects/new";
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-950 text-white">
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/70">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                Workforce Planning MVP
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                WorkforceNexus AI
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                A modern AI workspace for workforce planning — create projects,
                define strategic assumptions, capture workforce supply, forecast
                future demand, review gaps, compare scenarios, and monitor key metrics.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={goToProjects}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg transition hover:bg-cyan-300"
                >
                  Open Projects
                </button>

                <button
                  type="button"
                  onClick={goToNewProject}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Create New Project
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-cyan-300">Projects</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Create and manage workforce planning workspaces.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-cyan-300">Strategic Inputs</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Save growth, transformation, automation, and outsourcing assumptions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-cyan-300">Workforce Supply</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Capture current workforce rows, load saved entries, and manage updates.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-cyan-300">Analysis</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Review future demand, gaps, scenarios, and dashboard summary metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
              Workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Current Workforce Planning Flow
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
              Follow a clear process: create a project, define strategic inputs,
              capture current workforce supply, define future demand, review gaps,
              compare scenarios, and track summary metrics.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white">1. Create Project</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Start with company context, planning horizon, business units, and currency.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white">2. Strategic Inputs</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Define growth, transformation, automation, outsourcing, and productivity assumptions.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white">3. Current Workforce</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Capture workforce supply rows including headcount, attrition, productivity, and cost.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white">4. Future Demand</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Define future role requirements, operating model, and leadership demand.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white">5. Gap Analysis</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Compare supply against demand and estimate workforce and leadership gaps.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white">6. Scenario Planning</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Compare multiple scenarios and review their impact on workforce needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
