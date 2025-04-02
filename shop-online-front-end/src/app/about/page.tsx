"use client";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import Image from "next/image";
import img from "../../assets/imgs/logo-coolmate-new-mobile-v2.svg";

export default function AboutPage() {
  // Dữ liệu cho phần các giá trị cốt lõi
  const coreValues = [
    {
      title: "Chất lượng",
      description:
        "Chúng tôi cam kết mang đến những sản phẩm thời trang với chất liệu và đường may tốt nhất.",
      icon: (
        <svg
          className="w-8 h-8 text-pink-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Phong cách",
      description:
        "Thiết kế theo xu hướng mới nhất kết hợp với phong cách đặc trưng riêng của Shop Online.",
      icon: (
        <svg
          className="w-8 h-8 text-pink-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          ></path>
        </svg>
      ),
    },
    {
      title: "Giá trị",
      description:
        "Chúng tôi tin rằng thời trang đẹp không nhất thiết phải đắt, nhưng phải mang lại giá trị thực.",
      icon: (
        <svg
          className="w-8 h-8 text-pink-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Khách hàng",
      description:
        "Đặt trải nghiệm của khách hàng lên hàng đầu, từ việc lựa chọn đến chăm sóc sau bán hàng.",
      icon: (
        <svg
          className="w-8 h-8 text-pink-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          ></path>
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6 text-sm">
            <Link href="/" className="text-gray-500 hover:text-black">
              Trang chủ
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-black font-medium">Giới thiệu</span>
          </nav>

          {/* Hero Section */}
          <div className="relative rounded-xl overflow-hidden mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 to-purple-600/80 z-10"></div>
            <div className="relative h-96 w-full">
              <Image
                src={img}
                alt="Fashion store interior"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="absolute inset-0 flex items-center z-20 p-8 lg:p-16">
              <div className="max-w-2xl">
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                  Thời trang phản ánh cá tính của bạn
                </h1>
                <p className="text-white text-lg lg:text-xl opacity-90">
                  Shop Online - Thương hiệu thời trang Việt với sứ mệnh mang đến
                  những sản phẩm chất lượng cao với giá cả hợp lý.
                </p>
              </div>
            </div>
          </div>

          {/* Our Story */}
          <section className="mb-16">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">
                  Câu chuyện của chúng tôi
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Shop Online được thành lập vào năm 2015 với một ý tưởng đơn
                    giản: tạo ra những sản phẩm thời trang chất lượng cao mà
                    người Việt có thể tiếp cận với mức giá hợp lý.
                  </p>
                  <p>
                    Chúng tôi bắt đầu với một cửa hàng nhỏ 20m2 tại Sài Gòn,
                    chuyên về quần áo nam nữ basic. Với phương châm &quot;Đơn
                    giản nhưng không đơn điệu&quot;, sản phẩm của chúng tôi
                    nhanh chóng được đón nhận và yêu thích.
                  </p>
                  <p>
                    Ngày nay, Shop Online đã phát triển thành một thương hiệu
                    thời trang được yêu thích với nhiều cửa hàng trên toàn quốc
                    và kênh bán hàng online phục vụ hàng nghìn khách hàng mỗi
                    ngày.
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 relative h-80 md:h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={img}
                  alt="Our store"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </section>

          {/* Our Mission */}
          <section className="mb-16 py-16 bg-gray-50 rounded-xl px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-xl text-gray-700 mb-8">
                &quot;Chúng tôi tin rằng thời trang không chỉ là về quần áo, mà
                còn là cách bạn thể hiện bản thân. Sứ mệnh của Shop Online là
                giúp mọi người tìm thấy phong cách riêng của họ thông qua những
                sản phẩm thời trang chất lượng, bền vững và giá cả phải
                chăng.&quot;
              </p>
              <div className="flex justify-center">
                <Link
                  href="/categories"
                  className="inline-block px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition"
                >
                  Khám phá các sản phẩm
                </Link>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Giá trị cốt lõi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Products */}
          <section className="mb-16">
            <div className="flex flex-col md:flex-row-reverse gap-8 lg:gap-16 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">
                  Sản phẩm của chúng tôi
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Các sản phẩm tại Shop Online được thiết kế với tiêu chí ưu
                    tiên chất lượng và sự thoải mái. Chúng tôi chọn lọc kỹ lưỡng
                    nguyên liệu và hợp tác với các nhà sản xuất uy tín để đảm
                    bảo mỗi chiếc áo, mỗi chiếc quần đều đạt tiêu chuẩn cao
                    nhất.
                  </p>
                  <p>
                    Bộ sưu tập của chúng tôi bao gồm từ những items cơ bản đến
                    các mẫu theo xu hướng mới nhất, luôn cập nhật theo mùa và
                    phù hợp với nhu cầu của khách hàng Việt Nam.
                  </p>
                  <p>
                    Chúng tôi cam kết mỗi sản phẩm đều trải qua quy trình kiểm
                    tra nghiêm ngặt trước khi đến tay khách hàng.
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 relative h-80 md:h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={img}
                  alt="Our products"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </section>

          {/* Customer Commitment */}
          <section className="mb-16 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Cam kết với khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex">
                <div className="mr-4 text-pink-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Chất lượng đảm bảo</h3>
                  <p className="text-gray-700">
                    Mỗi sản phẩm đều được kiểm tra kỹ lưỡng và đảm bảo chất
                    lượng. Nếu có bất kỳ vấn đề gì, chúng tôi sẵn sàng hoàn tiền
                    hoặc đổi sản phẩm mới.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4 text-pink-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Đổi trả dễ dàng</h3>
                  <p className="text-gray-700">
                    Chính sách đổi trả trong 365 ngày giúp bạn mua sắm mà không
                    phải lo lắng. Chúng tôi muốn bạn hoàn toàn hài lòng với sự
                    lựa chọn của mình.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4 text-pink-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    Giao hàng nhanh chóng
                  </h3>
                  <p className="text-gray-700">
                    Chúng tôi hợp tác với các đơn vị vận chuyển uy tín để đảm
                    bảo đơn hàng của bạn được giao đến nhanh chóng và an toàn.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4 text-pink-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Hỗ trợ 24/7</h3>
                  <p className="text-gray-700">
                    Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ
                    trợ bạn mọi lúc, mọi nơi qua nhiều kênh: chat, email,
                    hotline.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center mb-16 py-8">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn sàng trải nghiệm Shop Online?
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Khám phá bộ sưu tập mới nhất của chúng tôi và tìm cho mình những
              sản phẩm thời trang phù hợp với phong cách riêng của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition"
              >
                Mua sắm ngay
              </Link>
              <Link
                href="/policy"
                className="px-6 py-3 bg-white text-pink-600 font-medium rounded-lg border border-pink-600 hover:bg-pink-50 transition"
              >
                Xem chính sách
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
