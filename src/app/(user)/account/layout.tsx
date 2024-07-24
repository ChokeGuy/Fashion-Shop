import { ReactNode } from "react";
import HomePageLayout from "../../(homepage)/layout";
import UserLayout from "../../components/user/user-layout";

export const metadata = {
  title: "Thông tin tài khoản",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomePageLayout>
      <UserLayout>{children}</UserLayout>
    </HomePageLayout>
  );
}
