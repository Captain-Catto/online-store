"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserNote = exports.deleteUserNote = exports.getUserNotes = exports.addUserNote = void 0;
const UserNotes_1 = __importDefault(require("../models/UserNotes"));
const Users_1 = __importDefault(require("../models/Users"));
/**
 * Thêm ghi chú mới cho user
 */
const addUserNote = async (req, res) => {
    try {
        const { id } = req.params; // userId
        const { note } = req.body;
        if (!note) {
            res.status(400).json({ message: "Nội dung ghi chú không được để trống" });
            return;
        }
        // Kiểm tra người dùng tồn tại
        const user = await Users_1.default.findByPk(id);
        if (!user) {
            res.status(404).json({ message: "Người dùng không tồn tại" });
            return;
        }
        // Tạo ghi chú mới
        const userNote = await UserNotes_1.default.create({
            userId: Number(id),
            note,
        });
        res.status(201).json({
            message: "Thêm ghi chú thành công",
            note: userNote,
        });
    }
    catch (error) {
        console.error("Error adding user note:", error);
        res.status(500).json({
            message: "Lỗi khi thêm ghi chú",
            error: error.message,
        });
    }
};
exports.addUserNote = addUserNote;
/**
 * Lấy danh sách ghi chú của user
 */
const getUserNotes = async (req, res) => {
    try {
        const { id } = req.params; // userId
        // Kiểm tra người dùng tồn tại
        const user = await Users_1.default.findByPk(id);
        if (!user) {
            res.status(404).json({ message: "Người dùng không tồn tại" });
            return;
        }
        // Lấy tất cả ghi chú của người dùng
        const notes = await UserNotes_1.default.findAll({
            where: { userId: id },
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
            userId: id,
            username: user.username,
            notes,
        });
    }
    catch (error) {
        console.error("Error fetching user notes:", error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách ghi chú",
            error: error.message,
        });
    }
};
exports.getUserNotes = getUserNotes;
/**
 * Xóa ghi chú
 */
const deleteUserNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        // Tìm ghi chú
        const note = await UserNotes_1.default.findByPk(noteId);
        if (!note) {
            res.status(404).json({ message: "Ghi chú không tồn tại" });
            return;
        }
        // Xóa ghi chú
        await note.destroy();
        res.status(200).json({
            message: "Xóa ghi chú thành công",
            noteId: Number(noteId),
        });
    }
    catch (error) {
        console.error("Error deleting user note:", error);
        res.status(500).json({
            message: "Lỗi khi xóa ghi chú",
            error: error.message,
        });
    }
};
exports.deleteUserNote = deleteUserNote;
/**
 * Cập nhật ghi chú
 */
const updateUserNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { note } = req.body;
        if (!note) {
            res.status(400).json({ message: "Nội dung ghi chú không được để trống" });
            return;
        }
        // Tìm ghi chú
        const existingNote = await UserNotes_1.default.findByPk(noteId);
        if (!existingNote) {
            res.status(404).json({ message: "Ghi chú không tồn tại" });
            return;
        }
        // Cập nhật ghi chú
        await existingNote.update({ note });
        res.status(200).json({
            message: "Cập nhật ghi chú thành công",
            note: existingNote,
        });
    }
    catch (error) {
        console.error("Error updating user note:", error);
        res.status(500).json({
            message: "Lỗi khi cập nhật ghi chú",
            error: error.message,
        });
    }
};
exports.updateUserNote = updateUserNote;
