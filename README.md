# EventGenius — AI Event Planning Assistant

> A production-ready full-stack AI Event Planning Assistant built with React, Node.js, MongoDB, and the Google Gemini API.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local-success?logo=mongodb)](https://mongodb.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5--flash-orange?logo=google)](https://ai.google.dev)

---

## 🌟 Features

### Core
- **JWT Authentication** — Register, login, logout with HTTP-only cookies and secure session management
- **Protected Routes** — All dashboard routes are protected; unauthorized users are redirected to login
- **AI Event Planning** — Generate complete event plans (overview, budget breakdown, vendors, timeline, checklist) using Gemini AI
- **AI Chat Assistant** — Conversational AI with full conversation history, context-aware responses
- **Saved Plans** — Save, browse, favorite, and delete event plans
- **Dashboard Analytics** — Charts (bar + pie) for monthly activity and event type distribution
- **User Profile** — Edit name, bio, avatar, phone; change password

### Bonus Features
- 🎤 **Voice Input** — Web Speech API integration for hands-free chat
- 📄 **PDF Export** — Multi-page formatted PDF with cover page, charts, and all plan sections
- 📱 **WhatsApp Sharing** — Share event summary directly to WhatsApp
- 🌙 **Dark Mode** — System-preference detection + manual toggle with persistence
- 📩 **AI Invitation Messages** — Generate formal/casual invitation text with Gemini
- 🎨 **AI Image Prompts** — Generate DALL·E/Midjourney prompts to visualize your event

---

## 🏗️ Architecture

```
Assignment/
├── server/                  # Node.js + Express Backend
│   ├── config/db.js         # MongoDB connection
│   ├── controllers/         # Business logic
│   │   ├── auth.controller.js
│   │   ├── chat.controller.js
│   │   ├── event.controller.js
│   │   └── analytics.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification
│   │   └── error.middleware.js    # Global error handler
│   ├── models/
│   │   ├── User.model.js          # Mongoose user schema
│   │   ├── Conversation.model.js  # Chat history schema
│   │   └── EventPlan.model.js     # Event plan schema
│   ├── routes/              # Express routers
│   ├── services/
│   │   └── gemini.service.js  # Gemini API integration
│   └── index.js             # App entry point
│
└── client/                  # React + Vite + Tailwind Frontend
    └── src/
        ├── api/axios.js     # Axios instance with interceptors
        ├── context/         # Auth & Theme contexts
        ├── components/      # Reusable UI components
        ├── pages/           # Route-level page components
        └── utils/           # PDF export, helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Assignment
```

### 2. Set up the backend

```bash
cd server
npm install
```

Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

Start the backend:
```bash
npm run dev
```

The server will start on `http://localhost:5000`.

### 3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

The client will start on `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/eventplanner` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | `your_super_secret_key_here` |
| `JWT_EXPIRE` | JWT expiry duration | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user | No |
| `POST` | `/api/auth/logout` | Logout user | Yes |
| `GET` | `/api/auth/me` | Get current user | Yes |
| `PUT` | `/api/auth/profile` | Update profile | Yes |
| `PUT` | `/api/auth/password` | Change password | Yes |

### AI Chat
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/message` | Send chat message |
| `GET` | `/api/chat/conversations` | List conversations |
| `GET` | `/api/chat/conversations/:id` | Get conversation |
| `DELETE` | `/api/chat/conversations/:id` | Delete conversation |

### Event Plans
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/events/generate` | Generate AI plan |
| `GET` | `/api/events` | List user plans |
| `GET` | `/api/events/:id` | Get single plan |
| `DELETE` | `/api/events/:id` | Delete plan |
| `PUT` | `/api/events/:id/favorite` | Toggle favorite |
| `PUT` | `/api/events/:id/checklist/:index` | Update checklist item |
| `POST` | `/api/events/:id/invitation` | Generate invitation |
| `POST` | `/api/events/:id/image-prompt` | Generate image prompt |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics` | Get dashboard analytics |

---

## 🛡️ Security

- **JWT in HTTP-only cookies** — prevents XSS token theft
- **SameSite=Strict** (production) — CSRF protection
- **bcryptjs** — 12 salt rounds for password hashing
- **express-rate-limit** — 20 auth requests / 15 min, 200 global requests / 15 min
- **express-validator** — Input validation on all user-submitted data
- **Helmet.js** — Secure HTTP headers
- **CORS** — Restricted to configured frontend origin only
- **Password never returned** — `select: false` on password field

---

## 🧠 AI Prompt Engineering

### Event Planner Prompt
- Uses `responseMimeType: 'application/json'` for guaranteed structured JSON output
- Instructs Gemini to fill all 8 budget categories summing exactly to the provided budget
- Tailors vendor names and recommendations to the specified Indian city
- Returns: overview, theme, highlights, budgetBreakdown, vendors, timeline, checklist

### Chat Assistant System Prompt
- Establishes "EventGenius" persona as a 15-year expert event planner
- Maintains full conversation history for context-aware responses
- Covers: themes, vendors, budgets, timelines, catering, entertainment

### Invitation Generator
- Generates two versions: formal and casual
- Personalizes with event type, theme, date, city, and host name

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | React Context + useReducer |
| HTTP | Axios |
| Charts | Recharts |
| PDF | jsPDF |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT (HTTP-only cookies), bcryptjs |
| Validation | express-validator |
| Security | Helmet, express-rate-limit, CORS |

---

## 📱 Responsive Design

- **Mobile** (320px+): Stack layout, hamburger sidebar
- **Tablet** (768px+): Two-column layouts
- **Desktop** (1024px+): Full sidebar + content layout

---

## 🚀 Deployment

### Backend (e.g. Railway, Render)
1. Set all environment variables in your hosting platform
2. Set `NODE_ENV=production`
3. Set `CLIENT_URL` to your frontend domain
4. Run `npm start`

### Frontend (e.g. Vercel, Netlify)
1. Set `VITE_API_URL` if not using a proxy
2. Update `vite.config.js` proxy target to your deployed backend URL
3. Run `npm run build` and deploy the `dist/` folder

---

## 📄 License

MIT © 2024 EventGenius
