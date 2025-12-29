# SyncNote

SyncNote is a multi-device note synchronization system with a Django Backend and a React (Vite) Frontend.

## 🚀 Getting Started

Follow these instructions to run the project locally.

### 1. Prerequisites
- **Python** (3.10 or higher)
- **Node.js** (LTS version)
- **PostgreSQL** (Active and running)

### 2. Backend Setup (Django)
The backend handles the API, Database, and Authentication.

1.  **Open a Terminal** at the project root (`.../SyncNote`).
2.  **Activate Virtual Environment**:
    ```powershell
    .\venv\Scripts\activate
    ```
3.  **Run Migrations** (Only needed for first run or model changes):
    ```powershell
    python manage.py migrate
    ```
4.  **Start the Server**:
    ```powershell
    python manage.py runserver
    ```

> **Backend URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
> **Swagger Documentation**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)

### 3. Frontend Setup (React)
The frontend provides the User Interface.

1.  **Open a NEW Terminal** (Keep the backend terminal running).
2.  **Navigate to Frontend Directory**:
    ```powershell
    cd SyncNote-FE
    ```
3.  **Install Dependencies** (First time only):
    ```powershell
    npm install
    ```
4.  **Start Development Server**:
    ```powershell
    npm run dev
    ```

> **Frontend URL**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Credentials
You can register a new account at [http://localhost:5173/register](http://localhost:5173/register).

## 🛠 Features
- **Authentication**: JWT-based (Access + Refresh Tokens).
- **CRUD**: Manage Categories, Notes, and Checklist Items.
- **Offline & Sync**:
    - **Local-First**: Works offline using IndexedDB (Dexie.js).
    - **Sync**: 2-way synchronization with the Backend via the Refresh button.
- **Soft Delete**: Data is safely archived before permanent deletion.
