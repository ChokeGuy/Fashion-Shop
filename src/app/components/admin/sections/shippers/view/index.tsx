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
import ShipperTableRow from "../shipper-table-row";
import ShipperTableHead from "../shipper-table-head";
import ShipperTableToolbar from "../shipper-table-toolbar";
import { applyFilter } from "../filter";
import { RegisterRequest, User } from "@/src/models";
import { adminUserApi } from "@/src/app/apis/admin/userApi";
import { getComparator, emptyRows } from "@/src/utilities/visual";
import TableEmptyRows from "../../table-empty-rows";
import TableNoData from "../../table-no-data";
// import AdminLoading from "../../../admin-loading";
import CircleLoading from "@/src/app/components/Loading";
import Button from "@mui/material/Button";
import Iconify from "../../../iconify";
import Popup from "@/src/app/components/Popup";
// import loading from "@/src/app/(productpage)/category/loading";
// import { accountApi } from "@/src/app/apis/accountApi";
// import Counter from "@/src/app/components/Counter";
import ShowHidePassword from "@/src/app/components/guest/ShowHidePassword";
import { showToast } from "@/src/lib/toastify";
import { LoadingButton } from "@mui/lab";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import ErrorIcon from "@mui/icons-material/Error";

import router from "next/router";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { PROVINCES } from "@/src/constants/provine";
import { debounce } from "@mui/material";

// ----------------------------------------------------------------------

