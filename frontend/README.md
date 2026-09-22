# 💼 Job Board

A modern full-stack Job Board web application built as part of the **CodSoft Web Development Internship – Level 2 Task 1**.

The platform allows candidates to discover and apply for jobs, while employers can create job listings, view applicants, and manage application statuses.

---

## 🚀 Live Project

### Frontend
Coming soon — Vercel deployment

### Backend API
Coming soon — Render deployment

---

## ✨ Features

### 👤 Authentication
- Candidate registration
- Employer registration
- Login and logout
- JWT-based authentication
- Role-based access control
- Protected routes

### 💼 Job Management
- View available jobs
- Search jobs
- Filter jobs by relevant criteria
- View detailed job information
- Employers can post jobs
- Employers can view their posted jobs

### 📄 Job Applications
- Candidates can apply for jobs
- Resume upload support
- PDF, DOC and DOCX resume formats
- Cover letter submission
- Prevents duplicate applications
- Candidate application dashboard

### 🏢 Employer Dashboard
- View posted jobs
- View applicants
- View candidate information
- Update application status
- Application statuses:
  - Applied
  - Under Review
  - Shortlisted
  - Rejected

### 📧 Email Notifications
- Application confirmation email
- Application status update email
- Email notifications powered by Resend

### 📱 Responsive UI
- Modern dark interface
- Responsive design
- Mobile-friendly layout
- Smooth transitions
- Hover effects
- Modern animations
- Glassmorphism-inspired UI

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- React Router
- Axios
- CSS3

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Resend
- CORS
- dotenv

### Database

- MongoDB Atlas

### Deployment

- GitHub
- Render
- Vercel

---

## 📂 Project Structure

```text
job-board/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── SearchBar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── EmployerDashboard.jsx
│   │   │   └── PostJob.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md