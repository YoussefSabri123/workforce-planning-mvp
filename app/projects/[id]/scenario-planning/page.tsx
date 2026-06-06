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
  const [scenarioName, setScenarioName] = useState("سيناريو النمو");
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

  const goToWorkspace = () => { window.location.href = `/projects/${projectId}`; };
  const resetForm = () => { setScenarioName('سيناريو النمو'); setGrowthPct(''); setAutomationPct(''); setOutsourcingPct(''); setProductivityGainPct(''); setCapabilityExpansionPct(''); setNotes(''); };
  const fillFormFromRow = (row: ScenarioRow) => { setScenarioName(row.scenario_name || 'سيناريو النمو'); setGrowthPct(String(row.growth_pct ?? 0)); setAutomationPct(String(row.automation_pct ?? 0)); setOutsourcingPct(String(row.outsourcing_pct ?? 0)); setProductivityGainPct(String(row.productivity_gain_pct ?? 0)); setCapabilityExpansionPct(String(row.capability_expansion_pct ?? 0)); setNotes(row.notes || ''); };

  const loadRows = async () => {
    if (!projectId) { setErrorMessage('معرّف المشروع مفقود.'); setInitialLoading(false); return; }
    const supabase = createClient();
    const { data, error } = await supabase.from('workforce_scenarios').select('id, project_id, scenario_name, growth_pct, automation_pct, outsourcing_pct, productivity_gain_pct, capability_expansion_pct, notes, created_at').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) { setErrorMessage(error.message); setInitialLoading(false); return; }
    const loadedRows = (data as ScenarioRow[]) || [];
    setRows(loadedRows);
    if (loadedRows.length > 0) fillFormFromRow(loadedRows[0]);
    setInitialLoading(false);
  };

  useEffect(() => { loadRows(); }, [projectId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) { setErrorMessage('معرّف المشروع مفقود.'); return; }
    setLoading(true); setMessage(''); setErrorMessage('');
    const supabase = createClient();
    const { error } = await supabase.from('workforce_scenarios').insert({
      project_id: projectId,
      scenario_name: scenarioName,
      growth_pct: growthPct ? Number(growthPct) : 0,
      automation_pct: automationPct ? Number(automationPct) : 0,
      outsourcing_pct: outsourcingPct ? Number(outsourcingPct) : 0,
      productivity_gain_pct: productivityGainPct ? Number(productivityGainPct) : 0,
      capability_expansion_pct: capabilityExpansionPct ? Number(capabilityExpansionPct) : 0,
      notes: notes || null,
    });
    if (error) { setErrorMessage(error.message); setLoading(false); return; }
    setMessage('تم حفظ السيناريو بنجاح.');
    await loadRows();
    setLoading(false);
  };

  if (initialLoading) return <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8"><div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow"><p className="text-sm text-slate-600">جارٍ تحميل السيناريوهات...</p></div></main>;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl bg-white p-6 shadow text-right">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">منصة تخطيط القوى العاملة</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">تخطيط السيناريوهات</h1>
              <p className="mt-2 text-sm text-slate-600">أنشئ وقارن سيناريوهات تخطيط القوى العاملة.</p>
            </div>
            <button type="button" onClick={goToWorkspace} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">العودة إلى مساحة العمل</button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium">اسم السيناريو</label>
              <select value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="سيناريو النمو">سيناريو النمو</option>
                <option value="سيناريو المنظمة الرشيقة">سيناريو المنظمة الرشيقة</option>
                <option value="سيناريو عالي الأتمتة">سيناريو عالي الأتمتة</option>
                <option value="سيناريو الاستعانة بمصادر خارجية">سيناريو الاستعانة بمصادر خارجية</option>
                <option value="سيناريو الرقمنة أولاً">سيناريو الرقمنة أولاً</option>
                <option value="سيناريو إعادة الهيكلة">سيناريو إعادة الهيكلة</option>
                <option value="سيناريو الدمج">سيناريو الدمج</option>
              </select>
            </div>
            <Field label="نسبة النمو" value={growthPct} onChange={setGrowthPct} type="number" placeholder="مثال: 15" />
            <Field label="نسبة الأتمتة" value={automationPct} onChange={setAutomationPct} type="number" placeholder="مثال: 20" />
            <Field label="نسبة الاستعانة بمصادر خارجية" value={outsourcingPct} onChange={setOutsourcingPct} type="number" placeholder="مثال: 10" />
            <Field label="نسبة تحسن الإنتاجية" value={productivityGainPct} onChange={setProductivityGainPct} type="number" placeholder="مثال: 5" />
            <Field label="نسبة توسيع القدرات" value={capabilityExpansionPct} onChange={setCapabilityExpansionPct} type="number" placeholder="مثال: 12" />
            <div><label className="mb-1 block text-sm font-medium">ملاحظات</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="ملاحظات اختيارية على السيناريو" className="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea></div>
            {message ? <div className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">{message}</div> : null}
            {errorMessage ? <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}
            <div className="flex gap-3 pt-2 justify-start">
              <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{loading ? 'جارٍ الحفظ...' : 'حفظ السيناريو'}</button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100">مسح النموذج</button>
            </div>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow text-right">
          <h2 className="text-xl font-semibold text-slate-950">السيناريوهات المحفوظة</h2>
          <p className="mt-2 text-sm text-slate-600">اضغط على أي سيناريو لتحميل قيمه إلى النموذج أعلاه.</p>
          {rows.length === 0 ? <p className="mt-4 text-sm text-slate-600">لا توجد سيناريوهات محفوظة بعد.</p> : (
            <div className="mt-4 grid gap-4">
              {rows.map((row) => (
                <div key={row.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-2"><button type="button" onClick={() => fillFormFromRow(row)} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">تحميل إلى النموذج</button></div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{row.scenario_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">النمو: {row.growth_pct}% | الأتمتة: {row.automation_pct}% | الاستعانة بمصادر خارجية: {row.outsourcing_pct}%</p>
                      <p className="mt-1 text-sm text-slate-600">تحسن الإنتاجية: {row.productivity_gain_pct}% | توسيع القدرات: {row.capability_expansion_pct}%</p>
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

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>;
}
