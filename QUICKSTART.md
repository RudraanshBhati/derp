# Quick Start Guide

## Complete Setup in 5 Minutes

### Step 1: Start Backend API

```powershell
# Navigate to backend directory
cd C:\dev\derp\backend

# Start the FastAPI server
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify Backend:**
```powershell
# Test health endpoint
curl http://localhost:8000/api/health

# Expected: {"status":"healthy"...}
```

### Step 2: Install Frontend Dependencies (First Time Only)

```powershell
# Navigate to frontend directory
cd C:\dev\derp\frontend

# Install all dependencies
npm install
```

### Step 3: Start Frontend

```powershell
# Still in frontend directory
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Step 4: Open Dashboard

Open your browser and navigate to:
```
http://localhost:5173
```

---

## What You Should See

### 1. Dashboard Header
- **Title**: "Haryana Groundwater Monitor"
- **Subtitle**: "Real-time surveillance and forecasting system for 208 districts"
- **Status Indicator**: Green pulsing dot "Live Data Stream"

### 2. Four Stat Cards

| Card | Value | Description |
|------|-------|-------------|
| 💧 Avg Water Level | ~10.6 m | Shows current average with prediction |
| ⚠️ Critical Zones | ~84 | Districts needing immediate attention |
| 📈 Forecast Trend | Declining | Overall trend direction |
| 🌧️ Rainfall Index | 78.5 | Precipitation score |

### 3. Interactive Map
- **Center**: Haryana, India
- **Markers**: 208 colored circles
  - 🔴 Red = Critical (RMSE > 5.0)
  - 🟡 Yellow = Warning (RMSE 3.0-5.0)
  - 🟢 Green = Safe (RMSE < 3.0)
- **Interaction**: Click circles to see popup with district details

### 4. Forecast Chart
- **Type**: Area chart
- **Lines**: 
  - Blue solid = Historical data
  - Purple dashed = Predicted levels
- **Data Points**: 12 months

### 5. District Panel
- **Dropdown**: 208 districts listed as "Name - Village"
- **Selection**: 
  1. Choose district from dropdown
  2. See current level, predicted level
  3. View RMSE, MAE, R² metrics
  4. See historical trend mini-chart
  5. Read AI-generated advisory

---

## Testing Checklist

### ✅ Backend Tests

```powershell
# Test 1: Health Check
curl http://localhost:8000/api/health
# ✓ Should return: {"status":"healthy"}

# Test 2: Stats
curl http://localhost:8000/api/dashboard/stats
# ✓ Should return: avgLevel, criticalDistricts, etc.

# Test 3: Districts Count
curl http://localhost:8000/api/districts | ConvertFrom-Json | Measure-Object
# ✓ Should return: Count: 208

# Test 4: Specific District
curl "http://localhost:8000/api/districts/Kaithal"
# ✓ Should return: district details with metrics

# Test 5: Forecast
curl http://localhost:8000/api/dashboard/forecast | ConvertFrom-Json
# ✓ Should return: 12 data points with month, historical, predicted
```

### ✅ Frontend Tests

**Open Browser Console (F12) → Network Tab**

1. **Initial Page Load:**
   - ✓ Request to `/api/dashboard/stats` → 200 OK
   - ✓ Request to `/api/dashboard/forecast` → 200 OK
   - ✓ Request to `/api/districts` → 200 OK

2. **Stat Cards:**
   - ✓ All 4 cards show real numbers
   - ✓ "Declining" trend shown with down arrow
   - ✓ Critical districts count displays

3. **Map:**
   - ✓ Centered on Haryana (around lat 29, lng 76)
   - ✓ Circles appear on map
   - ✓ Click circle → popup shows
   - ✓ Popup displays: name, village, level, status

4. **Chart:**
   - ✓ 12 data points visible
   - ✓ Blue and purple lines rendered
   - ✓ Hover shows tooltip with values

