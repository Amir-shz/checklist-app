import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY, createTask, addTask, toggleTask, removeTask, clearCompleted, loadTasks, saveTasks,
  visibleForDay, filterTasks, groupTasks, progress, weekStats, dayKey,
} from '../lib/tasks.ts';

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}
const NOW = new Date(2026, 9, 24, 10, 0); // 24 Oct 2026, 10:00 local
const mk = (o: Parameters<typeof createTask>[0]) => createTask(o, NOW);

test('createTask trims, applies defaults, rejects empty titles', () => {
  const t = mk({ title: '  گزارش  ' });
  assert.equal(t.title, 'گزارش');
  assert.equal(t.priority, 'normal');
  assert.equal(t.date, '2026-10-24');
  assert.equal(t.time, null);
  assert.equal(t.done, false);
  assert.throws(() => mk({ title: '   ' }), /EMPTY_TITLE/);
  assert.equal(mk({ title: 'x', time: '25:99' }).time, null);
});

test('data survives a save → load round trip in localStorage', () => {
  const s = new MemoryStorage();
  const tasks = addTask(addTask([], mk({ title: 'الف', time: '09:00', priority: 'urgent' })), mk({ title: 'ب' }));
  assert.equal(saveTasks(s, tasks), true);
  assert.ok(s.getItem(STORAGE_KEY));
  assert.deepEqual(loadTasks(s), tasks);
});

test('toggle, remove and clearCompleted behave and persist', () => {
  const s = new MemoryStorage();
  let tasks = [mk({ title: 'الف' }), mk({ title: 'ب' })];
  tasks = toggleTask(tasks, tasks[0].id, NOW);
  assert.equal(tasks[0].done, true);
  assert.equal(tasks[0].completedAt, NOW.toISOString());
  saveTasks(s, tasks);
  assert.equal(loadTasks(s)[0].done, true);
  tasks = toggleTask(tasks, tasks[0].id, NOW);
  assert.equal(tasks[0].completedAt, null);
  tasks = toggleTask(tasks, tasks[0].id, NOW);
  assert.equal(clearCompleted(tasks).length, 1);
  assert.equal(removeTask(tasks, tasks[1].id).length, 1);
});

test('corrupt or invalid storage never throws', () => {
  const s = new MemoryStorage();
  s.setItem(STORAGE_KEY, '{not json');
  assert.deepEqual(loadTasks(s), []);
  s.setItem(STORAGE_KEY, '{"a":1}');
  assert.deepEqual(loadTasks(s), []);
  s.setItem(STORAGE_KEY, JSON.stringify([{ id: '1', title: 'ok', priority: 'bad' }, { id: '', title: 'x' }, null, 5]));
  const out = loadTasks(s);
  assert.equal(out.length, 1);
  assert.equal(out[0].priority, 'normal');
});

test('saveTasks reports failure when storage throws (quota)', () => {
  const full = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } };
  assert.equal(saveTasks(full, []), false);
});

test('visibleForDay carries over unfinished tasks only', () => {
  const old = { ...mk({ title: 'قدیمی' }), date: '2026-10-20' };
  const oldDone = { ...mk({ title: 'تمام' }), date: '2026-10-20', done: true };
  const future = { ...mk({ title: 'فردا' }), date: '2026-10-25' };
  const today = mk({ title: 'امروز' });
  const titles = visibleForDay([old, oldDone, future, today], dayKey(NOW)).map((t) => t.title);
  assert.deepEqual(titles.sort(), ['امروز', 'قدیمی'].sort());
});

test('filters, grouping and progress', () => {
  const a = mk({ title: 'a', time: '10:30', priority: 'urgent', category: 'work' });
  const b = mk({ title: 'b', time: '15:00', category: 'personal' });
  const c = { ...mk({ title: 'c', time: '09:00' }), done: true, completedAt: NOW.toISOString() };
  const all = [a, b, c];
  assert.equal(filterTasks(all, 'urgent').length, 1);
  assert.equal(filterTasks(all, 'personal')[0].title, 'b');
  const g = groupTasks(all, NOW);
  assert.deepEqual(g.now.map((t) => t.title), ['a']);
  assert.deepEqual(g.later.map((t) => t.title), ['b']);
  assert.deepEqual(g.done.map((t) => t.title), ['c']);
  assert.deepEqual(progress(all), { done: 1, total: 3, percent: 33 });
  assert.deepEqual(progress([]), { done: 0, total: 0, percent: 0 });
});

test('weekStats: per-day counts, rate and streak', () => {
  const doneOn = (title: string, daysAgo: number) => {
    const when = new Date(2026, 9, 24 - daysAgo, 12, 0);
    return { ...createTask({ title, date: dayKey(when) }, when), done: true, completedAt: when.toISOString() };
  };
  const tasks = [doneOn('a', 0), doneOn('b', 0), doneOn('c', 1), doneOn('d', 2), doneOn('e', 4), mk({ title: 'open' })];
  const s = weekStats(tasks, NOW);
  assert.equal(s.days.length, 7);
  assert.equal(s.days[6].count, 2);
  assert.equal(s.days[5].count, 1);
  assert.equal(s.completed, 5);
  assert.equal(s.streak, 3);
  assert.equal(s.rate, Math.round((5 / 6) * 100));
  assert.equal(weekStats([], NOW).streak, 0);
});
