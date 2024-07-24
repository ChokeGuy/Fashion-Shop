import dynamic from "next/dynamic";
import AdminLoading from "../../components/admin/admin-loading";
// import ProductsView from "../../components/admin/sections/products/view";

const ProductsView = dynamic(
  () => import("../../components/admin/sections/products/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);

export default function Page() {
  return <ProductsView />;
}
