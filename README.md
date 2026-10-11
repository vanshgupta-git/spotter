# Spotter Weather-Aware Truck Routing Application

A production-grade, zero-cost commercial freight routing application that helps dispatchers and truck drivers choose the safest route based on road weather hazards, load weight dynamics, and travel times across three genuine alternative corridors.

Built strictly to the requirements of the Spotter Full-Stack Technical Assessment (`fs-assessment-spotter.pdf`).

---

## 1. Key Features

- **3 Genuine Alternative Routes**: Uses the Open Source Routing Machine (OSRM) highway network to compute three distinct drivable road paths between origin and destination with zero duplicates.
- **Road-Geometry Checkpoint Sampling**: Samples road weather at precise user intervals (10, 25, or 50 miles) based on cumulative highway distance (not straight-line lat/lon chords).
- **Time-Aware Arrival Estimation (ETAs)**: Calculates arrival time at each checkpoint based on cumulative highway mileage and departure time.
- **Exact Risk Engine**: Implements the exact environmental thresholds specified for Wind, Rain, and Snow.
- **Load-Dependent Wind Overrides**:
  - Wind $\ge 55\text{ mph}$: **No Travel** for any load weight.
  - Wind $45\text{ to }<55\text{ mph}$ with load $> 30,000\text{ lb}$: **No Travel** (anti-rollover safety rule).
  - Wind $35\text{ to }<45\text{ mph}$ with load $> 40,000\text{ lb}$: Elevated to **Severe**.
- **Segment-Based Mileage Attribution**: Voronoi/midpoint 1D partitioning along cumulative route distance ensures $\sum \text{segment miles} = \text{total route miles}$.
- **Strict Lexicographical Route Recommendation Priority**:
  1. Fewest **Severe miles**
  2. Fewest **High miles**
  3. Lowest **average risk**
  4. Shortest **travel times**
  - **No-Travel Exclusion**: Disqualifies hazardous routes encountering No-Travel weather from safe recommendations; issues a critical dispatcher alert if all corridors are unsafe.
- **0–48 Hour Interactive Forecast Timeline & Heatmap**: Slider scrubs through 48 hours of corridor weather with live heatmap circle overlays and play/pause timeline progression.
- **Interactive Leaflet Transportation Map**: Multi-route polylines with custom colors, interactive risk-coded checkpoint popups, and dark-themed UI.

---

## 2. Technology Stack & Strict Zero-Cost Architecture

| Layer | Technologies | Free-Tier Details |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React-Leaflet, Leaflet, Axios, Lucide | Hosted on **Vercel Hobby Plan** ($0/month) |
| **Backend** | Python 3.12, Django 5, Django REST Framework, django-cors-headers, requests | Stateless architecture runnable on Vercel Serverless / Render Free |
| **Routing** | OSRM (Open Source Routing Machine) | Free public routing engine with fallback lateral corridor generator |
| **Weather** | Open-Meteo Forecast & Geocoding API | Free tier with up to 10,000 daily API calls, hourly wind/rain/snow |
| **Testing** | Vitest, React Testing Library, Pytest, Django Test Client | 100% locally runnable with deterministic fixtures and zero paid dependencies |

---

## 3. Project Structure

```text
spotter/
├── backend/
│   ├── spotter_project/       # Django project configuration & WSGI/ASGI handlers
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── routing/               # Modular routing domain
│   │   ├── adapters/          # OSRM, Geocoding, base routing provider
│   │   └── services/          # Checkpoint generator, cumulative geometry, route service
│   ├── weather/               # Modular weather domain
│   │   ├── adapters/          # Open-Meteo batch hourly forecast adapter & normalizer
│   │   └── services/          # Corridor grid & heatmap generator
│   ├── risk/                  # Pure risk domain
│   │   ├── engine.py          # Pure threshold & load rule classification
│   │   ├── segment_calculator.py # Segment mileage attribution & weighted average risk
│   │   └── recommender.py     # Lexicographical route ranking engine
│   ├── api/                   # REST API layer
│   │   ├── serializers.py     # Input validation (origins, weights, intervals)
│   │   ├── views.py           # HealthCheckView, GeocodeView, RoutePlanView
│   │   └── urls.py
│   ├── tests/                 # Comprehensive backend test suite (64 tests)
│   │   ├── test_risk_engine.py
│   │   ├── test_checkpoints.py
│   │   ├── test_recommender.py
│   │   └── test_api.py
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Ops bar, original SVG truck logo, live indicators
│   │   │   ├── TripForm.tsx         # Origin/Dest, departure, load weight, presets
│   │   │   ├── ForecastSlider.tsx   # 0-48h forecast scrubber & play/pause animation
│   │   │   ├── RouteList.tsx        # Alternative route cards with metrics & rationales
│   │   │   ├── MapView.tsx          # Leaflet map, multi-route polylines, popups, heatmap
│   │   │   └── RiskLegendModal.tsx  # Exact assessment risk rules & load table modal
│   │   ├── test/                    # Frontend Vitest test suite (7 tests)
│   │   ├── api.ts                   # Axios client
│   │   ├── types.ts                 # Full TypeScript interfaces
│   │   ├── App.tsx                  # Main 2-column dashboard layout
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── pytest.ini
├── .env.example
├── FREE_TIER_SETUP.md
└── README.md
```

