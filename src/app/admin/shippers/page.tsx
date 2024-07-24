import dynamic from "next/dynamic";
// import ShipperView from "../../components/admin/sections/shippers/view";
import AdminLoading from "../../components/admin/admin-loading";

const ShipperView = dynamic(
  () => import("../../components/admin/sections/shippers/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default function Page() {
  return <ShipperView />;
}
