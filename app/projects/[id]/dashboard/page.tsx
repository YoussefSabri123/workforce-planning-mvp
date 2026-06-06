"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";

type Project = {
  id: string;
  project_name: string;
  company_name: string;
};

type SupplyLine = {
  current_headcount: number;
  attrition_pct: number;
  cost_per_employee: number;
  current_ready_leaders: number;
};

type FutureRequirement = {
  future_leadership_demand: number;
};

type StrategicInputs = {
  growth_pct: number;
  transformation_pct: number;
  automation_pct: number;
  outsourcing_pct: number;
  productivity_gain_pct: number;
};

type Scenario = {
  scenario_name: string;
  growth_pct: number;
  automation_pct: number;
  outsourcing_pct: number;
  productivity_gain_pct: number;
  capability_expansion_pct: number;
  created_at: string;
};

type DashboardTotals = {
  currentHeadcount: number;
  availableSupply: number;
  futureDemand: number;
  headcountGap: number;
  leadershipGap: number;
  currentCost: number;
  futureCost: number;
  scenarioCount: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDelta(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `-${formatNumber(Math.abs(value))}`;
  return "0";
}

function SummaryCard({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
}) {
  const toneClasses = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
        {title}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  );
}

function InsightBox({
  title,
  value,
  desc,
}: {
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

export default function WorkforceDashboardPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [strategicInputs, setStrategicInputs] = useState<StrategicInputs | null>(null);
  const [latestScenario, setLatestScenario] = useState<Scenario | null>(null);
  const [totals, setTotals] = useState<DashboardTotals>({
    currentHeadcount: 0,
    availableSupply: 0,
    futureDemand: 0,
    headcountGap: 0,
    leadershipGap: 0,
    currentCost: 0,
    futureCost: 0,
    scenarioCount: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      if (!projectId) {
        setErrorMessage("معرّف المشروع مفقود.");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const [
        projectResult,
        supplyResult,
        futureResult,
        strategicResult,
        scenarioCountResult,
        latestScenarioResult,
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("id, project_name, company_name")
          .eq("id", projectId)
          .maybeSingle(),
        supabase
          .from("workforce_supply_lines")
          .select("current_headcount, attrition_pct, cost_per_employee, current_ready_leaders")
          .eq("project_id", projectId),
        supabase
          .from("workforce_future_requirements")
          .select("future_leadership_demand")
          .eq("project_id", projectId),
        supabase
          .from("workforce_strategic_inputs")
          .select("growth_pct, transformation_pct, automation_pct, outsourcing_pct, productivity_gain_pct")
          .eq("project_id", projectId)
          .maybeSingle(),
        supabase
          .from("workforce_scenarios")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId),
        supabase
          .from("workforce_scenarios")
          .select("scenario_name, growth_pct, automation_pct, outsourcing_pct, productivity_gain_pct, capability_expansion_pct, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (
        projectResult.error ||
        supplyResult.error ||
        futureResult.error ||
        strategicResult.error ||
        scenarioCountResult.error ||
        latestScenarioResult.error
      ) {
        setErrorMessage(
          projectResult.error?.message ||
            supplyResult.error?.message ||
            futureResult.error?.message ||
            strategicResult.error?.message ||
            scenarioCountResult.error?.message ||
            latestScenarioResult.error?.message ||
            "حدث خطأ أثناء تحميل لوحة المعلومات."
        );
        setLoading(false);
        return;
      }

      const supplyLines = (supplyResult.data as SupplyLine[] | null) || [];
      const futureLines = (futureResult.data as FutureRequirement[] | null) || [];
      const strategic = (strategicResult.data as StrategicInputs | null) || null;

      const growthPct = strategic?.growth_pct || 0;
      const transformationPct = strategic?.transformation_pct || 0;
      const automationPct = strategic?.automation_pct || 0;
      const outsourcingPct = strategic?.outsourcing_pct || 0;
      const productivityGainPct = strategic?.productivity_gain_pct || 0;

      const currentHeadcount = supplyLines.reduce(
        (sum, item) => sum + (item.current_headcount || 0),
        0
      );

      const availableSupply = supplyLines.reduce((sum, item) => {
        const available = Math.round(
          (item.current_headcount || 0) * (1 - (item.attrition_pct || 0) / 100)
        );
        return sum + available;
      }, 0);

      const futureDemand = supplyLines.reduce((sum, item) => {
        const roleFutureDemand = Math.round(
          (item.current_headcount || 0) *
            (1 +
              growthPct / 100 +
              transformationPct / 100 -
              automationPct / 100 -
              outsourcingPct / 100 -
              productivityGainPct / 100)
        );
        return sum + roleFutureDemand;
      }, 0);

      const currentCost = supplyLines.reduce(
        (sum, item) => sum + (item.current_headcount || 0) * (item.cost_per_employee || 0),
        0
      );

      const futureCost = supplyLines.reduce((sum, item) => {
        const roleFutureDemand = Math.round(
          (item.current_headcount || 0) *
            (1 +
              growthPct / 100 +
              transformationPct / 100 -
              automationPct / 100 -
              outsourcingPct / 100 -
              productivityGainPct / 100)
        );
        return sum + roleFutureDemand * (item.cost_per_employee || 0);
      }, 0);

      const currentReadyLeaders = supplyLines.reduce(
        (sum, item) => sum + (item.current_ready_leaders || 0),
        0
      );

      const futureLeadershipDemand = futureLines.reduce(
        (sum, item) => sum + (item.future_leadership_demand || 0),
        0
      );

      setProject((projectResult.data as Project | null) || null);
      setStrategicInputs(strategic);
      setLatestScenario((latestScenarioResult.data as Scenario | null) || null);
      setTotals({
        currentHeadcount,
        availableSupply,
        futureDemand,
        headcountGap: futureDemand - availableSupply,
        leadershipGap: futureLeadershipDemand - currentReadyLeaders,
        currentCost,
        futureCost,
        scenarioCount: scenarioCountResult.count || 0,
      });
      setLoading(false);
    }

    loadDashboard();
  }, [projectId]);

  const goToWorkspace = () => {
    window.location.href = `/projects/${projectId}`;
  };

  const assumptionsText = useMemo(() => {
    if (!strategicInputs) {
      return "لا توجد مدخلات استراتيجية محفوظة بعد.";
    }

    return `النمو ${strategicInputs.growth_pct}% · التحول ${strategicInputs.transformation_pct}% · الأتمتة ${strategicInputs.automation_pct}% · الاستعانة بمصادر خارجية ${strategicInputs.outsourcing_pct}% · تحسن الإنتاجية ${strategicInputs.productivity_gain_pct}%`;
  }, [strategicInputs]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">جارٍ تحميل لوحة المعلومات...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl bg-red-100 p-6 text-red-700 shadow-sm">
          {errorMessage}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white shadow-xl">
          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="text-right">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
                لوحة معلومات القوى العاملة
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {project?.project_name || "لوحة معلومات المشروع"}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                {project?.company_name || "اسم الشركة"}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {assumptionsText}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 justify-start">
                <button
                  type="button"
                  onClick={goToWorkspace}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  العودة إلى مساحة العمل
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm text-right">
              <p className="text-sm font-medium text-cyan-300">أحدث سيناريو</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {latestScenario?.scenario_name || "لا يوجد سيناريو محفوظ"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {latestScenario
                  ? `النمو ${latestScenario.growth_pct}% · الأتمتة ${latestScenario.automation_pct}% · الاستعانة بمصادر خارجية ${latestScenario.outsourcing_pct}% · تحسن الإنتاجية ${latestScenario.productivity_gain_pct}% · توسيع القدرات ${latestScenario.capability_expansion_pct}%`
                  : "أنشئ سيناريو واحدًا على الأقل لعرض أحدث لقطة هنا."}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="العدد الحالي" value={formatNumber(totals.currentHeadcount)} hint="إجمالي حجم القوى العاملة الحالية عبر صفوف العرض المحفوظة." tone="cyan" />
          <SummaryCard title="العرض المتاح" value={formatNumber(totals.availableSupply)} hint="العدد الحالي بعد تأثير التسرب." tone="emerald" />
          <SummaryCard title="الطلب المستقبلي" value={formatNumber(totals.futureDemand)} hint="الطلب المتوقع بناءً على المدخلات الاستراتيجية." tone="amber" />
          <SummaryCard title="عدد السيناريوهات" value={formatNumber(totals.scenarioCount)} hint="عدد السيناريوهات المحفوظة لهذا المشروع." tone="rose" />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <InsightBox title="فجوة القوى العاملة" value={formatDelta(totals.headcountGap)} desc="القيمة الموجبة تعني أن الطلب أعلى من العرض المتاح، والسالبة تعني فائضًا." />
          <InsightBox title="فجوة القيادة" value={formatDelta(totals.leadershipGap)} desc="تقارن الاحتياج القيادي المستقبلي بالقادة الجاهزين حاليًا." />
          <InsightBox title="فرق التكلفة" value={formatDelta(totals.futureCost - totals.currentCost)} desc="الفرق بين التكلفة المستقبلية المتوقعة والتكلفة الحالية للقوى العاملة." />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">لقطة التكلفة</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">التكلفة الحالية للقوى العاملة</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatNumber(totals.currentCost)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">التكلفة المستقبلية للقوى العاملة</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatNumber(totals.futureCost)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">تفسير سريع</p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <p><span className="font-semibold text-slate-900">العرض المتاح</span> يتم حسابه بعد تطبيق نسبة التسرب.</p>
              <p><span className="font-semibold text-slate-900">الطلب المستقبلي</span> يستخدم قاعدة القوى العاملة الحالية مع افتراضات النمو والتحول والأتمتة والاستعانة بمصادر خارجية وتحسن الإنتاجية.</p>
              <p><span className="font-semibold text-slate-900">الفجوة والتكلفة</span> مؤشرات ملخصة تساعد على مقارنة الهيكل الحالي مقابل الهيكل المستقبلي المخطط.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
