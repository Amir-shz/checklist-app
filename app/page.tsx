'use client';
import Link from 'next/link';
import { useState } from 'react';
import TaskRow from '@/components/TaskRow';
import { faDigits, formatDay } from '@/lib/format';
import { dayKey, filterTasks, groupTasks, progress, visibleForDay, type Filter, type Task } from '@/lib/tasks';
import { useTasks } from '@/lib/useTasks';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'همه' }, { id: 'urgent', label: 'فوری' }, { id: 'work', label: 'کاری' }, { id: 'personal', label: 'شخصی' },
];

function Section({ title, items, onToggle, onRemove }: { title: string; items: Task[]; onToggle: (id: string) => void; onRemove: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <section>
      <div className="sec"><h2>{title}</h2><span>{faDigits(items.length)}</span></div>
      <ul className="list">
        {items.map((t) => <TaskRow key={t.id} task={t} onToggle={() => onToggle(t.id)} onRemove={() => onRemove(t.id)} />)}
      </ul>
    </section>
  );
}

export default function TodayPage() {
  const { tasks, now, ready, saveError, toggle, remove } = useTasks();
  const [filter, setFilter] = useState<Filter>('all');
  if (!ready || !now) return <div className="page"><p className="muted">در حال بارگذاری…</p></div>;

  const day = visibleForDay(tasks, dayKey(now));
  const p = progress(day);
  const urgentLeft = day.filter((t) => !t.done && t.priority === 'urgent').length;
  const groups = groupTasks(filterTasks(day, filter), now);
  const shownCount = groups.now.length + groups.later.length + groups.done.length;

  return (
    <div className="page">
      <header className="head">
        <div><p className="muted">{formatDay(now)}</p><h1>برنامه امروز</h1></div>
      </header>
      {saveError && <p className="alert" role="alert">ذخیره در مرورگر ممکن نیست. حالت ناشناس را خاموش کن یا فضای مرورگر را خالی کن.</p>}
      <div className="hero">
        <div className="hero-top">
          <strong>{p.total ? `${faDigits(p.done)} از ${faDigits(p.total)} کار انجام شد` : 'برنامه امروز خالی است'}</strong>
          <span className="pct">{faDigits(p.percent)}٪</span>
        </div>
        <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.percent} aria-label="پیشرفت امروز">
          <div className="fill" style={{ width: `${p.percent}%` }} />
        </div>
        <span className="hint">{urgentLeft ? `${faDigits(urgentLeft)} کار فوری باقی مانده` : 'کار فوری باقی نمانده'}</span>
      </div>
      <div className="chips" role="group" aria-label="فیلتر کارها">
        {FILTERS.map((f) => (
          <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      {shownCount === 0 ? (
        <div className="empty">
          <p>{day.length ? 'کاری با این فیلتر پیدا نشد.' : 'هنوز کاری برای امروز ننوشته‌ای.'}</p>
          {!day.length && <Link href="/new" className="btn small">افزودن اولین کار</Link>}
        </div>
      ) : (
        <div className="stack">
          <Section title="الان" items={groups.now} onToggle={toggle} onRemove={remove} />
          <Section title="بعداً" items={groups.later} onToggle={toggle} onRemove={remove} />
          <Section title="انجام‌شده" items={groups.done} onToggle={toggle} onRemove={remove} />
        </div>
      )}
      <Link href="/new" className="fab" aria-label="افزودن کار جدید">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </Link>
    </div>
  );
}
