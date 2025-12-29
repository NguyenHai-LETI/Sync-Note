import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def check(url):
    try:
        resp = requests.get(url)
        print(f"Checking {url}... Status: {resp.status_code}")
        if resp.status_code == 200:
            return True
        else:
            print(f"Failed Body: {resp.text[:200]}")
            return False
    except Exception as e:
        print(f"Exception checking {url}: {e}")
        return False

def test():
    ok = True
    if not check(f"{BASE_URL}/api/schema/"): ok = False
    if not check(f"{BASE_URL}/api/docs/"): ok = False
    if not check(f"{BASE_URL}/api/redoc/"): ok = False
    
    if ok:
        print("Swagger verification PASSED.")
    else:
        print("Swagger verification FAILED.")
        sys.exit(1)

if __name__ == "__main__":
    test()
