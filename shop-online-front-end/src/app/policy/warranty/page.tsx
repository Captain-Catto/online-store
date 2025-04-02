"use client";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
// import Image from "next/image";
import { useState } from "react";

export default function WarrantyPage() {
  // Dữ liệu cho điều kiện bảo hành
  const warrantyConditions = [
    "Sản phẩm còn thời hạn bảo hành (có hóa đơn mua hàng)",
    "Nhãn mác, tem của sản phẩm còn nguyên vẹn",
    "Lỗi phát sinh do quy trình sản xuất hoặc chất lượng vải",
    "Sản phẩm được sử dụng và bảo quản đúng theo hướng dẫn",
  ];

  const nonWarrantyConditions = [
    "Hết thời hạn bảo hành",
    "Sản phẩm đã bị giặt/sấy không đúng hướng dẫn ghi trên nhãn",
    "Sản phẩm bị hư hỏng do tai nạn, sử dụng sai mục đích",
    "Sản phẩm bị biến dạng do giặt ủi không đúng cách",
  ];

  // Dữ liệu cho thời gian bảo hành
  const warrantyPeriods = [
    "Quần jeans, quần kaki: 12-24 tháng",
    "Áo thun, áo sơ mi: 3-6 tháng",
    "Phụ kiện thời trang: 1-3 tháng",
  ];

  // Dữ liệu cho phạm vi bảo hành
  const warrantyCoverage = [
    "Lỗi đường may, chỉ thừa",
    "Lỗi nút, khóa kéo, cúc áo",
    "Lỗi bạc màu không đúng tiêu chuẩn",
    "Lỗi co rút vải quá mức cho phép",
  ];

  // Dữ liệu cho quy trình bảo hành
  const warrantyProcess = [
    {
      step: 1,
      title: "Đăng ký bảo hành",
      description:
        "Mang sản phẩm cùng hóa đơn đến cửa hàng hoặc gửi yêu cầu qua hotline/email",
    },
    {
      step: 2,
      title: "Kiểm tra sản phẩm",
      description:
        "Nhân viên chuyên môn sẽ kiểm tra và xác định lỗi của sản phẩm",
    },
    {
      step: 3,
      title: "Sửa chữa hoặc đổi mới",
      description:
        "Tiến hành sửa chữa, hoặc đổi sản phẩm mới tương đương nếu không sửa được",
    },
  ];

  // Dữ liệu cho hướng dẫn bảo quản
  const careInstructions = {
    shirts: [
      "Giặt với nhiệt độ không quá 30°C",
      "Không sử dụng chất tẩy mạnh",
      "Nên giặt mặt trái",
      "Phơi trong bóng râm",
    ],
    pants: [
      "Tránh giặt quá nhiều lần để giữ màu",
      "Giặt mặt trái, nhiệt độ nước không quá 30°C",
      "Không sấy khô bằng máy",
      "Là ủi nhiệt độ trung bình nếu cần thiết",
    ],
  };

  // Dữ liệu cho FAQ
  const faqItems = [
    {
      id: "faq1",
      question: "Tôi không còn giữ hóa đơn, có được bảo hành không?",
      answer:
        "Chúng tôi vẫn có thể kiểm tra thông tin mua hàng qua hệ thống nếu bạn cung cấp số điện thoại hoặc email đã sử dụng khi mua hàng. Trong trường hợp không thể xác minh, việc bảo hành sẽ phụ thuộc vào quyết định của cửa hàng.",
    },
    {
      id: "faq2",
      question: "Làm thế nào để đăng ký bảo hành online?",
      answer:
        "Bạn có thể đăng ký bảo hành online bằng cách liên hệ qua hotline 1800-XXXX hoặc email. Sau đó, chúng tôi sẽ hướng dẫn bạn gửi sản phẩm đến trung tâm bảo hành.",
    },
    {
      id: "faq3",
      question: "Thời gian thực hiện bảo hành là bao lâu?",
      answer:
        "Thời gian thực hiện bảo hành thông thường từ 3-7 ngày làm việc, tùy thuộc vào loại lỗi và tình trạng sản phẩm. Đối với những trường hợp đặc biệt, chúng tôi sẽ thông báo cụ thể cho khách hàng.",
    },
  ];

  // thêm state để kiểm soát việc mở/đóng FAQ
  const [openFaqs, setOpenFaqs] = useState({
    faq1: true,
    faq2: false,
    faq3: false,
  });

  // hàm toggle để mở/đóng FAQ
  const toggleFaq = (faq: keyof typeof openFaqs) => {
    setOpenFaqs((prevState) => ({
      ...prevState,
      [faq]: !prevState[faq],
    }));
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6 text-sm">
            <Link href="/" className="text-gray-500 hover:text-black">
              Trang chủ
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/policy" className="text-gray-500 hover:text-black">
              Chính sách
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-black font-medium">Bảo hành</span>
          </nav>

          {/* Page Header */}
          <div className="border-b pb-6 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Chính Sách Bảo Hành
            </h1>
            <p className="text-gray-600">
              Chúng tôi cam kết mang đến cho bạn sản phẩm chất lượng cao và dịch
              vụ bảo hành tốt nhất cho các sản phẩm thời trang.
            </p>
          </div>

          {/* Policy Highlight */}
          <div className="bg-amber-50 border-l-4 border-blue-500 p-4 lg:p-6 rounded-r mb-10">
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              Bảo hành từ 30 ngày đến 2 năm
            </h2>
            <p className="text-blue-700">
              Tất cả sản phẩm quần áo chính hãng được mua tại Shop Online đều
              được bảo hành từ 30 ngày đến 2 năm tùy theo loại sản phẩm.
            </p>
          </div>

          {/* Warranty Info */}
          <div className="space-y-10 mb-12">
            {/* General Warranty */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                Chính sách bảo hành chung
              </h2>
              <div className="space-y-4">
                <p>
                  Tất cả sản phẩm thời trang do Shop Online bán ra đều được bảo
                  hành về chất lượng vải, đường may, và các chi tiết khác theo
                  chính sách của nhãn hàng.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2">
                      Thời gian bảo hành
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {warrantyPeriods.map((period, index) => (
                        <li key={`period-${index}`}>{period}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2">
                      Phạm vi bảo hành
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {warrantyCoverage.map((coverage, index) => (
                        <li key={`coverage-${index}`}>{coverage}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Warranty Process */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Quy trình bảo hành</h2>
              <div className="space-y-6">
                <p>
                  Chúng tôi cam kết mang đến trải nghiệm bảo hành thuận tiện và
                  hiệu quả nhất cho khách hàng.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {warrantyProcess.map((process) => (
                    <div
                      key={`process-${process.step}`}
                      className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                        <span className="text-xl font-bold">
                          {process.step}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{process.title}</h3>
                      <p className="text-sm text-gray-600">
                        {process.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Warranty Conditions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Điều kiện bảo hành</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-green-700 mb-3">
                    Sản phẩm được bảo hành khi
                  </h3>
                  <ul className="space-y-2">
                    {warrantyConditions.map((condition, index) => (
                      <li
                        key={`warranty-${index}`}
                        className="flex items-start"
                      >
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5"
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
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-700 mb-3">
                    Sản phẩm không được bảo hành khi
                  </h3>
                  <ul className="space-y-2">
                    {nonWarrantyConditions.map((condition, index) => (
                      <li
                        key={`non-warranty-${index}`}
                        className="flex items-start"
                      >
                        <svg
                          className="w-5 h-5 text-red-500 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Tips for clothing care */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                Hướng dẫn bảo quản quần áo
              </h2>
              <p className="mb-4">
                Để sản phẩm luôn bền đẹp và kéo dài tuổi thọ, vui lòng tham khảo
                các hướng dẫn sau:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Áo thun, áo sơ mi</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {careInstructions.shirts.map((instruction, index) => (
                      <li key={`shirt-care-${index}`}>{instruction}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Quần jeans, quần kaki</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {careInstructions.pants.map((instruction, index) => (
                      <li key={`pant-care-${index}`}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>

              <div className="space-y-4">
                {faqItems.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      className="flex justify-between items-center w-full px-4 py-3 font-medium text-left bg-gray-50 hover:bg-gray-100 transition-all"
                      onClick={() => toggleFaq(faq.id as keyof typeof openFaqs)}
                    >
                      <span>{faq.question}</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          openFaqs[faq.id as keyof typeof openFaqs]
                            ? "rotate-180"
                            : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div
                      className={`px-4 py-3 bg-white transition-all duration-200 ease-in-out ${
                        openFaqs[faq.id as keyof typeof openFaqs]
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0 hidden"
                      }`}
                    >
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Contact info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Cần hỗ trợ thêm?</h2>
            <p className="mb-4">
              Nếu bạn cần thêm thông tin về chính sách bảo hành hoặc có câu hỏi
              khác, vui lòng liên hệ:
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-1 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <span>
                  Hotline: <strong>1800-XXXX</strong>
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-1 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <span>
                  Email: <strong>support@shoponline.com</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
