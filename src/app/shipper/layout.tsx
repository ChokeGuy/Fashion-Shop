/* scrollbar */
import "simplebar-react/dist/simplebar.min.css";
import ThemeProvider from "../theme";
import { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import ShipperLayout from "../components/shipper";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: false }}>
      <ThemeProvider>
        <ShipperLayout> {children}</ShipperLayout>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
