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
import { Tag } from "@/src/models";
import Box from "@mui/material/Box";
import Label from "../../label";
// ----------------------------------------------------------------------

export default function TagTableRow({
  tag,
  setOpenDialog,
  setUpdateTag,
  setDeleteTagDialog,
  setDeleteTag,
}: {
  tag: Tag;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  setUpdateTag: Dispatch<SetStateAction<Tag | null>>;
  setDeleteTagDialog: Dispatch<SetStateAction<boolean>>;
  setDeleteTag: Dispatch<SetStateAction<Tag | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setUpdateTag(tag);
    setOpen(null);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteTagDialog(true);
    setDeleteTag(tag);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell>{tag.tagId}</TableCell>

        <TableCell width={160}>{tag.name}</TableCell>
        {/* <TableCell>
          <Label color={tag.isActive ? "success" : "error"}>
            {tag.isActive ? "Hoạt động" : "Vô hiệu"}
          </Label>
        </TableCell> */}

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
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: "error.main" }}>
          <Iconify icon="eva:trash-2-fill" sx={{ mr: 2 }} />
          Xóa
        </MenuItem>
      </Popover>
    </>
  );
}
