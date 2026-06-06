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

  const goToWorkspace = () => { window.location.href = `/projects/${projectId}`; };

  const resetForm = () => {
    setDepartment(""); setRoleName(""); setCurrentHeadcount(""); setAttritionPct(""); setProductivityPct(""); setCostPerEmployee(""); setCriticalRole(false); setCurrentReadyLeaders(""); setDemographicsNotes(""); setCompetenciesNotes("");
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
      setErrorMessage("معرّف المشروع مفقود.");
      setInitialLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workforce_supply_lines")
      .select("id, project_id, department, role_name, current_headcount, attrition_pct, productivity_pct, cost_per_employee, critical_role, current_ready_leaders, demographics_notes, competencies_notes, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setInitialLoading(false);
      return;
    }

    const loadedRows = (data as WorkforceSupplyRow[]) || [];
    setRows(loadedRows);
    if (loadedRows.length > 0) fillFormFromRow(loadedRows[0]);
    setInitialLoading(false);
  };

  useEffect(() => { loadRows(); }, [projectId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) { setErrorMessage("معرّف المشروع مفقود."); return; }

    setLoading(true); setMessage(""); setErrorMessage("");
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
        current_ready_leaders: currentReadyLeaders ? Number(currentReadyLeaders) : 0,
        demographics_notes: demographicsNotes || null,
        competencies_notes: competenciesNotes || null,
      },
      { onConflict: "project_id,department,role_name" }
    );

    if (error) { setErrorMessage(error.message); setLoading(false); return; }
    setMessage("تم حفظ بيانات عرض القوى العاملة بنجاح.");
    await loadRows();
    setLoading(false);
  };

  if (initialLoading) {
    return <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8"><div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow"><p className="text-sm text-slate-600">جارٍ تحميل بيانات العرض الحالي...</p></div></main>;
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl bg-white p-6 shadow text-right">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">منصة تخطيط القوى العاملة</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">عرض القوى العاملة الحالي</h1>
              <p className="mt-2 text-sm text-slate-600">سجّل بيانات القوى العاملة الحالية الخاصة بالمشروع.</p>
            </div>
            <button type="button" onClick={goToWorkspace} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">العودة إلى مساحة العمل</button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="الإدارة" value={department} onChange={setDepartment} placeholder="مثال: المالية" />
            <Field label="اسم الدور" value={roleName} onChange={setRoleName} placeholder="مثال: محلل مالي" />
            <Field label="العدد الحالي" value={currentHeadcount} onChange={setCurrentHeadcount} type="number" placeholder="مثال: 20" />
            <Field label="نسبة التسرب" value={attritionPct} onChange={setAttritionPct} type="number" placeholder="مثال: 10" />
            <Field label="نسبة الإنتاجية" value={productivityPct} onChange={setProductivityPct} type="number" placeholder="مثال: 85" />
            <Field label="التكلفة لكل موظف" value={costPerEmployee} onChange={setCostPerEmployee} type="number" placeholder="مثال: 10000" />
            <div className="flex items-center gap-2 justify-end"><label htmlFor="criticalRole" className="text-sm font-medium">دور حرج</label><input id="criticalRole" type="checkbox" checked={criticalRole} onChange={(e) => setCriticalRole(e.target.checked)} className="h-4 w-4" /></div>
            <Field label="القادة الجاهزون حاليًا" value={currentReadyLeaders} onChange={setCurrentReadyLeaders} type="number" placeholder="مثال: 2" />
            <TextArea label="ملاحظات ديموغرافية" value={demographicsNotes} onChange={setDemographicsNotes} placeholder="ملاحظات ديموغرافية اختيارية" />
            <TextArea label="ملاحظات الكفاءات" value={competenciesNotes} onChange={setCompetenciesNotes} placeholder="ملاحظات كفاءات اختيارية" />

            {message ? <div className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">{message}</div> : null}
            {errorMessage ? <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{errorMessage}</div> : null}

            <div className="flex gap-3 pt-2 justify-start">
              <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{loading ? 'جارٍ الحفظ...' : 'حفظ العرض الحالي'}</button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100">مسح النموذج</button>
            </div>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow text-right">
          <h2 className="text-xl font-semibold text-slate-950">صفوف عرض القوى العاملة المحفوظة</h2>
          <p className="mt-2 text-sm text-slate-600">يمكنك الضغط على أي صف لتحميل بياناته إلى النموذج أعلاه.</p>

          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">لا توجد صفوف محفوظة بعد.</p>
          ) : (
            <div className="mt-4 grid gap-4">
              {rows.map((row) => (
                <div key={row.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => fillFormFromRow(row)} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">تحميل إلى النموذج</button>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{row.department} — {row.role_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">العدد: {row.current_headcount} | التسرب: {row.attrition_pct}% | الإنتاجية: {row.productivity_pct}%</p>
                      <p className="mt-1 text-sm text-slate-600">التكلفة لكل موظف: {row.cost_per_employee} | القادة الجاهزون: {row.current_ready_leaders} | دور حرج: {row.critical_role ? 'نعم' : 'لا'}</p>
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

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea></div>;
}
