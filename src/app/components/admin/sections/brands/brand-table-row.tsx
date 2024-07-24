import { Dispatch, SetStateAction, useState } from "react";
import React from "react";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Iconify from "../../iconify";
import { Brand } from "@/src/models";
import Label from "../../label";
// ----------------------------------------------------------------------

export default function BrandTableRow({
  brand,
  setOpenDialog,
  setUpdateBrand,
  setActivateDialog,
  setActivateBrand,
}: {
  brand: Brand;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  setUpdateBrand: Dispatch<SetStateAction<Brand | null>>;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setActivateBrand: Dispatch<SetStateAction<Brand | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenDialog = () => {
    setUpdateBrand(brand);
    setOpenDialog(true);
    setOpen(null);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivateBrand(brand);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell width={240}>{brand.brandId}</TableCell>
        <TableCell width={360}>
          <Typography variant="subtitle2">{brand.name}</Typography>
        </TableCell>
        <TableCell width={240}>{brand.nation}</TableCell>
        <TableCell>
          <Label color={brand.isActive ? "success" : "error"}>
            {brand.isActive ? "Hoạt động" : "Vô hiệu"}
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
      </TableRow>

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
        <MenuItem onClick={handleOpenDialog}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Sửa
        </MenuItem>
        <MenuItem
          onClick={handleOpenActivateDialog}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="mdi:account-reactivate" sx={{ mr: 2 }} />
          {brand.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
        </MenuItem>
      </Popover>
    </>
  );
}
