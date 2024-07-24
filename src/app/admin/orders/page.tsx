import dynamic from "next/dynamic";
import AdminLoading from "../../components/admin/admin-loading";
// import OrderView from "../../components/admin/sections/orders/view";

const OrderView = dynamic(
  () => import("../../components/admin/sections/orders/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);

export default function Page() {
  return <OrderView />;
}
