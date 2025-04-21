import React, { memo } from "react";

// Component Modal riêng
interface CancelOrderModalProps {
  show: boolean;
  updating: boolean;
  cancelReasons: string[];
  selectedCancelReason: string;
  customCancelReason: string;
  onClose: () => void;
  onConfirm: () => void;
  onReasonChange: (reason: string) => void;
  onCustomReasonChange: (reason: string) => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  show,
  updating,
  cancelReasons,
  selectedCancelReason,
  customCancelReason,
  onClose,
  onConfirm,
  onReasonChange,
  onCustomReasonChange,
}) => {
  if (!show) return null;

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-60 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-12 sm:p-0">
        <div
          className={`relative bg-white rounded-xl shadow-2xl transform transition-all duration-300 sm:max-w-4xl sm:w-full ${
            show ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={handleModalContentClick}
        >
          <div className="px-6 pt-6 pb-4">
            <div className="flex flex-col items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-50 sm:mx-0">
                <svg
                  className="h-6 w-6 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  className="text-xl leading-6 font-semibold text-gray-900"
                  id="modal-title"
                >
                  Xác nhận hủy đơn hàng
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không
                    thể hoàn tác. Số sản phẩm trong đơn hàng sẽ được hoàn lại
                    vào kho.
                  </p>

                  <div className="mt-6">
                    <label
                      htmlFor="cancelReason"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Lý do hủy đơn hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="cancelReason"
                      className="block w-full pl-4 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 sm:text-sm disabled:bg-gray-100"
                      value={selectedCancelReason}
                      onChange={(e) => onReasonChange(e.target.value)}
                      disabled={updating}
                    >
                      <option value="">-- Chọn lý do --</option>
                      {cancelReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCancelReason === "Khác" && (
                    <div className="mt-4">
                      <label
                        htmlFor="customReason"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Lý do cụ thể <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customReason"
                        className="block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200 disabled:bg-gray-100"
                        placeholder="Nhập lý do hủy đơn hàng"
                        value={customCancelReason}
                        onChange={(e) => onCustomReasonChange(e.target.value)}
                        disabled={updating}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 rounded-b-xl">
            <button
              type="button"
              className={`inline-flex justify-center rounded-lg px-4 py-2.5 bg-red-600 text-white font-medium text-sm hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-colors duration-200 ${
                updating ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={onConfirm}
              disabled={updating}
            >
              {updating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                </>
              ) : (
                "Xác nhận hủy"
              )}
            </button>
            <button
              type="button"
              className="inline-flex justify-center rounded-lg px-4 py-2.5 bg-white text-gray-700 font-medium text-sm border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-indigo-200 transition-colors duration-200"
              onClick={onClose}
              disabled={updating}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bọc component trong React.memo
export default memo(CancelOrderModal);
