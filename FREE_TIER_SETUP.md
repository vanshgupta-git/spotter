# Free-Tier Setup & Deployment Guide

This application is strictly designed to operate at **₹0 / $0 cost** across development and production using eligible free tiers and open-source APIs.

---

## 1. Zero-Cost APIs & Service Providers

### 1.1 Open-Meteo Weather & Geocoding API
- **Cost**: 100% Free for non-commercial & educational use.
- **Account / Key**: **No API key or credit card required**.
- **Quota**: Up to 10,000 API requests per day.
- **Usage Strategy**: The backend groups checkpoints along the route into batches of up to 25 coordinates per single HTTP request and caches coordinate forecasts in memory with coordinate rounding (~1 km grid). This ensures a full 3-route trip uses only 2–3 API requests total.
- **Attribution**: Included on map and footer ("Weather data by Open-Meteo.com under CC BY 4.0").

### 1.2 Open Source Routing Machine (OSRM)
- **Cost**: 100% Free open-source routing engine.
- **Account / Key**: **No API key or credit card required**.
- **Endpoint**: `https://router.project-osrm.org/route/v1/driving`
- **Alternative Routes Feature**: OSRM provides initial alternatives via `alternatives=3`. For city pairs where OSRM returns fewer than 3 options, our backend router computes lateral corridor waypoints, querying legal road paths to guarantee 3 genuine, distinct highway options without duplication.
- **Attribution**: OpenStreetMap contributors (`&copy; OpenStreetMap contributors`).

### 1.3 Optional: OpenRouteService (ORS)
- If desired, an OpenRouteService API key can be obtained for free (2,000 requests/day free tier) at [openrouteservice.org](https://openrouteservice.org).
- Set `ORS_API_KEY=your_key` and `ROUTING_PROVIDER=openrouteservice` in backend `.env`.
- By default, the app runs on OSRM out of the box with zero setup.

---

## 2. Frontend Deployment on Vercel (Free Hobby Plan)

Vercel provides a free Hobby tier with unlimited deployments for personal projects.

### Step-by-Step Vercel Deployment:
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **Add New...** > **Project** and import your `spotter` repository.
4. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   - Add `VITE_API_BASE_URL`: The production URL of your backend (e.g. `https://your-backend.onrender.com`).
6. Click **Deploy**. Vercel will build and assign a free URL (e.g., `https://spotter-routing.vercel.app`).

### Client-Side Routing:
The project uses single-page application structure. If deep links are used, add `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 3. Backend Deployment on Free Python Hosting (Render / Railway / Vercel)

### Option A: Render Free Web Service via Blueprint (Easiest - 1 Click)
Render automatically detects `render.yaml` in the root of the repository:

1. Sign up or log in at [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository (`https://github.com/vanshgupta-git/spotter`).
4. Render automatically parses `render.yaml` and configures:
   - **Service Name**: `spotter-backend`
   - **Runtime**: Python 3.12
   - **Plan**: Free (750 free hours/month)
   - **Build Command**: `bash build.sh` (installs requirements, collects static assets via WhiteNoise, runs migrations)
   - **Start Command**: `gunicorn --chdir backend spotter_project.wsgi:application --bind 0.0.0.0:$PORT`
   - **Environment Variables**: Automatic `SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOW_ALL_ORIGINS=True`.
5. Click **Apply**. Within ~2 minutes, your backend will be live at `https://spotter-backend-<unique-id>.onrender.com`!

### Option B: Render Manual Web Service
Alternatively, you can set it up manually:
1. Click **New +** > **Web Service** on Render.
2. Select your repository.
3. Configure:
   - **Root Directory**: leave blank (repo root)
   - **Runtime**: `Python 3`
   - **Build Command**: `bash build.sh`
   - **Start Command**: `gunicorn --chdir backend spotter_project.wsgi:application --bind 0.0.0.0:$PORT`
   - **Plan**: `Free`
4. In **Environment Variables**:
   - `DEBUG`: `False`
   - `DJANGO_ALLOWED_HOSTS`: `.onrender.com,localhost,127.0.0.1`
   - `CORS_ALLOW_ALL_ORIGINS`: `True`
5. Click **Create Web Service**.

### Option C: Vercel Serverless Python Backend
If deploying both frontend and backend on Vercel:
1. The repository includes `wsgi.py` exporting `app = application`, compatible with Vercel's Python WSGI runtime.
2. In `vercel.json` at project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/spotter_project/wsgi.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/spotter_project/wsgi.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

---

## 4. Verification Checklist

- [x] Backend responds to `/api/health/` with HTTP 200.
- [x] Backend geocoding suggestions return location lists.
- [x] Backend trip planner returns 3 distinct routes with genuine coordinates, road distances, checkpoints, and arrival times.
- [x] Risk classifications match exact boundary values for Wind, Rain, Snow, and Load-dependent shear.
- [x] Frontend builds cleanly without TypeScript or bundler errors.
- [x] Vitest component tests pass.
- [x] Pytest backend unit tests pass (64 tests).
- [x] Map renders with interactive checkpoints, routes, and corridor weather heatmap.
- [x] 0–48 hour slider updates corridor heatmap smoothly.
- [x] Zero credit cards, subscriptions, or paid API keys required.
