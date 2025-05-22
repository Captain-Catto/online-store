import React, { useState, useEffect } from "react";
import { UserAdminApi } from "@/types/user";
import { UserService } from "@/services/UserService";
import { UserAddress } from "@/types/user";
import { useToast } from "@/utils/useToast";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface AddressesTabProps {
  user: UserAdminApi | null;
  userLoading: boolean;
  userError: string | null;
  fetchUserData?: () => Promise<void>;
}

const AddressesTab = ({
  user,
  userLoading,
  userError,
  fetchUserData,
}: AddressesTabProps) => {
  // Sử dụng hook toast
  const { showToast, Toast } = useToast();

  // State cho modal tạo địa chỉ mới
  const [showAddressModal, setShowAddressModal] = useState(false);
  // State cho thông tin địa chỉ mới
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phoneNumber: "",
    city: "",
    district: "",
    ward: "",
    streetAddress: "",
    isDefault: false,
  });
  // State cho thông báo lỗi
  const [errors, setErrors] = useState<Record<string, string>>({});
  // State cho trạng thái đang gửi
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State quản lý danh sách địa điểm
  const [locations, setLocations] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // State cho chế độ chỉnh sửa
  const [editMode, setEditMode] = useState(false);
  const [editAddressId, setEditAddressId] = useState<number | null>(null);

  // Load dữ liệu địa điểm
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const locationData = await import("@/data/location.json");
        setLocations(locationData.default);
        setCities(Object.keys(locationData.default));
      } catch {
        setErrors({
          general: "Không thể tải dữ liệu địa điểm. Vui lòng làm mới trang.",
        });
        showToast("Không thể tải dữ liệu địa điểm. Vui lòng làm mới trang.", {
          type: "error",
        });
      }
    };

    loadLocationData();
  }, [showToast]);

  // Xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setNewAddress((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setNewAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Xử lý khi chọn tỉnh/thành phố
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedDistrict("");
    setNewAddress({
      ...newAddress,
      city: city,
      district: "",
      ward: "",
    });

    // Cập nhật danh sách quận/huyện
    if (city && locations[city]) {
      setDistricts(Object.keys(locations[city]));
    } else {
      setDistricts([]);
    }
    setWards([]);
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setNewAddress({
      ...newAddress,
      district: district,
      ward: "",
    });

    // Cập nhật danh sách phường/xã
    if (selectedCity && district && locations[selectedCity]?.[district]) {
      setWards(locations[selectedCity][district]);
    } else {
      setWards([]);
    }
  };

  // Xử lý khi chọn phường/xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewAddress({
      ...newAddress,
      ward: e.target.value,
    });
  };

  // Kiểm tra form - giữ nguyên code validation

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Kiểm tra họ tên
    if (!newAddress.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    } else if (newAddress.fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Kiểm tra số điện thoại
    if (!newAddress.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else {
      // Định dạng số điện thoại Việt Nam
      const phoneRegex = /^(0|\+84)(\d{9,10})$/;
      const phoneNumberCleaned = newAddress.phoneNumber.replace(/[\s.-]/g, "");

      if (!phoneRegex.test(phoneNumberCleaned)) {
        newErrors.phoneNumber =
          "Số điện thoại không hợp lệ (phải có 10-11 số và bắt đầu bằng 0 hoặc +84)";
      }
    }

    // Kiểm tra địa chỉ chi tiết
    if (!newAddress.streetAddress.trim()) {
      newErrors.streetAddress = "Vui lòng nhập địa chỉ chi tiết";
    } else if (newAddress.streetAddress.trim().length < 5) {
      newErrors.streetAddress = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    // Kiểm tra tỉnh/thành phố
    if (!newAddress.city) {
      newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    }

    // Kiểm tra quận/huyện
    if (!newAddress.district) {
      newErrors.district = "Vui lòng chọn quận/huyện";
    }

    // Kiểm tra phường/xã
    if (!newAddress.ward) {
      newErrors.ward = "Vui lòng chọn phường/xã";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm xử lý submit form - cập nhật để sử dụng showToast
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!user?.id && !editMode) {
      setErrors({ general: "Không tìm thấy ID người dùng" });
      showToast("Không tìm thấy ID người dùng", { type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);

      const addressData = {
        fullName: newAddress.fullName,
        phoneNumber: newAddress.phoneNumber,
        streetAddress: newAddress.streetAddress,
        ward: newAddress.ward,
        district: newAddress.district,
        city: newAddress.city,
        isDefault: newAddress.isDefault,
      };

      if (editMode && editAddressId) {
        // Cập nhật địa chỉ
        await UserService.updateAddressByAdmin({
          id: editAddressId,
          ...addressData,
        });

        showToast("Cập nhật địa chỉ thành công!", { type: "success" });
      } else {
        // Tạo địa chỉ mới
        await UserService.createAddressByAdmin(user!.id, addressData);

        showToast("Thêm địa chỉ thành công!", { type: "success" });
      }

      // Đóng modal và reset form
      setTimeout(() => {
        setShowAddressModal(false);
        setNewAddress({
          fullName: "",
          phoneNumber: "",
          city: "",
          district: "",
          ward: "",
          streetAddress: "",
          isDefault: false,
        });
        setSelectedCity("");
        setSelectedDistrict("");
        setEditMode(false);
        setEditAddressId(null);

        // Refresh data
        if (fetchUserData) {
          fetchUserData();
        }
      }, 500); // Giảm thời gian delay để trải nghiệm mượt hơn
    } catch {
      showToast("Đã xảy ra lỗi khi lưu địa chỉ. Vui lòng thử lại sau.", {
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý khi bắt đầu chỉnh sửa địa chỉ
  const handleEditAddress = (address: UserAddress) => {
    setEditMode(true);
    setEditAddressId(address.id);

    // Điền thông tin vào form
    setNewAddress({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      city: address.city,
      district: address.district,
      ward: address.ward,
      streetAddress: address.streetAddress,
      isDefault: address.isDefault,
    });

    // Cập nhật selected city/district để dropdown hoạt động đúng
    setSelectedCity(address.city);
    setSelectedDistrict(address.district);

    // Mở modal
    setShowAddressModal(true);
  };

  // Hàm xử lý khi xóa địa chỉ - cập nhật để sử dụng showToast
  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Gọi API xóa địa chỉ
      await UserService.deleteAddressByAdmin(addressId);

      showToast("Xóa địa chỉ thành công!", { type: "success" });

      // Refresh data
      if (fetchUserData) {
        await fetchUserData();
      }
    } catch {
      showToast("Đã xảy ra lỗi khi xóa địa chỉ. Vui lòng thử lại sau.", {
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý đặt địa chỉ mặc định - cập nhật để sử dụng showToast
  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      setIsSubmitting(true);

      // Gọi API đặt địa chỉ mặc định
      await UserService.setDefaultAddressByAdmin(addressId);

      showToast("Đặt địa chỉ mặc định thành công!", { type: "success" });

      // Refresh data
      if (fetchUserData) {
        await fetchUserData();
      }
    } catch {
      showToast(
        "Đã xảy ra lỗi khi đặt địa chỉ mặc định. Vui lòng thử lại sau.",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // JSX phần còn lại giữ nguyên, chỉ thêm component Toast vào cuối
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">
          Danh sách địa chỉ nhận hàng
        </h3>
        <button
          onClick={() => {
            // Reset form khi mở modal thêm mới
            setEditMode(false);
            setEditAddressId(null);
            setNewAddress({
              fullName: "",
              phoneNumber: "",
              city: "",
              district: "",
              ward: "",
              streetAddress: "",
              isDefault: false,
            });
            setSelectedCity("");
            setSelectedDistrict("");
            setShowAddressModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <i className="fas fa-plus mr-2"></i> Thêm địa chỉ mới
        </button>
      </div>

      {userLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner size="lg" text="Đang tải địa chỉ..." />
        </div>
      ) : userError ? (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle mr-2"></i> {userError}
        </div>
      ) : user?.addresses && user.addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 ${
                address.isDefault
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">
                  {address.fullName || "Địa chỉ"}
                  {address.isDefault && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Mặc định
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-gray-600 mb-1">{address.streetAddress}</p>
              <p className="text-gray-600 mb-1">
                {address.ward}, {address.district}, {address.city}
              </p>
              <p className="text-gray-600 mb-2">
                Điện thoại: {address.phoneNumber}
              </p>

              {/* Thêm các nút chức năng */}
              <div className="flex gap-2 mt-2 border-t pt-2">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  disabled={isSubmitting}
                >
                  <i className="fas fa-edit mr-1"></i> Sửa
                </button>

                {!address.isDefault && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleSetDefaultAddress(address.id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-check-circle mr-1"></i> Đặt làm mặc
                      định
                    </button>
                  </>
                )}

                {!address.isDefault && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-trash mr-1"></i> Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Người dùng chưa có địa chỉ nào</p>
        </div>
      )}

      {/* Modal tạo địa chỉ mới */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                {editMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h4>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {errors.general && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Họ tên *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={newAddress.fullName}
                  onChange={handleInputChange}
                  className={`w-full border ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  } rounded-md p-2`}
                  disabled={isSubmitting}
                  placeholder="Nhập họ tên người nhận"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newAddress.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full border ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  } rounded-md p-2`}
                  disabled={isSubmitting}
                  placeholder="Nhập số điện thoại liên hệ"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Tỉnh/Thành phố */}
              <div className="mb-4">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tỉnh/Thành phố *
                </label>
                <select
                  id="city"
                  name="city"
                  value={newAddress.city}
                  onChange={handleCityChange}
                  className={`w-full border ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  } rounded-md p-2`}
                  disabled={isSubmitting || cities.length === 0}
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              {/* Quận/Huyện */}
              <div className="mb-4">
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quận/Huyện *
                </label>
                <select
                  id="district"
                  name="district"
                  value={newAddress.district}
                  onChange={handleDistrictChange}
                  className={`w-full border ${
                    errors.district ? "border-red-500" : "border-gray-300"
                  } rounded-md p-2`}
                  disabled={
                    isSubmitting || !selectedCity || districts.length === 0
                  }
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                )}
              </div>

              {/* Phường/Xã */}
              <div className="mb-4">
                <label
                  htmlFor="ward"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phường/Xã *
                </label>
                <select
                  id="ward"
                  name="ward"
                  value={newAddress.ward}
                  onChange={handleWardChange}
                  className={`w-full border ${
                    errors.ward ? "border-red-500" : "border-gray-300"
                  } rounded-md p-2`}
                  disabled={
                    isSubmitting || !selectedDistrict || wards.length === 0
                  }
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="text-red-500 text-xs mt-1">{errors.ward}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="streetAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Địa chỉ chi tiết *
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  value={newAddress.streetAddress}
                  onChange={handleInputChange}
                  className={`w-full border ${
                    errors.streetAddress ? "border-red-500" : "border-gray-300"
                  } rounded-md p-2`}
                  disabled={isSubmitting}
                  placeholder="Số nhà, tên đường..."
                />
                {errors.streetAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  disabled={isSubmitting}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : editMode ? (
                    "Cập nhật địa chỉ"
                  ) : (
                    "Lưu địa chỉ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hiển thị component Toast */}
      {Toast}
    </div>
  );
};

export default AddressesTab;
