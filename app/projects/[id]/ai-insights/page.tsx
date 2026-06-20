"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  critical_role: boolean | null;
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

type AIState = {
  currentHeadcount: number;
  availableSupply: number;
  futureDemand: number;
  headcountGap: number;
  leadershipGap: number;
  currentCost: number;
  futureCost: number;
  costDelta: number;
  scenarioCount: number;
  criticalRoles: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDelta(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `-${formatNumber(Math.abs(value))}`;
  return "0";
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-right">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  );
}

function SummaryCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
      <p
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent}`}
      >
        {title}
      </p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildContextPayload(
  project: Project | null,
  state: AIState,
  strategicInputs: StrategicInputs | null,
  latestScenario: Scenario | null
) {
  return {
    projectName: project?.project_name || "",
    companyName: project?.company_name || "",
    currentHeadcount: state.currentHeadcount,
    availableSupply: state.availableSupply,
    futureDemand: state.futureDemand,
    headcountGap: state.headcountGap,
    leadershipGap: state.leadershipGap,
    currentCost: state.currentCost,
    futureCost: state.futureCost,
    costDelta: state.costDelta,
    scenarioCount: state.scenarioCount,
    criticalRoles: state.criticalRoles,
    strategicInputsText: strategicInputs
      ? `النمو ${strategicInputs.growth_pct}% · التحول ${strategicInputs.transformation_pct}% · الأتمتة ${strategicInputs.automation_pct}% · الاستعانة بمصادر خارجية ${strategicInputs.outsourcing_pct}% · تحسن الإنتاجية ${strategicInputs.productivity_gain_pct}%`
      : "",
    latestScenarioText: latestScenario
      ? `${latestScenario.scenario_name} | النمو ${latestScenario.growth_pct}% | الأتمتة ${latestScenario.automation_pct}% | الاستعانة بمصادر خارجية ${latestScenario.outsourcing_pct}% | تحسن الإنتاجية ${latestScenario.productivity_gain_pct}%`
      : "",
  };
}

export default function AIInsightsPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [project, setProject] = useState<Project | null>(null);
  const [strategicInputs, setStrategicInputs] =
    useState<StrategicInputs | null>(null);
  const [latestScenario, setLatestScenario] = useState<Scenario | null>(null);
  const [state, setState] = useState<AIState>({
    currentHeadcount: 0,
    availableSupply: 0,
    futureDemand: 0,
    headcountGap: 0,
    leadershipGap: 0,
    currentCost: 0,
    futureCost: 0,
    costDelta: 0,
    scenarioCount: 0,
    criticalRoles: 0,
  });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
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
          .select(
            "current_headcount, attrition_pct, cost_per_employee, current_ready_leaders, critical_role"
          )
          .eq("project_id", projectId),
        supabase
          .from("workforce_future_requirements")
          .select("future_leadership_demand")
          .eq("project_id", projectId),
        supabase
          .from("workforce_strategic_inputs")
          .select(
            "growth_pct, transformation_pct, automation_pct, outsourcing_pct, productivity_gain_pct"
          )
          .eq("project_id", projectId)
          .maybeSingle(),
        supabase
          .from("workforce_scenarios")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId),
        supabase
          .from("workforce_scenarios")
          .select(
            "scenario_name, growth_pct, automation_pct, outsourcing_pct, productivity_gain_pct, capability_expansion_pct, created_at"
          )
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
            "حدث خطأ أثناء تحميل صفحة التحليلات الذكية."
        );
        setLoading(false);
        return;
      }

      const supplyLines = (supplyResult.data as SupplyLine[] | null) || [];
      const futureLines =
        (futureResult.data as FutureRequirement[] | null) || [];
      const strategic = (strategicResult.data as StrategicInputs | null) || null;
      const latest = (latestScenarioResult.data as Scenario | null) || null;

      const growthPct = strategic?.growth_pct || 0;
      const transformationPct = strategic?.transformation_pct || 0;
      const automationPct = strategic?.automation_pct || 0;
      const outsourcingPct = strategic?.outsourcing_pct || 0;
      const productivityGainPct = strategic?.productivity_gain_pct || 0;

      const currentHeadcount = supplyLines.reduce(
        (sum, item) => sum + (item.current_headcount || 0),
        0
      );

      const availableSupply = supplyLines.reduce(
        (sum, item) =>
          sum +
          Math.round(
            (item.current_headcount || 0) *
              (1 - (item.attrition_pct || 0) / 100)
          ),
        0
      );

      const futureDemand = supplyLines.reduce(
        (sum, item) =>
          sum +
          Math.round(
            (item.current_headcount || 0) *
              (1 +
                growthPct / 100 +
                transformationPct / 100 -
                automationPct / 100 -
                outsourcingPct / 100 -
                productivityGainPct / 100)
          ),
        0
      );

      const currentCost = supplyLines.reduce(
        (sum, item) =>
          sum + (item.current_headcount || 0) * (item.cost_per_employee || 0),
        0
      );

      const futureCost = supplyLines.reduce(
        (sum, item) =>
          sum +
          Math.round(
            (item.current_headcount || 0) *
              (1 +
                growthPct / 100 +
                transformationPct / 100 -
                automationPct / 100 -
                outsourcingPct / 100 -
                productivityGainPct / 100)
          ) *
            (item.cost_per_employee || 0),
        0
      );

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
      setLatestScenario(latest);
      setState({
        currentHeadcount,
        availableSupply,
        futureDemand,
        headcountGap: futureDemand - availableSupply,
        leadershipGap: futureLeadershipDemand - currentReadyLeaders,
        currentCost,
        futureCost,
        costDelta: futureCost - currentCost,
        scenarioCount: scenarioCountResult.count || 0,
        criticalRoles: supplyLines.filter((i) => Boolean(i.critical_role)).length,
      });
      setLoading(false);
    }

    loadData();
  }, [projectId]);

  const summaryLines = useMemo(() => {
    return [
      state.headcountGap > 0
        ? `يوجد نقص متوقع في القوى العاملة بمقدار ${formatNumber(
            state.headcountGap
          )} موظف.`
        : state.headcountGap < 0
        ? `يوجد فائض متوقع في القوى العاملة بمقدار ${formatNumber(
            Math.abs(state.headcountGap)
          )} موظف.`
        : "لا توجد فجوة عددية متوقعة حاليًا.",
      state.leadershipGap > 0
        ? `توجد فجوة قيادية مقدارها ${formatNumber(state.leadershipGap)}.`
        : state.leadershipGap < 0
        ? `توجد وفرة قيادية مقدارها ${formatNumber(
            Math.abs(state.leadershipGap)
          )}.`
        : "لا توجد فجوة قيادية متوقعة حاليًا.",
      state.costDelta > 0
        ? `التكلفة المستقبلية أعلى من الحالية بمقدار ${formatNumber(
            state.costDelta
          )}.`
        : state.costDelta < 0
        ? `التكلفة المستقبلية أقل من الحالية بمقدار ${formatNumber(
            Math.abs(state.costDelta)
          )}.`
        : "لا يوجد فرق واضح في التكلفة بين الوضع الحالي والمستقبلي.",
    ];
  }, [state]);

  async function askAzure(q: string) {
    if (!q.trim()) {
      setAnswer("اكتب سؤالك أولًا ثم اضغط إرسال.");
      return;
    }

    setAsking(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context: buildContextPayload(
            project,
            state,
            strategicInputs,
            latestScenario
          ),
        }),
      });

      const data = await res.json();
      setAnswer(data?.answer || "لم يتم استلام إجابة من Azure OpenAI.");
    } catch (error) {
      setAnswer(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الاتصال بـ Azure OpenAI."
      );
    } finally {
      setAsking(false);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await askAzure(question);
  };

  const goToWorkspace = () => {
    window.location.href = `/projects/${projectId}`;
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            جارٍ تحميل التحليلات الذكية...
          </p>
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
                التحليلات الذكية
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {project?.project_name || "مستشار القوى العاملة الذكي"}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                {project?.company_name || "اسم الشركة"}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                هذه الصفحة تستخدم Azure OpenAI للإجابة على الأسئلة التفاعلية
                اعتمادًا على سياق المشروع الحالي.
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
              <p className="text-sm font-medium text-cyan-300">ملخص سريع</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {project?.project_name || "المشروع"} يحتوي حاليًا على{" "}
                {formatNumber(state.currentHeadcount)} كقوة عاملة حالية، و
                {formatNumber(state.availableSupply)} كعرض متاح، و
                {formatNumber(state.futureDemand)} كطلب مستقبلي، مع{" "}
                {formatNumber(state.scenarioCount)} سيناريوهات محفوظة.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="العدد الحالي"
            value={formatNumber(state.currentHeadcount)}
            hint="إجمالي القوى العاملة الحالية في المشروع."
          />
          <MetricCard
            title="العرض المتاح"
            value={formatNumber(state.availableSupply)}
            hint="القوى العاملة المتوقعة بعد التسرب."
          />
          <MetricCard
            title="الطلب المستقبلي"
            value={formatNumber(state.futureDemand)}
            hint="الاحتياج المتوقع بناءً على الافتراضات الحالية."
          />
          <MetricCard
            title="عدد السيناريوهات"
            value={formatNumber(state.scenarioCount)}
            hint="عدد السيناريوهات المحفوظة داخل المشروع."
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <InsightCard
            title="فجوة العدد"
            value={formatDelta(state.headcountGap)}
            hint="موجبة = نقص، سالبة = فائض."
          />
          <InsightCard
            title="فجوة القيادة"
            value={formatDelta(state.leadershipGap)}
            hint="الفارق بين القادة المطلوبين والقادة الجاهزين حاليًا."
          />
          <InsightCard
            title="فرق التكلفة"
            value={formatDelta(state.costDelta)}
            hint="الفارق بين التكلفة المستقبلية والتكلفة الحالية."
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-1">
          <SummaryCard
            title="الملخص التنفيذي"
            items={summaryLines}
            accent="bg-cyan-50 text-cyan-700"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            اسأل Azure OpenAI
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            اختر سؤالًا جاهزًا أو اكتب سؤالك بنفسك. سيتم إرسال السؤال مع سياق
            المشروع الحالي إلى Azure OpenAI.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 justify-start">
            <button
              type="button"
              onClick={() => {
                setQuestion("ما أكبر خطر حاليًا؟");
                askAzure("ما أكبر خطر حاليًا؟");
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              ما أكبر خطر حاليًا؟
            </button>

            <button
              type="button"
              onClick={() => {
                setQuestion("ما أولوية العمل الأولى؟");
                askAzure("ما أولوية العمل الأولى؟");
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              ما أولوية العمل الأولى؟
            </button>

            <button
              type="button"
              onClick={() => {
                setQuestion("كيف أقرأ أحدث سيناريو؟");
                askAzure("كيف أقرأ أحدث سيناريو؟");
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              كيف أقرأ أحدث سيناريو؟
            </button>

            <button
              type="button"
              onClick={() => {
                setQuestion("كيف تؤثر الافتراضات الحالية؟");
                askAzure("كيف تؤثر الافتراضات الحالية؟");
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              كيف تؤثر الافتراضات الحالية؟
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                اكتب سؤالك
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="مثال: ما أفضل إجراء الآن؟ أو ما أكبر خطر في هذا المشروع؟"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="flex justify-start">
              <button
                type="submit"
                disabled={asking}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {asking ? "جارٍ التحليل..." : "إرسال السؤال إلى Azure OpenAI"}
              </button>
            </div>

            {answer ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm leading-8 text-slate-700 whitespace-pre-line">
                  {answer}
                </p>
              </div>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}