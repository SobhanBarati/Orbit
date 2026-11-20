# 🪐 Orbit — Modern HR & Team Management Dashboard

![Orbit Banner](https://img.shields.io/badge/Orbit-HR_Management-F59E0B?style=for-the-badge&logo=next.js&logoColor=white)

**Orbit** is a modern, comprehensive dashboard for Human Resources (HR) management, built with a focus on user experience, minimalist design, and high performance. It empowers HR managers and employees to seamlessly manage personnel, payroll, leave requests, onboarding tasks, and team schedules.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Passwordless Login:** Secure authentication via One-Time Password (OTP) sent to the user's email.
- **Role-Based Access Control (RBAC):** Complete separation of permissions between HR Managers and regular Employees.
- **Route Protection:** `Middleware` prevents unauthorized access to dashboard pages.
- **Rate Limiting:** All sensitive API routes (OTP, Events, Uploads, etc.) are protected by Upstash Redis.
- **Input Validation:** All user inputs are validated using Zod schemas.

### 👥 People Management
- **Dynamic Profiles:** View and edit personnel data (role, team, location, base salary, and benefits).
- **Bulk Actions:** Select multiple users and update their status at once.
- **Activity History:** Display status (Active, Away, Inactive) with color-coded tags and smart filters.

### 💰 Payroll & Time Tracking
- **Automatic Calculation:** Real-time calculation of overtime based on daily work hours (over 8 hours).
- **Leave Management:** Employees submit leave requests; HR approves/rejects them with automated notifications.
- **Payslip Download:** Export each employee's payroll data as a CSV file.

### 📅 Schedule & Events
- **Weekly View:** Display meetings and events in a beautiful timeline.
- **Event Visibility:** Set access levels for each meeting (Public, My Team Only, or Private).
- **Event Management:** Create, edit, and delete events based on permissions (Creator or HR).

### ✅ Tasks & Onboarding
- **Task Categories:** Organize tasks into Paperwork, Setup, and Team categories.
- **Progress Tracking:** A dynamic progress bar that updates as tasks are completed.
- **Time Tracker:** Log daily work hours with Pause and Resume functionality.

### 🎨 Theme & UI
- **Dark Mode Support:** Smooth switching between light and dark modes.
- **Minimalist Design:** Soft colors, subtle gradients, and gentle shadows for a better visual experience.
- **Fully Responsive:** Optimized for desktop, tablet, and mobile devices.

### 🔔 Notifications
- **Real-time Alerts:** Notify HR of leave requests and inform employees of approval/rejection.
- **Read Management:** Mark notifications as read individually or in bulk.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/)) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **State Management** | [TanStack Query](https://tanstack.com/query) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) |
| **Email** | [Resend](https://resend.com/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or a free Neon account)
- Upstash Redis account (free tier)
- Resend account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/orbit-dashboard.git
cd orbit-dashboard
2. Install dependencies
bash
npm install
3. Set up environment variables
Create a .env file in the root directory and add the following:

env
# Database
DATABASE_URL="postgresql://..."

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Resend (Email)
RESEND_API_KEY="re_..."

# HR Invite Code (for registering as HR)
HR_SECRET_CODE="YOUR_HR_SECRET"
4. Set up the database
bash
npx prisma generate
npx prisma db push
5. Run the development server
bash
npm run dev
Open http://localhost:3000 in your browser.

📁 Project Structure
text
src/
├── app/                  # Next.js App Router
│   ├── (dashboard)/      # Dashboard pages (Overview, People, Payroll)
│   ├── api/              # API Routes (Auth, Tasks, Events, Leaves, ...)
│   ├── login/            # OTP Login page
│   └── register/         # Registration page
├── components/           # Shared components (Topbar, Modals, UI)
├── features/             # Feature-specific components
│   ├── overview/
│   ├── people/
│   └── payroll/
├── lib/                  # Configurations (Prisma, Utils, Validations, Rate Limit)
└── prisma/               # Database Schema
🔒 Security
Orbit takes security seriously:

Rate Limiting: All sensitive API routes are protected by Upstash Redis (e.g., 3 requests/10min for OTP, 60 requests/min for general APIs).

Input Validation: All user inputs are validated using Zod schemas.

Secure Cookies: Session cookies are httpOnly, secure in production, and have a 7-day expiry.

File Upload Limits: Uploads are limited to 2MB and 10 requests per minute per IP.

🤝 Contributing
Ideas and suggestions are always welcome!

Fork the project.

Create a new branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

📄 License
This project is licensed under the MIT License.

<div align="center"> <b>Built with ❤️ for HR teams</b> </div>