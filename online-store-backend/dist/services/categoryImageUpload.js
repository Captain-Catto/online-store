"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.upload = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const uuid_1 = require("uuid");
// Tái sử dụng S3Client từ imageUpload.ts
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
// Cấu hình multer cho category images
exports.upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.S3_BUCKET || "",
        acl: "public-read",
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const uniqueId = (0, uuid_1.v4)().slice(0, 8);
            const cleanFileName = file.originalname
                .replace(/[^a-zA-Z0-9.]/g, "_")
                .toLowerCase();
            const fileName = `categories/${uniqueId}-${cleanFileName}`; // Thay đổi folder path thành categories
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Định dạng file không được hỗ trợ. Chỉ hỗ trợ JPEG, PNG, WEBP và GIF."));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
}).single("image");
// Hàm xóa file từ S3 (sử dụng nếu cần xóa ảnh cũ)
const deleteFile = async (fileUrl) => {
    try {
        const { DeleteObjectCommand } = await Promise.resolve().then(() => __importStar(require("@aws-sdk/client-s3")));
        // Trích xuất key từ URL
        const urlParts = fileUrl.split("/");
        const key = urlParts.slice(3).join("/"); // Bỏ qua phần domain
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET || "",
            Key: key,
        });
        await s3.send(command);
        return true;
    }
    catch (error) {
        console.error("Error deleting file from S3:", error);
        return false;
    }
};
exports.deleteFile = deleteFile;
