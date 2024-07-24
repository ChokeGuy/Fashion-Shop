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
import PromotionTableRow from "../promotion-table-row";
import PromotionTableHead from "../promotion-table-head";
import PromotionTableToolbar from "../promotion-table-toolbar";
import { applyFilter } from "../filter";
import {
  AddPromotion,
  Banner,
  Category,
  Promotion,
  KeyString,
  UpdatePromotion,
} from "@/src/models";
import { adminPromotionApi } from "@/src/app/apis/admin/promotionApi";
import { getComparator, emptyRows } from "@/src/utilities/visual";
import TableEmptyRows from "../../table-empty-rows";
import TableNoData from "../../table-no-data";
import AdminLoading from "../../../admin-loading";
import CircleLoading from "@/src/app/components/Loading";
import Button from "@mui/material/Button";
import Iconify from "../../../iconify";
import { useRouter } from "next/navigation";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import ErrorIcon from "@mui/icons-material/Error";

import Popup from "@/src/app/components/Popup";
import { showToast } from "@/src/lib/toastify";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { adminBannerApi } from "@/src/app/apis/admin/bannerApi";
import MenuItem from "@mui/material/MenuItem";
import { MenuProps } from "@/src/utilities/multi-select-prop";
import { Checkbox, ListItemText } from "@mui/material";
import { adminCategoryApi } from "@/src/app/apis/admin/categoryApi";
import isLeapYear from "dayjs/plugin/isLeapYear"; // import plugin
import dayjs from "dayjs";
import { debounce } from "lodash";
import {
  getPromotionTypeIndex,
  PromotionType,
} from "@/src/constants/promotion-type";

dayjs.extend(isLeapYear); // use plugin
dayjs.locale("en"); // use locale
// ----------------------------------------------------------------------

