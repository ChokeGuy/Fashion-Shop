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
import { ProductItem } from "@/src/models";
import { formatPrice, getPriceSalePercent } from "@/src/utilities/price-format";
// ----------------------------------------------------------------------

export default function ProductTableRow({
  productItem,
  setUpdateProductItem,
  setActivateDialog,
  setActivateProductItem,
}: {
  productItem: ProductItem;
  setUpdateProductItem: Dispatch<SetStateAction<ProductItem | null>>;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setActivateProductItem: Dispatch<SetStateAction<ProductItem | null>>;
}) {
  const handleEditProductItem = () => {
    setUpdateProductItem(productItem);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivateProductItem(productItem);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell>{productItem.productItemId}</TableCell>
        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Image
              className="border border-border-color"
              width={48}
              height={48}
              alt={productItem.parentName}
              src={productItem.image as string}
            />
            <Typography variant="subtitle2">
              {productItem.styleValueByStyles.Color &&
                `${productItem.styleValueByStyles.Color}`}
              {productItem.styleValueByStyles.Color && productItem.styleValueByStyles.Size && ","}
              {productItem.styleValueByStyles.Size &&
                ` ${productItem.styleValueByStyles.Size}`}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          {productItem.price && formatPrice(productItem.price) + " VNĐ"}
        </TableCell>
        <TableCell>
          {productItem.promotionalPrice
            ? formatPrice(productItem.promotionalPrice) + " VNĐ"
            : "Chưa có"}
        </TableCell>
        <TableCell>{productItem.quantity}</TableCell>
        <TableCell>{productItem.sold}</TableCell>
        <TableCell>
          <Label
            color={
              productItem.promotionalPrice !== productItem.price
                ? "success"
                : "error"
            }
          >
            {productItem.promotionalPrice !== productItem.price
              ? `Giảm giá ${getPriceSalePercent(
                  productItem.price,
                  productItem.promotionalPrice
                )}%`
              : "Không giảm giá"}
          </Label>
        </TableCell>
        <TableCell>
          <Label color={productItem.isActive ? "success" : "error"}>
            {productItem.isActive ? "Hoạt động" : "Vô hiệu"}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleEditProductItem}>
            <Iconify icon="material-symbols:edit-sharp" />
          </IconButton>
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenActivateDialog}>
            <Iconify icon="mdi:account-reactivate" />
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  );
}
