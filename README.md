# Vien Link - Blood Bank Management System

A comprehensive full-stack web application for managing blood banks, donors, inventory, and blood donation camps.

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS
- **Backend**: Node.js + Express (ES Modules)
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Additional Features**: QR Code generation, Analytics, Real-time dashboards

## Features

### Core Modules
- ✅ Donor Management
- ✅ Blood Inventory Management with QR Code Tracking
- ✅ Blood Request System
- ✅ Staff Management
- ✅ Blood Camp Management
- ✅ Real-Time Dashboards
- ✅ Advanced Analytics with AI-lite Stock Prediction
- ✅ Smart Donor Matching
- ✅ Audit Logs
- ✅ Multi-role Authentication (Super Admin, Hospital Admin, Staff)

## Project Structure

```
MP2B/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   └── lib/          # Utilities
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB Atlas connection string:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PORT=5000
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## User Roles

### Super Admin
- Manage hospitals
- Approve hospital accounts
- View system-wide analytics
- Access all audit logs

### Hospital Admin
- Manage staff accounts
- Manage donors
- Manage blood inventory
- Approve/reject blood requests
- Organize blood camps
- View hospital analytics

### Staff
- Check in donors
- Scan QR codes
- Update blood unit status
- Update test results
- Manage inventory

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Donors
- `GET /api/donors` - Get all donors
- `POST /api/donors` - Create donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor
- `GET /api/donors/match/nearest` - Find nearest eligible donors

### Blood Units
- `GET /api/blood-units` - Get all blood units
- `POST /api/blood-units` - Create blood unit (with QR)
- `PUT /api/blood-units/:id/status` - Update status
- `PUT /api/blood-units/:id/test-results` - Update test results
- `GET /api/blood-units/qr/:bagId` - Get unit by QR code

### Blood Requests
- `GET /api/blood-requests` - Get all requests
- `POST /api/blood-requests` - Create request
- `PUT /api/blood-requests/:id/approve` - Approve request
- `PUT /api/blood-requests/:id/reject` - Reject request
- `PUT /api/blood-requests/:id/fulfill` - Fulfill request

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/stock-prediction/:bloodGroup` - Get stock prediction

## Features in Detail

### QR Code Tracking
Each blood bag gets a unique QR code containing:
- Bag ID
- Donor information
- Collection date
- Blood group
- Hospital ID

### AI-lite Stock Prediction
Uses historical data to predict:
- Days until low stock
- Risk levels (low/medium/high/critical)
- Average daily collection/issue rates

### Smart Donor Matching
Finds nearest eligible donors when stock is low using:
- Geo-location (latitude/longitude)
- Blood group matching
- Eligibility criteria (90-day donation gap)

## Development

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## License

ISC

## Support

For issues or questions, please contact the development team.

