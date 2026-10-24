const D = '۰۱۲۳۴۵۶۷۸۹';
export const faDigits = (s: string | number) => String(s).replace(/\d/g, (d) => D[Number(d)]);
export const formatDay = (d: Date) =>
  new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
export const CATEGORY_LABEL = { work: 'کاری', personal: 'شخصی', meeting: 'جلسه' } as const;
export const PRIORITY_LABEL = { urgent: 'فوری', important: 'مهم', normal: 'عادی' } as const;
