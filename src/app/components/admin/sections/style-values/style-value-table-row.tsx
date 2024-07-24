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
import { StyleValue } from "@/src/models";
import Box from "@mui/material/Box";
import Label from "../../label";
// ----------------------------------------------------------------------

export default function StyleValueTableRow({
  styleValue,
  setOpenDialog,
  setUpdateStyleValue,
  setActivateDialog,
  setActivateStyleValue,
}: {
  styleValue: StyleValue;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  setUpdateStyleValue: Dispatch<SetStateAction<StyleValue | null>>;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setActivateStyleValue: Dispatch<SetStateAction<StyleValue | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setUpdateStyleValue(styleValue);
    setOpen(null);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivateStyleValue(styleValue);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell> */}

        <TableCell width={160}>{styleValue.styleValueId}</TableCell>

        <TableCell width={160}>
          <Typography variant="subtitle2">{styleValue.name}</Typography>
        </TableCell>
        <TableCell width={160}>{styleValue.styleName}</TableCell>
        <TableCell width={160}>
          {styleValue.styleName == "Color"
            ? styleValue.styleValueCode
            : "Không phải màu sắc"}
        </TableCell>
        <TableCell>
          <Label color={styleValue.isActive ? "success" : "error"}>
            {styleValue.isActive ? "Hoạt động" : "Vô hiệu"}
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
          {styleValue.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
        </MenuItem>
      </Popover>
    </>
  );
}
