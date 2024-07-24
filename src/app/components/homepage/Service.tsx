import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaidIcon from "@mui/icons-material/Paid";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PaymentIcon from "@mui/icons-material/Payment";
export default function Service() {
  return (
    <section className="container mt-4 lg:mt-10 transition-all">
      <div className="">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-x-8">
          <li className="flex gap-x-4">
            <div>
              <LocationOnIcon className="size-10 fill-primary-color" />
            </div>
            <div className="inline space-y-2">
              <h1 className="text-lg font-medium">Miễn phí vận chuyển</h1>
              <p className="text-base font-medium">
                Miễn phí vận chuyển với đơn hàng từ 300k.
              </p>
            </div>
          </li>
          <li className="flex gap-x-4">
            <div>
              <PaidIcon className="size-10 fill-primary-color" />
            </div>
            <div className="inline space-y-2">
              <h1 className="text-lg font-medium">Hoàn trả hàng hóa</h1>
              <p className="text-base font-medium">
                Hoàn trả hàng hóa trong vòng 30 ngày.
              </p>
            </div>
          </li>
          <li className="flex gap-x-4">
            <div>
              <SupportAgentIcon className="size-10 fill-primary-color" />
            </div>
            <div className="inline space-y-2">
              <h1 className="text-lg font-medium">Chăm sóc trực tuyến</h1>
              <p className="text-base font-medium">Chăm sóc trực tuyến 24/7</p>
            </div>
          </li>
          <li className="flex gap-x-4">
            <div>
              <PaymentIcon className="size-10 fill-primary-color" />
            </div>
            <div className="inline space-y-2">
              <h1 className="text-lg font-medium">Đa dạng thanh toán</h1>
              <p className="text-base font-medium">
                Nhiều phương thức thanh toán cho bạn lựa chọn
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
