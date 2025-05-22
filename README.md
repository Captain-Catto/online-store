# Online Store - Hệ Thống Bán Hàng Thời Trang Trực Tuyến

Dự án Online Store là một hệ thống thương mại điện tử toàn diện chuyên về bán hàng thời trang trực tuyến, được xây dựng với kiến trúc phân chia frontend và backend rõ ràng.

## Tổng Quan Hệ Thống

Dự án được chia thành hai phần chính:

1. **Backend (Node.js + Express + Sequelize)** - Cung cấp API RESTful cho toàn bộ hệ thống
2. **Frontend (Next.js)** - Giao diện người dùng hiện đại với cả trang mua sắm và trang quản trị

## Chức Năng Chính

### Người Dùng:

- Đăng ký, đăng nhập và quản lý tài khoản
- Duyệt sản phẩm theo danh mục
- Tìm kiếm sản phẩm
- Xem chi tiết sản phẩm với nhiều biến thể (kích thước, màu sắc)
- Quản lý giỏ hàng
- Yêu thích sản phẩm
- Thanh toán đơn hàng (hỗ trợ COD và thanh toán trực tuyến qua VNPay)
- Theo dõi và quản lý lịch sử đơn hàng
- Quản lý địa chỉ giao hàng
- Sử dụng mã giảm giá (voucher)

### Quản Trị Viên:

- Dashboard với thống kê và báo cáo
- Quản lý sản phẩm và danh mục
- Quản lý đơn hàng
- Quản lý người dùng
- Quản lý kho hàng và tồn kho
- Thiết lập hệ thống navigation menu
- Tạo và quản lý voucher
- Xem báo cáo doanh thu và thống kê

## Công Nghệ Sử Dụng

### Backend:

- **Nền tảng**: Node.js
- **Framework**: Express.js
- **Ngôn ngữ lập trình**: TypeScript
- **ORM**: Sequelize (MySQL)
- **Xác thực**: JWT (JSON Web Token)
- **Upload ảnh**: AWS S3 (multer-s3)
- **Email**: Nodemailer
- **Bảo mật**: bcrypt

### Frontend:

- **Framework**: Next.js 15
- **Ngôn ngữ lập trình**: TypeScript
- **State Management**: React Context API
- **UI Components**: Custom components kết hợp với Material-UI icons
- **Drag & Drop**: dnd-kit, react-beautiful-dnd
- **Hiển thị biểu đồ**: Chart.js
- **Carousel/Slider**: react-slick, slick-carousel

## Cấu Trúc Dự Án

### Backend:

```
online-store-backend/
├── package.json          # Cấu hình npm và dependencies
├── tsconfig.json         # Cấu hình TypeScript
├── src/
│   ├── config/           # Cấu hình hệ thống (database, env)
│   ├── controllers/      # Xử lý logic nghiệp vụ
│   ├── middlewares/      # Middleware (auth, role, order check)
│   ├── models/           # Định nghĩa model và quan hệ
│   ├── routes/           # Định nghĩa API endpoints
│   ├── seeders/          # Dữ liệu mẫu
│   ├── services/         # Services (upload, email, etc.)
│   ├── utils/            # Helper functions
│   └── index.ts          # Entry point
└── public/
    └── uploads/          # Thư mục lưu trữ files upload (local)
```

### Frontend:

```
shop-online-front-end/
├── package.json          # Cấu hình npm và dependencies
├── next.config.ts        # Cấu hình Next.js
├── public/               # Static assets
└── src/
    ├── app/              # Các trang của ứng dụng (Next.js App Router)
    ├── assets/           # Assets (images, icons, etc.)
    ├── components/       # React components
    ├── config/           # Cấu hình (API URL, etc.)
    ├── contexts/         # React context providers
    ├── hooks/            # Custom React hooks
    ├── services/         # API service clients
    ├── types/            # Định nghĩa các type của Typescripts
    └── utils/            # Helper functions
```

## Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống

- Node.js (v18 trở lên)
- MySQL (v8 trở lên)
- npm hoặc yarn

### Cài Đặt Backend:

1. Di chuyển vào thư mục backend:

```bash
cd online-store-backend
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file .env (tham khảo .env.example):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=online_store
DB_PORT=3306
PORT=8080
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_token_secret_key
NODE_ENV=development

# Cấu hình AWS S3 (nếu sử dụng)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
S3_BUCKET=your_s3_bucket

# Cấu hình nodemailer (email)
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_SECURE=false
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_password
EMAIL_FROM=no-reply@shoponline.com
EMAIL_FROM_NAME=Online Store

# Cấu hình VNPay (thanh toán)
VNP_TMN_CODE=your_vnpay_merchant_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=your_frontend_return_url
VNP_IPN_URL=your_backend_ipn_url
```

Lưu ý: Bạn cần cấu hình đúng biến môi trường cho cả hai container để chúng có thể giao tiếp với nhau.

4. Tạo database MySQL:

```sql
CREATE DATABASE online_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Chạy migrations (tự động thông qua Sequelize sync):

```bash
npm run dev
```

6. (Tùy chọn) Import dữ liệu mẫu:

```bash
npm run seed
```

### Cài Đặt Frontend:

1. Di chuyển vào thư mục frontend:

```bash
cd shop-online-front-end
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file .env.local:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

