import { Metadata } from "next/types";
import { Product } from "@/types/product";

export const DEFAULT_METADATA: Metadata = {
  title: {
    template: "%s ",
    default: "Online Store - Quần áo thời trang",
  },
  description:
    "Online Store - Nơi mua sắm thời trang với nhiều sản phẩm đa dạng và chất lượng.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Online Store",
  },
};

export function createCategoryMetadata(
  categoryName: string,
  description?: string,
  imageUrl?: string
): Metadata {
  return {
    title: categoryName,
    description:
      description || `Mua sắm ${categoryName} chất lượng cao tại Online Store`,
    openGraph: {
      title: `${categoryName} `,
      description:
        description || `Khám phá bộ sưu tập ${categoryName} tại Online Store`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

export function createCartMetadata(): Metadata {
  return {
    title: "Giỏ hàng",
    description: "Quản lý giỏ hàng và thực hiện thanh toán tại Online Store",
    openGraph: {
      title: "Giỏ hàng ",
      description: "Quản lý giỏ hàng và thực hiện thanh toán tại Online Store",
      type: "website",
    },
  };
}

export function createContactMetadata(): Metadata {
  const title = "Liên hệ";
  const description =
    "Liên hệ với Online Store - Hỗ trợ khách hàng 24/7 qua hotline, email và messenger";

  return {
    title,
    description,
    openGraph: {
      title: `${title} `,
      description,
      images: [{ url: "/images/contact-banner.jpg" }],
      type: "website",
    },
  };
}

export function createAccountMetadata(): Metadata {
  return {
    title: "Tài khoản của tôi",
    description:
      "Quản lý tài khoản, đơn hàng, địa chỉ và danh sách yêu thích của bạn.",
    robots: {
      index: false, // Không cho phép bots index trang account vì chứa thông tin cá nhân
      follow: true,
    },
    openGraph: {
      title: "Tài khoản của tôi ",
      description: "Quản lý tài khoản và đơn hàng của bạn tại Online Store",
      type: "profile",
    },
  };
}

export function createOrderDetailMetadata(orderId?: string): Metadata {
  return {
    title: orderId ? `Chi tiết đơn hàng #${orderId}` : "Chi tiết đơn hàng",
    description: "Xem chi tiết đơn hàng và theo dõi trạng thái giao hàng.",
    robots: {
      index: false,
    },
  };
}

export function createOrdersMetadata(): Metadata {
  return {
    title: "Đơn hàng của tôi",
    description: "Quản lý và theo dõi trạng thái các đơn hàng của bạn",
    robots: {
      index: false,
    },
  };
}

export function createAddressesMetadata(): Metadata {
  return {
    title: "Địa chỉ của tôi",
    description: "Quản lý các địa chỉ giao hàng và thanh toán của bạn",
    robots: {
      index: false,
    },
  };
}

export function createWishlistMetadata(): Metadata {
  return {
    title: "Sản phẩm yêu thích",
    description: "Danh sách các sản phẩm yêu thích của bạn",
    robots: {
      index: false,
    },
  };
}

export function createPromotionsMetadata(): Metadata {
  return {
    title: "Ưu đãi của tôi",
    description: "Các mã giảm giá và ưu đãi hiện có trong tài khoản của bạn",
    robots: {
      index: false,
    },
  };
}

export function createFaqMetadata(): Metadata {
  return {
    title: "Câu hỏi thường gặp",
    description: "Hướng dẫn và các câu hỏi thường gặp về tài khoản và đơn hàng",
    robots: {
      index: false,
    },
  };
}

export function createAboutMetadata(): Metadata {
  return {
    title: "Giới thiệu về Online Store",
    description:
      "Tìm hiểu về câu chuyện, sứ mệnh và giá trị cốt lõi của Online Store - Thương hiệu thời trang Việt Nam với sứ mệnh mang đến sản phẩm chất lượng cao với giá cả hợp lý.",
    openGraph: {
      title: "Giới thiệu về Online Store",
      description:
        "Tìm hiểu về câu chuyện, sứ mệnh và giá trị cốt lõi của Online Store - Thương hiệu thời trang Việt Nam.",
      images: [
        {
          url: "/images/about-banner.jpg", // Cập nhật đường dẫn nếu cần
          width: 1200,
          height: 630,
          alt: "Online Store - Thời trang phản ánh cá tính của bạn",
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    alternates: {
      canonical: "https://shoponline.vn/about",
    },
  };
}

export function createCheckoutMetadata(): Metadata {
  return {
    title: "Thanh toán",
    description:
      "Hoàn tất đơn hàng và chọn phương thức thanh toán tại Online Store",
    robots: {
      index: false, // Không cho phép bots index trang thanh toán
      follow: false, // Không theo dõi các liên kết từ trang này
      nocache: true, // Không lưu cache
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: "Thanh toán ",
      description: "Hoàn tất đơn hàng của bạn tại Online Store",
      type: "website",
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CheckoutPage",
        name: "Trang thanh toán",
        description: "Hoàn tất đơn hàng và chọn phương thức thanh toán",
      }),
    },
  };
}

export function createOrderConfirmationMetadata(): Metadata {
  return {
    title: "Đặt hàng thành công",
    description: "Xác nhận đơn hàng của bạn tại Online Store",
    robots: {
      index: false, // Không cho phép bots index trang xác nhận đơn hàng (thông tin cá nhân)
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: "Đặt hàng thành công ",
      description: "Đơn hàng của bạn đã được xác nhận và đang được xử lý",
      type: "website",
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CheckoutPage",
        name: "Xác nhận đơn hàng",
        description: "Cảm ơn bạn đã đặt hàng tại Online Store",
      }),
    },
  };
}

export function createProductMetadata(product: Product | null): Metadata {
  if (!product) {
    return {
      title: "Sản phẩm không tìm thấy",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa",
    };
  }

  // Lấy thông tin giá từ variant đầu tiên
  const firstColorKey =
    product.colors && product.colors.length > 0 ? product.colors[0] : "";
  const firstVariant =
    firstColorKey && product.variants ? product.variants[firstColorKey] : null;

  // Lấy giá hiện tại và giá gốc
  const price = firstVariant?.price || 0;

  // Tính toán phần trăm giảm giá
  // const discountPercent =
  //   originalPrice > price ? Math.round(100 - (price / originalPrice) * 100) : 0;

  // Lấy hình ảnh đầu tiên cho OpenGraph
  const firstImage =
    firstVariant?.images && firstVariant.images.length > 0
      ? firstVariant.images[0].url
      : "/images/product-placeholder.jpg";

  // Tạo mô tả ngắn gọn
  let shortDescription = product.description;
  if (shortDescription && shortDescription.length > 160) {
    shortDescription = shortDescription.substring(0, 157) + "...";
  }

  // Tạo metadata cơ bản
  return {
    title: product.name,
    description: shortDescription || `${product.name} - Online Store`,
    keywords: [
      product.name,
      product.brand || "",
      ...(Array.isArray(product.categories)
        ? product.categories.map((c) => c.name)
        : []),
      ...(Array.isArray(product.material)
        ? product.material
        : [product.material || ""]),
    ].filter(Boolean),
    openGraph: {
      title: product.name,
      description: shortDescription || `${product.name} - Online Store`,
      type: "website",
      images: [
        {
          url: firstImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: firstVariant?.images?.map((img) => img.url) || [firstImage],
        description: product.description,
        brand: {
          "@type": "Brand",
          name: product.brand || "Online Store",
        },
        sku: product.sku,
        mpn: product.sku,
        offers: {
          "@type": "Offer",
          url: `https://shoponline.vn/products/${product.id}`,
          priceCurrency: "VND",
          price: price,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          itemCondition: "https://schema.org/NewCondition",
          availability:
            firstVariant?.inventory &&
            Object.values(firstVariant.inventory).some((stock) => stock > 0)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      }),
    },
  };
}

// Định nghĩa props cho hàm generateMetadata
type Props = {
  searchParams: { q?: string };
};

// Hàm tạo metadata động dựa trên từ khóa tìm kiếm
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const query = searchParams.q || "";

  // Tạo title và description có chứa từ khóa tìm kiếm
  return {
    title: query ? `Kết quả tìm kiếm cho "${query}" ` : "Tìm kiếm sản phẩm ",
    description: query
      ? `Khám phá các sản phẩm liên quan đến "${query}" tại Online Store. Tìm kiếm dễ dàng, mua sắm thông minh.`
      : "Tìm kiếm sản phẩm yêu thích của bạn tại Online Store. Chúng tôi cung cấp nhiều sản phẩm chất lượng cao với giá cả hợp lý.",
    openGraph: {
      title: query ? `Kết quả tìm kiếm cho "${query}"` : "Tìm kiếm sản phẩm",
      description: query
        ? `Khám phá các sản phẩm liên quan đến "${query}" tại Online Store.`
        : "Tìm kiếm sản phẩm yêu thích của bạn tại Online Store.",
      images: ["/images/og-image.jpg"], // Thay thế bằng đường dẫn thực tế của hình ảnh
    },
  };
}

// Metadata cho trang đăng nhập
export function createLoginMetadata(): Metadata {
  return {
    title: "Đăng nhập",
    description:
      "Đăng nhập vào tài khoản Online Store để mua sắm và quản lý đơn hàng của bạn",
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Metadata cho trang đăng ký
export function createRegisterMetadata(): Metadata {
  return {
    title: "Đăng ký tài khoản ",
    description:
      "Đăng ký tài khoản mới tại Online Store để trải nghiệm mua sắm tốt nhất",
    robots: {
      index: false,
      follow: false,
    },
  };
}

// Metadata cho trang quên mật khẩu
export function createForgotPasswordMetadata(): Metadata {
  return {
    title: "Quên mật khẩu ",
    description: "Khôi phục mật khẩu tài khoản Online Store của bạn",
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

// Metadata cho trang đặt lại mật khẩu
export function createResetPasswordMetadata(): Metadata {
  return {
    title: "Đặt lại mật khẩu ",
    description: "Đặt lại mật khẩu tài khoản Online Store của bạn",
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}
