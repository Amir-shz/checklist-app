import type { Task } from '@/lib/tasks';
import { CATEGORY_LABEL, faDigits } from '@/lib/format';

export default function TaskRow({ task, onToggle, onRemove }: { task: Task; onToggle: () => void; onRemove: () => void }) {
  const tag = task.priority === 'urgent' ? { text: 'فوری', cls: 'urgent' } : { text: CATEGORY_LABEL[task.category], cls: task.category };
  const meta = [task.time ? `ساعت ${faDigits(task.time)}` : 'بدون ساعت', task.priority === 'important' ? 'مهم' : null]
    .filter(Boolean)
    .join('، ');
  return (
    <li className={`row${task.done ? ' done' : ''}`}>
      <button className="check" onClick={onToggle} aria-pressed={task.done} aria-label={`${task.done ? 'برگرداندن' : 'تکمیل'} «${task.title}»`}>
        <span className="box">
          {task.done && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
          )}
        </span>
      </button>
      <div className="grow">
        <span className="title">{task.title}</span>
        <span className="meta">{meta}</span>
      </div>
      <span className={`tag ${tag.cls}`}>{tag.text}</span>
      <button className="icon-btn" onClick={onRemove} aria-label={`حذف «${task.title}»`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
      </button>
    </li>
  );
}
