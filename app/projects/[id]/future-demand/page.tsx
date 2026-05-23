"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

type FutureDemandRow = {
  id: string;
  project_id: string;
  department: string;
  role_name: string;
  capability_expansion_pct: number;
  future_operating_model: string | null;
  future_leadership_demand: number;
  future_role_notes: string | null;
  created_at: string;
};

export default function FutureDemandPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [department, setDepartment] = useState("");
  const [roleName, setRoleName] = useState("");
  const [capabilityExpansionPct, setCapabilityExpansionPct] = useState("");
  const [futureOperatingModel, setFutureOperatingModel] = useState("");
  const [futureLeadershipDemand, setFutureLeadershipDemand] = useState("");
  const [futureRoleNotes, setFutureRoleNotes] = useState("");

  const [rows, setRows] = useState<FutureDemandRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const goToWorkspace = () => {
    window.location.href = `/projects/${projectId}`;
  };

  const resetForm = () => {
    setDepartment("");
    setRoleName("");
    setCapabilityExpansionPct("");
    setFutureOperatingModel("");
    setFutureLeadershipDemand("");
    setFutureRoleNotes("");
  };

  const fillFormFromRow = (row: FutureDemandRow) => {
    setDepartment(row.department || "");
    setRoleName(row.role_name || "");
    setCapabilityExpansionPct(String(row.capability_expansion_pct ?? 0));
    setFutureOperatingModel(row.future_operating_model || "");
    setFutureLeadershipDemand(String(row.future_leadership_demand ?? 0));
    setFutureRoleNotes(row.future_role_notes || "");
  };

  const loadRows = async () => {
    if (!projectId) {
      setErrorMessage("Project ID is missing.");
      setInitialLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("workforce_future_requirements")
      .select(
        "id, project_id, department, role_name, capability_expansion_pct, future_operating_model, future_leadership_demand, future_role_notes, created_at"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setInitialLoading(false);
      return;
    }

    const loadedRows = (data as FutureDemandRow[]) || [];
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

    const { error } = await supabase
      .from("workforce_future_requirements")
      .upsert(
        {
          project_id: projectId,
          department: department,
          role_name: roleName,
          capability_expansion_pct: capabilityExpansionPct
            ? Number(capabilityExpansionPct)
            : 0,
          future_operating_model: futureOperatingModel || null,
          future_leadership_demand: futureLeadershipDemand
            ? Number(futureLeadershipDemand)
            : 0,
          future_role_notes: futureRoleNotes || null,
        },
        {
          onConflict: "project_id,department,role_name",
        }
      );

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Future demand saved successfully.");
    await loadRows();
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">Loading future demand...</p>
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
              <h1 className="mt-2 text-2xl font-bold">
                Future Workforce Demand
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Define the future role and capability requirements for this
                project.
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
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Finance"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Role Name
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Finance Analyst"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
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
                placeholder="e.g. 15"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Future Operating Model
              </label>
              <input
                type="text"
                value={futureOperatingModel}
                onChange={(e) => setFutureOperatingModel(e.target.value)}
                placeholder="e.g. Centralized Shared Services"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Future Leadership Demand
              </label>
              <input
                type="number"
                value={futureLeadershipDemand}
                onChange={(e) => setFutureLeadershipDemand(e.target.value)}
                placeholder="e.g. 3"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Future Role Notes
              </label>
              <textarea
                value={futureRoleNotes}
                onChange={(e) => setFutureRoleNotes(e.target.value)}
                rows={4}
                placeholder="Describe future skills, capability needs, or role changes"
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
                {loading ? "Saving..." : "Save Future Demand"}
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
          <h2 className="text-xl font-semibold">Saved Future Demand Rows</h2>
          <p className="mt-2 text-sm text-slate-600">
            Click any row to load its values into the form above.
          </p>

          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No saved future demand rows yet.
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
                        {row.department} — {row.role_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Capability Expansion: {row.capability_expansion_pct}% |
                        Leadership Demand: {row.future_leadership_demand}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Operating Model: {row.future_operating_model || "-"}
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