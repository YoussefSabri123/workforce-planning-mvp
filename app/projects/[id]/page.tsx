"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/client";

type Project = {
  id: string;
  project_name: string;
  company_name: string;
  industry: string | null;
  country: string | null;
  planning_horizon: number | null;
  business_units: string | null;
  currency: string | null;
};

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setErrorMessage("Project ID is missing.");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, project_name, company_name, industry, country, planning_horizon, business_units, currency"
        )
        .eq("id", projectId)
        .single();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setProject(data as Project);
      setLoading(false);
    }

    loadProject();
  }, [projectId]);

  const goToProjects = () => {
    window.location.href = "/projects";
  };

  const goToStrategicInputs = () => {
    window.location.href = `/projects/${projectId}/strategic-inputs`;
  };

  const goToCurrentWorkforce = () => {
    window.location.href = `/projects/${projectId}/current-workforce`;
  };

  const goToFutureDemand = () => {
    window.location.href = `/projects/${projectId}/future-demand`;
  };

  const goToGapAnalysis = () => {
    window.location.href = `/projects/${projectId}/gap-analysis`;
  };

  const goToScenarioPlanning = () => {
    window.location.href = `/projects/${projectId}/scenario-planning`;
  };

  const goToDashboard = () => {
    window.location.href = `/projects/${projectId}/dashboard`;
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Workforce Planning MVP
            </p>
            <h1 className="mt-2 text-3xl font-bold">Project Workspace</h1>
            <p className="mt-2 text-sm text-slate-600">
              Review the selected workforce planning project.
            </p>
          </div>

          <button
            type="button"
            onClick={goToProjects}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Back to Projects
          </button>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-600">Loading project...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl bg-red-100 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && project && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-2xl font-semibold">{project.project_name}</h2>
              <p className="mt-1 text-slate-600">{project.company_name}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-slate-500">Industry</p>
                  <p className="text-sm text-slate-800">
                    {project.industry || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-slate-500">Country</p>
                  <p className="text-sm text-slate-800">
                    {project.country || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Planning Horizon
                  </p>
                  <p className="text-sm text-slate-800">
                    {project.planning_horizon ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-slate-500">Currency</p>
                  <p className="text-sm text-slate-800">
                    {project.currency || "-"}
                  </p>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <p className="text-xs uppercase text-slate-500">
                    Business Units
                  </p>
                  <p className="text-sm text-slate-800">
                    {project.business_units || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="text-lg font-semibold">Strategic Inputs</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Define the business assumptions for this project.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goToStrategicInputs}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Open Strategic Inputs
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="text-lg font-semibold">
                  Current Workforce Supply
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Capture current headcount, attrition, productivity, cost, and
                  critical role data.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goToCurrentWorkforce}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Open Current Workforce
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="text-lg font-semibold">
                  Future Workforce Demand
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Define future role requirements, operating model, and
                  leadership demand.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goToFutureDemand}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Open Future Demand
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="text-lg font-semibold">Gap Analysis</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Compare available supply with future demand and view workforce
                  gaps.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goToGapAnalysis}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Open Gap Analysis
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="text-lg font-semibold">Scenario Planning</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Create and compare workforce planning scenarios for this
                  project.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goToScenarioPlanning}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Open Scenario Planning
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="text-lg font-semibold">Workforce Dashboard</h3>
                <p className="mt-2 text-sm text-slate-600">
                  View workforce supply, demand, gaps, cost, and scenario
                  summary metrics.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={goToDashboard}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Open Workforce Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}