"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import locationsData from "../../data/location.json";
import { PaymentMethodId, PAYMENT_METHOD_NAMES } from "../../types/payment";
import imgMomo from "../../assets/imgs/payment/momo.png";
import imgCod from "../../assets/imgs/payment/cod.png";
import imgZalopay from "../../assets/imgs/payment/Logo-FA-14.png";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AuthService } from "@/services/AuthService";
import { UserService } from "@/services/UserService";
import { Address } from "@/types/address";
import { OrderService } from "@/services/OrderService";
import { VoucherService } from "@/services/VoucherService";
import { useCart } from "@/contexts/CartContext";
import BreadcrumbTrail from "../Breadcrumb/BreadcrumbTrail";
import { BreadcrumbItem } from "@/types/breadcrumb";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { AppliedVoucher } from "@/types/vouchers";
import { API_BASE_URL } from "@/config/apiConfig";

// Định nghĩa kiểu dữ liệu
type LocationsType = {
  [city: string]: {
    [district: string]: string[];
  };
};

// Map cart items to order items format
interface CartItem {
  id: string;
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

// Ép kiểu dữ liệu
const locations: LocationsType = locationsData as LocationsType;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/" },
    { label: "Giỏ hàng", href: "/cart" },
    { label: "Thanh toán", href: "/checkout", isLast: true },
  ];

  // States
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
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    baseShippingFee: 0,
    shippingDiscount: 0,
    total: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(
    PaymentMethodId.COD
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(
    null
  );
  // Add state to track validated voucher codes
  const [validatedVoucherCodes, setValidatedVoucherCodes] = useState<
    Set<string>
  >(new Set());
  const { cartItems, loading: cartLoading, clearCart } = useCart();
  const [userId, setUserId] = useState<number | null>(null);
  const [calculatingShippingFee, setCalculatingShippingFee] = useState(false);
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
    };

    checkAuth();
  }, [router, searchParams]);

  // Retrieve and set the userId when the component mounts if user is logged in
  useEffect(() => {
    if (isLoggedIn && !loading) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData && userData.id) {
            setUserId(Number(userData.id));
          }
        }
      } catch {}
    }
  }, [isLoggedIn, loading]);

  // Fetch địa chỉ người dùng khi component được mount
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!isLoggedIn || loading) return;

      setIsLoadingAddresses(true);
      setAddressError(null);

      try {
        const addressData = await UserService.getAddresses();
        setAddresses(addressData);

        // Tự động chọn địa chỉ mặc định nếu có
        const defaultAddress = addressData.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(Number(defaultAddress.id));
          populateShippingInfo(defaultAddress);
        }
      } catch {
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
    // Kiểm tra nếu giỏ hàng trống, quay về trang cart
    if (!cartLoading && cartItems.length === 0) {
      router.push("/cart");
      return;
    }

    // Tính toán dữ liệu đơn hàng từ cartItems
    if (!cartLoading && cartItems.length > 0) {
      // Load applied voucher from sessionStorage
      try {
        const orderDataString = sessionStorage.getItem("pendingOrder");
        if (orderDataString) {
          const orderData = JSON.parse(orderDataString);

          // Extract voucher data if present
          if (orderData.summary && orderData.summary.appliedVoucher) {
            const voucherData = orderData.summary.appliedVoucher;

            setAppliedVoucher({
              code: voucherData.code,
              discount: orderData.summary.voucherDiscount || 0,
              type: voucherData.type,
              value: voucherData.value,
              minOrderValue: voucherData.minOrderValue,
            });

            // Set the voucher code field
            setVoucherCode(voucherData.code);
          }

          // Set order summary based on data from sessionStorage
          setOrderSummary({
            subtotal: orderData.summary.subtotal || 0,
            discount: orderData.summary.voucherDiscount || 0,
            deliveryFee: orderData.summary.deliveryFee || 0,
            baseShippingFee: orderData.summary.baseShippingFee || 0,
            shippingDiscount: orderData.summary.shippingDiscount || 0,
            total: orderData.summary.total || orderData.summary.subtotal || 0,
          });

          return;
        }
      } catch {
        // báo lỗi khi không lấy được orderdata
        setOrderError("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại.");
      }

      // Fallback: calculate from cart items if session storage data isn't available
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      setOrderSummary({
        subtotal,
        discount: 0,
        deliveryFee: 0, // Phí vận chuyển sau khi giảm giá
        baseShippingFee: 0, // Phí vận chuyển gốc
        shippingDiscount: 0, // Giảm giá vận chuyển
        total: subtotal,
      });
    }
  }, [cartItems, cartLoading, router]);

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
      const response = await OrderService.getShippingFee(requestData);

      // Kiểm tra nếu response không có trường shipping hoặc finalFee
      if (
        !response ||
        !response.shipping ||
        typeof response.shipping.finalFee !== "number"
      ) {
        throw new Error("Không thể tính phí vận chuyển");
      }

      // Lấy finalFee từ đối tượng shipping trong response
      const shippingFee = response.shipping.finalFee;
      const baseShippingFee = response.shipping.baseFee;
      const shippingDiscount = response.shipping.discount;

      // Cập nhật order summary với phí vận chuyển mới
      setOrderSummary((prev) => ({
        ...prev,
        deliveryFee: shippingFee,
        baseShippingFee: baseShippingFee,
        shippingDiscount: shippingDiscount,
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
    } catch {
      // Sử dụng phí vận chuyển mặc định nếu có lỗi
    } finally {
      setCalculatingShippingFee(false);
    }
  }, [shippingInfo.city]);

  // Tự động tính phí vận chuyển khi thông tin địa chỉ thay đổi
  useEffect(() => {
    if (!loading && shippingInfo.city) {
      calculateShippingFee();
    }
  }, [shippingInfo.city, isLoggedIn, loading, calculateShippingFee]);

  // Sử dụng useRef để lưu trữ timeout ID cho debounce
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Hàm xử lý áp dụng voucher
  const processVoucher = useCallback(
    async (code: string) => {
      // Nếu mã trống, không làm gì cả
      if (!code.trim()) {
        setVoucherError(null);
        return;
      }

      // Check if this code has already been validated (failed)
      if (validatedVoucherCodes.has(code.trim())) {
        setVoucherError("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        return;
      }

      setVoucherLoading(true);
      setVoucherError(null);

      try {
        // Sử dụng VoucherService để validate voucher
        const voucherData = await VoucherService.validateVoucher(
          code,
          orderSummary.subtotal
        );

        // Tính số tiền được giảm giá
        let discountAmount = 0;
        if (voucherData.type === "percentage") {
          discountAmount = Math.floor(
            (orderSummary.subtotal * voucherData.value) / 100
          );
        } else {
          discountAmount = voucherData.value;
        }

        // Cập nhật appliedVoucher state
        setAppliedVoucher({
          code: voucherData.code,
          discount: discountAmount,
          type: voucherData.type,
          value: voucherData.value,
          minOrderValue: voucherData.minOrderValue,
        });

        // Cập nhật order summary với số tiền giảm giá
        setOrderSummary((prev) => ({
          ...prev,
          discount: discountAmount,
          total: prev.subtotal + prev.deliveryFee - discountAmount,
        }));

        // Cập nhật thông tin trong sessionStorage
        const orderDataString = sessionStorage.getItem("pendingOrder");
        if (orderDataString) {
          const orderData = JSON.parse(orderDataString);
          orderData.summary.voucherDiscount = discountAmount;
          orderData.summary.total =
            orderData.summary.subtotal +
            orderData.summary.deliveryFee -
            discountAmount;

          // Store voucher info in pendingOrder
          orderData.summary.appliedVoucher = {
            code: voucherData.code,
            type: voucherData.type,
            value: voucherData.value,
            minOrderValue: voucherData.minOrderValue,
          };

          // Make sure to include the voucher code directly in the summary for easier access
          orderData.voucherCode = voucherData.code;

          sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
        }
      } catch (error) {
        setVoucherError(
          error instanceof Error
            ? error.message
            : "Không thể áp dụng mã giảm giá"
        );

        // Store this code as a failed code
        setValidatedVoucherCodes((prev) => {
          const newSet = new Set(prev);
          newSet.add(code.trim());
          return newSet;
        });

        // Nếu có lỗi, xóa voucher đã áp dụng
        setAppliedVoucher(null);

        // Cập nhật order summary, loại bỏ discount
        setOrderSummary((prev) => ({
          ...prev,
          discount: 0,
          total: prev.subtotal + prev.deliveryFee,
        }));
      } finally {
        setVoucherLoading(false);
      }
    },
    [orderSummary.subtotal, validatedVoucherCodes]
  );

  // Thêm useEffect để tự động áp dụng voucher khi mã thay đổi
  useEffect(() => {
    // Nếu đã có voucher áp dụng hoặc đang loading, không làm gì cả
    if (appliedVoucher || voucherLoading) return;

    // Nếu mã voucher trống, không làm gì cả
    const trimmedCode = voucherCode.trim();
    if (!trimmedCode) return;

    // Nếu mã voucher đã được xác nhận là không hợp lệ trước đó, không kiểm tra lại
    if (validatedVoucherCodes.has(trimmedCode)) return;

    // Clear timer cũ nếu có
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Tạo timer mới để debounce việc gọi API
    debounceTimer.current = setTimeout(() => {
      if (trimmedCode) {
        processVoucher(trimmedCode);
      }
    }, 800); // 800ms debounce

    // Cleanup khi component unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    voucherCode,
    appliedVoucher,
    voucherLoading,
    processVoucher,
    validatedVoucherCodes,
  ]);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setOrderError(null);
    setSubmitting(true);

    try {
      // Get cart items from session storage
      const orderDataString = sessionStorage.getItem("pendingOrder");

      if (!orderDataString) {
        //thông báo lỗi nếu không có dữ liệu đơn hàng sau 1s thì chuyển về trang giỏ hàng
        setTimeout(() => {
          setOrderError("Không có dữ liệu đơn hàng. Vui lòng thử lại sau.");
        }, 1000);

        router.push("/cart");
        return;
      }
      const orderData = JSON.parse(orderDataString);

      const orderItems = orderData.items.map((item: CartItem) => ({
        productId: Number(item.productId),
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      }));
      // Create full address string
      const fullAddress = `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`; // Create order payload

      // Get voucher code from applied voucher or from the session storage
      const voucherCodeToUse =
        appliedVoucher?.code || orderData.voucherCode || null;

      const orderPayload = {
        items: orderItems,
        paymentMethodId: paymentMethod,
        voucherCode: voucherCodeToUse, // Keep this for backward compatibility
        shippingAddress: fullAddress,
        shippingFullName: shippingInfo.name,
        shippingPhoneNumber: shippingInfo.phone,
        shippingStreetAddress: shippingInfo.address,
        shippingWard: shippingInfo.ward,
        shippingDistrict: shippingInfo.district,
        shippingCity: shippingInfo.city,
        userId: userId, // Include the userId in the order payload
      };

      // Gọi API để đặt hàng
      const response = await OrderService.placeOrder(orderPayload);

      // Kiểm tra orderId
      if (!response.orderId) {
        throw new Error("Không nhận được ID đơn hàng");
      }

      // Lưu ID đơn hàng vào sessionStorage và xóa pendingOrder
      sessionStorage.setItem("recentOrderId", String(response.orderId));
      sessionStorage.removeItem("pendingOrder");

      // Sử dụng clearCart từ context - đợi nó hoàn thành
      await clearCart();

      // Nếu thanh toán là VNPAY, chuyển hướng đến trang thanh toán VNPAY
      if (paymentMethod === PaymentMethodId.VNPAY) {
        try {
          // Gọi API để tạo URL thanh toán VNPAY
          const vnpayResponse = await fetch(
            `${API_BASE_URL}/payments/vnpay/create-payment-url`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: response.orderId,
                amount: orderSummary.total,
                orderInfo: `Thanh toan don hang #${response.orderId}`,
                returnUrl: `${window.location.origin}/payment/vnpay-return`,
              }),
            }
          );
          const vnpayData = await vnpayResponse.json();

          // Đảm bảo URL có chứa vnp_SecureHash
          if (
            vnpayData.paymentUrl &&
            vnpayData.paymentUrl.includes("vnp_SecureHash=")
          ) {
            window.location.href = vnpayData.paymentUrl;
          } else {
            throw new Error("URL thanh toán không hợp lệ");
          }

          if (vnpayData.paymentUrl) {
            // Lưu orderId vào sessionStorage trước khi chuyển hướng
            sessionStorage.setItem(
              "pendingVNPayOrderId",
              String(response.orderId)
            );

            // Chuyển hướng đến trang thanh toán VNPAY
            window.location.href = vnpayData.paymentUrl;
            return; // Dừng xử lý tiếp theo
          } else {
            throw new Error("Không nhận được URL thanh toán");
          }
        } catch {
          setOrderError(
            "Không thể tạo liên kết thanh toán VNPAY. Vui lòng thử lại sau."
          );

          // Chuyển về trang xác nhận đơn hàng dù gặp lỗi VNPAY
          setTimeout(() => {
            router.push("/order-confirmation");
          }, 100);
        }
      } else {
        // Các phương thức thanh toán khác
        setTimeout(() => {
          router.push("/order-confirmation");
        }, 100);
      }
    } catch (error) {
      // Xử lý hiển thị lỗi - giữ nguyên code của bạn
      if (error instanceof Error) {
        try {
          if (error.message.includes('{"message":')) {
            const errorJson = JSON.parse(
              error.message.substring(error.message.indexOf("{"))
            );
            setOrderError(errorJson.message);
          } else {
            setOrderError(error.message);
          }
        } catch {
          setOrderError(error.message);
        }
      } else {
        setOrderError("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  // Reset pendingOrderId when payment method changes
  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMethod = parseInt(e.target.value) as PaymentMethodId;
    setPaymentMethod(newMethod);
    setErrors((prev) => ({ ...prev, paymentMethod: "" }));
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BreadcrumbTrail items={breadcrumbs} />
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <LoadingSpinner size="lg" text="Đang tải thông tin thanh toán..." />
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Shipping Information */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                Thông tin giao hàng
              </h2>

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
                    Bạn chưa có địa chỉ nào. Vui lòng nhập thông tin giao hàng
                    bên dưới.
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
                              selectedAddressId === Number(address.id)
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
                                  setSelectedAddressId(Number(address.id));
                                  populateShippingInfo(address);
                                }}
                                className={`w-full py-2 px-4 rounded text-sm ${
                                  selectedAddressId === Number(address.id)
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }`}
                              >
                                {selectedAddressId === Number(address.id)
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
                  <label
                    htmlFor="name-input"
                    className="block mb-1 font-medium"
                  >
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                {/* sdt */}
                <div>
                  <label
                    htmlFor="phone-input"
                    className="block mb-1 font-medium"
                  >
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
                      {shippingInfo.district &&
                        locations[shippingInfo.city as keyof LocationsType]?.[
                          shippingInfo.district
                        ]?.map((ward: string) => (
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
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">
                  Thông tin đơn hàng
                </h2>

                {/* Mã giảm giá */}
                <div className="mb-4">
                  <label
                    htmlFor="voucher-input"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mã giảm giá
                  </label>{" "}
                  <div>
                    <input
                      id="voucher-input"
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!!appliedVoucher || voucherLoading}
                    />
                    {voucherLoading && (
                      <div className="mt-2 text-sm text-gray-600 flex items-center">
                        <span className="animate-spin mr-2 h-3 w-3 border-t-2 border-b-2 border-gray-600 rounded-full inline-block"></span>
                        Đang kiểm tra mã giảm giá...
                      </div>
                    )}
                  </div>
                  {voucherError && (
                    <p className="text-red-500 text-sm mt-1">{voucherError}</p>
                  )}
                  {appliedVoucher && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div>
                        <span className="text-green-700 font-medium text-sm">
                          Mã giảm giá: {appliedVoucher.code}
                        </span>
                        <span className="text-green-600 text-xs block">
                          Giảm:{" "}
                          {appliedVoucher.discount.toLocaleString("vi-VN")}đ
                        </span>
                        {appliedVoucher.minOrderValue > 0 && (
                          <span className="text-green-600 text-xs">
                            Áp dụng cho đơn hàng từ{" "}
                            {appliedVoucher.minOrderValue.toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedVoucher(null);
                          setVoucherCode("");
                          // Reset discount in orderSummary
                          setOrderSummary((prev) => ({
                            ...prev,
                            discount: 0,
                            total: prev.subtotal + prev.deliveryFee,
                          }));

                          // Update sessionStorage as well
                          const orderDataString =
                            sessionStorage.getItem("pendingOrder");
                          if (orderDataString) {
                            const orderData = JSON.parse(orderDataString);
                            orderData.summary.voucherDiscount = 0;
                            orderData.summary.total =
                              orderData.summary.subtotal +
                              orderData.summary.deliveryFee;
                            orderData.summary.appliedVoucher = null;
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
                      <span className="font-medium text-red-600">
                        -{orderSummary.discount.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">
                      Phí vận chuyển
                      {calculatingShippingFee && (
                        <span className="ml-2 inline-block">
                          <span className="animate-spin h-3 w-3 border-t-2 border-b-2 border-gray-600 rounded-full inline-block"></span>
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      {orderSummary.baseShippingFee.toLocaleString("vi-VN")} VND
                    </span>
                  </div>

                  {orderSummary.shippingDiscount > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Giảm giá vận chuyển</span>
                      <span className="font-medium text-red-600">
                        -{orderSummary.shippingDiscount.toLocaleString("vi-VN")}{" "}
                        VND
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 pt-3">
                    <span className="font-semibold">Tổng</span>
                    <span className="font-bold text-lg">
                      {orderSummary.total.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                </div>
                {/* Order Summary */}
                {orderError && (
                  <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <span className="block sm:inline">{orderError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white py-3 rounded mt-6 hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Đang xử lý...
                    </span>
                  ) : (
                    "Đặt Hàng"
                  )}
                </button>
              </div>{" "}
            </div>
            {/* Phương thức thanh toán */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">
                  Phương thức thanh toán
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* COD */}
                  <label
                    className={`flex items-center border rounded-lg p-4 cursor-pointer ${
                      paymentMethod === PaymentMethodId.COD
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethodId.COD}
                      checked={paymentMethod === PaymentMethodId.COD}
                      onChange={handlePaymentMethodChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <Image
                        src={imgCod}
                        alt="COD"
                        width={40}
                        height={40}
                        className="object-contain"
                      />{" "}
                      <div>
                        <p className="font-medium text-gray-900">COD</p>
                        <p className="text-sm text-gray-500">
                          {PAYMENT_METHOD_NAMES[PaymentMethodId.COD]}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Momo */}
                  <label
                    className={`flex items-center border rounded-lg p-4 cursor-pointer ${
                      paymentMethod === PaymentMethodId.MOMO
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethodId.MOMO}
                      checked={paymentMethod === PaymentMethodId.MOMO}
                      onChange={handlePaymentMethodChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <Image
                        src={imgMomo}
                        alt="Momo"
                        width={40}
                        height={40}
                        className="object-contain"
                      />{" "}
                      <div>
                        <p className="font-medium text-gray-900">Momo</p>
                        <p className="text-sm text-gray-500">
                          {PAYMENT_METHOD_NAMES[PaymentMethodId.MOMO]}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* ZaloPay */}
                  <label
                    className={`flex items-center border rounded-lg p-4 cursor-pointer ${
                      paymentMethod === PaymentMethodId.ZALOPAY
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethodId.ZALOPAY}
                      checked={paymentMethod === PaymentMethodId.ZALOPAY}
                      onChange={handlePaymentMethodChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <Image
                        src={imgZalopay}
                        alt="ZaloPay"
                        width={40}
                        height={40}
                        className="object-contain"
                      />{" "}
                      <div>
                        <p className="font-medium text-gray-900">ZaloPay</p>
                        <p className="text-sm text-gray-500">
                          {PAYMENT_METHOD_NAMES[PaymentMethodId.ZALOPAY]}
                        </p>{" "}
                      </div>
                    </div>
                  </label>

                  {/* VNPAY */}
                  <label
                    className={`flex items-center border rounded-lg p-4 cursor-pointer ${
                      paymentMethod === PaymentMethodId.VNPAY
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethodId.VNPAY}
                      checked={paymentMethod === PaymentMethodId.VNPAY}
                      onChange={handlePaymentMethodChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <Image
                        src={imgZalopay}
                        alt="VNPAY"
                        width={40}
                        height={40}
                        className="object-contain"
                      />{" "}
                      <div>
                        <p className="font-medium text-gray-900">VNPAY</p>
                        <p className="text-sm text-gray-500">
                          {PAYMENT_METHOD_NAMES[PaymentMethodId.VNPAY]}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
