import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/src/utilities/theme";
import "./styles/globals.css";
import "./styles/toastify.css";
import { openSans } from "./fonts";
import "react-toastify/dist/ReactToastify.css";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import "react-multi-carousel/lib/styles.css";

import { ToastContainer } from "react-toastify";
import { favico } from "../assests";

interface Props {
  readonly children: ReactNode;
}

export const metadata = {
  title: "Trang chủ",
  icons: {
    icon: favico.src,
  },
  description: "AT Shop",
};

export default function RootLayout({ children }: Props) {
  return (
    <html className={`${openSans.variable}`} lang="en">
      <body>
        <StoreProvider>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider theme={theme}>
              <ToastContainer
                className={"min-w-[25rem] !p-2"}
                position="bottom-right"
                autoClose={1000}
                hideProgressBar={false}
                icon={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover={false}
                theme="colored"
              />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
