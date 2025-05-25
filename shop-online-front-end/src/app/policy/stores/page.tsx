"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import img1 from "@/assets/imgs/store/store1.webp";

// Dữ liệu mẫu các cửa hàng
const storeLocations = [
  {
    id: 1,
    name: "Online Store Flagship Store",
    address: "123 Đường Nguyễn Huệ, Quận 1",
    city: "TP. Hồ Chí Minh",
    phone: "028 1234 5678",
    hours: "09:00 - 22:00",
    image: img1,
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241668556!2d106.70141067469741!3d10.77684088936141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a5bb9972!2zMTIzIMSQxrDhu51uZyBOZ3V54buFbiBI4buHLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1711717168370!5m2!1svi!2s",
    featured: true,
  },
  {
    id: 2,
    name: "Online Store - Aeon Mall",
    address:
      "Tầng 2, AEON Mall Tân Phú, 30 Bờ Bao Tân Thắng, P. Sơn Kỳ, Quận Tân Phú",
    city: "TP. Hồ Chí Minh",
    phone: "028 1234 5679",
    hours: "10:00 - 22:00",
    image: "/images/store1.jpg",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241668556!2d106.70141067469741!3d10.77684088936141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a5bb9972!2zMTIzIMSQxrDhu51uZyBOZ3V54buFbiBI4buHLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1711717168370!5m2!1svi!2s",
    featured: false,
  },
  {
    id: 3,
    name: "Online Store - Vincom Center",
    address:
      "Tầng 3, Vincom Center Đồng Khởi, 72 Lê Thánh Tôn, P. Bến Nghé, Quận 1",
    city: "TP. Hồ Chí Minh",
    phone: "028 1234 5680",
    hours: "09:30 - 22:00",
    image: "/images/store1.jpg",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241668556!2d106.70141067469741!3d10.77684088936141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a5bb9972!2zMTIzIMSQxrDhu51uZyBOZ3V54buFbiBI4buHLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1711717168370!5m2!1svi!2s",
    featured: false,
  },
  {
    id: 4,
    name: "Online Store - Royal City",
    address: "Tầng B1, TTTM Royal City, 72A Nguyễn Trãi, Thanh Xuân",
    city: "Hà Nội",
    phone: "024 1234 5678",
    hours: "09:30 - 22:00",
    image: "/images/store1.jpg",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6464057083827!2d105.81374612432!3d21.001735788966254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac9788f9d72b%3A0xec5aa3dbc99feeb!2sVincom%20Mega%20Mall%20Royal%20City!5e0!3m2!1svi!2s!4v1711717219702!5m2!1svi!2s",
    featured: true,
  },
  {
    id: 5,
    name: "Online Store - Times City",
    address: "Tầng B1, TTTM Times City, 458 Minh Khai, Hai Bà Trưng",
    city: "Hà Nội",
    phone: "024 1234 5679",
    hours: "09:30 - 22:00",
    image: "/images/store1.jpg",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.8782388426904!2d105.86618451491156!3d21.007010793923903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135adc7bc5ae357%3A0x4e777a89f8670fad!2sVincom%20Mega%20Mall%20Times%20City!5e0!3m2!1svi!2s!4v1711717245158!5m2!1svi!2s",
    featured: false,
  },
  {
    id: 6,
    name: "Online Store - Đà Nẵng",
    address: "Tầng 1, Vincom Plaza Ngô Quyền, 910 Ngô Quyền, Quận Sơn Trà",
    city: "Đà Nẵng",
    phone: "0236 1234 5678",
    hours: "09:00 - 21:30",
    image: "/images/store1.jpg",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.1104354063055!2d108.22906701485916!3d16.060975888885896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142183691882913%3A0x1dabf3b5a24198b9!2zOTEwIMSQxrDhu51uZyBOZ8O0IFF1eeG7gW4sIEFuIEjhuqNpIELhuq9jLCBTxqFuIFRyw6AsIMSQw6AgTuG6tW5nIDU1MDAwMCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1711717293862!5m2!1svi!2s",
    featured: false,
  },
];

