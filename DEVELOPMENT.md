# Hướng dẫn chạy dự án Local (SyncNote)

Tài liệu này hướng dẫn cách thiết lập môi trường phát triển (Local Development) cho dự án SyncNote.

## Yêu cầu
- **Python** (3.10 trở lên)
- **Node.js** (18 trở lên)
- **Docker** (để chạy Database PostgreSQL nhanh chóng)

---

## Bước 1: Khởi tạo Database (PostgreSQL)

Cách nhanh nhất để có database là chạy qua Docker. Mở terminal (CMD/PowerShell) và chạy lệnh sau:

```powershell
docker run --name syncnote-dev-db -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=syncnote_db -p 5432:5432 -d postgres:15
```

Lệnh này sẽ:
- Tạo container tên `syncnote-dev-db`.
- Mật khẩu user `postgres` là `devpassword`.
- Tên database là `syncnote_db`.
- Expose port `5432` ra máy local để Backend kết nối.

> Nếu bạn đã cài PostgreSQL trực tiếp trên máy, hãy tạo user và database tương ứng thủ công.

---

## Bước 2: Thiết lập Backend (Django)

1.  **Tạo file cấu hình `.env`**:
    Tại thư mục gốc của dự án (`Sync-Note`), tạo một file tên `.env` và dán nội dung sau vào:

    ```env
    # Cấu hình Django
    DEBUG=True
    SECRET_KEY=dev-secret-key-change-me
    ALLOWED_HOSTS=localhost 127.0.0.1

    # Cấu hình Database
    DB_NAME=syncnote_db
    DB_USER=postgres
    DB_PASSWORD=devpassword
    DB_HOST=localhost
    DB_PORT=5432
    ```

2.  **Cài đặt môi trường ảo và thư viện**:
    Mở terminal tại thư mục `Sync-Note`:

    ```powershell
    # Tạo môi trường ảo (chỉ cần làm lần đầu)
    python -m venv venv

    # Kích hoạt môi trường (Windows)
    .\venv\Scripts\activate

    # Cài đặt thư viện
    pip install -r requirements.txt
    ```

3.  **Khởi tạo Database và chạy Server**:
    Vẫn trong môi trường ảo (`(venv)` đang hiện ở đầu dòng):

    ```powershell
    # Tạo bảng trong database
    python manage.py migrate

    # (Tùy chọn) Tạo superuser để vào trang admin
    python manage.py createsuperuser

    # Chạy server
    python manage.py runserver
    ```

    Backend sẽ chạy tại: `http://localhost:8000`

---

## Bước 3: Thiết lập Frontend (React/Vite)

1.  **Cài đặt thư viện Node**:
    Mở một terminal **mới** (không đóng terminal backend), đi vào thư mục frontend:

    ```powershell
    cd SyncNote-FE
    npm install
    ```

2.  **Chạy Frontend**:
    ```powershell
    npm run dev
    ```

    Frontend sẽ chạy tại: `http://localhost:5173`

> **Lưu ý**: Frontend đã được cấu hình Proxy (`vite.config.ts`) để tự động chuyển các request `/api` sang `http://localhost:8000`. Bạn không cần cấu hình gì thêm.

---

## Cách chạy nhanh bằng Docker Compose (Optional)

Nếu bạn không muốn cài Python/Node trên máy mà muốn chạy toàn bộ bằng Docker (khó debug code hơn):

```powershell
docker compose up --build
```
Lúc này app sẽ chạy tại `http://localhost:80` (qua Nginx).
