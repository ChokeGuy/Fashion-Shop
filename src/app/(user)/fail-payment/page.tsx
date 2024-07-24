import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ErrorIcon from "@mui/icons-material/Error";
import Link from "next/link";

export const metadata = {
  title: "Thanh toán thất bại",
};

export default async function FailPaymentPage() {
  const isPayment = getCookie("isVNPayment", { cookies });
  if (!isPayment) redirect("/");

  return (
    <div className="min-h-[600px] flex flex-col gap-y-5 items-center justify-center">
      <ErrorIcon sx={{ fontSize: "7rem", color: "red" }} />
      <h2 className="text-2xl font-semibold text-red-500">
        Thanh toán thất bại
      </h2>
      <dd>
        Bạn có thể thanh toán lại trong phần đơn mua, vui lòng truy cập dưới
        đây:
      </dd>
      <Link href="/account/order-tracking">
        <button
          className="px-6 py-3 text-white hover:bg-text-color hover:cursor-pointer transition-colors
 rounded-4xl bg-red-500"
        >
          <span>Theo dõi đơn mua</span>
        </button>
      </Link>
    </div>
  );
}
