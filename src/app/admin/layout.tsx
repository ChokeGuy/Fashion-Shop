/* scrollbar */
import "simplebar-react/dist/simplebar.min.css";
import ThemeProvider from "../theme";
import DashboardLayout from "../components/admin";
import { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: false }}>
      <ThemeProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
