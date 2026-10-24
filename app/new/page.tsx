'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { CATEGORY_LABEL, PRIORITY_LABEL } from '@/lib/format';
import { CATEGORIES, PRIORITIES, dayKey, type Category, type Priority } from '@/lib/tasks';
import { useTasks } from '@/lib/useTasks';

export default function NewTaskPage() {
  const router = useRouter();
  const { add } = useTasks();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [category, setCategory] = useState<Category>('work');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  useEffect(() => setDate(dayKey(new Date())), []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('عنوان کار را وارد کن.'); return; }
    add({ title, priority, category, date, time: time || null, notes });
    router.push('/');
  }

  return (
    <form className="page form" onSubmit={submit} noValidate>
      <header className="head">
        <h1>کار جدید</h1>
        <Link href="/" className="icon-btn" aria-label="بستن">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </Link>
      </header>
      <div className="field">
        <label htmlFor="title">عنوان کار</label>
        <input id="title" value={title} maxLength={200} onChange={(e) => { setTitle(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'title-err' : undefined} autoFocus />
        {error && <p id="title-err" className="err" role="alert">{error}</p>}
      </div>
      <div className="field" role="group" aria-label="اولویت">
        <span className="lbl">اولویت</span>
        <div className="seg">{PRIORITIES.map((p) => <button type="button" key={p} aria-pressed={priority === p} onClick={() => setPriority(p)}>{PRIORITY_LABEL[p]}</button>)}</div>
      </div>
      <div className="field" role="group" aria-label="دسته‌بندی">
        <span className="lbl">دسته‌بندی</span>
        <div className="seg">{CATEGORIES.map((c) => <button type="button" key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{CATEGORY_LABEL[c]}</button>)}</div>
      </div>
      <div className="two">
        <div className="field"><label htmlFor="date">تاریخ</label><input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="field"><label htmlFor="time">ساعت (اختیاری)</label><input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
      </div>
      <div className="field"><label htmlFor="notes">یادداشت (اختیاری)</label><input id="notes" value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} /></div>
      <div className="bar-bottom"><button className="btn" type="submit">افزودن به برنامه</button></div>
    </form>
  );
}
