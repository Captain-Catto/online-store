import { Request, Response } from "express";
import UserNote from "../models/UserNotes";
import Users from "../models/Users";

/**
 * Thêm ghi chú mới cho user
 */
export const addUserNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // userId
    const { note } = req.body;

    if (!note) {
      res.status(400).json({ message: "Nội dung ghi chú không được để trống" });
      return;
    }

    // Kiểm tra người dùng tồn tại
    const user = await Users.findByPk(id);
    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại" });
      return;
    }

    // Tạo ghi chú mới
    const userNote = await UserNote.create({
      userId: Number(id),
      note,
    });

    res.status(201).json({
      message: "Thêm ghi chú thành công",
      note: userNote,
    });
  } catch (error: any) {
    console.error("Error adding user note:", error);
    res.status(500).json({
      message: "Lỗi khi thêm ghi chú",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách ghi chú của user
 */
export const getUserNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // userId

    // Kiểm tra người dùng tồn tại
    const user = await Users.findByPk(id);
    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại" });
      return;
    }

    // Lấy tất cả ghi chú của người dùng
    const notes = await UserNote.findAll({
      where: { userId: id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      userId: id,
      username: user.username,
      notes,
    });
  } catch (error: any) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ghi chú",
      error: error.message,
    });
  }
};

/**
 * Xóa ghi chú
 */
export const deleteUserNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;

    // Tìm ghi chú
    const note = await UserNote.findByPk(noteId);
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
  } catch (error: any) {
    console.error("Error deleting user note:", error);
    res.status(500).json({
      message: "Lỗi khi xóa ghi chú",
      error: error.message,
    });
  }
};

/**
 * Cập nhật ghi chú
 */
export const updateUserNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { note } = req.body;

    if (!note) {
      res.status(400).json({ message: "Nội dung ghi chú không được để trống" });
      return;
    }

    // Tìm ghi chú
    const existingNote = await UserNote.findByPk(noteId);
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
  } catch (error: any) {
    console.error("Error updating user note:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật ghi chú",
      error: error.message,
    });
  }
};
