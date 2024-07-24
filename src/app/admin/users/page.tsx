import dynamic from "next/dynamic";
// import UserView from "../../components/admin/sections/users/view";
import AdminLoading from "../../components/admin/admin-loading";

const UserView = dynamic(
  () => import("../../components/admin/sections/users/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default function Page() {
  return <UserView/>;
}
