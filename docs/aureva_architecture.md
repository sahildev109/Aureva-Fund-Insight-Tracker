**AUREVA**

Fund Insight Tracker

_Architecture & Full-Stack Implementation Document_

| Assignment | **MERN Stack Take-Home**                    |
| ---------- | ------------------------------------------- |
| Stack      | **React + Node/Express + MongoDB Atlas**    |
| Deployment | **Vercel (FE) + Render (BE) + Atlas (DB)**  |
| Scope      | **3 Core Features + 1 Bonus (NAV Caching)** |

# **1\. Project Overview**

Aureva Fund Insight Tracker is a production-grade full-stack web application that enables authenticated users to discover Indian mutual funds, maintain a personal watchlist, and analyze fund NAV performance through an interactive chart with configurable time ranges. The system integrates with the public mfapi.in API through a Node.js proxy layer and persists user data in MongoDB Atlas.

## **1.1 Key Features**

- Search & Discover - debounced search against MFapi.in with instant scheme listing
- Watchlist with Auth - JWT-authenticated CRUD; per-user watchlists stored in MongoDB
- Fund Detail & NAV Chart - Recharts line chart with 1Y / 3Y / 5Y / All range toggles
- Bonus: Server-Side NAV Caching - 1-hour in-memory/Redis cache on the Express proxy endpoint

## **1.2 System Architecture (High-Level)**

| **React Frontend**                                                                                    | **Express Backend**                                                                                                        | **MongoDB Atlas**                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Vite + React 18<br><br>React Router v6<br><br>Recharts<br><br>Axios + React Query<br><br>Tailwind CSS | Node.js + Express 4<br><br>Mongoose ODM<br><br>JWT (jsonwebtoken)<br><br>node-cache (NAV cache)<br><br>axios (MFapi proxy) | Atlas Free Tier (M0)<br><br>users collection<br><br>watchlistitems collection<br><br>Unique index on schemeCode+userId |

# **2\. Repository & Project Structure**

Use a monorepo layout with two workspace packages inside a single Git repository. This simplifies CI, keeps secrets in one place, and makes cross-team review straightforward.

aureva-fund-tracker/

├── backend/

│ ├── src/

│ │ ├── config/

│ │ │ └── db.js # Mongoose connect + retry

│ │ ├── middleware/

│ │ │ ├── auth.js # JWT verify middleware

│ │ │ └── errorHandler.js # Global error handler

│ │ ├── models/

│ │ │ ├── User.js # Mongoose User schema

│ │ │ └── WatchlistItem.js # Mongoose Watchlist schema

│ │ ├── routes/

│ │ │ ├── auth.js # POST /api/auth/register|login

│ │ │ ├── watchlist.js # GET|POST|DELETE /api/watchlist

│ │ │ └── funds.js # GET /api/funds/search + /:code

│ │ ├── cache/

│ │ │ └── navCache.js # node-cache wrapper (1-hr TTL)

│ │ └── server.js # App entry point

│ ├── .env.example

│ └── package.json

└── frontend/

├── src/

│ ├── api/

│ │ └── axiosClient.js # Axios instance + interceptors

│ ├── contexts/

│ │ └── AuthContext.jsx # JWT state + helpers

│ ├── hooks/

│ │ ├── useDebounce.js

│ │ └── useWatchlist.js # React Query watchlist hooks

│ ├── pages/

│ │ ├── LoginPage.jsx

│ │ ├── RegisterPage.jsx

│ │ ├── SearchPage.jsx # Feature 1

│ │ ├── WatchlistPage.jsx # Feature 2

│ │ └── FundDetailPage.jsx # Feature 3

│ ├── components/

│ │ ├── SearchBar.jsx

│ │ ├── SchemeResultCard.jsx

│ │ ├── WatchlistItem.jsx

│ │ ├── NavChart.jsx

│ │ ├── RangeToggle.jsx

│ │ ├── ProtectedRoute.jsx

│ │ └── Navbar.jsx

│ ├── utils/

│ │ └── navHelpers.js # Date parsing + range filter

│ ├── App.jsx

│ └── main.jsx

├── .env.example

└── package.json

# **3\. Database Design - MongoDB Atlas**

