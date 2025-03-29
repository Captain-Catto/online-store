import React from "react";

// Types
interface User {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
}

interface Order {
  id: string;
  date: string;
  status: "Đã giao" | "Đang vận chuyển" | "Đã hủy" | "Chờ xác nhận";
  total: string;
}

interface Address {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

interface Promotion {
  id: string;
  title: string;
  expiry: string;
  code: string;
}

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    <span className="ml-3 text-gray-700">Đang tải dữ liệu...</span>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm text-center flex flex-col items-center justify-center h-full">
    <div className="text-gray-400 mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
    <p className="text-gray-600">{message}</p>
  </div>
);

// Component thông tin tài khoản
const AccountInfo: React.FC<{ data?: User | null }> = ({ data }) => {
  // Sử dụng dữ liệu từ API hoặc giá trị rỗng nếu chưa có
  const user = data || {
    name: "",
    email: "",
    phone: "",
    birthdate: "",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Thông tin tài khoản</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Họ tên
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nguyễn Văn A"
                defaultValue={user.name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="example@gmail.com"
                defaultValue={user.email}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0123456789"
                defaultValue={user.phone}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày sinh
              </label>
              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                defaultValue={user.birthdate}
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
            Cập nhật thông tin
          </button>
        </div>
      </div>
    </div>
  );
};

// Component đơn hàng
const MyOrders: React.FC<{ data?: Order[] | null }> = ({ data }) => {
  // Sử dụng dữ liệu từ API hoặc mẫu nếu không có
  const orders = data || [];

  if (orders.length === 0) {
    return <EmptyState message="Bạn chưa có đơn hàng nào." />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Đơn hàng của tôi</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      order.status === "Đã giao"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Đang vận chuyển"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Chờ xác nhận"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-900">
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component địa chỉ
const Addresses: React.FC<{ data?: Address[] | null }> = ({ data }) => {
  // Sử dụng dữ liệu từ API hoặc mẫu nếu không có
  const addresses = data || [];

  if (addresses.length === 0) {
    return (
      <EmptyState message="Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ." />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Địa chỉ của tôi</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 relative">
              {address.isDefault && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Mặc định
                </span>
              )}
              <h3 className="font-bold">{address.name}</h3>
              <p className="text-gray-600">{address.address}</p>
              <p className="text-gray-600">
                {address.district}, {address.city}
              </p>
              <p className="text-gray-600">Điện thoại: {address.phone}</p>
              <div className="mt-4 flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm">
                  Chỉnh sửa
                </button>
                <button className="text-red-600 hover:text-red-900 text-sm">
                  Xóa
                </button>
                {!address.isDefault && (
                  <button className="text-green-600 hover:text-green-900 text-sm">
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Thêm địa chỉ mới */}
          <div className="border border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <div className="text-center">
              <span className="block text-2xl">+</span>
              <span>Thêm địa chỉ mới</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component ưu đãi
const Promotions: React.FC<{ data?: Promotion[] | null }> = ({ data }) => {
  // Sử dụng dữ liệu từ API hoặc mẫu nếu không có
  const promotions = data || [];

  if (promotions.length === 0) {
    return <EmptyState message="Bạn chưa có ưu đãi nào." />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ưu đãi của tôi</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-lg">{promotion.title}</h3>
                <p className="text-gray-600">Mã: {promotion.code}</p>
                <p className="text-gray-600">Hạn sử dụng: {promotion.expiry}</p>
              </div>
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                Sử dụng
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component FAQ
const FAQ: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Chính sách & câu hỏi thường gặp
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">Chính sách đổi trả</h3>
            <p className="text-gray-600">
              Khách hàng có thể đổi trả sản phẩm trong vòng 30 ngày kể từ ngày
              nhận hàng nếu sản phẩm còn nguyên tem mác, chưa qua sử dụng và có
              hóa đơn mua hàng.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">
              Làm thế nào để theo dõi đơn hàng?
            </h3>
            <p className="text-gray-600">
              Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản và
              vào mục &quot;Đơn hàng của tôi&quot;. Tại đây bạn sẽ thấy trạng
              thái và thông tin chi tiết về đơn hàng.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">
              Tôi có thể hủy đơn hàng không?
            </h3>
            <p className="text-gray-600">
              Bạn có thể hủy đơn hàng trong trạng thái &quot;Chờ xác nhận&quot;
              hoặc &quot;Đã xác nhận&quot; trước khi đơn hàng được giao cho đơn
              vị vận chuyển. Để hủy đơn hàng, vui lòng vào mục &quot;Đơn hàng
              của tôi&quot; và chọn &quot;Hủy đơn hàng&quot;.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">
              Phương thức thanh toán nào được chấp nhận?
            </h3>
            <p className="text-gray-600">
              Chúng tôi chấp nhận các phương thức thanh toán sau: Thanh toán khi
              nhận hàng (COD), Chuyển khoản ngân hàng, Thẻ tín dụng/ghi nợ, Ví
              điện tử (MoMo, ZaloPay, VNPay).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error component
const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 p-8 rounded-lg shadow-sm text-center">
    <div className="text-red-500 mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <p className="text-red-700 font-medium">{message}</p>
    <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
      Thử lại
    </button>
  </div>
);

interface UserRightProps {
  activeTab: string;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  accountData?: User | null;
  ordersData?: Order[] | null;
  addressesData?: Address[] | null;
  promotionsData?: Promotion[] | null;
}

export const UserRight: React.FC<UserRightProps> = ({
  activeTab,
  isLoading = false,
  hasError = false,
  errorMessage = "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.",
  accountData,
  ordersData,
  addressesData,
  promotionsData,
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError) {
    return <ErrorState message={errorMessage} />;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg h-full">
      {activeTab === "account" && <AccountInfo data={accountData} />}
      {activeTab === "orders" && <MyOrders data={ordersData} />}
      {activeTab === "addresses" && <Addresses data={addressesData} />}
      {activeTab === "promotions" && <Promotions data={promotionsData} />}
      {activeTab === "faq" && <FAQ />}
    </div>
  );
};
