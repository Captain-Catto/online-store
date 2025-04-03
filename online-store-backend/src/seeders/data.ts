// Seed data để tạo database

// Base URL cho hình ảnh S3
const S3_BASE_URL =
  "https://shop-online-images.s3.ap-southeast-2.amazonaws.com";

// 1. Role
const roles = [
  { id: 1, name: "Admin" },
  { id: 2, name: "User" },
];

// 2. Users
const users = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "$2b$10$qnKBm0aVuY7GgRuWVYmzXO6HLYkYzrxHKTe1i3JS5hWCZIwTUCFnO", // password: admin123
    roleId: 1,
  },
  {
    username: "user1",
    email: "user1@example.com",
    password: "$2b$10$qnKBm0aVuY7GgRuWVYmzXO6HLYkYzrxHKTe1i3JS5hWCZIwTUCFnO", // password: admin123
    roleId: 2,
  },
  {
    username: "user2",
    email: "user2@example.com",
    password: "$2b$10$qnKBm0aVuY7GgRuWVYmzXO6HLYkYzrxHKTe1i3JS5hWCZIwTUCFnO", // password: admin123
    roleId: 2,
  },
];

// 3. Categories
const categories = [
  { name: "Áo" },
  { name: "Quần" },
  { name: "Giày" },
  { name: "Phụ kiện" },
  { name: "Sale" },
  { name: "Hàng mới" },
];

// 4. Products - Đã cập nhật với các trường mới
const products = [
  {
    name: "Áo thun nam cotton",
    sku: "AT001",
    description: "Áo thun nam chất liệu cotton cao cấp 100%",
    brand: "YoungStyle",
    material: "Cotton",
    featured: true,
    status: "active",
    tags: JSON.stringify(["áo thun", "nam", "cotton"]),
    suitability: JSON.stringify(["casual", "daily"]),
  },
  {
    name: "Áo thể thao Jacquard Seamless",
    sku: "AT002",
    description: "Áo thể thao công nghệ Jacquard không đường may",
    brand: "SportPro",
    material: "Polyester",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo thun", "thể thao", "không đường may"]),
    suitability: JSON.stringify(["sport", "gym"]),
  },
  {
    name: "Áo thun thỏ 7 màu - Năm Hên",
    sku: "AT003",
    description: "Áo thun họa tiết thỏ dễ thương",
    brand: "Fun Fashion",
    material: "Cotton Blend",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo thun", "năm hên", "họa tiết thỏ"]),
    suitability: JSON.stringify(["casual", "holiday"]),
  },
  {
    name: "Áo thun relaxed fit - Run now, Rest later",
    sku: "AT004",
    description: "Áo thun phong cách relaxed fit với thông điệp tích cực",
    brand: "UrbanLife",
    material: "Cotton",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo thun", "relaxed fit", "slogan"]),
    suitability: JSON.stringify(["casual", "sport"]),
  },
  {
    name: "Áo thun relaxed fit Pluto",
    sku: "AT005",
    description: "Áo thun họa tiết chú chó Pluto đáng yêu",
    brand: "DisneyWear",
    material: "Cotton Compact",
    featured: true,
    status: "active",
    tags: JSON.stringify(["áo thun", "disney", "pluto"]),
    suitability: JSON.stringify(["casual", "daily"]),
  },
  {
    name: "Áo thun relaxed fit Donald picnic",
    sku: "AT006",
    description: "Áo thun phong cách relaxed fit với họa tiết Donald đi picnic",
    brand: "DisneyWear",
    material: "Cotton",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo thun", "disney", "donald"]),
    suitability: JSON.stringify(["casual", "daily"]),
  },
  {
    name: "Áo thun jersey Mickey",
    sku: "AT007",
    description: "Áo thun chất liệu jersey với họa tiết Mickey",
    brand: "DisneyWear",
    material: "Jersey",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo thun", "disney", "mickey"]),
    suitability: JSON.stringify(["casual", "daily"]),
  },
  {
    name: "Áo thun dài tay Cotton Compact",
    sku: "AT008",
    description: "Áo thun dài tay chất liệu cotton compact cao cấp",
    brand: "Premium",
    material: "Cotton Compact",
    featured: true,
    status: "active",
    tags: JSON.stringify(["áo thun", "dài tay", "cotton compact"]),
    suitability: JSON.stringify(["casual", "daily", "office"]),
  },
];

