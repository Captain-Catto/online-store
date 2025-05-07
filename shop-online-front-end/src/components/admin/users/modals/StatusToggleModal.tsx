import React from "react";
import { UserAdminApi } from "@/types/user";

interface StatusToggleModalProps {
  user: UserAdminApi | null;
  isStatusLoading: boolean;
  statusError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const StatusToggleModal = ({
  user,
  isStatusLoading,
  statusError,
  onConfirm,
  onCancel,
}: StatusToggleModalProps) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {user.isActive ? "Vô hiệu hóa tài khoản?" : "Kích hoạt tài khoản?"}
        </h3>
        <p className="mb-6">
          {user.isActive
            ? "Bạn có chắc chắn muốn vô hiệu hóa tài khoản này? Người dùng sẽ không thể đăng nhập vào hệ thống."
            : "Bạn có chắc chắn muốn kích hoạt tài khoản này? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống."}
        </p>

        {statusError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {statusError}
          </div>
        )}

        <div className="flex justify-end space-x-3 gap-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isStatusLoading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white ${
              user.isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={isStatusLoading}
          >
            {isStatusLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm mr-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang xử lý...
              </>
            ) : user.isActive ? (
              "Vô hiệu hóa"
            ) : (
              "Kích hoạt"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusToggleModal;
