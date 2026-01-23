# Data Mapping Reference

## CSV → API → Frontend

### 1. Dashboard Statistics

**CSV Sources:**
- `test_predictions.csv` - actual/predicted water levels
- `district_wise_performance.csv` - district metrics
- `prediction_summary_statistics.csv` - overall statistics

**API Response** (`GET /api/dashboard/stats`):
```json
{
  "avgLevel": 10.6,              // From test_predictions.csv → mean(actual_water_level)
  "avgPredictedLevel": 9.5,      // From test_predictions.csv → mean(predicted_water_level)
  "criticalDistricts": 84,       // Count where RMSE > 5.0 OR MAE > 4.0
  "warningDistricts": 58,        // Count where 3.0 < RMSE <= 5.0 OR 2.5 < MAE <= 4.0
  "safeDistricts": 66,           // Count where RMSE <= 3.0 AND MAE <= 2.5
  "totalDistricts": 208,         // Total rows in district_wise_performance.csv
  "forecastTrend": "declining",  // "improving" if predicted > actual, else "declining"
  "rainfallIndex": 78.5,         // Mock value (would come from weather data)
  "changeRate": -10.38           // ((predicted - actual) / actual) * 100
}
```

**Frontend Usage** (RiskStatsCards.jsx):
- Card 1: `avgLevel` → "10.6 m"
- Card 2: `criticalDistricts` → "84"
- Card 3: `forecastTrend` → "Declining"
- Card 4: `rainfallIndex` → "78.5"

---

### 2. Forecast Data

**CSV Source:**
- `test_predictions_detailed.csv` - Contains prediction_id, location_id, actual_water_level, predicted_water_level

**API Response** (`GET /api/dashboard/forecast`):
```json
[
  {
    "month": "Jan 2024",         // Generated from sample indices
    "historical": 1.7,           // actual_water_level
    "predicted": 6.63,           // predicted_water_level
    "district": "Hisar"          // district name
  },
  // ... 12 data points
]
```

**Frontend Usage** (ForecastChart.jsx):
```jsx
<Area dataKey="historical" />  // Blue line
<Area dataKey="predicted" />   // Purple dashed line
<XAxis dataKey="month" />
```

---

### 3. Districts List

**CSV Source:**
- `district_wise_performance.csv`

**Columns:**
- `location_id` → `id`
- `district` → `name`
- `block` → `block`
- `village` → `village`
- `latitude` → `lat`
- `longitude` → `lng`
- `mean_actual` → `level`
- `mean_predicted` → `predictedLevel`
- `rmse` → `rmse`
- `mae` → `mae`
- `r2` → `r2`
- `n_predictions` → `nPredictions`

**API Response** (`GET /api/districts`):
```json
[
  {
    "id": "976",
    "name": "Kaithal",
    "block": "Pundri",
    "village": "Pundri",
    "state": "Haryana",
    "level": 11.4,               // mean_actual from CSV
    "predictedLevel": 11.67,     // mean_predicted from CSV
    "status": "Safe",            // Calculated: RMSE=1.91 <= 3.0
    "lat": 29.75417,
    "lng": 76.56667,
    "rmse": 1.91,
    "mae": 1.28,
    "r2": 0.777,
    "nPredictions": 47
  },
  // ... 208 districts
]
```

**Status Calculation:**
```python
if rmse > 5.0 or mae > 4.0:
    status = "Critical"
elif rmse > 3.0 or mae > 2.5:
    status = "Warning"
else:
    status = "Safe"
```

**Frontend Usage:**
- **RiskMap.jsx**: Maps all districts as circles
  - `lat`, `lng` → Circle position
  - `status` → Circle color (Critical=red, Warning=yellow, Safe=green)
  - Popup shows: name, village, block, level, predictedLevel, status, rmse

- **DistrictPanel.jsx**: Dropdown list
  - Displays: `{name} - {village}`
  - Shows: level, predictedLevel, status

---

### 4. District Detail

**CSV Sources:**
- `district_wise_performance.csv` - Aggregate metrics
- `test_predictions_detailed.csv` - Individual predictions for time series

**API Response** (`GET /api/districts/Kaithal`):
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
      "date": "2024-01-01",     // Generated timeline
      "actual": 11.2,           // From test_predictions_detailed.csv
      "predicted": 11.5
    },
    // ... up to 20 points
  ]
}
```

**Advisory Generation:**
```python
advisories = {
    "Critical": "⚠️ Immediate action required. Groundwater levels critically low.",
    "Warning": "⚡ Monitor closely. Water levels declining.",
    "Safe": "✅ Water levels stable. Continue sustainable practices."
}
```

**Frontend Usage** (DistrictPanel.jsx):
- Shows metrics grid: RMSE, MAE, R²
- Renders mini LineChart with time series
- Displays advisory message with icon

---

### 5. Risk Calculation for Map

**Formula:**
```javascript
// In api.js
const calculateRiskPercentage = (rmse, mae) => {
    const normalizedRisk = Math.min(100, ((rmse * 5) + (mae * 5)));
    return Math.round(normalizedRisk);
};
```

**Example:**
- District with RMSE=1.91, MAE=1.28
- Risk = (1.91×5 + 1.28×5) = 15.95 → 16%
- Color: Green (Safe)

**Map Colors:**
```javascript
if (risk > 75) return '#ef4444';  // Red
if (risk > 50) return '#eab308';  // Yellow
return '#22c55e';                 // Green
```

---

## Complete Data Flow

```
CSV Files
   ↓
FastAPI Backend (main.py)
   ├─ Loads CSVs with pandas
   ├─ Calculates statistics
   ├─ Generates time series
   ├─ Classifies risk status
   └─ Returns JSON
       ↓
Frontend API Service (api.js)
   ├─ Fetches from endpoints
   ├─ Handles errors
   ├─ Transforms data
   └─ Returns to components
       ↓
React Components
   ├─ RiskStatsCards → Display stats
   ├─ ForecastChart → Render chart
   ├─ RiskMap → Show markers
   └─ DistrictPanel → Detail view
```

---

## Key Metrics Explained

### RMSE (Root Mean Squared Error)
- Measures prediction accuracy
- Lower = better
- Range in data: 1.19 to 7.64
- **Good**: < 3.0
- **Warning**: 3.0 - 5.0
- **Critical**: > 5.0

### MAE (Mean Absolute Error)
- Average prediction error in meters
- Range in data: 0.89 to 4.77
- **Good**: < 2.5
- **Warning**: 2.5 - 4.0
- **Critical**: > 4.0

### R² Score
- Model fit quality (0-1)
- Higher = better fit
- Range in data: 0.34 to 0.78
- **Good**: > 0.6
- **Acceptable**: 0.4 - 0.6
- **Poor**: < 0.4

---

## Sample Data Verification

### Check 1: Stats Card
```bash
curl http://localhost:8000/api/dashboard/stats
# Should show: avgLevel=10.6, criticalDistricts=84
```

### Check 2: Map Districts
```bash
curl http://localhost:8000/api/districts | jq 'length'
# Should return: 208
```

### Check 3: Specific District
```bash
curl http://localhost:8000/api/districts/Kaithal | jq '.metrics'
# Should show: rmse=1.91, mae=1.28, r2=0.777
```
