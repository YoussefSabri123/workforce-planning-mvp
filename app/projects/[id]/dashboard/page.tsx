"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

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

export default function WorkforceDashboardPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentHeadcount, setCurrentHeadcount] = useState(0);
  const [availableSupply, setAvailableSupply] = useState(0);
  const [futureDemand, setFutureDemand] = useState(0);
  const [headcountGap, setHeadcountGap] = useState(0);
  const [leadershipGap, setLeadershipGap] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [futureCost, setFutureCost] = useState(0);
  const [scenarioCount, setScenarioCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      if (!projectId) {
        setErrorMessage("Project ID is missing.");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const { data: supplyData, error: supplyError } = await supabase
        .from("workforce_supply_lines")
        .select(
          "current_headcount, attrition_pct, cost_per_employee, current_ready_leaders"
        )
        .eq("project_id", projectId);

      if (supplyError) {
        setErrorMessage(supplyError.message);
        setLoading(false);
        return;
      }

      const { data: futureData, error: futureError } = await supabase
        .from("workforce_future_requirements")
        .select("future_leadership_demand")
        .eq("project_id", projectId);

      if (futureError) {
        setErrorMessage(futureError.message);
        setLoading(false);
        return;
      }

      const { data: strategicData, error: strategicError } = await supabase
        .from("workforce_strategic_inputs")
        .select(
          "growth_pct, transformation_pct, automation_pct, outsourcing_pct, productivity_gain_pct"
        )
        .eq("project_id", projectId)
        .maybeSingle();

      if (strategicError) {
        setErrorMessage(strategicError.message);
        setLoading(false);
        return;
      }

      const { count: scenariosTotal, error: scenarioError } = await supabase
        .from("workforce_scenarios")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (scenarioError) {
        setErrorMessage(scenarioError.message);
        setLoading(false);
        return;
      }

      const supplyLines = (supplyData as SupplyLine[] | null) || [];
      const futureLines = (futureData as FutureRequirement[] | null) || [];
      const strategic = (strategicData as StrategicInputs | null) || null;

      const totalCurrentHeadcount = supplyLines.reduce(
        (sum, item) => sum + (item.current_headcount || 0),
        0
      );

      const totalAvailableSupply = supplyLines.reduce((sum, item) => {
        const available = Math.round(
          (item.current_headcount || 0) * (1 - (item.attrition_pct || 0) / 100)
        );
        return sum + available;
      }, 0);

      const growthPct = strategic?.growth_pct || 0;
      const transformationPct = strategic?.transformation_pct || 0;
      const automationPct = strategic?.automation_pct || 0;
      const outsourcingPct = strategic?.outsourcing_pct || 0;
      const productivityGainPct = strategic?.productivity_gain_pct || 0;

      const totalFutureDemand = supplyLines.reduce((sum, item) => {
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

      const totalCurrentCost = supplyLines.reduce(
        (sum, item) =>
          sum + (item.current_headcount || 0) * (item.cost_per_employee || 0),
        0
      );

      const totalFutureCost = supplyLines.reduce((sum, item) => {
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

      const totalCurrentReadyLeaders = supplyLines.reduce(
        (sum, item) => sum + (item.current_ready_leaders || 0),
        0
      );

      const totalFutureLeadershipDemand = futureLines.reduce(
        (sum, item) => sum + (item.future_leadership_demand || 0),
        0
      );

      setCurrentHeadcount(totalCurrentHeadcount);
      setAvailableSupply(totalAvailableSupply);
      setFutureDemand(totalFutureDemand);
      setHeadcountGap(totalFutureDemand - totalAvailableSupply);
      setLeadershipGap(totalFutureLeadershipDemand - totalCurrentReadyLeaders);
      setCurrentCost(totalCurrentCost);
      setFutureCost(totalFutureCost);
      setScenarioCount(scenariosTotal || 0);
      setLoading(false);
    }

    loadDashboard();
  }, [projectId]);

  const goToWorkspace = () => {
    window.location.href = `/projects/${projectId}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-red-100 p-6 text-red-700 shadow">
          {errorMessage}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Workforce Planning MVP
            </p>
            <h1 className="mt-2 text-3xl font-bold">Workforce Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Summary view of workforce supply, demand, gaps, cost, and scenarios.
            </p>
          </div>

          <button
            type="button"
            onClick={goToWorkspace}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Back to Workspace
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Total Current Headcount
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {currentHeadcount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Total Available Supply
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {availableSupply}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Total Future Demand
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {futureDemand}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Scenario Count
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {scenarioCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Headcount Gap
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {headcountGap}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Leadership Gap
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {leadershipGap}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Current Workforce Cost
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {currentCost}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-xs uppercase text-slate-500">
              Future Workforce Cost
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {futureCost}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}