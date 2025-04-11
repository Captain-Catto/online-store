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

// 6. ProductInventory - Cập nhật và bổ sung dữ liệu kho hàng cho tất cả sản phẩm
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

  // Áo thể thao jacquard seamless - Đen (productDetailId: 4)
  { productDetailId: 4, size: "S", stock: 60 },
  { productDetailId: 4, size: "M", stock: 80 },
  { productDetailId: 4, size: "L", stock: 70 },

  // Áo thể thao jacquard seamless - Xám (productDetailId: 5)
  { productDetailId: 5, size: "S", stock: 65 },
  { productDetailId: 5, size: "M", stock: 75 },
  { productDetailId: 5, size: "L", stock: 60 },

  // Áo thể thao jacquard seamless - Xanh (productDetailId: 6)
  { productDetailId: 6, size: "S", stock: 55 },
  { productDetailId: 6, size: "M", stock: 70 },
  { productDetailId: 6, size: "L", stock: 65 },

  // Áo thun thỏ 7 màu - Đen (productDetailId: 7)
  { productDetailId: 7, size: "S", stock: 50 },
  { productDetailId: 7, size: "M", stock: 65 },
  { productDetailId: 7, size: "L", stock: 45 },

  // Áo thun relaxed fit - Run now, Rest later - Đen (productDetailId: 8)
  { productDetailId: 8, size: "S", stock: 55 },
  { productDetailId: 8, size: "M", stock: 75 },
  { productDetailId: 8, size: "L", stock: 50 },

  // Áo thun relaxed fit - Run now, Rest later - Trắng (productDetailId: 9)
  { productDetailId: 9, size: "S", stock: 60 },
  { productDetailId: 9, size: "M", stock: 80 },
  { productDetailId: 9, size: "L", stock: 60 },

  // Áo thun relaxed fit Pluto - Trắng (productDetailId: 10)
  { productDetailId: 10, size: "S", stock: 70 },
  { productDetailId: 10, size: "M", stock: 90 },
  { productDetailId: 10, size: "L", stock: 65 },

  // Áo thun relaxed fit Donald picnic - Trắng (productDetailId: 11)
  { productDetailId: 11, size: "S", stock: 65 },
  { productDetailId: 11, size: "M", stock: 85 },
  { productDetailId: 11, size: "L", stock: 60 },

  // Áo thun jersey Mickey - Xanh (productDetailId: 12)
  { productDetailId: 12, size: "S", stock: 55 },
  { productDetailId: 12, size: "M", stock: 70 },
  { productDetailId: 12, size: "L", stock: 50 },

  // Áo thun dài tay Cotton Compact - Trắng (productDetailId: 13)
  { productDetailId: 13, size: "S", stock: 45 },
  { productDetailId: 13, size: "M", stock: 65 },
  { productDetailId: 13, size: "L", stock: 40 },

  // Áo thun dài tay Cotton Compact - Xám (productDetailId: 14)
  { productDetailId: 14, size: "S", stock: 50 },
  { productDetailId: 14, size: "M", stock: 70 },
  { productDetailId: 14, size: "L", stock: 45 },

  // Áo thun dài tay Cotton Compact - Xám đậm (productDetailId: 15)
  { productDetailId: 15, size: "S", stock: 40 },
  { productDetailId: 15, size: "M", stock: 60 },
  { productDetailId: 15, size: "L", stock: 35 },
];

// 7. ProductImage - Bổ sung ảnh cho tất cả sản phẩm
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
  {
    productDetailId: 5,
    url: `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xam2.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo thể thao jacquard seamless - Xanh (productDetailId: 6)
  {
    productDetailId: 6,
    url: `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xanh1.webp`,
    isMain: true,
    displayOrder: 0,
  },

  // Ảnh cho các sản phẩm còn lại (productDetailId 7-15)
  // Đây là ảnh mẫu, bạn nên thay thế bằng URL thật của các sản phẩm
  {
    productDetailId: 7,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 8,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 9,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 10,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 11,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 12,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 13,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 14,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },

  {
    productDetailId: 15,
    url: `${S3_BASE_URL}/default-product-image.jpg`,
    isMain: true,
    displayOrder: 0,
  },
];

// 8. ProductCategory - Bổ sung đầy đủ các mối quan hệ sản phẩm-danh mục
const productCategories = [
  // Sản phẩm 1: Áo thun nam cotton
  { productId: 1, categoryId: 1 }, // Áo thun nam cotton -> Áo
  { productId: 1, categoryId: 6 }, // Áo thun nam cotton -> Hàng mới

  // Sản phẩm 2: Áo thể thao Jacquard Seamless
  { productId: 2, categoryId: 1 }, // Áo thể thao -> Áo

  // Sản phẩm 3: Áo thun thỏ 7 màu - Năm Hên
  { productId: 3, categoryId: 1 }, // Áo thun thỏ -> Áo
  { productId: 3, categoryId: 6 }, // Áo thun thỏ -> Hàng mới

  // Sản phẩm 4: Áo thun relaxed fit - Run now, Rest later
  { productId: 4, categoryId: 1 }, // Áo thun relaxed fit -> Áo

  // Sản phẩm 5: Áo thun relaxed fit Pluto
  { productId: 5, categoryId: 1 }, // Áo thun relaxed fit Pluto -> Áo
  { productId: 5, categoryId: 5 }, // Áo thun relaxed fit Pluto -> Sale

  // Sản phẩm 6: Áo thun relaxed fit Donald picnic
  { productId: 6, categoryId: 1 }, // Áo thun relaxed fit Donald -> Áo
  { productId: 6, categoryId: 5 }, // Áo thun relaxed fit Donald -> Sale

  // Sản phẩm 7: Áo thun jersey Mickey
  { productId: 7, categoryId: 1 }, // Áo thun jersey -> Áo

  // Sản phẩm 8: Áo thun dài tay Cotton Compact
  { productId: 8, categoryId: 1 }, // Áo thun dài tay -> Áo
  { productId: 8, categoryId: 6 }, // Áo thun dài tay -> Hàng mới
];

// 9. PaymentMethods - Phương thức thanh toán
const paymentMethods = [
  { name: "COD" },
  { name: "Credit Card" },
  { name: "Paypal" },
  { name: "Bank Transfer" },
];

// 10. PaymentStatus - Trạng thái thanh toán
const paymentStatuses = [
  { name: "Pending", description: "Pending" },
  { name: "Paid", description: "Paid" },
  { name: "Failed", description: "Failed" },
  { name: "Refunded", description: "Refunded" },
];

// 11. Vouchers - Mã giảm giá
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

// 12. UserAddress - Địa chỉ người dùng (dữ liệu mới)
const userAddresses = [
  {
    userId: 2, // user1
    fullName: "Nguyễn Văn A",
    phoneNumber: "0901234567",
    streetAddress: "123 Đường Nguyễn Huệ",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    userId: 2, // user1
    fullName: "Nguyễn Văn A - Công ty",
    phoneNumber: "0901234567",
    streetAddress: "456 Đường Lê Lợi",
    ward: "Phường Bến Thành",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: false,
  },
  {
    userId: 3, // user2
    fullName: "Trần Thị B",
    phoneNumber: "0987654321",
    streetAddress: "45 Phố Hàng Bài",
    ward: "Phường Hàng Bài",
    district: "Quận Hoàn Kiếm",
    city: "Hà Nội",
    isDefault: true,
  },
];

export {
  roles,
  users,
  categories,
  products,
  productDetails,
  productInventories,
  productImages,
  productCategories,
  paymentMethods,
  paymentStatuses,
  vouchers,
  userAddresses, // Thêm export userAddresses
};
