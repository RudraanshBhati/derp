# API Endpoints Summary

## Base URL
`http://localhost:8000`

## Available Endpoints

### 1. Dashboard Statistics
**GET** `/api/dashboard/stats`

Returns overall statistics for the dashboard including:
- Average water levels (actual and predicted)
- Count of critical/warning/safe districts
- Forecast trend (improving/declining/stable)
- Rainfall index
- Change rate percentage

**Example Response:**
```json
{
  "avgLevel": 10.6,
  "avgPredictedLevel": 9.5,
  "criticalDistricts": 45,
  "warningDistricts": 89,
  "safeDistricts": 76,
  "totalDistricts": 210,
  "forecastTrend": "declining",
  "rainfallIndex": 78.5,
  "changeRate": -10.38
}
```

**Usage in Dashboard:**
- Display in RiskStatsCards component
- Show critical districts count
- Display trend indicator

---

### 2. Forecast Time Series
**GET** `/api/dashboard/forecast`

Returns 12 data points for historical vs predicted water levels chart.

**Example Response:**
```json
[
  {
    "month": "Jan 2024",
    "historical": 1.7,
    "predicted": 6.63,
    "district": "Hisar"
  },
  ...
]
```

**Usage in Dashboard:**
- ForecastChart component
- Line/area chart with Recharts
- Shows trend over time

---

### 3. All Districts List
**GET** `/api/districts`

Returns all 210 districts with performance metrics and geo-coordinates.

**Example Response:**
```json
[
  {
    "id": "976",
    "name": "Kaithal",
    "block": "Pundri",
    "village": "Pundri",
    "state": "Haryana",
    "level": 11.4,
    "predictedLevel": 11.67,
    "status": "Safe",
    "lat": 29.75417,
    "lng": 76.56667,
    "rmse": 1.91,
    "mae": 1.28,
    "r2": 0.777,
    "nPredictions": 47
  },
  ...
]
```

**Usage in Dashboard:**
- RiskMap component (Leaflet markers)
- Color code markers by status (Critical=red, Warning=yellow, Safe=green)
- District dropdown list
- Filter by status

---

### 4. District Detail
**GET** `/api/districts/{district_name}`

Returns detailed information and time series for a specific district.

**Example:** `/api/districts/Kaithal`

**Example Response:**
```json
{
  "district": "Kaithal",
  "block": "Pundri",
  "village": "Pundri",
  "location": {
    "lat": 29.75417,
    "lng": 76.56667
  },
  "metrics": {
    "meanActual": 11.4,
    "meanPredicted": 11.67,
    "rmse": 1.91,
    "mae": 1.28,
    "r2": 0.777,
    "nPredictions": 47
  },
  "status": "Safe",
  "advisory": "✅ Water levels stable. Continue sustainable practices.",
  "timeSeries": [
    {
      "date": "2024-01-01",
      "actual": 11.2,
      "predicted": 11.5
    },
    ...
  ]
}
```

**Usage in Dashboard:**
- DistrictPanel component
- Show mini chart of selected district
- Display advisory message
- Show detailed metrics

---

### 5. Model Performance Metrics
**GET** `/api/model/metrics`

Returns model performance across train/validation/test datasets.

**Example Response:**
```json
[
  {
    "dataset": "train",
    "rmse": 5.4106,
    "mae": 3.8832,
    "r2_score": 0.6128,
    "n_samples": 18491
  },
  {
    "dataset": "validation",
    "rmse": 7.6399,
    "mae": 4.7728,
    "r2_score": 0.4022,
    "n_samples": 2641
  },
  {
    "dataset": "test",
    "rmse": 6.1718,
    "mae": 4.3782,
    "r2_score": 0.4097,
    "n_samples": 5283
  }
]
```

**Usage in Dashboard:**
- ModelLab page (if implementing)
- Show model accuracy metrics
- Performance comparison table

---

### 6. GeoJSON for Maps
**GET** `/api/geojson/districts`

Returns districts in GeoJSON format for Leaflet/Mapbox.

**Example Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [76.56667, 29.75417]
      },
      "properties": {
        "id": "976",
        "name": "Kaithal",
        "block": "Pundri",
        "village": "Pundri",
        "level": 11.4,
        "predictedLevel": 11.67,
        "status": "Safe",
        "rmse": 1.91,
        "mae": 1.28
      }
    },
    ...
  ]
}
```

**Usage in Dashboard:**
- RiskMap component
- Directly compatible with Leaflet's L.geoJSON()
- Easy to add popups and styling

---

### 7. Summary Statistics
**GET** `/api/summary`

Returns comprehensive summary statistics for all datasets.

**Usage in Dashboard:**
- Statistics overview
- Model performance comparison

---

### 8. Predictions (Paginated)
**GET** `/api/predictions?dataset=test&limit=100&offset=0`

**Query Parameters:**
- `dataset` (optional): "train", "test", or "validation"
- `limit` (default: 100): Number of records per page
- `offset` (default: 0): Starting position

**Usage in Dashboard:**
- Data explorer component
- Paginated table of predictions

---

### 9. Health Check
**GET** `/api/health`

Check if API and data files are accessible.

---

## Frontend Integration Example

### In `src/services/api.js`:

```javascript
const API_BASE = "http://localhost:8000/api";

export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE}/dashboard/stats`);
  return response.json();
};

export const getForecastData = async () => {
  const response = await fetch(`${API_BASE}/dashboard/forecast`);
  return response.json();
};

export const getDistricts = async () => {
  const response = await fetch(`${API_BASE}/districts`);
  return response.json();
};

export const getDistrictDetail = async (districtName) => {
  const response = await fetch(`${API_BASE}/districts/${districtName}`);
  return response.json();
};

export const getDistrictsGeoJSON = async () => {
  const response = await fetch(`${API_BASE}/geojson/districts`);
  return response.json();
};
```

### In React Components:

```jsx
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';

function RiskStatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <h3>Avg Water Level</h3>
        <p>{stats.avgLevel}m</p>
      </Card>
      <Card>
        <h3>Critical Districts</h3>
        <p>{stats.criticalDistricts}</p>
      </Card>
      {/* ... */}
    </div>
  );
}
```

---

## Data Flow Recommendation

1. **On Dashboard Load:**
   - Call `/api/dashboard/stats` → RiskStatsCards
   - Call `/api/dashboard/forecast` → ForecastChart
   - Call `/api/geojson/districts` → RiskMap

2. **On District Click/Select:**
   - Call `/api/districts/{name}` → DistrictPanel
   - Show detailed view with mini chart

3. **Status Color Coding:**
   - Critical (RMSE > 5.0 or MAE > 4.0) → Red
   - Warning (RMSE > 3.0 or MAE > 2.5) → Yellow
   - Safe → Green

---

## Testing the API

Open in browser or use curl:
- http://localhost:8000/docs - Swagger UI (interactive testing)
- http://localhost:8000/redoc - ReDoc documentation
- http://localhost:8000/api/health - Quick health check

Test endpoints:
```bash
curl http://localhost:8000/api/dashboard/stats
curl http://localhost:8000/api/districts
curl http://localhost:8000/api/districts/Kaithal
```
