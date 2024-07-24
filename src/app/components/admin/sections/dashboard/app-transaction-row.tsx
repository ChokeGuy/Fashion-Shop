import { Dispatch, SetStateAction, useState } from "react";
import React from "react";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Iconify from "../../iconify";
import { formatPrice } from "@/src/utilities/price-format";
import { Transaction } from "@/src/models/transaction";
import { adminOrderApi } from "@/src/app/apis/admin/orderApi";
import { Order, OrderItem } from "@/src/models";
import { OrderStatus } from "@/src/constants/orderStatus";
import dayjs from "dayjs";
// ----------------------------------------------------------------------

export default function AppTransactionRow({
  transaction,
  setOrderDetail,
  setOpenDetailDialog,
  setLoadingDetail,
  setOrderItemDetails,
}: {
  transaction: Transaction;
  setOrderDetail: Dispatch<SetStateAction<Order | null>>;
  setOpenDetailDialog: Dispatch<SetStateAction<boolean>>;
  setLoadingDetail: Dispatch<SetStateAction<boolean>>;
  setOrderItemDetails: Dispatch<SetStateAction<OrderItem[] | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleGetOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "WAITING_FOR_PAYMENT":
        return "bg-text-light-color";
      case "PENDING":
        return "bg-text-color";
      case "PROCESSING":
        return "bg-yellow-400";
      case "SHIPPING":
        return "bg-blue-400";
      case "DELIVERED":
        return "bg-primary-color";
      case "CANCELLED":
        return "bg-red-400";
      default:
        return "bg-primary-color";
    }
  };

  const handleOpenDetailDialog = async () => {
    setOpen(null);
    setOpenDetailDialog(true);
    setLoadingDetail(true);
    const response = await adminOrderApi.getOrderItemsById(
      transaction.order.orderId
    );
    setOrderItemDetails(response?.result.orderItems || null);
    setOrderDetail(response?.result.order || null);
    setLoadingDetail(false);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell> */}
        <TableCell component="th" scope="row">
          {`#${transaction.transactionId}`}
        </TableCell>
        <TableCell component="th" scope="row">
          {`#${transaction.order.orderId}`}
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography noWrap>{transaction.order.fullName}</Typography>
        </TableCell>
        <TableCell>
          <Typography noWrap>{transaction.order.phone}</Typography>
        </TableCell>
        <TableCell>
          <Typography noWrap>
            {transaction.order.paymentMethod === "COD"
              ? "Thanh toán khi nhận"
              : "Ví VNPay"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography noWrap>
            {formatPrice(transaction.order.shippingCost) + " VNĐ"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography noWrap>
            {formatPrice(transaction.order.totalAmount) + " VNĐ"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography noWrap>
            {dayjs(transaction.createdAt).format("DD/MM/YYYY HH:mm:ss")}
          </Typography>
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
        <MenuItem onClick={handleOpenDetailDialog}>
          <Iconify icon="eva:copy-fill" sx={{ mr: 2 }} />
          Chi tiết
        </MenuItem>
      </Popover>
    </>
  );
}
