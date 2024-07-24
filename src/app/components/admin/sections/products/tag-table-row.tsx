import { Dispatch, SetStateAction } from "react";
import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tag } from "@/src/models";
// ----------------------------------------------------------------------

export default function TagTableRow({
  tag,
  setOpenDeleteDialog,
  setTagId,
}: {
  tag: Tag;
  setOpenDeleteDialog: Dispatch<SetStateAction<boolean>>;
  setTagId: Dispatch<SetStateAction<number>>;
}) {

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    setTagId(tag.tagId);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell>{tag.tagId}</TableCell>

        <TableCell width={160}>{tag.name}</TableCell>
        <TableCell align="right">
          <DeleteIcon
            sx={{ cursor: "pointer" }}
            onClick={handleOpenDeleteDialog}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