4. Khởi động development server:

```bash
npm run dev
```

## Cấu Trúc Database

Hệ thống sử dụng MySQL với Sequelize ORM. Một số bảng chính:

- **Users**: Thông tin người dùng
- **Products**: Thông tin sản phẩm
- **Categories**: Danh mục sản phẩm
- **Orders**: Đơn hàng
- **OrderDetails**: Chi tiết đơn hàng
- **ProductInventory**: Quản lý tồn kho
- **ProductDetail**: Chi tiết sản phẩm
- **Vouchers**: Mã giảm giá
- **Carts**: Giỏ hàng người dùng
- **UserAddresses**: Địa chỉ người dùng

## API Endpoints

Backend cung cấp nhiều API endpoints thông qua các routes:

- **Auth**: `/api/auth` - Đăng ký, đăng nhập, refresh token
- **Products**: `/api/products` - CRUD sản phẩm
- **Categories**: `/api/categories` - CRUD danh mục
- **Orders**: `/api/orders` - Quản lý đơn hàng
- **Users**: `/api/users` - Quản lý người dùng
- **Cart**: `/api/cart` - Quản lý giỏ hàng
- **Wishlist**: `/api/wishlist` - Danh sách yêu thích
- **Reports**: `/api/reports` - Báo cáo và thống kê

## Thông Tin Thêm

- Hệ thống authentication sử dụng JWT token và refresh token
- Upload ảnh được xử lý thông qua AWS S3
- Hệ thống thanh toán trực tuyến tích hợp VNPay (hỗ trợ nhiều ngân hàng và ví điện tử)
- Gửi email thông báo (đăng ký, quên mật khẩu, xác nhận đơn hàng) qua Nodemailer
- Giao diện người dùng được tối ưu hóa cho cả desktop và mobile

## Luồng Hoạt Động Chính (Flow)

### Luồng Người Dùng:

1. **Đăng ký/Đăng nhập**:

   - Đăng ký tài khoản mới với email và mật khẩu
   - Đăng nhập với tài khoản đã tạo hoặc đăng nhập như khách

2. **Mua sắm**:

   - Duyệt sản phẩm theo danh mục hoặc tìm kiếm
   - Xem chi tiết sản phẩm, chọn kích thước/màu sắc
   - Thêm sản phẩm vào giỏ hàng
   - Quản lý giỏ hàng (thêm/xóa/cập nhật số lượng)

3. **Thanh toán**:

   - Nhập thông tin giao hàng hoặc chọn địa chỉ đã lưu
   - Chọn phương thức thanh toán (COD hoặc VNPay)
   - Áp dụng voucher (nếu có)
   - Xác nhận đơn hàng
   - Thanh toán qua VNPay (nếu đã chọn)
   - Nhận xác nhận đơn hàng qua email

4. **Quản lý tài khoản**:
   - Xem và cập nhật thông tin cá nhân
   - Quản lý địa chỉ giao hàng
   - Theo dõi đơn hàng và lịch sử mua sắm
   - Quản lý danh sách yêu thích

### Luồng Quản Trị:

#### Admin (Quản trị viên):

1. **Quản lý Hệ thống**:

   - Quản lý cấu hình hệ thống
   - Phân quyền người dùng (Admin, Employee)
   - Thiết lập danh mục và menu điều hướng
   - Quản lý các tham số hệ thống

2. **Quản lý Người dùng**:

   - Xem danh sách người dùng
   - Tạo và phân quyền nhân viên
   - Khóa/mở khóa tài khoản người dùng
   - Quản lý thông tin người dùng

3. **Báo cáo và Thống kê**:

   - Xem báo cáo doanh thu tổng quan
   - Thống kê sản phẩm bán chạy
   - Phân tích hành vi người dùng
   - Báo cáo tài chính và kho hàng

4. **Quản lý Khuyến mãi**:
   - Tạo và quản lý voucher
   - Thiết lập chương trình khuyến mãi
   - Theo dõi hiệu quả của các chiến dịch marketing

#### Employee (Nhân viên):

1. **Quản lý Sản phẩm**:

   - Thêm/sửa/xóa sản phẩm
   - Quản lý biến thể sản phẩm (kích thước, màu sắc)
   - Quản lý hình ảnh sản phẩm
   - Cập nhật tồn kho

2. **Quản lý Đơn hàng**:

   - Xem danh sách đơn hàng
   - Cập nhật trạng thái đơn hàng
   - Xem chi tiết đơn hàng
   - Xử lý hoàn tiền/hủy đơn (theo quy trình được duyệt)

3. **Hỗ trợ Khách hàng**:

   - Xem thông tin khách hàng
   - Ghi chú thông tin liên quan đến khách hàng
   - Hỗ trợ xử lý vấn đề đơn hàng
   - Phản hồi yêu cầu của khách hàng

4. **Báo cáo Công việc**:
   - Tạo báo cáo về đơn hàng đã xử lý
   - Báo cáo tồn kho và cảnh báo hết hàng
   - Báo cáo số lượng khách hàng mới

## Tác Giả

- Developer: Lê Quang Trí Đạt
- Email: lequangtridat2000@gmail.com
