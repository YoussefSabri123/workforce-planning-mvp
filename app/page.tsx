"use client";

export default function HomePage() {
  const goToProjects = () => {
    window.location.href = "/projects";
  };

  const goToNewProject = () => {
    window.location.href = "/projects/new";
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-950 text-white">
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/70">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-right">
              <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                منصة تخطيط القوى العاملة
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                WorkforceNexus AI
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                مساحة عمل حديثة ومدعومة بالذكاء الاصطناعي لتخطيط القوى العاملة — أنشئ المشاريع، وحدد الافتراضات الاستراتيجية، وسجّل عرض القوى العاملة، وتوقّع الطلب المستقبلي، وراجع الفجوات، وقارن السيناريوهات، وتابع المؤشرات الرئيسية.
              </p>

              <div className="mt-8 flex flex-wrap justify-start gap-4">
                <button
                  type="button"
                  onClick={goToProjects}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg transition hover:bg-cyan-300"
                >
                  فتح المشاريع
                </button>

                <button
                  type="button"
                  onClick={goToNewProject}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  إنشاء مشروع جديد
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm text-right">
                <p className="text-sm font-medium text-cyan-300">المشاريع</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  إنشاء وإدارة مساحات عمل تخطيط القوى العاملة.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm text-right">
                <p className="text-sm font-medium text-cyan-300">المدخلات الاستراتيجية</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  حفظ افتراضات النمو والتحول والأتمتة والاستعانة بمصادر خارجية.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm text-right">
                <p className="text-sm font-medium text-cyan-300">عرض القوى العاملة</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  تسجيل صفوف القوى العاملة الحالية وتحميل البيانات المحفوظة وتحديثها.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm text-right">
                <p className="text-sm font-medium text-cyan-300">التحليل</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  مراجعة الطلب المستقبلي والفجوات والسيناريوهات وملخص مؤشرات لوحة المعلومات.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="mb-8 text-right">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
              سير العمل
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              التدفق الحالي لتخطيط القوى العاملة
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
              اتبع مسارًا واضحًا: أنشئ مشروعًا، وحدد المدخلات الاستراتيجية، وسجّل عرض القوى العاملة الحالي، وحدد الطلب المستقبلي، وراجع الفجوات، وقارن السيناريوهات، وتابع المؤشرات المجمعة.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg text-right">
              <h3 className="text-lg font-semibold text-white">1. إنشاء مشروع</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                ابدأ بسياق الشركة وأفق التخطيط والوحدات التنظيمية والعملة.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg text-right">
              <h3 className="text-lg font-semibold text-white">2. المدخلات الاستراتيجية</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                حدد افتراضات النمو والتحول والأتمتة والاستعانة بمصادر خارجية والإنتاجية.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg text-right">
              <h3 className="text-lg font-semibold text-white">3. عرض القوى العاملة الحالي</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                سجّل صفوف العرض الحالية بما في ذلك العدد والتسرب والإنتاجية والتكلفة.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg text-right">
              <h3 className="text-lg font-semibold text-white">4. الطلب المستقبلي</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                حدد متطلبات الأدوار المستقبلية ونموذج التشغيل والاحتياج القيادي.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg text-right">
              <h3 className="text-lg font-semibold text-white">5. تحليل الفجوات</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                قارن العرض بالطلب وقدّر فجوات القوى العاملة والقيادة.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg text-right">
              <h3 className="text-lg font-semibold text-white">6. تخطيط السيناريوهات</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                قارن عدة سيناريوهات وراجع تأثيرها على احتياجات القوى العاملة.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
