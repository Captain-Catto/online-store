"use client";

import React, { memo } from "react";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = memo(
  ({ isOpen, title, message, onConfirm, onCancel }) => {
    return (
      <ConfirmModal
        isOpen={isOpen}
        title={title}
        message={message}
        confirmLabel="Xóa"
        confirmButtonClass="btn-danger"
        cancelLabel="Hủy"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }
);

DeleteConfirmationModal.displayName = "DeleteConfirmationModal";

export default DeleteConfirmationModal;
