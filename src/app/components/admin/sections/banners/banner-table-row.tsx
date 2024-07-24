import { Dispatch, SetStateAction, useState } from "react";
import React from "react";
import Image from "next/image";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";

import Iconify from "../../iconify";
import Label from "../../label";
import { Banner } from "@/src/models";
// ----------------------------------------------------------------------

export default function BannerTableRow({
  banner,
  setActivateDialog,
  setActivateBanner,
}: {
  banner: Banner;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setActivateBanner: Dispatch<SetStateAction<Banner | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivateBanner(banner);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell>{banner.bannerId}</TableCell>

        <TableCell component="th" scope="row">
          <Image
            className="border border-border-color h-24"
            width={160}
            height={160}
            alt={`banner-${banner.bannerId}`}
            src={banner.image}
          />
        </TableCell>
        <TableCell>
          <Label color={banner.isActive ? "success" : "error"}>
            {banner.isActive ? "Hoạt động" : "Vô hiệu"}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton
            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
              handleOpenMenu(event)
            }
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>

        <Popover
          open={!!open}
          anchorEl={open}
          onClose={() => setOpen(null)}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: { width: 160 },
          }}
        >
          <MenuItem
            onClick={handleOpenActivateDialog}
            sx={{ color: "error.main" }}
          >
            <Iconify icon="mdi:account-reactivate" sx={{ mr: 2 }} />
            {banner.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </MenuItem>
        </Popover>
      </TableRow>
    </>
  );
}
