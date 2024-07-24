import dynamic from "next/dynamic";
// import CategoryView from "../../components/admin/sections/categories/view";
import AdminLoading from "../../components/admin/admin-loading";

const CategoryView = dynamic(
  () => import("../../components/admin/sections/categories/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default async function Page() {
  return <CategoryView />;
}
