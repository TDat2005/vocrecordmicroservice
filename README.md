# 🎵 Groove Records — Microservices

> Hệ thống thương mại điện tử bán đĩa than (Vinyl), mâm đĩa, cassette và phụ kiện âm thanh analog.  
> Kiến trúc Microservices với Docker, Node.js, MySQL, Redis và Nginx API Gateway.

---

## 📐 Kiến trúc tổng quan

```
┌──────────────────────────────────────────────────────────┐
│                    Nginx API Gateway (:8080)              │
│         Routing, CORS, Load Balancing, Static Assets     │
└──────┬────────┬────────┬────────┬────────┬────────┬──────┘
       │        │        │        │        │        │
  ┌────▼──┐ ┌──▼───┐ ┌──▼────┐ ┌▼─────┐ ┌▼─────┐ ┌▼──────┐
  │ Auth  │ │ User │ │Product│ │Order │ │Pay-  │ │Content│
  │:3001  │ │:3002 │ │:3003  │ │:3004 │ │ment  │ │:3007  │
  └───┬───┘ └──┬───┘ └──┬────┘ └┬─────┘ │:3005 │ └──┬────┘
      │        │        │       │       └┬─────┘    │
  ┌───▼──┐ ┌──▼───┐ ┌──▼────┐ ┌▼─────┐ ┌▼─────┐ ┌─▼─────┐
  │MySQL │ │MySQL │ │MySQL  │ │MySQL │ │MySQL │ │MySQL  │
  │:3310 │ │:3311 │ │:3312  │ │:3313 │ │:3314 │ │:3315  │
  └──────┘ └──────┘ └───────┘ └──────┘ └──────┘ └───────┘

  ┌──────────┐   ┌──────────────────┐
  │  Redis   │   │  Notification    │
  │  :6379   │   │  Service :3006   │
  └──────────┘   │  (Email/SMTP)    │
                 └──────────────────┘
```

**Frontend:** React + Vite + TailwindCSS → Served qua Nginx (SPA routing)

---

## 📁 Cấu trúc thư mục

```
groove-records/
├── .env                        # Biến môi trường (DB, JWT, PayOS, SMTP)
├── .dockerignore
├── docker-compose.yml          # Orchestration toàn bộ hệ thống
├── README.md
│
├── gateway/                    # 🌐 Nginx API Gateway
│   ├── Dockerfile
│   ├── nginx.conf              # Routing rules → microservices
│   └── images/                 # Static assets (logo, blog images)
│
├── services/                   # 🔧 Backend Microservices
│   ├── auth/                   # 🔐 Xác thực & OTP
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── database/init.sql   # Schema: accounts, otps, activity_logs
│   │   └── src/
│   │       ├── index.js
│   │       ├── config/database.js
│   │       ├── routes/authRoutes.js
│   │       ├── controllers/authController.js
│   │       └── models/         # Account.js, Otp.js, ActivityLog.js
│   │
│   ├── user/                   # 👤 Người dùng & Nhân viên
│   │   ├── database/init.sql   # Schema: customers, employees, wishlists
│   │   └── src/                # Profile CRUD, Wishlist, Employee mgmt
│   │
│   ├── product/                # 📦 Sản phẩm & Kho hàng
│   │   ├── database/init.sql   # Schema: products, categories, discounts
│   │   └── src/                # Catalog, Inventory, Discounts, Import
│   │
│   ├── order/                  # 🛒 Đơn hàng
│   │   ├── database/init.sql   # Schema: orders, order_items
│   │   └── src/                # Order lifecycle, Admin dashboard
│   │
│   ├── payment/                # 💳 Thanh toán (PayOS)
│   │   ├── database/init.sql   # Schema: payments
│   │   └── src/                # PayOS integration, Webhook, Status
│   │
│   ├── notification/           # 📧 Thông báo Email
│   │   └── src/                # Nodemailer (OTP, Order confirm, Status)
│   │
│   └── content/                # 📝 Blog & Bài viết
│       ├── database/init.sql   # Schema: posts
│       └── src/                # Posts CRUD
│
└── frontend/                   # 🖥️ React SPA
    ├── Dockerfile              # Multi-stage build → Nginx
    ├── nginx.conf              # SPA routing (try_files → index.html)
    ├── package.json
    └── src/
        └── app/
            ├── config/api.ts   # 📌 Centralized API endpoints
            ├── pages/          # Login, Shop, Cart, Checkout, Admin...
            ├── components/     # Header, Footer, AdminPanels...
            ├── context/        # CartContext, AuthContext
            └── data/           # Static blog/guide data
```

---

## 🚀 Khởi chạy nhanh

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- Port **8080** khả dụng (hoặc sửa trong `docker-compose.yml`)

### 1. Clone & Cấu hình

```bash
git clone <repo-url> groove-records
cd groove-records
```

Cập nhật `.env` với thông tin thật:

