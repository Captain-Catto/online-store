"use client";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import { useState } from "react";
// import Image from "next/image";

export default function ShippingPolicyPage() {
  // Dữ liệu cho ví dụ áp dụng
  const shippingExamples = [
    {
      orderValue: "800.000đ",
      shippingFee: "30.000đ",
      discount: "0đ",
      finalFee: "30.000đ",
      note: "Đơn hàng dưới 1.000.000đ không được miễn phí vận chuyển",
    },
    {
      orderValue: "2.500.000đ",
      shippingFee: "60.000đ",
      discount: "60.000đ",
      finalFee: "0đ",
      note: "Đơn hàng trên 1.000.000đ được miễn phí vận chuyển hoàn toàn",
    },
    {
      orderValue: "1.500.000đ",
      shippingFee: "120.000đ",
      discount: "100.000đ",
      finalFee: "20.000đ",
      note: "Phí vận chuyển vượt quá 100.000đ, chỉ được giảm tối đa 100.000đ",
    },
  ];

  // Dữ liệu các bước vận chuyển
  const shippingSteps = [
    {
      step: 1,
      title: "Đặt hàng",
      description: "Đặt hàng trên website, app hoặc tại cửa hàng của chúng tôi",
    },
    {
      step: 2,
      title: "Xác nhận đơn hàng",
      description: "Đơn hàng được xác nhận và chuẩn bị trong vòng 24 giờ",
    },
    {
      step: 3,
      title: "Đơn vị vận chuyển",
      description: "Đơn hàng được bàn giao cho đơn vị vận chuyển",
    },
    {
      step: 4,
      title: "Giao hàng",
      description: "Đơn hàng được giao đến địa chỉ của bạn",
    },
  ];

  // Dữ liệu cho các câu hỏi thường gặp về vận chuyển
  const faqItems = [
    {
      id: "faq1",
      question: "Làm thế nào để tôi được miễn phí vận chuyển?",
      answer:
        "Đơn hàng có giá trị từ 1.000.000đ trở lên sẽ được miễn phí vận chuyển, với mức phí tối đa là 100.000đ. Nếu phí vận chuyển vượt quá 100.000đ, bạn sẽ chỉ được giảm tối đa 100.000đ và phải trả phần chênh lệch.",
    },
    {
      id: "faq2",
      question:
        "Chính sách miễn phí vận chuyển có áp dụng cho tất cả các sản phẩm không?",
      answer:
        "Chính sách miễn phí vận chuyển áp dụng cho tất cả các sản phẩm trên hệ thống của chúng tôi, không có ngoại lệ. Tuy nhiên, đối với đơn hàng có sản phẩm khuyến mãi đặc biệt, vui lòng kiểm tra điều khoản của chương trình khuyến mãi đó.",
    },
    {
      id: "faq3",
      question: "Phí vận chuyển được tính như thế nào?",
      answer:
        "Phí vận chuyển được tính dựa trên trọng lượng, kích thước của đơn hàng và khoảng cách giao hàng. Thông thường phí vận chuyển dao động từ 20.000đ đến 120.000đ tùy thuộc vào các yếu tố trên.",
    },
    {
      id: "faq4",
      question:
        "Nếu tôi trả lại hàng, tôi có được hoàn lại phí vận chuyển không?",
      answer:
        "Nếu việc trả hàng là do lỗi của chúng tôi (sản phẩm lỗi, sai sản phẩm, v.v.), bạn sẽ được hoàn lại toàn bộ phí vận chuyển. Trong trường hợp trả hàng vì lý do cá nhân, phí vận chuyển sẽ không được hoàn lại và bạn có thể phải chịu phí vận chuyển cho việc trả hàng.",
    },
    {
      id: "faq5",
      question: "Tôi có thể theo dõi đơn hàng của mình không?",
      answer:
        "Có, bạn có thể theo dõi đơn hàng của mình thông qua trang tài khoản cá nhân. Chúng tôi cũng sẽ gửi thông tin theo dõi đơn hàng qua SMS và email khi đơn hàng được giao cho đơn vị vận chuyển.",
    },
  ];

  // State để kiểm soát việc mở/đóng FAQ
  const [openFaqs, setOpenFaqs] = useState({
    faq1: true,
    faq2: false,
    faq3: false,
    faq4: false,
    faq5: false,
  });

  // Hàm toggle để mở/đóng FAQ
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
            <span className="text-black font-medium">Vận chuyển</span>
          </nav>

          {/* Page Header */}
          <div className="border-b pb-6 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Chính Sách Vận Chuyển
            </h1>
            <p className="text-gray-600">
              Shop Online cam kết mang đến trải nghiệm mua sắm thuận tiện nhất
              với chính sách vận chuyển rõ ràng và ưu đãi.
            </p>
          </div>

          {/* Free Shipping Highlight */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 lg:p-6 rounded-r mb-10">
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              MIỄN PHÍ VẬN CHUYỂN với đơn hàng từ 1.000.000đ
            </h2>
            <p className="text-blue-700">
              Đặt hàng với giá trị từ 1.000.000đ và được miễn phí vận chuyển
              (tối đa 100.000đ). Áp dụng cho tất cả đơn hàng trên hệ thống của
              chúng tôi!
            </p>
          </div>

          {/* Shipping Policy Info */}
          <div className="space-y-10 mb-12">
            {/* Free Shipping Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                Chính sách miễn phí vận chuyển
              </h2>
              <div className="space-y-4">
                <p>
                  Chúng tôi hiểu rằng phí vận chuyển có thể là một yếu tố quan
                  trọng khi bạn quyết định mua sắm online. Vì vậy, chúng tôi đã
                  triển khai chính sách miễn phí vận chuyển hấp dẫn để bạn có
                  thể thoải mái mua sắm mà không lo lắng về chi phí vận chuyển.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">
                    Điều kiện áp dụng
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Giá trị đơn hàng:</span> Từ
                      1.000.000đ trở lên (sau khi đã áp dụng giảm giá, không bao
                      gồm phí vận chuyển)
                    </li>
                    <li>
                      <span className="font-medium">Mức ưu đãi:</span> Miễn phí
                      vận chuyển tối đa 100.000đ
                    </li>
                    <li>
                      <span className="font-medium">Áp dụng:</span> Cho tất cả
                      sản phẩm trên hệ thống
                    </li>
                    <li>
                      <span className="font-medium">Phạm vi:</span> Áp dụng cho
                      tất cả các khu vực giao hàng
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Examples */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Ví dụ áp dụng</h2>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Giá trị đơn hàng
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phí vận chuyển
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Giảm giá
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phí cuối cùng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shippingExamples.map((example, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {example.orderValue}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {example.shippingFee}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                          -{example.discount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {example.finalFee}
                          <p className="text-xs text-gray-500 font-normal mt-1">
                            {example.note}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Shipping Process */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Quy trình vận chuyển</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {shippingSteps.map((step) => (
                  <div
                    key={`step-${step.step}`}
                    className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                      <span className="text-xl font-bold">{step.step}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  <span className="font-medium">
                    Thời gian giao hàng dự kiến:
                  </span>{" "}
                  2-7 ngày làm việc tùy thuộc vào khu vực giao hàng.
                </p>
                <p className="mt-2">
                  <span className="font-medium">Theo dõi đơn hàng:</span> Bạn có
                  thể theo dõi đơn hàng của mình trong tài khoản cá nhân hoặc
                  thông qua tin nhắn SMS và email cập nhật từ chúng tôi.
                </p>
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
            <h2 className="text-xl font-bold mb-4">
              Cần hỗ trợ về vận chuyển?
            </h2>
            <p className="mb-4">
              Nếu bạn cần thêm thông tin về chính sách vận chuyển hoặc muốn kiểm
              tra tình trạng đơn hàng của mình, vui lòng liên hệ:
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
                  Hotline hỗ trợ: <strong>1800-XXXX</strong> (8h-22h hàng ngày)
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
                  Email: <strong>shipping@shoponline.com</strong>
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
