"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Returns() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      {/* Banner chính */}
      <div className="w-full">
        <picture className="w-full">
          <source
            srcSet="/images/returns/banner-mobile.png"
            media="(max-width: 400px)"
          />
          <Image
            src="/images/returns/banner-desktop.jpg"
            alt="Chính sách đổi trả"
            width={1200}
            height={400}
            className="w-full"
            priority
          />
        </picture>
      </div>
      {/* Chính sách đổi trả */}
      <div className="mt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Đổi trả miễn phí</h2>
          <p className="text-lg mt-2">Trong vòng 60 ngày</p>
        </div>

        {/* Phần 1: Đối với sản phẩm đã mua */}
        <div className="grid md:grid-cols-2 gap-8 pb-8 border-b border-gray-200">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold mb-4">
              Đối với những sản phẩm bạn đã mua tại cửa hàng
            </h3>
            <p className="mb-4">
              Với những sản phẩm bạn đã mua tại cửa hàng, 60 ngày kể từ khi bạn
              nhận sản phẩm, bạn sẽ được đổi hàng và trả hàng với bất kỳ lý do
              gì, tối đa 3 lần/đơn đến khi ưng ý, bao gồm cả các sản phẩm đã qua
              giặt và sử dụng.
            </p>
            <p className="font-medium mb-2">Một số lưu ý:</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>
                Chúng tôi sẽ không áp dụng đổi trả với một số dòng sản phẩm nhất
                định như: Outlet, Áo in theo yêu cầu, Sản phẩm Săn Deal, Basics
                và sản phẩm được đóng gói theo Pack cố định.
              </li>
              <li>
                Nếu các bạn mua sản phẩm ở các sàn TMĐT, thì chúng tôi sẽ áp
                dụng trước chính sách đổi/trả của sàn TMĐT, nếu quá hạn của sàn
                TMĐT thì bạn có thể yêu cầu hỗ trợ từ CSKH của chúng tôi trực
                tiếp!
              </li>
            </ul>
            <Link
              href="https://forms.gle/WxEEuU2PzMHnGS1N7"
              target="_blank"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 text-center w-fit"
            >
              Đăng ký Đổi/Trả hàng
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="/images/returns/exchange-image.png"
              alt="Đổi trả miễn phí"
              width={500}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Phần 2: Lưu ý đổi hàng */}
        <div className="grid md:grid-cols-2 gap-8 py-8">
          <div className="flex flex-col">
            <p className="mb-4">
              <span className="font-bold">Dòng sản phẩm nữ:</span> Hy vọng bạn
              sẽ có trải nghiệm mua sắm tuyệt vời với dòng sản phẩm mới này. Để
              bạn luôn an tâm, chúng tôi vẫn áp dụng chính sách đổi trả trong 60
              ngày chung.
            </p>
            <p className="font-bold mb-2">Lưu ý đổi hàng</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>
                <span className="font-bold">Điều kiện đổi hàng:</span> Sản phẩm
                chưa sử dụng, chưa giặt là, còn nguyên tem mác, bao bì. Không bị
                dơ bẩn, hư hại (rách, sờn…), không dính mỹ phẩm hay ám mùi như
                nước hoa, khói thuốc...
              </li>
              <li>
                <span className="font-bold">Không áp dụng đổi trả:</span> Đối
                với các sản phẩm Outlet, in theo yêu cầu,... Mọi thắc mắc, vui
                lòng liên hệ chăm sóc khách hàng để được tư vấn nhanh chóng!
              </li>
            </ul>
            <p className="mb-4">
              Quy trình đổi trả, xin vui lòng liên hệ CSKH hoặc điền thông tin
              vào form bên dưới để được hỗ trợ.
            </p>
            <Link
              href="https://forms.gle/WxEEuU2PzMHnGS1N7"
              target="_blank"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 text-center w-fit"
            >
              Đăng ký Đổi/Trả hàng
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Bước đổi trả */}
      <div className="bg-gray-50 py-10 px-6 rounded-lg mt-8">
        <h4 className="text-2xl font-bold text-center mb-8">
          3 Bước nhanh chóng để đổi trả
        </h4>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Bước 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4">
              <Image
                src="/images/returns/step1.svg"
                alt="Bước 1"
                width={96}
                height={96}
              />
            </div>
            <h5 className="text-xl font-bold mb-2">Bước 1</h5>
            <p className="mb-4">
              Điền thông tin Đổi/Trả hàng, hoặc qua số hotline{" "}
              <a href="tel:1900272737" className="text-blue-600 font-medium">
                1900.272737
              </a>
              .
            </p>
            <Link
              href="https://forms.gle/WxEEuU2PzMHnGS1N7"
              target="_blank"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 mt-auto w-full"
            >
              YÊU CẦU ĐỔI TRẢ
            </Link>
          </div>

          {/* Bước 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4">
              <Image
                src="/images/returns/step2.svg"
                alt="Bước 2"
                width={96}
                height={96}
              />
            </div>
            <h5 className="text-xl font-bold mb-2">Bước 2</h5>
            <p>
              Nhận cuộc gọi xác nhận từ nhân viên về sản phẩm và thời gian nhận
              hàng
            </p>
          </div>

          {/* Bước 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4">
              <Image
                src="/images/returns/step3.svg"
                alt="Bước 3"
                width={96}
                height={96}
              />
            </div>
            <h5 className="text-xl font-bold mb-2">Bước 3</h5>
            <p>
              Ngay khi xác nhận chúng tôi sẽ gởi bạn đơn hàng mới (hoặc lấy đơn
              hàng về), bạn chỉ cần gởi hàng cần đổi/trả cho shipper là được.
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin thêm về đổi trả */}
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="flex flex-col">
          <h4 className="text-xl font-bold mb-4">Đối với việc đổi trả hàng</h4>
          <p className="mb-4">
            Chúng tôi sẽ hoàn lại số tiền hàng (sau khi đã trừ 25.000 VNĐ phí
            ship hàng) vào tài khoản mà bạn cung cấp tối đa trong 24h làm việc
            (không tính thứ 7 & Chủ Nhật) sau khi yêu cầu hoàn tiền được CSKH
            xác nhận.
          </p>

          <h4 className="text-xl font-bold mb-2">Lưu ý</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>
              Chúng tôi có quyền quyết định dừng việc hỗ trợ đổi trả hàng và trả
              lại tiền cho khách hàng nếu phát hiện khách hàng sử dụng chính
              sách để trục lợi (như việc đổi quá nhiều lần).
            </li>
            <li>
              Với các đơn sàn TMĐT thì sẽ áp dụng chính sách đổi trả hàng của
              sàn TMĐT. Tuy nhiên, trường hợp quá thời gian đổi trả hàng của sàn
              TMĐT sẽ được áp dụng chính sách đổi trả hàng của chúng tôi.
            </li>
          </ul>

          <h4 className="text-xl font-bold mb-2">
            Chúng tôi làm gì với hàng đổi trả
          </h4>
          <ul className="list-disc pl-5 mb-4">
            <li>
              Áo thun, quần short: thu gom và gởi cho các chương trình từ thiện
            </li>
            <li>Bít tất, boxer: huỷ bỏ 100%</li>
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/images/returns/exchange-policy.png"
            alt="Chính sách đổi trả"
            width={500}
            height={400}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Banner chân trang */}
      <div className="mt-12 border-b border-gray-200 pb-8">
        <Image
          src="/images/returns/banner-footer.gif"
          alt="Banner footer"
          width={1200}
          height={300}
          className="w-full rounded-lg"
        />
      </div>

      {/* Phần feedback */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-4">
          Bài viết có hữu ích cho bạn không?
        </h3>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button className="flex items-center bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition-colors duration-300">
            <Image
              src="/images/returns/thumbs-up.png"
              alt="Hữu ích"
              width={24}
              height={24}
              className="mr-2"
            />
            <span>Có</span>
          </button>
          <button className="flex items-center bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition-colors duration-300">
            <Image
              src="/images/returns/thumbs-down.png"
              alt="Không hữu ích"
              width={24}
              height={24}
              className="mr-2"
            />
            <span>Không</span>
          </button>
        </div>
        <p className="text-gray-600">
          Nếu trang trợ giúp của chúng tôi chưa trả lời được các yêu cầu của bạn
          hoặc những góp ý khác từ bạn. Vui lòng liên hệ Trung Tâm CSKH của
          chúng tôi qua{" "}
          <a
            href="mailto:shop@example.com"
            className="text-blue-600 font-medium"
          >
            email
          </a>{" "}
          hoặc điện thoại{" "}
          <a href="tel:1900272737" className="text-blue-600 font-bold">
            1900.272737
          </a>
          .
        </p>
      </div>
    </div>
  );
}
