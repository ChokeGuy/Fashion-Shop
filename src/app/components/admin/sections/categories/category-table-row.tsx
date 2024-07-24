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
import { Category } from "@/src/models";
import Box from "@mui/material/Box";
import Label from "../../label";
import { adminCategoryApi } from "@/src/app/apis/admin/categoryApi";
import { showToast } from "@/src/lib/toastify";
// ----------------------------------------------------------------------

export default function CategoryTableRow({
  setUpdateCategory,
  setOpenDialog,
  setActivateDialog,
  setActivateCategory,
  setParentUpdateCategories,
  category,
}: {
  setUpdateCategory: Dispatch<SetStateAction<Category | null>>;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setActivateCategory: Dispatch<SetStateAction<Category | null>>;
  setParentUpdateCategories: Dispatch<SetStateAction<Category[]>>;
  category: Category;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenDialog = async () => {
    const categories = await adminCategoryApi.getParentCategory(
      category.categoryId
    );
    if (categories?.statusCode !== 200) {
      showToast("Có lỗi xảy ra,vui lòng thử lại", "error");
    } else {
      const filterCategories = categories.result.availableParents.filter(
        (category) => category.isActive == true
      );
      setParentUpdateCategories(filterCategories);
    }
    setUpdateCategory(category);
    setOpenDialog(true);
    setOpen(null);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivateCategory(category);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell> */}
        <TableCell>{category.categoryId}</TableCell>

        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ border: "1px solid #ccc" }}>
              <Image
                width={48}
                height={48}
                alt={category.name}
                src={category.image as string}
              />
            </Box>
            <Typography variant="subtitle2">{category.name}</Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Label color={category.isActive ? "success" : "error"}>
            {category.isActive ? "Hoạt động" : "Vô hiệu"}
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
          {category.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
        </MenuItem>
      </Popover>
    </>
  );
}
