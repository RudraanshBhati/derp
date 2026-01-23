# Frontend Setup Guide

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`

## Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

Required packages:
- `react-router-dom` - Routing
- `recharts` - Charts
- `leaflet` & `react-leaflet` - Maps
- `framer-motion` - Animations
- `lucide-react` - Icons
- `clsx` & `tailwind-merge` - Utility classes

2. **Install if missing:**
```bash
npm install react-router-dom recharts leaflet react-leaflet framer-motion clsx tailwind-merge lucide-react
```

## Running the Application

### Start Backend First
```bash
cd ../backend
python main.py
# Server starts on http://localhost:8000
```

### Start Frontend
```bash
cd frontend
npm run dev
# Vite dev server starts on http://localhost:5173
```

## API Configuration

The frontend connects to the backend API at `http://localhost:8000/api`.

To change the API URL, edit [src/services/api.js](src/services/api.js):
```javascript
const API_BASE = "http://localhost:8000/api";
```

## Data Flow

### Dashboard Page
1. **On Load** → Fetches:
   - `/api/dashboard/stats` → RiskStatsCards
   - `/api/dashboard/forecast` → ForecastChart
   - `/api/districts` → DistrictPanel dropdown & RiskMap

2. **On District Select** → Fetches:
   - `/api/districts/{name}` → DistrictPanel details

### Components ↔ APIs

| Component | API Endpoint | Data |
|-----------|-------------|------|
| RiskStatsCards | `/api/dashboard/stats` | avgLevel, criticalDistricts, trend |
| ForecastChart | `/api/dashboard/forecast` | Time series (12 months) |
| RiskMap | `/api/districts` | All districts with lat/lng |
| DistrictPanel | `/api/districts/{name}` | Detailed metrics + time series |

## Features

### Real Data Integration ✅
- 208 districts from Haryana
- Actual vs Predicted water levels
- RMSE, MAE, R² performance metrics
- Risk classification (Critical/Warning/Safe)
- Historical time series charts

### Interactive Map
- Leaflet-based map centered on Haryana
- Color-coded circles by risk status
- Popup with district details
- Responsive zoom/pan

### Live Statistics
- Average water level with trend
- Critical/Warning/Safe district counts
- Forecast trend indicator
- Rainfall index

### District Analysis
- Dropdown selector
- Real-time API fetching
- Mini time series chart
- AI-generated advisories

## Troubleshooting

### Map not loading
- Ensure `leaflet` CSS is imported in RiskMap.jsx
- Check browser console for errors
- Verify lat/lng data from API

### API connection failed
- Check backend is running: `curl http://localhost:8000/api/health`
- Check CORS settings in backend/main.py
- Verify network tab in browser DevTools

### No data showing
- Open browser console (F12)
- Check Network tab for failed requests
- Verify API responses contain data

### Styling issues
- Ensure Tailwind is configured properly
- Check `tailwind.config.js` includes all paths
- Verify `index.css` imports Tailwind directives

## File Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── components/
│   │   └── dashboard/
│   │       ├── RiskStatsCards.jsx
│   │       ├── RiskMap.jsx
│   │       ├── ForecastChart.jsx
│   │       └── DistrictPanel.jsx
│   ├── pages/
│   │   └── DashboardPage.jsx    # Main dashboard
│   └── App.jsx
├── package.json
└── vite.config.js
```

## Next Steps

1. **Test with live backend:**
   ```bash
   # Terminal 1
   cd backend && python main.py
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Open browser:**
   - Navigate to `http://localhost:5173`
   - Check all 4 stat cards load
   - Verify map shows 208 districts
   - Test district selector

3. **Verify data accuracy:**
   - Compare displayed data with CSV files
   - Check console for API errors
   - Test different districts

## Production Build

```bash
npm run build
# Creates optimized build in dist/

# Preview production build
npm run preview
```

## Environment Variables (Optional)

Create `.env` file:
```
VITE_API_URL=http://localhost:8000/api
```

Update api.js:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
```
