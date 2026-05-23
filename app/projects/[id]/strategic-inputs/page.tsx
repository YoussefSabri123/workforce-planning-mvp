"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

type StrategicInputsRow = {
  project_id: string;
  planning_horizon_months: number | null;
  growth_pct: number;
  transformation_pct: number;
  cost_optimization_pct: number;
  digital_transformation_level: string | null;
  automation_pct: number;
  outsourcing_pct: number;
  market_expansion_pct: number;
  productivity_gain_pct: number;
  notes: string | null;
};

export default function StrategicInputsPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [planningHorizonMonths, setPlanningHorizonMonths] = useState("");
  const [growthPct, setGrowthPct] = useState("");
  const [transformationPct, setTransformationPct] = useState("");
  const [costOptimizationPct, setCostOptimizationPct] = useState("");
  const [digitalTransformationLevel, setDigitalTransformationLevel] =
    useState("");
  const [automationPct, setAutomationPct] = useState("");
  const [outsourcingPct, setOutsourcingPct] = useState("");
  const [marketExpansionPct, setMarketExpansionPct] = useState("");
  const [productivityGainPct, setProductivityGainPct] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const goToWorkspace = () => {
    window.location.href = `/projects/${projectId}`;
  };

  useEffect(() => {
    async function loadSavedValues() {
      if (!projectId) {
        setErrorMessage("Project ID is missing.");
        setInitialLoading(false);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("workforce_strategic_inputs")
        .select(
          "project_id, planning_horizon_months, growth_pct, transformation_pct, cost_optimization_pct, digital_transformation_level, automation_pct, outsourcing_pct, market_expansion_pct, productivity_gain_pct, notes"
        )
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setInitialLoading(false);
        return;
      }

      const row = (data as StrategicInputsRow | null) || null;

      if (row) {
        setPlanningHorizonMonths(
          row.planning_horizon_months !== null
            ? String(row.planning_horizon_months)
            : ""
        );
        setGrowthPct(String(row.growth_pct ?? 0));
        setTransformationPct(String(row.transformation_pct ?? 0));
        setCostOptimizationPct(String(row.cost_optimization_pct ?? 0));
        setDigitalTransformationLevel(row.digital_transformation_level || "");
        setAutomationPct(String(row.automation_pct ?? 0));
        setOutsourcingPct(String(row.outsourcing_pct ?? 0));
        setMarketExpansionPct(String(row.market_expansion_pct ?? 0));
        setProductivityGainPct(String(row.productivity_gain_pct ?? 0));
        setNotes(row.notes || "");
      }

      setInitialLoading(false);
    }

    loadSavedValues();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!projectId) {
      setErrorMessage("Project ID is missing.");
      return;
    }

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("workforce_strategic_inputs")
      .upsert(
        {
          project_id: projectId,
          planning_horizon_months: planningHorizonMonths
            ? Number(planningHorizonMonths)
            : null,
          growth_pct: growthPct ? Number(growthPct) : 0,
          transformation_pct: transformationPct
            ? Number(transformationPct)
            : 0,
          cost_optimization_pct: costOptimizationPct
            ? Number(costOptimizationPct)
            : 0,
          digital_transformation_level: digitalTransformationLevel || null,
          automation_pct: automationPct ? Number(automationPct) : 0,
          outsourcing_pct: outsourcingPct ? Number(outsourcingPct) : 0,
          market_expansion_pct: marketExpansionPct
            ? Number(marketExpansionPct)
            : 0,
          productivity_gain_pct: productivityGainPct
            ? Number(productivityGainPct)
            : 0,
          notes: notes || null,
        },
        {
          onConflict: "project_id",
        }
      );

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Strategic inputs saved successfully.");
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">
            Loading strategic inputs...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Workforce Planning MVP
            </p>
            <h1 className="mt-2 text-2xl font-bold">Strategic Inputs</h1>
            <p className="mt-2 text-sm text-slate-600">
              Define the business assumptions for this project.
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Planning Horizon (Months)
            </label>
            <input
              type="number"
              value={planningHorizonMonths}
              onChange={(e) => setPlanningHorizonMonths(e.target.value)}
              placeholder="e.g. 12"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Growth %</label>
            <input
              type="number"
              value={growthPct}
              onChange={(e) => setGrowthPct(e.target.value)}
              placeholder="e.g. 15"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Transformation %
            </label>
            <input
              type="number"
              value={transformationPct}
              onChange={(e) => setTransformationPct(e.target.value)}
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Cost Optimization %
            </label>
            <input
              type="number"
              value={costOptimizationPct}
              onChange={(e) => setCostOptimizationPct(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Digital Transformation Level
            </label>
            <input
              type="text"
              value={digitalTransformationLevel}
              onChange={(e) => setDigitalTransformationLevel(e.target.value)}
              placeholder="e.g. Medium"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Automation %
            </label>
            <input
              type="number"
              value={automationPct}
              onChange={(e) => setAutomationPct(e.target.value)}
              placeholder="e.g. 20"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Outsourcing %
            </label>
            <input
              type="number"
              value={outsourcingPct}
              onChange={(e) => setOutsourcingPct(e.target.value)}
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Market Expansion %
            </label>
            <input
              type="number"
              value={marketExpansionPct}
              onChange={(e) => setMarketExpansionPct(e.target.value)}
              placeholder="e.g. 8"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Productivity Gain %
            </label>
            <input
              type="number"
              value={productivityGainPct}
              onChange={(e) => setProductivityGainPct(e.target.value)}
              placeholder="e.g. 6"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Optional strategic notes"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            ></textarea>
          </div>

          {message ? (
            <div className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Strategic Inputs"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
