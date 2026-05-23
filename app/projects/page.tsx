"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../src/lib/supabase/client";

type Project = {
  id: string;
  project_name: string;
  company_name: string;
  industry: string | null;
  country: string | null;
  planning_horizon: number | null;
  business_units: string | null;
  currency: string | null;
  created_at: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProjects = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setProjects((data as Project[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const goToNewProject = () => {
    window.location.href = "/projects/new";
  };

  const openProject = (projectId: string) => {
    window.location.href = `/projects/${projectId}`;
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the project "${projectName}"?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setErrorMessage("");
    setDeletingId(projectId);

    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      setErrorMessage(error.message);
      setDeletingId(null);
      return;
    }

    setMessage("Project deleted successfully.");
    await loadProjects();
    setDeletingId(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Workforce Planning MVP
            </p>
            <h1 className="mt-2 text-3xl font-bold">Projects</h1>
            <p className="mt-2 text-sm text-slate-600">
              View, open, and manage your workforce planning projects.
            </p>
          </div>

          <button
            type="button"
            onClick={goToNewProject}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            New Project
          </button>
        </div>

        {message ? (
          <div className="mb-4 rounded-xl bg-green-100 p-4 text-sm text-green-700">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-600">Loading projects...</p>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl bg-red-100 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {!loading && !errorMessage && projects.length === 0 ? (
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">No projects yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Create your first workforce planning project to get started.
            </p>
          </div>
        ) : null}

        {!loading && !errorMessage && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-xl bg-white p-5 shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {project.project_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {project.company_name}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openProject(project.id)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(project.id, project.project_name)
                      }
                      disabled={deletingId === project.id}
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        border: "1px solid #b91c1c",
                        minHeight: "42px",
                      }}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === project.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}