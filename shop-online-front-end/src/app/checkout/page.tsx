"use client";

import { useState, useEffect } from "react";
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

// Định nghĩa kiểu dữ liệu
type LocationsType = {
  [city: string]: {
    [district: string]: string[];
  };
};

// Ép kiểu dữ liệu
const locations: LocationsType = locationsData as LocationsType;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    email: "",
    paymentMethod: "",
  });
  // thêm state lưu thông tin đơn hàng truyền từ trang cart
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 15000,
    total: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  // thêm state để check login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Lấy query params từ URL
    const subtotalParam = searchParams.get("subtotal");
    const discountParam = searchParams.get("discount");
    const totalParam = searchParams.get("total");

    if (subtotalParam && totalParam) {
      setOrderSummary({
        subtotal: parseInt(subtotalParam, 10) || 0,
        discount: parseInt(discountParam || "0", 10) || 0,
        deliveryFee: 15000,
        total: parseInt(totalParam, 10) || 0,
      });
    }
  }, [searchParams]);

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
      email: "",
      paymentMethod: "",
    };

    if (!shippingInfo.name) newErrors.name = "Vui lòng nhập thông tin.";
    if (!shippingInfo.address) newErrors.address = "Vui lòng nhập thông tin.";
    if (!shippingInfo.city) newErrors.city = "Vui lòng chọn thành phố.";
    if (!shippingInfo.district)
      newErrors.district = "Vui lòng chọn quận/huyện.";
    if (!shippingInfo.ward) newErrors.ward = "Vui lòng chọn phường/xã.";
    if (!shippingInfo.phone) newErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!shippingInfo.email) newErrors.email = "Vui lòng nhập email.";

    setErrors(newErrors);

    // Kiểm tra nếu không có lỗi
    return Object.values(newErrors).every((error) => error === "");
  };

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Nếu có lỗi, ko xử lý
    }

    alert("Order placed successfully!");
    router.push("/order-confirmation"); // chuyển tới xác nhận đơn hàng
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentMethod(e.target.value);
    setErrors((prev) => ({ ...prev, paymentMethod: "" }));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Shipping Information */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
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
              <label htmlFor="address-input" className="block mb-1 font-medium">
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
            {/* email */}
            <div>
              {" "}
              <label htmlFor="email-input" className="block mb-1 font-medium">
                Email
              </label>
              <input
                id="email-input"
                type="email"
                name="email"
                placeholder="Địa chỉ Email"
                value={shippingInfo.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            {/* thành phố, quận, phường */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="city-select" className="block mb-1 font-medium">
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
                      locations[shippingInfo.city as keyof LocationsType] || {}
                    ).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                </select>
                {errors.district && (
                  <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="ward-select" className="block mb-1 font-medium">
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
                      locations[shippingInfo.city][shippingInfo.district] || []
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

            {/* paymênt */}
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
                    alt="COD"
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
                    alt="COD"
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
                <span className="text-gray-600">Phí vận chuyển</span>
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

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded mt-6 hover:bg-gray-800 transition"
            >
              Đặt Hàng
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
