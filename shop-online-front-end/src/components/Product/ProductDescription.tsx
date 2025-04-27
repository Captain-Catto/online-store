import React from "react";

interface ProductDescriptionProps {
  description?: string;
  material?: string;
  brand?: string;
  sku?: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  material,
  brand,
  sku,
}) => {
  return (
    <div className="container mx-auto mt-16 mb-10">
      <div className="border-b border-gray-200 mb-8">
        <div className="flex flex-wrap -mb-px">
          <div className="mr-8">
            <button className="inline-block pb-4 border-b-2 border-black font-medium text-lg">
              Chi tiết sản phẩm
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Description */}
        <div className="space-y-4">
          <h2 className="font-bold text-xl mb-2">Mô tả sản phẩm</h2>
          {description ? (
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="text-gray-500 italic">Chưa có thông tin mô tả</p>
          )}
        </div>

        {/* Material */}
        <div className="space-y-4">
          <h2 className="font-bold text-xl mb-2">Chất liệu</h2>
          {material ? (
            <p className="text-gray-700">{material}</p>
          ) : (
            <p className="text-gray-500 italic">Chưa có thông tin chất liệu</p>
          )}
        </div>

        {/* Brand and Other Details */}
        <div className="space-y-4">
          <h2 className="font-bold text-xl mb-2">Thương hiệu</h2>
          {brand ? (
            <p className="text-gray-700">{brand}</p>
          ) : (
            <p className="text-gray-500 italic">
              Chưa có thông tin thương hiệu
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-4">
          <h2 className="font-bold text-xl mb-2">Mã sản phẩm</h2>
          {sku ? (
            <p className="text-gray-700">{sku}</p>
          ) : (
            <p className="text-gray-500 italic">
              Chưa có thông tin mã sản phẩm
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
