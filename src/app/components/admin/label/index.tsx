import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { StyledLabel } from "./styles";

// ----------------------------------------------------------------------

const Label = ({
  children,
  color = "default",
  variant = "soft",
  startIcon,
  endIcon,
  sx,
  ...other
}: {
  children?: React.ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error";
  variant?: "filled" | "outlined" | "ghost" | "soft";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  sx?: object;
  [key: string]: any;
}) => {
  const theme = useTheme();

  const iconStyles = {
    width: 16,
    height: 16,
    "& svg, img": { width: 1, height: 1, objectFit: "cover" },
  };

  return (
    <StyledLabel
      component="span"
      theme={theme}
      ownerState={{
        color: color,
        variant: variant,
        sx: {
          ...(startIcon && { pl: 0.75 }),
          ...(endIcon && { pr: 0.75 }),
          ...sx,
        },
      }}
      {...other}
    >
      {startIcon && <Box sx={{ mr: 0.75, ...iconStyles }}> {startIcon} </Box>}

      {children}

      {endIcon && <Box sx={{ ml: 0.75, ...iconStyles }}> {endIcon} </Box>}
    </StyledLabel>
  );
};

export default Label;
