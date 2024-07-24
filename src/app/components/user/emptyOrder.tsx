import { emptyOrder } from "@/src/assests";
import Image from "next/image";
export default function EmptyOrder() {
  return (
    <div className="text-text-color p-6 size-full flex flex-col justify-center items-center text-center">
      <Image src={emptyOrder} alt="empty order" className="size-24"></Image>
      <span className="mt-3 text-lg font-bold">Không có đơn hàng nào</span>
    </div>
  );
}
