# Groundwater Monitoring API

FastAPI backend for serving groundwater prediction data to the dashboard frontend.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
# From the backend directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

### Dashboard Endpoints

- `GET /api/dashboard/stats` - Overall dashboard statistics (avg water level, critical districts, trends)
- `GET /api/dashboard/forecast` - Time series forecast data for charts

### District Endpoints

- `GET /api/districts` - List all districts with performance metrics
- `GET /api/districts/{district_name}` - Detailed info for a specific district including time series

### Model Endpoints

- `GET /api/model/metrics` - Model performance metrics (RMSE, MAE, R²) across train/test/validation

### Data Endpoints

- `GET /api/predictions` - Get prediction records with pagination
  - Query params: `dataset` (train/test/validation), `limit`, `offset`
- `GET /api/summary` - Comprehensive summary statistics
- `GET /api/geojson/districts` - Districts in GeoJSON format for map rendering

### Utility Endpoints

- `GET /` - API information and endpoint list
- `GET /api/health` - Health check

## Data Sources

The API reads from CSV files in `../data/predictions/`:
- `test_predictions.csv`
- `test_predictions_detailed.csv`
- `district_wise_performance.csv`
- `model_performance_metrics.csv`
- `prediction_summary_statistics.csv`
- `all_predictions.csv`

## CORS Configuration

CORS is enabled for:
- `http://localhost:5173` (Vite default dev server)
- `http://127.0.0.1:5173`

Update the `allow_origins` list in `main.py` if you need additional origins.
