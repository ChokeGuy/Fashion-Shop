import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { forwardRef } from "react";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface InputFileUploadProps {
  name: string;
  ref: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputFileUpload = forwardRef<HTMLInputElement, InputFileUploadProps>(
  ({ name, disabled, onChange }, ref) => {
    return (
      <Button
        disabled={disabled}
        component="label"
        className={`px-3 py-1 rounded-md bg-primary-color text-white hover:opacity-55 transition-opacity ${
          disabled ? "opacity-55" : ""
        }`}
        sx={{
          bgcolor: "#1A4845!important",
          color: "#fff",
          transitionProperty: "opacity",
          transitionDuration: "0.15s",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDelay: "0s",
          padding: "0.25rem 0.75rem",
          width: "fit-content",
          marginTop: "1.5rem",
          "&:hover": { bgColor: "#1A4845!important" },
        }}
        tabIndex={-1}
      >
        Tải ảnh lên
        <VisuallyHiddenInput
          type="file"
          ref={ref}
          name={name}
          onChange={onChange}
        />
      </Button>
    );
  }
);
export default InputFileUpload;
