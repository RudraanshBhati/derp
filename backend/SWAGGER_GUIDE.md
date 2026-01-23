# 📚 Swagger/OpenAPI Documentation Guide

## 🌐 Access Points

Your API now has **comprehensive interactive documentation**:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc  
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## ✨ What's Been Added

### 1. **Pydantic Response Models**
All endpoints now have typed response models for validation and documentation:
- `DashboardStats`
- `District`
- `DistrictDetail`
- `ForecastDataPoint`
- `ModelMetrics`
- `PredictionResponse`
- `HealthResponse`

### 2. **Organized Tags**
Endpoints are grouped by functionality:
- 🏠 **Root** - API information
- 📊 **Dashboard** - Statistics and forecasting
- 📍 **Districts** - District data and details
- 🤖 **Model** - ML performance metrics
- 🔮 **Predictions** - Individual predictions
- 📈 **Statistics** - Overall summaries
- ⚙️ **System** - Health checks

### 3. **Rich Descriptions**
Each endpoint includes:
- Detailed summary and description
- Parameter explanations
- Response schema
- Usage examples
- Where it's used in the frontend

### 4. **Enhanced Metadata**
The FastAPI app now includes:
- Full API description with features
- Data source documentation
- Risk classification rules
- Contact information
- License info

---

## 🎯 How to Use Swagger UI

### Testing Endpoints

1. **Navigate** to http://localhost:8000/docs
2. **Expand** any endpoint (e.g., `GET /api/districts`)
3. **Click** "Try it out" button
4. **Enter** parameters (if required)
5. **Click** "Execute"
6. **View** the response with:
   - Status code
   - Response body (formatted JSON)
   - Response headers
   - cURL command equivalent

### Understanding Response Models

Each endpoint shows:
- **Parameters** - What you can send
- **Responses** - What you'll receive
- **Schemas** - Data structure definitions

Example for `/api/districts/{district_name}`:
```
Parameters:
  district_name (string, path, required) - Name of district

Responses:
  200 - Successful Response
    Content-Type: application/json
    Schema: DistrictDetail
  
  404 - District not found
  500 - Internal Server Error
```

---

## 🔍 Key Endpoints for Chatbot

### 1. Get District Names
```
GET /api/districts/list/names
```
Returns simple array of all district names - **perfect for chatbot context**

**Response:**
```json
{
  "districts": ["Ambala", "Bhiwani", ..., "Yamunanagar"],
  "count": 22
}
```

### 2. Get District Details
```
GET /api/districts/{district_name}
```
Returns complete data for RAG injection

**Example:** `GET /api/districts/Kaithal`

**Response includes:**
- Current water level
- Predicted level
- Risk status
- Performance metrics (RMSE, MAE, R²)
- Advisory message
- Time series data

### 3. Health Check
```
GET /api/health
```
Verify API is running before making chatbot queries

---

## 📝 Response Model Examples

### DashboardStats
```python
class DashboardStats(BaseModel):
    avgLevel: float  # Average actual water level (m)
    avgPredictedLevel: float
    criticalDistricts: int  # RMSE > 5.0 or MAE > 4.0
    warningDistricts: int   # 3.0 < RMSE <= 5.0
    safeDistricts: int      # RMSE <= 3.0
    totalDistricts: int
    forecastTrend: str      # "improving" or "declining"
    rainfallIndex: float
    changeRate: float       # Percentage change
```

### DistrictDetail
```python
class DistrictDetail(BaseModel):
    district: str
    block: str
    village: str
    location: LocationCoordinates  # {lat, lng}
    metrics: DistrictMetrics       # {meanActual, meanPredicted, rmse, mae, r2}
    status: str                    # "Safe", "Warning", or "Critical"
    advisory: str                  # Action recommendation
    timeSeries: List[TimeSeriesPoint]  # Historical data points
```

---

## 🤖 Chatbot Integration Pattern

### Step 1: Load District Context
```python
import requests

# Get all district names on startup
districts_response = requests.get("http://localhost:8000/api/districts/list/names")
DISTRICT_NAMES = districts_response.json()["districts"]
# ["Ambala", "Bhiwani", ..., "Yamunanagar"]
```

