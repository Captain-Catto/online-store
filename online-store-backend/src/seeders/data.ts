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

// 4. Products
const products = [
  { name: "Áo thun nam cotton" },
  { name: "Áo thể thao Jacquard Seamless" },
  { name: "Áo thun thỏ 7 màu - Năm Hên" },
  { name: "Áo thun relaxed fit - Run now, Rest later" },
  { name: "Áo thun relaxed fit Pluto" },
  { name: "Áo thun relaxed fit Donald picnic" },
  { name: "Áo thun jersey Mickey" },
  { name: "Áo thun dài tay Cotton Compact" },
];

// 5. ProductDetails - Chỉ lưu màu sắc và hình ảnh (đã tối ưu)
const productDetails = [
  // Áo thun nam cotton - Đen
  {
    productId: 1,
    color: "black",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den14.webp`,
      `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.xd.6.webp`,
      `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den15.webp`,
    ]),
  },
  // Áo thun nam cotton - Trắng
  {
    productId: 1,
    color: "white",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den6.webp`,
      `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.xd.5.jpg`,
      `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.den7.webp`,
    ]),
  },
  // Áo thun nam cotton - Xanh đậm
  {
    productId: 1,
    color: "blue",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-nam-cotton/ao-thun-nam-cotton-220gsm-mau-xanh-dam_(1).webp`,
      `${S3_BASE_URL}/ao-thun-nam-cotton/ao-thun-nam-cotton-220gsm-mau-xanh-dam_(2).webp`,
      `${S3_BASE_URL}/ao-thun-nam-cotton/AT.220.xd.12.webp`,
    ]),
  },

  // Áo thể thao jacquard seamless - Đen
  {
    productId: 2,
    color: "black",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/den1.webp`,
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/den2.webp`,
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/den3.webp`,
    ]),
  },
  // Áo thể thao jacquard seamless - Xám
  {
    productId: 2,
    color: "gray",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xam1.webp`,
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xam2.webp`,
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xam3.webp`,
    ]),
  },
  // Áo thể thao jacquard seamless - Xanh
  {
    productId: 2,
    color: "blue",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xanh1.webp`,
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xanh2.webp`,
      `${S3_BASE_URL}/ao-thun-the-thao-jacquard-seamless/xanh3.webp`,
    ]),
  },

  // Áo thun thỏ 7 màu - Đen
  {
    productId: 3,
    color: "black",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-tho-7-mau-nam-hen/den1.webp`,
      `${S3_BASE_URL}/ao-thun-tho-7-mau-nam-hen/den2.webp`,
      `${S3_BASE_URL}/ao-thun-tho-7-mau-nam-hen/den3.webp`,
    ]),
  },

  // Áo thun relaxed fit - Run now, Rest later - Đen
  {
    productId: 4,
    color: "black",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-relaxed-fit-run-now-rest-later/den1.webp`,
      `${S3_BASE_URL}/ao-thun-relaxed-fit-run-now-rest-later/den2.webp`,
      `${S3_BASE_URL}/ao-thun-relaxed-fit-run-now-rest-later/den3.webp`,
    ]),
  },
  // Áo thun relaxed fit - Run now, Rest later - Trắng
  {
    productId: 4,
    color: "white",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-relaxed-fit-run-now-rest-later/trang1.webp`,
      `${S3_BASE_URL}/ao-thun-relaxed-fit-run-now-rest-later/trang2.webp`,
      `${S3_BASE_URL}/ao-thun-relaxed-fit-run-now-rest-later/trang3.webp`,
    ]),
  },

  // Áo thun relaxed fit Pluto - Trắng
  {
    productId: 5,
    color: "white",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-relaxed-fit-pluto/trang1.webp`,
    ]),
  },

  // Áo thun relaxed fit Donald picnic - Trắng
  {
    productId: 6,
    color: "white",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-relaxed-fit-donald-picnic/trang1.webp`,
      `${S3_BASE_URL}/ao-thun-relaxed-fit-donald-picnic/trang2.webp`,
      `${S3_BASE_URL}/ao-thun-relaxed-fit-donald-picnic/trang3.webp`,
    ]),
  },

  // Áo thun jersey Mickey - Xanh
  {
    productId: 7,
    color: "blue",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-thun-jersey-mickey/blue1.webp`,
      `${S3_BASE_URL}/ao-thun-jersey-mickey/blue2.webp`,
      `${S3_BASE_URL}/ao-thun-jersey-mickey/blue3.webp`,
    ]),
  },

  // Áo thun dài tay Cotton Compact - Trắng
  {
    productId: 8,
    color: "white",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/trang1.webp`,
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/trang2.webp`,
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/trang3.webp`,
    ]),
  },
  // Áo thun dài tay Cotton Compact - Xám
  {
    productId: 8,
    color: "gray",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/xam1.webp`,
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/xam2.webp`,
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/xam3.webp`,
    ]),
  },
  // Áo thun dài tay Cotton Compact - Xám đậm
  {
    productId: 8,
    color: "charcoal",
    imagePath: JSON.stringify([
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/xamdam1.webp`,
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/xamdam2.webp`,
      `${S3_BASE_URL}/ao-dai-tay-cotton-compact/xamdam3.webp`,
    ]),
  },
];

// 6. ProductInventory - Kích thước và tồn kho cho từng biến thể màu sắc
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
  { productDetailId: 3, size: "S", stock: 75 },
  { productDetailId: 3, size: "M", stock: 85 },
  { productDetailId: 3, size: "L", stock: 95 },

  // Áo thể thao jacquard seamless - Đen (productDetailId: 4)
  { productDetailId: 4, size: "S", stock: 50 },
  { productDetailId: 4, size: "M", stock: 70 },
  { productDetailId: 4, size: "L", stock: 60 },

  // Áo thể thao jacquard seamless - Xám (productDetailId: 5)
  { productDetailId: 5, size: "S", stock: 45 },
  { productDetailId: 5, size: "M", stock: 65 },
  { productDetailId: 5, size: "L", stock: 55 },

  // Áo thể thao jacquard seamless - Xanh (productDetailId: 6)
  { productDetailId: 6, size: "S", stock: 40 },
  { productDetailId: 6, size: "M", stock: 60 },
  { productDetailId: 6, size: "L", stock: 50 },
  { productDetailId: 6, size: "XL", stock: 35 },

  // Áo thun thỏ 7 màu - Đen (productDetailId: 7)
  { productDetailId: 7, size: "S", stock: 40 },
  { productDetailId: 7, size: "M", stock: 50 },
  { productDetailId: 7, size: "XL", stock: 45 },

  // Áo thun relaxed fit - Run now, Rest later - Đen (productDetailId: 8)
  { productDetailId: 8, size: "S", stock: 30 },
  { productDetailId: 8, size: "M", stock: 40 },
  { productDetailId: 8, size: "L", stock: 35 },

  // Áo thun relaxed fit - Run now, Rest later - Trắng (productDetailId: 9)
  { productDetailId: 9, size: "S", stock: 30 },
  { productDetailId: 9, size: "M", stock: 40 },
  { productDetailId: 9, size: "L", stock: 35 },

  // Áo thun relaxed fit Pluto - Trắng (productDetailId: 10)
  { productDetailId: 10, size: "S", stock: 25 },
  { productDetailId: 10, size: "M", stock: 30 },
  { productDetailId: 10, size: "L", stock: 35 },

  // Áo thun relaxed fit Donald picnic - Trắng (productDetailId: 11)
  { productDetailId: 11, size: "S", stock: 20 },
  { productDetailId: 11, size: "M", stock: 25 },
  { productDetailId: 11, size: "L", stock: 30 },

  // Áo thun jersey Mickey - Xanh (productDetailId: 12)
  { productDetailId: 12, size: "S", stock: 20 },
  { productDetailId: 12, size: "M", stock: 25 },
  { productDetailId: 12, size: "L", stock: 30 },

  // Áo thun dài tay Cotton Compact - Trắng (productDetailId: 13)
  { productDetailId: 13, size: "S", stock: 20 },
  { productDetailId: 13, size: "M", stock: 25 },
  { productDetailId: 13, size: "L", stock: 30 },
  { productDetailId: 13, size: "XL", stock: 35 },

  // Áo thun dài tay Cotton Compact - Xám (productDetailId: 14)
  { productDetailId: 14, size: "S", stock: 20 },
  { productDetailId: 14, size: "M", stock: 25 },
  { productDetailId: 14, size: "L", stock: 30 },
  { productDetailId: 14, size: "XL", stock: 35 },

  // Áo thun dài tay Cotton Compact - Xám đậm (productDetailId: 15)
  { productDetailId: 15, size: "S", stock: 20 },
  { productDetailId: 15, size: "M", stock: 30 },
  { productDetailId: 15, size: "XL", stock: 40 },
];

// 7. ProductCategory (Many-to-Many relationship)
const productCategories = [
  { productId: 1, categoryId: 1 }, // Áo thun nam cotton -> Áo
  { productId: 1, categoryId: 6 }, // Áo thun nam cotton -> Hàng mới
  { productId: 2, categoryId: 1 }, // Áo thể thao -> Áo
  { productId: 3, categoryId: 1 }, // Áo thun thỏ -> Áo
  { productId: 4, categoryId: 1 }, // Áo thun relaxed -> Áo
  { productId: 4, categoryId: 5 }, // Áo thun relaxed -> Sale
  { productId: 5, categoryId: 1 }, // Áo thun Pluto -> Áo
  { productId: 5, categoryId: 6 }, // Áo thun Pluto -> Hàng mới
  { productId: 6, categoryId: 1 }, // Áo thun Donald -> Áo
  { productId: 7, categoryId: 1 }, // Áo thun Mickey -> Áo
  { productId: 8, categoryId: 1 }, // Áo dài tay -> Áo
  { productId: 8, categoryId: 5 }, // Áo dài tay -> Sale
];

// 8. PaymentMethods
const paymentMethods = [
  { name: "COD" },
  { name: "Credit Card" },
  { name: "Paypal" },
  { name: "Bank Transfer" },
];

// 9. PaymentStatus
const paymentStatuses = [
  { name: "Pending", description: "Pending" },
  { name: "Paid", description: "Paid" },
  { name: "Failed", description: "Failed" },
  { name: "Refunded", description: "Refunded" },
];

// 10. Vouchers
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
  productCategories,
  paymentMethods,
  paymentStatuses,
  vouchers,
};
