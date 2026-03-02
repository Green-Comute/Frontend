# 🌱 GreenCommute — Frontend

## Intelligent Ride Sharing & Sustainable Mobility Platform

> React-based frontend for the GreenCommute carpooling platform — featuring role-based dashboards, real-time tracking, live traffic view, and geospatial trip matching.

---

## 🚀 Tech Stack

- **React 19** + **Vite**
- **React Router** v7
- **Tailwind CSS**
- **Leaflet** + **React Leaflet** (maps)
- **TomTom Traffic API** (live traffic flow & incidents)
- **Socket.io Client** (real-time updates)
- **Lucide Icons**
- **Vitest** + **React Testing Library** (testing)

---

## ⚙ Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` and update values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL (default: `http://localhost:5000/api`) |
| `VITE_TOMTOM_API_KEY` | Optional | TomTom API key for live traffic overlay ([get free key](https://developer.tomtom.com/)) |

### 3. Run Development Server

```bash
npm run dev
```

---

## 🚦 Live Traffic View

The driver dashboard includes a **live traffic overlay** powered by the **TomTom Traffic API** (free tier — 2,500 requests/day, **no credit card required**).

### Features

| Feature | Description |
|---------|-------------|
| **Traffic Flow Tiles** | Colour-coded road overlay (🟢 free-flow → 🟡 moderate → 🔴 heavy congestion) |
| **Traffic Incidents** | Real-time markers for accidents 🚨, jams 🚗, road closures ⛔, construction 🚧, weather 🌧️ |
| **Auto-refresh** | Incidents refresh every 60 seconds and on map pan/zoom |
| **Toggle Controls** | Drivers can toggle traffic flow and incidents on/off independently |

### Getting Your Free TomTom API Key

1. Visit [developer.tomtom.com](https://developer.tomtom.com/)
2. Sign up for a **free account** (no credit card required)
3. Create a new app → copy the **API Key**
4. Add it to your `.env` file:  
   ```
   VITE_TOMTOM_API_KEY=your_key_here
   ```

> **Note:** The traffic view works without the API key — it simply won't show traffic data. All other map features (routing, markers, ETA) remain fully functional.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 📦 Build

```bash
npm run build
npm run preview
```

---

## 🔧 Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

---

## 📜 License

Open-source academic project.
