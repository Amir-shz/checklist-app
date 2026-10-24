'use client';
import { faDigits } from '@/lib/format';
import { dayKey } from '@/lib/tasks';
import { useTasks } from '@/lib/useTasks';

export default function SettingsPage() {
  const { tasks, now, ready, removeDone, clearAll } = useTasks();
  if (!ready || !now) return <div className="page"><p className="muted">در حال بارگذاری…</p></div>;
  const doneCount = tasks.filter((t) => t.done).length;

  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-${dayKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <header className="head"><h1>تنظیمات</h1></header>
      <section className="panel">
        <h2>داده‌ها</h2>
        <p className="muted">{faDigits(tasks.length)} کار در همین مرورگر ذخیره شده است. داده‌ها به هیچ سروری ارسال نمی‌شوند.</p>
        <button className="btn ghost" onClick={exportJson} disabled={!tasks.length}>دریافت فایل پشتیبان</button>
        <button className="btn ghost" disabled={!doneCount} onClick={() => confirm('کارهای انجام‌شده حذف شوند؟') && removeDone()}>حذف کارهای انجام‌شده ({faDigits(doneCount)})</button>
        <button className="btn danger" disabled={!tasks.length} onClick={() => confirm('همه کارها برای همیشه حذف شوند؟') && clearAll()}>حذف همه کارها</button>
      </section>
    </div>
  );
}
