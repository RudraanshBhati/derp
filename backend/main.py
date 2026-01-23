from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import numpy as np

# Pydantic models for API responses
class DashboardStats(BaseModel):
    avgLevel: float = Field(..., description="Average actual water level in meters")
    avgPredictedLevel: float = Field(..., description="Average predicted water level in meters")
    criticalDistricts: int = Field(..., description="Number of districts in critical status (RMSE > 5.0 or MAE > 4.0)")
    warningDistricts: int = Field(..., description="Number of districts in warning status (3.0 < RMSE <= 5.0 or 2.5 < MAE <= 4.0)")
    safeDistricts: int = Field(..., description="Number of districts in safe status (RMSE <= 3.0 and MAE <= 2.5)")
    totalDistricts: int = Field(..., description="Total number of monitored districts")
    forecastTrend: str = Field(..., description="Overall trend: 'improving' or 'declining'")
    rainfallIndex: float = Field(..., description="Regional rainfall index (0-100)")
    changeRate: float = Field(..., description="Percentage change between predicted and actual levels")

class ForecastDataPoint(BaseModel):
    month: str = Field(..., description="Month label (e.g., 'Jan 2024')")
    historical: float = Field(..., description="Historical actual water level in meters")
    predicted: float = Field(..., description="Predicted water level in meters")
    district: str = Field(..., description="District name")

class District(BaseModel):
    id: str = Field(..., description="Unique location ID")
    name: str = Field(..., description="District name")
    block: str = Field(..., description="Block name")
    village: str = Field(..., description="Village name")
    state: str = Field(default="Haryana", description="State name")
    level: float = Field(..., description="Mean actual water level in meters")
    predictedLevel: float = Field(..., description="Mean predicted water level in meters")
    status: str = Field(..., description="Risk status: 'Safe', 'Warning', or 'Critical'")
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    rmse: float = Field(..., description="Root Mean Squared Error of predictions")
    mae: float = Field(..., description="Mean Absolute Error of predictions")
    r2: Optional[float] = Field(None, description="R² score (model fit quality, 0-1)")
    nPredictions: int = Field(..., description="Number of predictions made for this location")

class LocationCoordinates(BaseModel):
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")

class DistrictMetrics(BaseModel):
    meanActual: float = Field(..., description="Mean actual water level in meters")
    meanPredicted: float = Field(..., description="Mean predicted water level in meters")
    rmse: float = Field(..., description="Root Mean Squared Error")
    mae: float = Field(..., description="Mean Absolute Error")
    r2: Optional[float] = Field(None, description="R² score")
    nPredictions: int = Field(..., description="Number of predictions")

class TimeSeriesPoint(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    actual: float = Field(..., description="Actual water level in meters")
    predicted: float = Field(..., description="Predicted water level in meters")

class DistrictDetail(BaseModel):
    district: str = Field(..., description="District name")
    block: str = Field(..., description="Block name")
    village: str = Field(..., description="Village name")
    location: LocationCoordinates = Field(..., description="Geographic coordinates")
    metrics: DistrictMetrics = Field(..., description="Performance metrics")
    status: str = Field(..., description="Risk status: 'Safe', 'Warning', or 'Critical'")
    advisory: str = Field(..., description="Action advisory based on status")
    timeSeries: List[TimeSeriesPoint] = Field(..., description="Historical time series data (up to 20 points)")

class ModelMetrics(BaseModel):
    train: Dict[str, float] = Field(..., description="Training set metrics (MAE, MSE, RMSE, R²)")
    validation: Dict[str, float] = Field(..., description="Validation set metrics")
    test: Dict[str, float] = Field(..., description="Test set metrics")

class PredictionDetail(BaseModel):
    predictionId: int = Field(..., description="Unique prediction ID")
    locationId: int = Field(..., description="Location ID")
    actual: float = Field(..., description="Actual water level")
    predicted: float = Field(..., description="Predicted water level")
    error: float = Field(..., description="Absolute prediction error")

class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="API health status")
    data_files: Dict[str, bool] = Field(..., description="Availability of data files")
    timestamp: str = Field(..., description="Current server timestamp")

