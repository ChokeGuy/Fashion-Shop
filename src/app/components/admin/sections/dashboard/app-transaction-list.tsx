"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import { emptyRows, getComparator } from "@/src/utilities/visual";
import { AddBrand, Brand, KeyString, Order, OrderItem } from "@/src/models";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import Popup from "@/src/app/components/Popup";
import { useRouter } from "next/navigation";
import { showToast } from "@/src/lib/toastify";
import Iconify from "../../iconify";
import Scrollbar from "../../scrollbar";
import { Transaction } from "@/src/models/transaction";
import AppTransactionRow from "./app-transaction-row";
import { applyFilter } from "./filter";
import TableNoData from "../table-no-data";
import CircleLoading from "../../../Loading";
import Image from "next/image";
import { formatPrice } from "@/src/utilities/price-format";
import TransactionTableHead from "./app-table-head";
import SingleInputDateRangePickerWithAdornment from "../../common/single-page-range";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import { DateRange } from "@mui/x-date-pickers-pro/models";
import dayjs, { Dayjs } from "dayjs";
import { adminStaticSticsApi } from "@/src/app/apis/admin/staticsticApi";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
// ----------------------------------------------------------------------

export default function AppTransactionList({
  transactions,
  totalTransactions,
  sx,
  ...other
}: {
  transactions: Transaction[];
  totalTransactions: number;
  sx?: object;
  [key: string]: any;
}) {
  const [transactionList, setTransactionList] =
    useState<Transaction[]>(transactions);
  const [totalTransactionList, setTotalTransactionList] =
    useState(totalTransactions);

  const [page, setPage] = useState(0);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [orderItemDetails, setOrderItemDetails] = useState<OrderItem[] | null>(
    null
  );
  const [filterDateRange, setFilterDateRange] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("transactionId");

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openFilter, setOpenFilter] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const getTransactionsByDateRange = async () => {
      if (
        filterDateRange &&
        filterDateRange[0]?.isValid() &&
        filterDateRange[1]?.isValid()
      ) {
        const datas = await adminStaticSticsApi.getRevenueByDateRange({
          dateFrom: filterDateRange[0].format("YYYY/MM/DD"),
          dateTo: filterDateRange[1].format("YYYY/MM/DD"),
          pagination: {
            page: 0,
            size: rowsPerPage,
          },
        });
        setPage(0);
        setTransactionList(datas?.result.transactionList ?? []);
        setTotalTransactionList(datas?.result.totalElements || 0);
      } else if (
        !filterDateRange[0]?.isValid() ||
        !filterDateRange[1]?.isValid()
      ) {
        const datas = await adminStaticSticsApi.getTotalRevenue();
        setTransactionList(datas?.result.transactionList ?? []);
        setTotalTransactionList(datas?.result.totalElements || 0);
      }
    };
    getTransactionsByDateRange();
  }, [filterDateRange]);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpenFilter(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenFilter(null);
  };

  // const handleSort = (event: any, id: string) => {
  //   const isAsc = orderBy === id && order === "asc";
  //   if (id !== "") {
  //     setOrder(isAsc ? "desc" : "asc");
  //     setOrderBy(id);
  //   }
  // };

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = transactionList.map((n) => n.transactionId);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    let paginatedTransactions;

    if (!filterDateRange[0]?.isValid() || !filterDateRange[1]?.isValid()) {
      paginatedTransactions = await adminStaticSticsApi.getTotalRevenue({
        page: newPage,
        size: rowsPerPage,
      });
    } else {
      paginatedTransactions = await adminStaticSticsApi.getRevenueByDateRange({
        dateFrom: filterDateRange[0].format("YYYY/MM/DD"),
        dateTo: filterDateRange[1].format("YYYY/MM/DD"),
        pagination: {
          page: newPage,
          size: rowsPerPage,
        },
      });
    }

    setPage(newPage);
    setTransactionList(paginatedTransactions?.result.transactionList || []);
    setTotalTransactionList(paginatedTransactions?.result.totalElements || 0);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    let paginatedTransactions;

    if (!filterDateRange[0]?.isValid() || !filterDateRange[1]?.isValid()) {
      paginatedTransactions = await adminStaticSticsApi.getTotalRevenue({
        page: 0,
        size: newRowsPerPage,
      });
    } else {
      paginatedTransactions = await adminStaticSticsApi.getRevenueByDateRange({
        dateFrom: filterDateRange[0].format("YYYY/MM/DD"),
        dateTo: filterDateRange[1].format("YYYY/MM/DD"),
        pagination: {
          page: 0,
          size: newRowsPerPage,
        },
      });
    }
    setPage(0);
    setRowsPerPage(newRowsPerPage);
    setTransactionList(paginatedTransactions?.result.transactionList || []);
    setTotalTransactionList(paginatedTransactions?.result.totalElements || 0);
  };

  // const dataFiltered = applyFilter({
  //   inputData: transactionList,
  //   comparator: getComparator(order, orderBy),
  //   filterName: "",
  // });

  const getTotalAmount = (orderItemDetails: OrderItem[]): number => {
    return orderItemDetails.reduce((total, order) => total + order.amount, 0);
  };

  const handleFilterPastDateRange = (type: string) => {
    let dateTo = dayjs().subtract(1, "day");
    let dateFrom;

    if (type === "day") {
      dateFrom = dateTo.clone().subtract(1, "day");
    } else if (type === "week") {
      dateFrom = dateTo.clone().subtract(6, "day");
    } else if (type === "month") {
      dateFrom = dateTo.clone().add(1, "day").subtract(1, "month");
    }
    if (dateFrom && dateTo) setFilterDateRange([dateFrom, dateTo]);
  };

  const handleResetDateRange = () => {
    setPage(0);
    setFilterDateRange([null, null]);
  };

  const handleExportTransaction = async () => {
    let exportData;
    setIsExporting(true);
    if (!filterDateRange[0]?.isValid() || !filterDateRange[1]?.isValid()) {
      exportData = await adminStaticSticsApi.exportTotalRevenue();
    } else {
      exportData = await adminStaticSticsApi.exportRevenueByDateRange({
        dateFrom: filterDateRange[0].format("YYYY/MM/DD"),
        dateTo: filterDateRange[1].format("YYYY/MM/DD"),
      });
    }
    console.log("Export data", exportData);
    if (exportData.data) {
      showToast("Xuất dữ liệu thành công", "success");
      const url = window.URL.createObjectURL(new Blob([exportData.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from the Content-Disposition header
      const contentDisposition = exportData.headers["content-disposition"];
      let filename = "Total-Revenues.xlsx"; // default filename
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        let matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      setIsExporting(false);
    }
  };

  // const notFound = !dataFiltered.length;

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <div className="flex items-center space-x-2">
          <Typography variant="h4">Giao dịch</Typography>
          <Tooltip title="Lọc giao dịch">
            <IconButton
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => handleOpenMenu(event)}
            >
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
          <Popover
            open={!!openFilter}
            anchorEl={openFilter}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
            PaperProps={{
              sx: { padding: 1.5, minHeight: "6rem", border: "1px solid #ccc" },
            }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-primary-color">Lọc theo thời gian:</span>
              <SingleInputDateRangePickerWithAdornment
                value={filterDateRange}
                setValue={setFilterDateRange}
              />
            </div>
            {/* <pre>
              {JSON.stringify(filterDateRange[0]?.format("YYYY/MM/DD"))}
            </pre>
            <pre>
              {JSON.stringify(filterDateRange[1]?.format("YYYY/MM/DD"))}
            </pre> */}
            <div className="flex items-center space-x-6 mt-4">
              <span className="text-primary-color">Thời điểm trước:</span>
              <div className="space-x-8 pl-2">
                {["day", "week", "month"].map((item) => (
                  <Button
                    onClick={() => handleFilterPastDateRange(item)}
                    sx={{
                      bgcolor: "#1A4845",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "#1A4845",
                        opacity: 0.55,
                      },
                      transition: "all",
                    }}
                    key={item}
                    variant="contained"
                  >
                    1{" "}
                    {item == "day" ? "ngày" : item == "week" ? "tuần" : "tháng"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="w-full flex justify-end mt-4">
              <Button
                onClick={handleResetDateRange}
                sx={{
                  bgcolor: "#1A4845",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "#1A4845",
                    opacity: 0.55,
                  },
                  transition: "all",
                }}
                variant="contained"
              >
                Đặt lại
              </Button>
            </div>
          </Popover>
        </div>
        <LoadingButton
          type="button"
          sx={{
            mt: 2,
            px: 4,
            py: 0.45,
            borderRadius: "0.375rem",
            color: isExporting ? "#1a4845!important" : "white",
            width: "7rem",
            backgroundColor: "#1a4845",
            fontSize: "16px",
            fontWeight: "700",
            alignSelf: "end",
            transition: "all",
            opacity: isExporting ? 0.55 : 1,
            "&:hover": {
              bgcolor: "#1a4845!important",
              opacity: isExporting ? 1 : 0.7,
              color: "#white!important",
            },
          }}
          disabled={isExporting}
          loading={isExporting}
          startIcon={<Iconify icon="eva:plus-fill" />}
          loadingIndicator={
            <CircularProgress
              className="text-white"
              sx={{ color: "white" }}
              size={16}
            />
          }
          className={`mt-2 px-4 py-1 rounded-md ${isExporting && "opacity-55"}
                      bg-primary-color text-white self-end  hover:opacity-70 transition-opacity`}
          onClick={handleExportTransaction}
          variant="outlined"
        >
          <span className={`${isExporting && "text-primary-color"}`}>
            Export
          </span>
        </LoadingButton>
        {/* <Button
          onClick={handleExportTransaction}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Export
        </Button> */}
      </Stack>
      <Card
        component={Stack}
        spacing={3}
        sx={{
          ...sx,
        }}
        {...other}
      >
        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <TransactionTableHead
                numSelected={selected.length}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "transactionId", label: "Mã giao dịch" },
                  { id: "order.orderId", label: "Mã đơn hàng" },
                  { id: "order.fullName", label: "Người nhận hàng" },
                  { id: "order.phone", label: "Số điện thoại" },
                  {
                    id: "order.paymentMethod",
                    label: "Phương thức thanh toán",
                  },
                  { id: "order.shippingCost", label: "Phí giao hàng" },
                  { id: "order.totalAmount", label: "Tổng tiền" },
                  { id: "order.createdAt", label: "Thời gian thanh toán" },
                  { id: "", label: "" },
                ]}
              />
              <TableBody>
                {transactionList.map((row: Transaction) => (
                  <AppTransactionRow
                    setOpenDetailDialog={setOpenDetailDialog}
                    setOrderDetail={setOrderDetail}
                    setLoadingDetail={setLoadingDetail}
                    setOrderItemDetails={setOrderItemDetails}
                    key={row.transactionId}
                    transaction={row}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={totalTransactionList}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
                <div className="flex flex-col py-4">
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
      </Card>
    </div>
  );
}