### Step 2: Extract District from User Query
```python
def extract_district(question):
    """Simple pattern matching"""
    question_lower = question.lower()
    for district in DISTRICT_NAMES:
        if district.lower() in question_lower:
            return district
    return None
```

### Step 3: Fetch Real Data
```python
def get_district_context(district_name):
    """Get real-time data for prompt injection"""
    url = f"http://localhost:8000/api/districts/{district_name}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return f"""
REAL-TIME DATA FOR {district_name.upper()}:
- Water Level: {data['metrics']['meanActual']}m depth
- Predicted Level: {data['metrics']['meanPredicted']}m
- Accuracy (RMSE): {data['metrics']['rmse']}
- Status: {data['status']}
- Advisory: {data['advisory']}
"""
    return None
```

### Step 4: Inject into Gemini
```python
def chatbot(user_question):
    district = extract_district(user_question)
    
    if not district:
        return "Which district are you asking about?"
    
    context = get_district_context(district)
    
    if not context:
        return f"No data available for {district}"
    
    # Build system instruction with real data
    system_instruction = f"""
You are a groundwater advisor for Haryana.

{context}

Answer the user's question using this REAL data.
Be specific and cite the numbers.
"""
    
    # Call Gemini with enhanced context
    response = call_gemini(user_question, system_instruction)
    return response
```

---

## 🔧 Testing in Swagger

### Test the Chatbot Flow

1. **Get district names:**
   - Open `/api/districts/list/names`
   - Execute
   - Copy a district name (e.g., "Kaithal")

2. **Get district details:**
   - Open `/api/districts/{district_name}`
   - Enter "Kaithal" in the parameter
   - Execute
   - Review the response - this is what your chatbot will receive

3. **Verify the data:**
   - Check `metrics.rmse` - is it < 3.0? (Safe)
   - Read the `advisory` - this is the base recommendation
   - Review `timeSeries` - shows historical trend

---

## 📊 Risk Status Reference (from Swagger)

All endpoints use this classification:

| Status | Criteria | Meaning |
|--------|----------|---------|
| **Safe** | RMSE ≤ 3.0 AND MAE ≤ 2.5 | ✅ Stable, sustainable |
| **Warning** | 3.0 < RMSE ≤ 5.0 OR 2.5 < MAE ≤ 4.0 | ⚡ Monitor closely |
| **Critical** | RMSE > 5.0 OR MAE > 4.0 | ⚠️ Immediate action needed |

---

## 🚀 Quick Examples

### cURL Commands
```bash
# Health check
curl http://localhost:8000/api/health

# Get all districts
curl http://localhost:8000/api/districts | jq '.[:3]'

# Get Kaithal details
curl http://localhost:8000/api/districts/Kaithal | jq '.advisory'

# Get district names for chatbot
curl http://localhost:8000/api/districts/list/names | jq '.districts'
```

### Python Requests
```python
import requests

# Dashboard stats
stats = requests.get("http://localhost:8000/api/dashboard/stats").json()
print(f"Critical: {stats['criticalDistricts']}/{stats['totalDistricts']}")

# Kaithal details
kaithal = requests.get("http://localhost:8000/api/districts/Kaithal").json()
print(f"Status: {kaithal['status']}")
print(f"Level: {kaithal['metrics']['meanActual']}m")
print(f"Advisory: {kaithal['advisory']}")
```

---

## 📖 Additional Features

### Automatic Schema Generation
FastAPI auto-generates JSON schemas for all models. View them in Swagger under "Schemas" section.

### Request/Response Examples
Swagger shows example requests and responses for each endpoint.

### Data Validation
Pydantic models ensure all responses match the documented schema.

### Export OpenAPI Spec
Download the complete API spec:
```bash
curl http://localhost:8000/openapi.json > api_spec.json
```

---

## 🎓 Next Steps

1. **Explore Swagger UI** - Try all endpoints interactively
2. **Build the chatbot** - Use `/api/districts/list/names` and `/api/districts/{name}`
3. **Test with real queries** - "Can I dig a borewell in Kaithal?"
4. **Monitor performance** - Use `/api/health` endpoint

**Swagger URL:** http://localhost:8000/docs 🚀
