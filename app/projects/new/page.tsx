"use client";

import { useState } from "react";
import { createClient } from "../../../src/lib/supabase/client";

export default function NewProjectPage() {
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

    const supabase = createClient();
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

    setMessage("تم حفظ المشروع بنجاح.");
    resetForm();
    setLoading(false);
  };

  const goToProjects = () => {
    window.location.href = "/projects";
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow text-right">
        <h1 className="mb-2 text-2xl font-bold text-slate-950">إنشاء مشروع جديد</h1>
        <p className="mb-6 text-sm text-slate-600">أدخل تفاصيل المشروع الأساسية لإنشاء مساحة عمل تخطيط القوى العاملة.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">اسم المشروع</label>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="مثال: خطة القوى العاملة 2027" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">اسم الشركة</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="مثال: ABC Group" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">القطاع</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="مثال: الضيافة" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">الدولة</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="مثال: مصر" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">أفق التخطيط</label>
            <input type="number" value={planningHorizon} onChange={(e) => setPlanningHorizon(e.target.value)} placeholder="مثال: 12" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">الوحدات التنظيمية</label>
            <textarea value={businessUnits} onChange={(e) => setBusinessUnits(e.target.value)} placeholder="مثال: الفنادق، الإدارة، الخدمات المشتركة" rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">العملة</label>
            <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="مثال: EGP" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>

          {message ? <div className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">{message}</div> : null}
          {errorMessage ? <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}

          <div className="flex gap-3 pt-2 justify-start">
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{loading ? 'جارٍ الحفظ...' : 'إنشاء المشروع'}</button>
            <button type="button" onClick={goToProjects} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700">إلغاء</button>
          </div>
        </form>
      </div>
    </main>
  );
}
