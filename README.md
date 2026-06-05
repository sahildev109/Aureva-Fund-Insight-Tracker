# Aureva Fund Insight Tracker

A production-grade full-stack web application that enables authenticated users to discover Indian mutual funds, maintain a personal watchlist, and analyze fund NAV performance.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

## Live Demo

- **Frontend (Vercel):** https://aureva-fund-insight-tracker.vercel.app/
- **Backend (Render):** [https://your-backend.onrender.com](https://your-backend.onrender.com)

---

## Features

- **Search & Discover:** Debounced search against MFapi.in with instant scheme listing.
- **Watchlist with Auth:** JWT-authenticated CRUD operations; per-user watchlists stored in MongoDB.
- **Fund Detail & NAV Chart:** Recharts line chart with 1Y / 3Y / 5Y / All range toggles.
- **Bonus: Server-Side NAV Caching:** 1-hour in-memory cache on the Express proxy endpoint to optimize external API calls.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB Atlas (M0 free tier), Mongoose ODM |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **HTTP Client** | Axios, React Query (@tanstack/react-query) |
| **Charting** | Recharts |
| **Caching** | node-cache |
| **Deployment** | Vercel (FE), Render (BE) |

---

## Project Structure

```text
aureva-fund-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Mongoose connect + retry
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verify middleware
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── models/
│   │   │   ├── User.js            # Mongoose User schema
│   │   │   └── WatchlistItem.js   # Mongoose Watchlist schema
│   │   ├── routes/
│   │   │   ├── auth.js            # POST /api/auth/register|login
│   │   │   ├── watchlist.js       # GET|POST|DELETE /api/watchlist
│   │   │   └── funds.js           # GET /api/funds/search + /:code
│   │   ├── cache/
│   │   │   └── navCache.js        # node-cache wrapper (1-hr TTL)
│   │   └── server.js              # App entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js     # Axios instance + interceptors
    │   ├── contexts/
    │   │   └── AuthContext.jsx    # JWT state + helpers
    │   ├── hooks/
    │   │   ├── useDebounce.js
    │   │   └── useWatchlist.js    # React Query watchlist hooks
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── SearchPage.jsx     # Feature 1
    │   │   ├── WatchlistPage.jsx  # Feature 2
    │   │   └── FundDetailPage.jsx # Feature 3
    │   ├── components/
    │   │   ├── SearchBar.jsx
    │   │   ├── SchemeResultCard.jsx
    │   │   ├── WatchlistItem.jsx
    │   │   ├── NavChart.jsx
    │   │   ├── RangeToggle.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Navbar.jsx
    │   ├── utils/
    │   │   └── navHelpers.js      # Date parsing + range filter
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd aureva
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in the values in .env (PORT, MONGO_URI, JWT_SECRET, etc.)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in the VITE_API_URL (e.g., http://localhost:5000)
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | The port the backend server runs on | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<pass>@cluster0...` |
| `JWT_SECRET` | Secret key for signing JWTs | `my_super_secret_jwt_key_32_chars` |
| `JWT_EXPIRES_IN` | Expiration time for JWTs | `7d` |
| `MFAPI_BASE` | Base URL for the MF API | `https://api.mfapi.in` |
| `FRONTEND_URL` | URL of the frontend (for CORS) | `http://localhost:5173` |
| `NAV_CACHE_TTL` | Cache time-to-live in seconds | `3600` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000` |

---

## API Documentation

### Auth Routes
#### Register User
- **Method:** `POST`
- **Route:** `/api/auth/register`
- **Description:** Registers a new user and returns a JWT token.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "name": "John Doe"
  }
  ```
- **Error Responses:**
  - `400`: All fields are required / Password must be at least 8 characters
  - `409`: Email already registered
  - `500`: Internal server error

#### Login User
- **Method:** `POST`
- **Route:** `/api/auth/login`
- **Description:** Logs in an existing user and returns a JWT token.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "name": "John Doe"
  }
  ```
- **Error Responses:**
  - `400`: Email and password are required
  - `401`: Invalid credentials
  - `500`: Internal server error

### Watchlist Routes
#### Fetch Watchlist
- **Method:** `GET`
- **Route:** `/api/watchlist`
- **Description:** Fetches the authenticated user's watchlist, sorted by newest first.
- **Auth Required:** Yes
- **Success Response:** `200 OK`
  ```json
  [
    {
      "_id": "60d...",
      "userId": "60c...",
      "schemeCode": 120503,
      "schemeName": "SBI Bluechip Fund",
      "addedAt": "2023-10-25T12:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `401`: No token provided / Invalid or expired token
  - `500`: Internal server error

#### Add to Watchlist
- **Method:** `POST`
- **Route:** `/api/watchlist`
- **Description:** Adds a mutual fund scheme to the user's watchlist.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "schemeCode": 120503,
    "schemeName": "SBI Bluechip Fund"
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "_id": "60d...",
    "userId": "60c...",
    "schemeCode": 120503,
    "schemeName": "SBI Bluechip Fund",
    "addedAt": "2023-10-25T12:00:00Z"
  }
  ```
- **Error Responses:**
  - `400`: schemeCode and schemeName are required
  - `401`: No token provided / Invalid or expired token
  - `409`: Fund already in your watchlist
  - `500`: Internal server error

#### Remove from Watchlist
- **Method:** `DELETE`
- **Route:** `/api/watchlist/:schemeCode`
- **Description:** Removes a mutual fund scheme from the user's watchlist.
- **Auth Required:** Yes
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Removed from watchlist"
  }
  ```
- **Error Responses:**
  - `401`: No token provided / Invalid or expired token
  - `404`: Item not found in watchlist
  - `500`: Internal server error

### Fund Routes
#### Search Funds
- **Method:** `GET`
- **Route:** `/api/funds/search?q=`
- **Description:** Proxies search query to MFapi.in and returns up to 50 results. Query must be at least 2 characters.
- **Auth Required:** No
- **Success Response:** `200 OK`
  ```json
  [
    {
      "schemeCode": 120503,
      "schemeName": "SBI Bluechip Fund - Direct Plan - Growth"
    }
  ]
  ```
- **Error Responses:**
  - `400`: Query must be at least 2 characters
  - `500`: Internal server error

#### Get Fund NAV
- **Method:** `GET`
- **Route:** `/api/funds/:schemeCode`
- **Description:** Proxies NAV history request to MFapi.in with server-side caching.
- **Auth Required:** No
- **Success Response:** `200 OK`
  ```json
  {
    "meta": {
      "fund_house": "SBI Mutual Fund",
      "scheme_type": "Open Ended Schemes",
      "scheme_category": "Equity Scheme - Large Cap Fund",
      "scheme_code": 120503,
      "scheme_name": "SBI Bluechip Fund - Direct Plan - Growth"
    },
    "data": [
      {
        "date": "25-10-2023",
        "nav": "75.4321"
      }
    ]
  }
  ```
- **Error Responses:**
  - `400`: schemeCode must be numeric
  - `404`: Fund not found / Fund not found on MFapi
  - `500`: Internal server error

---

## HTTP Status Code Reference

| Code | When Used |
| --- | --- |
| **200** | Successful GET or DELETE |
| **201** | New resource created (register, watchlist add) |
| **400** | Validation failure - missing fields, bad input type |
| **401** | Missing or invalid JWT |
| **404** | Fund schemeCode not found on MFapi.in or item not found |
| **409** | Duplicate entry - scheme already in user's watchlist (Mongo 11000) |
| **500** | Unhandled server error - logged, generic message returned to client |

---

## Caching

A server-side caching mechanism is implemented for the NAV history endpoint to reduce external API calls to MFapi.in, improve response times, and respect rate limits.

- **Mechanism:** In-memory caching using `node-cache`.
- **Cache Key Format:** `nav_<schemeCode>`
- **TTL (Time To Live):** 3600 seconds (1 hour), configurable via `NAV_CACHE_TTL`.
- **Indicator:** A `fromCache: true` flag is added to the response payload when data is served from the cache.

| Cache MISS (first request) | Cache HIT (within 1 hour) |
| --- | --- |
| 1. Check cache - miss<br>2. Call MFapi.in (~400-1200ms)<br>3. Store result in cache<br>4. Return data to client | 1. Check cache - hit<br>2. Return immediately (~1-5ms)<br>3. MFapi.in not called<br>4. `fromCache: true` in response |

---

## Deployment

### 1. MongoDB Atlas
- Create a free M0 cluster on MongoDB Atlas.
- Create a database user with a password.
- Whitelist IP `0.0.0.0/0` (all IPs) for Render compatibility.
- Copy the `mongodb+srv://...` connection string.

### 2. Backend on Render
- Create a new Web Service and connect the GitHub repo.
- Set Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node src/server.js`
- **Environment Variables:**
  - `MONGO_URI`: Atlas connection string
  - `JWT_SECRET`: Random string (min 32 chars)
  - `JWT_EXPIRES_IN`: `7d`
  - `MFAPI_BASE`: `https://api.mfapi.in`
  - `FRONTEND_URL`: URL of the deployed Vercel frontend
  - `NAV_CACHE_TTL`: `3600`
  - `PORT`: `10000` (Render's default)

### 3. Frontend on Vercel
- Create a new Project and connect the GitHub repo.
- Set Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- **Environment Variables:**
  - `VITE_API_URL`: URL of the deployed Render backend

---


## Known Limitations

- In-memory cache resets on Render free tier spin-down (~15 min idle).
- MFapi.in occasionally has downtime - error states are handled gracefully.

---

## Assumptions

- `schemeCode` is treated as a `Number` in MongoDB for consistent comparison.
- NAV history is cached server-side for 1 hour (bonus feature).
---

## Author

## Built by **Sahil Salap** — a passionate full-stack developer with a love for clean architecture and scalable design. Always eager to learn new technologies and solve complex problems.
## Email: sahilsalap75@gmail.com
## Phone: 8850306843
## GitHub: [github.com/sahildev109](https://github.com/sahildev109)
## LinkedIn: [linkedin.com/in/sahilsalap](https://www.linkedin.com/in/sahilsalap)