export default function PromotionView() {
  const [isLoading, setIsLoading] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [totalPromotions, setTotalPromotions] = useState<number>(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [isUpdatePromotionLoading, setIsUpdatePromotionLoading] =
    useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [updatePromotion, setUpdatePromotion] = useState<Promotion | null>(
    null
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("promotionId");

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activatePromotion, setActivatePromotion] = useState<Promotion | null>(
    null
  );

  const promotionNameFocusRef = useRef<HTMLInputElement | null>(null);
  const bannerIdFocusRef = useRef<HTMLSelectElement | null>(null);
  const startAtFocusRef = useRef<HTMLSelectElement | null>(null);
  const expireAtFocusRef = useRef<HTMLSelectElement | null>(null);
  const promotionTypeFocusRef = useRef<HTMLSelectElement | null>(null);
  const discountByPercentageFocusRef = useRef<HTMLSelectElement | null>(null);
  const discountByAmountFocusRef = useRef<HTMLSelectElement | null>(null);
  const categoryIdsFocusRef = useRef<HTMLSelectElement | null>(null);
  const minOrderAmountFocusRef = useRef<HTMLSelectElement | null>(null);
  const maxPromotionAmountFocusRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    const getDatas = async () => {
      setIsLoading(true);
      const [promotionsResponse, bannersResponse, categoriesResponse] =
        await Promise.all([
          adminPromotionApi.getAllPromotions(),
          adminBannerApi.getAllBanners({
            page: 0,
            size: 9999999,
          }),
          adminCategoryApi.getAllCategories({
            page: 0,
            size: 9999999,
          }),
        ]);
      const filterBanners = bannersResponse?.result.content.filter(
        (banner) => banner.isActive
      );
      setPromotions(promotionsResponse?.result.promotionList || []);
      setTotalPromotions(promotionsResponse?.result.totalElements || 0);
      setBanners(filterBanners || []);
      setCategories(categoriesResponse?.result.content || []);
      setIsLoading(false);
    };
    getDatas();
  }, []);

  function castPromotion(promotion: PromotionType) {
    const promotionName = {
      VOUCHER_AMOUNT: "Giảm giá theo số tiền",
      VOUCHER_PERCENT: "Giảm giá theo phần trăm",
      CATEGORIES: "Giảm giá theo danh mục",
    };

    return promotionName[promotion];
  }

  const handleSort = (event: any, id: string) => {
    const isAsc = orderBy === id && order === "asc";
    if (id !== "") {
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = promotions.map((n) => n.promotionName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetPromotions(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetPromotions(0, newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleChangePromotionActive = async () => {
    setActivateLoading(true);
    const response = await adminPromotionApi.changePromotionActivation(
      activatePromotion?.promotionId!
    );
    if (response?.message == "Promotions in progress cannot be disabled") {
      showToast("Không thể vô hiệu khi chương trình đang kích hoạt", "error");
      setActivateLoading(false);
      return;
    }
    if (!response?.success) {
      showToast("Thay đổi trạng thái chương trình thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetPromotions(page, rowsPerPage);

    setActivateLoading(false);
    setActivateDialog(false);
    setTimeout(() => {
      setActivatePromotion(null);
    }, 300);
    showToast(
      "Thay đổi trạng thái chương trình thành công",
      "success",
      "top-right"
    );
  };

  const handleResetPromotions = async (page: number, rowsPerPage: number) => {
    if (filterName.length == 0) {
      const result = await adminPromotionApi.getAllPromotions("", {
        page: page,
        size: rowsPerPage,
      });
      setPromotions(result?.result.promotionList || []);
      setTotalPromotions(result?.result.totalElements || 0);
      return;
    } else if (isNaN(Number(filterName))) {
      const result = await adminPromotionApi.getAllPromotions(filterName, {
        page: page,
        size: rowsPerPage,
      });
      if (result?.statusCode != 200) {
        setPromotions([]);
        setTotalPromotions(0);
        return;
      }
      setPromotions(result?.result.promotionList || []);
      setTotalPromotions(result?.result.totalElements || 0);
      return;
    }
    const result = await adminPromotionApi.getPromotionsById(filterName);
    if (result?.statusCode != 200) {
      setPromotions([]);
      setTotalPromotions(0);
      return;
    }
    setPromotions([result?.result] || []);
    setTotalPromotions(1);
  };

  const handleSearch = useCallback(
    debounce(async (promotionName: string) => {
      if (promotionName.length == 0) {
        const result = await adminPromotionApi.getAllPromotions("", {
          page: page,
          size: rowsPerPage,
        });
        setPromotions(result?.result.promotionList || []);
        setTotalPromotions(result?.result.totalElements || 0);
        return;
      } else if (isNaN(Number(promotionName))) {
        const result = await adminPromotionApi.getAllPromotions(promotionName, {
          page: page,
          size: rowsPerPage,
        });
        if (result?.statusCode != 200) {
          setPromotions([]);
          setTotalPromotions(0);
          return;
        }
        setPromotions(result?.result.promotionList || []);
        setTotalPromotions(result?.result.totalElements || 0);
        return;
      }
      const result = await adminPromotionApi.getPromotionsById(promotionName);
      if (result?.statusCode != 200) {
        setPromotions([]);
        setTotalPromotions(0);
        return;
      }
      setPromotions([result?.result] || []);
      setTotalPromotions(1);
    }, 500),
    [page, rowsPerPage]
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    await handleSearch(value);
    setFilterName(value);
  };

  const dataFiltered = applyFilter({
    inputData: promotions,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const handleApplyPromotion = async () => {
    setOpenDialog(true);
    setIsUpdateLoading(true);
    const action: "revoke" | "grant" = !updatePromotion?.isAvailable
      ? "grant"
      : "revoke";
    const result = await adminPromotionApi.applyPromotion(
      updatePromotion?.promotionId!,
      action
    );
    if (result?.message == "Promotion doesn't exist or is disabled") {
      showToast("Chương trình này đã bị vô hiệu", "error");
      setIsUpdateLoading(false);
      return;
    }
    if (
      result?.message ==
      "The current time is not suitable for grant the promotion"
    ) {
      showToast(
        "Thời gian của chương trình này chưa bắt đầu hoặc đã hết hạn",
        "error"
      );
      setIsUpdateLoading(false);
      return;
    }
    if (!result?.success) {
      showToast("Có lỗi xảy ra,vui lòng thử lại", "error");
      setIsUpdateLoading(false);
      return;
    }
    await handleResetPromotions(page, rowsPerPage);
    showToast("Cập nhật thành công", "success");
    setOpenDialog(false);
    setIsUpdateLoading(false);
    setTimeout(() => {
      setUpdatePromotion(null);
      setCategoryIds([]);
    }, 300);
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
        <Typography variant="h4">Chương trình khuyến mãi</Typography>

        <Button
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Chương trình mới
        </Button>
      </Stack>

      <Card>
        <PromotionTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <PromotionTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "promotionId", label: "Id" },
                  {
                    id: "promotionName",
                    label: "Tên chương trình/mã giảm giá",
                  },
                  { id: "promotionType", label: "Giảm giá theo" },
                  { id: "startAt", label: "Ngày bắt đầu" },
                  { id: "expireAt", label: "Ngày hết hạn" },
                  { id: "discountByPercentage", label: "Giảm giá" },
                  { id: "isAvailable", label: "Áp dụng" },
                  { id: "isActive", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered &&
                  dataFiltered.length > 0 &&
                  dataFiltered.map((row: Promotion) => (
                    <PromotionTableRow
                      setOpenDialog={setOpenDialog}
                      setUpdatePromotion={setUpdatePromotion}
                      key={row.promotionId}
                      promotion={row}
                      setActivateDialog={setActivateDialog}
                      setActivatePromotion={setActivatePromotion}
                      setOpenUpdateDialog={setOpenUpdateDialog}
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
          count={totalPromotions}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Popup
        isActivePopup={true}
        padding={true}
        closeButton={{
          top: "-4px",
          right: "12px",
        }}
        open={openActivateDialog}
        onClose={() => {
          setActivateDialog(false);
          setTimeout(() => {
            setActivatePromotion(null);
          }, 100);
        }}
        title={
          activatePromotion?.isActive
            ? "Vô hiệu hóa chương trình/mã giảm giá này?"
            : "Kích hoạt chương trình/mã giảm giá này?"
        }
        content={undefined}
        actions={
          <>
            <button
              type="button"
              className="mt-2 px-4 py-1 rounded-md w-24
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3"
              onClick={() => {
                setActivateDialog(false);
                setTimeout(() => {
                  setActivatePromotion(null);
                }, 300);
              }}
            >
              Hủy
            </button>
            <LoadingButton
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
                opacity: activateLoading ? 0.55 : 1,
                "&:hover": {
                  bgcolor: "#1a4845!important",
                  opacity: activateLoading ? 1 : 0.7,
                  color: "#white!important",
                },
              }}
              onClick={handleChangePromotionActive}
              type="button"
              size="small"
              className={`mt-2 px-4 py-1 rounded-md w-24
            bg-primary-color text-white self-end ${
              activateLoading && "opacity-55"
            }  hover:opacity-70`}
              loading={activateLoading}
              loadingIndicator={
                <CircularProgress
                  sx={{ color: "white" }}
                  className="text-white"
                  size={16}
                />
              }
              disabled={activateLoading}
              variant="outlined"
            >
              <span className={`${activateLoading && "text-primary-color"}`}>
                Đồng ý
              </span>
            </LoadingButton>
          </>
        }
      ></Popup>
      <Popup
        isLargeActivePopup={true}
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setTimeout(() => {
            setUpdatePromotion(null);
            setCategoryIds([]);
          }, 300);
        }}
        title={
          updatePromotion
            ? !updatePromotion.isAvailable
              ? "Áp dụng chương trình/mã giảm giá này?"
              : "Vô hiệu hóa chương trình/mã giảm giá này?"
            : "Thêm chương trình/mã giảm giá mới"
        }
        content={
          updatePromotion ? undefined : (
            <div className="flex flex-col gap-y-1">
              <Formik<AddPromotion & KeyString>
                initialValues={{
                  promotionName: "",
                  promotionType: "",
                  startAt: undefined,
                  expireAt: undefined,
                  categoryIds: [],
                  bannerId: "",
                  discountByPercentage: "",
                  discountByAmount: "",
                  minOrderAmount: "",
                  maxPromotionAmount: "",
                  // Add other missing properties here
                }}
                validateOnBlur={false}
                validateOnChange={false}
                validate={(values) => {
                  const errors = {
                    promotionName: "",
                    promotionType: "",
                    startAt: "",
                    expireAt: "",
                    categoryIds: "",
                    bannerId: "",
                    discountByPercentage: "",
                    discountByAmount: "",
                    minOrderAmount: "",
                    maxPromotionAmount: "",
                  };
                  if (
                    !values.promotionName ||
                    values.promotionName.length === 0
                  ) {
                    errors.promotionName =
                      "Vui lòng nhập tên chương trình/mã giảm giá";
                    promotionNameFocusRef.current?.focus();
                    return errors;
                  }
                  // if (!values.bannerId || values.bannerId === -1) {
                  //   errors.bannerId = "Vui lòng chọn banner quảng cáo";
                  //   bannerIdFocusRef.current?.focus();
                  //   return errors;
                  // }
                  if (
                    !values.startAt ||
                    (values.startAt as string).length === 0
                  ) {
                    errors.startAt = "Vui lòng nhập ngày bắt đầu";
                    startAtFocusRef.current?.focus();
                    return errors;
                  }

                  if (
                    !values.expireAt ||
                    (values.expireAt as string).length === 0
                  ) {
                    errors.expireAt = "Vui lòng nhập ngày hết hạn";
                    expireAtFocusRef.current?.focus();
                    return errors;
                  }

                  const startAt = new Date(values.startAt as string);
                  const expireAt = new Date(values.expireAt as string);
                  if (expireAt <= startAt) {
                    errors.expireAt = "Ngày hết hạn phải sau ngày bắt đầu";
                    expireAtFocusRef.current?.focus();
                    return errors;
                  }

                  if (
                    !values.promotionType ||
                    values.promotionType.length === 0
                  ) {
                    errors.promotionType = "Vui lòng chọn loại khuyến mãi";
                    promotionTypeFocusRef.current?.focus();
                    return errors;
                  }

                  if (values.promotionType == "VOUCHER_PERCENT") {
                    if (values.discountByPercentage === "") {
                      errors.discountByPercentage =
                        "Vui lòng nhập phần trăm giảm";
                      discountByPercentageFocusRef.current?.focus();
                      return errors;
                    } else if (
                      values.discountByPercentage! <= 0 ||
                      values.discountByPercentage! >= 100
                    ) {
                      errors.discountByPercentage =
                        "Phần trăm phải từ 0% đến nhỏ hơn 100%";
                      discountByPercentageFocusRef.current?.focus();
                      return errors;
                    }
                  }

                  if (values.promotionType == "VOUCHER_AMOUNT") {
                    if (values.discountByAmount === "") {
                      errors.discountByAmount = "Vui lòng nhập số tiền giảm";
                      discountByAmountFocusRef.current?.focus();
                      return errors;
                    } else if (values.discountByAmount! <= 0) {
                      errors.discountByAmount = "Số tiền giảm phải lớn hơn 0";
                      discountByAmountFocusRef.current?.focus();
                      return errors;
                    }
                  }

                  if (values.promotionType !== "CATEGORIES") {
                    if (values.minOrderAmount == "") {
                      errors.minOrderAmount = "Vui lòng nhập giá tối thiểu";
                      minOrderAmountFocusRef.current?.focus();
                      return errors;
                    } else if (values.minOrderAmount! < 0) {
                      errors.minOrderAmount = "Tối thiểu không được nhỏ hơn 0";
                      minOrderAmountFocusRef.current?.focus();
                      return errors;
                    }
                    if (values.promotionType == "VOUCHER_PERCENT") {
                      if (
                        !values.maxPromotionAmount ||
                        (values.maxPromotionAmount as any) == ""
                      ) {
                        errors.maxPromotionAmount =
                          "Vui lòng nhập giá giảm tối đa";
                        maxPromotionAmountFocusRef.current?.focus();
                        return errors;
                      } else if (values.maxPromotionAmount! < 0) {
                        errors.maxPromotionAmount =
                          "Tối đa không được nhỏ hơn 0";
                        maxPromotionAmountFocusRef.current?.focus();
                        return errors;
                      }
                    }
                  }
                  if (values.promotionType == "CATEGORIES") {
                    if (values.categoryIds?.length === 0) {
                      errors.categoryIds =
                        "Vui lòng chọn danh mục được áp dụng";
                      categoryIdsFocusRef.current?.focus();
                      return errors;
                    }
                  }
                }}
                onSubmit={async (values, { setFieldError }) => {
                  setIsSubmitLoading(true);
                  const request: AddPromotion & KeyString = {
                    ...values,
                    categoryIds: categoryIds.length == 0 ? null : categoryIds,
                    discountByPercentage: values.discountByPercentage
                      ? (values.discountByPercentage as number) / 100
                      : "",
                  };
                  Object.keys(request).map((key) => {
                    if (request[key] === "") {
                      request[key] = null;
                    }
                  });
                  let response;

                  response = await adminPromotionApi.createNewPromotion(
                    request
                  );

                  if (response?.statusCode == 400) {
                    showToast("Có lỗi xảy ra,vui lòng thử lại", "error");
                    setIsSubmitLoading(false);
                    return;
                  }
                  if (response?.statusCode == 409) {
                    showToast("Chương trình/mã giảm giá đã tồn tại", "error");
                    setFieldError(
                      "promotion",
                      "Chương trình/mã giảm giá này đã tồn tại"
                    );
                    setIsSubmitLoading(false);
                    setTimeout(() => {
                      promotionNameFocusRef.current?.focus();
                    });
                    return;
                  }
                  await handleResetPromotions(page, rowsPerPage);
                  showToast(
                    `${
                      updatePromotion ? "Cập nhật" : "Tạo"
                    } chương trình/mã giảm giá thành công`,
                    "success"
                  );
                  setOpenDialog(false);
                  setTimeout(() => {
                    setUpdatePromotion(null);
                  }, 100);
                  setIsSubmitLoading(false);
                }}
              >
                {({ values, errors, isSubmitting, dirty, setFieldValue }) => (
                  <Form className="flex flex-col mt-2">
                    <label
                      className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                      htmlFor={`promotionName`}
                    >
                      Tên chương trình/mã giảm giá
                    </label>
                    <Field
                      disabled={isSubmitLoading}
                      className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                        isSubmitLoading && "opacity-55"
                      } ${
                        errors.promotionName && "border-red-500"
                      } transition-all`}
                      type="text"
                      id={`promotionName`}
                      name={"promotionName"}
                      innerRef={promotionNameFocusRef}
                    />
                    <ErrorMessage name="promotionName" component="div">
                      {(msg) => (
                        <div
                          className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                        >
                          <ErrorIcon className="size-5" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                    <label
                      className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                      htmlFor={`bannerId`}
                    >
                      Banner quảng cáo
                    </label>
                    <Field name={"bannerId"} innerRef={bannerIdFocusRef}>
                      {({ form }: FieldProps) => (
                        <Select
                          sx={{
                            "& .MuiInputBase-input": {
                              // borderRadius: "0.375rem!important",
                              border: `1px solid ${
                                errors.bannerId ? "red" : "#6b7280"
                              }`,
                              padding: "0.375rem 0.75rem!important",
                              flex: 1,
                              fontSize: "14px",
                              lineHeight: "20px",
                              transition: "all",
                              opacity: isLoading ? 0.55 : 1,
                            },
                            mb: "0.75rem",
                          }}
                          id="bannerId"
                          value={form.values.bannerId}
                          name={"bannerId"}
                          onChange={(event) => {
                            form.setFieldValue("bannerId", event.target.value);
                          }}
                          disabled={isSubmitLoading}
                        >
                          {banners.map((banner) => (
                            <MenuItem
                              key={banner.bannerId}
                              value={banner.bannerId}
                            >
                              {banner.bannerId}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="bannerId" component="div">
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
                    <label
                      className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                      htmlFor={`startAt`}
                    >
                      Ngày bắt đầu
                    </label>
                    <Field
                      value={values.startAt}
                      disabled={isSubmitLoading}
                      className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                        isSubmitLoading && "opacity-55"
                      } ${errors.startAt && "border-red-500"} transition-all`}
                      type="date"
                      id={`startAt`}
                      name={"startAt"}
                      innerRef={startAtFocusRef}
                    />
                    <ErrorMessage name="startAt" component="div">
                      {(msg) => (
                        <div
                          className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                        >
                          <ErrorIcon className="size-5" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>

                    <label
                      className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                      htmlFor={`expireAt`}
                    >
                      Ngày hết hạn
                    </label>
                    <Field
                      value={values.expireAt}
                      disabled={isSubmitLoading}
                      className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                        isSubmitLoading && "opacity-55"
                      } ${errors.expireAt && "border-red-500"} transition-all`}
                      type="date"
                      id={`expireAt`}
                      name={"expireAt"}
                      innerRef={expireAtFocusRef}
                    />
                    <ErrorMessage name="expireAt" component="div">
                      {(msg) => (
                        <div
                          className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                        >
                          <ErrorIcon className="size-5" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>

                    <label
                      className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                      htmlFor={`promotionType`}
                    >
                      Loại khuyến mãi
                    </label>
                    <Field
                      name={"promotionType"}
                      innerRef={promotionTypeFocusRef}
                    >
                      {({ form }: FieldProps) => (
                        <Select
                          sx={{
                            "& .MuiInputBase-input": {
                              // borderRadius: "0.375rem!important",
                              border: `1px solid ${
                                errors.promotionType ? "red" : "#6b7280"
                              }`,
                              padding: "0.375rem 0.75rem!important",
                              flex: 1,
                              fontSize: "14px",
                              lineHeight: "20px",
                              transition: "all",
                              opacity: isLoading ? 0.55 : 1,
                            },
                            mb: "0.75rem",
                          }}
                          id="promotionType"
                          value={form.values.promotionType}
                          name={"promotionType"}
                          onChange={(event) => {
                            setFieldValue("discountByPercentage", "");
                            setFieldValue("discountByAmount", "");
                            setFieldValue("minOrderAmount", "");
                            setFieldValue("maxPromotionAmount", "");
                            form.setFieldValue(
                              "promotionType",
                              event.target.value
                            );
                          }}
                          disabled={isSubmitLoading}
                        >
                          {[
                            "CATEGORIES",
                            "VOUCHER_PERCENT",
                            "VOUCHER_AMOUNT",
                          ].map((type: any) => (
                            <MenuItem key={type} value={type}>
                              {castPromotion(type)}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="promotionType" component="div">
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

                    {values.promotionType !== "VOUCHER_AMOUNT" &&
                      values.promotionType !== "" && (
                        <>
                          <label
                            className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                            htmlFor={`discountByPercentage`}
                          >
                            Phần trăm giảm giá
                          </label>
                          <Field
                            disabled={isSubmitLoading}
                            className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                              isSubmitLoading && "opacity-55"
                            } ${
                              errors.discountByPercentage && "border-red-500"
                            } transition-all`}
                            type="number"
                            id={`discountByPercentage`}
                            name={"discountByPercentage"}
                            innerRef={discountByPercentageFocusRef}
                          />
                          <ErrorMessage
                            name="discountByPercentage"
                            component="div"
                          >
                            {(msg) => (
                              <div
                                className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                              >
                                <ErrorIcon className="size-5" />
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </>
                      )}
                    {values.promotionType == "VOUCHER_AMOUNT" && (
                      <>
                        <label
                          className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                          htmlFor={`discountByAmount`}
                        >
                          Số tiền giảm
                        </label>
                        <Field
                          disabled={isSubmitLoading}
                          className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                            isSubmitLoading && "opacity-55"
                          } ${
                            errors.discountByAmount && "border-red-500"
                          } transition-all`}
                          type="number"
                          id={`discountByAmount`}
                          name={"discountByAmount"}
                          innerRef={discountByAmountFocusRef}
                        />
                        <ErrorMessage name="discountByAmount" component="div">
                          {(msg) => (
                            <div
                              className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                            >
                              <ErrorIcon className="size-5" />
                              {msg}
                            </div>
                          )}
                        </ErrorMessage>
                      </>
                    )}
                    {values.promotionType == "CATEGORIES" && (
                      <>
                        <label
                          className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                          htmlFor={`categoryIds`}
                        >
                          Danh mục áp dụng
                        </label>
                        <Field
                          className={`${
                            errors.categoryIds && "border-red-500"
                          }`}
                          name={"categoryIds"}
                          innerRef={categoryIdsFocusRef}
                        >
                          {({ form }: FieldProps) => (
                            <Select
                              disabled={isSubmitLoading}
                              sx={{
                                "& .MuiInputBase-input": {
                                  // borderRadius: "0.375rem!important",
                                  border: `1px solid ${
                                    errors.categoryIds ? "red" : "#6b7280"
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
                              id={`categoryIds`}
                              multiple
                              name={"categoryIds"}
                              value={form.values.categoryIds}
                              onChange={(
                                event: SelectChangeEvent<
                                  typeof form.values.categoryIds
                                >
                              ) => {
                                const {
                                  target: { value },
                                } = event;

                                let ids: number[] = [];
                                if (typeof value === "string") {
                                  const category = categories.find(
                                    (category) => category.name === value
                                  );
                                  if (category) {
                                    ids.push(category.categoryId);
                                  }
                                } else {
                                  ids = value
                                    .map((val: string) => {
                                      const category = categories.find(
                                        (category) => category.name === val
                                      );
                                      return category
                                        ? category.categoryId
                                        : "";
                                    })
                                    .filter(Boolean); // Loại bỏ các giá trị rỗng
                                }
                                form.setFieldValue(
                                  "categoryIds",
                                  // On autofill we get a stringified value.
                                  typeof value === "string"
                                    ? value.split(",")
                                    : value
                                );
                                setCategoryIds(ids);
                              }}
                              // input={<OutlinedInput label={"Thương hiệu"} />}
                              renderValue={(selected: string[]) =>
                                selected.join(", ")
                              }
                              MenuProps={MenuProps}
                            >
                              {categories.map((category) => (
                                <MenuItem
                                  key={category.categoryId}
                                  value={category.name}
                                >
                                  <Checkbox
                                    checked={
                                      form.values.categoryIds.indexOf(
                                        category.name
                                      ) > -1
                                    }
                                  />
                                  <ListItemText primary={category.name} />
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </Field>
                        <ErrorMessage name="categoryIds" component="div">
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
                      </>
                    )}
                    {values.promotionType !== "CATEGORIES" &&
                      values.promotionType !== "" && (
                        <>
                          <label
                            className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                            htmlFor={`discountByPercentage`}
                          >
                            Đơn hàng tối thiểu
                          </label>
                          <Field
                            disabled={isSubmitLoading}
                            className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                              isSubmitLoading && "opacity-55"
                            } ${
                              errors.minOrderAmount && "border-red-500"
                            } transition-all`}
                            type="number"
                            id={`minOrderAmount`}
                            name={"minOrderAmount"}
                            innerRef={minOrderAmountFocusRef}
                          />
                          <ErrorMessage name="minOrderAmount" component="div">
                            {(msg) => (
                              <div className="flex gap-x-2 text-sm text-red-500 animate-appear">
                                <ErrorIcon className="size-5" />
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                          {values.promotionType == "VOUCHER_PERCENT" && (
                            <>
                              <label
                                className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                                htmlFor={`discountByPercentage`}
                              >
                                Số tiền giảm tối đa
                              </label>
                              <Field
                                disabled={isSubmitLoading}
                                className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                                  isSubmitLoading && "opacity-55"
                                } ${
                                  errors.maxPromotionAmount && "border-red-500"
                                } transition-all`}
                                type="number"
                                id={`maxPromotionAmount`}
                                name={"maxPromotionAmount"}
                                innerRef={maxPromotionAmountFocusRef}
                              />
                              <ErrorMessage
                                name="maxPromotionAmount"
                                component="div"
                              >
                                {(msg) => (
                                  <div className="flex gap-x-2 text-sm text-red-500 animate-appear">
                                    <ErrorIcon className="size-5" />
                                    {msg}
                                  </div>
                                )}
                              </ErrorMessage>
                            </>
                          )}
                        </>
                      )}

                    <div className="flex gap-x-2 justify-end w-full mt-4">
                      <button
                        type="button"
                        disabled={isSubmitLoading}
                        className={`mt-2 px-4 py-1 rounded-md w-[7rem]
            bg-primary-color text-white self-end mr-3 ${
              isSubmitLoading ? "opacity-55" : "hover:opacity-70"
            }
            }`}
                        onClick={() => {
                          setTimeout(() => {
                            setOpenDialog(false);
                            setCategoryIds([]);
                          }, 100);
                        }}
                      >
                        Hủy
                      </button>
                      <LoadingButton
                        disabled={!dirty || isSubmitLoading}
                        size="small"
                        type="submit"
                        loading={isSubmitting}
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
                      >
                        <span
                          className={`text-white  ${
                            isSubmitLoading && "!text-primary-color"
                          }`}
                        >
                          {updatePromotion ? "Cập nhật" : "Tạo mới"}
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
          updatePromotion ? (
            <>
              <button
                type="button"
                className="mt-2 px-4 py-1 rounded-md w-24
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3"
                onClick={() => {
                  setOpenDialog(false);
                  setTimeout(() => {
                    setUpdatePromotion(null);
                    setCategoryIds([]);
                  }, 300);
                }}
              >
                Hủy
              </button>
              <LoadingButton
                onClick={handleApplyPromotion}
                disabled={isUpdateLoading}
                size="small"
                type="button"
                loading={isUpdateLoading}
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
                  color: isUpdateLoading ? "#1a4845!important" : "white",
                  width: "7rem",
                  backgroundColor: "#1a4845",
                  fontSize: "15px",
                  fontWeight: "300",
                  alignSelf: "end",
                  transition: "all",
                  opacity: isUpdateLoading ? 0.55 : 1,
                  "&:hover": {
                    bgcolor: "#1a4845!important",
                    opacity: isUpdateLoading ? 1 : 0.7,
                    color: "#white!important",
                  },
                }}
              >
                <span
                  className={`text-white  ${
                    isUpdateLoading && "!text-primary-color"
                  }`}
                >
                  Đồng ý
                </span>
              </LoadingButton>
            </>
          ) : undefined
        }
      />
      <Popup
        isLargeActivePopup={true}
        open={openUpdateDialog}
        onClose={() => {
          setOpenUpdateDialog(false);
          setTimeout(() => {
            setUpdatePromotion(null);
            setCategoryIds([]);
          }, 300);
        }}
        title={"Cập nhật chương trình/mã giảm giá"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<UpdatePromotion & KeyString>
              initialValues={{
                promotionName: updatePromotion?.promotionName,
                promotionType: updatePromotion?.promotionType,
                startAt: dayjs(updatePromotion?.startAt ?? null).format(
                  "YYYY-MM-DD"
                ),
                expireAt: dayjs(updatePromotion?.expireAt ?? null).format(
                  "YYYY-MM-DD"
                ),
                categoryIds: (updatePromotion?.categoryNames as any[]) || [],
                bannerId: updatePromotion?.bannerId || "",
                discountByPercentage: Math.round(
                  (updatePromotion?.discountByPercentage || 0) * 100
                ),
                discountByAmount: updatePromotion?.discountByAmount,
                minOrderAmount: updatePromotion?.minOrderAmount,
                maxPromotionAmount: updatePromotion?.maxPromotionAmount,
                // Add other missing properties here
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors = {
                  promotionName: "",
                  promotionType: "",
                  startAt: "",
                  expireAt: "",
                  categoryIds: "",
                  bannerId: "",
                  discountByPercentage: "",
                  discountByAmount: "",
                  minOrderAmount: "",
                  maxPromotionAmount: "",
                };
                if (
                  !values.promotionName ||
                  values.promotionName.length === 0
                ) {
                  errors.promotionName =
                    "Vui lòng nhập tên chương trình/mã giảm giá";
                  promotionNameFocusRef.current?.focus();
                  return errors;
                }
                // if (!values.bannerId || values.bannerId === -1) {
                //   errors.bannerId = "Vui lòng chọn banner quảng cáo";
                //   bannerIdFocusRef.current?.focus();
                //   return errors;
                // }
                if (
                  !values.startAt ||
                  (values.startAt as string).length === 0
                ) {
                  errors.startAt = "Vui lòng nhập ngày bắt đầu";
                  startAtFocusRef.current?.focus();
                  return errors;
                }

                if (
                  !values.expireAt ||
                  (values.expireAt as string).length === 0
                ) {
                  errors.expireAt = "Vui lòng nhập ngày hết hạn";
                  expireAtFocusRef.current?.focus();
                  return errors;
                }

                const startAt = new Date(values.startAt as string);
                const expireAt = new Date(values.expireAt as string);
                if (expireAt <= startAt) {
                  errors.expireAt = "Ngày hết hạn phải sau ngày bắt đầu";
                  expireAtFocusRef.current?.focus();
                  return errors;
                }

                if (
                  !values.promotionType ||
                  values.promotionType.length === 0
                ) {
                  errors.promotionType = "Vui lòng chọn loại khuyến mãi";
                  promotionTypeFocusRef.current?.focus();
                  return errors;
                }

                if (values.promotionType == "VOUCHER_PERCENT") {
                  if (values.discountByPercentage === "") {
                    errors.discountByPercentage =
                      "Vui lòng nhập phần trăm giảm";
                    discountByPercentageFocusRef.current?.focus();
                    return errors;
                  } else if (
                    values.discountByPercentage! <= 0 ||
                    values.discountByPercentage! >= 100
                  ) {
                    errors.discountByPercentage =
                      "Phần trăm phải từ 0% đến nhỏ hơn 100%";
                    discountByPercentageFocusRef.current?.focus();
                    return errors;
                  }
                }

                if (values.promotionType == "VOUCHER_AMOUNT") {
                  if (values.discountByAmount === "") {
                    errors.discountByAmount = "Vui lòng nhập số tiền giảm";
                    discountByAmountFocusRef.current?.focus();
                    return errors;
                  } else if (values.discountByAmount! <= 0) {
                    errors.discountByAmount = "Số tiền giảm phải lớn hơn 0";
                    discountByAmountFocusRef.current?.focus();
                    return errors;
                  }
                }

                if (values.promotionType !== "CATEGORIES") {
                  if (values.minOrderAmount == "") {
                    errors.minOrderAmount = "Vui lòng nhập giá tối thiểu";
                    minOrderAmountFocusRef.current?.focus();
                    return errors;
                  } else if (values.minOrderAmount! < 0) {
                    errors.minOrderAmount = "Tối thiểu không được nhỏ hơn 0";
                    minOrderAmountFocusRef.current?.focus();
                    return errors;
                  }
                  if (values.promotionType == "VOUCHER_PERCENT") {
                    if (
                      !values.maxPromotionAmount ||
                      (values.maxPromotionAmount as any) == ""
                    ) {
                      errors.maxPromotionAmount =
                        "Vui lòng nhập giá giảm tối đa";
                      maxPromotionAmountFocusRef.current?.focus();
                      return errors;
                    } else if (values.maxPromotionAmount! < 0) {
                      errors.maxPromotionAmount = "Tối đa không được nhỏ hơn 0";
                      maxPromotionAmountFocusRef.current?.focus();
                      return errors;
                    }
                  }
                }
                if (values.promotionType == "CATEGORIES") {
                  if (values.categoryIds?.length === 0) {
                    errors.categoryIds = "Vui lòng chọn danh mục được áp dụng";
                    categoryIdsFocusRef.current?.focus();
                    return errors;
                  }
                }
              }}
              onSubmit={async (values, { setFieldError }) => {
                setIsUpdatePromotionLoading(true);
                const request: UpdatePromotion & KeyString = {
                  ...values,
                  categoryIds:
                    categoryIds.length == 0
                      ? categories
                          .filter((cate) =>
                            updatePromotion?.categoryNames.includes(cate.name)
                          )
                          .map((cate) => cate.categoryId)
                      : categoryIds,
                  discountByPercentage: values.discountByPercentage
                    ? (values.discountByPercentage as number) / 100
                    : "",
                };
                console.log(request.categoryIds);
                Object.keys(request).map((key) => {
                  if (request[key] === "") {
                    request[key] = null;
                  }
                });
                // if (request["categoryIds"] == null) {
                //   delete request["categoryIds"];
                // }
                let response;

                response = await adminPromotionApi.updatePromotion(
                  request,
                  updatePromotion?.promotionId!
                );
                if (
                  response?.message == "Promotion doesn't exist or is disabled"
                ) {
                  showToast("Chương trình này đã bị vô hiệu", "error");
                  setIsUpdatePromotionLoading(false);
                  return;
                }
                if (response?.statusCode == 400) {
                  showToast(
                    "Chương trình này đang được kích hoạt, không thể cập nhật",
                    "error"
                  );
                  setIsUpdatePromotionLoading(false);
                  return;
                }
                if (response?.statusCode == 409) {
                  showToast("Chương trình/mã giảm giá đã tồn tại", "error");
                  setFieldError(
                    "promotion",
                    "Chương trình/mã giảm giá này đã tồn tại"
                  );
                  setIsUpdatePromotionLoading(false);
                  setTimeout(() => {
                    promotionNameFocusRef.current?.focus();
                  });
                  return;
                }
                await handleResetPromotions(page, rowsPerPage);
                showToast(
                  `Cập nhật chương trình/mã giảm giá thành công`,
                  "success"
                );
                setOpenUpdateDialog(false);
                setTimeout(() => {
                  setUpdatePromotion(null);
                }, 100);
                setIsUpdatePromotionLoading(false);
              }}
            >
              {({ values, errors, isSubmitting, dirty, setFieldValue }) => (
                <Form className="flex flex-col mt-2">
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                    htmlFor={`promotionName`}
                  >
                    Tên chương trình/mã giảm giá
                  </label>
                  <Field
                    disabled={isSubmitLoading}
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                      isSubmitLoading && "opacity-55"
                    } ${
                      errors.promotionName && "border-red-500"
                    } transition-all`}
                    type="text"
                    id={`promotionName`}
                    name={"promotionName"}
                    innerRef={promotionNameFocusRef}
                  />
                  <ErrorMessage name="promotionName" component="div">
                    {(msg) => (
                      <div
                        className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                    htmlFor={`bannerId`}
                  >
                    Banner quảng cáo
                  </label>
                  <Field name={"bannerId"} innerRef={bannerIdFocusRef}>
                    {({ form }: FieldProps) => (
                      <Select
                        sx={{
                          "& .MuiInputBase-input": {
                            // borderRadius: "0.375rem!important",
                            border: `1px solid ${
                              errors.bannerId ? "red" : "#6b7280"
                            }`,
                            padding: "0.375rem 0.75rem!important",
                            flex: 1,
                            fontSize: "14px",
                            lineHeight: "20px",
                            transition: "all",
                            opacity: isLoading ? 0.55 : 1,
                          },
                          mb: "0.75rem",
                        }}
                        id="bannerId"
                        value={form.values.bannerId}
                        name={"bannerId"}
                        onChange={(event) => {
                          form.setFieldValue("bannerId", event.target.value);
                        }}
                        disabled={isSubmitLoading}
                      >
                        {banners.map((banner) => (
                          <MenuItem
                            key={banner.bannerId}
                            value={banner.bannerId}
                          >
                            {banner.bannerId}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="bannerId" component="div">
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
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                    htmlFor={`startAt`}
                  >
                    Ngày bắt đầu
                  </label>
                  <Field
                    value={values.startAt}
                    disabled={isUpdatePromotionLoading}
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                      isUpdatePromotionLoading && "opacity-55"
                    } ${errors.startAt && "border-red-500"} transition-all`}
                    type="date"
                    id={`startAt`}
                    name={"startAt"}
                    innerRef={startAtFocusRef}
                  />
                  <ErrorMessage name="startAt" component="div">
                    {(msg) => (
                      <div
                        className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>

                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                    htmlFor={`expireAt`}
                  >
                    Ngày hết hạn
                  </label>
                  <Field
                    value={values.expireAt}
                    disabled={isUpdatePromotionLoading}
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                      isUpdatePromotionLoading && "opacity-55"
                    } ${errors.expireAt && "border-red-500"} transition-all`}
                    type="date"
                    id={`expireAt`}
                    name={"expireAt"}
                    innerRef={expireAtFocusRef}
                  />
                  <ErrorMessage name="expireAt" component="div">
                    {(msg) => (
                      <div
                        className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>

                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                    htmlFor={`promotionType`}
                  >
                    Loại khuyến mãi
                  </label>
                  <Field
                    name={"promotionType"}
                    innerRef={promotionTypeFocusRef}
                  >
                    {({ form }: FieldProps) => (
                      <Select
                        sx={{
                          "& .MuiInputBase-input": {
                            // borderRadius: "0.375rem!important",
                            border: `1px solid ${
                              errors.promotionType ? "red" : "#6b7280"
                            }`,
                            padding: "0.375rem 0.75rem!important",
                            flex: 1,
                            fontSize: "14px",
                            lineHeight: "20px",
                            transition: "all",
                            opacity: isLoading ? 0.55 : 1,
                          },
                          mb: "0.75rem",
                        }}
                        id="promotionType"
                        value={form.values.promotionType}
                        name={"promotionType"}
                        onChange={(event) => {
                          setFieldValue("discountByPercentage", "");
                          setFieldValue("discountByAmount", "");
                          setFieldValue("minOrderAmount", "");
                          setFieldValue("maxPromotionAmount", "");
                          form.setFieldValue(
                            "promotionType",
                            event.target.value
                          );
                        }}
                        disabled={isUpdatePromotionLoading}
                      >
                        {[
                          "CATEGORIES",
                          "VOUCHER_PERCENT",
                          "VOUCHER_AMOUNT",
                        ].map((type: any) => (
                          <MenuItem key={type} value={type}>
                            {castPromotion(type)}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="promotionType" component="div">
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

                  {values.promotionType !== "VOUCHER_AMOUNT" && (
                    <>
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                        htmlFor={`discountByPercentage`}
                      >
                        Phần trăm giảm giá
                      </label>
                      <Field
                        disabled={isUpdatePromotionLoading}
                        className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                          isUpdatePromotionLoading && "opacity-55"
                        } ${
                          errors.discountByPercentage && "border-red-500"
                        } transition-all`}
                        type="number"
                        id={`discountByPercentage`}
                        name={"discountByPercentage"}
                        innerRef={discountByPercentageFocusRef}
                      />
                      <ErrorMessage name="discountByPercentage" component="div">
                        {(msg) => (
                          <div
                            className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                          >
                            <ErrorIcon className="size-5" />
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                    </>
                  )}
                  {values.promotionType == "VOUCHER_AMOUNT" && (
                    <>
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                        htmlFor={`discountByAmount`}
                      >
                        Số tiền giảm
                      </label>
                      <Field
                        disabled={isUpdatePromotionLoading}
                        className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                          isUpdatePromotionLoading && "opacity-55"
                        } ${
                          errors.discountByAmount && "border-red-500"
                        } transition-all`}
                        type="number"
                        id={`discountByAmount`}
                        name={"discountByAmount"}
                        innerRef={discountByAmountFocusRef}
                      />
                      <ErrorMessage name="discountByAmount" component="div">
                        {(msg) => (
                          <div
                            className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                          >
                            <ErrorIcon className="size-5" />
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                    </>
                  )}
                  {values.promotionType == "CATEGORIES" && (
                    <>
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                        htmlFor={`categoryIds`}
                      >
                        Danh mục áp dụng
                      </label>
                      <Field
                        className={`${errors.categoryIds && "border-red-500"}`}
                        name={"categoryIds"}
                        innerRef={categoryIdsFocusRef}
                      >
                        {({ form }: FieldProps) => (
                          <Select
                            disabled={isUpdatePromotionLoading}
                            sx={{
                              "& .MuiInputBase-input": {
                                // borderRadius: "0.375rem!important",
                                border: `1px solid ${
                                  errors.categoryIds ? "red" : "#6b7280"
                                }`,
                                padding: "0.375rem 0.75rem!important",
                                flex: 1,
                                fontSize: "14px",
                                lineHeight: "20px",
                                transition: "all",
                                opacity: isUpdatePromotionLoading ? 0.55 : 1,
                              },
                              mb: "0.75rem",
                            }}
                            id={`categoryIds`}
                            multiple
                            name={"categoryIds"}
                            value={form.values.categoryIds}
                            onChange={(
                              event: SelectChangeEvent<
                                typeof form.values.categoryIds
                              >
                            ) => {
                              const {
                                target: { value },
                              } = event;

                              let ids: number[] = [];
                              if (typeof value === "string") {
                                const category = categories.find(
                                  (category) => category.name === value
                                );
                                if (category) {
                                  ids.push(category.categoryId);
                                }
                              } else {
                                ids = value
                                  .map((val: string) => {
                                    const category = categories.find(
                                      (category) => category.name === val
                                    );
                                    return category ? category.categoryId : "";
                                  })
                                  .filter(Boolean); // Loại bỏ các giá trị rỗng
                              }
                              form.setFieldValue(
                                "categoryIds",
                                // On autofill we get a stringified value.
                                typeof value === "string"
                                  ? value.split(",")
                                  : value
                              );
                              setCategoryIds(ids);
                            }}
                            // input={<OutlinedInput label={"Thương hiệu"} />}
                            renderValue={(selected: string[]) =>
                              selected.join(", ")
                            }
                            MenuProps={MenuProps}
                          >
                            {categories.map((category) => (
                              <MenuItem
                                key={category.categoryId}
                                value={category.name}
                              >
                                <Checkbox
                                  checked={
                                    form.values.categoryIds.indexOf(
                                      category.name
                                    ) > -1
                                  }
                                />
                                <ListItemText primary={category.name} />
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage name="categoryIds" component="div">
                        {(msg) => (
                          <div className="mt-1 flex gap-x-2 text-sm text-red-500 animate-appear">
                            <ErrorIcon className="size-5" />
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                    </>
                  )}
                  {values.promotionType !== "CATEGORIES" && (
                    <>
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                        htmlFor={`discountByPercentage`}
                      >
                        Đơn hàng tối thiểu
                      </label>
                      <Field
                        disabled={isUpdatePromotionLoading}
                        className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                          isUpdatePromotionLoading && "opacity-55"
                        } ${
                          errors.minOrderAmount && "border-red-500"
                        } transition-all`}
                        type="number"
                        id={`minOrderAmount`}
                        name={"minOrderAmount"}
                        innerRef={minOrderAmountFocusRef}
                      />
                      <ErrorMessage name="minOrderAmount" component="div">
                        {(msg) => (
                          <div
                            className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                          >
                            <ErrorIcon className="size-5" />
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                      {values.promotionType == "VOUCHER_PERCENT" && (
                        <>
                          <label
                            className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                            htmlFor={`discountByPercentage`}
                          >
                            Số tiền giảm tối đa
                          </label>
                          <Field
                            disabled={isUpdatePromotionLoading}
                            className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                              isUpdatePromotionLoading && "opacity-55"
                            } ${
                              errors.maxPromotionAmount && "border-red-500"
                            } transition-all`}
                            type="number"
                            id={`maxPromotionAmount`}
                            name={"maxPromotionAmount"}
                            innerRef={maxPromotionAmountFocusRef}
                          />
                          <ErrorMessage
                            name="maxPromotionAmount"
                            component="div"
                          >
                            {(msg) => (
                              <div className="flex gap-x-2 text-sm text-red-500 animate-appear">
                                <ErrorIcon className="size-5" />
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </>
                      )}
                    </>
                  )}

                  <div className="flex gap-x-2 justify-end w-full mt-4">
                    <button
                      type="button"
                      disabled={isUpdatePromotionLoading}
                      className={`mt-2 px-4 py-1 rounded-md w-[7rem] bg-primary-color text-white self-end mr-3 hover:opacity-55`}
                      onClick={() => {
                        setOpenUpdateDialog(false);
                        setTimeout(() => {
                          setUpdatePromotion(null);
                          setCategoryIds([]);
                        }, 100);
                      }}
                    >
                      Hủy
                    </button>
                    <LoadingButton
                      disabled={!dirty || isUpdatePromotionLoading}
                      size="small"
                      type="submit"
                      loading={isSubmitting}
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
                          !dirty || isUpdatePromotionLoading
                            ? "#1a4845!important"
                            : "white",
                        width: "7rem",
                        backgroundColor: "#1a4845",
                        fontSize: "15px",
                        fontWeight: "300",
                        alignSelf: "end",
                        transition: "all",
                        opacity: !dirty || isUpdatePromotionLoading ? 0.55 : 1,
                        "&:hover": {
                          bgcolor: "#1a4845!important",
                          opacity: !dirty || isUpdatePromotionLoading ? 1 : 0.7,
                          color: "#white!important",
                        },
                      }}
                    >
                      <span
                        className={`text-white  ${
                          isUpdatePromotionLoading && "!text-primary-color"
                        }`}
                      >
                        Cập nhật
                      </span>
                    </LoadingButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        }
        actions={undefined}
      />
    </Container>
  );
}
