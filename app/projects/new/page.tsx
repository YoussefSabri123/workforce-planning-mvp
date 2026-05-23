"use client";

import { useState } from "react";
import { createClient } from "../../../src/lib/supabase/client";

export default function NewProjectPage() {
  const supabase = createClient();

  const [projectName, setProjectName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [planningHorizon, setPlanningHorizon] = useState("");
  const [businessUnits, setBusinessUnits] = useState("");
  const [currency, setCurrency] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setProjectName("");
    setCompanyName("");
    setIndustry("");
    setCountry("");
    setPlanningHorizon("");
    setBusinessUnits("");
    setCurrency("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.from("projects").insert({
      project_name: projectName,
      company_name: companyName,
      industry: industry || null,
      country: country || null,
      planning_horizon: planningHorizon ? Number(planningHorizon) : null,
      business_units: businessUnits || null,
      currency: currency || null,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Project saved successfully.");
    resetForm();
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Create New Project</h1>

        <p className="mb-6 text-sm text-slate-600">
          Enter the basic project details to create your workforce planning
          workspace.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. 2027 Workforce Plan"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. ABC Group"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Hospitality"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Egypt"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Planning Horizon
            </label>
            <input
              type="number"
              value={planningHorizon}
              onChange={(e) => setPlanningHorizon(e.target.value)}
              placeholder="e.g. 12"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Business Units
            </label>
            <textarea
              value={businessUnits}
              onChange={(e) => setBusinessUnits(e.target.value)}
              placeholder="e.g. Hotels, Corporate, Shared Services"
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            ></textarea>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Currency
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="e.g. EGP"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
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
              {loading ? "Saving..." : "Create Project"}
            </button>

            <a
              href="/projects"
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}