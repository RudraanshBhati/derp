# Test script to verify districts endpoint logic
import pandas as pd
import json

DATA_PATH = "../data/predictions"
df = pd.read_csv(f"{DATA_PATH}/district_wise_performance.csv")

def calculate_risk_status(rmse, mae):
    if rmse > 5.0 or mae > 4.0:
        return "Critical"
    elif rmse > 3.0 or mae > 2.5:
        return "Warning"
    else:
        return "Safe"

districts = []
for idx, row in df.iterrows():
    rmse_val = float(row['rmse'])
    mae_val = float(row['mae'])
    status = calculate_risk_status(rmse_val, mae_val)
    
    district_data = {
        "id": str(int(row['location_id'])),
        "name": str(row['district']),
        "block": str(row['block']),
        "village": str(row['village']),
        "state": "Haryana",
        "level": float(row['mean_actual']),
        "predictedLevel": float(row['mean_predicted']),
        "status": status,
        "lat": float(row['latitude']),
        "lng": float(row['longitude']),
        "rmse": float(rmse_val),
        "mae": float(mae_val),
        "r2": float(row['r2']),
        "nPredictions": int(row['n_predictions'])
    }
    districts.append(district_data)

print(f"Total districts: {len(districts)}")
print(json.dumps(districts[0], indent=2))

# Try JSON serialization
try:
    json_str = json.dumps(districts)
    print(f"\nJSON serialization successful! Length: {len(json_str)}")
except Exception as e:
    print(f"\nJSON serialization failed: {e}")
