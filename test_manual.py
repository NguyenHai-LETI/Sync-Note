import requests
import time
import datetime
import sys

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(f"[{datetime.datetime.now().time()}] {msg}")

def test():
    email = f"test_{int(time.time())}@example.com"
    password = "password123"

    try:
        # Register
        log(f"Registering {email}...")
        resp = requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password})
        if resp.status_code != 201:
            log(f"Failed to register: {resp.text}")
            sys.exit(1)
        log("Registered.")

        # Login
        log("Logging in...")
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        if resp.status_code != 200:
            log(f"Failed to login: {resp.text}")
            sys.exit(1)
        
        data = resp.json()['data']
        access = data['access']
        headers = {"Authorization": f"Bearer {access}"}
        log("Logged in.")

        # Create Category
        log("Creating category...")
        resp = requests.post(f"{BASE_URL}/categories", json={"name": "Work", "order_index": 1}, headers=headers)
        if resp.status_code != 201:
             log(f"Failed to create category: {resp.text}")
             sys.exit(1)
        cat_id = resp.json()['data']['id']
        log(f"Category created: {cat_id}")

        # Create Note
        log("Creating note...")
        resp = requests.post(f"{BASE_URL}/categories/{cat_id}/notes", json={"title": "Meeting Notes", "description": "Discuss project"}, headers=headers)
        if resp.status_code != 201:
             log(f"Failed to create note: {resp.text}")
             sys.exit(1)
        note_id = resp.json()['data']['id']
        log(f"Note created: {note_id}")

        # Create NoteItem
        log("Creating note item...")
        resp = requests.post(f"{BASE_URL}/notes/{note_id}/items", json={"title": "Buy milk", "content": "Almond milk", "order_index": 0}, headers=headers)
        if resp.status_code != 201:
             log(f"Failed to create item: {resp.text}")
             sys.exit(1)
        item_id = resp.json()['data']['id']
        log(f"NoteItem created: {item_id}")

        # Sync Check
        log("Checking Sync...")
        # Set updated_after to 1 minute ago
        past = (datetime.datetime.utcnow() - datetime.timedelta(minutes=1)).isoformat() + "Z"
        resp = requests.get(f"{BASE_URL}/sync?updated_after={past}", headers=headers)
        data = resp.json()['data']
        
        assert len(data['categories_changed']) >= 1
        assert len(data['notes_changed']) >= 1
        assert len(data['note_items_changed']) >= 1
        log("Sync returned data correctly.")

        # Soft Delete Category
        log("Deleting category...")
        resp = requests.delete(f"{BASE_URL}/categories/{cat_id}", headers=headers)
        assert resp.status_code == 204
        log("Category deleted.")

        # Verify is_deleted via Sync
        resp = requests.get(f"{BASE_URL}/sync?updated_after={past}", headers=headers)
        cats = resp.json()['data']['categories_changed']
        deleted_cat = next((c for c in cats if c['id'] == cat_id), None)
        if not deleted_cat:
            log("Error: Deleted category not found in sync.")
            sys.exit(1)
        if not deleted_cat['is_deleted']:
            log("Error: Category is_deleted should be True.")
            sys.exit(1)
        log("Sync shows deleted category as is_deleted=True.")

        log("ALL TESTS PASSED.")
    except Exception as e:
        log(f"EXCEPTION: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test()
