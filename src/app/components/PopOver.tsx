import * as React from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { ReactNode, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Iconify from "./admin/iconify";
import MenuItem from "@mui/material/MenuItem";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import {
  deleteOneNotification,
  getUserNotifications,
} from "@/src/lib/features/notification/notificationSlice";

export default function CustomPopover({
  button,
  content,
}: {
  button: ReactNode;
  content?: ReactNode;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <div onClick={handleClick}>{button}</div>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {content}
      </Popover>
    </div>
  );
}

export function PopoverButton({ notificationId }: { notificationId: number }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleDeleteNotification = async () => {
    setOpen(null);
    await dispatch(deleteOneNotification(notificationId));
    await dispatch(getUserNotifications({ page: 0, size: 6 }));
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  return (
    <>
      <IconButton
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
          handleOpenMenu(event)
        }
      >
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
      <Popover
        open={!!open}
        anchorEl={open}
        onClose={() => setOpen(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { width: 160, padding: "1rem" },
        }}
      >
        <MenuItem
          className="p-2 space-x-2 gap-x-2 flex item-center"
          onClick={handleDeleteNotification}
        >
          <Iconify icon="eva:trash-2-fill" sx={{ mr: 2 }} />
          Xóa thông báo
        </MenuItem>
        {/* <MenuItem onClick={} sx={{ color: "error.main" }}>
          <Iconify icon="eva:trash-2-fill" sx={{ mr: 2 }} />
          Xóa tất cả
        </MenuItem> */}
      </Popover>
    </>
  );
}
