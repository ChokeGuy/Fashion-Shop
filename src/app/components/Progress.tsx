import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
export default function CircularIndeterminate(
  { size }: { size?: number } = { size: 25 }
) {
  return (
    <CircularProgress
      sx={{
        color: "rgba(0,0,0,0.7)",
        position: "absolute",
        right: "0.6rem",
        top: "30%",
      }}
      size={size} // Adjust the size value as per your requirement
    />
  );
}
