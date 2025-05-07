import React from "react";
import { UserAdminApi } from "@/types/user";
import { formatDateDisplay } from "@/utils/dateUtils";

interface UserInfoTabProps {
  user: UserAdminApi | null;
  isEditing?: boolean;
  editForm?: {
    username: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
  };
  isUpdating?: boolean;
  updateError?: string | null;
  handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveUser?: () => void;
  handleCancelEdit?: () => void;
}

const UserInfoTab = ({
  user,
  isEditing = false,
  editForm,
  isUpdating = false,
  updateError = null,
  handleInputChange,
  handleSaveUser,
  handleCancelEdit,
}: UserInfoTabProps) => {
  if (!user) return null;
  console.log(
    "UserInfoTab",
    user,
    isEditing,
    editForm,
    isUpdating,
    updateError
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Thông tin cá nhân</h3>
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500 w-1/3">
                Họ tên
              </td>
              <td className="py-3 text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={editForm?.username || ""}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isUpdating}
                  />
                ) : (
                  user?.username || "Chưa đặt tên"
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500">Email</td>
              <td className="py-3 text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm?.email || ""}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                    disabled={true}
                  />
                ) : (
                  user?.email
                )}
                {isEditing && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email không thể thay đổi
                  </p>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500">
                Điện thoại
              </td>
              <td className="py-3 text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editForm?.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isUpdating}
                  />
                ) : (
                  user?.phoneNumber || "Chưa cung cấp"
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500">
                Ngày sinh
              </td>
              <td className="py-3 text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editForm?.dateOfBirth || ""}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isUpdating}
                  />
                ) : (
                  formatDateDisplay(user?.dateOfBirth || "") || "Chưa cung cấp"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-3">Thông tin tài khoản</h3>
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500 w-1/3">
                ID tài khoản
              </td>
              <td className="py-3 text-sm text-gray-900">{user?.id}</td>
            </tr>
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500">
                Trạng thái
              </td>
              <td className="py-3 text-sm text-gray-900">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.isActive ? "bg-green-500" : "bg-red-500"
                  } text-white`}
                >
                  {user?.isActive ? "Đang hoạt động" : "Đã bị vô hiệu hóa"}
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500">
                Ngày đăng ký
              </td>
              <td className="py-3 text-sm text-gray-900">
                {formatDateDisplay(user?.createdAt || "")}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-sm font-medium text-gray-500">
                Chỉnh sửa lần cuối
              </td>
              <td className="py-3 text-sm text-gray-900">
                {user?.updatedAt && user.updatedAt !== user.createdAt
                  ? formatDateDisplay(user.updatedAt)
                  : "Chưa chỉnh sửa"}
              </td>
            </tr>
          </tbody>
        </table>

        {isEditing && (
          <div className="mt-6">
            {updateError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <i className="fas fa-exclamation-circle mr-2"></i> {updateError}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isUpdating}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoTab;
