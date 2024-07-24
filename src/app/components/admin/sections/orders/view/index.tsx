"use client";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import Scrollbar from "../../../scrollbar";
import OrderTableRow from "../order-table-row";
import OrderTableHead from "../order-table-head";
import OrderTableToolbar from "../order-table-toolbar";
import { emptyRows, getComparator } from "@/src/utilities/visual";
import {
  ChangeOrderStatusToShipping,
  Order,
  OrderItem,
  User,
} from "@/src/models";
import { applyFilter } from "../filter";
import TableNoData from "../../table-no-data";
import CircleLoading from "@/src/app/components/Loading";
import { adminOrderApi } from "@/src/app/apis/admin/orderApi";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { formatPrice } from "@/src/utilities/price-format";
import Image from "next/image";
import Popup from "@/src/app/components/Popup";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { showToast } from "@/src/lib/toastify";
import { adminShipperApi } from "@/src/app/apis/admin/shipperApi";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import ErrorIcon from "@mui/icons-material/Error";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { PROVINCES } from "@/src/constants/provine";
import { debounce } from "lodash";
import { OrderStatus } from "@/src/constants/orderStatus";
// ----------------------------------------------------------------------

export default function OrderView() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openChangeStatusDialog, setOpenChangeStatusDialog] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updateOrder, setUpdateOrder] = useState<Order | null>(null);
  const [shipperList, setShipperList] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);

  const [orderItemDetails, setOrderItemDetails] = useState<OrderItem[] | null>(
    null
  );

  const [orderDetail, setOrderDetail] = useState<Order | null>(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState("orderId");

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [orderStatus, setOrderStatus] = useState(0);

  const shipperEmailFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getAllOrders = async () => {
      setIsLoading(true);
      const response = await adminOrderApi.getAllOrders();
      setOrders(response?.result.content || []);
      setTotalOrders(response?.result.totalElements || 0);
      setIsLoading(false);
    };
    getAllOrders();
  }, []);

  useEffect(() => {
    const getShipperList = async () => {
      const address =
        updateOrder?.address.split(/[-,]/).at(-1)?.toLowerCase().trim() ?? "";
      const matchAddress = PROVINCES.find((province) =>
        province.name.toLowerCase().includes(address)
      )?.name;
      const response = await adminShipperApi.getAllShippersByAddress(
        matchAddress!
      );
      const filterShipper = response?.result.userList.filter(
        (shipper) => shipper.isActive
      );
      setShipperList(filterShipper || []);
    };
    if (updateOrder && updateOrder.status === "PROCESSING") getShipperList();
  }, [updateOrder]);

  const getStatus = (status: number): OrderStatus => {
    switch (status) {
      case 1:
        return "WAITING_FOR_PAYMENT";
      case 2:
        return "PENDING";
      case 3:
        return "PROCESSING";
      case 4:
        return "SHIPPING";
      case 5:
        return "DELIVERED";
      case 6:
        return "CANCELLED";
      default:
        return "PENDING";
    }
  };

  const handleChangeStatus = async (
    _event: React.ChangeEvent<{}>,
    orderStatus: number
  ) => {
    setPage(0);
    let order;
    if (orderStatus == 0) {
      order = await adminOrderApi.getAllOrders({
        page: 0,
        size: rowsPerPage,
      });
    } else {
      const status = getStatus(orderStatus);
      order = await adminOrderApi.getOrdersByStatus(status, {
        page: 0,
        size: rowsPerPage,
      });
    }
    setOrderStatus(orderStatus);
    setOrders(order?.result.content || []);
    setTotalOrders(order?.result.totalElements || 0);
  };

  const handleSort = (event: any, id: string) => {
    const isAsc = orderBy === id && order === "asc";
    if (id !== "") {
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = orders.map((n) => n.fullName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    let paginatedOrders;
    if (orderStatus == 0) {
      paginatedOrders = await adminOrderApi.getAllOrders({
        page: newPage,
        size: rowsPerPage,
      });
    } else {
      const status = getStatus(orderStatus);
      paginatedOrders = await adminOrderApi.getOrdersByStatus(status, {
        page: newPage,
        size: rowsPerPage,
      });
    }
    setPage(newPage);
    setOrders(paginatedOrders?.result.content || []);
    setTotalOrders(paginatedOrders?.result.totalElements || 0);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    let paginatedOrders;
    if (orderStatus == 0) {
      paginatedOrders = await adminOrderApi.getAllOrders({
        page: 0,
        size: newRowsPerPage,
      });
    } else {
      const status = getStatus(orderStatus);
      paginatedOrders = await adminOrderApi.getOrdersByStatus(status, {
        page: 0,
        size: newRowsPerPage,
      });
    }
    setPage(0);
    setRowsPerPage(newRowsPerPage);
    setOrders(paginatedOrders?.result.content || []);
    setTotalOrders(paginatedOrders?.result.totalElements || 0);
  };

  const handleSearch = useCallback(
    debounce(async (orderId: string) => {
      if (isNaN(Number(orderId))) {
        return;
      } else if (orderId.length == 0) {
        const result = await adminOrderApi.getAllOrders();
        setOrders(result?.result.content || []);
        setTotalOrders(result?.result.totalElements || 0);
        return;
      }
      const result = await adminOrderApi.getOrderItemsById(+orderId);
      if (result?.statusCode == 404) {
        setOrders([]);
        setTotalOrders(0);
        return;
      }
      setOrders([result?.result.order!]);
      setTotalOrders(1);
    }, 500),
    [page, rowsPerPage]
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    setFilterName(value);
    await handleSearch(value);
  };

  const dataFiltered = applyFilter({
    inputData: orders,
    comparator: getComparator(order, orderBy, orderStatus),
    filterName,
  });

  const getTotalAmount = (orderItemDetails: OrderItem[]): number => {
    return orderItemDetails.reduce((total, order) => total + order.amount, 0);
  };

  const handleChangeStatusToProcessing = async (orderId: number) => {
    setIsSubmitLoading(true);
    const result = await adminOrderApi.updateOrderStatusToProcessing(orderId);

    if (result?.statusCode != 200) {
      showToast("Có lỗi xảy ra,vui lòng thử lại", "error");
      return;
    }
    const newOrders = await adminOrderApi.getOrdersByStatus("PROCESSING");

    setOrders(newOrders?.result.content || []);
    setTotalOrders(newOrders?.result.totalElements || 0);
    setOrderStatus(3);
    setPage(0);
    showToast("Cập nhật trạng thái đơn hàng thành công", "success");
    setTimeout(() => {
      setUpdateOrder(null);
      setOrderItemDetails([]);
    }, 100);
    setIsSubmitLoading(false);
    setOpenChangeStatusDialog(false);
  };

  const notFound = !dataFiltered.length && !!filterName;

  if (isLoading)
    return (
      <div className="w-full h-[80vh] grid place-items-center">
        <CircleLoading />
      </div>
    );

  return (
    <Container>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Đơn hàng</Typography>
      </Stack>
      <Card>
        <OrderTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />
        <div className="bg-white w-full rounded-sm border border-border-color shadow-sm">
          <Tabs
            className="text-sm md:text-base"
            variant="fullWidth"
            value={orderStatus}
            onChange={handleChangeStatus}
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Tất cả"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Chờ thanh toán"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Chờ xác nhận"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Đang xử lý"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Vận chuyển"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Hoàn thành"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Đã hủy"
            />
          </Tabs>
        </div>
        {orderStatus == 0 && (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <OrderTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: "orderId", label: "Mã đơn" },
                      { id: "fullName", label: "Tên khách hàng" },
                      { id: "phone", label: "Điện thoại" },
                      { id: "address", label: "Địa chỉ" },

                      { id: "status", label: "Trạng thái" },
                      {
                        id: "paymentMethod",
                        label: "PTTT",
                      },
                      { id: "shippingCost", label: "Phí giao hàng" },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered &&
                      dataFiltered.length > 0 &&
                      dataFiltered.map((row: Order) => (
                        <OrderTableRow
                          setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                          setOrderDetail={setOrderDetail}
                          setOpenDetailDialog={setOpenDetailDialog}
                          setUpdateOrder={setUpdateOrder}
                          setLoadingDetail={setLoadingDetail}
                          setOrderItemDetails={setOrderItemDetails}
                          key={row.orderId}
                          order={row}
                        />
                      ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              page={page}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {orderStatus == 1 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <OrderTableHead
                    order={order}
                    orderStatus={1}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: "orderId", label: "Mã đơn" },
                      { id: "fullName", label: "Tên khách hàng" },
                      { id: "phone", label: "Điện thoại" },
                      { id: "address", label: "Địa chỉ" },
                      { id: "status", label: "Trạng thái" },
                      {
                        id: "paymentMethod",
                        label: "PTTT",
                      },
                      { id: "shippingCost", label: "Phí giao hàng" },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Order) => (
                      <OrderTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOrderDetail={setOrderDetail}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setUpdateOrder={setUpdateOrder}
                        setLoadingDetail={setLoadingDetail}
                        setOrderItemDetails={setOrderItemDetails}
                        key={row.orderId}
                        order={row}
                      />
                    ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {orderStatus == 2 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <OrderTableHead
                    order={order}
                    orderStatus={2}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: "orderId", label: "Mã đơn" },
                      { id: "fullName", label: "Tên khách hàng" },
                      { id: "phone", label: "Điện thoại" },
                      { id: "address", label: "Địa chỉ" },
                      { id: "status", label: "Trạng thái" },
                      {
                        id: "paymentMethod",
                        label: "PTTT",
                      },
                      { id: "shippingCost", label: "Phí giao hàng" },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Order) => (
                      <OrderTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOrderDetail={setOrderDetail}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setUpdateOrder={setUpdateOrder}
                        setLoadingDetail={setLoadingDetail}
                        setOrderItemDetails={setOrderItemDetails}
                        key={row.orderId}
                        order={row}
                      />
                    ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {orderStatus == 3 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <OrderTableHead
                    order={order}
                    orderStatus={3}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: "orderId", label: "Mã đơn" },
                      { id: "fullName", label: "Tên khách hàng" },
                      { id: "phone", label: "Điện thoại" },
                      { id: "address", label: "Địa chỉ" },
                      { id: "status", label: "Trạng thái" },
                      {
                        id: "paymentMethod",
                        label: "PTTT",
                      },
                      { id: "shippingCost", label: "Phí giao hàng" },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Order) => (
                      <OrderTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOrderDetail={setOrderDetail}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setUpdateOrder={setUpdateOrder}
                        setLoadingDetail={setLoadingDetail}
                        setOrderItemDetails={setOrderItemDetails}
                        key={row.orderId}
                        order={row}
                      />
                    ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {orderStatus == 4 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <OrderTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: "orderId", label: "Mã đơn" },
                      { id: "fullName", label: "Tên khách hàng" },
                      { id: "phone", label: "Điện thoại" },
                      { id: "address", label: "Địa chỉ" },
                      { id: "status", label: "Trạng thái" },
                      {
                        id: "paymentMethod",
                        label: "PTTT",
                      },
                      { id: "shippingCost", label: "Phí giao hàng" },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Order) => (
                      <OrderTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOrderDetail={setOrderDetail}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setUpdateOrder={setUpdateOrder}
                        setLoadingDetail={setLoadingDetail}
                        setOrderItemDetails={setOrderItemDetails}
                        key={row.orderId}
                        order={row}
                      />
                    ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {orderStatus == 5 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <OrderTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: "orderId", label: "Mã đơn" },
                      { id: "fullName", label: "Tên khách hàng" },
                      { id: "phone", label: "Điện thoại" },
                      { id: "address", label: "Địa chỉ" },
                      { id: "status", label: "Trạng thái" },
                      {
                        id: "paymentMethod",
                        label: "PTTT",
                      },
                      { id: "shippingCost", label: "Phí giao hàng" },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Order) => (
                      <OrderTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOrderDetail={setOrderDetail}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setUpdateOrder={setUpdateOrder}
                        setLoadingDetail={setLoadingDetail}
                        setOrderItemDetails={setOrderItemDetails}
                        key={row.orderId}
                        order={row}
                      />
                    ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {orderStatus == 6 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <OrderTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: "orderId", label: "Mã đơn" },
                      { id: "fullName", label: "Tên khách hàng" },
                      { id: "phone", label: "Điện thoại" },
                      { id: "address", label: "Địa chỉ" },
                      { id: "status", label: "Trạng thái" },
                      {
                        id: "paymentMethod",
                        label: "PTTT",
                      },
                      { id: "shippingCost", label: "Phí giao hàng" },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Order) => (
                      <OrderTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOrderDetail={setOrderDetail}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setUpdateOrder={setUpdateOrder}
                        setLoadingDetail={setLoadingDetail}
                        setOrderItemDetails={setOrderItemDetails}
                        key={row.orderId}
                        order={row}
                      />
                    ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>
      <Popup
        open={openChangeStatusDialog}
        onClose={() => {
          setOpenChangeStatusDialog(false);
        }}
        type="confirm"
        title={
          updateOrder?.status == "PENDING"
            ? "Xác nhận đơn hàng này?"
            : "Xác nhận chuyển hàng cho shipper?"
        }
        content={
          updateOrder?.status == "PENDING" ? (
            <div className="max-h-[40rem] overflow-auto">
              <div className="flex flex-col pt-2">
                {orderItemDetails &&
                  orderItemDetails?.map((order) => {
                    return (
                      <div
                        key={order.orderItemId}
                        className="flex gap-x-4 px-6 py-4"
                      >
                        <div className="w-28 rounded-md">
                          <Image
                            width={100}
                            height={100}
                            src={order.image}
                            alt="order-detail-img"
                            className="w-full h-32 object-center object-cover"
                          />
                        </div>
                        <div className="w-4/6">
                          <div className="text-primary-color text-lg font-semibold">
                            {order.productName}
                          </div>
                          <div className="text-text-color text-sm">
                            Số lượng: {order.quantity}
                          </div>
                          <div className="text-text-color text-sm">
                            Giá:{" "}
                            {order.unitPrice && formatPrice(order.unitPrice)}{" "}
                            VNĐ
                          </div>
                          <div className="text-text-color text-sm">
                            Thành tiền:{" "}
                            <span className="text-md font-semibold text-secondary-color">
                              {order.amount && formatPrice(order.amount)} VNĐ
                            </span>
                          </div>
                          <div className="text-text-color text-sm">
                            Phân loại: {order.styleValues.join(", ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="text-text-color text-lg font-semibold w-full px-6 pt-4 flex items-center justify-between border-t border-border-color">
                <span>Tổng cộng: </span>
                <span className="text-secondary-color">
                  {orderItemDetails &&
                    formatPrice(getTotalAmount(orderItemDetails))}{" "}
                  VNĐ{" "}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-y-1">
              <div className="max-h-[40rem] overflow-auto">
                <div className="flex flex-col pt-2">
                  {orderItemDetails &&
                    orderItemDetails?.map((order) => {
                      return (
                        <div
                          key={order.orderItemId}
                          className="flex gap-x-4 px-6 py-4"
                        >
                          <div className="w-28 rounded-md">
                            <Image
                              width={100}
                              height={100}
                              src={order.image}
                              alt="order-detail-img"
                              className="w-full h-32 object-center object-cover"
                            />
                          </div>
                          <div className="w-4/6">
                            <div className="text-primary-color text-lg font-semibold">
                              {order.productName}
                            </div>
                            <div className="text-text-color text-sm">
                              Số lượng: {order.quantity}
                            </div>
                            <div className="text-text-color text-sm">
                              Giá:{" "}
                              {order.unitPrice && formatPrice(order.unitPrice)}{" "}
                              VNĐ
                            </div>
                            <div className="text-text-color text-sm">
                              Thành tiền:{" "}
                              <span className="text-md font-semibold text-secondary-color">
                                {order.amount && formatPrice(order.amount)} VNĐ
                              </span>
                            </div>
                            <div className="text-text-color text-sm">
                              Phân loại: {order.styleValues.join(", ")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="text-text-color text-lg font-semibold w-full px-6 pt-4 flex items-center justify-between border-t border-border-color">
                  <span>Tổng cộng: </span>
                  <span className="text-secondary-color">
                    {orderItemDetails &&
                      formatPrice(getTotalAmount(orderItemDetails))}{" "}
                    VNĐ{" "}
                  </span>
                </div>
              </div>
              <Formik<ChangeOrderStatusToShipping>
                initialValues={{
                  orderId: updateOrder?.orderId ?? "",
                  shipperEmail: "",
                }}
                validateOnBlur={false}
                validateOnChange={false}
                validate={(values) => {
                  const errors = {
                    shipperEmail: "",
                  };
                  if (
                    !values.shipperEmail ||
                    values.shipperEmail.length === 0
                  ) {
                    errors.shipperEmail = "Vui lòng chọn shipper giao hàng";
                    shipperEmailFocusRef.current?.focus();
                    return errors;
                  }
                }}
                onSubmit={async (values) => {
                  setIsSubmitLoading(true);
                  const response =
                    await adminOrderApi.updateOrderStatusToShipping(values);
                  if (response?.statusCode != 200) {
                    showToast("Có lỗi xảy ra,vui lòng thử lại", "error");
                    return;
                  }
                  const newOrders = await adminOrderApi.getOrdersByStatus(
                    "SHIPPING"
                  );
                  setOrders(newOrders?.result.content || []);
                  setTotalOrders(newOrders?.result.totalElements || 0);
                  setFilterName("");
                  showToast(
                    "Cập nhật trạng thái đơn hàng thành công",
                    "success"
                  );
                  setOrderStatus(4);
                  setPage(0);
                  setTimeout(() => {
                    setUpdateOrder(null);
                    setOrderItemDetails([]);
                  }, 100);
                  setIsSubmitLoading(false);
                  setOpenChangeStatusDialog(false);
                }}
              >
                {({ values, errors, submitForm, isSubmitting, dirty }) => (
                  <Form className="flex flex-col mt-2">
                    <label
                      className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                      htmlFor={`nation`}
                    >
                      Tên shipper
                    </label>
                    <Field
                      name={"shipperEmail"}
                      innerRef={shipperEmailFocusRef}
                    >
                      {({ form }: FieldProps) => (
                        <Select
                          sx={{
                            "& .MuiInputBase-input": {
                              // borderRadius: "0.375rem!important",
                              border: `1px solid ${
                                errors.shipperEmail ? "red" : "#6b7280"
                              }`,
                              padding: "0.375rem 0.75rem!important",
                              flex: 1,
                              fontSize: "14px",
                              lineHeight: "20px",
                              transition: "all",
                              opacity: isSubmitLoading ? 0.55 : 1,
                            },
                            mb: "0.75rem",
                          }}
                          id="shipperEmail"
                          value={form.values.shipperEmail}
                          name={"shipperEmail"}
                          onChange={(event) => {
                            form.setFieldValue(
                              "shipperEmail",
                              event.target.value
                            );
                          }}
                          disabled={isSubmitLoading}
                        >
                          {shipperList.map((shipper) => (
                            <MenuItem
                              key={shipper.userId}
                              value={shipper.email}
                            >
                              {shipper.fullname}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="shipperEmail" component="div">
                      {(msg) => (
                        <div
                          className="mt-1 flex gap-x-2 text-sm text-red-500 animate-appear
                "
                        >
                          <ErrorIcon className="size-5" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                    <div className="flex gap-x-2 justify-end w-full mt-4">
                      <button
                        type="button"
                        disabled={isSubmitLoading}
                        className={`mt-2 px-4 py-1 rounded-md w-[7rem]
                        bg-primary-color text-white self-end mr-3 ${
                          isSubmitLoading ? "opacity-55" : "hover:opacity-70"
                        }`}
                        onClick={() => {
                          setOpenChangeStatusDialog(false);
                        }}
                      >
                        Hủy
                      </button>
                      <LoadingButton
                        disabled={!dirty || isSubmitLoading}
                        size="small"
                        type="submit"
                        loading={isSubmitLoading}
                        loadingIndicator={
                          <CircularProgress
                            sx={{ color: "white", width: 16, height: 16 }}
                            className="text-white"
                            size={16}
                          />
                        }
                        className={`mt-2 px-4 py-1 rounded-md text-white w-[7rem] 
                  bg-primary-color  text-base self-end transition-all`}
                        sx={{
                          mt: 2,
                          px: 2,
                          py: 0.45,
                          borderRadius: "0.375rem",
                          color:
                            !dirty || isSubmitLoading
                              ? "#1a4845!important"
                              : "white",
                          width: "7rem",
                          backgroundColor: "#1a4845",
                          fontSize: "15px",
                          fontWeight: "300",
                          alignSelf: "end",
                          transition: "all",
                          opacity: !dirty || isSubmitLoading ? 0.55 : 1,
                          "&:hover": {
                            bgcolor: "#1a4845!important",
                            opacity: !dirty || isSubmitLoading ? 1 : 0.7,
                            color: "#white!important",
                          },
                        }}
                        onClick={submitForm}
                      >
                        <span
                          className={`${
                            isSubmitLoading
                              ? "!text-primary-color"
                              : "text-white"
                          }`}
                        >
                          Xác nhận
                        </span>
                      </LoadingButton>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )
        }
        actions={
          updateOrder?.status == "PENDING" ? (
            <>
              <button
                type="button"
                className="mt-2 px-4 py-1 rounded-md w-24
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3"
                onClick={() => {
                  setOpenChangeStatusDialog(false);
                  setTimeout(() => {
                    setOrderItemDetails([]);
                  }, 0);
                }}
              >
                Hủy
              </button>
              <LoadingButton
                type="submit"
                size="small"
                sx={{
                  mt: 2,
                  px: 2,
                  py: 0.45,
                  borderRadius: "0.375rem",
                  color: "white!important",
                  width: "7rem",
                  backgroundColor: "#1a4845",
                  fontSize: "15px",
                  fontWeight: "300",
                  alignSelf: "end",
                  transition: "all",
                  opacity: isSubmitLoading ? 0.55 : 1,
                  "&:hover": {
                    bgcolor: "#1a4845!important",
                    opacity: isSubmitLoading ? 1 : 0.7,
                    color: "#white!important",
                  },
                }}
                className={`mt-2 px-4 py-1 rounded-md w-24
                    bg-primary-color text-white self-end  hover:opacity-70 ${
                      isSubmitLoading && "opacity-55"
                    } transition-all`}
                loading={isSubmitLoading}
                loadingIndicator={
                  <CircularProgress
                    sx={{ color: "white", width: 16, height: 16 }}
                    className="text-white"
                    size={16}
                  />
                }
                disabled={isSubmitLoading}
                variant="outlined"
                onClick={() =>
                  handleChangeStatusToProcessing(updateOrder.orderId)
                }
              >
                <span className={`${isSubmitLoading && "text-primary-color"}`}>
                  Đồng ý
                </span>
              </LoadingButton>
            </>
          ) : undefined
        }
      />
      <Popup
        padding={false}
        open={openDetailDialog}
        onClose={() => {
          setOpenDetailDialog(false);
          setTimeout(() => {
            setOrderItemDetails(null);
          });
        }}
        title={"Chi tiết đơn hàng"}
        content={
          loadingDetail ? (
            <div className="grid place-items-center p-4 w-[500px] h-[328px]">
              <CircleLoading />
            </div>
          ) : (
            <div className="max-h-[40rem] overflow-auto">
              <div className="flex flex-col pt-4">
                {orderItemDetails &&
                  orderItemDetails?.map((order) => {
                    return (
                      <div
                        key={order.orderItemId}
                        className="flex gap-x-4 px-6 py-4"
                      >
                        <div className="w-28 rounded-md">
                          <Image
                            width={100}
                            height={100}
                            src={order.image}
                            alt="order-detail-img"
                            className="w-full h-32 object-center object-cover"
                          />
                        </div>
                        <div className="w-4/6">
                          <div className="text-primary-color text-lg font-semibold">
                            {order.productName}
                          </div>
                          <div className="text-text-color text-sm">
                            Số lượng: {order.quantity}
                          </div>
                          <div className="text-text-color text-sm">
                            Giá:{" "}
                            {order.unitPrice && formatPrice(order.unitPrice)}{" "}
                            VNĐ
                          </div>
                          <div className="text-text-color text-sm">
                            Thành tiền:{" "}
                            <span className="text-md font-semibold text-secondary-color">
                              {order.amount && formatPrice(order.amount)} VNĐ
                            </span>
                          </div>
                          <div className="text-text-color text-sm">
                            Phân loại: {order.styleValues.join(", ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="text-text-color text-lg font-semibold w-full px-6 py-4 pb-1 flex items-center justify-between border-t border-border-color">
                <span>Tổng tiền hàng: </span>
                <span className="text-secondary-color">
                  {orderItemDetails &&
                    orderItemDetails.length > 0 &&
                    formatPrice(getTotalAmount(orderItemDetails))}{" "}
                  VNĐ
                </span>
              </div>
              {orderDetail && orderDetail.voucherDiscountAmount > 0 ? (
                <div className="text-lg font-semibold w-full px-6 py-1 flex items-center justify-between text-yellow-500">
                  <span>Giảm giá: </span>
                  <span className="">
                    {formatPrice(orderDetail?.voucherDiscountAmount || 0) +
                      " VNĐ"}
                  </span>
                </div>
              ) : null}
              <div className="text-text-color text-lg font-semibold w-full px-6 pt-1 pb-1 flex items-center justify-between ">
                <span>Phí vận chuyển: </span>
                <span className="text-secondary-color">
                  {formatPrice(orderDetail?.shippingCost || 0)} VNĐ{" "}
                </span>
              </div>
              <div className="text-text-color text-lg font-semibold w-full px-6 pt-1 flex items-center justify-between">
                <span>Tổng cộng: </span>
                <span className="text-secondary-color">
                  {orderDetail && formatPrice(orderDetail.totalAmount)} VNĐ{" "}
                </span>
              </div>
            </div>
          )
        }
      />
    </Container>
  );
}
