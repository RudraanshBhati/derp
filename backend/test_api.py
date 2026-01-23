import requests
import json

print("Testing Districts API...")
try:
    response = requests.get("http://localhost:8000/api/districts")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✓ SUCCESS! Retrieved {len(data)} districts\n")
        print("First 3 districts:")
        for district in data[:3]:
            print(f"  - {district['name']} ({district['village']}): {district['status']} - {district['level']}m")
        
        print(f"\nSample JSON:")
        print(json.dumps(data[0], indent=2))
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")
