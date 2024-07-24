import dynamic from "next/dynamic";
// import StyleValueView from "../../components/admin/sections/style-values/view";
import AdminLoading from "../../components/admin/admin-loading";
// import { adminStyleValueApi } from "../../apis/admin/style/styleValueServerApi";

const StyleValueView = dynamic(
  () => import("../../components/admin/sections/style-values/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default async function Page() {
  return <StyleValueView />;
}