export default function ShipperView() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shippers, setShippers] = useState<User[]>([]);
  const [totalShippers, setTotalShippers] = useState(0);

  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("fullname");

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateShipper, setActivateShipper] = useState<User | null>(null);

  const [updateShipper, setUpdateShipper] = useState<User | null>(null);

  const emailFocusRef = useRef<HTMLInputElement | null>(null);
  const passwordFocusRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordFocusRef = useRef<HTMLInputElement | null>(null);
  const fullnameFocusRef = useRef<HTMLInputElement | null>(null);
  const phoneFocusRef = useRef<HTMLInputElement | null>(null);
  const addressFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fullnameFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    const getAllShippers = async () => {
      setIsLoading(true);
      const response = await adminUserApi.getAllShipperAccounts();

      setShippers(response?.result.content || []);
      setTotalShippers(response?.result.totalElements || 0);
      setIsLoading(false);
    };
    getAllShippers();
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
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
      const newSelecteds = shippers.map((n) => n.fullname);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const handleResetShippers = async (page: number, rowsPerPage: number) => {
    const result = await adminUserApi.getAllShipperAccounts(
      {
        page: page,
        size: rowsPerPage,
      },
      filterName
    );
    const result2 = await adminUserApi.getShipperAccountsByAddress(filterName);

    const mixResult = result?.result.content.concat(result2?.result.userList!);
    const mixElements =
      result?.result.totalElements! + (result2?.result as any).totalElement!;
    if (result?.statusCode != 200) {
      setShippers([]);
      setTotalShippers(0);
      return;
    }
    if (result2?.statusCode != 200) {
      setShippers([]);
      setTotalShippers(0);
      return;
    }
    setShippers(mixResult || []);
    setTotalShippers(mixElements || 0);
  };

  const handleChangeUserActive = async () => {
    setActivateLoading(true);
    const response = await adminUserApi.changeUserActivation(
      activateShipper?.userId!
    );
    if (!response?.success) {
      showToast("Thay đổi trạng thái tài khoản thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetShippers(page, rowsPerPage);
    showToast(
      "Thay đổi trạng thái tài khoản thành công",
      "success",
      "top-right"
    );
    setActivateLoading(false);
    setTimeout(() => {
      setActivateShipper(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetShippers(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetShippers(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleSearch = useCallback(
    debounce(async (searchData: string) => {
      const result = await adminUserApi.getAllShipperAccounts(
        {
          page: 0,
          size: rowsPerPage,
        },
        searchData
      );
      const result2 = await adminUserApi.getShipperAccountsByAddress(
        searchData
      );

      const mixResult = result?.result.content.concat(
        result2?.result.userList!
      );
      const mixElements =
        result?.result.totalElements! + (result2?.result as any).totalElement!;
      if (result?.statusCode != 200) {
        setShippers([]);
        setTotalShippers(0);
        return;
      }
      if (result2?.statusCode != 200) {
        setShippers([]);
        setTotalShippers(0);
        return;
      }
      setShippers(mixResult || []);
      setTotalShippers(mixElements || 0);
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
    inputData: shippers,
    comparator: getComparator(order, orderBy),
    filterName,
  });

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
        <Typography variant="h4">Tài khoản người giao hàng</Typography>

        <Button
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Người giao hàng mới
        </Button>
      </Stack>

      <Card>
        <ShipperTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <ShipperTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "userId", label: "Mã người vận chuyển" },
                  { id: "fullname", label: "Họ và tên" },
                  { id: "phone", label: "Điện thoại" },
                  { id: "email", label: "Email" },
                  { id: "addresses", label: "Địa chỉ" },
                  // { id: "role", label: "Role" },
                  // { id: "isVerified", label: "Xác thực", align: "center" },
                  { id: "status", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered.map((row: User, index) => (
                  <ShipperTableRow
                    userId={rowsPerPage * page + index + 1}
                    key={row.userId}
                    user={row}
                    setActivateDialog={setActivateDialog}
                    setActivateShipper={setActivateShipper}
                    setOpenDialog={setOpenDialog}
                    setUpdateShipper={setUpdateShipper}
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
          count={totalShippers}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      <Popup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={
          updateShipper
            ? "Chỉnh sửa người giao hàng"
            : "Thêm người giao hàng mới"
        }
        content={
          <Formik<Omit<RegisterRequest, "otp"> & { defaultAddress: string }>
            initialValues={{
              fullname: updateShipper?.fullname ?? "",
              phone: updateShipper?.phone ?? "",
              email: updateShipper?.email ?? "",
              // otp: "",
              defaultAddress: updateShipper?.addresses[0].detail ?? "",
              password: "",
              confirmPassword: "",
            }}
            validateOnChange={false}
            validateOnBlur={false}
            validate={(values) => {
              const errors: {
                fullname?: string;
                phone?: string;
                email?: string;
                // otp?: string;
                defaultAddress?: string;
                password?: string;
                confirmPassword?: string;
              } = {}; // Add type annotation for errors object
              if (!values.fullname) {
                errors.fullname = "Vui lòng nhập họ và tên";
                fullnameFocusRef.current?.focus();
                return errors;
              }
              if (!values.phone) {
                errors.phone = "Vui lòng nhập số điện thoại";
                phoneFocusRef.current?.focus();
                return errors;
              } else if (!/^(0)\d{9}$/i.test(values.phone)) {
                errors.phone = "Số điện thoại không hợp lệ";
                phoneFocusRef.current?.focus();
                return errors;
              }
              if (!values.email || values.email.length == 0) {
                errors.email = "Vui lòng nhập email";
                emailFocusRef.current?.focus();
                return errors;
              } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
              ) {
                errors.email = "Email không hợp lệ";
                emailFocusRef.current?.focus();
                return errors;
              }

              if (!values.defaultAddress) {
                errors.defaultAddress = "Vui lòng chọn tỉnh thành";
                addressFocusRef.current?.focus();
                return errors;
              }

              // if (values.otp.length == 0) {
              //   errors.otp = "Vui lòng gửi mã xác thực";
              //   otpFocusRef.current?.focus();
              //   return errors;
              // } else if (values.otp.length < 6) {
              //   errors.otp = "Mã xác thực không hợp lệ";
              //   otpFocusRef.current?.focus();
              //   return errors;
              // }

              if (updateShipper != null) {
                return;
              }

              if (!values.password) {
                errors.password = "Vui lòng nhập mật khẩu";
                passwordFocusRef.current?.focus();
                return errors;
              } else {
                if (values.password.length < 8) {
                  errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
                  passwordFocusRef.current?.focus();
                  return errors;
                }
                if (!/[a-z]/.test(values.password)) {
                  errors.password = "Mật khẩu phải chứa ít nhất 1 ký tự thường";
                  passwordFocusRef.current?.focus();
                  return errors;
                }
                if (!/[A-Z]/.test(values.password)) {
                  errors.password = "Mật khẩu phải chứa ít nhất 1 ký tự hoa";
                  passwordFocusRef.current?.focus();
                  return errors;
                }
                if (!/\d/.test(values.password)) {
                  errors.password = "Mật khẩu phải chứa ít nhất 1 chữ số";
                  passwordFocusRef.current?.focus();
                  return errors;
                }
                if (!/[@$!%*?&]/.test(values.password)) {
                  errors.password =
                    "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
                  passwordFocusRef.current?.focus();
                  return errors;
                }
              }
              if (!values.confirmPassword) {
                errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
                confirmPasswordFocusRef.current?.focus();
                return errors;
              } else if (values.confirmPassword !== values.password) {
                errors.confirmPassword = "Mật khẩu không khớp";
                confirmPasswordFocusRef.current?.focus();
                return errors;
              }
            }}
            onSubmit={async (values, { setFieldError }) => {
              setSubmitLoading(true);
              let request;

              if (updateShipper) {
                const shipperInfo = {
                  fullname: values.fullname,
                  phone: values.phone,
                  email: values.email,
                  defaultAddress: values.defaultAddress,
                };
                request = await adminUserApi.updateUserInfo(
                  updateShipper.userId,
                  shipperInfo
                );
              } else request = await adminUserApi.createShipperAccount(values);

              if (request?.message == "Email already in use") {
                setSubmitLoading(false);
                setFieldError("email", "Email này đã tồn tại");
                return;
              } else if (request?.message == "Phone number already in use") {
                setSubmitLoading(false);
                setFieldError("phone", "Số điện thoại này đã tồn tại");
                return;
              } else if (request?.message == "Invalid OTP or expired.") {
                setSubmitLoading(false);
                setFieldError(
                  "otp",
                  "Mã xác thực không hợp lệ hoặc đã hết hạn"
                );
                return;
              }
              await handleResetShippers(page, rowsPerPage);
              showToast(
                updateShipper ? "Cập nhật thành công" : "Tạo thành công",
                "success",
                "bottom-right"
              );
              setOpenDialog(false);
              if (updateShipper) {
                setTimeout(() => {
                  setUpdateShipper(null);
                }, 100);
              }

              setSubmitLoading(false);
            }}
          >
            {({ values, errors, dirty }) => (
              <Form className="w-full flex flex-col ">
                {/* fullname Field */}
                <label
                  className="py-1 px-0.5 text-sm font-semibold"
                  htmlFor="fullname"
                >
                  Họ và Tên
                </label>
                <Field
                  disabled={submitLoading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                    submitLoading && "opacity-55"
                  } ${errors.fullname && "border-red-500"} transition-all`}
                  type="text"
                  name="fullname"
                  placeholder="Họ và tên"
                  innerRef={fullnameFocusRef}
                />
                <ErrorMessage className="mb-3" name="fullname" component="div">
                  {(msg) => (
                    <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                      <div
                        className="flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                  "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    </div>
                  )}
                </ErrorMessage>

                {/* phone Field */}
                <label
                  className="py-1 px-0.5 text-sm font-semibold"
                  htmlFor="phone"
                >
                  Số điện thoại
                </label>
                <Field
                  disabled={submitLoading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                    submitLoading && "opacity-55"
                  } ${errors.phone && "border-red-500"} transition-all`}
                  type="text"
                  name="phone"
                  placeholder="Số điện thoại"
                  innerRef={phoneFocusRef}
                />
                <ErrorMessage className="mb-3" name="phone" component="div">
                  {(msg) => (
                    <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                      <div
                        className="flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                  "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    </div>
                  )}
                </ErrorMessage>

                {/* Email Field */}
                <label
                  className="py-1 px-0.5 text-sm font-semibold"
                  htmlFor="email"
                >
                  Tài khoản email
                </label>
                <Field
                  disabled={submitLoading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                    submitLoading && "opacity-55"
                  } ${errors.email && "border-red-500"} transition-all`}
                  type="email"
                  name="email"
                  placeholder="Nhập tài khoản email"
                  innerRef={emailFocusRef}
                />
                <ErrorMessage className="mb-3" name="email" component="div">
                  {(msg) => (
                    <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                      <div
                        className="flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                  "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    </div>
                  )}
                </ErrorMessage>

                {/* OTP Field */}
                {/* <div className="relative">
                  <label
                    className="py-1 px-0.5 text-sm font-semibold"
                    htmlFor="otp"
                  >
                    Mã xác thực
                  </label>
                  <Field
                    disabled={submitLoading}
                    className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                      submitLoading && "opacity-55"
                    } ${errors.otp && "border-red-500"} w-full transition-all`}
                    type="text"
                    name="otp"
                    onChange={(event: {
                      target: { value: any };
                      preventDefault: () => void;
                    }) => {
                      const value = event.target.value;
                      if (value && !/^\d+$/.test(value)) {
                        event.preventDefault();
                        return;
                      }
                      setFieldValue("otp", value);
                    }}
                    placeholder="Mã xác thực"
                    innerRef={otpFocusRef}
                  />
                  <div
                    className={`absolute ${
                      canResend ? "-right-2" : "right-2"
                    } top-[1.75rem] ${submitLoading && "opacity-55"} `}
                  >
                    <LoadingButton
                      type="button"
                      size="small"
                      onClick={() => handleSendOTP(values.email, setFieldError)}
                      className={`text-[#8E71FF] hover:opacity-70 ${
                        submitLoading && "opacity-55"
                      } transition-all`}
                      submitLoading={sendOTPLoading}
                      submitLoadingIndicator={
                        <CircularProgress
                          className="text-text-color"
                          size={16}
                        />
                      }
                      disabled={submitLoading || sendOTPLoading || !canResend}
                      variant="outlined"
                    >
                      <div className="flex items-center justify-center">
                        <span
                          className={`${sendOTPLoading && "text-white"} ${
                            !canResend && "opacity-55"
                          }`}
                        >
                          Gửi{!canResend && <> lại({<Counter minute={1} />})</>}
                        </span>
                      </div>
                    </LoadingButton>
                  </div>
                </div>
                <ErrorMessage className="mb-3" name="otp" component="div">
                  {(msg) => (
                    <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                      <div
                        className="flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                  "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    </div>
                  )}
                </ErrorMessage> */}
                {/* Address */}
                <label
                  className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                  htmlFor={`defaultAddress`}
                >
                  Tỉnh thành
                </label>
                <Field name={"defaultAddress"} innerRef={addressFocusRef}>
                  {({ form }: FieldProps) => (
                    <Select
                      sx={{
                        "& .MuiInputBase-input": {
                          // borderRadius: "0.375rem!important",
                          border: `1px solid ${
                            errors.defaultAddress ? "red" : "#6b7280"
                          }`,
                          padding: "0.375rem 0.75rem!important",
                          flex: 1,
                          fontSize: "14px",
                          lineHeight: "20px",
                          transition: "all",
                          opacity: submitLoading ? 0.55 : 1,
                        },
                        mb: "0.75rem",
                      }}
                      id="defaultAddress"
                      value={form.values.defaultAddress}
                      name={"defaultAddress"}
                      onChange={(event: { target: { value: any } }) => {
                        form.setFieldValue(
                          "defaultAddress",
                          event.target.value
                        );
                      }}
                      disabled={submitLoading}
                    >
                      {PROVINCES.map((address, index) => (
                        <MenuItem
                          key={`${address}-${index}`}
                          value={address.name}
                        >
                          {address.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="nation" component="div">
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
                {!updateShipper && (
                  <>
                    {/* Password Field */}
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="password"
                    >
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Field
                        disabled={submitLoading}
                        className={`rounded-md px-3 py-1.5 mb-3 text-sm  ${
                          submitLoading && "opacity-55"
                        } ${
                          errors.password && "border-red-500"
                        } w-full transition-all`}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Nhập mật khẩu"
                        innerRef={passwordFocusRef}
                      />
                      <div
                        className={`absolute right-0 -top-[0.1rem] ${
                          submitLoading && "opacity-55"
                        } `}
                      >
                        <ShowHidePassword
                          disabled={submitLoading}
                          showPassword={showPassword}
                          click={handleClickShowPassword}
                          mousedownPassword={handleMouseDownPassword}
                        />
                      </div>
                    </div>
                    <ErrorMessage name="password" component="div">
                      {(msg) => (
                        <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                          <div
                            className="flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                  "
                          >
                            <ErrorIcon className="size-5" />
                            {msg}
                          </div>
                        </div>
                      )}
                    </ErrorMessage>

                    {/* Confirm Password Field */}
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="confirmPassword"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <Field
                      disabled={submitLoading}
                      className={`rounded-md px-3 py-1.5 mb-3 text-sm  ${
                        submitLoading && "opacity-55"
                      } ${
                        errors.confirmPassword && "border-red-500"
                      } w-full transition-all`}
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      innerRef={confirmPasswordFocusRef}
                    />
                    <ErrorMessage name="confirmPassword" component="div">
                      {(msg) => (
                        <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md mb-1">
                          <div
                            className="flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                  "
                          >
                            <ErrorIcon className="size-5" />
                            {msg}
                          </div>
                        </div>
                      )}
                    </ErrorMessage>
                  </>
                )}

                <LoadingButton
                  type="submit"
                  size="small"
                  className={`mt-2 px-4 py-1 rounded-md
             bg-primary-color text-white hover:opacity-70 ${
               (!dirty || submitLoading) && "opacity-55"
             } transition-all`}
                  loading={submitLoading}
                  loadingIndicator={
                    <CircularProgress sx={{ color: "white" }} size={16} />
                  }
                  sx={{
                    mt: 2,
                    px: 2,
                    py: 0.45,
                    borderRadius: "0.375rem",
                    backgroundColor: "#1a4845",
                    fontSize: "15px",
                    fontWeight: "300",
                    alignSelf: "end",
                    transition: "all",
                    opacity: !dirty || submitLoading ? 0.55 : 1,
                    "&:hover": {
                      bgcolor: "#1a4845!important",
                      opacity: !dirty || submitLoading ? 1 : 0.7,
                      color: "#white!important",
                    },
                  }}
                  disabled={!dirty || submitLoading}
                  variant="outlined"
                >
                  <div className="flex items-center justify-center">
                    <span
                      className={`${
                        submitLoading ? "text-primary-color" : "text-white"
                      }`}
                    >
                      {updateShipper ? "Cập nhật" : "Tạo mới"}
                    </span>
                  </div>
                </LoadingButton>
              </Form>
            )}
          </Formik>
        }
      ></Popup>
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
            setActivateShipper(null);
          }, 100);
        }}
        title={
          activateShipper?.isActive
            ? "Vô hiệu hóa tài khoản này?"
            : "Kích hoạt tài khoản này?"
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
                  setActivateShipper(null);
                }, 100);
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
              onClick={handleChangeUserActive}
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
    </Container>
  );
}
