'use client';
import { CATEGORY_LABEL, faDigits } from '@/lib/format';
import { weekStats } from '@/lib/tasks';
import { useTasks } from '@/lib/useTasks';

export default function StatsPage() {
  const { tasks, now, ready } = useTasks();
  if (!ready || !now) return <div className="page"><p className="muted">در حال بارگذاری…</p></div>;
  const s = weekStats(tasks, now);
  const max = Math.max(1, ...s.days.map((d) => d.count));
  return (
    <div className="page">
      <header className="head"><div><p className="muted">هفت روز گذشته</p><h1>آمار عملکرد</h1></div></header>
      <div className="kpis">
        <div className="kpi"><strong>{faDigits(s.completed)}</strong><span>کار انجام‌شده</span></div>
        <div className="kpi"><strong>{faDigits(s.rate)}٪</strong><span>نرخ تکمیل</span></div>
        <div className="kpi"><strong>{faDigits(s.streak)}</strong><span>روز پیاپی</span></div>
      </div>
      <section className="panel">
        <h2>کارهای انجام‌شده در هر روز</h2>
        <div className="bars" role="img" aria-label={`نمودار ستونی: ${s.days.map((d) => `${d.label} ${faDigits(d.count)}`).join('، ')}`}>
          {s.days.map((d, i) => (
            <div key={d.key} className="barcol">
              <div className={`bar${i === 6 ? ' today' : ''}`} style={{ height: `${Math.max((d.count / max) * 100, d.count ? 8 : 3)}%` }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>توزیع بر اساس دسته</h2>
        {s.byCategory.map((c) => (
          <div key={c.category} className="catrow">
            <div><span>{CATEGORY_LABEL[c.category]}</span><span className="muted">{faDigits(c.percent)}٪</span></div>
            <div className="track light"><div className={`fill ${c.category}`} style={{ width: `${c.percent}%` }} /></div>
          </div>
        ))}
      </section>
    </div>
  );
}