## **3.1 User Schema**

// backend/src/models/User.js

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

name: { type: String, required: true, trim: true },

email: { type: String, required: true, unique: true, lowercase: true, trim: true },

password: { type: String, required: true, minlength: 8 },

}, { timestamps: true });

// Hash password before save

userSchema.pre('save', async function(next) {

if (!this.isModified('password')) return next();

this.password = await bcrypt.hash(this.password, 12);

next();

});

// Compare plain password against hash

userSchema.methods.comparePassword = function(plain) {

return bcrypt.compare(plain, this.password);

};

module.exports = mongoose.model('User', userSchema);

## **3.2 WatchlistItem Schema**

// backend/src/models/WatchlistItem.js

const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({

userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

schemeCode: { type: Number, required: true },

schemeName: { type: String, required: true, trim: true },

addedAt: { type: Date, default: Date.now },

}, { timestamps: false });

// Prevent duplicate schemes per user

watchlistSchema.index({ userId: 1, schemeCode: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistSchema);

**⚠ Compound Unique Index - Critical Detail**

The unique index is on (userId, schemeCode) - NOT just schemeCode alone. This allows different users to add the same fund, while preventing a single user from adding it twice. A duplicate insert returns a MongoDB error code 11000 which the route handler maps to HTTP 409.

# **4\. Backend - Express API Design**

## **4.1 Environment Variables**

\# backend/.env

PORT=5000

MONGO_URI=mongodb+srv://&lt;user&gt;:&lt;pass&gt;@cluster0.xxxxx.mongodb.net/aureva?retryWrites=true&w=majority

JWT_SECRET=&lt;at-least-32-char-random-string&gt;

JWT_EXPIRES_IN=7d

MFAPI_BASE=<https://api.mfapi.in>

FRONTEND_URL=<https://aureva-fund-tracker.vercel.app> # for CORS

NAV_CACHE_TTL=3600 # seconds (bonus feature)

## **4.2 Server Entry Point**

// backend/src/server.js

const express = require('express');

const cors = require('cors');

const connectDB = require('./config/db');

require('dotenv').config();

const app = express();

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

app.use('/api/watchlist', require('./routes/watchlist'));

app.use('/api/funds', require('./routes/funds'));

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));

## **4.3 API Endpoint Reference**

| **Method** | **Route**                  | **Description**                | **Auth Required**    |
| ---------- | -------------------------- | ------------------------------ | -------------------- |
| **POST**   | /api/auth/register         | Register new user              | No                   |
| **POST**   | /api/auth/login            | Login, returns JWT             | No                   |
| **GET**    | /api/watchlist             | Fetch user's watchlist         | **Yes - Bearer JWT** |
| **POST**   | /api/watchlist             | Add scheme to watchlist        | **Yes - Bearer JWT** |
| **DELETE** | /api/watchlist/:schemeCode | Remove scheme from watchlist   | **Yes - Bearer JWT** |
| **GET**    | /api/funds/search?q=       | Proxy search to MFapi.in       | No                   |
| **GET**    | /api/funds/:schemeCode     | Proxy NAV history (with cache) | No                   |

## **4.4 Auth Middleware**

// backend/src/middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

const header = req.headers.authorization;

if (!header || !header.startsWith('Bearer '))

return res.status(401).json({ error: 'No token provided' });

try {

const decoded = jwt.verify(header.split(' ')\[1\], process.env.JWT_SECRET);

req.userId = decoded.id;

next();

} catch {

return res.status(401).json({ error: 'Invalid or expired token' });

}

};

## **4.5 HTTP Status Code Contract**

| **Code** | **When Used**                                                       |
| -------- | ------------------------------------------------------------------- |
| **200**  | Successful GET or DELETE                                            |
| **201**  | New resource created (register, watchlist add)                      |
| **400**  | Validation failure - missing fields, bad input type                 |
| **401**  | Missing or invalid JWT                                              |
| **404**  | Fund schemeCode not found on MFapi.in                               |
| **409**  | Duplicate entry - scheme already in user's watchlist (Mongo 11000)  |
| **500**  | Unhandled server error - logged, generic message returned to client |

