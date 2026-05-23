"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

type ScenarioRow = {
  id: string;
  project_id: string;
  scenario_name: string;
  growth_pct: number;
  automation_pct: number;
  outsourcing_pct: number;
  productivity_gain_pct: number;
  capability_expansion_pct: number;
  notes: string | null;
  created_at: string;
};

export default function ScenarioPlanningPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [scenarioName, setScenarioName] = useState("Growth");
  const [growthPct, setGrowthPct] = useState("");
  const [automationPct, setAutomationPct] = useState("");
  const [outsourcingPct, setOutsourcingPct] = useState("");
  const [productivityGainPct, setProductivityGainPct] = useState("");
  const [capabilityExpansionPct, setCapabilityExpansionPct] = useState("");
  const [notes, setNotes] = useState("");

  const [rows, setRows] = useState<ScenarioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const goToWorkspace = () => {
    window.location.href = `/projects/${projectId}`;
  };

  const resetForm = () => {
    setScenarioName("Growth");
    setGrowthPct("");
    setAutomationPct("");
    setOutsourcingPct("");
    setProductivityGainPct("");
    setCapabilityExpansionPct("");
    setNotes("");
  };

  const fillFormFromRow = (row: ScenarioRow) => {
    setScenarioName(row.scenario_name || "Growth");
    setGrowthPct(String(row.growth_pct ?? 0));
    setAutomationPct(String(row.automation_pct ?? 0));
    setOutsourcingPct(String(row.outsourcing_pct ?? 0));
    setProductivityGainPct(String(row.productivity_gain_pct ?? 0));
    setCapabilityExpansionPct(String(row.capability_expansion_pct ?? 0));
    setNotes(row.notes || "");
  };

  const loadRows = async () => {
    if (!projectId) {
      setErrorMessage("Project ID is missing.");
      setInitialLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("workforce_scenarios")
      .select(
        "id, project_id, scenario_name, growth_pct, automation_pct, outsourcing_pct, productivity_gain_pct, capability_expansion_pct, notes, created_at"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setInitialLoading(false);
      return;
    }

    const loadedRows = (data as ScenarioRow[]) || [];
    setRows(loadedRows);

    if (loadedRows.length > 0) {
      fillFormFromRow(loadedRows[0]);
    }

    setInitialLoading(false);
  };

  useEffect(() => {
    loadRows();
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

    const { error } = await supabase.from("workforce_scenarios").insert({
      project_id: projectId,
      scenario_name: scenarioName,
      growth_pct: growthPct ? Number(growthPct) : 0,
      automation_pct: automationPct ? Number(automationPct) : 0,
      outsourcing_pct: outsourcingPct ? Number(outsourcingPct) : 0,
      productivity_gain_pct: productivityGainPct
        ? Number(productivityGainPct)
        : 0,
      capability_expansion_pct: capabilityExpansionPct
        ? Number(capabilityExpansionPct)
        : 0,
      notes: notes || null,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Scenario saved successfully.");
    await loadRows();
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">
            Loading scenario planning...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Workforce Planning MVP
              </p>
              <h1 className="mt-2 text-2xl font-bold">Scenario Planning</h1>
              <p className="mt-2 text-sm text-slate-600">
                Create and compare workforce planning scenarios.
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
                Scenario Name
              </label>
              <select
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="Growth">Growth</option>
                <option value="Lean Organization">Lean Organization</option>
                <option value="Automation-heavy">Automation-heavy</option>
                <option value="Outsourcing-heavy">Outsourcing-heavy</option>
                <option value="Digital-first">Digital-first</option>
                <option value="Restructuring">Restructuring</option>
                <option value="Merger Integration">Merger Integration</option>
              </select>
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
                Productivity Gain %
              </label>
              <input
                type="number"
                value={productivityGainPct}
                onChange={(e) => setProductivityGainPct(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Capability Expansion %
              </label>
              <input
                type="number"
                value={capabilityExpansionPct}
                onChange={(e) => setCapabilityExpansionPct(e.target.value)}
                placeholder="e.g. 12"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Optional scenario notes"
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

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Scenario"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Saved Scenarios</h2>
          <p className="mt-2 text-sm text-slate-600">
            Click any saved scenario to load its values into the form above.
          </p>

          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No saved scenarios yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {row.scenario_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Growth: {row.growth_pct}% | Automation:{" "}
                        {row.automation_pct}% | Outsourcing:{" "}
                        {row.outsourcing_pct}%
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Productivity Gain: {row.productivity_gain_pct}% |
                        Capability Expansion: {row.capability_expansion_pct}%
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fillFormFromRow(row)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Load Into Form
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}