class ChatbotRequest(BaseModel):
    message: str = Field(..., description="User's question or message")
    district: Optional[str] = Field(None, description="Pre-selected district (optional)")

class ChatbotResponse(BaseModel):
    district_found: Optional[str] = Field(None, description="District extracted from message")
    district_data: Optional[Dict[str, Any]] = Field(None, description="Real-time district data")
    context: str = Field(..., description="Formatted context for Gemini prompt")
    suggestion: str = Field(..., description="Suggested response type")

app = FastAPI(
    title="Haryana Groundwater Monitoring API",
    description="""
## Deep Earth Resource Prediction (DERP) Backend API

This API provides real-time groundwater monitoring data, predictions, and analytics for 208 districts across Haryana, India.

### Features:
- **Dashboard Statistics**: Overall water level trends and risk assessment
- **District Data**: Detailed metrics for all 208 monitored locations
- **Forecasting**: 12-month water level predictions
- **Model Performance**: Evaluation metrics (RMSE, MAE, R²)
- **Time Series Analysis**: Historical and predicted water levels

### Data Sources:
- `district_wise_performance.csv` - Aggregate metrics per district
- `test_predictions_detailed.csv` - Individual prediction records
- `prediction_summary_statistics.csv` - Overall model statistics

### Risk Classification:
- **Safe**: RMSE ≤ 3.0 AND MAE ≤ 2.5
- **Warning**: 3.0 < RMSE ≤ 5.0 OR 2.5 < MAE ≤ 4.0
- **Critical**: RMSE > 5.0 OR MAE > 4.0
    """,
    version="1.0.0",
    contact={
        "name": "DERP Team",
        "email": "support@derp.example.com"
    },
    license_info={
        "name": "MIT"
    }
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to data directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "predictions")

# Cache for loaded dataframes
_cache = {}

def load_csv(filename: str) -> pd.DataFrame:
    """Load CSV file with caching"""
    if filename not in _cache:
        path = os.path.join(DATA_PATH, filename)
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        _cache[filename] = pd.read_csv(path)
    return _cache[filename]

def calculate_risk_status(rmse: float, mae: float) -> str:
    """Calculate risk status based on error metrics"""
    if rmse > 5.0 or mae > 4.0:
        return "Critical"
    elif rmse > 3.0 or mae > 2.5:
        return "Warning"
    else:
        return "Safe"

@app.get("/", tags=["Root"], summary="API Information")
async def root():
    """
    Get API information and available endpoints.
    
    Returns a welcome message with links to all available endpoints.
    """
    return {
        "message": "Groundwater Monitoring API",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "dashboard": "/api/dashboard/stats",
            "forecast": "/api/dashboard/forecast",
            "districts": "/api/districts",
            "district_detail": "/api/districts/{district_id}",
            "model_metrics": "/api/model/metrics",
            "predictions": "/api/predictions",
            "summary": "/api/summary"
        }
    }

