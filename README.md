# CityExplorer MERN App

## ✅ Status: READY TO TEST

Both portals run from the same frontend server:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3001
- **Admin portal**: http://localhost:3001/admin

Sample data has been seeded with 3 cities and 6 attractions.

## Project Objectives

Travelers and tourists often struggle to find reliable and organized information about city attractions, monuments, and cultural landmarks in one place. This lack of centralized information makes trip planning difficult and time-consuming.

A centralized digital platform is required to provide easy access to tourist information and improve travel exploration.

The objectives of this system are:

1. To develop a web-based platform for exploring cities and tourist attractions.
2. To provide detailed information about monuments, landmarks, and cultural sites.
3. To allow users to discover nearby places of interest easily.
4. To enable users to contribute content such as photos, reviews, and travel experiences.
5. To promote awareness of cultural heritage and local tourism.
6. To create a centralized database of city landmarks and tourist information.
7. To improve travel planning and exploration through a user-friendly digital platform.

## Setup

### 1. Backend

Open a terminal in `C:\Users\maddu\CityExplorer\backend`:

```powershell
npm install
npm run dev
```

The backend will run on `http://localhost:8000`.

### 2. Frontend

Open a terminal in `C:\Users\maddu\CityExplorer\frontend`:

```powershell
npm install
npm run dev
```

The frontend will run on `http://localhost:3001`.

### 3. Admin Portal

Open a terminal in `C:\Users\maddu\CityExplorer\frontend`:

```powershell
npm install
npm run dev
```

The admin portal will run on `http://localhost:3001/admin`.

## Seed Sample Data

There is a simple seed script to populate cities and attractions into MongoDB.

From `backend` run:

```powershell
npm run seed
```

To create or update the first admin account, set these environment variables in `backend/.env` and run the admin seed script:

```text
ADMIN_NAME="Admin Name"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="StrongPassword123"
```

```powershell
npm run seed:admin
```

## Environment

### Backend `.env`

The backend reads:

```text
MONGODB_URI="mongodb://localhost:27017/cityexplorer"
JWT_SECRET="CityExplorerSecretKey"
PORT=8000
NODE_ENV=development
```

### Frontend `.env`

The frontend reads:

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