---

## 4. Local Installation & Development

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ and npm (tested on Node v24)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/spotter.git
cd spotter
```

### Step 2: Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations (standard Django compatibility)
python backend/manage.py migrate

# Start backend dev server
python backend/manage.py runserver 127.0.0.1:8000
```
Backend health check is accessible at `http://127.0.0.1:8000/api/health/`.

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser. The application automatically loads and evaluates the default corridor (`Chicago, IL → New York, NY`).

---

## 5. Automated Testing

### Backend Unit & Boundary Tests
Run all 64 backend tests with `pytest`:
```bash
pytest
```
Test suite coverage includes:
- Wind threshold boundaries (below 25, 25-34, 35-44, 45-54, >=55 mph).
- Load-dependent wind rules (45-54 mph + >30,000 lb triggers No Travel, 35-44 mph + >40,000 lb triggers Severe).
- Rain threshold boundaries (<0.10, 0.10-0.24, 0.25-0.49, 0.50-1.00, >1.00 in/hr).
- Snow threshold boundaries (<0.5, 0.5-0.9, 1.0-1.9, 2.0-3.0, >3.0 in/hr).
- Road geometry distance and cumulative checkpoint sampling.
- Lexicographical ranking priorities (proving each tier dominates all lower tiers).
- Disqualification of No-Travel corridors.
- DRF API endpoint validation (rejecting negative load weights, invalid timestamps, unsupported intervals).

### Frontend Component Tests
Run all Vitest component tests:
```bash
cd frontend
npm test
```
Tests cover:
- `TripForm.test.tsx`: Input validation, preset button triggers, interval selection.
- `RouteList.test.tsx`: Route metric card rendering, recommendation badge, route selection.
- `ForecastSlider.test.tsx`: 0-48h scrubbing, mode switching between checkpoint ETA and corridor heatmap.

### Frontend Production Build
```bash
cd frontend
npm run build
```
Generates production-optimized bundle in `frontend/dist/`.

---

## 6. Weather Risk Engine & Route Recommendation Methodology

### Risk Rules Table

| Hazard | Low | Moderate | High | Severe | No Travel |
|---|---|---|---|---|---|
| **Wind (mph)** | $<25$ | $25\text{ to }<35$ | $35\text{ to }<45$ | $45\text{ to }<55$ | $\ge 55$ |
| **Rain (in/hr)** | $<0.10$ | $0.10\text{ to }<0.25$ | $0.25\text{ to }<0.50$ | $0.50\text{ through }1.00$ | $>1.00$ |
| **Snow (in/hr)** | $<0.5$ | $0.5\text{ to }<1.0$ | $1.0\text{ to }<2.0$ | $2.0\text{ through }3.0$ | $>3.0$ |

### Load Overrides
1. Wind $\ge 55\text{ mph}$ $\implies$ **No Travel** for all loads.
2. Wind $45\text{ to }<55\text{ mph}$ with Load $> 30,000\text{ lb}$ $\implies$ **No Travel**.
3. Wind $35\text{ to }<45\text{ mph}$ with Load $> 40,000\text{ lb}$ $\implies$ **Severe**.

### Segment-Miles & Average Risk Formula
For $N$ checkpoints along cumulative distance $D$, each checkpoint $i$ controls interval $[s_i, e_i]$ where:
$$\Delta d_i = \text{segment length},\quad \sum_{i=0}^{N-1} \Delta d_i = D$$
$$\text{Average Risk} = \frac{\sum_{i=0}^{N-1} (\text{RiskScore}_i \times \Delta d_i)}{D}$$
where Low = 1.0, Moderate = 2.0, High = 3.0, Severe = 4.0, No Travel = 5.0.

### Recommendation Lexicographical Order
Given safe routes (excluding No Travel):
$$\text{Rank Key} = (\text{Severe Miles}, \text{High Miles}, \text{Average Risk}, \text{Travel Time Seconds})$$

---

## 7. Security & Privacy

- **No Secrets Exposed**: All sensitive configs are backend environment variables (`.env`).
- **Input Validation**: Rejects non-finite values, negative weights, coordinates outside $[-90, 90] / [-180, 180]$, and invalid intervals.
- **Attribution & Free Quotas**: Respects OpenStreetMap attribution and batches Open-Meteo queries (up to 25 points/call) with in-memory caching.
