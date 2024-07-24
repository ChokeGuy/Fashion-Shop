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

import Label from "../../label";
import Iconify from "../../iconify";
import { Category, Product } from "@/src/models";
import { formatPrice, getPriceSalePercent } from "@/src/utilities/price-format";
import { adminCategoryApi } from "@/src/app/apis/admin/categoryApi";
import { showToast } from "@/src/lib/toastify";
// ----------------------------------------------------------------------

export default function ProductTableRow({
  product,
  setUpdateProduct,
  setProductDetail,
  setProductTag,
  setOpenDialog,
  setOpenProductItemDialog,
  setOpenTagDialog,
  setActivateDialog,
  setActivateProduct,
}: {
  product: Product;
  setUpdateProduct: Dispatch<SetStateAction<Product | null>>;
  setProductDetail: Dispatch<SetStateAction<Product | null>>;
  setProductTag: Dispatch<SetStateAction<Product | null>>;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  setOpenProductItemDialog: Dispatch<SetStateAction<boolean>>;
  setOpenTagDialog: Dispatch<SetStateAction<boolean>>;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setActivateProduct: Dispatch<SetStateAction<Product | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenDialog = () => {
    setUpdateProduct(product);
    setOpenDialog(true);
    setOpen(null);
  };

  const handleOpenProductItemDialog = () => {
    setProductDetail(product);
    setOpenProductItemDialog(true);
    setOpen(null);
  };

  const handleOpenTagDialog = () => {
    setProductTag(product);
    setOpenTagDialog(true);
    setOpen(null);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivateProduct(product);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell>{product.productId}</TableCell>

        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Image
              className="border border-border-color"
              width={48}
              height={48}
              alt={product.name}
              src={product.image as string}
            />
            <Typography
              variant="subtitle2"
              sx={{ width: 315, overflow: "hidden" }}
            >
              {product.name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {product.priceMin
              ? formatPrice(product.priceMin) + " VNĐ"
              : "Chưa có"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {product.promotionalPriceMin
              ? formatPrice(product.promotionalPriceMin) + " VNĐ"
              : "Chưa có"}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {product.categoryName}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {product.brandName}
          </Typography>
        </TableCell>

        <TableCell>{product.totalQuantity}</TableCell>
        <TableCell>{product.totalSold}</TableCell>

        <TableCell>
          <Label
            color={
              product.promotionalPriceMin !== product.priceMin
                ? "success"
                : "error"
            }
          >
            {product.promotionalPriceMin !== product.priceMin
              ? `Giảm giá ${getPriceSalePercent(
                  product.priceMin,
                  product.promotionalPriceMin
                )}%`
              : "Không giảm giá"}
          </Label>
        </TableCell>
        <TableCell>
          <Label color={product.isActive ? "success" : "error"}>
            {product.isActive ? "Hoạt động" : "Vô hiệu"}
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
          sx: { width: 180 },
        }}
      >
        <MenuItem onClick={handleOpenDialog}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Sửa
        </MenuItem>
        <MenuItem onClick={handleOpenProductItemDialog}>
          <Iconify icon="eva:copy-fill" sx={{ mr: 2 }} />
          Quản lý phân loại
        </MenuItem>
        <MenuItem onClick={handleOpenTagDialog}>
          <Iconify icon="mdi:tag-outline" sx={{ mr: 2 }} />
          Quản lý nhãn
        </MenuItem>
        <MenuItem
          onClick={handleOpenActivateDialog}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="mdi:account-reactivate" sx={{ mr: 2 }} />
          {product.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
        </MenuItem>
      </Popover>
    </>
  );
}
