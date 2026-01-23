from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import numpy as np

app = FastAPI(title="Groundwater Monitoring API", version="1.0.0")

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

@app.get("/")
async def root():
    return {
        "message": "Groundwater Monitoring API",
        "version": "1.0.0",
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

@app.get("/api/dashboard/stats")
async def get_risk_stats():
    """Get overall dashboard statistics"""
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

@app.get("/api/dashboard/forecast")
async def get_forecast():
    """Get forecast time series data for charts"""
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

@app.get("/api/districts")
async def get_districts():
    """Get all districts with performance metrics"""
    try:
        df = load_csv("district_wise_performance.csv")
        # Convert to dict and ensure JSON serialization works
        result = df.to_dict('records')
        
        districts = []
        for record in result:
            try:
                rmse_val = float(record['rmse'])
                mae_val = float(record['mae'])
                status = calculate_risk_status(rmse_val, mae_val)
                
                district_data = {
                    "id": str(int(record['location_id'])),
                    "name": str(record['district']),
                    "block": str(record['block']),
                    "village": str(record['village']),
                    "state": "Haryana",
                    "level": round(float(record['mean_actual']), 2),
                    "predictedLevel": round(float(record['mean_predicted']), 2),
                    "status": status,
                    "lat": round(float(record['latitude']), 5),
                    "lng": round(float(record['longitude']), 5),
                    "rmse": round(rmse_val, 2),
                    "mae": round(mae_val, 2),
                    "r2": round(float(record['r2']), 3),
                    "nPredictions": int(record['n_predictions'])
                }
                districts.append(district_data)
            except (ValueError, KeyError, TypeError) as e:
                # Skip rows with missing/invalid data
                continue
        
        return districts
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching districts: {str(e)}")

@app.get("/api/districts/{district_name}")
async def get_district_detail(district_name: str):
    """Get detailed information for a specific district"""
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

@app.get("/api/model/metrics")
async def get_model_metrics():
    """Get model performance metrics across all datasets"""
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

@app.get("/api/predictions")
async def get_predictions(
    dataset: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """Get prediction records with pagination"""
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

@app.get("/api/summary")
async def get_summary():
    """Get comprehensive summary statistics"""
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

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
