Understood.
Below is **ONE COMPLETE, CLEAN, PROFESSIONAL README.md** — all in **one continuous markdown block**, properly formatted, no breaks, no missing parts.
You can **copy & paste directly into your README.md**.

---


# 🏥 VienLink Blood Bank Management System

A full-stack, enterprise-grade **Blood Bank Management System** designed for hospitals, donors, and the general public.  
VienLink provides **80+ production-level features** including blood inventory management, donation scheduling, AI-powered analytics, inter-hospital transfers, and secure multi-role authentication.

---

## 🌐 Deployed Links
🔗 **Live Frontend:** _Add your frontend deployed link here_  
🔗 **Backend API:** _Add your backend deployed link here_  
🔗 **Admin Panel:** _Add admin link (optional)_  

---

## 📸 Project Preview  
_Add screenshots or GIF demos here_

---

# 📌 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#%EF%B8%8F-installation--setup)
- [Project Structure](#-project-structure)
- [Running Tests](#-running-tests)
- [API Base URL](#-api-base-url)
- [API Documentation](#%EF%B8%8F-api-documentation)
- [Response Formats](#-response-formats)
- [Deployment Instructions](#-deployment-instructions)
- [Contributing](#-contributing)
- [License](#-license)

---

# ⭐ Features

## 🔐 Authentication & User Management
- Multi-role authentication (Super Admin, Hospital Admin, Staff)
- JWT authentication (access + refresh)
- Hospital onboarding & approval flow
- User profile + password update with in-app verification
- Public donor/recipient account system
- Forgot-password via code verification
- Medical history management

## 🩸 Blood Inventory Management
- Real-time inventory by blood group
- Blood unit expiry tracking
- QC statuses (Tested, Safe, Rejected)
- Low stock alerts
- Inventory analytics dashboard

## ❤️ Donation System
- Donor registration & profile
- Donation slot booking
- Eligibility validation
- Donation history
- Donor reward system

## 📋 Blood Request System
- Hospital blood requests
- Public blood request workflow
- Status tracking (Pending, Approved, Rejected, Fulfilled)
- Blood matching algorithm
- Emergency request prioritization

## 🤝 Inter-Hospital Collaboration
- Blood transfer request system
- Approval workflow
- Dispatch & logistics tracking
- Transfer history reporting

## 📅 Blood Camp Management
- Organize and promote blood donation camps
- Public camp directory
- Donor registrations
- Camp reminders
- Camp performance analytics

## 📊 Analytics & AI
- Donation trends & KPIs
- Blood demand forecasting
- Donor matching optimization
- Real-time dashboards
- Expiry prediction analytics

## 🎨 UI/UX Features
- Fully responsive UI
- Light/Dark theme toggle
- Mobile-first design
- Accessible components (WCAG)
- High contrast mode

## � Real-Time Notifications System
- **Socket.IO powered** real-time notifications
- **Blood request status updates** (approved, rejected, fulfilled)
- **Low stock alerts** with automatic monitoring
- **Emergency broadcasts** across all hospitals
- **Inter-hospital transfer notifications**
- **Blood camp updates** and reminders
- **Browser notifications** support
- **Notification preferences** and settings
- **Connection status indicators**
- **Priority-based filtering** (high, medium, low)
- **In-app notification center** with history
- **Sound notifications** with mute options
- **Role-based notification routing**

## � Security & Infrastructure
- RBAC authorization
- Rate limiting
- Encrypted passwords
- Sanitized inputs
- Action audit logs
- Secure cloud file storage

---

# 🧩 Tech Stack

## Frontend
- React.js / Next.js
- Redux / Context API
- TailwindCSS / Material UI
- Axios

## Backend
- Node.js (Express.js)
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer
- Cloudinary / AWS S3

## DevOps
- GitHub
- Render / Railway / AWS
- Vercel / Netlify
- Docker (optional)

---

# 🏛 System Architecture

```

┌───────────────────────────┐
│        Frontend UI        │
│  (React / Next + Axios)   │
└───────────────┬───────────┘
│
REST API Calls
│
┌───────────────▼──────────────┐
│       Backend Server          │
│ (Node.js + Express + JWT)     │
└───────────────┬──────────────┘
│
Database Operations
│
┌───────────────▼──────────────┐
│          MongoDB              │
│ (Inventory, Users, Requests)  │
└──────────────────────────────┘

````

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository
```sh
git clone https://github.com/yourusername/VienLink-BloodBank.git
cd VienLink-BloodBank
````

---

# 🛠 Backend Setup

### Navigate to backend folder

```sh
cd backend
```

### Install dependencies

```sh
npm install
```

### Create `.env` file

```env
PORT=5000

# Database
MONGODB_URI=your_mongodb_uri

# Authentication
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

# Email (Nodemailer)
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password

# Cloud Storage
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_cloud_key
CLOUDINARY_SECRET=your_cloud_secret

# CORS
CLIENT_URL=http://localhost:3000
```

### Start backend server

```sh
npm start
```

or (for nodemon)

```sh
npm run dev
```

---

# 🖥 Frontend Setup

### Navigate to frontend folder

```sh
cd frontend
```

### Install dependencies

```sh
npm install
```

### Start development server

```sh
npm run dev
```

---

# 📂 Project Structure

```
VienLink-BloodBank/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── public/
│
└── README.md
```

---

# 🧪 Running Tests

### Backend tests:

```sh
npm test
```

### Frontend tests:

```sh
npm run test
```

---

# 🔗 API Base URL

```
https://your-deployment-url.com/api/v1
```

---

# 📡 API Documentation

## 🔐 Authentication APIs

### Register Hospital Admin

```
POST /api/v1/auth/hospital/register
```

```json
{
  "name": "City Hospital",
  "email": "admin@city.com",
  "password": "pass123",
  "licenseId": "HSP-9091"
}
```

### Login (All Roles)

```
POST /api/v1/auth/login
```

### Public Registration

```
POST /api/v1/public/register
```

### Forgot Password

```
POST /api/v1/auth/forgot-password
```

### Reset Password

```
POST /api/v1/auth/reset-password
```

---

## 🩸 Blood Inventory APIs

### Get Inventory

```
GET /api/v1/blood/inventory
```

### Add Blood Unit

```
POST /api/v1/blood/add
```

```json
{
  "bloodGroup": "A+",
  "quantity": 3,
  "expiryDate": "2025-06-12"
}
```

### Update Status

```
PATCH /api/v1/blood/status/:id
```

---

## ❤️ Donation APIs

### Book Donation Slot

```
POST /api/v1/donation/book
```

### Donation History

```
GET /api/v1/donation/history/:donorId
```

---

## 📋 Blood Request APIs

### Hospital Blood Request

```
POST /api/v1/requests/hospital
```

### Public Blood Request

```
POST /api/v1/requests/public
```

### Request Status

```
GET /api/v1/requests/status/:requestId
```

---

## 🔁 Inter-Hospital Transfer APIs

### Create Transfer Request

```
POST /api/v1/transfer/create
```

### Approve Transfer

```
PATCH /api/v1/transfer/approve/:id
```

---

## 📅 Blood Camp APIs

### Create Camp

```
POST /api/v1/camps/create
```

### Get Camps

```
GET /api/v1/camps
```

---

## 📡 Real-Time Notifications APIs

### Get User Notifications

```
GET /api/notifications
```

### Get Unread Count

```
GET /api/notifications/unread-count
```

### Mark Notification as Read

```
PATCH /api/notifications/:id/read
```

### Mark All as Read

```
PATCH /api/notifications/read-all
```

### Delete Notification

```
DELETE /api/notifications/:id
```

### Broadcast Emergency Notification (Admin Only)

```
POST /api/notifications/broadcast-emergency
```

### Send Test Notification

```
POST /api/notifications/test
```

---

# 📦 Response Formats

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Validation error",
  "error": { "details": "Missing fields" }
}
```

---

# 🚀 Deployment Instructions

## Build Frontend

```sh
npm run build
```

## Deploy Backend (Render / Railway / AWS)

* Add environment variables
* Use start command:

```sh
npm start
```

## Deploy Frontend (Vercel / Netlify)

* Import repo
* Set env variables
* Build command:

```sh
npm run build
```

---

# 🤝 Contributing

1. Fork the repo
2. Create a branch
3. Commit changes
4. Open Pull Request

---

# 