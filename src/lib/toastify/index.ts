import { toast, ToastPosition } from "react-toastify";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warning",
  position: ToastPosition = "bottom-right",
  duration: number = 1000 // Thêm tham số duration với giá trị mặc định là 5000 mili giây
) => {
  switch (type) {
    case "success":
      toast.success(message, { position, autoClose: duration });
      break;
    case "warning":
      toast.warning(message, { position, autoClose: duration });
      break;
    case "error":
      toast.error(message, { position, autoClose: duration });
      break;
    case "info":
      toast.info(message, { position, autoClose: duration });
      break;
    default:
      toast(message, { position, autoClose: duration });
      break;
  }
};
