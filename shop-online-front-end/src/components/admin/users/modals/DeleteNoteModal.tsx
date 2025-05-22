import React from "react";

interface DeleteNoteModalProps {
  isSubmittingNote: boolean;
  notesError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteNoteModal = ({
  isSubmittingNote,
  notesError,
  onConfirm,
  onCancel,
}: DeleteNoteModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Xác nhận xóa</h3>
        <p className="mb-6">
          Bạn có chắc chắn muốn xóa ghi chú này? Hành động này không thể hoàn
          tác.
        </p>

        {notesError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {notesError}
          </div>
        )}

        <div className="flex justify-end gap-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmittingNote}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
            disabled={isSubmittingNote}
          >
            {isSubmittingNote ? (
              <>
                <span
                  className="spinner-border spinner-border-sm mr-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang xử lý...
              </>
            ) : (
              "Xóa ghi chú"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteNoteModal;
