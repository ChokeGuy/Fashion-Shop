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
import { Order, OrderItem } from "@/src/models";
import { formatPrice } from "@/src/utilities/price-format";
import { OrderStatus } from "@/src/constants/orderStatus";
import { adminOrderApi } from "@/src/app/apis/admin/orderApi";
// ----------------------------------------------------------------------

export default function OrderTableRow({
  order,
  setOrderDetail,
  setOpenStatusChangeDialog,
  setOpenDetailDialog,
  setUpdateOrder,
  setLoadingDetail,
  setOrderItemDetails,
}: {
  order: Order;
  setOrderDetail: Dispatch<SetStateAction<Order | null>>;
  setOpenStatusChangeDialog: Dispatch<SetStateAction<boolean>>;
  setOpenDetailDialog: Dispatch<SetStateAction<boolean>>;
  setUpdateOrder: Dispatch<SetStateAction<Order | null>>;
  setLoadingDetail: Dispatch<SetStateAction<boolean>>;
  setOrderItemDetails: Dispatch<SetStateAction<OrderItem[] | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleOpenStatusDialog = async () => {
    setOpen(null);
    setLoadingDetail(true);
    const response = await adminOrderApi.getOrderItemsById(order.orderId);
    setOrderItemDetails(response?.result.orderItems || null);
    setOpenStatusChangeDialog(true);
    setUpdateOrder(order);
    setLoadingDetail(false);
  };

  const handleOpenDetailDialog = async () => {
    setOpen(null);
    setOpenDetailDialog(true);
    setLoadingDetail(true);
    const response = await adminOrderApi.getOrderItemsById(order.orderId);
    setOrderItemDetails(response?.result.orderItems || null);
    setOrderDetail(response?.result.order || null);
    setLoadingDetail(false);
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

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell> */}
        <TableCell>{`#${order.orderId}`}</TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="subtitle2" noWrap>
            {order.fullName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {order.phone}
          </Typography>
        </TableCell>
        <TableCell>
          <div className="w-44">{order.address}</div>
        </TableCell>
        <TableCell>
          <div
            className={`min-w-30 whitespace-nowrap text-sm rounded-md text-white capitalize p-2 grid place-items-center ${handleGetOrderStatusColor(
              order.status
            )}`}
          >
            {order.status === "WAITING_FOR_PAYMENT" && "Chờ thanh toán"}
            {order.status === "PENDING" && "Chờ xác nhận"}
            {order.status === "PROCESSING" && "Đang xử lý"}
            {order.status === "SHIPPING" && "Vận chuyển"}
            {order.status === "DELIVERED" && "Hoàn thành"}
            {order.status === "CANCELLED" && "Đã hủy"}
          </div>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {order.paymentMethod === "COD" ? "COD" : "Ví VNPay"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {formatPrice(order.shippingCost) + " VNĐ"}
          </Typography>
        </TableCell>
        <TableCell>
          <div className="truncate">
            {formatPrice(order.totalAmount) + " VNĐ"}
          </div>
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
        {order.status !== "CANCELLED" &&
          order.status !== "DELIVERED" &&
          order.status !== "WAITING_FOR_PAYMENT" &&
          order.status !== "SHIPPING" && (
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
