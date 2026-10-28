# 🏛️ SG Tech University (SGTU) — Smart Generation CMS

> **"Innovate Today. Lead Tomorrow."**  
> *Empowering Minds, Engineering Futures*

A complete, modern, production-oriented College Management System (CMS) engineered for **SG Tech University (SGTU)**. Designed with an innovative, prestigious, intelligent, and future-ready light-first design aesthetic, complete role-based access control (RBAC), end-to-end CRUD operations, interactive analytics, and robust database persistence.

---

## 💎 Brand Identity & Design System

| Brand Element | Specification |
|---|---|
| **Full Name** | **SG Tech University** |
| **Short Name** | **SGTU** |
| **Logo Monogram** | **SG** |
| **Brand Concept** | **Smart Generation** |
| **Main Slogan** | *Innovate Today. Lead Tomorrow.* |
| **Alternative Slogan** | *Empowering Minds, Engineering Futures* |
| **Brand Personality** | Innovative, prestigious, intelligent, future-ready |
| **Light Theme Palette** | Crisp White surfaces (`#FFFFFF`), Page Background (`#F8FAFC`), Slate Borders (`#E2E8F0`), Primary Indigo (`#4F46E5`), Deep Navy (`#0F172A`), Emerald Success (`#10B981`), Amber Warnings (`#F59E0B`), and Subtle Ambient Shadows (`rgba(17, 24, 39, 0.05)`) |

---

## 🌟 Core Functional Architecture

### 1. Multi-Tier Role-Based Access Control (RBAC)
- **Institutional Admin (Super Admin / Admin)**: University command center, student admissions & directory with CSV export, faculty onboarding, department & curriculum structure, automated exam schedules, fee invoice management, campus announcements, and security audit logs.
- **Faculty / Lecturer (Teacher)**: Subject rosters, one-click attendance recording with bulk status selection, assignment authoring with rubric scoring, student submission grading, and exam marks upload.
- **Student Academic Portal**: Personalized semester workspace, real-time subject attendance breakdown with mandatory 75% threshold alerts, coursework submission, exam grade reports with calculated GPAs, and fee invoice payments with instant receipt generation.
- **University Accounts / Bursar**: Tuition fee category setup, student invoice issuance, transaction verification, offline cash/check recording, and financial reconciliation.

### 2. Light Color UI/UX Engineering
- **Enterprise Light Aesthetic**: Modern light-first surfaces, high-contrast typography, and gentle depth layers.
- **Clean Border System**: Precise `#E2E8F0` hairline dividers that keep dense academic tables, grade cards, and rosters legible and clutter-free.
- **Micro-Animations & Visual Cues**: Fluid Framer Motion slide-overs, pulse badges for active sessions, interactive Recharts graphs, and confetti celebrations upon fee settlements.
- **Theme Flexibility**: Full dark mode toggle with persistent state in `localStorage`.

### 3. Academic & Operational Modules
- **Student Management (Full CRUD)**: Profile dossier, enrollment statuses, batch search, filtering by department/course/semester, and instant CSV export.
- **Faculty Dossiers**: Qualifications, designations, department associations, and active course allocations.
- **Curriculum Architecture**: Hierarchical Departments, Degree Programs (B.Tech, M.Tech, BCA, MCA, MBA), and Subjects with credit weightings.
- **Smart Attendance**: Session rosters with instant "Mark All Present", "Absent", "Late", or "Excused", with real-time percentage recalculation.
- **Assignments & Submissions**: Rich assignment briefs, deadline tracking, file link submissions, instructor review, and grade feedback.
- **Examinations & Transcripts**: Exam timetables, hall ticket/room allocations, marks entry, automated letter grading (`A+`, `A`, `B+`, etc.), and printable report cards.
- **Fee Management & Receipts**: Automated semester invoices, partial payment handling, printable PDF-style receipt modal.
- **Library & Knowledge Center**: University book catalogue search, real-time availability & physical shelf rack mapping, book issuing to students, return processing, overdue calculation (₹5/day late fine), and student personal loan history.
- **Campus Notice Board**: Categorized bulletins (`ACADEMIC`, `EXAM`, `EVENT`, `URGENT`) with priority markers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Recharts, Axios, Canvas Confetti |
| **Backend** | Node.js (v18+), Express.js, RESTful API architecture, JWT authentication, Bcrypt password hashing, Helmet, Morgan |
| **Database** | MongoDB with Mongoose object modeling and dual Prisma schema relational specifications (`server/prisma/schema.prisma`) |
| **Testing** | Node.js native test runner (`node:test`, `node:assert/strict`) |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js >= 18.x
- MongoDB running on `localhost:27017` (or cloud MongoDB URI)

### 1. Backend Setup

```bash
cd server
npm install

# Seed the official SG Tech University dataset
npm run seed

# Run the automated verification test suite
npm test

# Start the backend server (runs on port 5000)
npm start
```

### 2. Frontend Setup

```bash
cd client
npm install

# Build production bundle
npm run build

# Start development server (runs on port 5173)
npm run dev
```

Visit the application at: **`http://localhost:5173`**

---

## 🔑 Official SGTU Demo Accounts