# **5\. Feature 1 - Search & Discover**

Users can search mutual funds by name or scheme code. Typing triggers a 300ms debounced request that proxies to <https://api.mfapi.in/mf/search?q=> . Results are displayed as cards with an Add to Watchlist CTA.

## **5.1 Backend Route - Fund Search Proxy**

// backend/src/routes/funds.js (search portion)

const express = require('express');

const axios = require('axios');

const router = express.Router();

const navCache = require('../cache/navCache');

// GET /api/funds/search?q=&lt;query&gt;

router.get('/search', async (req, res, next) => {

const { q } = req.query;

if (!q || q.trim().length < 2)

return res.status(400).json({ error: 'Query must be at least 2 characters' });

try {

const { data } = await axios.get(

\`\${process.env.MFAPI_BASE}/mf/search?q=\${encodeURIComponent(q.trim())}\`,

{ timeout: 8000 }

);

// MFapi returns array of { schemeCode, schemeName }

res.json(data.slice(0, 50)); // cap at 50 results

} catch (err) {

next(err);

}

});

module.exports = router;

## **5.2 Frontend - useDebounce Hook**

// frontend/src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {

const \[debounced, setDebounced\] = useState(value);

useEffect(() => {

const id = setTimeout(() => setDebounced(value), delay);

return () => clearTimeout(id);

}, \[value, delay\]);

return debounced;

}

## **5.3 Frontend - SearchPage Component**

// frontend/src/pages/SearchPage.jsx

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useDebounce } from '../hooks/useDebounce';

import api from '../api/axiosClient';

import SchemeResultCard from '../components/SchemeResultCard';

export default function SearchPage() {

const \[query, setQuery\] = useState('');

const debouncedQuery = useDebounce(query, 300);

const { data: results = \[\], isLoading, isError } = useQuery({

queryKey: \['funds-search', debouncedQuery\],

queryFn: () => api.get(\`/funds/search?q=\${debouncedQuery}\`).then(r => r.data),

enabled: debouncedQuery.length >= 2,

staleTime: 1000 \* 60 \* 2, // 2 min client-side cache

});

return (

&lt;div className='max-w-2xl mx-auto p-6'&gt;

<input

value={query}

onChange={e => setQuery(e.target.value)}

placeholder='Search mutual funds...'

className='w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500'

/>

{isLoading && &lt;p className='mt-4 text-gray-500'&gt;Searching...&lt;/p&gt;}

{isError && &lt;p className='mt-4 text-red-500'&gt;Failed to fetch results.&lt;/p&gt;}

&lt;ul className='mt-4 space-y-2'&gt;

{results.map(scheme => (

&lt;SchemeResultCard key={scheme.schemeCode} scheme={scheme} /&gt;

))}

&lt;/ul&gt;

{results.length === 0 && debouncedQuery.length >= 2 && !isLoading && (

&lt;p className='mt-4 text-gray-400'&gt;No funds found for "{debouncedQuery}"&lt;/p&gt;

)}

&lt;/div&gt;

);

}

## **5.4 Frontend - SchemeResultCard**

// frontend/src/components/SchemeResultCard.jsx

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../api/axiosClient';

import { useAuth } from '../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';

export default function SchemeResultCard({ scheme }) {

const { token } = useAuth();

const navigate = useNavigate();

const qc = useQueryClient();

const { mutate: addToWatchlist, isPending, isError, error } = useMutation({

mutationFn: () => api.post('/watchlist', {

schemeCode: scheme.schemeCode,

schemeName: scheme.schemeName,

}),

onSuccess: () => qc.invalidateQueries({ queryKey: \['watchlist'\] }),

});

const handleAdd = () => {

if (!token) return navigate('/login');

addToWatchlist();

};

return (

&lt;li className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50'&gt;

&lt;div&gt;

&lt;p className='font-medium text-gray-800'&gt;{scheme.schemeName}&lt;/p&gt;

&lt;p className='text-sm text-gray-500'&gt;Code: {scheme.schemeCode}&lt;/p&gt;

{isError && &lt;p className='text-xs text-red-500 mt-1'&gt;

{error?.response?.status === 409 ? 'Already in watchlist' : 'Failed to add'}

&lt;/p&gt;}

&lt;/div&gt;

<button

onClick={handleAdd}

disabled={isPending}

className='ml-4 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 disabled:opacity-50'

\>

{isPending ? 'Adding...' : '+ Watchlist'}

&lt;/button&gt;

&lt;/li&gt;

);

}

# **6\. Feature 2 - Authentication & Watchlist Persistence**

## **6.1 Auth Routes**

// backend/src/routes/auth.js

const express = require('express');

const jwt = require('jsonwebtoken');

const User = require('../models/User');

const router = express.Router();

const signToken = (id) =>

jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register

router.post('/register', async (req, res, next) => {

try {

const { name, email, password } = req.body;

if (!name || !email || !password)

return res.status(400).json({ error: 'All fields are required' });

if (password.length < 8)

return res.status(400).json({ error: 'Password must be at least 8 characters' });

const user = await User.create({ name, email, password });

res.status(201).json({ token: signToken(user.\_id), name: user.name });

} catch (err) {

if (err.code === 11000) return res.status(409).json({ error: 'Email already registered' });

next(err);

}

});

// POST /api/auth/login

router.post('/login', async (req, res, next) => {

try {

const { email, password } = req.body;

if (!email || !password)

return res.status(400).json({ error: 'Email and password are required' });

const user = await User.findOne({ email });

if (!user || !(await user.comparePassword(password)))

return res.status(401).json({ error: 'Invalid credentials' });

res.json({ token: signToken(user.\_id), name: user.name });

} catch (err) { next(err); }

});

module.exports = router;

## **6.2 Watchlist Routes**

// backend/src/routes/watchlist.js

const express = require('express');

const WatchlistItem = require('../models/WatchlistItem');

const auth = require('../middleware/auth');

const router = express.Router();

// All watchlist routes require auth

router.use(auth);

// GET /api/watchlist

router.get('/', async (req, res, next) => {

try {

const items = await WatchlistItem

.find({ userId: req.userId })

.sort({ addedAt: -1 });

res.json(items);

} catch (err) { next(err); }

});

// POST /api/watchlist

router.post('/', async (req, res, next) => {

try {

const { schemeCode, schemeName } = req.body;

if (!schemeCode || !schemeName)

return res.status(400).json({ error: 'schemeCode and schemeName are required' });

const item = await WatchlistItem.create({

userId: req.userId,

schemeCode: Number(schemeCode),

schemeName,

});

res.status(201).json(item);

} catch (err) {

if (err.code === 11000)

return res.status(409).json({ error: 'Fund already in your watchlist' });

next(err);

}

});

// DELETE /api/watchlist/:schemeCode

router.delete('/:schemeCode', async (req, res, next) => {

try {

const result = await WatchlistItem.deleteOne({

userId: req.userId,

schemeCode: Number(req.params.schemeCode),

});

if (result.deletedCount === 0)

return res.status(404).json({ error: 'Item not found in watchlist' });

res.json({ message: 'Removed from watchlist' });

} catch (err) { next(err); }

});

module.exports = router;

## **6.3 Frontend - AuthContext**

// frontend/src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useCallback } from 'react';

import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {

const \[token, setToken\] = useState(localStorage.getItem('aureva_token'));

const \[user, setUser\] = useState(JSON.parse(localStorage.getItem('aureva_user') || 'null'));

const login = useCallback(async (email, password) => {

const { data } = await api.post('/auth/login', { email, password });

localStorage.setItem('aureva_token', data.token);

localStorage.setItem('aureva_user', JSON.stringify({ name: data.name }));

setToken(data.token);

setUser({ name: data.name });

}, \[\]);

const logout = useCallback(() => {

localStorage.removeItem('aureva_token');

localStorage.removeItem('aureva_user');

setToken(null); setUser(null);

}, \[\]);

return (

&lt;AuthContext.Provider value={{ token, user, login, logout }}&gt;

{children}

&lt;/AuthContext.Provider&gt;

);

}

## **6.4 Axios Client with JWT Interceptor**

// frontend/src/api/axiosClient.js

import axios from 'axios';

const api = axios.create({

baseURL: import.meta.env.VITE_API_URL + '/api',

});

// Attach JWT on every request

api.interceptors.request.use(config => {

const token = localStorage.getItem('aureva_token');

if (token) config.headers.Authorization = \`Bearer \${token}\`;

return config;

});

export default api;

# **7\. Feature 3 - Fund Detail Page & NAV Chart**

## **7.1 Backend - NAV Proxy Route**

// backend/src/routes/funds.js (NAV portion)

// GET /api/funds/:schemeCode

router.get('/:schemeCode', async (req, res, next) => {

const code = req.params.schemeCode;

if (!/^\\d+\$/.test(code))

return res.status(400).json({ error: 'schemeCode must be numeric' });

const cacheKey = \`nav\_\${code}\`;

const cached = navCache.get(cacheKey);

if (cached) return res.json({ ...cached, fromCache: true });

try {

const { data } = await axios.get(

\`\${process.env.MFAPI_BASE}/mf/\${code}\`,

{ timeout: 10000 }

);

if (!data || !data.data)

return res.status(404).json({ error: 'Fund not found' });

navCache.set(cacheKey, data); // TTL set in navCache.js

res.json(data);

} catch (err) {

if (err.response?.status === 404)

return res.status(404).json({ error: 'Fund not found on MFapi' });

next(err);

}

});

## **7.2 NAV Date Parsing Utility**

MFapi.in returns dates as dd-mm-yyyy strings in a newest-first array. Both issues must be handled before feeding data to Recharts.

// frontend/src/utils/navHelpers.js

/\*\*

\* Parse 'dd-mm-yyyy' string to JS Date

\*/

export function parseMFDate(str) {

const \[d, m, y\] = str.split('-').map(Number);

return new Date(y, m - 1, d);

}

/\*\*

\* Filter and format NAV data array for Recharts

\* @param {Array} rawData - MFapi data\[\] (newest-first)

\* @param {string} range - '1Y' | '3Y' | '5Y' | 'All'

\* @returns {Array&lt;{ date: string, nav: number }&gt;} oldest-first

\*/

export function filterByRange(rawData, range) {

const now = new Date();

const cutoff = new Date(now);

if (range === '1Y') cutoff.setFullYear(now.getFullYear() - 1);

else if (range === '3Y') cutoff.setFullYear(now.getFullYear() - 3);

else if (range === '5Y') cutoff.setFullYear(now.getFullYear() - 5);

else cutoff.setFullYear(1970); // 'All'

return rawData

.filter(entry => parseMFDate(entry.date) >= cutoff)

.sort((a, b) => parseMFDate(a.date) - parseMFDate(b.date)) // oldest first

.map(entry => ({

date: entry.date,

nav: parseFloat(entry.nav), // MFapi returns nav as string

}));

}

## **7.3 Frontend - FundDetailPage**

// frontend/src/pages/FundDetailPage.jsx

import { useState } from 'react';

import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import api from '../api/axiosClient';

import NavChart from '../components/NavChart';

import RangeToggle from '../components/RangeToggle';

import { filterByRange } from '../utils/navHelpers';

const RANGES = \['1Y', '3Y', '5Y', 'All'\];

export default function FundDetailPage() {

const { schemeCode } = useParams();

const \[range, setRange\] = useState('5Y');

const { data, isLoading, isError } = useQuery({

queryKey: \['fund-nav', schemeCode\],

queryFn: () => api.get(\`/funds/\${schemeCode}\`).then(r => r.data),

staleTime: 1000 \* 60 \* 60, // 1 hr - matches server cache

});

if (isLoading) return &lt;p className='p-6 text-gray-500'&gt;Loading fund data...&lt;/p&gt;;

if (isError) return &lt;p className='p-6 text-red-500'&gt;Failed to load fund data.&lt;/p&gt;;

if (!data?.data?.length) return &lt;p className='p-6 text-gray-400'&gt;No NAV data available.&lt;/p&gt;;

const chartData = filterByRange(data.data, range);

const { schemeName } = data.meta;

return (

&lt;div className='max-w-4xl mx-auto p-6'&gt;

&lt;h1 className='text-xl font-bold text-gray-800 mb-1'&gt;{schemeName}&lt;/h1&gt;

&lt;p className='text-sm text-gray-500 mb-6'&gt;Scheme Code: {schemeCode}&lt;/p&gt;

&lt;RangeToggle ranges={RANGES} active={range} onChange={setRange} /&gt;

{chartData.length === 0

? &lt;p className='mt-8 text-gray-400'&gt;No data available for selected range.&lt;/p&gt;

: &lt;NavChart data={chartData} /&gt;

}

&lt;/div&gt;

);

}

## **7.4 NavChart Component (Recharts)**

// frontend/src/components/NavChart.jsx

import {

ResponsiveContainer, LineChart, Line, XAxis, YAxis,

CartesianGrid, Tooltip, ReferenceLine

} from 'recharts';

const formatDate = (dateStr) => {

const \[d, m, y\] = dateStr.split('-');

return \`\${d}/\${m}/\${y.slice(2)}\`;

};

const CustomTooltip = ({ active, payload, label }) => {

if (!active || !payload?.length) return null;

return (

&lt;div className='bg-white border border-gray-200 rounded-lg p-3 shadow-md'&gt;

&lt;p className='text-xs text-gray-500'&gt;{label}&lt;/p&gt;

&lt;p className='text-base font-semibold text-teal-700'&gt;

₹ {payload\[0\].value.toFixed(4)}

&lt;/p&gt;

&lt;/div&gt;

);

};

export default function NavChart({ data }) {

const navs = data.map(d => d.nav);

const minNav = Math.min(...navs);

const maxNav = Math.max(...navs);

const padding = (maxNav - minNav) \* 0.05;

// Thin out x-axis ticks for readability

const tickInterval = Math.max(1, Math.floor(data.length / 8));

return (

&lt;ResponsiveContainer width='100%' height={380}&gt;

&lt;LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}&gt;

&lt;CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' /&gt;

<XAxis

dataKey='date'

tickFormatter={formatDate}

interval={tickInterval}

tick={{ fontSize: 11, fill: '#718096' }}

/>

<YAxis

domain={\[minNav - padding, maxNav + padding\]}

tickFormatter={v => \`₹\${v.toFixed(0)}\`}

tick={{ fontSize: 11, fill: '#718096' }}

width={70}

/>

&lt;Tooltip content={<CustomTooltip /&gt;} />

<Line

type='monotone'

dataKey='nav'

stroke='#0D9488'

strokeWidth={2}

dot={false}

activeDot={{ r: 5, fill: '#0D9488' }}

/>

&lt;/LineChart&gt;

&lt;/ResponsiveContainer&gt;

);

}

# **8\. Bonus Feature - Server-Side NAV Caching**

**★ Bonus Feature Implemented**

The assignment awards a bonus point for caching the MFapi historical NAV response for 1 hour on the backend. This reduces external API calls, improves response times, and is respectful to the free public API. Implementation uses node-cache - a zero-dependency in-memory TTL store.

## **8.1 navCache Module**

// backend/src/cache/navCache.js

const NodeCache = require('node-cache');

// stdTTL: seconds each key lives before auto-eviction

// checkperiod: how often expired keys are pruned (seconds)

const cache = new NodeCache({

stdTTL: parseInt(process.env.NAV_CACHE_TTL, 10) || 3600,

checkperiod: 120,

useClones: false, // no deep clone for performance

});

module.exports = cache;

## **8.2 Cache Integration in the Proxy Route**

The cache check happens before any network call in GET /api/funds/:schemeCode . If a hit is found the handler returns immediately with fromCache: true in the response body (visible in DevTools for reviewer verification).

| **Cache MISS (first request)**                                                                                                  | **Cache HIT (within 1 hour)**                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1\. Check cache - miss<br><br>2\. Call MFapi.in (~400-1200ms)<br><br>3\. Store result in cache<br><br>4\. Return data to client | 1\. Check cache - hit<br><br>2\. Return immediately (~1-5ms)<br><br>3\. MFapi.in not called<br><br>4\. fromCache: true in response |

## **8.3 Cache Lifecycle**

- TTL: 3600 seconds (1 hour) - configurable via NAV_CACHE_TTL env var
- Keys: nav\_&lt;schemeCode&gt; - one entry per unique fund
- On Render free tier restart: cache is cleared (acceptable - next request repopulates)
- No persistence needed: NAV data updates once daily, so 1-hour TTL is safe

# **9\. Frontend Routing & Protected Routes**

// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';

import RegisterPage from './pages/RegisterPage';

import SearchPage from './pages/SearchPage';

import WatchlistPage from './pages/WatchlistPage';

import FundDetailPage from './pages/FundDetailPage';

import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

export default function App() {

return (

&lt;QueryClientProvider client={queryClient}&gt;

&lt;AuthProvider&gt;

&lt;BrowserRouter&gt;

&lt;Navbar /&gt;

&lt;Routes&gt;

&lt;Route path='/' element={<Navigate to='/search' replace /&gt;} />

&lt;Route path='/login' element={<LoginPage /&gt;} />

&lt;Route path='/register' element={<RegisterPage /&gt;} />

&lt;Route path='/search' element={<SearchPage /&gt;} />

&lt;Route element={<ProtectedRoute /&gt;}>

&lt;Route path='/watchlist' element={<WatchlistPage /&gt;} />

&lt;Route path='/fund/:schemeCode' element={<FundDetailPage /&gt;} />

&lt;/Route&gt;

&lt;/Routes&gt;

&lt;/BrowserRouter&gt;

&lt;/AuthProvider&gt;

&lt;/QueryClientProvider&gt;

);

}

// frontend/src/components/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {

const { token } = useAuth();

return token ? &lt;Outlet /&gt; : &lt;Navigate to='/login' replace /&gt;;

}

# **10\. Error Handling Strategy**

## **10.1 Global Error Handler (Backend)**

// backend/src/middleware/errorHandler.js

module.exports = (err, req, res, next) => {

console.error('\[ERROR\]', err.message);

// Mongoose validation error

if (err.name === 'ValidationError') {

const msgs = Object.values(err.errors).map(e => e.message);

return res.status(400).json({ error: msgs.join(', ') });

}

// Mongoose duplicate key

if (err.code === 11000)

return res.status(409).json({ error: 'Duplicate entry' });

res.status(500).json({ error: 'Internal server error' });

};

## **10.2 Frontend Error States**

| **Scenario**                  | **UI Behaviour**                                              |
| ----------------------------- | ------------------------------------------------------------- |
| **Empty watchlist**           | Friendly illustration + 'Search for funds to get started' CTA |
| **Fund has no NAV data**      | FundDetailPage shows informative empty state paragraph        |
| **Search returns 0 results**  | SearchPage shows 'No funds found for query' message           |
| **MFapi.in network failure**  | React Query isError - red error banner with retry prompt      |
| **Duplicate watchlist add**   | Card inline error: 'Already in watchlist' (HTTP 409)          |
| **Unauthenticated watchlist** | ProtectedRoute redirects to /login with return path           |
| **Invalid JWT / expiry**      | Axios interceptor catches 401, clears token, redirects        |

# **11\. Deployment Guide**

## **11.1 MongoDB Atlas**

- Create a free M0 cluster on MongoDB Atlas
- Create database user with password - store credentials securely
- Whitelist IP 0.0.0.0/0 (all IPs) for Render compatibility
- Copy the mongodb+srv://... connection string for backend env

## **11.2 Backend on Render**

- New Web Service → connect GitHub repo → set Root Directory: backend
- Build Command: npm install | Start Command: node src/server.js

Set environment variables on Render dashboard:

MONGO_URI = &lt;Atlas connection string&gt;

JWT_SECRET = &lt;32+ char random string&gt;

JWT_EXPIRES_IN = 7d

MFAPI_BASE = <https://api.mfapi.in>

FRONTEND_URL = <https://your-app.vercel.app>

NAV_CACHE_TTL = 3600

PORT = 10000 # Render's default port

## **11.3 Frontend on Vercel**

- New Project → connect GitHub → set Root Directory: frontend
- Framework Preset: Vite | Build Command: npm run build | Output: dist

Set environment variable:

VITE_API_URL = <https://your-backend.onrender.com>

**✓ Pre-Submission Deployment Checklist**

1. Register a new user → receive JWT. 2) Search 'SBI' → results appear. 3) Add a fund → appears in watchlist. 4) Click fund → NAV chart renders with range toggles. 5) Remove fund → disappears from watchlist. 6) Check Network tab on /api/funds/:code second request - fromCache: true should be present.

# **12\. Package Dependencies**

## **12.1 Backend**

// backend/package.json dependencies

{

"express": "^4.18",

"mongoose": "^8.0",

"jsonwebtoken": "^9.0",

"bcryptjs": "^2.4",

"cors": "^2.8",

"dotenv": "^16.0",

"axios": "^1.6",

"node-cache": "^5.1"

}

## **12.2 Frontend**

// frontend/package.json dependencies

{

"react": "^18.2",

"react-dom": "^18.2",

"react-router-dom": "^6.21",

"@tanstack/react-query": "^5.0",

"axios": "^1.6",

"recharts": "^2.10"

}

// devDependencies

{

"vite": "^5.0",

"@vitejs/plugin-react": "^4.2",

"tailwindcss": "^3.4",

"autoprefixer": "^10.4",

"postcss": "^8.4"

}

# **13\. README.md Template**

\# Aureva Fund Insight Tracker

\## Live URL

🔗 \*\*<https://aureva-fund-tracker.vercel.app\*\>\*

\## Tech Stack

\- Frontend: React 18 + Vite + Tailwind CSS + Recharts

\- Backend: Node.js + Express + Mongoose

\- Database: MongoDB Atlas (M0 free tier)

\- Hosting: Vercel (FE) + Render (BE)

\## Environment Variables

\### Backend (\`backend/.env\`)

| Variable | Description |

|-----------------|-----------------------------------|

| MONGO_URI | MongoDB Atlas connection string |

| JWT_SECRET | Min 32-char signing secret |

| JWT_EXPIRES_IN | e.g. 7d |

| MFAPI_BASE | <https://api.mfapi.in> |

| FRONTEND_URL | Deployed Vercel URL (for CORS) |

| NAV_CACHE_TTL | Cache TTL in seconds (3600) |

\### Frontend (\`frontend/.env\`)

| Variable | Description |

|---------------|----------------------------|

| VITE_API_URL | Deployed Render backend URL|

\## Run Locally

\`\`\`bash

\# Backend

cd backend && npm install && npm run dev

\# Frontend

cd frontend && npm install && npm run dev

\`\`\`

\## Assumptions

\- schemeCode is treated as a Number in MongoDB for consistent comparison

\- NAV history is cached server-side for 1 hour (bonus feature)

\- JWT is stored in localStorage for simplicity

\## Known Limitations

\- In-memory cache resets on Render free tier spin-down (~15 min idle)

\- MFapi.in occasionally has downtime - error states are handled gracefully

# **14\. Recommended Build Order**

| **#**  | **Task**                                    | **Key Goal**                                |
| ------ | ------------------------------------------- | ------------------------------------------- |
| **1**  | **Project scaffold + Git init**             | Monorepo, .env.example files, .gitignore    |
| **2**  | **MongoDB Atlas + Mongoose schemas**        | User, WatchlistItem models; test connection |
| **3**  | **Auth routes (register + login)**          | JWT sign/verify; bcrypt hashing             |
| **4**  | **Watchlist CRUD routes + auth middleware** | GET/POST/DELETE; 409 on duplicate           |
| **5**  | **Funds proxy routes + navCache**           | Search + NAV; bonus cache logic             |
| **6**  | **React scaffold + AuthContext**            | Vite setup, Tailwind, React Query           |
| **7**  | **Login / Register pages**                  | Forms, JWT store, redirect on success       |
| **8**  | **SearchPage + SchemeResultCard**           | Debounce, query, add-to-watchlist mutation  |
| **9**  | **WatchlistPage**                           | List items, remove button, empty state      |
| **10** | **FundDetailPage + NavChart**               | Range toggles, date parsing, Recharts       |
| **11** | **Deploy (Atlas → Render → Vercel)**        | Set env vars, test end-to-end live URL      |
| **12** | **README + cleanup**                        | Live URL, setup docs, assumptions           |

_End of Document_