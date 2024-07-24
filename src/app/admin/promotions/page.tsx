import dynamic from "next/dynamic";
// import PromotionView from "../../components/admin/sections/promotions/view";
import AdminLoading from "../../components/admin/admin-loading";
// import { adminPromotionApi } from "../../apis/admin/promotionApi";

const PromotionView = dynamic(
  () => import("../../components/admin/sections/promotions/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default function Page() {
  return <PromotionView />;
}
