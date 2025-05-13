import React from "react";
import { useState, useRef, useEffect } from "react";
import { UserService } from "@/services/UserService";
import Link from "next/link";
import Image from "next/image";
import { formatDateForInput, formatDateDisplay } from "@/utils/dateUtils";
import { User } from "@/types/user";
import { AddressPagination, Address } from "@/types/address";
import { Order } from "@/types/order";
import { Promotion } from "@/types/promotion";
import { useRouter } from "next/navigation";
import { useToast } from "@/utils/useToast";
import { formatCurrency } from "@/utils/currencyUtils";
import { WishlistItem, WishlistPagination } from "@/types/wishlist";
import { WishlistService } from "@/services/WishlistService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

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
const AccountInfo: React.FC<{ data?: User | null; onRetry?: () => void }> = ({
  data,
  onRetry,
}) => {
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Populate form data with user data when it becomes available
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        birthdate: data.birthdate ? formatDateForInput(data.birthdate) : "",
        address: data.address || "",
      });
    }
  }, [data]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: User) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call UserService to update profile
      await UserService.updateProfile({
        username: formData.name,
        phoneNumber: formData.phone,
        dateOfBirth: formData.birthdate
          ? new Date(formData.birthdate).toISOString()
          : undefined,
      });

      // Show success notification
      setNotification({
        message: "Cập nhật thông tin thành công!",
        type: "success",
      });

      // Refresh user data after a short delay
      setTimeout(() => {
        if (onRetry) onRetry();
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);

      // Show error notification
      setNotification({
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật thông tin!",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);

      // Auto-hide notification after a delay
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Thông tin tài khoản</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="name"
              >
                Họ tên
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                readOnly
              />
              <p className="text-sm text-gray-500 mt-1">
                Email không thể thay đổi
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="phone"
              >
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="birthdate"
              >
                Ngày sinh
              </label>
              <input
                id="birthdate"
                type="date"
                name="birthdate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.birthdate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingSpinner size="xs" color="white" className="mr-2" />
                Đang cập nhật...
              </span>
            ) : (
              "Cập nhật thông tin"
            )}
          </button>
        </div>
      </form>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-[60] ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

// Component đơn hàng
const MyOrders: React.FC<{
  data?: {
    orders: Order[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  } | null;
  onPageChange?: (page: number) => void;
}> = ({ data, onPageChange }) => {
  console.log("Orders data:", data);

  // Sử dụng dữ liệu từ API hoặc mảng rỗng nếu không có
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ordersData, setOrdersData] = useState<{
    orders: Order[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  } | null>(null);

  useEffect(() => {
    if (data) {
      setOrdersData(data);
      setCurrentPage(data.pagination?.currentPage || 1);
    }
  }, [data]);

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;
  console.log("Orders:", orders);

  // Hàm xử lý chuyển trạng thái từ API sang hiển thị UI
  const getOrderStatus = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Chờ xác nhận",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "processing":
        return { label: "Đang xử lý", className: "bg-blue-100 text-blue-800" };
      case "shipping":
        return {
          label: "Đang vận chuyển",
          className: "bg-blue-100 text-blue-800",
        };
      case "delivered":
        return { label: "Đã giao", className: "bg-green-100 text-green-800" };
      case "cancelled":
        return { label: "Đã hủy", className: "bg-red-100 text-red-800" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  // Hàm xử lý việc chuyển trang
  // Trong MyOrders component
  const handlePageChange = (page: number) => {
    // Vẫn cập nhật state nội bộ
    setCurrentPage(page);

    // Gọi callback để thông báo cho component cha
    if (onPageChange) {
      onPageChange(page);
    }
  };

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
                Sản phẩm
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
            {orders.map((order: Order) => {
              const { label, className } = getOrderStatus(order.status);
              const productCount = order.orderDetails?.length || 0;
              const productInfo =
                productCount > 0
                  ? order.orderDetails?.[0]?.product?.name +
                    (productCount > 1
                      ? ` và ${productCount - 1} sản phẩm khác`
                      : "")
                  : "Không có thông tin sản phẩm";

              return (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateDisplay(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}
                    >
                      {label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {productInfo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-1">
            {/* Nút trang trước */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Trang trước"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Các trang */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-md ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Nút trang sau */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className={`p-2 rounded-md ${
                currentPage === pagination.totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Trang sau"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

// component Addresses
const Addresses: React.FC<{
  data?: Address[] | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}> = ({ data, isLoading, error, onRetry }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Address>>({});
  // Thêm state để quản lý dialog xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  // State để hiển thị thông báo sau khi thực hiện các hành động
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  // thêm state cho việc thêm điaạ chỉ
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddressData, setNewAddressData] = useState<Partial<Address>>({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  });
  // state cho địa điểm
  const [locations, setLocations] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  // Thêm state để quản lý lỗi form
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  // Thêm state để quản lý lỗi form thêm mới
  const [newAddressErrors, setNewAddressErrors] = useState<{
    [key: string]: string;
  }>({});

  // Sử dụng useRef để lưu trữ notification hiện tại
  const notificationRef = useRef<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Cập nhật ref khi notification thay đổi
  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  useEffect(() => {
    // Load location data
    const loadLocationData = async () => {
      try {
        const locationData = await import("@/data/location.json");
        setLocations(locationData.default);
      } catch (error) {
        console.error("Failed to load location data:", error);
      }
    };

    loadLocationData();
  }, []);

  // Xử lý khi click vào nút chỉnh sửa
  const handleEditClick = (address: AddressPagination) => {
    setFormData({
      id: address.id,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      streetAddress: address.streetAddress,
      ward: address.ward,
      district: address.district,
      city: address.city,
      isDefault: address.isDefault,
    });
    setShowEditModal(true);
    setFormErrors({});
  };

  // Xử lý thay đổi các giá trị trong form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Hiện dialog xác nhận xóa
  const handleDeleteClick = (addressId: string) => {
    setAddressToDelete(addressId);
    setShowDeleteConfirm(true);
  };

  // Xác nhận và thực hiện xóa địa chỉ
  const confirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      await UserService.deleteAddress(Number(addressToDelete));

      // Đóng dialog xác nhận
      setShowDeleteConfirm(false);
      setAddressToDelete(null);

      // Hiển thị thông báo thành công
      setNotification({
        message: "Xóa địa chỉ thành công!",
        type: "success",
      });

      setTimeout(() => {
        if (onRetry) onRetry();
      }, 2000); // Đợi 2 giây rồi mới fetch data
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      setNotification({
        message: "Có lỗi xảy ra khi xóa địa chỉ!",
        type: "error",
      });
    } finally {
      // Chỉ đóng thông báo sau 2 giây
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    }
  };

  // Hàm đặt địa chỉ làm mặc định
  const handleSetDefault = async (addressId: string) => {
    try {
      await UserService.setDefaultAddress(Number(addressId));

      // Hiển thị thông báo thành công
      setNotification({
        message: "Đặt địa chỉ mặc định thành công!",
        type: "success",
      });

      setTimeout(() => {
        if (onRetry) onRetry();
      }, 2000); // Đợi 2 giây rồi mới fetch data
    } catch (error) {
      console.error("Lỗi khi đặt địa chỉ mặc định:", error);
      setNotification({
        message: "Có lỗi xảy ra khi đặt địa chỉ mặc định!",
        type: "error",
      });
    } finally {
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    }
  };

  // Xử lý submit form chỉnh sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra form trước khi gửi
    const errors = validateAddressForm(formData);
    setFormErrors(errors);

    // Nếu có lỗi, dừng lại và không gửi form
    if (Object.keys(errors).length > 0) {
      // Hiển thị thông báo lỗi
      setNotification({
        message: "Vui lòng kiểm tra lại thông tin địa chỉ",
        type: "error",
      });
      return;
    }

    try {
      // Gọi API cập nhật địa chỉ
      await UserService.updateAddress({
        ...formData,
        id: formData.id !== undefined ? Number(formData.id) : 0,
        fullName: formData.fullName || "",
        streetAddress: formData.streetAddress || "",
        district: formData.district || "",
        ward: formData.ward || "",
        city: formData.city || "",
        phoneNumber: formData.phoneNumber || "",
      });

      // Đóng modal
      setShowEditModal(false);

      // Hiển thị thông báo thành công
      setNotification({
        message: "Cập nhật địa chỉ thành công!",
        type: "success",
      });

      // Trì hoãn refetch data để notification có thời gian hiển thị
      setTimeout(() => {
        if (onRetry) onRetry();
      }, 1000); // Giảm time xuống 1 giây
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
      setNotification({
        message: "Có lỗi xảy ra khi cập nhật địa chỉ!",
        type: "error",
      });
    } finally {
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    }
  };

  // Handle click on "Add New Address"
  const handleAddClick = () => {
    setNewAddressData({
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
    });
    setShowAddModal(true);
    setNewAddressErrors({});
  };

  // Handle input changes for new address form
  const handleNewAddressInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewAddressData({
      ...newAddressData,
      [name]: value,
    });
  };

  // Handle city selection change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedDistrict("");
    setNewAddressData({
      ...newAddressData,
      city: city,
      district: "",
      ward: "",
    });
  };

  // Handle district selection change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setNewAddressData({
      ...newAddressData,
      district: district,
      ward: "",
    });
  };

  // Handle ward selection change
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewAddressData({
      ...newAddressData,
      ward: e.target.value,
    });
  };

  // Handle new address form submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra form trước khi gửi
    const errors = validateAddressForm(newAddressData);
    setNewAddressErrors(errors);

    // Nếu có lỗi, dừng lại và không gửi form
    if (Object.keys(errors).length > 0) {
      // Hiển thị thông báo lỗi
      setNotification({
        message: "Vui lòng kiểm tra lại thông tin địa chỉ",
        type: "error",
      });
      return;
    }

    try {
      // Call API to add new address
      await UserService.addAddress({
        fullName: newAddressData.fullName || "",
        phoneNumber: newAddressData.phoneNumber || "",
        streetAddress: newAddressData.streetAddress || "",
        ward: newAddressData.ward || "",
        district: newAddressData.district || "",
        city: newAddressData.city || "",
        isDefault: newAddressData.isDefault || false,
      });

      // Close modal
      setShowAddModal(false);

      // Show success notification
      setNotification({
        message: "Thêm địa chỉ thành công!",
        type: "success",
      });

      // Delay refetch data to allow notification to display
      setTimeout(() => {
        if (onRetry) onRetry();
      }, 1000); // Giảm time xuống 1 giây
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      setNotification({
        message: "Có lỗi xảy ra khi thêm địa chỉ!",
        type: "error",
      });
    }
  };

  // Hàm kiểm tra form
  const validateAddressForm = (data: Partial<Address>) => {
    const errors: { [key: string]: string } = {};

    // Kiểm tra họ tên
    if (!data.fullName || data.fullName.trim() === "") {
      errors.fullName = "Họ tên không được để trống";
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Kiểm tra số điện thoại (định dạng số điện thoại Việt Nam)
    if (!data.phoneNumber || data.phoneNumber.trim() === "") {
      errors.phoneNumber = "Số điện thoại không được để trống";
    } else {
      // Định dạng số điện thoại Việt Nam (loại bỏ khoảng trắng, dấu gạch ngang)
      const phoneRegex = /^(0|\+84)(\d{9,10})$/;
      const phoneNumberCleaned = data.phoneNumber.replace(/[\s.-]/g, "");

      if (!phoneRegex.test(phoneNumberCleaned)) {
        errors.phoneNumber =
          "Số điện thoại không hợp lệ (phải có 10-11 số và bắt đầu bằng 0 hoặc +84)";
      }
    }

    // Kiểm tra địa chỉ
    if (!data.streetAddress || data.streetAddress.trim() === "") {
      errors.streetAddress = "Địa chỉ không được để trống";
    } else if (data.streetAddress.trim().length < 5) {
      errors.streetAddress = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    // Kiểm tra phường/xã
    if (!data.ward || data.ward.trim() === "") {
      errors.ward = "Vui lòng chọn phường/xã";
    }

    // Kiểm tra quận/huyện
    if (!data.district || data.district.trim() === "") {
      errors.district = "Vui lòng chọn quận/huyện";
    }

    // Kiểm tra tỉnh/thành phố
    if (!data.city || data.city.trim() === "") {
      errors.city = "Vui lòng chọn tỉnh/thành phố";
    }

    return errors;
  };

  // Thêm useEffect để xử lý cleanup notification timeouts
  useEffect(() => {
    let notificationTimer: NodeJS.Timeout;

    if (notification) {
      notificationTimer = setTimeout(() => {
        setNotification(null);
      }, 2000);
    }

    // Cleanup function
    return () => {
      if (notificationTimer) clearTimeout(notificationTimer);
    };
  }, [notification]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Đang tải địa chỉ..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const addresses = data || [];
  // Thay thế đoạn này trong component Addresses
  if (addresses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-1">
            Bạn chưa có địa chỉ nào
          </h3>
          <p className="text-gray-600 mb-4">
            Vui lòng thêm địa chỉ giao hàng đầu tiên của bạn
          </p>
        </div>

        <form onSubmit={handleAddSubmit} className="max-w-lg mx-auto">
          <div className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên (hoặc tên gợi nhớ){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={newAddressData.fullName || ""}
                onChange={handleNewAddressInputChange}
                className={`w-full px-3 py-2 border ${
                  newAddressErrors.fullName
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Nhập họ tên người nhận hàng hoặc tên gợi nhớ"
                required
              />
              {newAddressErrors.fullName && (
                <p className="mt-1 text-sm text-red-500">
                  {newAddressErrors.fullName}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={newAddressData.phoneNumber || ""}
                onChange={handleNewAddressInputChange}
                className={`w-full px-3 py-2 border ${
                  newAddressErrors.phoneNumber
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Nhập số điện thoại liên hệ"
                required
              />
              {newAddressErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">
                  {newAddressErrors.phoneNumber}
                </p>
              )}
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="streetAddress"
                value={newAddressData.streetAddress || ""}
                onChange={handleNewAddressInputChange}
                className={`w-full px-3 py-2 border ${
                  newAddressErrors.streetAddress
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Số nhà, tên đường, tòa nhà..."
                required
              />
              {newAddressErrors.streetAddress && (
                <p className="mt-1 text-sm text-red-500">
                  {newAddressErrors.streetAddress}
                </p>
              )}
            </div>

            {/* Tỉnh/Thành phố */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={newAddressData.city || ""}
                onChange={handleCityChange}
                className={`w-full px-3 py-2 border ${
                  newAddressErrors.city ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {Object.keys(locations).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {newAddressErrors.city && (
                <p className="mt-1 text-sm text-red-500">
                  {newAddressErrors.city}
                </p>
              )}
            </div>

            {/* Quận/Huyện */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <select
                name="district"
                value={newAddressData.district || ""}
                onChange={handleDistrictChange}
                className={`w-full px-3 py-2 border ${
                  newAddressErrors.district
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                disabled={!selectedCity}
              >
                <option value="">Chọn Quận/Huyện</option>
                {selectedCity &&
                  locations[selectedCity] &&
                  Object.keys(locations[selectedCity]).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
              </select>
              {newAddressErrors.district && (
                <p className="mt-1 text-sm text-red-500">
                  {newAddressErrors.district}
                </p>
              )}
            </div>

            {/* Phường/Xã */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <select
                name="ward"
                value={newAddressData.ward || ""}
                onChange={handleWardChange}
                className={`w-full px-3 py-2 border ${
                  newAddressErrors.ward ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                disabled={!selectedDistrict}
              >
                <option value="">Chọn Phường/Xã</option>
                {selectedCity &&
                  selectedDistrict &&
                  locations[selectedCity][selectedDistrict]?.map(
                    (ward: string) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    )
                  )}
              </select>
              {newAddressErrors.ward && (
                <p className="mt-1 text-sm text-red-500">
                  {newAddressErrors.ward}
                </p>
              )}
            </div>

            {/* Checkbox đặt làm mặc định */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newAddressIsDefault"
                name="isDefault"
                checked={newAddressData.isDefault || false}
                onChange={(e) =>
                  setNewAddressData({
                    ...newAddressData,
                    isDefault: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="newAddressIsDefault"
                className="ml-2 text-sm text-gray-700"
              >
                Đặt làm địa chỉ mặc định
              </label>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Lưu địa chỉ
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render địa chỉ
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
              <h3 className="font-bold">{address.fullName}</h3>
              <p className="text-gray-600">{address.streetAddress}</p>
              <p className="text-gray-600">
                {address.ward}, {address.district}
              </p>
              <p className="text-gray-600">{address.city}</p>
              <p className="text-gray-600">Điện thoại: {address.phoneNumber}</p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEditClick(address)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDeleteClick(address.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Xóa
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-green-600 hover:text-green-900 text-sm"
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Thêm địa chỉ mới */}
          <div
            className="border border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={handleAddClick}
          >
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="mt-2 text-gray-600">Thêm địa chỉ mới</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Chỉnh sửa địa chỉ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
              <span>Chỉnh sửa địa chỉ</span>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Họ tên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.fullName ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.streetAddress
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.streetAddress && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.streetAddress}
                    </p>
                  )}
                </div>

                {/* Tỉnh/Thành phố */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    name="city"
                    value={formData.city || ""}
                    onChange={(e) => {
                      const city = e.target.value;
                      setFormData({
                        ...formData,
                        city: city,
                        district: "",
                        ward: "",
                      });
                    }}
                    className={`w-full px-3 py-2 border ${
                      formErrors.city ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {Object.keys(locations).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.city}
                    </p>
                  )}
                </div>

                {/* Quận/Huyện */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện
                  </label>
                  <select
                    name="district"
                    value={formData.district || ""}
                    onChange={(e) => {
                      const district = e.target.value;
                      setFormData({
                        ...formData,
                        district: district,
                        ward: "",
                      });
                    }}
                    className={`w-full px-3 py-2 border ${
                      formErrors.district ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    disabled={!formData.city}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {formData.city &&
                      locations[formData.city] &&
                      Object.keys(locations[formData.city]).map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                  </select>
                  {formErrors.district && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.district}
                    </p>
                  )}
                </div>

                {/* Phường/Xã */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã
                  </label>
                  <select
                    name="ward"
                    value={formData.ward || ""}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        ward: e.target.value,
                      });
                    }}
                    className={`w-full px-3 py-2 border ${
                      formErrors.ward ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    disabled={!formData.district}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {formData.city &&
                      formData.district &&
                      locations[formData.city][formData.district] &&
                      locations[formData.city][formData.district].map(
                        (ward: string) => (
                          <option key={ward} value={ward}>
                            {ward}
                          </option>
                        )
                      )}
                  </select>
                  {formErrors.ward && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.ward}
                    </p>
                  )}
                </div>

                {/* Checkbox đặt làm mặc định */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog xác nhận xóa địa chỉ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Xác nhận xóa địa chỉ</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không
              thể hoàn tác.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAddressToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-[60] ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Modal Thêm địa chỉ mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
              <span>Thêm địa chỉ mới</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </h3>

            <form onSubmit={handleAddSubmit}>
              <div className="space-y-4">
                {/* Họ tên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={newAddressData.fullName || ""}
                    onChange={handleNewAddressInputChange}
                    className={`w-full px-3 py-2 border ${
                      newAddressErrors.fullName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {newAddressErrors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {newAddressErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={newAddressData.phoneNumber || ""}
                    onChange={handleNewAddressInputChange}
                    className={`w-full px-3 py-2 border ${
                      newAddressErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {newAddressErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {newAddressErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={newAddressData.streetAddress || ""}
                    onChange={handleNewAddressInputChange}
                    className={`w-full px-3 py-2 border ${
                      newAddressErrors.streetAddress
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {newAddressErrors.streetAddress && (
                    <p className="mt-1 text-sm text-red-500">
                      {newAddressErrors.streetAddress}
                    </p>
                  )}
                </div>

                {/* Tỉnh/Thành phố */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    name="city"
                    value={newAddressData.city || ""}
                    onChange={handleCityChange}
                    className={`w-full px-3 py-2 border ${
                      newAddressErrors.city
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {Object.keys(locations).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {newAddressErrors.city && (
                    <p className="mt-1 text-sm text-red-500">
                      {newAddressErrors.city}
                    </p>
                  )}
                </div>

                {/* Quận/Huyện */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện
                  </label>
                  <select
                    name="district"
                    value={newAddressData.district || ""}
                    onChange={handleDistrictChange}
                    className={`w-full px-3 py-2 border ${
                      newAddressErrors.district
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    disabled={!selectedCity}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {selectedCity &&
                      locations[selectedCity] &&
                      Object.keys(locations[selectedCity]).map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                  </select>
                  {newAddressErrors.district && (
                    <p className="mt-1 text-sm text-red-500">
                      {newAddressErrors.district}
                    </p>
                  )}
                </div>

                {/* Phường/Xã */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã
                  </label>
                  <select
                    name="ward"
                    value={newAddressData.ward || ""}
                    onChange={handleWardChange}
                    className={`w-full px-3 py-2 border ${
                      newAddressErrors.ward
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {selectedCity &&
                      selectedDistrict &&
                      locations[selectedCity][selectedDistrict]?.map(
                        (ward: string) => (
                          <option key={ward} value={ward}>
                            {ward}
                          </option>
                        )
                      )}
                  </select>
                  {newAddressErrors.ward && (
                    <p className="mt-1 text-sm text-red-500">
                      {newAddressErrors.ward}
                    </p>
                  )}
                </div>

                {/* Checkbox đặt làm mặc định */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newAddressIsDefault"
                    name="isDefault"
                    checked={newAddressData.isDefault || false}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        isDefault: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="newAddressIsDefault"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Thêm địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

// Tạo thêm component Wishlist trong file này
const Wishlist: React.FC<{
  data?: WishlistItem[] | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  pagination?: WishlistPagination | null;
}> = ({ data, isLoading, error, onRetry, pagination }) => {
  const router = useRouter();
  const { showToast, Toast } = useToast();

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await WishlistService.removeFromWishlist(productId);

      showToast("Đã xóa sản phẩm khỏi danh sách yêu thích", {
        type: "success",
      });

      setTimeout(() => {
        if (onRetry) onRetry();
      }, 2000);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      showToast("Không thể xóa sản phẩm. Vui lòng thử lại.", {
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" text="Đang tải danh sách yêu thích..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-white rounded-lg shadow-sm">
        <svg
          className="w-12 h-12 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Danh sách yêu thích trống
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium">
        Sản phẩm yêu thích ({data.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((item) => {
          const detail = item.product.details[0];
          const image =
            item.product.details[0]?.images?.[0]?.url ||
            "/images/placeholder.jpg";

          return (
            <div
              key={item.id}
              className="flex-col sm:flex-row border rounded-md overflow-hidden hover:shadow-md transition-shadow flex"
            >
              <div className="flex-shrink-0 w-24 h-24 bg-gray-200 relative">
                <Link href={`/products/${item.product.id}`}>
                  <Image
                    src={image}
                    alt={item.product.name}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </Link>
              </div>

              <div className="flex-grow p-3">
                <Link
                  href={`/products/${item.product.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {item.product.name}
                </Link>

                <div className="flex justify-between items-end mt-2">
                  <div className="flex gap-1">
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(detail.price)}
                    </p>
                    {detail.originalPrice > detail.price && (
                      <p className="text-xs text-gray-500 line-through">
                        {formatCurrency(detail.originalPrice)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveFromWishlist(item.product.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Xóa khỏi yêu thích"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/account/wishlist/details"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Xem tất cả{" "}
          {pagination?.totalItems && pagination.totalItems > 1
            ? pagination.totalItems
            : ""}
          sản phẩm yêu thích
          <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </Link>
      </div>
      {Toast}
    </div>
  );
};

// Error component
const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="bg-red-50 p-4 rounded-lg text-center">
    <p className="text-red-600">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Thử lại
      </button>
    )}
  </div>
);

interface UserRightProps {
  activeTab: string;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  accountData?: User | null;
  ordersData?: {
    orders: Order[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  } | null;
  addressesData?: Address[] | null;
  promotionsData?: Promotion[] | null;
  wishlistData?: WishlistItem[] | null;
  wishlistPagination?: WishlistPagination | null;
  onPageChange?: (page: number) => void;
  onRetryFetch?: () => void;
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
  wishlistData,
  wishlistPagination,
  onRetryFetch,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState message={errorMessage} />;
  }

  function handleRetry() {
    if (onRetryFetch) {
      onRetryFetch();
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg h-full">
      {activeTab === "account" && <AccountInfo data={accountData} />}
      {activeTab === "orders" && (
        <MyOrders data={ordersData} onPageChange={onPageChange} />
      )}
      {activeTab === "addresses" && (
        <Addresses
          data={addressesData}
          isLoading={isLoading}
          error={errorMessage}
          onRetry={handleRetry} // Sử dụng hàm local để gọi callback từ prop
        />
      )}
      {activeTab === "wishlist" && (
        <Wishlist
          data={wishlistData}
          isLoading={isLoading}
          error={errorMessage}
          onRetry={handleRetry}
          pagination={wishlistPagination}
        />
      )}
      {activeTab === "promotions" && <Promotions data={promotionsData} />}
      {activeTab === "faq" && <FAQ />}
    </div>
  );
};
