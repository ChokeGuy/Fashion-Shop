import dynamic from "next/dynamic";
// import BrandView from "../../components/admin/sections/brands/view";
import AdminLoading from "../../components/admin/admin-loading";

const BrandView = dynamic(
  () => import("../../components/admin/sections/brands/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default async function Page() {
  return <BrandView />;
}
