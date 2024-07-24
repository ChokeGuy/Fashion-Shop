import HomePageLayout from "../../(homepage)/layout";
import Service from "../../components/homepage/Service";


export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HomePageLayout>
      {children}
      <Service />
    </HomePageLayout>
  );
}
