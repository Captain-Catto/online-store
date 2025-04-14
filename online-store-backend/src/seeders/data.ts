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
    phoneNumber: "0987654321",
    dateOfBirth: new Date("1990-01-01"),
  },
  {
    username: "user1",
    email: "user1@example.com",
    password: "$2b$10$qnKBm0aVuY7GgRuWVYmzXO6HLYkYzrxHKTe1i3JS5hWCZIwTUCFnO", // password: admin123
    roleId: 2,
    phoneNumber: "0901234567",
    dateOfBirth: new Date("1995-03-15"),
  },
  {
    username: "user2",
    email: "user2@example.com",
    password: "$2b$10$qnKBm0aVuY7GgRuWVYmzXO6HLYkYzrxHKTe1i3JS5hWCZIwTUCFnO", // password: admin123
    roleId: 2,
    phoneNumber: "0987654321",
    dateOfBirth: new Date("1992-07-22"),
  },
  {
    username: "customer1",
    email: "customer1@example.com",
    password: "$2b$10$qnKBm0aVuY7GgRuWVYmzXO6HLYkYzrxHKTe1i3JS5hWCZIwTUCFnO", // password: admin123
    roleId: 2,
    phoneNumber: "0909123456",
    dateOfBirth: new Date("1998-12-24"),
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

// 4. Products - Đã cập nhật với subtype
const products = [
  {
    name: "Áo thun nam basic cotton",
    sku: "AT001",
    description: "Áo thun nam chất liệu cotton cao cấp 100%, form regular fit",
    brand: "YoungStyle",
    material: "Cotton",
    featured: true,
    status: "active",
    tags: JSON.stringify(["áo thun", "nam", "cotton", "basic"]),
    suitability: JSON.stringify(["casual", "daily"]),
    subtype: "T-SHIRT",
  },
  {
    name: "Áo thun polo pique nam",
    sku: "AT002",
    description: "Áo polo nam vải pique cao cấp, cổ bẻ, thiết kế thanh lịch",
    brand: "MenStyle",
    material: "Cotton Pique",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo polo", "nam", "pique", "cổ bẻ"]),
    suitability: JSON.stringify(["office", "casual", "dating"]),
    subtype: "T-SHIRT",
  },
  {
    name: "Áo sơ mi nam kẻ caro",
    sku: "SM001",
    description:
      "Áo sơ mi nam họa tiết kẻ caro thời trang, chất liệu cotton pha",
    brand: "UrbanStyle",
    material: "Cotton Blend",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo sơ mi", "kẻ caro", "nam"]),
    suitability: JSON.stringify(["office", "casual", "dating"]),
    subtype: "SHIRT",
  },
  {
    name: "Áo sơ mi nam Oxford dài tay",
    sku: "SM002",
    description: "Áo sơ mi nam chất liệu Oxford cao cấp, kiểu dáng hiện đại",
    brand: "BusinessPro",
    material: "Oxford Cotton",
    featured: true,
    status: "active",
    tags: JSON.stringify(["áo sơ mi", "oxford", "nam", "dài tay"]),
    suitability: JSON.stringify(["office", "formal", "business"]),
    subtype: "SHIRT",
  },
  {
    name: "Áo khoác denim unisex",
    sku: "AK001",
    description: "Áo khoác denim phong cách vintage, dễ phối đồ",
    brand: "StreetFashion",
    material: "Denim",
    featured: true,
    status: "active",
    tags: JSON.stringify(["áo khoác", "denim", "unisex", "vintage"]),
    suitability: JSON.stringify(["casual", "daily"]),
    subtype: "JACKET",
  },
  {
    name: "Áo khoác bomber da nam",
    sku: "AK002",
    description: "Áo khoác bomber da PU cao cấp, lót lông ấm áp cho mùa đông",
    brand: "WinterStyle",
    material: "Faux Leather",
    featured: false,
    status: "active",
    tags: JSON.stringify(["áo khoác", "bomber", "da", "nam"]),
    suitability: JSON.stringify(["casual", "winter", "dating"]),
    subtype: "JACKET",
  },
  {
    name: "Quần jean nam straight fit",
    sku: "QD001",
    description:
      "Quần jean nam form straight fit, màu xanh đậm, chất liệu denim cao cấp",
    brand: "DenimPro",
    material: "Denim",
    featured: false,
    status: "active",
    tags: JSON.stringify(["quần jean", "nam", "straight fit"]),
    suitability: JSON.stringify(["casual", "daily"]),
    subtype: "PANTS",
  },
  {
    name: "Quần kaki nam slim fit",
    sku: "QD002",
    description: "Quần kaki nam form slim fit, kiểu dáng trẻ trung, thanh lịch",
    brand: "KakiStyle",
    material: "Cotton Twill",
    featured: true,
    status: "active",
    tags: JSON.stringify(["quần kaki", "nam", "slim fit"]),
    suitability: JSON.stringify(["office", "casual", "formal"]),
    subtype: "PANTS",
  },
  {
    name: "Quần short jean nam rách gối",
    sku: "QS001",
    description: "Quần short jean nam phong cách bụi bặm với chi tiết rách gối",
    brand: "StreetStyle",
    material: "Denim",
    featured: false,
    status: "active",
    tags: JSON.stringify(["quần short", "jean", "rách", "nam"]),
    suitability: JSON.stringify(["casual", "beach", "summer"]),
    subtype: "SHORTS",
  },
  {
    name: "Quần short thể thao nam",
    sku: "QS002",
    description: "Quần short thể thao nam thoáng mát, co giãn 4 chiều",
    brand: "SportPro",
    material: "Polyester Spandex",
    featured: true,
    status: "active",
    tags: JSON.stringify(["quần short", "thể thao", "nam"]),
    suitability: JSON.stringify(["sport", "gym", "running"]),
    subtype: "SHORTS",
  },
];

// 5. ProductDetails - Đã cập nhật các chi tiết sản phẩm
const productDetails = [
  // Áo thun nam basic cotton
  {
    productId: 1,
    color: "black",
    price: 199000,
    originalPrice: 250000,
  },
  {
    productId: 1,
    color: "navy",
    price: 199000,
    originalPrice: 250000,
  },
  {
    productId: 1,
    color: "brown",
    price: 199000,
    originalPrice: 250000,
  },

  // Áo thun polo pique nam
  {
    productId: 2,
    color: "black",
    price: 329000,
    originalPrice: 399000,
  },
  {
    productId: 2,
    color: "navy",
    price: 329000,
    originalPrice: 399000,
  },
  {
    productId: 2,
    color: "white",
    price: 329000,
    originalPrice: 399000,
  },

  // Áo sơ mi nam kẻ caro
  {
    productId: 3,
    color: "blue",
    price: 349000,
    originalPrice: 450000,
  },

  // Áo sơ mi nam Oxford dài tay
  {
    productId: 4,
    color: "white",
    price: 399000,
    originalPrice: 499000,
  },

  // Áo khoác denim unisex
  {
    productId: 5,
    color: "blue",
    price: 599000,
    originalPrice: 699000,
  },

  // Áo khoác bomber da nam
  {
    productId: 6,
    color: "black",
    price: 799000,
    originalPrice: 999000,
  },

  // Quần jean nam straight fit
  {
    productId: 7,
    color: "blue",
    price: 499000,
    originalPrice: 599000,
  },

  // Quần kaki nam slim fit
  {
    productId: 8,
    color: "beige",
    price: 399000,
    originalPrice: 459000,
  },

  // Quần short jean nam rách gối
  {
    productId: 9,
    color: "blue",
    price: 299000,
    originalPrice: 359000,
  },

  // Quần short thể thao nam
  {
    productId: 10,
    color: "black",
    price: 249000,
    originalPrice: 299000,
  },
];

// 6. ProductInventory - Kho hàng theo size
const productInventories = [
  // Áo thun nam basic cotton - Đen
  { productDetailId: 1, size: "S", stock: 100 },
  { productDetailId: 1, size: "M", stock: 150 },
  { productDetailId: 1, size: "L", stock: 120 },
  { productDetailId: 1, size: "XL", stock: 80 },

  // Áo thun nam basic cotton - Navy
  { productDetailId: 2, size: "S", stock: 90 },
  { productDetailId: 2, size: "M", stock: 130 },
  { productDetailId: 2, size: "L", stock: 100 },
  { productDetailId: 2, size: "XL", stock: 70 },

  // Áo thun nam basic cotton - Nâu
  { productDetailId: 3, size: "S", stock: 85 },
  { productDetailId: 3, size: "M", stock: 120 },
  { productDetailId: 3, size: "L", stock: 95 },
  { productDetailId: 3, size: "XL", stock: 65 },

  // Áo thun polo pique nam - Đen
  { productDetailId: 4, size: "S", stock: 45 },
  { productDetailId: 4, size: "M", stock: 65 },
  { productDetailId: 4, size: "L", stock: 55 },
  { productDetailId: 4, size: "XL", stock: 35 },

  // Áo thun polo pique nam - Navy
  { productDetailId: 5, size: "S", stock: 50 },
  { productDetailId: 5, size: "M", stock: 70 },
  { productDetailId: 5, size: "L", stock: 60 },
  { productDetailId: 5, size: "XL", stock: 0 }, // Hết hàng

  // Áo thun polo pique nam - Trắng
  { productDetailId: 6, size: "S", stock: 40 },
  { productDetailId: 6, size: "M", stock: 60 },
  { productDetailId: 6, size: "L", stock: 50 },
  { productDetailId: 6, size: "XL", stock: 30 },

  // Áo sơ mi nam kẻ caro
  { productDetailId: 7, size: "S", stock: 35 },
  { productDetailId: 7, size: "M", stock: 55 },
  { productDetailId: 7, size: "L", stock: 45 },
  { productDetailId: 7, size: "XL", stock: 25 },

  // Áo sơ mi nam Oxford dài tay
  { productDetailId: 8, size: "S", stock: 40 },
  { productDetailId: 8, size: "M", stock: 60 },
  { productDetailId: 8, size: "L", stock: 50 },
  { productDetailId: 8, size: "XL", stock: 30 },

  // Áo khoác denim unisex
  { productDetailId: 9, size: "S", stock: 30 },
  { productDetailId: 9, size: "M", stock: 50 },
  { productDetailId: 9, size: "L", stock: 40 },
  { productDetailId: 9, size: "XL", stock: 20 },

  // Áo khoác bomber da nam
  { productDetailId: 10, size: "S", stock: 25 },
  { productDetailId: 10, size: "M", stock: 45 },
  { productDetailId: 10, size: "L", stock: 35 },
  { productDetailId: 10, size: "XL", stock: 15 },

  // Quần jean nam straight fit
  { productDetailId: 11, size: "28", stock: 30 },
  { productDetailId: 11, size: "29", stock: 45 },
  { productDetailId: 11, size: "30", stock: 60 },
  { productDetailId: 11, size: "31", stock: 50 },
  { productDetailId: 11, size: "32", stock: 45 },
  { productDetailId: 11, size: "33", stock: 35 },

  // Quần kaki nam slim fit
  { productDetailId: 12, size: "28", stock: 35 },
  { productDetailId: 12, size: "29", stock: 50 },
  { productDetailId: 12, size: "30", stock: 65 },
  { productDetailId: 12, size: "31", stock: 55 },
  { productDetailId: 12, size: "32", stock: 50 },
  { productDetailId: 12, size: "33", stock: 40 },

  // Quần short jean nam rách gối
  { productDetailId: 13, size: "28", stock: 40 },
  { productDetailId: 13, size: "29", stock: 55 },
  { productDetailId: 13, size: "30", stock: 70 },
  { productDetailId: 13, size: "31", stock: 60 },
  { productDetailId: 13, size: "32", stock: 55 },

  // Quần short thể thao nam
  { productDetailId: 14, size: "S", stock: 45 },
  { productDetailId: 14, size: "M", stock: 65 },
  { productDetailId: 14, size: "L", stock: 55 },
  { productDetailId: 14, size: "XL", stock: 40 },
];

// 7. ProductImage - Mỗi variant có đúng 2 hình ảnh
const productImages = [
  // Áo thun nam basic cotton - Đen (productDetailId: 1)
  {
    productDetailId: 1,
    url: `${S3_BASE_URL}/products/28b5ceed-2777caa1_1305_41cf_93a8_c7fe2956d5a6.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 1,
    url: `${S3_BASE_URL}/products/7f4611fa-8d89-42fa-be17-810a1776a725.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo thun nam basic cotton - Navy (productDetailId: 2)
  {
    productDetailId: 2,
    url: `${S3_BASE_URL}/products/7f4611fa-8d89-42fa-be17-810a1776a725.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 2,
    url: `${S3_BASE_URL}/products/89ff0371-dbb5-42b7-93f3-c31b18b52076.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo thun nam basic cotton - Nâu (productDetailId: 3)
  {
    productDetailId: 3,
    url: `${S3_BASE_URL}/products/d7c6d71c-at.220.nau.1.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 3,
    url: `${S3_BASE_URL}/products/d8776765-at.220.nau.2.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo thun polo pique nam - Đen (productDetailId: 4)
  {
    productDetailId: 4,
    url: `${S3_BASE_URL}/products/28b5ceed-2777caa1_1305_41cf_93a8_c7fe2956d5a6.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 4,
    url: `${S3_BASE_URL}/products/269ea64b-55b9b941_9b8e_4c6a_a35b_ee9806f43c5e.jpg`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo thun polo pique nam - Navy (productDetailId: 5)
  {
    productDetailId: 5,
    url: `${S3_BASE_URL}/products/bf57a1f6-0caa25aa_238a_4e5c_b4bc_62a1e3a03107.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 5,
    url: `${S3_BASE_URL}/products/b31e541f-3bc3efb5_86f8_4f30_8f8f_d607dc06b109.jpg`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo thun polo pique nam - Trắng (productDetailId: 6)
  {
    productDetailId: 6,
    url: `${S3_BASE_URL}/products/269ea64b-55b9b941_9b8e_4c6a_a35b_ee9806f43c5e.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 6,
    url: `${S3_BASE_URL}/products/28b5ceed-2777caa1_1305_41cf_93a8_c7fe2956d5a6.jpg`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo sơ mi nam kẻ caro (productDetailId: 7)
  {
    productDetailId: 7,
    url: `${S3_BASE_URL}/products/89ff0371-dbb5-42b7-93f3-c31b18b52076.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 7,
    url: `${S3_BASE_URL}/products/bf57a1f6-0caa25aa_238a_4e5c_b4bc_62a1e3a03107.jpg`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo sơ mi nam Oxford dài tay (productDetailId: 8)
  {
    productDetailId: 8,
    url: `${S3_BASE_URL}/products/7f4611fa-8d89-42fa-be17-810a1776a725.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 8,
    url: `${S3_BASE_URL}/products/3b4f27d6-at.220.nau.2.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo khoác denim unisex (productDetailId: 9)
  {
    productDetailId: 9,
    url: `${S3_BASE_URL}/products/b31e541f-3bc3efb5_86f8_4f30_8f8f_d607dc06b109.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 9,
    url: `${S3_BASE_URL}/products/bf57a1f6-0caa25aa_238a_4e5c_b4bc_62a1e3a03107.jpg`,
    isMain: false,
    displayOrder: 1,
  },

  // Áo khoác bomber da nam (productDetailId: 10)
  {
    productDetailId: 10,
    url: `${S3_BASE_URL}/products/bf57a1f6-0caa25aa_238a_4e5c_b4bc_62a1e3a03107.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 10,
    url: `${S3_BASE_URL}/products/28b5ceed-2777caa1_1305_41cf_93a8_c7fe2956d5a6.jpg`,
    isMain: false,
    displayOrder: 1,
  },

  // Quần jean nam straight fit (productDetailId: 11)
  {
    productDetailId: 11,
    url: `${S3_BASE_URL}/products/89ff0371-dbb5-42b7-93f3-c31b18b52076.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 11,
    url: `${S3_BASE_URL}/products/d7c6d71c-at.220.nau.1.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Quần kaki nam slim fit (productDetailId: 12)
  {
    productDetailId: 12,
    url: `${S3_BASE_URL}/products/28b5ceed-2777caa1_1305_41cf_93a8_c7fe2956d5a6.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 12,
    url: `${S3_BASE_URL}/products/59441aca-at.220.nau.1.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Quần short jean nam rách gối (productDetailId: 13)
  {
    productDetailId: 13,
    url: `${S3_BASE_URL}/products/269ea64b-55b9b941_9b8e_4c6a_a35b_ee9806f43c5e.jpg`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 13,
    url: `${S3_BASE_URL}/products/89ff0371-dbb5-42b7-93f3-c31b18b52076.webp`,
    isMain: false,
    displayOrder: 1,
  },

  // Quần short thể thao nam (productDetailId: 14)
  {
    productDetailId: 14,
    url: `${S3_BASE_URL}/products/d7c6d71c-at.220.nau.1.webp`,
    isMain: true,
    displayOrder: 0,
  },
  {
    productDetailId: 14,
    url: `${S3_BASE_URL}/products/d8776765-at.220.nau.2.webp`,
    isMain: false,
    displayOrder: 1,
  },
];

// 8. ProductCategory
const productCategories = [
  // Áo thun nam basic cotton
  { productId: 1, categoryId: 1 }, // Áo
  { productId: 1, categoryId: 6 }, // Hàng mới

  // Áo thun polo pique nam
  { productId: 2, categoryId: 1 }, // Áo
  { productId: 2, categoryId: 6 }, // Hàng mới

  // Áo sơ mi nam kẻ caro
  { productId: 3, categoryId: 1 }, // Áo

  // Áo sơ mi nam Oxford dài tay
  { productId: 4, categoryId: 1 }, // Áo
  { productId: 4, categoryId: 6 }, // Hàng mới

  // Áo khoác denim unisex
  { productId: 5, categoryId: 1 }, // Áo
  { productId: 5, categoryId: 5 }, // Sale

  // Áo khoác bomber da nam
  { productId: 6, categoryId: 1 }, // Áo
  { productId: 6, categoryId: 5 }, // Sale

  // Quần jean nam straight fit
  { productId: 7, categoryId: 2 }, // Quần

  // Quần kaki nam slim fit
  { productId: 8, categoryId: 2 }, // Quần
  { productId: 8, categoryId: 6 }, // Hàng mới

  // Quần short jean nam rách gối
  { productId: 9, categoryId: 2 }, // Quần

  // Quần short thể thao nam
  { productId: 10, categoryId: 2 }, // Quần
  { productId: 10, categoryId: 6 }, // Hàng mới
];

// 9. PaymentMethods
const paymentMethods = [
  { name: "COD" },
  { name: "Credit Card" },
  { name: "Internet Banking" },
  { name: "Momo" },
];

// 10. PaymentStatus
const paymentStatuses = [
  { name: "Pending", description: "Pending" },
  { name: "Paid", description: "Paid" },
  { name: "Failed", description: "Failed" },
  { name: "Refunded", description: "Refunded" },
];

// 11. Vouchers
const vouchers = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    expirationDate: new Date(2025, 11, 31),
  },
  {
    code: "SUMMER20",
    type: "percentage",
    value: 20,
    expirationDate: new Date(2025, 8, 31),
  },
  {
    code: "DISCOUNT50K",
    type: "fixed",
    value: 50000,
    expirationDate: new Date(2025, 9, 30),
  },
];

// 12. UserAddress
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
  userAddresses,
};
