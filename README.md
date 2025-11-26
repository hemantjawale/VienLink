
# 🏥 VienLink - Blood Bank Management System

![Status](https://img.shields.io/badge/Status-Active-success)
![Issues](https://img.shields.io/github/issues/hemantjawale/VienLink)
![License](https://img.shields.io/badge/license-MIT-blue)

> **A comprehensive, full-stack solution bridging the gap between hospitals, blood banks, and donors.**

VienLink is a robust Blood Bank Management System designed to digitize and streamline the entire process of blood donation, inventory management, and inter-hospital collaboration. With over **80+ features**, it handles everything from real-time inventory tracking and AI-powered analytics to emergency blood requests and public donor portals.

---

## 🔗 Live Demo & Repository

- **🚀 Live Deployment:** [https://vienlink-1.onrender.com](https://vienlink-1.onrender.com)
- **📂 GitHub Repository:** [github.com/hemantjawale/VienLink](https://github.com/hemantjawale/VienLink)

---

## 🌟 Key Features

### 🔐 Authentication & User Roles
* **Multi-Role System:** Secure access for Super Admins, Hospital Admins, Staff, and Public Users.
* **Security:** JWT Token-based authentication with refresh tokens.
* **Hospital Verification:** Approval workflow for new hospital registrations.

### 🩸 Inventory & Donation Management
* **Real-time Tracking:** Live monitor of blood units (A+, B-, O+, etc.) with expiration tracking.
* **Donation Workflow:** Slot booking, history tracking, eligibility checks, and reward systems.
* **Low Stock Alerts:** Automated notifications when inventory hits critical levels.

### 📋 Request System & Collaboration
* **Blood Requests:** Internal (Hospital) and Public (Individual) request creation with status tracking.
* **Inter-Hospital Transfer:** Secure workflow for hospitals to share blood units during shortages.
* **Emergency Handling:** Prioritization algorithms for emergency blood requests.

### 📅 Blood Camps
* **Camp Management:** Scheduling, location mapping, and donor registration for blood drives.
* **Public Access:** Directory for donors to find and register for nearby camps.

### 📊 Analytics & AI
* **Dashboard:** Real-time statistics on donations, inventory, and hospital performance.
* **AI Chatbot:** 24/7 assistant for user queries, appointment booking, and FAQs.
* **Predictive Analytics:** Smart algorithms for stock prediction and demand forecasting.

### 🎨 UI/UX & Accessibility
* **Modern Interface:** Responsive, mobile-first design with Dark/Light mode toggle.
* **Accessibility:** Screen reader compatibility, high contrast modes, and keyboard navigation.

---

## 🚀 Upcoming Features (Roadmap)

We are constantly improving VienLink. The following features are currently in development:

- [ ] **Google OAuth Integration:** One-click login for public users and staff.
- [ ] **Email Verification:** Secure "Forgot Password" flow via email OTP/Links.

---

## 🛠️ Tech Stack

* **Database:** MongoDB (Optimized schemas, Aggregation pipelines)
* **Backend:** Node.js / Express.js (RESTful API)
* **Frontend:** React.js (Modern UI Components, Responsive Design)
* **Authentication:** JSON Web Tokens (JWT), BCrypt
* **Hosting:** Render

---

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites
* Node.js (v14 or higher)
* MongoDB (Local or Atlas URI)
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/hemantjawale/VienLink.git](https://github.com/hemantjawale/VienLink.git)
cd VienLink
````

### 2\. Install Dependencies

You likely have a server and client folder structure.

**Server Setup:**

```bash
cd server
npm install
```

**Client Setup:**

```bash
cd ../client
npm install
```

### 3\. Environment Variables

Create a `.env` file in the `server` directory and add the following:

```env
PORT=8080
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
DEV_MODE=development
```

### 4\. Run the Project

**Start Backend:**

```bash
cd server
npm start
```

**Start Frontend:**

```bash
cd client
npm start
```

The app should now be running on `http://localhost:3000` (Client) and `http://localhost:8080` (Server).

-----

## 🤝 Contributing

Contributions are welcome\! If you'd like to improve VienLink:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

-----

## 📞 Contact

**Hemant Jawale** \* GitHub: [@hemantjawale](https://www.google.com/search?q=https://github.com/hemantjawale)

  * Project Link: [https://vienlink-1.onrender.com](https://vienlink-1.onrender.com)

-----

