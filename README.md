# Hệ thống E-Commerce

Nền tảng thương mại điện tử full-stack được xây dựng với kiến trúc microservices, bao gồm frontend hiện đại và các backend services có khả năng mở rộng.

## Tổng quan dự án

Đây là một hệ thống thương mại điện tử hoàn chỉnh với quản lý người dùng, danh mục sản phẩm, giỏ hàng, xử lý đơn hàng và thanh toán. Hệ thống được thiết kế với kiến trúc microservices để đảm bảo khả năng mở rộng và dễ bảo trì.

## Công nghệ sử dụng

### Frontend
- **Framework**: Next.js 14
- **Ngôn ngữ**: TypeScript
- **Styling**: TailwindCSS
- **Quản lý state**: React Context API
- **UI Components**: Custom components với shadcn/ui

### Backend
- **Framework**: FastAPI (Python)
- **Kiến trúc**: Microservices
- **Cơ sở dữ liệu**: PostgreSQL 15
- **Xác thực**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

### Kiến trúc Services

Backend bao gồm 5 microservices độc lập:

1. **API Gateway** (`api-gateway/`)
   - Điểm truy cập trung tâm cho tất cả các request từ client
   - Định tuyến request đến các services phù hợp
   - Xử lý CORS và authentication middleware

2. **Auth Service** (`services/auth-service/`)
   - Đăng ký và xác thực người dùng
   - Tạo và xác thực JWT token
   - Phân quyền theo vai trò (Admin, Staff, User)

3. **Product Service** (`services/product-service/`)
   - Quản lý danh mục sản phẩm
   - Quản lý danh mục
   - Theo dõi tồn kho

4. **Order Service** (`services/order-service/`)
   - Tạo và quản lý đơn hàng
   - Theo dõi trạng thái đơn hàng
   - Lịch sử đơn hàng

5. **Payment Service** (`services/payment-service/`)
   - Xử lý thanh toán
   - Quản lý giao dịch
   - Theo dõi trạng thái thanh toán

Mỗi service có database PostgreSQL riêng để đảm bảo tách biệt dữ liệu và khả năng mở rộng độc lập.

## Tính năng

### Tính năng người dùng
- Đăng ký và đăng nhập tài khoản
- Duyệt sản phẩm theo danh mục
- Tìm kiếm và lọc sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Thanh toán và đặt hàng
- Xem lịch sử đơn hàng
- Cập nhật thông tin cá nhân

### Tính năng Admin
- Dashboard với phân tích thống kê
- Quản lý sản phẩm (CRUD)
- Quản lý danh mục
- Quản lý đơn hàng và cập nhật trạng thái
- Quản lý người dùng

### Tính năng Staff
- Dashboard với thống kê đơn hàng
- Xem và quản lý đơn hàng
- Cập nhật trạng thái đơn hàng
- Xem tồn kho sản phẩm

## Cấu trúc dự án

```
E-commerce/
├── frontend/                    # Ứng dụng Next.js frontend
│   ├── src/
│   │   ├── app/                # Các trang App router
│   │   ├── components/         # React components
│   │   ├── contexts/           # Context providers
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript types
│   └── public/                 # Static assets
│
├── api-gateway/                # API Gateway service
│   └── app/
│       ├── main.py            # Gateway entry point
│       └── core/              # Cấu hình core
│
├── services/
│   ├── auth-service/          # Service xác thực
│   ├── product-service/       # Service quản lý sản phẩm
│   ├── order-service/         # Service xử lý đơn hàng
│   └── payment-service/       # Service xử lý thanh toán
│
└── docker-compose.yml         # Cấu hình Docker Compose
```