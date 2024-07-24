import dynamic from "next/dynamic";
// import bannerView from "../../components/admin/sections/banners/view";
import AdminLoading from "../../components/admin/admin-loading";

const BannerView = dynamic(
  () => import("../../components/admin/sections/banners/view"),
  {
    ssr: false,
    loading: () => <AdminLoading />,
  }
);
export default function Page() {
  return <BannerView />;
}
