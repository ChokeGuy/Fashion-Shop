import CartLayout from "../cart/layout";

export default function CheckOutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartLayout title={"Thanh Toán" as never}>{children}</CartLayout>;
}
