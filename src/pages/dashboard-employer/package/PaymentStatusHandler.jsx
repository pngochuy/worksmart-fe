import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const PaymentStatusHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");
  const message = searchParams.get("message");
  const packageName = searchParams.get("packageName");

  useEffect(() => {
    // Xử lý trạng thái thanh toán chỉ một lần khi component mount
    const handlePaymentStatus = () => {
      if (!status || !orderCode) return;

      // Kiểm tra localStorage để tránh hiển thị toast nhiều lần
      const toastKey = `payment_toast_${orderCode}`;
      const toastShown = localStorage.getItem(toastKey);

      if (toastShown) {
        // Nếu toast đã hiển thị, chỉ xóa query params
        clearQueryParams();
        return;
      }

      switch (status) {
        case "success":
          toast.success(
            <div className="flex items-start">
              <CheckCircle
                className="text-green-500 mr-2 flex-shrink-0 mt-1"
                size={18}
              />
              <div>
                <p className="font-medium">Thanh toán thành công!</p>
                <p className="text-sm">
                  {packageName
                    ? `Bạn đã đăng ký thành công gói ${packageName}`
                    : "Giao dịch đã được xác nhận."}
                </p>
              </div>
            </div>,
            { autoClose: 5000 }
          );
          break;

        case "failed":
          toast.error(
            <div className="flex items-start">
              <XCircle
                className="text-red-500 mr-2 flex-shrink-0 mt-1"
                size={18}
              />
              <div>
                <p className="font-medium">Thanh toán thất bại</p>
                <p className="text-sm">
                  {message || "Giao dịch không thể hoàn tất."}
                </p>
              </div>
            </div>,
            { autoClose: 5000 }
          );
          break;

        case "cancelled":
          toast.info(
            <div className="flex items-start">
              <AlertTriangle
                className="text-blue-500 mr-2 flex-shrink-0 mt-1"
                size={18}
              />
              <div>
                <p className="font-medium">Thanh toán đã bị hủy</p>
                <p className="text-sm">Bạn đã hủy giao dịch này.</p>
              </div>
            </div>,
            { autoClose: 5000 }
          );
          break;

        case "error":
          toast.error(
            <div className="flex items-start">
              <XCircle
                className="text-red-500 mr-2 flex-shrink-0 mt-1"
                size={18}
              />
              <div>
                <p className="font-medium">Đã xảy ra lỗi</p>
                <p className="text-sm">
                  {message || "Có lỗi trong quá trình xử lý giao dịch."}
                </p>
              </div>
            </div>,
            { autoClose: 5000 }
          );
          break;

        default:
          // Trường hợp không xác định, không hiển thị toast
          break;
      }

      // Đánh dấu là đã hiển thị toast cho orderCode này
      localStorage.setItem(toastKey, "true");

      // Xóa query params để tránh hiển thị lại khi refresh trang
      clearQueryParams();
    };

    const clearQueryParams = () => {
      // Xóa query params nhưng giữ người dùng ở trang hiện tại
      navigate("", { replace: true });
    };

    handlePaymentStatus();
  }, [status, orderCode, message, packageName, navigate]);

  // Component này không render gì cả, chỉ xử lý logic
  return null;
};

export default PaymentStatusHandler;
