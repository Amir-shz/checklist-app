# چک‌لیست روزانه (Next.js)

اپلیکیشن موبایل‌محور مدیریت کارهای روزانه. فارسی و راست‌به‌چپ؛ همهٔ داده‌ها در `localStorage` مرورگر ذخیره می‌شود و به سرور نمی‌رود.

## اجرا
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # تست‌های لایهٔ داده و ذخیره‌سازی (Node 22+)
npm run typecheck
npm run build && npm start
```

## ساختار
- `lib/tasks.ts` منطق خالص: ساخت/تیک/حذف، گروه‌بندی، آمار، خواندن و نوشتن امن در localStorage (کلید `daily-checklist:v1`)
- `lib/useTasks.ts` هوک React؛ هر تغییر ابتدا از storage می‌خواند و بعد می‌نویسد، پس چند تب هم‌دیگر را بازنویسی نمی‌کنند
- `app/` صفحه‌ها: امروز، کار جدید، آمار، تنظیمات (دریافت پشتیبان JSON، حذف)
- `tests/tasks.test.ts` تست‌های ذخیره‌سازی و منطق
