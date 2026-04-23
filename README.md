# 🌍 CityExplorer - MERN Travel & Tourism Platform

![Status](https://img.shields.io/badge/status-Active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-v14+-green)

A full-stack web application built using **MERN stack** (MongoDB, Express.js, React.js, Node.js) that allows users to explore cities, discover popular attractions, and manage travel-related information in an interactive and user-friendly interface.

---

## 📋 Table of Contents
- [About](#-about)
- [Features](#-features)
- [Project Objectives](#-project-objectives)
- [Folder Structure](#-folder-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Setup & Configuration](#-setup--configuration)
- [Running the Application](#-running-the-application)
- [Database Seeding](#-database-seeding)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 📖 About

CityExplorer is a comprehensive platform designed to help travelers and tourists discover and explore cities worldwide. It provides detailed information about attractions, monuments, landmarks, and cultural sites with an intuitive interface. The platform features two portals:
- **User Portal**: For exploring cities and attractions
- **Admin Portal**: For managing content and platform data

**Status**: ✅ Production Ready  
**Sample Data**: 3 Cities, 6 Attractions included

---

## ✨ Features

### 🧑‍💼 User Portal Features
- 🔍 **City Exploration**: Browse and search cities with detailed information
- 📍 **Attraction Discovery**: Find monuments, parks, museums, and cultural landmarks
- 🗺️ **Interactive Maps**: Leaflet-powered maps showing locations and navigation
- ⛅ **Weather Information**: Real-time weather data via Open-Meteo API
- ⭐ **Reviews & Ratings**: Read and write reviews for attractions
- ❤️ **Favorites**: Save favorite cities and attractions for later
- 📱 **Responsive Design**: Fully mobile-optimized interface
- 🔐 **User Authentication**: Secure login and registration
- 👤 **User Profile**: Manage personal information and preferences

### 👨‍💻 Admin Portal Features
- 🏛️ **City Management**: Create, edit, update, and delete cities
- 🎯 **Attraction Management**: Full CRUD operations for attractions
- 📊 **Dashboard**: View platform statistics and analytics
- 👥 **User Management**: Monitor and manage user accounts
- 📷 **Image Management**: Upload, crop, and manage images
- 🔐 **Admin Authentication**: Secure admin login with JWT
- 📈 **Review Moderation**: Moderate user-generated reviews

---

## 🎯 Project Objectives

1. **Centralized Information Hub**: Provide easy access to organized tourist information in one place
2. **Travel Planning**: Enable users to discover nearby places of interest easily
3. **Community Contribution**: Allow users to share photos, reviews, and travel experiences
4. **Cultural Awareness**: Promote awareness of cultural heritage and local tourism
5. **Comprehensive Database**: Create a centralized database of city landmarks and tourist information
6. **Enhanced Exploration**: Improve travel planning with a user-friendly digital platform
7. **Reliable Data**: Provide detailed information about monuments, landmarks, and cultural sites

---

## 📁 Folder Structure

```
CityExplorer/
│
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection configuration
│   │
│   ├── controllers/
│   │   ├── adminAuthController.js     # Admin authentication logic
│   │   ├── adminUserController.js     # Admin user management
│   │   ├── attractionController.js    # Attraction CRUD operations
│   │   ├── cityController.js          # City CRUD operations
│   │   ├── reviewController.js        # Review management
│   │   ├── userAuthController.js      # User authentication & JWT
│   │   └── userProfileController.js   # User profile management
│   │
│   ├── middleware/
│   │   ├── adminMiddleware.js         # Admin authorization check
│   │   ├── errorMiddleware.js         # Global error handling
│   │   ├── uploadMiddleware.js        # File upload handling (Multer)
│   │   └── userAuthMiddleware.js      # User authentication verification
│   │
│   ├── models/
│   │   ├── User.js                    # User schema (name, email, password, etc)
│   │   ├── City.js                    # City schema (name, description, images, etc)
│   │   ├── Attraction.js              # Attraction schema (name, location, rating, etc)
│   │   └── Review.js                  # Review schema (rating, comment, user reference)
│   │
│   ├── routes/
│   │   ├── adminRoutes.js             # Admin-only API routes
│   │   ├── attractionRoutes.js        # Attraction CRUD routes
│   │   ├── cityRoutes.js              # City CRUD routes
│   │   ├── reviewRoutes.js            # Review routes
│   │   ├── userAccountRoutes.js       # User account routes
│   │   ├── userAuthRoutes.js          # User authentication routes
│   │   └── utilityRoutes.js           # Utility routes
│   │
│   ├── scripts/
│   │   ├── createAdmin.js             # Create first admin user
│   │   ├── seedIndianCities.js        # Seed Indian cities dataset
│   │   ├── focusCityDataset.js        # Seed focus dataset
│   │   └── upsertFeaturedCities.js    # Update featured cities
│   │
│   ├── uploads/
│   │   └── images/                    # User-uploaded images storage
│   │
│   ├── utils/                         # Utility functions
│   │
│   ├── server.js                      # Express app entry point
│   ├── seeder.js                      # Default seeding script
│   ├── check_db.js                    # Database verification script
│   ├── package.json                   # Backend dependencies
│   └── .env                           # Environment variables (not tracked)
│
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── AdminAttractionCard.jsx    # Attraction card for admin
│   │   │   │   ├── AdminCityCard.jsx          # City card for admin
│   │   │   │   ├── AdminShell.jsx             # Admin layout wrapper
│   │   │   │   ├── AuthContext.jsx            # Admin authentication context
│   │   │   │   ├── ImageCropModal.jsx         # Image cropping modal
│   │   │   │   └── ProtectedRoute.jsx         # Admin route protection
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.jsx              # Admin dashboard
│   │   │   │   ├── Login.jsx                  # Admin login page
│   │   │   │   ├── AdminProfile.jsx           # Admin profile management
│   │   │   │   ├── CityDetail.jsx             # City detail page (admin)
│   │   │   │   ├── CreateCity.jsx             # Create new city page
│   │   │   │   ├── CreatePlace.jsx            # Create new attraction page
│   │   │   │   └── PlaceDetail.jsx            # Attraction detail page (admin)
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── api.js                     # Admin API calls
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── imageHelpers.js            # Image processing utilities
│   │   │   │   └── mapHelpers.js              # Map-related utilities
│   │   │   │
│   │   │   ├── App.jsx                        # Admin app component
│   │   │   ├── main.jsx                       # Admin entry point
│   │   │   └── index.css                      # Admin styles
│   │   │
│   │   ├── components/ (User Portal)
│   │   │   ├── Footer.jsx                     # Footer component
│   │   │   ├── GoogleSignInButton.jsx         # Google OAuth button
│   │   │   ├── UserAttractionCard.jsx         # Attraction card for users
│   │   │   ├── UserAuthContext.jsx            # User authentication context
│   │   │   ├── UserAuthShell.jsx              # User auth layout wrapper
│   │   │   ├── UserCityCard.jsx               # City card for users
│   │   │   ├── UserImageCropModal.jsx         # Image cropping (user)
│   │   │   ├── UserNavbar.jsx                 # Navigation bar
│   │   │   └── UserProtectedRoute.jsx         # User route protection
│   │   │
│   │   ├── pages/ (User Portal)
│   │   │   ├── UserHome.jsx                   # Home page
│   │   │   ├── UserLogin.jsx                  # User login page
│   │   │   ├── UserRegister.jsx               # User registration page
│   │   │   ├── UserDashboard.jsx              # User dashboard
│   │   │   ├── UserExplore.jsx                # Explore cities page
│   │   │   ├── UserCityDetail.jsx             # City detail page
│   │   │   ├── UserPlaceDetail.jsx            # Attraction detail page
│   │   │   ├── UserFavorites.jsx              # Favorites management
│   │   │   ├── UserCreateCity.jsx             # Create city contribution
│   │   │   ├── UserCreatePlace.jsx            # Create attraction review
│   │   │   ├── UserSettings.jsx               # User settings page
│   │   │   ├── UserSupport.jsx                # Support/help page
│   │   │   ├── AdminPortalRedirect.jsx        # Redirect to admin portal
│   │   │   └── UserNotFound.jsx               # 404 not found page
│   │   │
│   │   ├── services/
│   │   │   └── userApi.js                     # User portal API calls (Axios)
│   │   │
│   │   ├── hooks/
│   │   │   └── useUserCurrentLocation.js      # Custom hook for geolocation
│   │   │
│   │   ├── utils/
│   │   │   ├── userImageHelpers.js            # Image utilities
│   │   │   └── userMapHelpers.js              # Map utilities
│   │   │
│   │   ├── routes/                            # Route definitions
│   │   │
│   │   ├── App.jsx                            # Main app component
│   │   ├── main.jsx                           # Entry point
│   │   └── index.css                          # Global styles
│   │
│   ├── public/                                # Static files
│   ├── images/                                # Image assets
│   │   └── README.md                          # Image documentation
│   │
│   ├── dist/                                  # Production build output
│   ├── vite.config.js                         # Vite configuration
│   ├── tailwind.config.js                     # Tailwind CSS config
│   ├── postcss.config.js                      # PostCSS configuration
│   ├── package.json                           # Frontend dependencies
│   └── .env                                   # Environment variables (not tracked)
│
└── README.md                                  # This file
```

---

## 🛠️ Tech Stack

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM (Object Data Modeling)
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **Multer**: File upload handling
- **dotenv**: Environment variable management
- **express-validator**: Request validation
- **CORS**: Cross-origin resource sharing

### Frontend Technologies
- **React 18.3**: UI library
- **Vite 5.4**: Build tool & dev server
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Formik + Yup**: Form management & validation
- **Leaflet + React-Leaflet**: Interactive maps
- **React-Easy-Crop**: Image cropping
- **React-Toastify**: Toast notifications
- **React Icons**: Icon library

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **npm** v6 or higher (comes with Node.js)
- **MongoDB** v4.4+ (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** for version control ([Download](https://git-scm.com/))
- **Code Editor** (VSCode recommended)

---

## 🚀 Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/jairamm007/cityexplorer.git
cd cityexplorer
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🔧 Setup & Configuration

### Backend Configuration

Create `backend/.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/cityexplorer

# JWT Secret Key
JWT_SECRET=CityExplorerSecretKey

# Server Port
PORT=8000

# Environment
NODE_ENV=development

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**For MongoDB Atlas** (Cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cityexplorer
```

### Frontend Configuration

Create `frontend/.env` file:

```env
# API Base URL
VITE_API_URL=http://localhost:8000/api

# Router Base Path
VITE_ROUTER_BASENAME=/
```

---

## ▶️ Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Output**: Backend runs on `http://localhost:8000`

Available scripts:
- `npm start` - Run production server
- `npm run dev` - Run development server with Nodemon
- `npm run seed` - Seed sample data
- `npm run seed:admin` - Create admin account
- `npm run seed:featured` - Seed featured cities
- `npm run seed:india` - Seed Indian cities dataset

### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

**Output**: Frontend runs on `http://localhost:3001`

### Access the Application

| Portal | URL | Purpose |
|--------|-----|---------|
| **User Portal** | http://localhost:3001 | Main application for users |
| **Admin Portal** | http://localhost:3001/admin | Admin management panel |
| **API Health** | http://localhost:8000/api/health | API status check |

---

## 🌱 Database Seeding

### Seed Sample Data

Populate database with 3 sample cities and 6 attractions:

```bash
cd backend
npm run seed
```

### Create Admin Account

Set environment variables and create admin:

```bash
cd backend

# Windows PowerShell
$env:ADMIN_NAME="Your Name"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="StrongPassword123"
npm run seed:admin

# Linux/Mac
export ADMIN_NAME="Your Name"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="StrongPassword123"
npm run seed:admin
```

### Additional Seeding Scripts

```bash
npm run seed:featured      # Seed featured cities
npm run seed:india         # Seed Indian cities dataset
npm run seed:focus         # Seed focus city dataset
```

---

## 📊 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register              - Register new user account
POST   /api/auth/login                 - User login with credentials
POST   /api/auth/google                - Google OAuth authentication
POST   /api/admin/login                - Admin login
```

### City Endpoints

```
GET    /api/cities                     - Get all cities (with pagination/filter)
GET    /api/cities/:id                 - Get specific city details
POST   /api/admin/cities               - Create new city (admin only)
PUT    /api/admin/cities/:id           - Update city details (admin only)
DELETE /api/admin/cities/:id           - Delete city (admin only)
```

### Attraction Endpoints

```
GET    /api/attractions                - Get all attractions (with filters)
GET    /api/attractions/:id            - Get attraction details
POST   /api/admin/attractions          - Create new attraction (admin only)
PUT    /api/admin/attractions/:id      - Update attraction (admin only)
DELETE /api/admin/attractions/:id      - Delete attraction (admin only)
```

### Review Endpoints

```
GET    /api/reviews/:attractionId      - Get all reviews for attraction
POST   /api/reviews                    - Create new review (authenticated)
PUT    /api/reviews/:id                - Update user's own review
DELETE /api/reviews/:id                - Delete user's own review
```

### User Account Endpoints

```
GET    /api/users/profile              - Get user profile (authenticated)
PUT    /api/users/profile              - Update user profile
GET    /api/users/favorites            - Get user's favorite attractions
POST   /api/users/favorites/:id        - Add attraction to favorites
DELETE /api/users/favorites/:id        - Remove from favorites
```

---

## 🚢 Deployment

### Build Frontend for Production

```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/dist/` directory.

### Deploy on Render

1. **Push code to GitHub**:
```bash
git push origin main
```

2. **Create Render Web Service**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Select your GitHub repository

3. **Configure Build Command**:
```bash
npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
```

4. **Configure Start Command**:
```bash
node backend/server.js
```

5. **Set Environment Variables**:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - Set to `production`

### Deploy on Heroku

```bash
heroku login
heroku create your-app-name
git push heroku main
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: `Error: MONGODB_URI is not defined`
```
Solution: Create .env file in backend directory with MONGODB_URI
```

**Problem**: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`
```
Solution: Start MongoDB service or use MongoDB Atlas connection string
```

### Frontend Cannot Reach Backend

**Problem**: `Failed to fetch from http://localhost:8000`
```
Solution:
1. Ensure backend is running on port 8000
2. Check VITE_API_URL in frontend/.env
3. Verify CORS is enabled in backend
```

### Port Already in Use

**Windows**:
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
lsof -ti:8000 | xargs kill -9
```

### Build Fails

```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run build
```

---

## 📝 License

This project is licensed under the **MIT License** - see LICENSE file for details.

You are free to use, modify, and distribute this software.

---

## 👨‍💻 Author

**Jairam M**
- GitHub: [@jairamm007](https://github.com/jairamm007)
- Project: [CityExplorer](https://github.com/jairamm007/cityexplorer)

---

## 🙏 Acknowledgments

- **MongoDB** - Database solution
- **Express.js** - Backend framework
- **React** - Frontend library
- **Open-Meteo** - Free weather API
- **Leaflet** - Interactive maps
- **Tailwind CSS** - CSS framework

---

## 📞 Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/jairamm007/cityexplorer/issues) on GitHub
- Check existing issues for solutions
- Provide detailed error messages and steps to reproduce

---

**✅ Status**: READY TO TEST | **📱 Both portals running from same server** | **🌍 Made for travelers worldwide**

```text
VITE_API_URL=http://localhost:8000/api
VITE_ROUTER_BASENAME=/
```

## Notes

- The backend uses Express, Mongoose, JWT auth, and routes for cities, attractions, reviews, and auth.
- The frontend uses React, React Router, Tailwind CSS, and Leaflet/OpenStreetMap for maps.
- The admin portal is embedded under the same frontend app at `/admin`.
- Weather data is fetched from the free Open-Meteo API.

## User Flow

1. **Start**: User enters the CityExplorer app.
2. **Home Page**: Users see popular cities, featured attractions, and a search bar to begin exploration.
3. **Explore Cities**: Users browse a list of available cities with basic details and images.
4. **View Attractions**: Users view attractions like monuments, parks, museums, and cultural landmarks, with filter options.
5. **View Place Details**: Clicking an attraction shows detailed info including description, images, timings, ticket prices, and map location.
6. **Check Weather & Info**: Users see current weather, best visiting times, and travel tips for the chosen city.
7. **Book / Save Place**: Users can book tickets, save favorites, or add attractions to their itinerary.
8. **My Bookings / Favorites**: Users manage their bookings, saved places, and planned trips.
9. **End**: The user completes booking or exploration activities and exits the flow.

## Troubleshooting

If the seed script fails with a DNS or Atlas connection error, verify:

- Internet access from your machine
- Atlas cluster network access settings
- `MONGODB_URI` is correct

If needed, you can use a local MongoDB URI in `backend/.env` instead.

## Deploy On One URL (Render)

To serve both portals from one domain and one port:

- User portal: `/`
- Admin portal: `/admin`
- API: `/api`

Use one Render Web Service connected to this repository root.

### Render Service Settings

- **Root Directory**: leave empty (repo root)
- **Build Command**:

```bash
npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
```

- **Start Command**:

```bash
node backend/server.js
```

### Render Environment Variables

Set these in Render:

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT` (Render provides this automatically; do not hardcode)

### Frontend/Admin Build Variables (Optional)

If your backend is served from the same domain, set:

- `VITE_API_URL=/api`
- `VITE_ROUTER_BASENAME=/` for frontend

Note: the admin portal is part of the same frontend build and is routed at `/admin`.

The backend already serves:

- `frontend/dist` at `/` (including `/admin` route via SPA fallback)
