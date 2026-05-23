"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

type Project = {
  id: string;
  project_name: string;
  company_name: string;
};

type SupplyLine = {
  current_headcount: number;
  attrition_pct: number;
  cost_per_employee: number;
  current_ready_leaders: number;
};

type FutureRequirement = {
  future_leadership_demand: number;
};

type StrategicInputs = {
  growth_pct: number;
  transformation_pct: number;
  automation_pct: number;
  outsourcing_pct: number;
  productivity_gain_pct: number;
};

type Scenario = {
  scenario_name: string;
  growth_pct: number;
  automation_pct: number;
  outsourcing_pct: number;
  productivity_gain_pct: number;
  capability_expansion_pct: number;
  created_at: string;
};

type DashboardTotals = {
  currentHeadcount: number;
  availableSupply: number;
  futureDemand: number;
  headcountGap: number;
  leadershipGap: number;
  currentCost: number;
  futureCost: number;
  scenarioCount: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDelta(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `-${formatNumber(Math.abs(value))}`;
  return "0";
}

function SummaryCard({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
}) {
  const toneClasses = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
        {title}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  );
}

export default function WorkforceDashboardPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [strategicInputs, setStrategicInputs] = useState<StrategicInputs | null>(null);
  const [latestScenario, setLatestScenario] = useState<Scenario | null>(null);
  const [totals, setTotals] = useState<DashboardTotals>({
    currentHeadcount: 0,
    availableSupply: 0,
    futureDemand: 0,
    headcountGap: 0,
    leadershipGap: 0,
    currentCost: 0,
    futureCost: 0,
    scenarioCount: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      if (!projectId) {
        setErrorMessage("Project ID is missing.");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const [
        projectResult,
        supplyResult,
        futureResult,
        strategicResult,
        scenarioCountResult,
        latestScenarioResult,
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("id, project_name, company_name")
          .eq("id", projectId)
          .maybeSingle(),
        supabase
          .from("workforce_supply_lines")
          .select("current_headcount, attrition_pct, cost_per_employee, current_ready_leaders")
          .eq("project_id", projectId),
        supabase
          .from("workforce_future_requirements")
          .select("future_leadership_demand")
          .eq("project_id", projectId),
        supabase
          .from("workforce_strategic_inputs")
          .select("growth_pct, transformation_pct, automation_pct, outsourcing_pct, productivity_gain_pct")
          .eq("project_id", projectId)
          .maybeSingle(),
        supabase
          .from("workforce_scenarios")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId),
        supabase
          .from("workforce_scenarios")
          .select("scenario_name, growth_pct, automation_pct, outsourcing_pct, productivity_gain_pct, capability_expansion_pct, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (projectResult.error) {
        setErrorMessage(projectResult.error.message);
        setLoading(false);
        return;
      }

      if (supplyResult.error) {
        setErrorMessage(supplyResult.error.message);
        setLoading(false);
        return;
      }

      if (futureResult.error) {
        setErrorMessage(futureResult.error.message);
        setLoading(false);
        return;
      }

      if (strategicResult.error) {
        setErrorMessage(strategicResult.error.message);
        setLoading(false);
        return;
      }

      if (scenarioCountResult.error) {
        setErrorMessage(scenarioCountResult.error.message);
        setLoading(false);
        return;
      }

      if (latestScenarioResult.error) {
        setErrorMessage(latestScenarioResult.error.message);
        setLoading(false);
        return;
      }

      const supplyLines = (supplyResult.data as SupplyLine[] | null) || [];
      const futureLines = (futureResult.data as FutureRequirement[] | null) || [];
      const strategic = (strategicResult.data as StrategicInputs | null) || null;

      const growthPct = strategic?.growth_pct || 0;
      const transformationPct = strategic?.transformation_pct || 0;
      const automationPct = strategic?.automation_pct || 0;
      const outsourcingPct = strategic?.outsourcing_pct || 0;
      const productivityGainPct = strategic?.productivity_gain_pct || 0;

      const currentHeadcount = supplyLines.reduce(
        (sum, item) => sum + (item.current_headcount || 0),
        0
      );

      const availableSupply = supplyLines.reduce((sum, item) => {
        const available = Math.round(
          (item.current_headcount || 0) * (1 - (item.attrition_pct || 0) / 100)
        );
        return sum + available;
      }, 0);

      const futureDemand = supplyLines.reduce((sum, item) => {
        const roleFutureDemand = Math.round(
          (item.current_headcount || 0) *
            (1 +
              growthPct / 100 +
              transformationPct / 100 -
              automationPct / 100 -
              outsourcingPct / 100 -
              productivityGainPct / 100)
        );
        return sum + roleFutureDemand;
      }, 0);

      const currentCost = supplyLines.reduce(
        (sum, item) => sum + (item.current_headcount || 0) * (item.cost_per_employee || 0),
        0
      );

      const futureCost = supplyLines.reduce((sum, item) => {
        const roleFutureDemand = Math.round(
          (item.current_headcount || 0) *
            (1 +
              growthPct / 100 +
              transformationPct / 100 -
              automationPct / 100 -
              outsourcingPct / 100 -
              productivityGainPct / 100)
        );
        return sum + roleFutureDemand * (item.cost_per_employee || 0);
      }, 0);

      const currentReadyLeaders = supplyLines.reduce(
        (sum, item) => sum + (item.current_ready_leaders || 0),
        0
      );

      const futureLeadershipDemand = futureLines.reduce(
        (sum, item) => sum + (item.future_leadership_demand || 0),
        0
      );

      setProject((projectResult.data as Project | null) || null);
      setStrategicInputs(strategic);
      setLatestScenario((latestScenarioResult.data as Scenario | null) || null);
      setTotals({
        currentHeadcount,
        availableSupply,
        futureDemand,
        headcountGap: futureDemand - availableSupply,
        leadershipGap: futureLeadershipDemand - currentReadyLeaders,
        currentCost,
        futureCost,
        scenarioCount: scenarioCountResult.count || 0,
      });
      setLoading(false);
    }

    loadDashboard();
  }, [projectId]);

  const goToWorkspace = () => {
    window.location.href = `/projects/${projectId}`;
  };

  const assumptionsText = useMemo(() => {
    if (!strategicInputs) {
      return "No strategic inputs saved yet.";
    }

    return `Growth ${strategicInputs.growth_pct}% · Transformation ${strategicInputs.transformation_pct}% · Automation ${strategicInputs.automation_pct}% · Outsourcing ${strategicInputs.outsourcing_pct}% · Productivity Gain ${strategicInputs.productivity_gain_pct}%`;
  }, [strategicInputs]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl bg-red-100 p-6 text-red-700 shadow-sm">
          {errorMessage}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white shadow-xl">
          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
                Workforce Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {project?.project_name || "Project Dashboard"}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                {project?.company_name || "Project Company"}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {assumptionsText}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goToWorkspace}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Back to Workspace
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm font-medium text-cyan-300">Latest Scenario</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {latestScenario?.scenario_name || "No scenario saved"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {latestScenario
                  ? `Growth ${latestScenario.growth_pct}% · Automation ${latestScenario.automation_pct}% · Outsourcing ${latestScenario.outsourcing_pct}% · Productivity Gain ${latestScenario.productivity_gain_pct}% · Capability Expansion ${latestScenario.capability_expansion_pct}%`
                  : "Create at least one scenario to see the latest scenario snapshot here."}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Current Headcount"
            value={formatNumber(totals.currentHeadcount)}
            hint="Total current workforce volume across saved supply rows."
            tone="cyan"
          />
          <SummaryCard
            title="Available Supply"
            value={formatNumber(totals.availableSupply)}
            hint="Current headcount after attrition impact is applied."
            tone="emerald"
          />
          <SummaryCard
            title="Future Demand"
            value={formatNumber(totals.futureDemand)}
            hint="Estimated workforce demand based on strategic inputs."
            tone="amber"
          />
          <SummaryCard
            title="Scenario Count"
            value={formatNumber(totals.scenarioCount)}
            hint="Number of saved planning scenarios for this project."
            tone="rose"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Workforce Gap
            </p>
            <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              {formatDelta(totals.headcountGap)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Positive means demand is higher than available supply. Negative means surplus.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Leadership Gap
            </p>
            <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              {formatDelta(totals.leadershipGap)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Compares future leadership demand against current ready leaders.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Cost Delta
            </p>
            <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              {formatDelta(totals.futureCost - totals.currentCost)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Difference between projected future workforce cost and current workforce cost.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Cost Snapshot
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current Workforce Cost</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatNumber(totals.currentCost)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Future Workforce Cost</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatNumber(totals.futureCost)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Quick Interpretation
            </p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Available Supply</span> is calculated after attrition reduction.
              </p>
              <p>
                <span className="font-semibold text-slate-900">Future Demand</span> uses the current workforce base plus strategic assumptions such as growth, transformation, automation, outsourcing, and productivity gain.
              </p>
              <p>
                <span className="font-semibold text-slate-900">Gap and Cost</span> values are summary indicators to help compare current structure against the planned future structure.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