@app.get(
    "/api/dashboard/stats",
    response_model=DashboardStats,
    tags=["Dashboard"],
    summary="Get dashboard statistics",
    description="Returns overall statistics including average water levels, district risk counts, and trend analysis"
)
async def get_risk_stats():
    """
    Get comprehensive dashboard statistics.
    
    **Returns:**
    - Average actual and predicted water levels
    - Count of districts by risk status (Critical/Warning/Safe)
    - Forecast trend (improving/declining)
    - Rainfall index
    - Percentage change rate
    
    **Used by:** Dashboard overview cards and summary widgets
    """
    try:
        # Load summary statistics
        df_summary = load_csv("prediction_summary_statistics.csv")
        df_district = load_csv("district_wise_performance.csv")
        
        # Extract test set statistics
        test_stats = df_summary[df_summary['metric'].isin([
            'Mean Actual Water Level (m)', 
            'Mean Predicted Water Level (m)',
            'Mean Error (m)',
            'RMSE (m)'
        ])]
        
        # Calculate critical districts
        critical_count = len(df_district[df_district['rmse'] > 5.0])
        warning_count = len(df_district[(df_district['rmse'] > 3.0) & (df_district['rmse'] <= 5.0)])
        safe_count = len(df_district[df_district['rmse'] <= 3.0])
        
        # Get average water level from test predictions
        df_test = load_csv("test_predictions.csv")
        avg_actual = df_test['actual_water_level'].mean()
        avg_predicted = df_test['predicted_water_level'].mean()
        
        # Calculate trend (declining if predicted < actual)
        trend = "declining" if avg_predicted < avg_actual else "improving"
        change_rate = ((avg_predicted - avg_actual) / avg_actual) * 100
        
        # Mock rainfall index (would come from weather data in production)
        rainfall_index = 78.5
        
        return {
            "avgLevel": round(avg_actual, 2),
            "avgPredictedLevel": round(avg_predicted, 2),
            "criticalDistricts": critical_count,
            "warningDistricts": warning_count,
            "safeDistricts": safe_count,
            "totalDistricts": len(df_district),
            "forecastTrend": trend,
            "rainfallIndex": rainfall_index,
            "changeRate": round(change_rate, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@app.get(
    "/api/dashboard/forecast",
    response_model=List[ForecastDataPoint],
    tags=["Dashboard"],
    summary="Get 12-month forecast data",
    description="Returns time series data with historical and predicted water levels for chart visualization"
)
async def get_forecast():
    """
    Get forecast time series for dashboard chart.
    
    **Returns:**
    - 12 monthly data points
    - Historical (actual) water levels
    - Predicted water levels
    - Associated district names
    
    **Used by:** Dashboard forecast chart component
    """
    try:
        df_test = load_csv("test_predictions_detailed.csv")
        
        # Group by location and get aggregated predictions
        # Since we don't have actual dates, create mock timeline
        base_date = datetime(2024, 1, 1)
        
        # Sample 12 data points evenly distributed
        total_records = len(df_test)
        sample_indices = np.linspace(0, total_records - 1, 12, dtype=int)
        sampled_data = df_test.iloc[sample_indices]
        
        chart_data = []
        for i, (_, row) in enumerate(sampled_data.iterrows()):
            month_date = base_date + timedelta(days=30 * i)
            chart_data.append({
                "month": month_date.strftime("%b %Y"),
                "historical": round(row['actual_water_level'], 2),
                "predicted": round(row['predicted_water_level'], 2),
                "district": row['district']
            })
        
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching forecast: {str(e)}")

@app.get("/api/districts/count")
async def get_districts_count():
    """Get count of districts"""
    try:
        df = load_csv("district_wise_performance.csv")
        return {"count": len(df), "columns": df.columns.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/districts/test")
async def test_districts():
    """Test endpoint to debug districts"""
    try:
        df = load_csv("district_wise_performance.csv")
        result = df.to_dict('records')
        
        # Try just the first 3 records
        sample = []
        for i, record in enumerate(result[:3]):
            rmse_val = float(record['rmse'])
            mae_val = float(record['mae'])
            status = calculate_risk_status(rmse_val, mae_val)
            
            district_data = {
                "id": str(int(record['location_id'])),
                "name": str(record['district']),
                "status": status,
                "lat": float(record['latitude']),
                "lng": float(record['longitude']),
            }
            sample.append(district_data)
        
        return {"count": len(result), "sample": sample}
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        return {"error": str(e), "traceback": error_detail}

@app.get(
    "/api/districts",
    response_model=List[District],
    tags=["Districts"],
    summary="Get all districts",
    description="Returns list of all 208 monitored districts with performance metrics and risk status"
)
async def get_districts(limit: Optional[int] = None):
    """
    Get all districts with comprehensive metrics.
    
    **Query Parameters:**
    - `limit`: Optional limit on number of districts returned (for testing)
    
    **Returns:**
    - List of all districts with:
      - Location details (name, block, village, coordinates)
      - Water level metrics (actual, predicted)
      - Performance metrics (RMSE, MAE, R²)
      - Risk status classification
    
    **Used by:** Map markers, district dropdown selector
    """
    try:
        print(f"[DISTRICTS] Loading CSV...")
        df = load_csv("district_wise_performance.csv")
        print(f"[DISTRICTS] Loaded {len(df)} rows")
        
        # Replace inf and nan values with None (which becomes null in JSON)
        df = df.replace([np.inf, -np.inf], np.nan)
        
        if limit:
            df = df.head(limit)
            print(f"[DISTRICTS] Limited to {limit} rows")
        
        result = df.to_dict('records')
        print(f"[DISTRICTS] Converted to {len(result)} records")
        
        districts = []
        for idx, record in enumerate(result):
            if idx % 50 == 0:
                print(f"[DISTRICTS] Processing record {idx}/{len(result)}")
            
            rmse_val = float(record['rmse'])
            mae_val = float(record['mae'])
            status = calculate_risk_status(rmse_val, mae_val)
            
            # Handle potential nan/inf values
            r2_val = record['r2']
            if pd.isna(r2_val):
                r2_val = None
            else:
                r2_val = float(r2_val)
            
            district_data = {
                "id": str(int(record['location_id'])),
                "name": str(record['district']),
                "block": str(record['block']),
                "village": str(record['village']),
                "state": "Haryana",
                "level": float(record['mean_actual']),
                "predictedLevel": float(record['mean_predicted']),
                "status": status,
                "lat": float(record['latitude']),
                "lng": float(record['longitude']),
                "rmse": float(rmse_val),
                "mae": float(mae_val),
                "r2": r2_val,  # Can be None if NaN
                "nPredictions": int(record['n_predictions'])
            }
            districts.append(district_data)
        
        print(f"[DISTRICTS] Returning {len(districts)} districts")
        return districts
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"[DISTRICTS ERROR] {error_msg}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(
    "/api/districts/{district_name}",
    response_model=DistrictDetail,
    tags=["Districts"],
    summary="Get district details",
    description="Returns detailed metrics, time series, and advisory for a specific district"
)
async def get_district_detail(district_name: str):
    """
    Get comprehensive details for a specific district.
    
    **Path Parameters:**
    - `district_name`: Name of the district (e.g., 'Kaithal', 'Hisar')
    
    **Returns:**
    - Complete district information
    - Performance metrics (RMSE, MAE, R²)
    - Time series data (up to 20 points)
    - Risk status and advisory message
    
    **Used by:** District detail panel, chatbot context retrieval
    """
    try:
        df_district = load_csv("district_wise_performance.csv")
        df_detailed = load_csv("test_predictions_detailed.csv")
        
        # Filter by district name
        district_perf = df_district[df_district['district'].str.lower() == district_name.lower()]
        
        if district_perf.empty:
            raise HTTPException(status_code=404, detail=f"District {district_name} not found")
        
        # Get predictions for this district
        district_predictions = df_detailed[df_detailed['district'].str.lower() == district_name.lower()]
        
        # Aggregate data
        district_row = district_perf.iloc[0]
        status = calculate_risk_status(district_row['rmse'], district_row['mae'])
        
        # Create time series for this district
        time_series = []
        sample_size = min(20, len(district_predictions))
        if sample_size > 0:
            sample_indices = np.linspace(0, len(district_predictions) - 1, sample_size, dtype=int)
            sampled = district_predictions.iloc[sample_indices]
            
            base_date = datetime(2024, 1, 1)
            for i, (_, row) in enumerate(sampled.iterrows()):
                date = base_date + timedelta(days=15 * i)
                time_series.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "actual": round(row['actual_water_level'], 2),
                    "predicted": round(row['predicted_water_level'], 2)
                })
        
        # Generate advisory based on status
        advisory = {
            "Critical": "⚠️ Immediate action required. Groundwater levels critically low. Implement water conservation measures and restrict non-essential usage.",
            "Warning": "⚡ Monitor closely. Water levels declining. Consider rainwater harvesting and reduced irrigation.",
            "Safe": "✅ Water levels stable. Continue sustainable practices."
        }
        
        return {
            "district": district_row['district'],
            "block": district_row['block'],
            "village": district_row['village'],
            "location": {
                "lat": district_row['latitude'],
                "lng": district_row['longitude']
            },
            "metrics": {
                "meanActual": round(district_row['mean_actual'], 2),
                "meanPredicted": round(district_row['mean_predicted'], 2),
                "rmse": round(district_row['rmse'], 2),
                "mae": round(district_row['mae'], 2),
                "r2": round(district_row['r2'], 3),
                "nPredictions": int(district_row['n_predictions'])
            },
            "status": status,
            "advisory": advisory.get(status, "No advisory available"),
            "timeSeries": time_series
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching district detail: {str(e)}")

@app.get(
    "/api/model/metrics",
    tags=["Model"],
    summary="Get model performance metrics",
    description="Returns performance metrics (RMSE, MAE, R²) for train/validation/test datasets"
)
async def get_model_metrics():
    """
    Get model performance metrics across all datasets.
    
    **Returns:**
    - Metrics for each dataset (train, validation, test)
    - RMSE (Root Mean Squared Error)
    - MAE (Mean Absolute Error)
    - R² Score (model fit quality)
    - Sample sizes
    
    **Used by:** Model Lab page, performance dashboard
    """
    try:
        df = load_csv("model_performance_metrics.csv")
        
        metrics = []
        for _, row in df.iterrows():
            metrics.append({
                "dataset": row['dataset'],
                "rmse": round(row['rmse'], 4),
                "mae": round(row['mae'], 4),
                "r2_score": round(row['r2_score'], 4),
                "n_samples": int(row['n_samples'])
            })
        
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching model metrics: {str(e)}")

class PredictionResponse(BaseModel):
    total: int = Field(..., description="Total number of predictions")
    limit: int = Field(..., description="Limit per page")
    offset: int = Field(..., description="Current offset")
    predictions: List[Dict[str, Any]] = Field(..., description="List of prediction records")

@app.get(
    "/api/predictions",
    response_model=PredictionResponse,
    tags=["Predictions"],
    summary="Get detailed predictions",
    description="Returns individual prediction records with actual vs predicted values and errors"
)
async def get_predictions(
    dataset: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """
    Get detailed prediction records with pagination.
    
    **Query Parameters:**
    - `dataset`: Filter by dataset ('train', 'test', 'validation')
    - `limit`: Maximum number of records to return (default: 100)
    - `offset`: Number of records to skip (default: 0)
    
    **Returns:**
    - Paginated prediction records
    - Actual and predicted water levels
    - Error metrics for each prediction
    
    **Used by:** Model Lab comparison charts, detailed analysis
    """
    try:
        if dataset and dataset in ['train', 'test', 'validation']:
            df = load_csv(f"{dataset}_predictions.csv")
        else:
            df = load_csv("all_predictions.csv")
            if dataset:
                df = df[df['dataset'] == dataset]
        
        # Pagination
        total = len(df)
        df_page = df.iloc[offset:offset + limit]
        
        predictions = []
        for _, row in df_page.iterrows():
            predictions.append({
                "actual": round(row['actual_water_level'], 2),
                "predicted": round(row['predicted_water_level'], 2),
                "error": round(row['error'], 2),
                "absoluteError": round(row['absolute_error'], 2),
                "squaredError": round(row['squared_error'], 2),
                "dataset": row['dataset']
            })
        
        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching predictions: {str(e)}")

@app.get(
    "/api/summary",
    tags=["Statistics"],
    summary="Get prediction summary statistics",
    description="Returns overall statistical summary of all predictions"
)
async def get_summary():
    """
    Get prediction summary statistics.
    
    **Returns:**
    - Mean, median, std deviation of water levels
    - Overall RMSE, MAE metrics
    - Min/max values
    
    **Used by:** Statistics dashboard, reporting
    """
    try:
        df = load_csv("prediction_summary_statistics.csv")
        
        summary = {}
        for _, row in df.iterrows():
            metric_name = row['metric'].replace(' ', '_').replace('(', '').replace(')', '').replace('²', '2').lower()
            summary[metric_name] = {
                "train": row['train'] if pd.notna(row['train']) else None,
                "validation": row['validation'] if pd.notna(row['validation']) else None,
                "test": row['test'] if pd.notna(row['test']) else None
            }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")

@app.get("/api/geojson/districts")
async def get_districts_geojson():
    """Get districts as GeoJSON for map rendering"""
    try:
        df = load_csv("district_wise_performance.csv")
        
        features = []
        for _, row in df.iterrows():
            status = calculate_risk_status(row['rmse'], row['mae'])
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row['longitude'], row['latitude']]
                },
                "properties": {
                    "id": str(row['location_id']),
                    "name": row['district'],
                    "block": row['block'],
                    "village": row['village'],
                    "level": round(row['mean_actual'], 2),
                    "predictedLevel": round(row['mean_predicted'], 2),
                    "status": status,
                    "rmse": round(row['rmse'], 2),
                    "mae": round(row['mae'], 2)
                }
            })
        
        return {
            "type": "FeatureCollection",
            "features": features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating GeoJSON: {str(e)}")

@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check",
    description="Verify API is running and all data files are accessible"
)
async def health_check():
    """
    Health check endpoint.
    
    **Returns:**
    - API status ('healthy' or error)
    - Data file availability status
    - Current server timestamp
    
    **Used by:** Monitoring systems, startup verification
    """
    try:
        # Check if data files are accessible
        files = [
            "test_predictions.csv",
            "district_wise_performance.csv",
            "model_performance_metrics.csv"
        ]
        
        status = {}
        for file in files:
            path = os.path.join(DATA_PATH, file)
            status[file] = os.path.exists(path)
        
        return {
            "status": "healthy",
            "data_files": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get(
    "/api/districts/list/names",
    tags=["Districts"],
    summary="Get district names only",
    description="Returns a simple list of all district names for chatbot context and autocomplete"
)
async def get_district_names():
    """
    Get list of all district names.
    
    **Returns:**
    - Simple array of district names
    - Alphabetically sorted
    - No duplicates
    
    **Used by:** Chatbot for district extraction, autocomplete dropdowns
    """
    try:
        df = load_csv("district_wise_performance.csv")
        districts = sorted(df['district'].unique().tolist())
        return {"districts": districts, "count": len(districts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching district names: {str(e)}")

@app.get(
    "/api/districts/count",
    tags=["Districts"],
    summary="Get district count",
    description="Returns total number of monitored districts"
)
async def get_district_count():
    """
    Get total count of monitored districts.
    
    **Returns:**
    - Total district count
    - Column information
    
    **Used by:** Dashboard statistics, testing
    """
    try:
        df = load_csv("district_wise_performance.csv")
        return {
            "count": len(df),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post(
    "/api/chatbot/context",
    response_model=ChatbotResponse,
    tags=["Chatbot"],
    summary="Get context for chatbot response",
    description="Extracts district from user message and returns real-time data for Gemini prompt injection"
)
async def get_chatbot_context(request: ChatbotRequest):
    """
    Process user message and prepare context for Gemini API.
    
    **Flow:**
    1. Extract district name from user message
    2. Fetch real-time data from API
    3. Format context for prompt injection
    4. Return data + context to frontend
    
    **Frontend then:**
    - Takes the `context` string
    - Injects it into Gemini system instruction
    - Calls Gemini API with user message
    - Displays Gemini's response
    
    **Example:**
    ```
    Request: {"message": "Can I dig in Kaithal?"}
    Response: {
      "district_found": "Kaithal",
      "district_data": {...},
      "context": "REAL-TIME DATA FOR KAITHAL: Water Level: 11.4m...",
      "suggestion": "safe_to_proceed"
    }
    ```
    """
    try:
        message_lower = request.message.lower()
        
        # Step 1: Get all district names
        df = load_csv("district_wise_performance.csv")
        districts = df['district'].unique().tolist()
        
        # Step 2: Extract district from message using word boundary matching
        import re
        district_found = None
        if request.district:
            # Pre-selected district
            district_found = request.district
            print(f"✅ Using pre-selected district: {district_found}")
        else:
            # Pattern matching with word boundaries for accurate extraction
            # Sort districts by length (longest first) to match "Charkhi Dadri" before "Dadri"
            sorted_districts = sorted(districts, key=len, reverse=True)
            
            for district in sorted_districts:
                # Use word boundary regex for exact matching
                pattern = r'\b' + re.escape(district.lower()) + r'\b'
                if re.search(pattern, message_lower):
                    district_found = district
                    print(f"✅ Extracted district from message: {district_found}")
                    break
        
        # Step 3: If no district found, return suggestion
        if not district_found:
            print(f"⚠️ No district found in message: {request.message}")
            return {
                "district_found": None,
                "district_data": None,
                "context": "No specific district mentioned. Please specify which district you're asking about.",
                "suggestion": "ask_for_district"
            }
        
        # Step 4: Fetch real data for this district
        district_perf = df[df['district'].str.lower() == district_found.lower()]
        
        if district_perf.empty:
            return {
                "district_found": district_found,
                "district_data": None,
                "context": f"District '{district_found}' not found in our database.",
                "suggestion": "district_not_found"
            }
        
        district_row = district_perf.iloc[0]
        
        # Calculate status
        status = calculate_risk_status(district_row['rmse'], district_row['mae'])
        
        # Build district data
        district_data = {
            "district": district_row['district'],
            "block": district_row['block'],
            "village": district_row['village'],
            "meanActual": round(district_row['mean_actual'], 2),
            "meanPredicted": round(district_row['mean_predicted'], 2),
            "rmse": round(district_row['rmse'], 2),
            "mae": round(district_row['mae'], 2),
            "r2": round(district_row['r2'], 3) if pd.notna(district_row['r2']) else None,
            "nPredictions": int(district_row['n_predictions']),
            "status": status
        }
        
        # Generate advisory
        advisory_map = {
            "Critical": "⚠️ CRITICAL: Groundwater levels critically low. Immediate action required. Restrict extraction and implement conservation measures.",
            "Warning": "⚡ WARNING: Water levels declining. Monitor closely. Consider rainwater harvesting and reduced irrigation.",
            "Safe": "✅ SAFE: Water levels stable. Continue sustainable practices."
        }
        advisory = advisory_map.get(status, "Monitor water levels regularly.")
        
        # Step 5: Format context for Gemini prompt
        context = f"""
REAL-TIME DATA FOR {district_found.upper()}:
Location: {district_row['village']}, {district_row['block']} Block
Current Water Level: {district_data['meanActual']}m depth
Predicted Water Level: {district_data['meanPredicted']}m
Prediction Accuracy (RMSE): {district_data['rmse']}m
Mean Absolute Error (MAE): {district_data['mae']}m
Model Fit Quality (R²): {district_data['r2']}
Number of Predictions: {district_data['nPredictions']}
Risk Status: {status}

OFFICIAL ADVISORY: {advisory}

INSTRUCTIONS:
- Use the REAL-TIME DATA above to answer the user's question
- Cite actual numbers (water level, RMSE, status)
- If status is "Critical" → strongly advise AGAINST extraction
- If status is "Warning" → suggest caution + monitoring
- If status is "Safe" → approve with sustainable practices
- Keep answer under 150 words
- Be specific and helpful
"""
        
        # Determine suggestion type
        suggestion = "critical_warning" if status == "Critical" else "warning" if status == "Warning" else "safe_to_proceed"
        
        return {
            "district_found": district_found,
            "district_data": district_data,
            "context": context.strip(),
            "suggestion": suggestion
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chatbot request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
