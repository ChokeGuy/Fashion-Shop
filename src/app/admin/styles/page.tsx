import dynamic from "next/dynamic";
// import StyleView from "../../components/admin/sections/styles/view";
import AdminLoading from "../../components/admin/admin-loading";

const StyleView = dynamic(
  () => import("../../components/admin/sections/styles/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default async function Page() {
  return <StyleView />;
}
