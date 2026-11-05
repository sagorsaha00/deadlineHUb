# DeadlineHub – Frontend Client

A minimal, fast, and responsive Task Assignment and Deadline Management dashboard built with React 19, TypeScript, Vite, and Tailwind CSS. Inspired by Linear and modern SaaS interfaces.

## Tech Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom Gray & White palette (#F8FAFC, #1E293B, #E2E8F0)
- **Routing**: React Router DOM (v7) with authentication & role route guards
- **Data Fetching**: TanStack React Query (v5) + Axios
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod
- **Date Utilities**: date-fns
- **Notifications**: Sonner

## Key Features
- **Live Countdown (`LiveCountdown`)**:
  - Live per-second countdown calculated in user's local timezone.
  - Warning styling (< 24h) and urgent styling (< 1h).
  - Displays "Expired" past deadline and "Completed" when finished.
  - Efficient local timers that never ping the server every second.
- **Card & Table Views**:
  - Toggle between rich visual task cards and compact table views.
- **Task Management**:
  - Full CRUD operations with Jira URL support, priority badges, and status progression.
  - Autocomplete selector for assigning tasks to existing team members or new emails.
- **Collaborative Discussions**:
  - Chronological task comment threads with author details, moderation, and in-app notifications.
- **Unified Notifications & Activity Feeds**:
  - Live unread notification counter, mark as read, and full audit logs.

## Setup & Running Locally
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Configure `.env`:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```
3. Run development server:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:5173` in your browser.

4. Build for production:
   ```bash
   pnpm build
   ```
