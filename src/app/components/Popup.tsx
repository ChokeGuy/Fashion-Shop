import React from "react";
import WarningIcon from "@mui/icons-material/Warning";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CancelIcon from "@mui/icons-material/Cancel";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { usePathname } from "next/navigation";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: "1rem 0 0 0",
    width: "620px",
    maxWidth: "90vw",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const VoucherDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: "1rem 0 0 0",
    width: "500px",
    maxWidth: "90vw",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const NoPaddingDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const ActiveDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: "1rem",
    width: "360px",
    maxWidth: "640px",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const LargeActiveDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: "1rem",
    width: "480px",
    maxWidth: "640px",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const LargeDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    padding: "1rem",
    width: "1240px",
    maxWidth: "90vw",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface PopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  type?: "alert" | "confirm";
  addingFeatures?: boolean;
  addingContent?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode;
  voucher?: boolean;
  large?: boolean;
  padding?: boolean;
  isActivePopup?: boolean;
  isLargeActivePopup?: boolean;
  closeButton?: any;
}

const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  title,
  type = "confirm",
  addingFeatures,
  addingContent,
  content,
  actions,
  voucher = false,
  large = false,
  padding = true,
  isActivePopup = false,
  isLargeActivePopup = false,
  closeButton = {
    top: "0px",
    right: "12px",
  },
}) => {
  const pathname = usePathname();

  if (voucher) {
    return (
      <VoucherDialog
        className="rounded-lg shadow-md p-6"
        open={open}
        onClose={onClose}
      >
        <DialogTitle
          className={`${
            type == "alert"
              ? "text-red-500 w-full flex gap-x-2 justify-center items-center"
              : ""
          } text-lg border-b border-border-color px-6 pt-6 py-4 text-left`}
        >
          {type == "alert" && <WarningIcon />}
          <div
            className={`${
              addingFeatures && "flex justify-between items-center"
            }`}
          >
            <span className="w-full grid place-items-center text-center">
              {title}
            </span>
            <div>{addingFeatures && addingContent}</div>
          </div>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            className="hover:opacity-75 transition-opacity"
            style={{
              position: "absolute",
              right: closeButton.right,
              top: closeButton.top,
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{content}</DialogContent>
        {actions && <DialogActions className="p-6">{actions}</DialogActions>}
      </VoucherDialog>
    );
  }
  if (large) {
    return (
      <LargeDialog
        className="rounded-lg shadow-md p-6"
        open={open}
        onClose={onClose}
      >
        <DialogTitle
          className={`${
            type == "alert"
              ? "text-red-500 w-full flex gap-x-2 justify-center items-center"
              : ""
          } text-lg border-b border-border-color px-6 pt-6 py-4 text-left`}
        >
          {type == "alert" && <WarningIcon />}
          <div
            className={`${
              addingFeatures && "flex justify-between items-center"
            }`}
          >
            <span className="w-full grid place-items-center text-center">
              {title}
            </span>
            <div>{addingFeatures && addingContent}</div>
          </div>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            className="hover:opacity-75 transition-opacity"
            style={{ position: "absolute", right: "12px", top: "0px" }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{content}</DialogContent>
        {actions && <DialogActions className="p-6">{actions}</DialogActions>}
      </LargeDialog>
    );
  }

  if (isLargeActivePopup) {
    return (
      <LargeActiveDialog
        className="rounded-lg shadow-md p-6"
        open={open}
        onClose={onClose}
      >
        <DialogTitle
          className={`${
            type == "alert"
              ? "text-red-500 w-full flex gap-x-2 justify-center items-center"
              : ""
          } text-lg border-b border-border-color px-6 pt-6 py-4 text-left`}
        >
          {type == "alert" && <WarningIcon />}
          <div
            className={`${
              addingFeatures && "flex justify-between items-center"
            }`}
          >
            <span className="w-full grid place-items-center text-center">
              {title}
            </span>
            <div>{addingFeatures && addingContent}</div>
          </div>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            className="hover:opacity-75 transition-opacity"
            style={{ position: "absolute", right: "12px", top: "0px" }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{content}</DialogContent>
        {actions && <DialogActions className="p-6">{actions}</DialogActions>}
      </LargeActiveDialog>
    );
  }

  if (isActivePopup) {
    return (
      <ActiveDialog
        className="rounded-lg shadow-md p-6"
        open={open}
        onClose={onClose}
      >
        <DialogTitle
          className={`${
            type == "alert"
              ? "text-red-500 w-full flex gap-x-2 justify-center items-center"
              : ""
          } text-lg border-b border-border-color px-6 pt-6 py-4 text-left`}
        >
          {type == "alert" && <WarningIcon />}
          <div
            className={`${
              addingFeatures && "flex justify-between items-center"
            }`}
          >
            <span className="w-full grid place-items-center text-center">
              {title}
            </span>
            <div>{addingFeatures && addingContent}</div>
          </div>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            className="hover:opacity-75 transition-opacity"
            style={{ position: "absolute", right: "12px", top: "0px" }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{content}</DialogContent>
        {actions && <DialogActions className="p-6">{actions}</DialogActions>}
      </ActiveDialog>
    );
  }

  if (!padding) {
    return (
      <NoPaddingDialog
        className="rounded-lg shadow-md p-6"
        open={open}
        onClose={onClose}
      >
        <DialogTitle
          className={`${
            type == "alert"
              ? "text-red-500 w-full flex gap-x-2 justify-center items-center"
              : ""
          } text-lg border-b border-border-color px-6 pt-6 py-4 text-left`}
        >
          {type == "alert" && <WarningIcon />}
          <div
            className={`${
              addingFeatures && "flex justify-between items-center"
            }`}
          >
            <span className="w-full grid place-items-center text-center">
              {title}
            </span>
            <div>{addingFeatures && addingContent}</div>
          </div>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            className="hover:opacity-75 transition-opacity"
            style={{ position: "absolute", right: "12px", top: "0px" }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{content}</DialogContent>
        {actions && <DialogActions className="p-6">{actions}</DialogActions>}
      </NoPaddingDialog>
    );
  }

  return (
    <BootstrapDialog
      className="rounded-lg shadow-md p-6"
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        sx={{ padding: 0 }}
        className={`${
          type == "alert" ? "text-red-500 flex gap-x-2 items-center " : ""
        } text-lg border-b border-border-color py-4 px-6 text-left`}
      >
        {type == "alert" && <WarningIcon />}
        <div
          className={`${addingFeatures && "flex justify-between items-center"}`}
        >
          <span
            className={`w-full grid place-items-center text-center ${
              pathname.includes("admin") ? "pb-4" : ""
            }`}
          >
            {title}
          </span>
          <div>{addingFeatures && addingContent}</div>
        </div>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          className="hover:opacity-75 transition-opacity"
          style={{
            position: "absolute",
            right: closeButton.right,
            top: closeButton.top,
          }}
        >
          <CancelIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
      {actions && <DialogActions className="p-6">{actions}</DialogActions>}
    </BootstrapDialog>
  );
};

export default Popup;