// Danh sách các thành phố để lọc
const cities = [...new Set(storeLocations.map((store) => store.city))];

export default function StoresPage() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [visibleMaps, setVisibleMaps] = useState<Record<number, boolean>>({});
  // Lọc cửa hàng theo thành phố
  const filteredStores =
    selectedCity === "all"
      ? storeLocations
      : storeLocations.filter((store) => store.city === selectedCity);

  // Xử lý khi click vào cửa hàng để xem bản đồ
  const handleStoreClick = (storeId: number) => {
    setVisibleMaps((prev) => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-purple-50">
            <h1 className="text-3xl font-bold mb-2">Hệ thống cửa hàng</h1>
            <p className="text-gray-600 mb-8">
              Tìm cửa hàng gần bạn nhất để trải nghiệm sản phẩm trực tiếp
            </p>
          </div>

          {/* Bộ lọc thành phố */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium">Chọn thành phố:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedCity === "all"
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCity("all")}
                >
                  Tất cả
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    className={`px-4 py-2 rounded-full ${
                      selectedCity === city
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cửa hàng nổi bật */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Cửa hàng nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStores
                .filter((store) => store.featured)
                .map((store) => (
                  <div
                    key={store.id}
                    className="bg-white shadow-md rounded-lg overflow-hidden"
                  >
                    <div className="relative h-56">
                      <Image
                        src={store.image}
                        alt={store.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="text-white p-4">
                          <h3 className="text-xl font-bold">{store.name}</h3>
                          <p className="text-white/80 text-sm">{store.city}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm mb-2">{store.address}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <p>Điện thoại: {store.phone}</p>
                        <p>Giờ mở cửa: {store.hours}</p>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => handleStoreClick(store.id)}
                          className="text-blue-600 hover:underline"
                        >
                          {visibleMaps[store.id] ? "Ẩn bản đồ" : "Xem bản đồ"}
                        </button>
                        <Link
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            store.address + ", " + store.city
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Chỉ đường
                        </Link>
                      </div>
                      {/* Map embed */}
                      {visibleMaps[store.id] && (
                        <div className="mt-4 h-64">
                          <iframe
                            src={store.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Bản đồ ${store.name}`}
                          ></iframe>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Danh sách cửa hàng */}
          <div>
            <h2 className="text-xl font-bold mb-6">Tất cả cửa hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredStores
                .filter((store) => !store.featured)
                .map((store) => (
                  <div
                    key={store.id}
                    className="bg-white shadow-md rounded-lg overflow-hidden"
                  >
                    <div className="relative h-40">
                      <Image
                        src={store.image}
                        alt={store.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                      <p className="text-gray-500 text-sm mb-3">{store.city}</p>
                      <p className="text-sm mb-2">{store.address}</p>
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <p>Điện thoại: {store.phone}</p>
                        <p>Giờ mở cửa: {store.hours}</p>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => handleStoreClick(store.id)}
                          className="text-blue-600 hover:underline"
                        >
                          {visibleMaps[store.id] ? "Ẩn bản đồ" : "Xem bản đồ"}
                        </button>
                        <Link
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            store.address + ", " + store.city
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Chỉ đường
                        </Link>
                      </div>
                      {/* Map embed */}
                      {visibleMaps[store.id] && (
                        <div className="mt-4 h-64">
                          <iframe
                            src={store.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Bản đồ ${store.name}`}
                          ></iframe>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Thông tin hỗ trợ */}
          <div className="mt-16 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Cần hỗ trợ thêm?</h2>
            <p className="mb-4">
              Nếu bạn cần thêm thông tin về cửa hàng hoặc dịch vụ của chúng tôi,
              vui lòng liên hệ:
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="bg-gray-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Tổng đài hỗ trợ</p>
                  <p className="text-lg font-bold">1800-1234</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="bg-gray-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Email hỗ trợ</p>
                  <p className="text-lg font-bold">support@shop-online.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
