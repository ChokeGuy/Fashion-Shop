import dynamic from "next/dynamic";
// import TagView from "../../components/admin/sections/tags/view";
import AdminLoading from "../../components/admin/admin-loading";

const TagView = dynamic(
  () => import("../../components/admin/sections/tags/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default async function Page() {
  return <TagView />;
}
