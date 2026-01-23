import requests
import json

endpoints = [
    "/api/health",
    "/api/districts/count",
    "/api/districts/test",
    "/api/districts"
]

for endpoint in endpoints:
    url = f"http://localhost:8000{endpoint}"
    print(f"\nTesting: {endpoint}")
    try:
        response = requests.get(url)
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"  Result: List with {len(data)} items")
            elif isinstance(data, dict):
                print(f"  Result: Dict with keys: {list(data.keys())[:5]}")
        else:
            print(f"  Error: {response.text[:200]}")
    except Exception as e:
        print(f"  Exception: {e}")
