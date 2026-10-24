'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  STORAGE_KEY, addTask, clearCompleted, createTask, loadTasks, removeTask, saveTasks, toggleTask,
  type NewTaskInput, type StorageLike, type Task,
} from './tasks';

const unavailable: StorageLike = {
  getItem: () => null,
  setItem: () => { throw new Error('localStorage unavailable'); },
};
function getStorage(): StorageLike {
  try { return window.localStorage; } catch { return unavailable; }
}

/** All data lives in the browser's localStorage. Every change re-reads storage first, so several tabs never overwrite each other. */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setTasks(loadTasks(getStorage()));
    setNow(new Date());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setTasks(loadTasks(getStorage()));
    };
    window.addEventListener('storage', onStorage);
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(tick); };
  }, []);

  const commit = useCallback((change: (current: Task[]) => Task[]) => {
    const storage = getStorage();
    const next = change(loadTasks(storage));
    setSaveError(!saveTasks(storage, next));
    setTasks(next);
  }, []);

  return {
    tasks, ready, now, saveError,
    add: (input: NewTaskInput) => commit((t) => addTask(t, createTask(input))),
    toggle: (id: string) => commit((t) => toggleTask(t, id)),
    remove: (id: string) => commit((t) => removeTask(t, id)),
    removeDone: () => commit(clearCompleted),
    clearAll: () => commit(() => []),
  };
}
