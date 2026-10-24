export type Priority = 'urgent' | 'important' | 'normal';
export type Category = 'work' | 'personal' | 'meeting';
export type Filter = 'all' | 'urgent' | 'work' | 'personal';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  date: string; // YYYY-MM-DD (local)
  time: string | null; // HH:mm
  notes: string;
  done: boolean;
  createdAt: string; // ISO
  completedAt: string | null; // ISO
}

export interface NewTaskInput {
  title: string;
  priority?: Priority;
  category?: Category;
  date?: string;
  time?: string | null;
  notes?: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const STORAGE_KEY = 'daily-checklist:v1';
export const PRIORITIES: Priority[] = ['urgent', 'important', 'normal'];
export const CATEGORIES: Category[] = ['work', 'personal', 'meeting'];

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTask(input: NewTaskInput, now: Date = new Date()): Task {
  const title = (input.title ?? '').trim();
  if (!title) throw new Error('EMPTY_TITLE');
  return {
    id: newId(),
    title: title.slice(0, 200),
    priority: input.priority && PRIORITIES.includes(input.priority) ? input.priority : 'normal',
    category: input.category && CATEGORIES.includes(input.category) ? input.category : 'work',
    date: input.date && DAY_RE.test(input.date) ? input.date : dayKey(now),
    time: input.time && TIME_RE.test(input.time) ? input.time : null,
    notes: (input.notes ?? '').trim().slice(0, 1000),
    done: false,
    createdAt: now.toISOString(),
    completedAt: null,
  };
}

function validIso(v: unknown): v is string {
  return typeof v === 'string' && !Number.isNaN(Date.parse(v));
}

/** Validates one raw stored item; returns null when it cannot be repaired. */
export function sanitizeTask(raw: unknown): Task | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id || typeof r.title !== 'string' || !r.title.trim()) return null;
  const done = r.done === true;
  return {
    id: r.id,
    title: r.title.trim().slice(0, 200),
    priority: PRIORITIES.includes(r.priority as Priority) ? (r.priority as Priority) : 'normal',
    category: CATEGORIES.includes(r.category as Category) ? (r.category as Category) : 'work',
    date: typeof r.date === 'string' && DAY_RE.test(r.date) ? r.date : dayKey(new Date()),
    time: typeof r.time === 'string' && TIME_RE.test(r.time) ? r.time : null,
    notes: typeof r.notes === 'string' ? r.notes.slice(0, 1000) : '',
    done,
    createdAt: validIso(r.createdAt) ? r.createdAt : new Date().toISOString(),
    completedAt: done && validIso(r.completedAt) ? r.completedAt : null,
  };
}

export function loadTasks(storage: StorageLike): Task[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeTask).filter((t): t is Task => t !== null);
  } catch {
    return [];
  }
}

/** Returns false when the browser refuses the write (quota, private mode). */
export function saveTasks(storage: StorageLike, tasks: Task[]): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export const addTask = (tasks: Task[], task: Task): Task[] => [...tasks, task];
export const removeTask = (tasks: Task[], id: string): Task[] => tasks.filter((t) => t.id !== id);
export const clearCompleted = (tasks: Task[]): Task[] => tasks.filter((t) => !t.done);

export function toggleTask(tasks: Task[], id: string, now: Date = new Date()): Task[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done, completedAt: t.done ? null : now.toISOString() } : t,
  );
}

/** Tasks shown on a day: that day's tasks plus unfinished ones carried over from earlier days. */
export function visibleForDay(tasks: Task[], key: string): Task[] {
  return tasks.filter((t) => t.date === key || (!t.done && t.date < key));
}

export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === 'urgent') return tasks.filter((t) => t.priority === 'urgent');
  if (filter === 'work') return tasks.filter((t) => t.category === 'work');
  if (filter === 'personal') return tasks.filter((t) => t.category === 'personal');
  return tasks;
}

export function groupTasks(tasks: Task[], now: Date, horizonMin = 120) {
  const today = dayKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const rank = (t: Task) => (t.time === null ? 10000 : timeToMinutes(t.time));
  const byTime = (a: Task, b: Task) => rank(a) - rank(b) || a.createdAt.localeCompare(b.createdAt);
  const pending = tasks.filter((t) => !t.done).sort(byTime);
  const isNow = (t: Task) =>
    t.date < today || (t.time !== null ? timeToMinutes(t.time) <= nowMin + horizonMin : t.priority === 'urgent');
  return {
    now: pending.filter(isNow),
    later: pending.filter((t) => !isNow(t)),
    done: tasks
      .filter((t) => t.done)
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
  };
}

export function progress(tasks: Task[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

const WEEKDAY_FA = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']; // index = Date.getDay()

export function weekStats(tasks: Task[], now: Date) {
  const completedPerDay = new Map<string, number>();
  for (const t of tasks) {
    if (t.done && t.completedAt) {
      const k = dayKey(new Date(t.completedAt));
      completedPerDay.set(k, (completedPerDay.get(k) ?? 0) + 1);
    }
  }
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now, i - 6);
    const key = dayKey(d);
    return { key, label: WEEKDAY_FA[d.getDay()], count: completedPerDay.get(key) ?? 0 };
  });
  const inRange = tasks.filter((t) => t.date >= days[0].key && t.date <= days[6].key);
  const doneInRange = inRange.filter((t) => t.done).length;
  let streak = 0;
  let cursor = completedPerDay.has(dayKey(now)) ? now : addDays(now, -1);
  while (completedPerDay.has(dayKey(cursor)) && streak < 3650) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  const byCategory = CATEGORIES.map((c) => {
    const n = inRange.filter((t) => t.category === c).length;
    return { category: c, count: n, percent: inRange.length ? Math.round((n / inRange.length) * 100) : 0 };
  }).sort((a, b) => b.count - a.count);
  return {
    days,
    completed: days.reduce((s, d) => s + d.count, 0),
    rate: inRange.length ? Math.round((doneInRange / inRange.length) * 100) : 0,
    streak,
    byCategory,
  };
}
