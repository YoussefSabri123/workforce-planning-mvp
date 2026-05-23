"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

type WorkforceSupplyRow = {
  id: string;
  project_id: string;
  department: string;
  role_name: string;
  current_headcount: number;
  attrition_pct: number;
  productivity_pct: number;
  cost_per_employee: number;
  critical_role: boolean;
  current_ready_leaders: number;
  demographics_notes: string | null;
  competencies_notes: string | null;
  created_at: string;
};

export default function CurrentWorkforcePage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [department, setDepartment] = useState("");
  const [roleName, setRoleName] = useState("");
  const [currentHeadcount, setCurrentHeadcount] = useState("");
  const [attritionPct, setAttritionPct] = useState("");
  const [productivityPct, setProductivityPct] = useState("");
  const [costPerEmployee, setCostPerEmployee] = useState("");
  const [criticalRole, setCriticalRole] = useState(false);
  const [currentReadyLeaders, setCurrentReadyLeaders] = useState("");
  const [demographicsNotes, setDemographicsNotes] = useState("");
  const [competenciesNotes, setCompetenciesNotes] = useState("");

  const [rows, setRows] = useState<WorkforceSupplyRow[]>([]);
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
    setCurrentHeadcount("");
    setAttritionPct("");
    setProductivityPct("");
    setCostPerEmployee("");
    setCriticalRole(false);
    setCurrentReadyLeaders("");
    setDemographicsNotes("");
    setCompetenciesNotes("");
  };

  const fillFormFromRow = (row: WorkforceSupplyRow) => {
    setDepartment(row.department || "");
    setRoleName(row.role_name || "");
    setCurrentHeadcount(String(row.current_headcount ?? 0));
    setAttritionPct(String(row.attrition_pct ?? 0));
    setProductivityPct(String(row.productivity_pct ?? 0));
    setCostPerEmployee(String(row.cost_per_employee ?? 0));
    setCriticalRole(Boolean(row.critical_role));
    setCurrentReadyLeaders(String(row.current_ready_leaders ?? 0));
    setDemographicsNotes(row.demographics_notes || "");
    setCompetenciesNotes(row.competencies_notes || "");
  };

  const loadRows = async () => {
    if (!projectId) {
      setErrorMessage("Project ID is missing.");
      setInitialLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("workforce_supply_lines")
      .select(
        "id, project_id, department, role_name, current_headcount, attrition_pct, productivity_pct, cost_per_employee, critical_role, current_ready_leaders, demographics_notes, competencies_notes, created_at"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setInitialLoading(false);
      return;
    }

    const loadedRows = (data as WorkforceSupplyRow[]) || [];
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

    const { error } = await supabase.from("workforce_supply_lines").upsert(
      {
        project_id: projectId,
        department,
        role_name: roleName,
        current_headcount: currentHeadcount ? Number(currentHeadcount) : 0,
        attrition_pct: attritionPct ? Number(attritionPct) : 0,
        productivity_pct: productivityPct ? Number(productivityPct) : 0,
        cost_per_employee: costPerEmployee ? Number(costPerEmployee) : 0,
        critical_role: criticalRole,
        current_ready_leaders: currentReadyLeaders
          ? Number(currentReadyLeaders)
          : 0,
        demographics_notes: demographicsNotes || null,
        competencies_notes: competenciesNotes || null,
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

    setMessage("Current workforce saved successfully.");
    await loadRows();
    setLoading(false);
  };

  const handleDelete = async (rowId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this current workforce row?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("workforce_supply_lines")
      .delete()
      .eq("id", rowId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Current workforce row deleted successfully.");
    await loadRows();
  };

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">
            Loading current workforce...
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
              <h1 className="mt-2 text-2xl font-bold">
                Current Workforce Supply
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Capture the current workforce data for this project.
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
                Current Headcount
              </label>
              <input
                type="number"
                value={currentHeadcount}
                onChange={(e) => setCurrentHeadcount(e.target.value)}
                placeholder="e.g. 20"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Attrition %
              </label>
              <input
                type="number"
                value={attritionPct}
                onChange={(e) => setAttritionPct(e.target.value)}
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Productivity %
              </label>
              <input
                type="number"
                value={productivityPct}
                onChange={(e) => setProductivityPct(e.target.value)}
                placeholder="e.g. 85"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Cost Per Employee
              </label>
              <input
                type="number"
                value={costPerEmployee}
                onChange={(e) => setCostPerEmployee(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="criticalRole"
                type="checkbox"
                checked={criticalRole}
                onChange={(e) => setCriticalRole(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="criticalRole" className="text-sm font-medium">
                Critical Role
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Current Ready Leaders
              </label>
              <input
                type="number"
                value={currentReadyLeaders}
                onChange={(e) => setCurrentReadyLeaders(e.target.value)}
                placeholder="e.g. 2"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Demographics Notes
              </label>
              <textarea
                value={demographicsNotes}
                onChange={(e) => setDemographicsNotes(e.target.value)}
                rows={3}
                placeholder="Optional demographics notes"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              ></textarea>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Competencies Notes
              </label>
              <textarea
                value={competenciesNotes}
                onChange={(e) => setCompetenciesNotes(e.target.value)}
                rows={3}
                placeholder="Optional competencies notes"
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
                {loading ? "Saving..." : "Save Current Workforce"}
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
          <h2 className="text-xl font-semibold">Saved Current Workforce Rows</h2>
          <p className="mt-2 text-sm text-slate-600">
            Click any row to load its values into the form above, or delete it.
          </p>

          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No saved current workforce rows yet.
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
                        Headcount: {row.current_headcount} | Attrition:{" "}
                        {row.attrition_pct}% | Productivity:{" "}
                        {row.productivity_pct}%
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Cost Per Employee: {row.cost_per_employee} | Ready
                        Leaders: {row.current_ready_leaders} | Critical Role:{" "}
                        {row.critical_role ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fillFormFromRow(row)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Load Into Form
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
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