The database comes pre-seeded with realistic institutional profiles for each role. You can log in manually or click any quick-fill button on the login screen:

| Role | Email / University ID | Password | Portal Scope |
|---|---|---|---|
| **Institutional Admin** | `admin@sgtu.edu` | `Admin@123` | Institutional Command Center & Full Management |
| **Super Admin** | `superadmin@sgtu.edu` | `Admin@123` | Executive System Administration & Audit Trail |
| **Faculty (HOD - CSE)** | `prof.sharma@sgtu.edu` | `Teacher@123` | Classes, Attendance, Assignments & Grading |
| **Faculty (Assoc. Prof)** | `dr.patel@sgtu.edu` | `Teacher@123` | AI & Machine Learning Coursework |
| **Student (CSE Sem 6)** | `arjun.kumar@sgtu.edu` *(or `SGTU-2023-CS01`)* | `Student@123` | Attendance, Coursework, Grades & Fee Portal |
| **Student (CSE Sem 6)** | `priya.sharma@sgtu.edu` *(or `SGTU-2023-CS02`)* | `Student@123` | Academic Records & Coursework |
| **University Accountant** | `accountant@sgtu.edu` | `Accountant@123` | Tuition Fees, Invoices & Receipt Verification |

---

## 🧪 Automated Test Verification

Run the test suite from the `server` directory:

```bash
cd server
npm test
```

**Results:**
```
▶ College Management System - API Verification Suite
  ✔ GET /api/health should return system status healthy
  ✔ POST /api/auth/login should fail with invalid credentials
  ✔ POST /api/auth/login should authenticate Admin successfully
  ✔ POST /api/auth/login should authenticate Student successfully
  ✔ GET /api/auth/me should return hydrated profile with valid token
  ✔ Role Guard: Student cannot access Admin dashboard stats
  ✔ Admin can access Admin dashboard statistics
  ✔ GET /api/departments should return all departments with counts
  ✔ GET /api/students should support search, filter and pagination
  ✔ GET /api/library/books should return books catalogue and categories
  ✔ GET /api/library/stats should return aggregate library metrics
  ✔ GET /api/library/issues should return personal borrowings for Student
  ✔ Role Guard: Student cannot add new books to library catalogue
  ✔ Admin can add new book to library catalogue
✔ College Management System - API Verification Suite (15 passed, 0 failed)
```

---

## 📋 API Endpoints Reference

| Method | Endpoint | Role Guard | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user with email or registration ID |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role details |
| `GET` | `/api/dashboard/admin` | Admin | Institutional analytics, stats, and charts |
| `GET` | `/api/dashboard/teacher` | Teacher | Faculty assigned subjects, grading queues |
| `GET` | `/api/dashboard/student` | Student | Attendance rate, assignments, fees, announcements |
| `GET` | `/api/students` | Admin / Accountant | Paginated student directory with search & filters |
| `POST` | `/api/students` | Admin | Enroll new student |
| `PUT` | `/api/students/:id` | Admin | Update student details |
| `DELETE` | `/api/students/:id` | Admin | Deactivate / remove student |
| `GET` | `/api/students/export/csv` | Admin | Export filtered student records as CSV |
| `GET` | `/api/teachers` | Admin | Faculty and staff roster |
| `GET` | `/api/departments` | Authenticated | List academic departments |
| `GET` | `/api/courses` | Authenticated | List degree programs |
| `GET` | `/api/subjects` | Authenticated | List course subjects |
| `GET` | `/api/attendance` | Authenticated | Query class attendance records |
| `POST` | `/api/attendance/batch` | Teacher / Admin | Batch record session attendance |
| `GET` | `/api/assignments` | Authenticated | Coursework assignments |
| `POST` | `/api/assignments/:id/submit` | Student | Submit assignment coursework |
| `PATCH` | `/api/assignments/submissions/:id/grade` | Teacher / Admin | Grade submission with score & feedback |
| `GET` | `/api/exams` | Authenticated | Examination schedules |
| `GET` | `/api/exams/results` | Authenticated | Examination grades and student scorecards |
| `POST` | `/api/exams/results` | Teacher / Admin | Upload examination grades |
| `GET` | `/api/fees/invoices` | Authenticated | Fee invoices with payment status |
| `POST` | `/api/fees/pay` | Student / Accountant | Record invoice payment & generate receipt |
| `GET` | `/api/library/books` | Authenticated | Searchable library catalogue & stock counts |
| `POST` | `/api/library/books` | Admin | Register new textbook into library inventory |
| `GET` | `/api/library/issues` | Authenticated | Circulation borrowing records & overdue loans |
| `POST` | `/api/library/issues` | Admin / Teacher | Issue book to enrolled student |
| `POST` | `/api/library/issues/:id/return` | Admin / Teacher | Accept return, calculate overdue fines |
| `GET` | `/api/library/stats` | Authenticated | Library holdings, active loans, overdue metrics |
| `GET` | `/api/announcements` | Authenticated | Campus notice board updates |

---

## 📄 License & Attribution

Designed and developed for **SG Tech University (SGTU)** — *Smart Generation*.  
*"Innovate Today. Lead Tomorrow."*
