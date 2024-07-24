import dynamic from "next/dynamic";
import ShipperLoading from "../components/shipper/shipper-loading";
// ----------------------------------------------------------------------
const ShipperView = dynamic(
  () => import("../components/shipper/section/view"),
  {
    ssr: false,
    loading: () => <ShipperLoading />,
  }
);
const ShipperPage = () => {
  return <ShipperView />;
};

export default ShipperPage;
