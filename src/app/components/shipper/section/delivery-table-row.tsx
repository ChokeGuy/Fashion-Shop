import { Dispatch, SetStateAction, useState } from "react";
import React from "react";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { formatPrice } from "@/src/utilities/price-format";
import Iconify from "../../admin/iconify";
import { Delivery } from "@/src/models";
import { deliveryApi } from "@/src/app/apis/shipper/deliveryApi";
import Label from "../../admin/label";
// ----------------------------------------------------------------------

export default function DeliveryTableRow({
  delivery,
  setOpenStatusChangeDialog,
  setOpenDetailDialog,
  setLoadingDetail,
  setDeliveryItemDetail,
}: {
  delivery: Delivery;
  setOpenStatusChangeDialog: Dispatch<SetStateAction<boolean>>;
  setOpenDetailDialog: Dispatch<SetStateAction<boolean>>;
  setLoadingDetail: Dispatch<SetStateAction<boolean>>;
  setDeliveryItemDetail: Dispatch<SetStateAction<Delivery | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenStatusDialog = () => {
    setOpen(null);
    setDeliveryItemDetail(delivery);
    setOpenStatusChangeDialog(true);
  };

  const handleOpenDetailDialog = async () => {
    setOpen(null);
    setOpenDetailDialog(true);
    setLoadingDetail(true);
    const response = await deliveryApi.getDeliveryById(delivery.deliveryId);
    setDeliveryItemDetail(response?.result.delivery || null);
    setLoadingDetail(false);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell> */}
        <TableCell component="th" scope="row">
          {`#${delivery.deliveryId}`}
        </TableCell>
        <TableCell component="th" scope="row">
          {`#${delivery.orderId}`}
        </TableCell>
        <TableCell>{delivery.recipientName}</TableCell>
        <TableCell>{delivery.phone}</TableCell>
        <TableCell>{delivery.shipperName}</TableCell>

        <TableCell>{formatPrice(delivery.totalAmount) + " VNĐ"}</TableCell>
        {/* <TableCell>{delivery.note}</TableCell> */}
        <TableCell>
          <Label color={delivery.checkoutStatus ? "success" : "error"}>
            {delivery.checkoutStatus ? "Đã thanh toán" : "Chưa thanh toán"}
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
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 180 },
        }}
      >
        {((!delivery.isReceived && !delivery.isDelivered) ||
          (delivery.isReceived && !delivery.isDelivered)) && (
          <MenuItem onClick={handleOpenStatusDialog}>
            <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
            Chuyển trạng thái
          </MenuItem>
        )}

        <MenuItem onClick={handleOpenDetailDialog}>
          <Iconify icon="eva:copy-fill" sx={{ mr: 2 }} />
          Chi tiết
        </MenuItem>
        {/* <MenuItem onClick={handleCloseMenu} sx={{ color: "error.main" }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Tạo phân loại
        </MenuItem> */}
      </Popover>
    </>
  );
}
