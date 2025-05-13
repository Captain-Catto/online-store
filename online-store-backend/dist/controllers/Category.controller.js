"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryBreadcrumb = exports.getSubCategories = exports.getProductsByCategorySlug = exports.getCategoryBySlug = exports.getNavCategories = exports.getAllCategories = exports.deleteCategory = exports.getCategoryById = exports.updateCategory = exports.createCategory = void 0;
const sequelize_1 = require("sequelize");
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const ProductInventory_1 = __importDefault(require("../models/ProductInventory"));
const ProductImage_1 = __importDefault(require("../models/ProductImage"));
const Suitability_1 = __importDefault(require("../models/Suitability"));
const categoryImageUpload_1 = require("../services/categoryImageUpload");
// Tạo mới một category với upload ảnh lên S3
const createCategory = async (req, res) => {
    (0, categoryImageUpload_1.upload)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
        }
        try {
            const { name, slug, description, parentId, isActive } = req.body;
            // Kiểm tra nếu Category đã tồn tại
            const existingCategory = await Category_1.default.findOne({ where: { slug } });
            if (existingCategory) {
                return res.status(400).json({ message: "Slug danh mục đã tồn tại" });
            }
            // Lấy URL hình ảnh từ S3 nếu có upload
            const file = req.file;
            const imageUrl = file ? file.location : null; // multer-s3 tự động cung cấp location là URL của file
            const newCategory = await Category_1.default.create({
                name,
                slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
                description,
                parentId: parentId || null,
                image: imageUrl, // Lưu toàn bộ S3 URL vào database
                isActive: isActive === "true" || isActive === true,
            });
            res.status(201).json(newCategory);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
exports.createCategory = createCategory;
// Cập nhật function updateCategory để sử dụng S3
const updateCategory = async (req, res) => {
    (0, categoryImageUpload_1.upload)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
        }
        try {
            const { id } = req.params;
            const { name, slug, description, parentId, isActive } = req.body;
            const category = await Category_1.default.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Danh mục không tồn tại" });
            }
            // Kiểm tra slug trùng lặp (trừ slug hiện tại)
            if (slug && slug !== category.slug) {
                const existingCategory = await Category_1.default.findOne({
                    where: {
                        slug,
                        id: { [sequelize_1.Op.ne]: id },
                    },
                });
                if (existingCategory) {
                    return res.status(400).json({ message: "Slug danh mục đã tồn tại" });
                }
            }
            // Tạo object cập nhật
            const updateData = {
                name: name || category.name,
                slug: slug || category.slug,
                description,
                parentId: parentId !== undefined ? parentId || null : category.parentId,
                isActive: isActive !== undefined ? isActive === "true" : category.isActive,
            };
            // Nếu có upload file mới
            const file = req.file;
            if (file) {
                // Xóa ảnh cũ trên S3 nếu có
                if (category.image &&
                    category.image.includes(process.env.S3_BUCKET || "")) {
                    await (0, categoryImageUpload_1.deleteFile)(category.image);
                }
                // Cập nhật URL mới
                updateData.image = file.location;
            }
            // Cập nhật category
            await category.update(updateData);
            res.status(200).json({ message: "Cập nhật thành công", category });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
exports.updateCategory = updateCategory;
// lấy chi tiết một category theo ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByPk(id, {
            attributes: [
                "id",
                "name",
                "slug",
                "description",
                "image",
                "parentId",
                "isActive",
            ],
            include: [
                {
                    model: Category_1.default,
                    as: "children",
                    attributes: ["id", "name", "slug", "isActive"],
                    where: { isActive: true },
                    required: false, // LEFT JOIN
                },
            ],
        });
        if (!category) {
            res.status(404).json({ message: "Danh mục không tồn tại" });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCategoryById = getCategoryById;
// Xóa category và hình ảnh S3 kèm theo
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByPk(id);
        if (!category) {
            res.status(404).json({ message: "Category không tồn tại" });
            return;
        }
        // Xóa hình ảnh trên S3 nếu có
        if (category.image &&
            category.image.includes(process.env.S3_BUCKET || "")) {
            await (0, categoryImageUpload_1.deleteFile)(category.image);
        }
        // Xóa Category
        await category.destroy();
        res.status(200).json({ message: "Xóa Category thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteCategory = deleteCategory;
// lấy tất cả categories và subtypes kể cả không active
const getAllCategories = async (req, res) => {
    try {
        // Lấy tất cả các danh mục
        const categories = await Category_1.default.findAll({
            attributes: [
                "id",
                "name",
                "slug",
                "description",
                "image",
                "parentId",
                "isActive",
            ],
            order: [["name", "ASC"]],
        });
        // Sắp xếp thành cấu trúc cha-con
        const result = categories.reduce((acc, category) => {
            if (!category.parentId) {
                // Nếu là danh mục cha
                acc.push({
                    ...category.toJSON(),
                    children: categories
                        .filter((child) => child.parentId === category.id)
                        .map((child) => child.toJSON()),
                });
            }
            return acc;
        }, []);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllCategories = getAllCategories;
// Lấy danh mục cho navigation (danh mục cha và con)
const getNavCategories = async (req, res) => {
    try {
        // Lấy tất cả danh mục cha (parentId = null và isActive = true)
        const parentCategories = await Category_1.default.findAll({
            where: {
                parentId: null,
                isActive: true,
            },
            attributes: ["id", "name", "slug"],
            order: [["name", "ASC"]],
        });
        // Tạo mảng kết quả với cấu trúc phù hợp cho navbar
        const result = await Promise.all(parentCategories.map(async (parent) => {
            // Lấy tất cả danh mục con của danh mục cha hiện tại
            const childCategories = await Category_1.default.findAll({
                where: {
                    parentId: parent.id,
                    isActive: true,
                },
                attributes: ["id", "name", "slug"],
                order: [["name", "ASC"]],
            });
            return {
                id: parent.id,
                name: parent.name,
                slug: parent.slug,
                children: childCategories.map((child) => ({
                    id: child.id,
                    name: child.name,
                    slug: child.slug,
                })),
            };
        }));
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Lỗi khi lấy danh mục cho navbar:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getNavCategories = getNavCategories;
// Lấy danh mục theo slug
const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await Category_1.default.findOne({
            where: { slug, isActive: true },
            attributes: [
                "id",
                "name",
                "slug",
                "description",
                "image",
                "parentId",
                "isActive",
            ],
            include: [
                {
                    model: Category_1.default,
                    as: "children",
                    attributes: ["id", "name", "slug", "isActive"],
                    where: { isActive: true },
                    required: false,
                },
            ],
        });
        if (!category) {
            res.status(404).json({ message: "Danh mục không tồn tại" });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
// Lấy sản phẩm theo slug của danh mục
const getProductsByCategorySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        // Filter parameters
        const color = req.query.color;
        const sizeParam = req.query.size;
        const sizes = sizeParam ? sizeParam.split(",") : [];
        const brand = req.query.brand;
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || 9999999999;
        const featured = req.query.featured === "true" ? true : undefined;
        const sort = req.query.sort || "createdAt";
        const suitabilityParam = req.query.suitability;
        const suitabilities = suitabilityParam ? suitabilityParam.split(",") : [];
        const childCategorySlug = req.query.childCategory;
        // nếu không có slug thì lấy hết categories
        if (!slug) {
            const categories = await Category_1.default.findAll({
                where: { isActive: true },
                attributes: ["id", "name", "slug"],
            });
            res.status(200).json(categories);
            return;
        }
        // Tìm category theo slug
        const category = await Category_1.default.findOne({
            where: { slug, isActive: true },
            include: [
                {
                    model: Category_1.default,
                    as: "parent",
                    attributes: ["id", "name", "slug"],
                    required: false,
                },
            ],
        });
        if (!category) {
            res.status(404).json({ message: "Danh mục không tồn tại" });
            return;
        }
        // Lấy tất cả ID danh mục (bao gồm danh mục con)
        let categoryIds = [category.id];
        // Xử lý childCategorySlug
        if (category.parentId === null) {
            // Nếu là danh mục cha
            if (childCategorySlug) {
                // Tìm danh mục con theo slug
                const childCategory = await Category_1.default.findOne({
                    where: {
                        slug: childCategorySlug,
                        parentId: category.id,
                        isActive: true,
                    },
                });
                if (childCategory) {
                    // Nếu tìm thấy, chỉ lọc theo danh mục con này
                    console.log(`Tìm thấy danh mục con: ${childCategory.name} (ID: ${childCategory.id})`);
                    categoryIds = [childCategory.id];
                }
                else {
                    console.log(`Không tìm thấy danh mục con với slug: ${childCategorySlug}`);
                }
            }
            else {
                // Nếu không có childCategorySlug, lấy tất cả sản phẩm của danh mục cha và con
                const childCategories = await Category_1.default.findAll({
                    where: { parentId: category.id, isActive: true },
                    attributes: ["id"],
                });
                categoryIds = [
                    category.id,
                    ...childCategories.map((child) => child.id),
                ];
            }
        }
        else {
            // Nếu là danh mục con, chỉ lấy sản phẩm của danh mục này
            categoryIds = [category.id];
        }
        // Xây dựng điều kiện lọc cho sản phẩm
        const productWhere = {
            status: { [sequelize_1.Op.ne]: "draft" }, // Chỉ lấy sản phẩm không phải là bản nháp
        };
        if (brand)
            productWhere.brand = brand;
        if (featured !== undefined)
            productWhere.featured = featured;
        // Xây dựng điều kiện lọc cho product details
        const detailWhere = {};
        if (color)
            detailWhere.color = color;
        // Xây dựng điều kiện giá
        if (minPrice > 0 || maxPrice < 9999999999) {
            detailWhere.price = {
                [sequelize_1.Op.between]: [minPrice, maxPrice],
            };
        }
        // Xây dựng điều kiện lọc cho inventories
        const inventoryWhere = {};
        if (sizes.length > 0) {
            inventoryWhere.size = { [sequelize_1.Op.in]: sizes };
            inventoryWhere.stock = { [sequelize_1.Op.gt]: 0 }; // Chỉ lấy size còn hàng
        }
        // Xác định thứ tự sắp xếp
        let order = [];
        // Sắp xếp theo giá là trường hợp đặc biệt vì giá nằm trong ProductDetail
        if (sort) {
            const [field, direction] = sort.split("_");
            const validFields = ["name", "createdAt", "price", "featured"];
            const validDirections = ["asc", "desc"];
            if (validFields.includes(field) &&
                validDirections.includes(direction?.toLowerCase())) {
                if (field === "price") {
                    // Sắp xếp theo giá
                    order = [
                        [
                            { model: ProductDetail_1.default, as: "details" },
                            "price",
                            direction.toUpperCase(),
                        ],
                    ];
                }
                else {
                    order = [[field, direction.toUpperCase()]];
                }
            }
        }
        // Lấy sản phẩm theo danh mục với các điều kiện lọc
        const { count, rows: products } = await Product_1.default.findAndCountAll({
            where: productWhere,
            include: [
                {
                    model: Category_1.default,
                    as: "categories",
                    where: { id: { [sequelize_1.Op.in]: categoryIds } },
                    attributes: ["id", "name", "slug"],
                    through: { attributes: [] },
                },
                {
                    model: ProductDetail_1.default,
                    as: "details",
                    attributes: ["id", "productId", "color", "price", "originalPrice"],
                    where: Object.keys(detailWhere).length > 0 ? detailWhere : undefined,
                    include: [
                        {
                            model: ProductInventory_1.default,
                            as: "inventories",
                            attributes: ["id", "productDetailId", "size", "stock"],
                            where: Object.keys(inventoryWhere).length > 0
                                ? inventoryWhere
                                : undefined,
                            required: sizes.length > 0, // Chỉ yêu cầu nếu có lọc size
                        },
                        {
                            model: ProductImage_1.default,
                            as: "images",
                            attributes: ["id", "productDetailId", "url", "isMain"],
                        },
                    ],
                    required: Object.keys(detailWhere).length > 0 || sizes.length > 0,
                },
                {
                    model: Suitability_1.default,
                    as: "suitabilities",
                    attributes: ["id", "name"],
                    through: { attributes: [] },
                    required: suitabilities.length > 0,
                    where: suitabilities.length > 0
                        ? { name: { [sequelize_1.Op.in]: suitabilities } }
                        : undefined,
                },
            ],
            order,
            limit,
            offset,
            distinct: true,
        });
        // Format dữ liệu sản phẩm để dễ sử dụng ở frontend
        const formattedProducts = products.map((product) => {
            const productData = product.toJSON();
            // Tổng hợp thông tin màu sắc, kích thước, hình ảnh
            const colors = [
                ...new Set(productData.details.map((detail) => detail.color)),
            ];
            const sizes = [
                ...new Set(productData.details.flatMap((detail) => detail.inventories.map((inv) => inv.size))),
            ];
            // Lấy hình ảnh chính
            const mainImages = productData.details
                .flatMap((detail) => detail.images)
                .filter((image) => image.isMain);
            // lấy thêm 1 ảnh phụ
            const subImage = productData.details
                .flatMap((detail) => detail.images)
                .filter((image) => !image.isMain)
                .slice(0, 1); // Lấy 1 ảnh phụ đầu tiên
            const mainImage = mainImages.length > 0 ? mainImages[0].url : null;
            // Tính giá thấp nhất, cao nhất
            const prices = productData.details.map((detail) => detail.price);
            const originalPrices = productData.details.map((detail) => detail.originalPrice);
            const minProductPrice = Math.min(...prices);
            const maxProductPrice = Math.max(...prices);
            return {
                id: productData.id,
                name: productData.name,
                sku: productData.sku,
                slug: productData.slug,
                description: productData.description,
                brand: productData.brand,
                featured: productData.featured,
                status: productData.status,
                mainImage,
                subImage,
                price: prices.length === 1 ? prices[0] : null,
                originalPrice: originalPrices.length === 1 ? originalPrices[0] : null,
                priceRange: prices.length > 1
                    ? {
                        min: minProductPrice,
                        max: maxProductPrice,
                    }
                    : null,
                colors,
                sizes,
                categories: productData.categories,
                suitabilities: productData.suitabilities || [],
                variants: productData.details.reduce((acc, detail) => {
                    // Map các kích thước và tồn kho cho mỗi màu
                    const sizeInventory = detail.inventories.reduce((invAcc, inv) => {
                        invAcc[inv.size] = inv.stock;
                        return invAcc;
                    }, {});
                    // Lấy danh sách các kích thước có sẵn (còn hàng)
                    const availableSizes = detail.inventories
                        .filter((inv) => inv.stock > 0)
                        .map((inv) => inv.size);
                    // Lấy hình ảnh cho màu này
                    const colorImages = detail.images.map((img) => ({
                        id: img.id,
                        url: img.url,
                        isMain: img.isMain,
                    }));
                    // Thêm thông tin variant vào object
                    acc[detail.color] = {
                        id: detail.id,
                        price: detail.price,
                        originalPrice: detail.originalPrice,
                        availableSizes,
                        inventory: sizeInventory,
                        images: colorImages,
                    };
                    return acc;
                }, {}),
            };
        });
        res.status(200).json({
            products: formattedProducts,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
            category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image: category.image,
                parentCategory: category.parentId
                    ? await Category_1.default.findByPk(category.parentId)
                    : null,
            },
            filters: {
                availableColors: [
                    ...new Set(products.flatMap((p) => (p.details ?? []).map((d) => d.color))),
                ],
                availableSizes: [
                    ...new Set(products.flatMap((p) => (p.details || []).flatMap((d) => (d.inventories || []).map((i) => i.size)))),
                ],
                priceRange: {
                    min: Math.min(...products.flatMap((p) => (p.details ?? []).map((d) => d.price))),
                    max: Math.max(...products.flatMap((p) => (p.details ?? []).map((d) => d.price))),
                },
                brands: [...new Set(products.map((p) => p.brand).filter(Boolean))],
                suitabilities: [
                    ...new Set(products.flatMap((p) => (p.suitabilities || []).map((s) => s.name))),
                ],
            },
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getProductsByCategorySlug = getProductsByCategorySlug;
// lấy các categories con của category cha
const getSubCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategories = await Category_1.default.findAll({
            where: { parentId: id, isActive: true },
            attributes: ["id", "name", "slug"],
        });
        if (!subCategories) {
            res.status(404).json({ message: "Không tìm thấy danh mục con" });
            return;
        }
        res.status(200).json(subCategories);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSubCategories = getSubCategories;
/**
 * Get category breadcrumb path
 */
const getCategoryBreadcrumb = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await Category_1.default.findOne({
            where: { slug },
            attributes: ["id", "name", "slug", "parentId"],
        });
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        // tạo breadcrumb mặc định
        const breadcrumb = [
            { label: "Trang chủ", href: "/", isLast: false },
        ];
        // Thêm parent category nếu có
        if (category.parentId) {
            const parentCategory = await Category_1.default.findByPk(category.parentId, {
                attributes: ["id", "name", "slug"],
            });
            if (parentCategory) {
                breadcrumb.push({
                    label: parentCategory.name,
                    href: `/category/${parentCategory.slug}`,
                });
            }
        }
        // Thêm category hiện tại
        breadcrumb.push({
            label: category.name,
            href: `/category/${slug}`,
            isLast: true,
        });
        res.status(200).json(breadcrumb);
    }
    catch (error) {
        console.error("Error generating category breadcrumb:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getCategoryBreadcrumb = getCategoryBreadcrumb;
