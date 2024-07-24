"use client";

import CartLayout from "../cart/layout";

export default function FavoriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartLayout title={"Yêu Thích" as never}>{children}</CartLayout>;
}
