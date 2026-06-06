"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

type SupplyLine = { id: string; department: string; role_name: string; current_headcount: number; attrition_pct: number; current_ready_leaders: number; cost_per_employee: number; };
type FutureRequirement = { id: string; department: string; role_name: string; capability_expansion_pct: number; future_operating_model: string | null; future_leadership_demand: number; future_role_notes: string | null; };
type StrategicInputs = { growth_pct: number; transformation_pct: number; automation_pct: number; outsourcing_pct: number; productivity_gain_pct: number; };

export default function GapAnalysisPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [supplyLine, setSupplyLine] = useState<SupplyLine | null>(null);
  const [futureRequirement, setFutureRequirement] = useState<FutureRequirement | null>(null);
  const [strategicInputs, setStrategicInputs] = useState<StrategicInputs | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!projectId) { setErrorMessage('معرّف المشروع مفقود.'); setLoading(false); return; }
      const supabase = createClient();
      const { data: supplyData, error: supplyError } = await supabase.from('workforce_supply_lines').select('id, department, role_name, current_headcount, attrition_pct, current_ready_leaders, cost_per_employee').eq('project_id', projectId).order('created_at', { ascending: true }).limit(1).maybeSingle();
      if (supplyError) { setErrorMessage(supplyError.message); setLoading(false); return; }
      const { data: futureData, error: futureError } = await supabase.from('workforce_future_requirements').select('id, department, role_name, capability_expansion_pct, future_operating_model, future_leadership_demand, future_role_notes').eq('project_id', projectId).order('created_at', { ascending: true }).limit(1).maybeSingle();
      if (futureError) { setErrorMessage(futureError.message); setLoading(false); return; }
      const { data: strategicData, error: strategicError } = await supabase.from('workforce_strategic_inputs').select('growth_pct, transformation_pct, automation_pct, outsourcing_pct, productivity_gain_pct').eq('project_id', projectId).maybeSingle();
      if (strategicError) { setErrorMessage(strategicError.message); setLoading(false); return; }
      setSupplyLine((supplyData as SupplyLine | null) || null);
      setFutureRequirement((futureData as FutureRequirement | null) || null);
      setStrategicInputs((strategicData as StrategicInputs | null) || null);
      setLoading(false);
    }
    loadData();
  }, [projectId]);

  const goToWorkspace = () => { window.location.href = `/projects/${projectId}`; };

  if (loading) return <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8"><div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow"><p className="text-sm text-slate-600">جارٍ تحميل تحليل الفجوات...</p></div></main>;
  if (errorMessage) return <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8"><div className="mx-auto max-w-4xl rounded-xl bg-red-100 p-6 text-red-700 shadow">{errorMessage}</div></main>;

  if (!supplyLine || !futureRequirement || !strategicInputs) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow text-right">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">منصة تخطيط القوى العاملة</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">تحليل الفجوات</h1>
              <p className="mt-2 text-sm text-slate-600">تحتاج هذه الصفحة إلى ما يلي على الأقل:</p>
            </div>
            <button type="button" onClick={goToWorkspace} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">العودة إلى مساحة العمل</button>
          </div>
          <ul className="list-disc space-y-2 pr-6 text-sm text-slate-700">
            <li>سجل واحد في المدخلات الاستراتيجية</li>
            <li>سجل واحد في عرض القوى العاملة الحالي</li>
            <li>سجل واحد في الطلب المستقبلي</li>
          </ul>
        </div>
      </main>
    );
  }

  const availableSupply = Math.round(supplyLine.current_headcount * (1 - supplyLine.attrition_pct / 100));
  const futureDemand = Math.round(supplyLine.current_headcount * (1 + strategicInputs.growth_pct / 100 + strategicInputs.transformation_pct / 100 + futureRequirement.capability_expansion_pct / 100 - strategicInputs.automation_pct / 100 - strategicInputs.outsourcing_pct / 100 - strategicInputs.productivity_gain_pct / 100));
  const headcountGap = futureDemand - availableSupply;
  const leadershipGap = futureRequirement.future_leadership_demand - supplyLine.current_ready_leaders;
  const currentCost = supplyLine.current_headcount * supplyLine.cost_per_employee;
  const futureCost = futureDemand * supplyLine.cost_per_employee;
  const costGap = futureCost - currentCost;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-sm font-medium text-blue-700">منصة تخطيط القوى العاملة</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">تحليل الفجوات</h1>
            <p className="mt-2 text-sm text-slate-600">عرض حسابي أساسي لدور حالي واحد ودور مستقبلي واحد.</p>
          </div>
          <button type="button" onClick={goToWorkspace} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">العودة إلى مساحة العمل</button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow text-right">
          <h2 className="text-xl font-semibold text-slate-950">{supplyLine.department} — {supplyLine.role_name}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="العدد الحالي" value={String(supplyLine.current_headcount)} />
            <Metric label="العرض المتاح" value={String(availableSupply)} />
            <Metric label="الطلب المستقبلي" value={String(futureDemand)} />
            <Metric label="فجوة العدد" value={String(headcountGap)} />
            <Metric label="فجوة القيادة" value={String(leadershipGap)} />
            <Metric label="نموذج التشغيل المستقبلي" value={futureRequirement.future_operating_model || '-'} />
            <Metric label="التكلفة الحالية" value={String(currentCost)} />
            <Metric label="التكلفة المستقبلية" value={String(futureCost)} />
            <Metric label="فجوة التكلفة" value={String(costGap)} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase text-slate-500">{label}</p><p className="text-lg font-semibold text-slate-900">{value}</p></div>;
}
