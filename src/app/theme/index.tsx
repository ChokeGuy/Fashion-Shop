"use client";
import { ReactNode, useMemo } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import {
  Components,
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles";

import { palette } from "./palette";
import { shadows } from "./shadows";
import { overrides } from "./overrides";
import { typography } from "./typography";
import { customShadows } from "./custom-shadows";

// ----------------------------------------------------------------------

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const memoizedValue = useMemo<any>(
    () => ({
      palette: palette(),
      typography,
      shadows: shadows(),
      customShadows: customShadows(),
      shape: { borderRadius: 8 },
    }),
    []
  );

  const theme = createTheme(memoizedValue);

  theme.components = overrides(theme) as Components<any>; // Add type assertion to fix the problem

  return (
    <MUIThemeProvider theme={theme}>
      {/* <CssBaseline /> */}
      {children}
    </MUIThemeProvider>
  );
}