```env
# PayOS (bắt buộc cho thanh toán)
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key

# SMTP (bắt buộc cho gửi OTP email)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2. Build & Chạy

```bash
docker-compose up -d --build
```

Lần đầu sẽ mất ~2-5 phút (pull images + npm install).

### 3. Truy cập

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:8080 |
| ❤️ Health Check | http://localhost:8080/health |
| 🔐 Auth API | http://localhost:8080/api/auth/* |
| 📦 Product API | http://localhost:8080/api/products/* |
| 🛒 Order API | http://localhost:8080/api/orders/* |

### 4. Dừng hệ thống

```bash
docker-compose down          # Dừng, giữ data
docker-compose down -v       # Dừng + xoá toàn bộ database volumes
```

---

## 🔗 API Endpoints

### Auth Service (`/api/auth/`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/login` | Đăng nhập (email + password) |
| POST | `/register` | Đăng ký tài khoản mới |
| POST | `/send-register-otp` | Gửi OTP xác thực email |
| POST | `/verify-register-otp` | Xác thực OTP đăng ký |
| POST | `/send-forgot-otp` | Gửi OTP quên mật khẩu |
| POST | `/verify-forgot-otp` | Xác thực OTP quên MK |
| POST | `/reset-password` | Đặt lại mật khẩu |

### User Service (`/api/users/`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/customers/:id` | Lấy profile khách hàng |
| PUT | `/customers/:id` | Cập nhật profile |
| GET | `/customers` | Danh sách khách hàng (Admin) |
| GET | `/employees` | Danh sách nhân viên |
| POST | `/employees/toggle-status` | Khoá/mở khoá nhân viên |
| GET | `/wishlist/:customerId` | Lấy wishlist |
| POST | `/wishlist` | Thêm vào wishlist |
| DELETE | `/wishlist` | Xoá khỏi wishlist |

### Product Service (`/api/products/`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Danh sách sản phẩm |
| GET | `/:id` | Chi tiết sản phẩm |
| POST | `/` | Tạo sản phẩm mới (Admin) |
| PUT | `/:id` | Cập nhật sản phẩm (Admin) |
| DELETE | `/:id` | Xoá sản phẩm (Admin) |
| GET | `/inventory` | Danh sách tồn kho |
| POST | `/import-stock` | Nhập hàng |
| GET | `/discounts/all` | Danh sách mã giảm giá |
| POST | `/discounts` | Tạo mã giảm giá |
| POST | `/discounts/check` | Kiểm tra mã giảm giá |

### Order Service (`/api/orders/`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Danh sách đơn hàng |
| POST | `/` | Tạo đơn hàng mới |
| GET | `/:id` | Chi tiết đơn hàng |
| POST | `/update-status` | Cập nhật trạng thái (Admin) |
| POST | `/cancel` | Huỷ đơn hàng |
| GET | `/admin/dashboard` | Dashboard thống kê |
| GET | `/admin/revenue` | Báo cáo doanh thu |

### Payment Service (`/api/payments/`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/create-link` | Tạo link thanh toán PayOS |
| POST | `/webhook` | Webhook nhận callback PayOS |
| GET | `/check-status/:orderId` | Kiểm tra trạng thái thanh toán |

### Content Service (`/api/content/`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/posts` | Danh sách bài viết |
| GET | `/posts/:id` | Chi tiết bài viết |
| POST | `/posts` | Tạo bài viết (Admin) |
| PUT | `/posts/:id` | Cập nhật bài viết |

---

## 🗃️ Database Schema

Mỗi service sở hữu database riêng biệt (Database-per-Service pattern):

| Service | Database | Port | Tables |
|---------|----------|------|--------|
| Auth | `auth_db` | 3310 | accounts, otps, activity_logs |
| User | `user_db` | 3311 | customers, employees, wishlists |
| Product | `product_db` | 3312 | products, categories, discounts, import_* |
| Order | `order_db` | 3313 | orders, order_items |
| Payment | `payment_db` | 3314 | payments |
| Content | `content_db` | 3315 | posts |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS, TypeScript |
| **Backend** | Node.js 20, Express.js |
| **Database** | MySQL 8.0 (6 instances) |
| **Cache** | Redis 7 |
| **Gateway** | Nginx (reverse proxy + static files) |
| **Payment** | PayOS API |
| **Email** | Nodemailer (Gmail SMTP) |
| **Container** | Docker, Docker Compose |
| **Design** | Neo-Brutalism (Yellow/Black/White) |

---

## 🔧 Development

### Xem logs service cụ thể
```bash
docker-compose logs -f auth-service
docker-compose logs -f product-service --tail 50
```

### Restart 1 service
```bash
docker-compose restart order-service
```

### Rebuild 1 service (sau khi sửa code)
```bash
docker-compose up -d --build auth-service
```

### Truy cập database trực tiếp
```bash
# Ví dụ: kết nối MySQL auth_db
mysql -h 127.0.0.1 -P 3310 -u root -pauth_root_pass auth_db
```

### Hot-reload
Source code được mount qua Docker volumes (`src/` → `/app/src`), nhưng cần restart container để áp dụng:
```bash
docker-compose restart <service-name>
```

---

## 📋 Liên hệ

**Nhóm 7 — Công nghệ Phần mềm**  
© 2026 Groove Records. All rights reserved.
