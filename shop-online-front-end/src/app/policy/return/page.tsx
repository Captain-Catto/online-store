"use client";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import { useState } from "react";

export default function ReturnPolicyPage() {
  // Dữ liệu cho điều kiện đổi trả
  const returnConditions = [
    "Sản phẩm còn nguyên tem mác, chưa qua sử dụng",
    "Có hóa đơn mua hàng hoặc đơn hàng online",
    "Sản phẩm không bị hư hỏng, bẩn, có mùi lạ hoặc đã qua giặt tẩy",
    "Thời gian trong vòng 365 ngày kể từ ngày mua hàng",
  ];

  const nonReturnConditions = [
    "Sản phẩm đã qua sử dụng, giặt là, bẩn, hư hỏng",
    "Sản phẩm thuộc danh mục đồ lót, tất, phụ kiện (trừ trường hợp lỗi từ nhà sản xuất)",
    "Không có hóa đơn hoặc không thể xác minh thông tin mua hàng",
    "Sản phẩm mua trong chương trình khuyến mãi có ghi rõ 'không áp dụng đổi trả'",
  ];

  // Dữ liệu cho quy trình đổi trả
  const returnProcess = [
    {
      step: 1,
      title: "Kiểm tra điều kiện",
      description:
        "Bạn kiểm tra xem sản phẩm có đáp ứng đủ điều kiện đổi trả không",
    },
    {
      step: 2,
      title: "Liên hệ cửa hàng",
      description:
        "Liên hệ cửa hàng trực tiếp, qua hotline hoặc email để đăng ký đổi trả",
    },
    {
      step: 3,
      title: "Đổi hàng/Hoàn tiền",
      description:
        "Mang sản phẩm đến cửa hàng hoặc gửi qua đơn vị vận chuyển để được đổi trả",
    },
    {
      step: 4,
      title: "Nhận hàng mới/Hoàn tiền",
      description:
        "Nhận sản phẩm mới hoặc hoàn tiền theo phương thức thanh toán ban đầu",
    },
  ];

  // Dữ liệu cho hình thức đổi trả
  const returnOptions = [
    {
      title: "Đổi trực tiếp tại cửa hàng",
      steps: [
        "Mang sản phẩm cùng hóa đơn đến bất kỳ cửa hàng nào của chúng tôi",
        "Nhân viên sẽ kiểm tra và xác nhận sản phẩm",
        "Bạn có thể chọn sản phẩm khác hoặc nhận hoàn tiền ngay lập tức",
        "Thời gian xử lý: 5-10 phút",
      ],
    },
    {
      title: "Đổi trả online",
      steps: [
        "Đăng ký đổi trả qua website hoặc gọi hotline 1800-XXXX",
        "Đóng gói sản phẩm cùng với hóa đơn hoặc mã đơn hàng",
        "Gửi lại cho chúng tôi qua đơn vị vận chuyển (miễn phí)",
        "Thời gian xử lý: 7-14 ngày tùy vị trí địa lý",
      ],
    },
  ];

  // Dữ liệu cho FAQ
  const faqItems = [
    {
      id: "faq1",
      question: "Tôi có thể đổi trả sản phẩm sau 365 ngày được không?",
      answer:
        "Chính sách đổi trả miễn phí của chúng tôi chỉ áp dụng trong 365 ngày kể từ ngày mua hàng. Sau thời gian này, bạn có thể liên hệ bộ phận Chăm sóc Khách hàng để được hỗ trợ trong từng trường hợp cụ thể.",
    },
    {
      id: "faq2",
      question: "Tôi không có hóa đơn mua hàng, có thể đổi trả không?",
      answer:
        "Nếu bạn mua online, chúng tôi có thể kiểm tra bằng email hoặc số điện thoại đã đặt hàng. Nếu mua tại cửa hàng, hãy cung cấp thông tin về thời gian, địa điểm mua hàng để chúng tôi hỗ trợ kiểm tra. Tuy nhiên, việc không có hóa đơn có thể khiến quá trình đổi trả kéo dài hơn.",
    },
    {
      id: "faq3",
      question: "Sản phẩm khuyến mãi có được đổi trả không?",
      answer:
        "Hầu hết sản phẩm khuyến mãi đều được áp dụng chính sách đổi trả 365 ngày, trừ những chương trình có ghi rõ 'không áp dụng đổi trả'. Bạn có thể đổi sang sản phẩm khác có giá trị tương đương hoặc cao hơn (sẽ thanh toán thêm phần chênh lệch).",
    },
    {
      id: "faq4",
      question: "Tôi có thể đổi sang sản phẩm khác màu/size không?",
      answer:
        "Hoàn toàn được. Bạn có thể đổi sang cùng một sản phẩm với màu sắc hoặc kích thước khác, hoặc đổi sang một sản phẩm hoàn toàn khác với giá trị tương đương hoặc cao hơn (thanh toán thêm phần chênh lệch).",
    },
    {
      id: "faq5",
      question: "Chi phí vận chuyển đổi trả như thế nào?",
      answer:
        "Chúng tôi áp dụng miễn phí vận chuyển chiều đi của sản phẩm. Bạn sẽ phải thanh toán phí vận chuyển khi gửi về ngoại trừ trường hợp sản phẩm bị lỗi . Chi phí vận chuyển chiều về (khi bạn nhận sản phẩm mới) sẽ được miễn phí nếu bạn chọn hình thức đổi trả online. Nếu bạn đến cửa hàng để đổi trả, chi phí vận chuyển sẽ không áp dụng.",
    },
  ];

  // thêm state để kiểm soát việc mở/đóng FAQ
  const [openFaqs, setOpenFaqs] = useState({
    faq1: true,
    faq2: false,
    faq3: false,
    faq4: false,
    faq5: false,
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
            <span className="text-black font-medium">Đổi trả</span>
          </nav>

          {/* Page Header */}
          <div className="border-b pb-6 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Chính Sách Đổi Trả 365 Ngày
            </h1>
            <p className="text-gray-600">
              Online Store cam kết bạn sẽ hài lòng với mọi sản phẩm của chúng
              tôi với chính sách đổi trả miễn phí trong 365 ngày.
            </p>
          </div>

          {/* Policy Highlight */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 lg:p-6 rounded-r mb-10">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Đổi trả dễ dàng trong 365 ngày
            </h2>
            <p className="text-green-700">
              Chúng tôi hiểu rằng đôi khi bạn cần thay đổi. Vì vậy, bạn có đến
              365 ngày để trả lại hoặc đổi sản phẩm mà không cần lý do - hoàn
              toàn miễn phí!
            </p>
          </div>

          {/* Return Policy Info */}
          <div className="space-y-10 mb-12">
            {/* Return Conditions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Điều kiện đổi trả</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-green-700 mb-3">
                    Sản phẩm được đổi trả khi
                  </h3>
                  <ul className="space-y-2">
                    {returnConditions.map((condition, index) => (
                      <li key={`return-${index}`} className="flex items-start">
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
                    Sản phẩm không được đổi trả khi
                  </h3>
                  <ul className="space-y-2">
                    {nonReturnConditions.map((condition, index) => (
                      <li
                        key={`non-return-${index}`}
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

            {/* Return Process */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Quy trình đổi trả</h2>
              <div className="space-y-6">
                <p>
                  Chúng tôi luôn nỗ lực để đảm bảo quá trình đổi trả sản phẩm
                  diễn ra nhanh chóng và thuận tiện nhất cho khách hàng.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {returnProcess.map((process) => (
                    <div
                      key={`process-${process.step}`}
                      className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
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

            {/* Return Options */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Hình thức đổi trả</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {returnOptions.map((option, optionIndex) => (
                  <div
                    key={`option-${optionIndex}`}
                    className="bg-gray-50 p-5 rounded-lg"
                  >
                    <h3 className="font-semibold text-lg mb-3">
                      {option.title}
                    </h3>
                    <ul className="space-y-2">
                      {option.steps.map((step, stepIndex) => (
                        <li
                          key={`option-${optionIndex}-step-${stepIndex}`}
                          className="flex items-start"
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 mr-2 text-xs font-bold">
                            {stepIndex + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Return vs Exchange */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                Chính sách hoàn tiền & đổi sản phẩm
              </h2>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Loại dịch vụ
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thời gian xử lý
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Chi phí
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Đổi sản phẩm
                        </div>
                        <div className="text-sm text-gray-500">
                          Đổi sang sản phẩm khác màu, size hoặc mẫu
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Tại cửa hàng: Ngay lập tức
                        </div>
                        <div className="text-sm text-gray-500">
                          Online: 3-7 ngày làm việc
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Miễn phí 100%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Hoàn tiền
                        </div>
                        <div className="text-sm text-gray-500">
                          Hoàn trả sản phẩm và nhận lại tiền
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Tiền mặt: 1-3 ngày làm việc
                        </div>
                        <div className="text-sm text-gray-500">
                          Thẻ/Chuyển khoản: 7-14 ngày làm việc
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Miễn phí 100%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-gray-600 italic">
                * Trường hợp đổi sang sản phẩm có giá trị cao hơn, khách hàng
                cần thanh toán phần chênh lệch. Nếu đổi sang sản phẩm có giá trị
                thấp hơn, chúng tôi sẽ hoàn lại phần chênh lệch.
              </p>
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
            <h2 className="text-xl font-bold mb-4">Cần hỗ trợ đổi trả?</h2>
            <p className="mb-4">
              Nếu bạn cần thêm thông tin về chính sách đổi trả hoặc muốn đăng ký
              đổi trả sản phẩm, vui lòng liên hệ:
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-1 mr-2"
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
                  Hotline đổi trả: <strong>1800-XXXX</strong> (Miễn phí, 8h-22h
                  hàng ngày)
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-1 mr-2"
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
                  Email: <strong>returns@shoponline.com</strong>
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
