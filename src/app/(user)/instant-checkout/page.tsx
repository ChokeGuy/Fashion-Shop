import CheckOutComponent from "../../components/checkout";

export const metadata = {
  title: "Mua ngay",
};

const CheckOut = () => {
  return <CheckOutComponent isInstantBuy={true} />;
};

export default CheckOut;
