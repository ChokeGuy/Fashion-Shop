import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import React from "react";

const ShowHidePassword = ({
  showPassword,
  click,
  mousedownPassword,
  disabled,
}: {
  showPassword: boolean;
  click: any;
  mousedownPassword: any;
  disabled?: boolean;
}) => {
  return (
    <IconButton
      disabled={disabled}
      onClick={click}
      onMouseDown={mousedownPassword}
    >
      {showPassword ? (
        <VisibilityOff className="size-4 hover:opacity-70" />
      ) : (
        <Visibility className="size-4 hover:opacity-70" />
      )}
    </IconButton>
  );
};

export default ShowHidePassword;
