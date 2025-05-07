import React from "react";
import { UserAdminApi } from "@/types/user";
import { formatDateDisplay } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currencyUtils";

interface UserProfileSummaryProps {
  user: UserAdminApi;
}

const UserProfileSummary = ({ user }: UserProfileSummaryProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="p-6 flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4 flex flex-col items-center">
          <h2 className="text-xl font-bold text-center">
            {user.username || "Chưa đặt tên"}
          </h2>
          <p className="text-gray-600 text-center">{user.email}</p>
          <span
            className={`mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              user.isActive ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {user.isActive ? "Đang hoạt động" : "Đã bị vô hiệu hóa"}
          </span>
        </div>
        <div className="md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-500 font-medium mb-2">
                Thông tin tài khoản
              </h3>
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 text-sm font-medium text-gray-500 w-1/3">
                      ID
                    </td>
                    <td className="py-2 text-sm text-gray-900">{user.id}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sm font-medium text-gray-500">
                      Điện thoại
                    </td>
                    <td className="py-2 text-sm text-gray-900">
                      {user.phoneNumber || "Chưa cung cấp"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sm font-medium text-gray-500">
                      Ngày đăng ký
                    </td>
                    <td className="py-2 text-sm text-gray-900">
                      {formatDateDisplay(user.createdAt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-gray-500 font-medium mb-2">
                Thống kê mua hàng
              </h3>
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 text-sm font-medium text-gray-500 w-1/2">
                      Tổng đơn hàng
                    </td>
                    <td className="py-2 text-sm text-gray-900">
                      {user.totalOrders || 0} đơn
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sm font-medium text-gray-500">
                      Tổng chi tiêu
                    </td>
                    <td className="py-2 text-sm text-gray-900">
                      {formatCurrency(user.totalSpent || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSummary;
