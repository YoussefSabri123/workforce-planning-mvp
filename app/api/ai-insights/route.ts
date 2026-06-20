import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type AIContext = {
  projectName?: string;
  companyName?: string;
  currentHeadcount?: number;
  availableSupply?: number;
  futureDemand?: number;
  headcountGap?: number;
  leadershipGap?: number;
  currentCost?: number;
  futureCost?: number;
  costDelta?: number;
  scenarioCount?: number;
  criticalRoles?: number;
  strategicInputsText?: string;
  latestScenarioText?: string;
};

type RequestBody = {
  question?: string;
  context?: AIContext;
};

function missingEnvVars() {
  const required = [
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_DEPLOYMENT",
  ];

  return required.filter((name) => !process.env[name]);
}

function buildSystemPrompt() {
  return [
    "أنت مستشار تنفيذي لتخطيط القوى العاملة داخل تطبيق WorkforceNexus AI.",
    "مهمتك هي شرح الوضع الحالي للمشروع بلغة عربية مهنية وواضحة ومختصرة.",
    "يجب أن تعتمد فقط على البيانات المرسلة لك في السياق، ولا تخترع أي أرقام غير موجودة.",
    "إذا كانت البيانات غير كافية، قل ذلك بوضوح ثم اقترح ما البيانات التي يجب إدخالها.",
    "ركّز على: المخاطر، الأولويات، التكلفة، الفجوات، والسيناريوهات عند الحاجة.",
    "يفضل أن تكون الإجابة بين 4 و8 جمل إلا إذا كان السؤال يحتاج تفاصيل إضافية.",
  ].join(" ");
}

function buildUserPrompt(question: string, context: AIContext) {
  return [
    `السؤال: ${question}`,
    "سياق المشروع:",
    `- اسم المشروع: ${context.projectName || "غير متوفر"}`,
    `- اسم الشركة: ${context.companyName || "غير متوفر"}`,
    `- العدد الحالي: ${context.currentHeadcount ?? 0}`,
    `- العرض المتاح: ${context.availableSupply ?? 0}`,
    `- الطلب المستقبلي: ${context.futureDemand ?? 0}`,
    `- فجوة العدد: ${context.headcountGap ?? 0}`,
    `- فجوة القيادة: ${context.leadershipGap ?? 0}`,
    `- التكلفة الحالية: ${context.currentCost ?? 0}`,
    `- التكلفة المستقبلية: ${context.futureCost ?? 0}`,
    `- فرق التكلفة: ${context.costDelta ?? 0}`,
    `- عدد السيناريوهات: ${context.scenarioCount ?? 0}`,
    `- عدد الأدوار الحرجة: ${context.criticalRoles ?? 0}`,
    `- ملخص المدخلات الاستراتيجية: ${context.strategicInputsText || "غير متوفر"}`,
    `- أحدث سيناريو: ${context.latestScenarioText || "غير متوفر"}`,
    "أجب بالعربية مع تفسير عملي وإشارة إلى الإجراء المقترح إذا كان ذلك مناسبًا.",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const missing = missingEnvVars();

    if (missing.length > 0) {
      return NextResponse.json(
        {
          answer:
            "Azure OpenAI غير مهيأ بعد. أضف متغيرات البيئة المطلوبة على الخادم ثم أعد المحاولة.",
          missing,
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const question = (body?.question || "").trim();
    const context = body?.context || {};

    if (!question) {
      return NextResponse.json(
        { answer: "اكتب سؤالك أولًا ثم أعد المحاولة." },
        { status: 400 }
      );
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const apiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

    const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(question, context) },
        ],
        temperature: 0.4,
        max_tokens: 700,
      }),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      const message =
        result?.error?.message ||
        result?.message ||
        "Azure OpenAI request failed.";
      return NextResponse.json({ answer: message }, { status: response.status });
    }

    const answer = result?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { answer: "لم يتم استلام إجابة صالحة من Azure OpenAI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ answer: message }, { status: 500 });
  }
}