import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Link from "next/link";

export const metadata = {
  title: "Thanh toán thành công",
};

export default async function SuccessPaymentPage() {
  const isPayment = getCookie("isVNPayment", { cookies });
  if (!isPayment) redirect("/");

  return (
    <div className="min-h-[600px] flex flex-col gap-y-5 items-center justify-center">
      <CheckCircleIcon sx={{ fontSize: "7rem", color: "green" }} />
      <h2 className="text-2xl font-semibold text-green-500">
        Thanh toán thành công
      </h2>
      <Link href="/account/order-tracking">
        <button
          className="px-6 py-3 text-white hover:bg-text-color hover:cursor-pointer transition-colors
     rounded-4xl bg-green-500"
        >
          <span>Theo dõi đơn hàng</span>
        </button>
      </Link>
    </div>
  );
}
