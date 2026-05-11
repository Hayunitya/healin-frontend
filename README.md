# Heal.in Frontend

Frontend web untuk platform konsultasi kesehatan mental anonim (Heal.in), dibangun dengan Next.js App Router.

## Status Saat Ini

Project ini saat ini berjalan dalam mode **dummy/local storage** untuk alur utama:
- anonymous user
- counselor
- admin
- session, chat, report, dan moderasi

Data belum terhubung ke backend final, jadi semua state disimpan sementara di browser (`localStorage`).

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state)
- React Query (provider tersedia)

## Fitur Utama

### User (Anonymous)
- Start anonymous chat (otomatis membuat anonymous user ID)
- Continue anonymous session via ID
- User dashboard (buat session by topic)
- Chat berdasarkan `sessionId`
- Session history:
  - filter status/topic
  - search
  - sorting
  - pagination

### Counselor
- Login counselor terpisah
- Dashboard counselor untuk:
  - melihat waiting queue
  - assign session
  - close session
- Reports page:
  - lihat laporan
  - filter status
  - mark reviewed
  - buka chat terkait

### Admin
- Login admin terpisah (`/admin/login`)
- Dashboard admin dengan layout panel:
  - sidebar + topbar
  - KPI cards
  - status operasional
  - manajemen data
- Hak kelola (dummy):
  - edit/delete users
  - edit status/topic/delete sessions
  - mark reviewed/delete reports

## Alur Login

Halaman `/login` punya 3 pilihan:
1. User Biasa
2. Counselor
3. Admin

### Kredensial Demo Admin (dummy)
- Username: `admin`
- Password: `1234567890`

## Struktur Route Penting

- `/` landing page
- `/login` role chooser
- `/anonymous/start`
- `/anonymous/continue`
- `/dashboard/user`
- `/dashboard/user/history`
- `/chat/[sessionId]?role=user|counselor`
- `/staff/login`
- `/staff/register`
- `/dashboard/counselor`
- `/dashboard/counselor/reports`
- `/admin/login`
- `/admin`

## Menjalankan Project

```bash
npm install
npm run dev
```

Lalu buka:
- [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Catatan Pengembangan

- Middleware role-based ada di [`middleware.ts`](./middleware.ts).
- Service dummy ada di:
  - [`lib/services/mockDb.ts`](./lib/services/mockDb.ts)
  - [`lib/services/sessions.ts`](./lib/services/sessions.ts)
  - [`lib/services/anonymous.ts`](./lib/services/anonymous.ts)
- Jika backend final siap, layer service dapat diganti dari dummy ke HTTP API tanpa mengubah struktur page besar-besaran.

## Checklist Repo untuk GitHub

Sudah disiapkan:
- `.next`, `node_modules`, env files, logs, dan file temporary di-ignore
- README sudah diperbarui sesuai kondisi project saat ini
- flow route dan role sudah terdokumentasi
