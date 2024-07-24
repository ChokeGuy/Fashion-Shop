import { Dispatch, SetStateAction, useState } from "react";
import React from "react";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Label from "../../label";
import Iconify from "../../iconify";
import { Promotion } from "@/src/models";
import dayjs from "dayjs";
import { formatPrice } from "@/src/utilities/price-format";
import { getPromotionTypeIndex } from "@/src/constants/promotion-type";
// ----------------------------------------------------------------------

export default function PromotionTableRow({
  promotion,
  setOpenDialog,
  setOpenUpdateDialog,
  setUpdatePromotion,
  setActivateDialog,
  setActivatePromotion,
}: {
  promotion: Promotion;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  setOpenUpdateDialog: Dispatch<SetStateAction<boolean>>;
  setUpdatePromotion: Dispatch<SetStateAction<Promotion | null>>;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setActivatePromotion: Dispatch<SetStateAction<Promotion | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenDialog = () => {
    setUpdatePromotion(promotion);
    setOpenDialog(true);
    setOpen(null);
  };

  const handleOpenUpdateDialog = () => {
    setUpdatePromotion(promotion);
    setOpenUpdateDialog(true);
    setOpen(null);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivatePromotion(promotion);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {promotion.promotionId}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography width={200}>{promotion.promotionName}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {getPromotionTypeIndex(promotion.promotionType)}
          </Typography>
        </TableCell>
        {/* <TableCell>{promotion.categoryNames.join(", ")}</TableCell> */}
        <TableCell>{dayjs(promotion.startAt).format("DD/MM/YYYY")}</TableCell>
        <TableCell>{dayjs(promotion.expireAt).format("DD/MM/YYYY")}</TableCell>

        {promotion.promotionType == "VOUCHER_PERCENT" ||
        promotion.promotionType == "CATEGORIES" ? (
          <TableCell>
            <Label
              width={100}
              color={promotion.discountByPercentage ? "success" : "error"}
            >
              {promotion.discountByPercentage &&
                `${Math.round(promotion.discountByPercentage * 100)}%`}
            </Label>
          </TableCell>
        ) : (
          <TableCell>
            <Label
              width={100}
              color={promotion.discountByAmount ? "success" : "error"}
            >
              {promotion.discountByAmount &&
                `${formatPrice(promotion.discountByAmount)} VNĐ`}
            </Label>
          </TableCell>
        )}
        <TableCell>
          <Label color={promotion.isAvailable ? "success" : "error"}>
            {promotion.isAvailable ? "Đang áp dụng" : "Chưa áp dụng"}
          </Label>
        </TableCell>
        <TableCell>
          <Label color={promotion.isActive ? "success" : "error"}>
            {promotion.isActive ? "Hoạt động" : "Vô hiệu"}
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
          <Iconify icon="codicon:git-stash-apply" sx={{ mr: 2 }} />
          {/* <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} /> */}
          {!promotion.isAvailable ? "Áp dụng" : "Thu hồi"}
        </MenuItem>
        <MenuItem onClick={handleOpenUpdateDialog}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Sửa
        </MenuItem>
        <MenuItem
          onClick={handleOpenActivateDialog}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="mdi:account-reactivate" sx={{ mr: 2 }} />
          {promotion.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
        </MenuItem>
      </Popover>
    </>
  );
}
