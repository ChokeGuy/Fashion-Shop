import dynamic from "next/dynamic";
import AdminLoading from "../components/admin/admin-loading";
// ----------------------------------------------------------------------
const DashboardView = dynamic(
  () => import("../components/admin/sections/dashboard/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);

export default function AppPage() {
  return <DashboardView />;
}
