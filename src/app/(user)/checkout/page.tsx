import CheckOutComponent from "../../components/checkout";

export const metadata = {
  title: "Thanh toán",
};

const CheckOut = () => {
  return <CheckOutComponent isInstantBuy={false} />;
};

export default CheckOut;
