"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import locationsData from "../../data/location.json";
import Image from "next/image";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import imgMomo from "../../assets/imgs/payment/momo.png";
import imgCreditCard from "../../assets/imgs/payment/credit-card-debit-card-svgrepo-com.svg";
import imgBanking from "../../assets/imgs/payment/internetbanking.png";
import imgCod from "../../assets/imgs/payment/cod.png";
import { AuthService } from "@/services/AuthService";
import { UserService } from "@/services/UserService";
import { OrderService } from "@/services/OrderService";
import { clearCart } from "@/utils/cartUtils";

// Định nghĩa kiểu dữ liệu
type LocationsType = {
  [city: string]: {
    [district: string]: string[];
  };
};

// Định nghĩa kiểu dữ liệu Address
interface Address {
  id: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Map cart items to order items format
interface CartItem {
  id: string;
  color: string;
  size: string;
  quantity: number;
}

// Định nghĩa interface cho voucher
interface Voucher {
  id: number;
  code: string;
  discount: number;
  discountType: string;
  minOrderValue: number;
}

// Ép kiểu dữ liệu
const locations: LocationsType = locationsData as LocationsType;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    paymentMethod: "",
  });
  // thêm state lưu thông tin đơn hàng truyền từ trang cart
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    total: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  // thêm state để check login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // State cho địa chỉ người dùng
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // State cho xử lý đơn hàng
  const [submitting, setSubmitting] = useState(false);

  // State cho voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  // State cho tính phí vận chuyển
  const [calculatingShippingFee, setCalculatingShippingFee] = useState(false);

  // state báo lỗi đơn hàng
  const [orderError, setOrderError] = useState<string | null>(null);

  // Điền thông tin từ địa chỉ đã chọn
  const populateShippingInfo = useCallback((address: Address) => {
    setShippingInfo((prev) => ({
      ...prev,
      name: address.fullName,
      address: address.streetAddress,
      city: address.city,
      district: address.district,
      ward: address.ward,
      phone: address.phoneNumber,
    }));
  }, []);

  // kiểm tra xem người dùng đã đăng nhập hay chưa
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      setLoading(false);

      if (!loggedIn) {
        // Save current checkout parameters to redirect back after login
        const params = new URLSearchParams(searchParams.toString());
        const returnUrl = `/checkout?${params.toString()}`;

        // Redirect to login with return URL
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  // Fetch địa chỉ người dùng khi component được mount
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!isLoggedIn || loading) return;

      setIsLoadingAddresses(true);
      setAddressError(null);

      try {
        const addressData = await UserService.getAddresses();
        console.log("Địa chỉ người dùng:", addressData);
        setAddresses(addressData);

        // Tự động chọn địa chỉ mặc định nếu có
        const defaultAddress = addressData.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          populateShippingInfo(defaultAddress);
        }
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
        setAddressError(
          "Không thể tải địa chỉ của bạn. Vui lòng nhập thông tin giao hàng."
        );
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (isLoggedIn && !loading) {
      fetchUserAddresses();
    }
  }, [isLoggedIn, loading, populateShippingInfo]);

  // Trong trang Checkout
  useEffect(() => {
    const orderDataString = sessionStorage.getItem("pendingOrder");

    if (!orderDataString) {
      // Nếu không có dữ liệu, điều hướng về trang giỏ hàng
      router.push("/cart");
      return;
    }

    try {
      const orderData = JSON.parse(orderDataString);
      const currentTime = new Date().getTime();

      // Kiểm tra tính hợp lệ của dữ liệu (ví dụ: không quá 30 phút)
      if (currentTime - orderData.timestamp > 30 * 60 * 1000) {
        alert("Phiên đặt hàng đã hết hạn, vui lòng thử lại.");
        router.push("/cart");
        return;
      }

      // Sử dụng dữ liệu
      setOrderSummary({
        subtotal: orderData.summary.subtotal,
        discount: orderData.summary.discount || 0,
        deliveryFee: orderData.summary.deliveryFee || 0,
        total:
          orderData.summary.subtotal +
          (orderData.summary.deliveryFee || 0) -
          (orderData.summary.discount || 0),
      });
    } catch (error) {
      console.error("Error parsing order data:", error);
      router.push("/cart");
    }
  }, [router]);

  // Function để tính phí vận chuyển (chỉ cần city)
  const calculateShippingFee = useCallback(async () => {
    if (!shippingInfo.city) {
      // Cần thông tin thành phố để tính phí vận chuyển
      return;
    }

    setCalculatingShippingFee(true);

    try {
      const orderDataString = sessionStorage.getItem("pendingOrder");
      if (!orderDataString) return;

      const orderData = JSON.parse(orderDataString);

      // Chuẩn bị dữ liệu theo định dạng mới
      const requestData = {
        subtotal: orderData.summary.subtotal,
        shippingAddress: shippingInfo.city,
      };

      // Gọi API để tính phí vận chuyển
      const response = await fetch(
        "http://localhost:3000/api/orders/shipping-fee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tính phí vận chuyển");
      }

      const data = await response.json();

      // Lấy finalFee từ đối tượng shipping trong response
      const shippingFee = data.shipping.finalFee;

      // Cập nhật order summary với phí vận chuyển mới
      setOrderSummary((prev) => ({
        ...prev,
        deliveryFee: shippingFee,
        total: prev.subtotal - prev.discount + shippingFee,
      }));

      // Cập nhật session storage
      if (orderDataString) {
        const updatedOrderData = JSON.parse(orderDataString);
        updatedOrderData.summary.deliveryFee = shippingFee;
        updatedOrderData.summary.total =
          updatedOrderData.summary.subtotal -
          updatedOrderData.summary.discount +
          shippingFee;
        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify(updatedOrderData)
        );
      }
    } catch (error) {
      console.error("Error calculating shipping fee:", error);
      // Sử dụng phí vận chuyển mặc định nếu có lỗi
    } finally {
      setCalculatingShippingFee(false);
    }
  }, [shippingInfo.city]);

  // Tự động tính phí vận chuyển khi thông tin địa chỉ thay đổi
  useEffect(() => {
    if (isLoggedIn && !loading && shippingInfo.city) {
      calculateShippingFee();
    }
  }, [shippingInfo.city, isLoggedIn, loading, calculateShippingFee]);

  // Hàm áp dụng voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã giảm giá");
      return;
    }

    setVoucherLoading(true);
    setVoucherError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/vouchers/${voucherCode.trim()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Mã giảm giá không hợp lệ");
      }

      const voucherData = await response.json();
      console.log("Voucher data:", voucherData);

      // Kiểm tra ngày hết hạn
      const expirationDate = new Date(voucherData.expirationDate);
      if (expirationDate < new Date()) {
        throw new Error("Mã giảm giá đã hết hạn");
      }

      // Kiểm tra điều kiện áp dụng voucher (minOrderValue có thể không có trong response)
      if (
        voucherData.minOrderValue &&
        orderSummary.subtotal < voucherData.minOrderValue
      ) {
        throw new Error(
          `Đơn hàng tối thiểu ${voucherData.minOrderValue.toLocaleString(
            "vi-VN"
          )}đ để áp dụng mã này`
        );
      }

      // Tính số tiền được giảm giá
      // Sử dụng type và value thay vì discountType và discount
      let discountAmount = 0;
      if (voucherData.type === "percentage") {
        discountAmount = Math.floor(
          (orderSummary.subtotal * voucherData.value) / 100
        );
      } else {
        discountAmount = voucherData.value;
      }

      // Cập nhật order summary với số tiền giảm giá
      setOrderSummary((prev) => ({
        ...prev,
        discount: discountAmount,
        total: prev.subtotal + prev.deliveryFee - discountAmount,
      }));

      // Lưu voucher đã áp dụng (map lại theo interface Voucher)
      setAppliedVoucher({
        id: voucherData.id,
        code: voucherData.code,
        discount: voucherData.value, // Sử dụng value thay cho discount
        discountType: voucherData.type, // Sử dụng type thay cho discountType
        minOrderValue: voucherData.minOrderValue || 0, // Đặt giá trị mặc định nếu không có
      });

      // Cập nhật session storage với số tiền mới
      const orderDataString = sessionStorage.getItem("pendingOrder");
      if (orderDataString) {
        const orderData = JSON.parse(orderDataString);
        orderData.summary.discount = discountAmount;
        orderData.summary.total =
          orderData.summary.subtotal +
          orderData.summary.deliveryFee -
          discountAmount;
        orderData.summary.voucherId = voucherData.id;
        sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
      }
    } catch (error) {
      console.error("Error applying voucher:", error);
      setVoucherError(
        error instanceof Error ? error.message : "Không thể áp dụng mã giảm giá"
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // If there are errors, don't process
    }

    // Reset any previous errors
    setOrderError(null);

    try {
      // Show loading state
      setSubmitting(true);

      // Get cart items from session storage
      const orderDataString = sessionStorage.getItem("pendingOrder");
      if (!orderDataString) {
        alert("Không tìm thấy thông tin giỏ hàng. Vui lòng thử lại.");
        router.push("/cart");
        return;
      }

      const orderData = JSON.parse(orderDataString);

      const orderItems = orderData.items.map((item: CartItem) => ({
        productId: Number(item.id),
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      }));

      // Map payment method to paymentMethodId
      const paymentMethodIdMap: Record<string, number> = {
        cod: 1, // COD
        creditCard: 2, // Credit/Debit Card
        banking: 3, // Internet Banking
        momo: 4, // MoMo
      };

      // Create full address string
      const fullAddress = `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`;

      // Create order payload
      const orderPayload = {
        items: orderItems,
        paymentMethodId: paymentMethodIdMap[paymentMethod] || 1,
        voucherId: appliedVoucher?.id || orderData.summary?.voucherId || null,
        shippingAddress: fullAddress,
        phoneNumber: shippingInfo.phone,
      };

      // Call API to create order
      const response = await OrderService.placeOrder(orderPayload);
      console.log("API response:", response);

      // Lưu ID đơn hàng vào sessionStorage
      sessionStorage.setItem("recentOrderId", String(response.id || ""));

      // Clear cart
      clearCart();
      sessionStorage.removeItem("pendingOrder");

      // Chuyển hướng đến trang confirmation
      router.push(`/order-confirmation`);
    } catch (error) {
      console.error("Error placing order:", error);

      // Hiển thị lỗi cho người dùng
      if (error instanceof Error) {
        // Nếu là lỗi từ API với định dạng JSON
        try {
          // Kiểm tra nếu message lỗi là chuỗi JSON
          if (error.message.includes('{"message":')) {
            const errorJson = JSON.parse(
              error.message.substring(error.message.indexOf("{"))
            );
            setOrderError(errorJson.message);
          } else {
            // Nếu không phải JSON, dùng message của lỗi
            setOrderError(error.message);
          }
        } catch {
          // Nếu không thể parse JSON, hiển thị message gốc
          setOrderError(error.message);
        }
      } else {
        // Fallback cho các loại lỗi khác
        setOrderError("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi khi người dùng nhập lại
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Cập nhật giá trị cho city, district, hoặc ward
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "city" && { district: "", ward: "" }), // Reset district và ward nếu chọn city mới
      ...(name === "district" && { ward: "" }), // Reset ward nếu chọn district mới
    }));

    // Xóa lỗi khi người dùng chọn lại
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {
      name: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      phone: "",
      paymentMethod: "",
    };

    if (!shippingInfo.name) newErrors.name = "Vui lòng nhập thông tin.";
    if (!shippingInfo.address) newErrors.address = "Vui lòng nhập thông tin.";
    if (!shippingInfo.city) newErrors.city = "Vui lòng chọn thành phố.";
    if (!shippingInfo.district)
      newErrors.district = "Vui lòng chọn quận/huyện.";
    if (!shippingInfo.ward) newErrors.ward = "Vui lòng chọn phường/xã.";
    if (!shippingInfo.phone) newErrors.phone = "Vui lòng nhập số điện thoại.";

    setErrors(newErrors);

    // Kiểm tra nếu không có lỗi
    return Object.values(newErrors).every((error) => error === "");
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentMethod(e.target.value);
    setErrors((prev) => ({ ...prev, paymentMethod: "" }));
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Shipping Information */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

            {/* Existing Addresses */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Địa chỉ giao hàng</h3>

              {isLoadingAddresses ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
                  <span>Đang tải địa chỉ...</span>
                </div>
              ) : addressError ? (
                <div className="bg-red-50 p-4 rounded-md text-red-600">
                  {addressError}
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-blue-50 p-4 rounded-md text-blue-600">
                  Bạn chưa có địa chỉ nào. Vui lòng nhập thông tin giao hàng bên
                  dưới.
                </div>
              ) : (
                <div>
                  {/* Chỉ hiển thị địa chỉ mặc định nếu showAllAddresses = false */}
                  <div
                    className={`grid ${
                      showAllAddresses
                        ? "grid-cols-1 md:grid-cols-2"
                        : "grid-cols-1"
                    } gap-4 mb-4`}
                  >
                    {addresses
                      .filter((address) =>
                        !showAllAddresses ? address.isDefault : true
                      )
                      .map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 ${
                            selectedAddressId === address.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold">{address.fullName}</p>
                              <p className="text-sm text-gray-600">
                                {address.phoneNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.streetAddress}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.ward}, {address.district}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}
                              </p>
                            </div>
                            {address.isDefault && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAddressId(address.id);
                                populateShippingInfo(address);
                              }}
                              className={`w-full py-2 px-4 rounded text-sm ${
                                selectedAddressId === address.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              {selectedAddressId === address.id
                                ? "Đã chọn"
                                : "Sử dụng địa chỉ này"}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Nút xem thêm địa chỉ */}
                  {addresses.length > 1 && !showAllAddresses && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setShowAllAddresses(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto"
                      >
                        <span>Xem thêm địa chỉ khác</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Nút ẩn bớt địa chỉ */}
                  {showAllAddresses && addresses.length > 1 && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setShowAllAddresses(false)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto"
                      >
                        <span>Ẩn bớt địa chỉ</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {addresses.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 my-6"></div>
                      <div className="mb-4">
                        <h3 className="text-lg font-medium">
                          Hoặc nhập địa chỉ mới
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(null);
                            setShippingInfo({
                              name: "",
                              address: "",
                              city: "",
                              district: "",
                              ward: "",
                              phone: "",
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm underline mt-2"
                        >
                          Nhập địa chỉ mới
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name-input" className="block mb-1 font-medium">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Tên đầy đủ"
                  value={shippingInfo.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="address-input"
                  className="block mb-1 font-medium"
                >
                  Địa chỉ
                </label>
                <input
                  id="address-input"
                  type="text"
                  name="address"
                  placeholder="Địa chỉ nhận hàng"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              {/* sdt */}
              <div>
                <label htmlFor="phone-input" className="block mb-1 font-medium">
                  Số điện thoại
                </label>

                <input
                  id="phone-input"
                  type="text"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* thành phố, quận, phường */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="city-select"
                    className="block mb-1 font-medium"
                  >
                    Tỉnh/Thành phố
                  </label>
                  <select
                    id="city-select"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleSelectChange}
                    className={`w-full px-4 py-2 border rounded-full ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Chọn Thành Phố</option>
                    {Object.keys(locations).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="district-select"
                    className="block mb-1 font-medium"
                  >
                    Quận/Huyện
                  </label>

                  <select
                    id="district-select"
                    name="district"
                    value={shippingInfo.district}
                    onChange={handleSelectChange}
                    className={`w-full px-4 py-2 border rounded-full ${
                      errors.district ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!shippingInfo.city}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {shippingInfo.city &&
                      Object.keys(
                        locations[shippingInfo.city as keyof LocationsType] ||
                          {}
                      ).map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                  </select>
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="ward-select"
                    className="block mb-1 font-medium"
                  >
                    Phường/Xã
                  </label>
                  <select
                    id="ward-select"
                    name="ward"
                    value={shippingInfo.ward}
                    onChange={handleSelectChange}
                    className={`w-full px-4 py-2 border rounded-full ${
                      errors.ward ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!shippingInfo.district}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {shippingInfo.city &&
                      shippingInfo.district &&
                      (
                        locations[shippingInfo.city][shippingInfo.district] ||
                        []
                      ).map((ward) => (
                        <option key={ward} value={ward}>
                          {ward}
                        </option>
                      ))}
                  </select>
                  {errors.ward && (
                    <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                  )}
                </div>
              </div>

              {/* payment */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={handlePaymentMethodChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Tiền mặt (COD)</div>
                      <div className="text-sm text-gray-500">
                        Thanh toán khi nhận hàng
                      </div>
                    </div>
                    <Image
                      src={imgCod}
                      alt="COD"
                      width={40}
                      height={40}
                      className="ml-auto"
                    />
                  </label>

                  <label className="flex items-center p-4 border rounded cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === "creditCard"}
                      onChange={handlePaymentMethodChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Thẻ Credit/Debit</div>
                      <div className="text-sm text-gray-500">
                        Thanh toán bằng thẻ tín dụng/dư nợ
                      </div>
                    </div>
                    <Image
                      src={imgCreditCard}
                      alt="Credit Card"
                      width={40}
                      height={40}
                      className="ml-auto"
                    />
                  </label>

                  <label className="flex items-center p-4 border rounded cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="banking"
                      checked={paymentMethod === "banking"}
                      onChange={handlePaymentMethodChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Internet Banking</div>
                      <div className="text-sm text-gray-500">
                        Trả thông qua internet banking
                      </div>
                    </div>
                    <Image
                      src={imgBanking}
                      alt="Internet Banking"
                      width={300}
                      height={40}
                      className="ml-auto"
                    />
                  </label>

                  <label className="flex items-center p-4 border rounded cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={handlePaymentMethodChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">MoMo</div>
                      <div className="text-sm text-gray-500">
                        Trả bằng ví MoMo
                      </div>
                    </div>
                    <Image
                      src={imgMomo}
                      alt="MoMo"
                      width={40}
                      height={40}
                      className="ml-auto"
                    />
                  </label>
                </div>

                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>

              {/* Mã giảm giá */}
              <div className="mb-4">
                <label
                  htmlFor="voucher-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mã giảm giá
                </label>
                <div className="flex space-x-2">
                  <input
                    id="voucher-input"
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!appliedVoucher || voucherLoading}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading || !!appliedVoucher}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {voucherLoading ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                </div>
                {voucherError && (
                  <p className="text-red-500 text-sm mt-1">{voucherError}</p>
                )}
                {appliedVoucher && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                    <div>
                      <span className="text-green-700 font-medium text-sm">
                        {appliedVoucher.code}
                      </span>
                      <span className="text-green-600 text-xs block">
                        {appliedVoucher.discountType === "percentage"
                          ? `Giảm ${appliedVoucher.discount}%`
                          : `Giảm ${appliedVoucher.discount.toLocaleString(
                              "vi-VN"
                            )}đ`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherCode("");
                        // Reset discount
                        setOrderSummary((prev) => ({
                          ...prev,
                          discount: 0,
                          total: prev.subtotal + prev.deliveryFee,
                        }));
                        // Update session storage
                        const orderDataString =
                          sessionStorage.getItem("pendingOrder");
                        if (orderDataString) {
                          const orderData = JSON.parse(orderDataString);
                          orderData.summary.discount = 0;
                          orderData.summary.total =
                            orderData.summary.subtotal +
                            orderData.summary.deliveryFee;
                          orderData.summary.voucherId = null;
                          sessionStorage.setItem(
                            "pendingOrder",
                            JSON.stringify(orderData)
                          );
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2"></div>

              <div className="space-y-3 divide-y divide-gray-200">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">
                    {orderSummary.subtotal.toLocaleString("vi-VN")} VND
                  </span>
                </div>

                {orderSummary.discount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="font-medium text-red-500">
                      -{orderSummary.discount.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">
                    Phí vận chuyển
                    {calculatingShippingFee && (
                      <span className="inline-block ml-1">
                        <span className="animate-spin h-3 w-3 border-t-2 border-b-2 border-gray-500 rounded-full inline-block"></span>
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {orderSummary.deliveryFee.toLocaleString("vi-VN")} VND
                  </span>
                </div>

                <div className="flex justify-between py-2 pt-3">
                  <span className="font-semibold">Tổng</span>
                  <span className="font-bold text-lg">
                    {orderSummary.total.toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </div>
              {/* Order Summary - thêm phần này trước nút đặt hàng */}
              {orderError && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <div className="flex">
                    <div className="py-1">
                      <svg
                        className="fill-current h-5 w-5 text-red-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Không thể đặt hàng</p>
                      <p className="text-sm">{orderError}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-3 rounded mt-6 hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  "Đặt Hàng"
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
