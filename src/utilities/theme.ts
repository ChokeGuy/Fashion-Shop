"use client";
// When using TypeScript 4.x and above
import type {} from "@mui/lab/themeAugmentation";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1A4845", // Màu sắc mặc định nếu không có màu sắc được định nghĩa
    },
    secondary: {
      main: "#47b486", // Màu sắc mặc định nếu không có màu sắc được định nghĩa
    },
  },
  components: {
    MuiTimeline: {
      styleOverrides: {
        root: {
          backgroundColor: "red",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === "info" && {
            backgroundColor: "#60a5fa",
          }),
        }),
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          button: {
            color: "#47b486",
          },
        },
      },
    },
  },
});
export default theme;
