"""
Chatbot Testing Script

Test the chatbot endpoint with various questions
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/chatbot/context"

def test_chatbot(message, district=None):
    """Test a chatbot message"""
    print(f"\n{'='*60}")
    print(f"USER: {message}")
    print('='*60)
    
    payload = {"message": message}
    if district:
        payload["district"] = district
    
    try:
        response = requests.post(BASE_URL, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        print(f"\n🎯 DISTRICT FOUND: {data.get('district_found', 'None')}")
        
        if data.get('district_data'):
            dd = data['district_data']
            print(f"\n📊 DISTRICT DATA:")
            print(f"   Location: {dd['village']}, {dd['block']} Block")
            print(f"   Water Level: {dd['meanActual']}m depth")
            print(f"   Status: {dd['status']}")
            print(f"   RMSE: {dd['rmse']}m")
            print(f"   MAE: {dd['mae']}m")
        
        print(f"\n💡 SUGGESTION: {data.get('suggestion')}")
        
        print(f"\n📝 CONTEXT FOR GEMINI:")
        print(data.get('context', 'No context')[:300] + '...')
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ ERROR: {e}")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" CHATBOT ENDPOINT TESTING")
    print("="*60)
    
    # Test 1: Clear district mention
    test_chatbot("Can I dig a borewell in Kaithal?")
    
    # Test 2: Different phrasing
    test_chatbot("Is Hisar safe for farming expansion?")
    
    # Test 3: Another district
    test_chatbot("What about Karnal water levels?")
    
    # Test 4: No district mentioned
    test_chatbot("Can I dig a borewell here?")
    
    # Test 5: Pre-selected district
    test_chatbot("Is it safe to dig?", district="Panipat")
    
    # Test 6: Multiple words
    test_chatbot("I want to install irrigation in Gurugram district")
    
    print("\n" + "="*60)
    print(" ✅ TESTING COMPLETE")
    print("="*60)
    print("\nNext step: Add your Gemini API key to get AI responses!")
    print("See: frontend/GEMINI_INTEGRATION_GUIDE.md\n")
