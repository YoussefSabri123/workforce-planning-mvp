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
        setErrorMessage("معرّف المشروع مفقود.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_name, company_name, industry, country, planning_horizon, business_units, currency")
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

  const goToProjects = () => { window.location.href = "/projects"; };
  const goToStrategicInputs = () => { window.location.href = `/projects/${projectId}/strategic-inputs`; };
  const goToCurrentWorkforce = () => { window.location.href = `/projects/${projectId}/current-workforce`; };
  const goToFutureDemand = () => { window.location.href = `/projects/${projectId}/future-demand`; };
  const goToGapAnalysis = () => { window.location.href = `/projects/${projectId}/gap-analysis`; };
  const goToScenarioPlanning = () => { window.location.href = `/projects/${projectId}/scenario-planning`; };
  const goToDashboard = () => { window.location.href = `/projects/${projectId}/dashboard`; };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-right">
            <p className="text-sm font-medium text-blue-700">منصة تخطيط القوى العاملة</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">مساحة عمل المشروع</h1>
            <p className="mt-2 text-base text-slate-600">راجع المشروع المحدد وانتقل إلى وحدات التخطيط المختلفة.</p>
          </div>

          <button type="button" onClick={goToProjects} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100">العودة إلى المشاريع</button>
        </div>

        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-600">جارٍ تحميل المشروع...</p></div> : null}
        {errorMessage ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">{errorMessage}</div> : null}

        {!loading && !errorMessage && project ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-right">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">{project.project_name}</h2>
              <p className="mt-2 text-lg text-slate-700">{project.company_name}</p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">القطاع</p><p className="mt-1 text-lg text-slate-900">{project.industry || '-'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">الدولة</p><p className="mt-1 text-lg text-slate-900">{project.country || '-'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">أفق التخطيط</p><p className="mt-1 text-lg text-slate-900">{project.planning_horizon ?? '-'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">العملة</p><p className="mt-1 text-lg text-slate-900">{project.currency || '-'}</p></div>
                <div className="sm:col-span-2 lg:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">الوحدات التنظيمية</p><p className="mt-1 text-lg text-slate-900">{project.business_units || '-'}</p></div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <WorkspaceCard title="المدخلات الاستراتيجية" description="تعريف الافتراضات الاستراتيجية الخاصة بالمشروع." buttonLabel="فتح المدخلات الاستراتيجية" onClick={goToStrategicInputs} />
              <WorkspaceCard title="عرض القوى العاملة الحالي" description="تسجيل العدد الحالي والتسرب والإنتاجية والتكلفة والأدوار الحرجة." buttonLabel="فتح العرض الحالي" onClick={goToCurrentWorkforce} />
              <WorkspaceCard title="الطلب المستقبلي" description="تعريف الأدوار والمتطلبات المستقبلية ونموذج التشغيل والاحتياج القيادي." buttonLabel="فتح الطلب المستقبلي" onClick={goToFutureDemand} />
              <WorkspaceCard title="تحليل الفجوات" description="مقارنة العرض المتاح بالطلب المستقبلي وعرض الفجوات." buttonLabel="فتح تحليل الفجوات" onClick={goToGapAnalysis} />
              <WorkspaceCard title="تخطيط السيناريوهات" description="إنشاء ومقارنة سيناريوهات تخطيط القوى العاملة." buttonLabel="فتح السيناريوهات" onClick={goToScenarioPlanning} />
              <WorkspaceCard title="لوحة معلومات القوى العاملة" description="عرض مؤشرات العرض والطلب والفجوات والتكلفة والسيناريوهات." buttonLabel="فتح لوحة المعلومات" onClick={goToDashboard} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function WorkspaceCard({ title, description, buttonLabel, onClick }: { title: string; description: string; buttonLabel: string; onClick: () => void; }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <h3 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 min-h-[96px] text-base leading-7 text-slate-700">{description}</p>
      <div className="mt-6">
        <button type="button" onClick={onClick} className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700">{buttonLabel}</button>
      </div>
    </div>
  );
}