// 5. ProductDetails - Đã cập nhật với price và originalPrice
const productDetails = [
  // Áo thun nam cotton - Đen
  {
    productId: 1,
    color: "black",
    price: 199000,
    originalPrice: 250000,
  },
  // Áo thun nam cotton - Trắng
  {
    productId: 1,
    color: "white",
    price: 199000,
    originalPrice: 250000,
  },
  // Áo thun nam cotton - Xanh đậm
  {
    productId: 1,
    color: "blue",
    price: 199000,
    originalPrice: 250000,
  },

  // Áo thể thao jacquard seamless - Đen
  {
    productId: 2,
    color: "black",
    price: 299000,
    originalPrice: 350000,
  },
  // Áo thể thao jacquard seamless - Xám
  {
    productId: 2,
    color: "gray",
    price: 299000,
    originalPrice: 350000,
  },
  // Áo thể thao jacquard seamless - Xanh
  {
    productId: 2,
    color: "blue",
    price: 299000,
    originalPrice: 350000,
  },

  // Áo thun thỏ 7 màu - Đen
  {
    productId: 3,
    color: "black",
    price: 249000,
    originalPrice: 299000,
  },

  // Áo thun relaxed fit - Run now, Rest later - Đen
  {
    productId: 4,
    color: "black",
    price: 229000,
    originalPrice: 275000,
  },
  // Áo thun relaxed fit - Run now, Rest later - Trắng
  {
    productId: 4,
    color: "white",
    price: 229000,
    originalPrice: 275000,
  },

  // Áo thun relaxed fit Pluto - Trắng
  {
    productId: 5,
    color: "white",
    price: 249000,
    originalPrice: 299000,
  },

  // Áo thun relaxed fit Donald picnic - Trắng
  {
    productId: 6,
    color: "white",
    price: 249000,
    originalPrice: 299000,
  },

  // Áo thun jersey Mickey - Xanh
  {
    productId: 7,
    color: "blue",
    price: 279000,
    originalPrice: 329000,
  },

  // Áo thun dài tay Cotton Compact - Trắng
  {
    productId: 8,
    color: "white",
    price: 329000,
    originalPrice: 379000,
  },
  // Áo thun dài tay Cotton Compact - Xám
  {
    productId: 8,
    color: "gray",
    price: 329000,
    originalPrice: 379000,
  },
  // Áo thun dài tay Cotton Compact - Xám đậm
  {
    productId: 8,
    color: "charcoal",
    price: 329000,
    originalPrice: 379000,
  },
];

// 6. ProductInventory - Kích thước và tồn kho cho từng biến thể màu sắc (giữ nguyên)
const productInventories = [
  // Áo thun nam cotton - Đen (productDetailId: 1)
  { productDetailId: 1, size: "S", stock: 100 },
  { productDetailId: 1, size: "M", stock: 150 },
  { productDetailId: 1, size: "L", stock: 120 },

  // Áo thun nam cotton - Trắng (productDetailId: 2)
  { productDetailId: 2, size: "S", stock: 80 },
  { productDetailId: 2, size: "M", stock: 100 },
  { productDetailId: 2, size: "L", stock: 90 },

  // Áo thun nam cotton - Xanh đậm (productDetailId: 3)
  { productDetailId: 3, size: "S", stock: 70 },
  { productDetailId: 3, size: "M", stock: 90 },
  { productDetailId: 3, size: "L", stock: 85 },
];

// 7. ProductImage - MỚI: thêm dữ liệu cho bảng ProductImage
const productImages = [
  // Áo thun nam cotton - Đen (productDetailId: 1)
  {
    productDetailId: 1,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den14.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 1,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.xd.6.webp`,
    isMain: false,
    displayOrder: 1,
  },
  {
    productDetailId: 1,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den15.webp`,
    isMain: false,
    displayOrder: 2,
  },

  // Áo thun nam cotton - Trắng (productDetailId: 2)
  {
    productDetailId: 2,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den6.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 2,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.xd.5.jpg`,
    isMain: false,
    displayOrder: 1,
  },
  {
    productDetailId: 2,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den7.webp`,
    isMain: false,
    displayOrder: 2,
  },

  // Áo thun nam cotton - Xanh đậm (productDetailId: 3)
  {
    productDetailId: 3,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/ao-thun-nam-cotton-220gsm-mau-xanh-dam_(1).webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 3,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/ao-thun-nam-cotton-220gsm-mau-xanh-dam_(2).webp`,
    isMain: false,
    displayOrder: 1,
  },
  {
    productDetailId: 3,
    url: `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.xd.12.webp`,
    isMain: false,
    displayOrder: 2,
  },

  // Thêm dữ liệu cho các productDetail khác (tương tự như cách lưu ở imagePath trước đây)
  // Áo thể thao jacquard seamless - Đen (productDetailId: 4)
  {
    productDetailId: 4,
    url: `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/den1.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 4,
    url: `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/den2.webp`,
    isMain: false,
    displayOrder: 1,
  },
  {
    productDetailId: 4,
    url: `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/den3.webp`,
    isMain: false,
    displayOrder: 2,
  },

  // Áo thể thao jacquard seamless - Xám (productDetailId: 5)
  {
    productDetailId: 5,
    url: `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xam1.webp`,
    isMain: true,
    displayOrder: 0,
  },
  // ... tiếp tục cho các sản phẩm khác
];

// 8. ProductCategory (Many-to-Many relationship) - Giữ nguyên
const productCategories = [
  { productId: 1, categoryId: 1 }, // Áo thun nam cotton -> Áo
  { productId: 1, categoryId: 6 }, // Áo thun nam cotton -> Hàng mới
  // ... Các mục khác giữ nguyên
];

// 9-10. PaymentMethods, PaymentStatus, Vouchers - Giữ nguyên
const paymentMethods = [
  { name: "COD" },
  { name: "Credit Card" },
  { name: "Paypal" },
  { name: "Bank Transfer" },
];

const paymentStatuses = [
  { name: "Pending", description: "Pending" },
  { name: "Paid", description: "Paid" },
  { name: "Failed", description: "Failed" },
  { name: "Refunded", description: "Refunded" },
];

const vouchers = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    expirationDate: new Date(2024, 11, 31),
  },
  {
    code: "SUMMER20",
    type: "percentage",
    value: 20,
    expirationDate: new Date(2024, 8, 31),
  },
  {
    code: "DISCOUNT50K",
    type: "fixed",
    value: 50000,
    expirationDate: new Date(2024, 9, 30),
  },
];

export {
  roles,
  users,
  categories,
  products,
  productDetails,
  productInventories,
  productImages, // Export thêm productImages
  productCategories,
  paymentMethods,
  paymentStatuses,
  vouchers,
};
