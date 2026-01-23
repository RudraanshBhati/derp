import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "predictions")

def calculate_risk_status(rmse, mae):
    if rmse > 5.0 or mae > 4.0:
        return "Critical"
    elif rmse > 3.0 or mae > 2.5:
        return "Warning"
    else:
        return "Safe"

def test_get_districts():
    try:
        path = os.path.join(DATA_PATH, "district_wise_performance.csv")
        print(f"Loading from: {path}")
        print(f"File exists: {os.path.exists(path)}")
        
        df = pd.read_csv(path)
        print(f"\nLoaded {len(df)} rows")
        
        result = df.to_dict('records')
        print(f"Converted to {len(result)} records")
        
        districts = []
        errors = []
        
        for idx, record in enumerate(result):
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
                errors.append(f"Row {idx}: {e}")
                continue
        
        print(f"\nSuccessfully processed {len(districts)} districts")
        if errors:
            print(f"Errors: {len(errors)}")
            for err in errors[:5]:
                print(f"  {err}")
        
        if districts:
            print(f"\nFirst district: {districts[0]}")
            
            # Test JSON serialization
            import json
            json_str = json.dumps(districts[:3])
            print(f"\nJSON serialization successful! Sample:")
            print(json.dumps(districts[0], indent=2))
            
        return districts
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    districts = test_get_districts()
    print(f"\n\nFinal count: {len(districts)} districts")
