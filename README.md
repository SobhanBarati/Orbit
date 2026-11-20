# 🏢 Caterie - Modern HR Management Dashboard

![Caterie Banner](https://img.shields.io/badge/Caterie-HR_Management-18181B?style=for-the-badge&logo=next.js&logoColor=white)

**Caterie** یک داشبورد مدرن و جامع برای مدیریت منابع انسانی (HR) است که با تمرکز بر تجربه کاربری (UX)، طراحی مینیمال و عملکرد بالا ساخته شده است. این سیستم به مدیران منابع انسانی و کارمندان امکان مدیریت یکپارچه‌ی پرسنل، حقوق و دستمزد، مرخصی‌ها، تسک‌های آنبوردینگ و تقویم جلسات را می‌دهد.

---

## ✨ ویژگی‌های کلیدی

### 🔐 احراز هویت و امنیت
- **ورود بدون رمز (Passwordless):** احراز هویت امن با استفاده از کد یکبار مصرف (OTP) ارسال شده به ایمیل.
- **کنترل دسترسی مبتنی بر نقش (RBAC):** تفکیک کامل دسترسی‌ها بین مدیر منابع انسانی (HR) و کارمندان عادی (Employee).
- **محافظت از مسیرها:** استفاده از `Middleware` برای جلوگیری از دسترسی افراد غیرمجاز به صفحات داشبورد.

### 👥 مدیریت پرسنل (People)
- **پروفایل داینامیک:** مشاهده و ویرایش اطلاعات پرسنلی (نقش، تیم، موقعیت مکانی، حقوق پایه و مزایا).
- **ویرایش گروهی:** امکان انتخاب چندین کاربر و تغییر وضعیت آن‌ها به صورت یکجا (Bulk Actions).
- **تاریخچه فعالیت:** نمایش وضعیت (Active, Away, Inactive) با تگ‌های رنگی و فیلترهای هوشمند.

### 💰 حقوق و دستمزد (Payroll)
- **محاسبه خودکار:** محاسبه لحظه‌ای اضافه‌کاری (Overtime) بر اساس زمان کارکرد روزانه (بیش از ۸ ساعت).
- **مدیریت مرخصی‌ها (Leave):** ثبت درخواست مرخصی توسط کارمند و تایید/رد آن توسط HR همراه با ارسال اعلان (Notification).
- **دانلود فیش حقوقی:** خروجی CSV از اطلاعات حقوق و دستمزد هر کارمند.

### 📅 تقویم و جلسات (Schedule)
- **نمای هفتگی:** نمایش جلسات و رویدادها در یک Timeline زیبا.
- **تنظیمات دسترسی رویداد:** تعیین سطح دسترسی برای هر جلسه (عمومی، فقط تیم من، یا خصوصی).
- **مدیریت رویدادها:** ایجاد، ویرایش و حذف رویدادها بر اساس سطح دسترسی (سازنده یا HR).

### ✅ تسک‌ها و آنبوردینگ (Onboarding)
- **دسته‌بندی تسک‌ها:** تفکیک تسک‌ها به دسته‌های Paperwork، Setup و Team.
- **پیگیری پیشرفت:** نوار پیشرفت (Progress Bar) به صورت داینامیک با تکمیل هر تسک.
- **تایم‌ترکر (Time Tracker):** ثبت زمان کارکرد روزانه با قابلیت Pause و Resume.

### 🎨 تم و ظاهر (Theme)
- **پشتیبانی از Dark Mode:** جابجایی روان بین حالت روشن و تاریک.
- **طراحی مینیمال:** استفاده از رنگ‌های ملایم، گرادیانت‌های ظریف و سایه‌های نرم برای تجربه بصری بهتر.
- **ریسپانسیو:** نمایش بهینه در دستگاه‌های مختلف (دسکتاپ، تبلت و موبایل).

### 🔔 سیستم اعلان‌ها (Notifications)
- **اعلان‌های Real-time:** اطلاع‌رسانی درخواست‌های مرخصی به HR و اطلاع‌رسانی تایید/رد آن به کارمند.
- **مدیریت خوانده‌شده‌ها:** امکان علامت‌گذاری اعلان‌ها به صورت تکی یا گروهی (Mark all as read).

---

## 🛠 تکنولوژی‌های استفاده شده

- **فریمورک:** [Next.js 14](https://nextjs.org/) (App Router)
- **زبان:** [TypeScript](https://www.typescriptlang.org/)
- **استایل‌دهی:** [Tailwind CSS](https://tailwindcss.com/)
- **دیتابیس و ORM:** [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)
- **مدیریت State و Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **انیمیشن:** [Framer Motion](https://www.framer.com/motion/)
- **آیکون‌ها:** [Lucide React](https://lucide.dev/)
- **کامپوننت‌های UI:** [Radix UI](https://www.radix-ui.com/) + شادسی‌ان (shadcn/ui)

---

## 🚀 راه‌اندازی پروژه (Local Setup)

برای اجرای این پروژه روی سیستم خودتون، مراحل زیر رو دنبال کنید:

### پیش‌نیازها
- Node.js (نسخه 18 یا بالاتر)
- PostgreSQL (یا یک دیتابیس ابری مثل Neon)

### نصب و اجرا

۱. مخزن را کلون کنید:
```bash
git clone https://github.com/your-username/caterie-dashboard.git
cd caterie-dashboard

۲. پکیج‌ها را نصب کنید:

bash
npm install
۳. متغیرهای محیطی (.env) را تنظیم کنید:
یک فایل .env در روت پروژه بسازید و مقادیر زیر را وارد کنید:

env
DATABASE_URL="postgresql://user:password@localhost:5432/caterie"
HR_SECRET_CODE="Your_Secret_key"
۴. دیتابیس را همگام‌سازی کنید:

bash
npx prisma generate
npx prisma db push
۵. پروژه را اجرا کنید:

bash
npm run dev
حالا می‌توانید پروژه را در مرورگر خود روی آدرس http://localhost:3000 مشاهده کنید.

📁 ساختار پروژه
text
src/
├── app/                  # مسیرهای Next.js (App Router)
│   ├── (dashboard)/      # صفحات داشبورد (Overview, People, Payroll)
│   ├── api/              # API Routes (Auth, Tasks, Events, Leaves, ...)
│   ├── login/            # صفحه ورود با OTP
│   └── register/         # صفحه ثبت‌نام
├── components/           # کامپوننت‌های مشترک (Topbar, Modals, UI)
├── features/             # کامپوننت‌های اختصاصی هر بخش
│   ├── overview/
│   ├── people/
│   └── payroll/
├── lib/                  # پیکربندی‌ها (Prisma, Utils)
└── prisma/               # فایل Schema دیتابیس
🤝 مشارکت (Contributing)
اگر ایده یا پیشنهادی برای بهبود پروژه دارید، خوشحال می‌شوم بشنوم!
۱. پروژه را Fork کنید.
۲. یک برنچ جدید بسازید (git checkout -b feature/AmazingFeature).
۳. تغییرات را کامیت کنید (git commit -m 'Add some AmazingFeature').
۴. پوش کنید (git push origin feature/AmazingFeature).
۵. یک Pull Request باز کنید.

📄 لایسنس
این پروژه تحت لایسنس MIT منتشر شده است.

<div align="center"> <b>ساخته شده با ❤️ برای تیم‌های منابع انسانی</b> </div> 