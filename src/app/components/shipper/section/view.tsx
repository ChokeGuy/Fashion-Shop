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

import DeliveryTableHead from "./delivery-table-head";
import OrderTableToolbar from "./delivery-table-toolbar";
import { emptyRows, getComparator } from "@/src/utilities/visual";
import {
  ChangeOrderStatusToShipping,
  Delivery,
  Order,
  OrderItem,
  User,
} from "@/src/models";
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
import { applyFilter } from "./filter";
import Scrollbar from "../../admin/scrollbar";
import TableNoData from "../../admin/sections/table-no-data";
import { deliveryApi } from "@/src/app/apis/shipper/deliveryApi";
import DeliveryTableRow from "./delivery-table-row";
// ----------------------------------------------------------------------

export default function OrderView() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openChangeStatusDialog, setOpenChangeStatusDialog] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);

  const [deliveryItemDetail, setDeliveryItemDetail] = useState<Delivery | null>(
    null
  );

  const [page, setPage] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState("deliveryId");

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [deliveryStatus, setDeliveryStatus] = useState(0);

  useEffect(() => {
    const getAllDeliveries = async () => {
      setIsLoading(true);
      const response = await deliveryApi.getAllDeliveries();
      setDeliveries(response?.result.deliveryList || []);
      setTotalDeliveries(response?.result.totalElements || 0);
      setIsLoading(false);
    };
    getAllDeliveries();
  }, []);

  const getDeliveryStatus = (
    deliveryStatus: number
  ): "not-received" | "received-notDelivered" | "delivered" => {
    switch (deliveryStatus) {
      case 1:
        return "not-received";
      case 2:
        return "received-notDelivered";
      case 3:
        return "delivered";
      default:
        return "not-received";
    }
  };

  const handleChangeStatus = async (
    _event: React.ChangeEvent<{}>,
    deliveryStatus: number
  ) => {
    setPage(0);
    let delivery;
    if (deliveryStatus == 0) {
      delivery = await deliveryApi.getAllDeliveries({
        page: 0,
        size: rowsPerPage,
      });
    } else {
      const status = getDeliveryStatus(deliveryStatus);
      delivery = await deliveryApi.getDeliveries(status, {
        page: 0,
        size: rowsPerPage,
      });
    }
    setDeliveryStatus(deliveryStatus);
    setDeliveries(delivery?.result.deliveryList ?? []);
    setTotalDeliveries(delivery?.result.totalElements ?? 0);
  };
  const handleChangePage = async (_event: any, newPage: number) => {
    let paginatedDeliveries;
    if (deliveryStatus == 0) {
      paginatedDeliveries = await deliveryApi.getAllDeliveries({
        page: newPage,
        size: rowsPerPage,
      });
    } else {
      const status = getDeliveryStatus(deliveryStatus);
      paginatedDeliveries = await deliveryApi.getDeliveries(status, {
        page: newPage,
        size: rowsPerPage,
      });
    }
    setPage(newPage);
    setDeliveries(paginatedDeliveries?.result.deliveryList || []);
    setTotalDeliveries(paginatedDeliveries?.result.totalElements || 0);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    let paginatedDeliveries;
    if (deliveryStatus == 0) {
      paginatedDeliveries = await deliveryApi.getAllDeliveries({
        page: 0,
        size: newRowsPerPage,
      });
    } else {
      const status = getDeliveryStatus(deliveryStatus);
      paginatedDeliveries = await deliveryApi.getDeliveries(status, {
        page: 0,
        size: newRowsPerPage,
      });
    }
    setPage(0);
    setRowsPerPage(newRowsPerPage);
    setDeliveries(paginatedDeliveries?.result.deliveryList || []);
    setTotalDeliveries(paginatedDeliveries?.result.totalElements || 0);
  };

  const handleSearch = useCallback(
    debounce(async (deliveryId: string) => {
      if (isNaN(Number(deliveryId))) {
        return;
      } else if (deliveryId.length == 0) {
        const result = await deliveryApi.getAllDeliveries();
        setDeliveries(result?.result.deliveryList || []);
        setTotalDeliveries(result?.result.totalElements || 0);
        return;
      }
      const result = await deliveryApi.getDeliveryById(+deliveryId);
      if (result?.statusCode == 404) {
        setDeliveries([]);
        setTotalDeliveries(0);
        return;
      }
      setDeliveries([result?.result.delivery!]);
      setTotalDeliveries(1);
    }, 500),
    []
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    setFilterName(value);
    await handleSearch(value);
  };

  const dataFiltered = applyFilter({
    inputData: deliveries,
    filterName,
  });

  async function updateDeliveries(deliveryStatus: number) {
    const status = getDeliveryStatus(deliveryStatus);
    const newDeliveries =
      deliveryStatus == 0
        ? await deliveryApi.getAllDeliveries()
        : await deliveryApi.getDeliveries(status);

    setDeliveries(newDeliveries?.result.deliveryList || []);
    setTotalDeliveries(newDeliveries?.result.totalElements || 0);

    switch (status) {
      case "not-received":
        showToast("Nhận đơn hàng thành công", "success");
        break;
      case "received-notDelivered":
        showToast("Giao hàng thành công", "success");
        break;
    }
  }

  const handleChageDeliveryStatus = async () => {
    if (deliveryItemDetail) {
      try {
        setIsSubmitLoading(true);
        let response;

        if (!deliveryItemDetail.isReceived && !deliveryItemDetail.isDelivered) {
          response = await deliveryApi.receiveOrder(
            deliveryItemDetail.deliveryId
          );
        } else if (
          deliveryItemDetail.isReceived &&
          !deliveryItemDetail.isDelivered
        ) {
          response = await deliveryApi.deliverOrder(
            deliveryItemDetail.deliveryId
          );
        }
        if (response?.success) await updateDeliveries(deliveryStatus);
      } catch (error) {
        showToast("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng", "error");
      } finally {
        setOpenChangeStatusDialog(false);
        setDeliveryItemDetail(null);
        setIsSubmitLoading(false);
      }
    }
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
            value={deliveryStatus}
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
              label="Chờ xác nhận"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Chờ giao"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Giao thành công"
            />
          </Tabs>
        </div>
        {deliveryStatus == 0 && (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <DeliveryTableHead
                    numSelected={selected.length}
                    headLabel={[
                      { id: "deliveryId", label: "Mã vận chuyển" },
                      { id: "orderId", label: "Mã đơn hàng" },
                      { id: "recepientName", label: "Khách hàng" },
                      { id: "phone", label: "Số điện thoại" },
                      {
                        id: "shipperName",
                        label: "Người giao hàng",
                      },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "checkoutStatus", label: "Trạng thái" },

                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered &&
                      dataFiltered.length > 0 &&
                      dataFiltered.map((row: Delivery, index) => (
                        <DeliveryTableRow
                          setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                          setOpenDetailDialog={setOpenDetailDialog}
                          setLoadingDetail={setLoadingDetail}
                          setDeliveryItemDetail={setDeliveryItemDetail}
                          key={row.orderId}
                          delivery={row}
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
              count={totalDeliveries}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {deliveryStatus == 1 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <DeliveryTableHead
                    numSelected={selected.length}
                    headLabel={[
                      { id: "deliveryId", label: "Mã vận chuyển" },
                      { id: "orderId", label: "Mã đơn hàng" },
                      { id: "recepientName", label: "Khách hàng" },
                      { id: "phone", label: "Số điện thoại" },
                      {
                        id: "shipperName",
                        label: "Người giao hàng",
                      },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "checkoutStatus", label: "Trạng thái" },

                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Delivery) => (
                      <DeliveryTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setLoadingDetail={setLoadingDetail}
                        setDeliveryItemDetail={setDeliveryItemDetail}
                        key={row.orderId}
                        delivery={row}
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
              count={totalDeliveries}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {deliveryStatus == 2 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <DeliveryTableHead
                    numSelected={selected.length}
                    headLabel={[
                      { id: "deliveryId", label: "Mã vận chuyển" },
                      { id: "orderId", label: "Mã đơn hàng" },
                      { id: "recepientName", label: "Khách hàng" },
                      { id: "phone", label: "Số điện thoại" },
                      {
                        id: "shipperName",
                        label: "Người giao hàng",
                      },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "checkoutStatus", label: "Trạng thái" },

                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Delivery) => (
                      <DeliveryTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setLoadingDetail={setLoadingDetail}
                        setDeliveryItemDetail={setDeliveryItemDetail}
                        key={row.orderId}
                        delivery={row}
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
              count={totalDeliveries}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        {deliveryStatus == 3 && (
          <>
            {" "}
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <DeliveryTableHead
                    numSelected={selected.length}
                    headLabel={[
                      { id: "deliveryId", label: "Mã vận chuyển" },
                      { id: "orderId", label: "Mã đơn hàng" },
                      { id: "recepientName", label: "Khách hàng" },
                      { id: "phone", label: "Số điện thoại" },
                      {
                        id: "shipperName",
                        label: "Người giao hàng",
                      },
                      { id: "totalAmount", label: "Tổng tiền" },
                      { id: "checkoutStatus", label: "Trạng thái" },

                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {deliveries.map((row: Delivery) => (
                      <DeliveryTableRow
                        setOpenStatusChangeDialog={setOpenChangeStatusDialog}
                        setOpenDetailDialog={setOpenDetailDialog}
                        setLoadingDetail={setLoadingDetail}
                        setDeliveryItemDetail={setDeliveryItemDetail}
                        key={row.orderId}
                        delivery={row}
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
              count={totalDeliveries}
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
          setTimeout(() => {
            setDeliveryItemDetail(null);
          });
        }}
        type="confirm"
        title={
          !deliveryItemDetail?.isReceived && !deliveryItemDetail?.isDelivered
            ? "Xác nhận nhận hàng?"
            : "Xác nhận giao hàng?"
        }
        content={undefined}
        actions={
          <>
            <button
              type="button"
              className="mt-2 px-4 py-1 rounded-md w-24
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3"
              onClick={() => {
                setOpenChangeStatusDialog(false);
                setTimeout(() => {
                  setDeliveryItemDetail(null);
                });
              }}
            >
              Hủy
            </button>
            <LoadingButton
              type="button"
              onClick={handleChageDeliveryStatus}
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
                    bg-red-500 text-white self-end  hover:opacity-70 ${
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
            >
              <span className={`${isSubmitLoading && "text-primary-color"}`}>
                Xác nhận
              </span>
            </LoadingButton>
          </>
        }
      />
      <Popup
        padding={false}
        open={openDetailDialog}
        onClose={() => {
          setOpenDetailDialog(false);
          setTimeout(() => {
            setDeliveryItemDetail(null);
          });
        }}
        title={"Chi tiết đơn hàng"}
        content={
          loadingDetail ? (
            <div className="grid place-items-center p-4 w-[352px] h-[310px]">
              <CircleLoading />
            </div>
          ) : (
            <div className="max-h-[40rem] overflow-auto">
              <div className="flex flex-col pb-4">
                {deliveryItemDetail && (
                  <div key={deliveryItemDetail.deliveryId} className="flex p-2">
                    {/* <div className="w-28 rounded-md">
                      <Image
                        width={100}
                        height={100}
                        src={deliveryItemDetail.image}
                        alt="deliveryItemDetail-detail-img"
                        className="w-full h-32 object-center object-cover"
                      />
                    </div> */}
                    <div className="w-full flex gap-y-2 flex-col">
                      <div className="text-primary-color-color text-lg font-bold flex items-center gap-x-2">
                        <div className="font-bold">Người nhận:</div>{" "}
                        {deliveryItemDetail.recipientName}
                      </div>
                      <div className="text-text-color text-sm flex items-center gap-x-2">
                        <div className="font-bold whitespace-nowrap">
                          Địa chỉ:
                        </div>{" "}
                        {deliveryItemDetail.address}
                      </div>
                      <div className="text-text-color text-sm flex items-center gap-x-2">
                        <div className="font-bold">Điện thoại:</div>{" "}
                        {deliveryItemDetail.phone}
                      </div>
                      <div className="text-text-color text-sm flex items-center gap-x-2">
                        <div className="font-bold">Người giao hàng:</div>{" "}
                        {deliveryItemDetail.shipperName}
                      </div>
                      <div className="text-text-color text-sm flex items-center gap-x-2">
                        <div className="font-bold">Email:</div>{" "}
                        {deliveryItemDetail.shipperEmail}
                      </div>
                      <div className="text-text-color text-sm flex items-center gap-x-2">
                        <div className="font-bold">Ghi chú:</div>{" "}
                        {deliveryItemDetail &&
                        deliveryItemDetail.note &&
                        deliveryItemDetail.note.length > 0
                          ? deliveryItemDetail.note
                          : "Không có ghi chú nào"}{" "}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-text-color text-lg font-semibold w-full px-2 pt-2 flex items-center justify-between border-t border-border-color">
                <span>Phí vận chuyển: </span>
                <span className="text-secondary-color">
                  {deliveryItemDetail &&
                    formatPrice(deliveryItemDetail.shippingCost)}{" "}
                  VNĐ{" "}
                </span>
              </div>
              <div className="text-text-color text-lg font-semibold w-full px-2 pt-2 flex items-center justify-between">
                <span>Tổng đơn hàng: </span>
                <span className="text-secondary-color">
                  {deliveryItemDetail &&
                    formatPrice(deliveryItemDetail.totalAmount)}{" "}
                  VNĐ{" "}
                </span>
              </div>
            </div>
          )
        }
      />
    </Container>
  );
}
