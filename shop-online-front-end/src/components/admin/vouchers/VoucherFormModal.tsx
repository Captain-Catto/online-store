"use client";

import { ChangeEvent, FormEvent } from "react";
import { CreateVoucherData } from "@/services/VoucherService";

interface VoucherFormModalProps {
  show: boolean;
  formMode: "add" | "edit";
  formData: CreateVoucherData;
  formErrors: Record<string, string>;
  onClose: () => void;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function VoucherFormModal({
  show,
  formMode,
  formData,
  formErrors,
  onClose,
  onInputChange,
  onSubmit,
}: VoucherFormModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {formMode === "add" ? "Thêm Voucher Mới" : "Sửa Voucher"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã giảm giá
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={onInputChange}
              disabled={formMode === "edit"}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                formErrors.code ? "border-red-500" : ""
              }`}
            />
            {formErrors.code && (
              <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loại voucher
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Số tiền cố định</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giá trị {formData.type === "percentage" ? "(%)" : "(VND)"}
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={onInputChange}
              min="0"
              max={formData.type === "percentage" ? "100" : undefined}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                formErrors.value ? "border-red-500" : ""
              }`}
            />
            {formErrors.value && (
              <p className="mt-1 text-sm text-red-600">{formErrors.value}</p>
            )}
          </div>

          {/* Min Order Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giá trị đơn hàng tối thiểu (VND)
            </label>
            <input
              type="number"
              name="minOrderValue"
              value={formData.minOrderValue}
              onChange={onInputChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ngày hết hạn
            </label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={onInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                formErrors.expirationDate ? "border-red-500" : ""
              }`}
            />
            {formErrors.expirationDate && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.expirationDate}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giới hạn sử dụng (0 = không giới hạn)
            </label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={onInputChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {formMode === "add" ? "Thêm" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