5. **District Selector:**
   - ✓ Dropdown has 208 options
   - ✓ Select "Kaithal - Pundri"
   - ✓ Panel updates with details
   - ✓ Mini chart appears
   - ✓ Advisory message shows
   - ✓ Network tab shows request to `/api/districts/Kaithal`

---

## Common Issues & Fixes

### ❌ "Failed to fetch" errors

**Cause**: Backend not running

**Fix**:
```powershell
cd C:\dev\derp\backend
python main.py
```

### ❌ Map not showing

**Cause**: Leaflet CSS not loaded or lat/lng out of bounds

**Fix**:
1. Check console for errors
2. Verify import in RiskMap.jsx: `import 'leaflet/dist/leaflet.css'`
3. Check API returns valid lat/lng values

### ❌ Empty dropdown in District Panel

**Cause**: Districts not loaded from API

**Fix**:
1. Open DevTools → Network tab
2. Check `/api/districts` request
3. Verify response has 208 items
4. Check console for errors

### ❌ "Internal Server Error" from API

**Cause**: CSV files not found or pandas error

**Fix**:
```powershell
# Check data files exist
dir C:\dev\derp\data\predictions\

# Should see:
# - district_wise_performance.csv
# - test_predictions.csv
# - test_predictions_detailed.csv
# - model_performance_metrics.csv
```

### ❌ Chart not rendering

**Cause**: Recharts not installed or data format mismatch

**Fix**:
```powershell
cd C:\dev\derp\frontend
npm install recharts
```

### ❌ Port 8000 already in use

**Fix**:
```powershell
# Find and kill process on port 8000
Get-NetTCPConnection -LocalPort 8000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Then restart backend
cd C:\dev\derp\backend
python main.py
```

---

## Development Workflow

### Making Changes

**Backend Changes:**
1. Edit `backend/main.py`
2. File saves → uvicorn auto-reloads
3. Refresh browser to see changes

**Frontend Changes:**
1. Edit any `.jsx` file
2. Vite auto-reloads in browser
3. See changes immediately

### Adding New API Endpoint

1. **Backend** (`backend/main.py`):
```python
@app.get("/api/new-endpoint")
async def new_endpoint():
    return {"data": "value"}
```

2. **Frontend** (`src/services/api.js`):
```javascript
export const getNewData = async () => {
    const response = await fetch(`${API_BASE}/new-endpoint`);
    return handleResponse(response);
};
```

3. **Component**:
```jsx
import { getNewData } from '../services/api';

useEffect(() => {
    getNewData().then(data => console.log(data));
}, []);
```

---

## Production Deployment

### Backend
```powershell
cd C:\dev\derp\backend

# Install production server
pip install gunicorn

# Run with gunicorn (Linux/Mac)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

# Run with uvicorn (Windows)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```powershell
cd C:\dev\derp\frontend

# Build for production
npm run build

# Output: dist/ folder with optimized files

# Serve with simple HTTP server
npm run preview
# Or deploy dist/ to: Vercel, Netlify, AWS S3, etc.
```

### Environment Variables

**Production API URL:**

Create `frontend/.env.production`:
```
VITE_API_URL=https://your-api-domain.com/api
```

Update `src/services/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
```

---

## Next Steps

1. ✅ **Start both servers** (backend + frontend)
2. ✅ **Verify all components load**
3. ✅ **Test district selection**
4. ✅ **Explore the map**
5. ⭐ **Customize styling** (colors, fonts, layout)
6. ⭐ **Add more visualizations** (model performance page)
7. ⭐ **Implement simulator page**
8. ⭐ **Build advisor chatbot**

---

## Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Backend README**: `backend/README.md`
- **API Details**: `backend/API_DOCUMENTATION.md`
- **Data Mapping**: `DATA_MAPPING.md`
- **Frontend Setup**: `frontend/SETUP.md`

## Support

If you encounter issues:
1. Check terminal outputs for errors
2. Open browser DevTools (F12) → Console tab
3. Check Network tab for failed requests
4. Verify CSV files exist in `data/predictions/`
5. Ensure Python dependencies installed: `pip list`
6. Ensure Node dependencies installed: `npm list`
