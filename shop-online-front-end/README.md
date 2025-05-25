# Ứng Dụng Thương Mại Điện Tử Front-End

Một ứng dụng thương mại điện tử hiện đại, responsive được xây dựng bằng Next.js, cung cấp xác thực người dùng, duyệt sản phẩm, quản lý giỏ hàng, quy trình thanh toán và bảng điều khiển quản trị toàn diện.

## Mục Lục

- [Tính Năng](#tính-năng)
- [Công Nghệ](#công-nghệ)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Dịch Vụ API](#dịch-vụ-api)
- [Xác Thực](#xác-thực)
- [Bảng Điều Khiển Quản Trị](#bảng-điều-khiển-quản-trị)
- [Bắt Đầu](#bắt-đầu)
- [Biến Môi Trường](#biến-môi-trường)
- [Xây Dựng và Triển Khai](#xây-dựng-và-triển-khai)

## Tính Năng

- **Xác Thực Người Dùng**: Đăng nhập, đăng ký và xác thực dựa trên token với cơ chế làm mới
- **Lọc Sản Phẩm**: Lọc sản phẩm theo danh mục, với bộ lọc màu sắc, kích thước, giá và nhiều tiêu chí khác
- **Giỏ Hàng**: Thêm, cập nhật, xóa sản phẩm với xác thực tồn kho thời gian thực
- **Quy Trình Thanh Toán**: Thanh toán nhiều bước với lựa chọn địa chỉ và phương thức thanh toán
- **Quản Lý Tài Khoản Người Dùng**: Cập nhật thông tin cá nhân, lịch sử đơn hàng, quản lý địa chỉ
- **Bảng Điều Khiển Quản Trị**: Giao diện quản trị toàn diện để quản lý sản phẩm, đơn hàng, người dùng và danh mục
- **Thiết Kế Responsive**: Giao diện thân thiện với thiết bị di động trên tất cả các trang

## Công Nghệ

### Nền Tảng

- **Next.js 15.2.3**: Framework React cho server-side rendering và static site generation
- **React 18.2.0**: Thư viện UI để xây dựng giao diện dựa trên components
- **TypeScript**: JavaScript an toàn về kiểu dữ liệu, cải thiện trải nghiệm phát triển

### Thành Phần UI

- **Material UI Icons (@mui/icons-material)**: Cung cấp biểu tượng xuyên suốt ứng dụng
- **React Icons**: Bộ biểu tượng bổ sung cho các phần tử UI
- **React Slick**: Cho carousel hình ảnh sản phẩm
- **Tailwind CSS**: Framework CSS tiện ích cho styling

### Quản Lý Dữ Liệu

- **JWT Decode**: Xử lý token xác thực
- **js-cookie**: Quản lý cookies
- **Lodash**: Thư viện tiện ích xử lý dữ liệu

### Tương Tác UI

- **DnD Kit (@dnd-kit/core, @dnd-kit/sortable)**: Chức năng kéo thả
- **React Beautiful DnD**: Triển khai kéo thả thay thế
- **React Range**: Thanh trượt cho khoảng giá
- **Chart.js**: Trực quan hóa dữ liệu trong bảng điều khiển quản trị

## Cấu Trúc Dự Án

```
src/
├── app/ - Thư mục app của Next.js với các component trang
│   ├── admin/ - Trang bảng điều khiển quản trị
│   ├── api/ - Xử lý route API
│   ├── auth/ - Trang xác thực
│   ├── products/ - Trang sản phẩm
│   └── ... - Các route trang khác
├── assets/ - Tài nguyên tĩnh
├── components/ - Các component React có thể tái sử dụng
│   ├── Admin/ - Component dành riêng cho quản trị
│   ├── Auth/ - Component xác thực
│   ├── Checkout/ - Component quy trình thanh toán
│   ├── UI/ - Component UI chung
│   └── ... - Các danh mục component khác
├── config/ - File cấu hình
├── contexts/ - Provider context React
├── hooks/ - Custom hooks React
├── services/ - Các module dịch vụ API
├── types/ - Định nghĩa kiểu TypeScript
└── utils/ - Các hàm tiện ích
```

## Dịch Vụ API

Ứng dụng giao tiếp với API backend thông qua các module dịch vụ sau:

### AuthService & AuthClient

- `login(email, password, rememberMe)`: Xác thực người dùng
- `logout()`: Đăng xuất và xóa thông tin xác thực
- `refreshToken()`: Làm mới token xác thực
- `fetchWithAuth(url, options)`: Thực hiện các request API có xác thực
- Quản lý token JWT với tự động làm mới

### UserService

- `getCurrentUser()`: Lấy thông tin người dùng hiện tại
- `updateProfile(userData)`: Cập nhật thông tin người dùng
- `changePassword(currentPassword, newPassword)`: Thay đổi mật khẩu
- `getAddresses()`: Lấy danh sách địa chỉ
- `addAddress(address)`: Thêm địa chỉ mới
- `updateAddress(address)`: Cập nhật địa chỉ
- `deleteAddress(id)`: Xóa địa chỉ
- `setDefaultAddress(id)`: Đặt địa chỉ mặc định

### ProductService

- `getProducts(page, limit, filters)`: Lấy danh sách sản phẩm phân trang
- `getProductById(id)`: Lấy chi tiết một sản phẩm
- `createProduct(productData)`: Tạo sản phẩm mới
- `updateProduct(id, productData)`: Cập nhật sản phẩm
- `deleteProduct(id)`: Xóa sản phẩm
- `uploadProductImages(productDetailId, images)`: Tải lên hình ảnh sản phẩm
- `removeProductImages(productId, imageIds)`: Xóa hình ảnh sản phẩm
- `getSizesByCategory(categoryId)`: Lấy kích thước có sẵn cho danh mục
- `createSize(sizeData)`: Tạo tùy chọn kích thước
- `updateSize(id, sizeData)`: Cập nhật tùy chọn kích thước

### CategoryService

- `getAllCategories()`: Lấy tất cả danh mục sản phẩm
- `getNavCategories()`: Lấy danh mục cho thanh điều hướng
- `getCategoryById(id)`: Lấy chi tiết một danh mục
- `createCategory(formData)`: Tạo danh mục mới
- `updateCategory(id, formData)`: Cập nhật danh mục
- `getProductsByCategorySlug(slug, page, limit, filters)`: Lấy sản phẩm theo danh mục

### CartService

- `getCart()`: Lấy giỏ hàng của người dùng
- `addToCart(productId, productDetailId, color, size, quantity)`: Thêm sản phẩm vào giỏ hàng
- `updateCartItem(itemId, quantity)`: Cập nhật số lượng sản phẩm trong giỏ hàng
- `removeCartItem(itemId)`: Xóa sản phẩm khỏi giỏ hàng
- `clearCart()`: Xóa toàn bộ giỏ hàng
- `validateCartItems()`: Xác thực sản phẩm trong giỏ hàng với tồn kho

### OrderService

- `getMyOrders(page, limit)`: Lấy đơn hàng của người dùng
- `getOrderById(orderId)`: Lấy chi tiết một đơn hàng
- `createOrder(orderData)`: Tạo đơn hàng mới
- `getAdminOrders(page, limit, status, search, fromDate, toDate)`: Lấy đơn hàng cho quản trị viên
- `getEmployeeOrders(page, limit, status, search, fromDate, toDate)`: Lấy đơn hàng cho nhân viên
- `updateOrderStatus(orderId, status)`: Cập nhật trạng thái đơn hàng
- `getShippingFee(requestData)`: Tính phí vận chuyển

### Các Dịch Vụ Khác

- **NavigationService**: Quản lý các mục menu điều hướng
- **VoucherService**: Xử lý voucher khuyến mãi
- **WishlistService**: Quản lý danh sách yêu thích
- **PaymentService**: Xử lý thanh toán
- **ReportsService**: Tạo báo cáo cho bảng điều khiển quản trị

## Xác Thực

Ứng dụng sử dụng hệ thống xác thực dựa trên JWT (JSON Web Token) với các tính năng sau:

- Xác thực dựa trên token với access token và refresh token
- Access token được lưu trữ trong sessionStorage để duy trì phiên
- Refresh token được lưu trữ trong cookie HTTP-only để bảo mật
- Cơ chế tự động làm mới token
- Kiểm soát quyền truy cập dựa trên vai trò (Quản trị viên, Nhân viên, Khách hàng)
- Quản lý trạng thái xác thực với React context

Quy trình xác thực:

1. Người dùng đăng nhập bằng email và mật khẩu
2. Server trả về access token và đặt cookie refresh token
3. Access token được lưu trong sessionStorage
4. AuthClient sử dụng access token cho các request API
5. Khi access token hết hạn, AuthClient tự động yêu cầu token mới sử dụng refresh token
6. Nếu refresh token không hợp lệ, người dùng bị đăng xuất

## Bảng Điều Khiển Quản Trị

Bảng điều khiển quản trị cung cấp giao diện toàn diện để quản lý nền tảng thương mại điện tử:

- **Tổng Quan Bảng Điều Khiển**: Thống kê bán hàng, đơn hàng gần đây và các chỉ số quan trọng
- **Quản Lý Đơn Hàng**: Xem, lọc và cập nhật trạng thái đơn hàng
- **Quản Lý Sản Phẩm**: Thêm, sửa và xóa sản phẩm với tải lên hình ảnh
- **Quản Lý Danh Mục**: Tổ chức danh mục sản phẩm
- **Quản Lý Người Dùng**: Xem và quản lý tài khoản khách hàng
- **Báo Cáo**: Báo cáo bán hàng, tồn kho và hiệu suất sản phẩm

## Bắt Đầu

Đầu tiên, cài đặt các dependencies:

```bash
npm install
# hoặc
yarn install
```

Sau đó, chạy server phát triển:

```bash
npm run dev
# hoặc
yarn dev
```

Mở [http://localhost:3000](http://localhost:3000) với trình duyệt của bạn để xem kết quả.

## Biến Môi Trường

Tạo một file `.env.local` trong thư mục gốc với các biến sau:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Xây Dựng và Triển Khai

Để xây dựng ứng dụng cho môi trường sản xuất:

```bash
npm run build
# hoặc
yarn build
```

Để khởi động server sản xuất:

```bash
npm start
# hoặc
yarn start
```

Để tìm hiểu các tùy chọn triển khai, xem [tài liệu triển khai Next.js](https://nextjs.org/docs/deployment).
