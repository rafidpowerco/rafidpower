import requests
import json
import traceback

def test_agi():
    try:
        url = "http://localhost:9000/agi/think"
        payload = {"task_description": "Hello"}
        headers = {"Content-Type": "application/json"}
        
        print("Pinging AGI at", url)
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print("Response Text:", response.text)
    except Exception as e:
        print("Error connecting:")
        traceback.print_exc()

if __name__ == "__main__":
    test_agi()
