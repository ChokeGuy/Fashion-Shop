"use client";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import Scrollbar from "../../../scrollbar";
import UserTableRow from "../user-table-row";
import UserTableHead from "../user-table-head";
import UserTableToolbar from "../user-table-toolbar";
import { applyFilter } from "../filter";
import { AdminUser, KeyString, Prediction, User } from "@/src/models";
import { adminUserApi } from "@/src/app/apis/admin/userApi";
import { getComparator } from "@/src/utilities/visual";
import TableNoData from "../../table-no-data";
import CircleLoading from "@/src/app/components/Loading";
import { debounce } from "lodash";
import Popup from "@/src/app/components/Popup";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { showToast } from "@/src/lib/toastify";
import {
  ErrorMessage,
  Field,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
  FormikValues,
} from "formik";
import ErrorIcon from "@mui/icons-material/Error";
import Avatar from "@mui/material/Avatar";
import InputFileUpload from "@/src/app/components/FileUploadInput";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { PROVINCES } from "@/src/constants/provine";
import Paper from "@mui/material/Paper";
import { addressApi } from "@/src/app/apis/addressApi";
import dayjs from "dayjs";
import { replaceSubstring } from "@/src/utilities/replace-sub-string";

// ----------------------------------------------------------------------

export default function UserView() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userAvatar, setUserAvatar] = useState<string | File>("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [openUpdateDialog, setUpdateDialog] = useState(false);
  const [updateUser, setUpdateUser] = useState<User | null>(null);
  const [isUpload, setIsUpload] = useState<boolean>(false);

  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("fullname");

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateUser, setActivateUser] = useState<User | null>(null);
  const [isHidden, setIsHidden] = useState(true);
  const [addressSuggest, setAddressSuggest] = useState<Prediction[]>([]);

  const fullNameFocusRef = useRef<HTMLInputElement | null>(null);
  const phoneFocusRef = useRef<HTMLInputElement | null>(null);
  const dobFocusRef = useRef<HTMLInputElement | null>(null);
  const defaultAddressFocusRef = useRef<HTMLInputElement | null>(null);
  const avatarFocusRef = useRef<HTMLInputElement | null>(null);
  const provincesFocusRef = useRef<HTMLInputElement | null>(null);
  const districtsFocusRef = useRef<HTMLInputElement | null>(null);
  const wardsFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUserAvatar(updateUser?.avatar ?? "");
  }, [updateUser]);

  useEffect(() => {
    const getAllUsers = async () => {
      setIsLoading(true);
      const response = await adminUserApi.getAllUserAccounts();
      setUsers(response?.result.content || []);
      setTotalUsers(response?.result.totalElements || 0);
      setIsLoading(false);
    };
    getAllUsers();
  }, []);

  const handleSort = (event: any, id: string) => {
    const isAsc = orderBy === id && order === "asc";
    if (id !== "") {
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.fullname);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleResetUsers = async (page: number, rowsPerPage: number) => {
    const result = await adminUserApi.getAllUserAccounts(
      {
        page: page,
        size: rowsPerPage,
      },
      filterName
    );
    if (result?.statusCode != 200) {
      setUsers([]);
      setTotalUsers(0);
      return;
    }
    setUsers(result?.result.content || []);
    setTotalUsers(result?.result.totalElements || 0);
  };

  const handleChangeUserActive = async () => {
    setActivateLoading(true);
    const response = await adminUserApi.changeUserActivation(
      activateUser?.userId!
    );
    if (!response?.success) {
      showToast("Thay đổi trạng thái tài khoản thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetUsers(page, rowsPerPage);
    showToast(
      "Thay đổi trạng thái tài khoản thành công",
      "success",
      "top-right"
    );
    setActivateLoading(false);
    setTimeout(() => {
      setActivateUser(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetUsers(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetUsers(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleSearch = useCallback(
    debounce(async (searchData: string) => {
      const result = await adminUserApi.getAllUserAccounts(
        {
          page: 0,
          size: rowsPerPage,
        },
        searchData
      );
      if (result?.statusCode != 200) {
        setUsers([]);
        setTotalUsers(0);
        return;
      }
      setUsers(result?.result.content || []);
      setTotalUsers(result?.result.totalElements || 0);
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
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const handleBlur = () => {
    // Logic để ẩn thẻ khi focus ra khỏi input
    setIsHidden(true);
  };

  const handleFocus = () => {
    // Logic khi focus vào input, có thể làm gì đó tại đây nếu cần
    setIsHidden(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlChangeAddressDebounced = useCallback(
    debounce(async function handleGetAddressSuggest(value: string) {
      if (value.trim().length > 0) {
        const result = await addressApi.getAddressSuggest(value);
        if (result) {
          setAddressSuggest(result.predictions);
        } else setAddressSuggest([]);
      } else setAddressSuggest([]);
    }, 500),
    []
  );

  const getChangedUserInfo = (values: AdminUser & KeyString): AdminUser => {
    let updatedUserInfo: AdminUser & KeyString = {};
    let userForLoop: AdminUser & KeyString = {
      email: "",
      defaultAddress: "",
      fullname: updateUser?.fullname || "",
      phone: updateUser?.phone || "",
      dob: updateUser?.dob && dayjs(updateUser?.dob).format("YYYY/MM/DD"),
      gender: updateUser?.gender || "",
    };
    if (userAvatar instanceof File) {
      updatedUserInfo.avatar = userAvatar;
    }

    //Get the user info which was changed by user
    Object.keys(userForLoop).forEach((key) => {
      if (userForLoop[key] != values[key]) {
        updatedUserInfo[key] = values[key];
      }
    });
    //Delete dob if it is invalid
    if (!updatedUserInfo.dob || updatedUserInfo.dob == "Invalid Date") {
      delete updatedUserInfo.dob;
    }

    //Delete gender if it is invalid
    if (!updatedUserInfo.gender) {
      delete updatedUserInfo.gender;
    }

    //Cast the user dob to YYYY/MM/DD Format for comparision purposes
    if (updatedUserInfo.dob) {
      updatedUserInfo.dob = dayjs(values.dob).format("YYYY/MM/DD");
    }
    let finalAddress = values.defaultAddress!;
    const addressParts = [values.provinces, values.districts];

    for (let part of addressParts) {
      finalAddress = replaceSubstring(finalAddress, part, "").replace(",", " ");
    }
    finalAddress = `${finalAddress}, ${values.wards}, ${values.districts}, ${values.provinces}`;
    updatedUserInfo.defaultAddress = finalAddress;
    //Not allow to change email
    delete updatedUserInfo.email;
    return updatedUserInfo;
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
        <Typography variant="h4">Tài khoản khách hàng</Typography>

        {/* <Button
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          New User
        </Button> */}
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "userId", label: "Mã khách hàng" },
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
                  <UserTableRow
                    userId={rowsPerPage * page + index + 1}
                    key={row.userId}
                    user={row}
                    setActivateDialog={setActivateDialog}
                    setActivateUser={setActivateUser}
                    setUpdateUser={setUpdateUser}
                    setUpdateDialog={setUpdateDialog}
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
          count={totalUsers}
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
            setActivateUser(null);
          }, 100);
        }}
        title={
          activateUser?.isActive
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
                  setActivateUser(null);
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
      <Popup
        open={openUpdateDialog}
        onClose={() => {
          setUpdateDialog(false);
          setTimeout(() => {
            setUpdateUser(null);
            setUserAvatar("");
            setIsUpload(false);
          }, 100);
        }}
        title={"Chỉnh sửa tài khoản"}
        content={
          <Formik<
            AdminUser & { provinces: string; districts: string; wards: string }
          >
            enableReinitialize={true}
            initialValues={{
              fullname: updateUser?.fullname || "",
              email: updateUser?.email || "",
              phone: updateUser?.phone || "",
              dob: updateUser?.dob,
              gender: updateUser?.gender || "",
              defaultAddress:
                updateUser &&
                updateUser.addresses[0] &&
                updateUser.addresses[0].detail
                  ? updateUser.addresses[0].detail.split(",")[0]?.trim() || ""
                  : "",
              provinces:
                updateUser &&
                updateUser.addresses[0] &&
                updateUser.addresses[0].detail
                  ? updateUser.addresses[0].detail?.split(",")[3]?.trim() || ""
                  : "",
              districts:
                updateUser &&
                updateUser.addresses[0] &&
                updateUser.addresses[0].detail
                  ? updateUser.addresses[0].detail?.split(",")[2]?.trim() || ""
                  : "",
              wards:
                updateUser &&
                updateUser.addresses[0] &&
                updateUser.addresses[0].detail
                  ? updateUser.addresses[0].detail?.split(",")[1]?.trim() || ""
                  : "",
              avatar: userAvatar,
            }}
            onSubmit={async (values) => {
              setUpdateLoading(true);

              const changeValues = getChangedUserInfo(values);

              const response = await adminUserApi.updateUserInfo(
                updateUser?.userId!,
                changeValues
              );
              if (!response?.success) {
                showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
                setUpdateLoading(false);
                return;
              }
              await handleResetUsers(page, rowsPerPage);
              showToast("Cập nhật thông tin tài khoản thành công", "success");
              setTimeout(() => {
                setUserAvatar("");
                setIsUpload(false);
              }, 100);
              setUpdateLoading(false);
              setUpdateUser(null);
              setUpdateDialog(false);
            }}
            validateOnBlur={false}
            validateOnChange={false}
            validate={(values) => {
              const errors: AdminUser & {
                defaultAddress: string;
                provinces: string;
                districts: string;
                wards: string;
              } = {
                defaultAddress: "",
                provinces: "",
                districts: "",
                wards: "",
                fullname: "",
                email: "",
                phone: "",
                gender: "",
                avatar: "",
              };

              //Validate fullname
              if (values.fullname!.length < 1) {
                errors.fullname = "Tên không được để trống";
                fullNameFocusRef.current?.focus();
                return errors;
              }

              // Validate phone
              if (!values.phone) {
                errors.phone = "Vui lòng nhập số điện thoại";
                phoneFocusRef.current?.focus();
                return errors;
              } else if (!/^(0)\d{9}$/i.test(values.phone)) {
                errors.phone = "Số điện thoại không hợp lệ";
                phoneFocusRef.current?.focus();
                return errors;
              }

              // Validate dob
              if (values.dob) {
                const currentDate = dayjs();
                const selectedDate = dayjs(values.dob);
                if (selectedDate.isAfter(currentDate)) {
                  errors.dob = "Ngày sinh không hợp lệ";
                  dobFocusRef.current?.focus();
                  return errors;
                }
              }

              if (!values.provinces || values.provinces.length == 0) {
                errors.provinces = "Tỉnh/thành phố không được bỏ trống";
                provincesFocusRef.current?.focus();
                return errors;
              }
              if (
                values.provinces.length != 0 &&
                (!values.districts || values.districts.length == 0)
              ) {
                errors.districts = "Quận/Huyện không được bỏ trống";
                districtsFocusRef.current?.focus();
                return errors;
              }
              if (
                values.provinces.length != 0 &&
                values.districts.length != 0 &&
                (!values.wards || values.wards.length == 0)
              ) {
                errors.wards = "Phường/xã không được bỏ trống";
                wardsFocusRef.current?.focus();
                return errors;
              }

              // Validate default address
              if (!values.defaultAddress || values.defaultAddress.length == 0) {
                errors.defaultAddress = "Địa chỉ không được bỏ trống";
                defaultAddressFocusRef.current?.focus();
                return errors;
              } else if (values.defaultAddress.length < 5) {
                errors.defaultAddress = "Địa chỉ này quá ngắn";
                defaultAddressFocusRef.current?.focus();

                return errors;
              } else if (
                /phường|xã|huyện|quận|tỉnh|thành phố/i.test(
                  values.defaultAddress.toLowerCase()
                )
              ) {
                errors.defaultAddress =
                  "Địa chỉ cụ thể không bao gồm các hậu tố phường, xã, thành phố";
                defaultAddressFocusRef.current?.focus();
                return errors;
              } else if (
                !/^(\d+[A-Za-z]*(\/\d+[A-Za-z]*)*)*\s+.+$/.test(
                  values.defaultAddress
                )
              ) {
                errors.defaultAddress =
                  "Địa chỉ phải bao gồm số nhà và tên đường";
                // defaultAddressFocusRef.current?.focus();
                return errors;
              }

              // Validate avatar if this avatar empty which is user hasn't uploaded avatar yet or
              //                 if this avatar has avatar which is user has uploaded avatar already
              if (
                values.avatar === "" ||
                (typeof values.avatar == "string" &&
                  values.avatar?.includes("res.cloudinary.com"))
              ) {
                return;
              }
              // Validate avatar
              const file = userAvatar as File;
              const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
              const maxSize = 2 * 1024 * 1024; // 2MB
              if (!allowedTypes.includes(file.type)) {
                errors.avatar = "File phải có định dạng JPEG,JPG,PNG,...";
                avatarFocusRef.current?.focus();
                return errors;
              } else if (file.size > maxSize) {
                errors.avatar = "Kích thước file phải nhỏ hơn 2MB";
                avatarFocusRef.current?.focus();
                return errors;
              }
            }}
          >
            {({ errors, values, dirty, setFieldValue, setFieldError }) => {
              const provinceList: string[] =
                PROVINCES && PROVINCES.map((item: any) => (item = item.name));

              const districtList: string[] =
                values.provinces != ""
                  ? PROVINCES.find(
                      (item: any) => item.name == values.provinces
                    )!.districts.map((item: any) => (item = item.name))
                  : [];
              const wardList: string[] =
                values.provinces != "" && values.districts != ""
                  ? PROVINCES.find(
                      (item: any) => item.name == values.provinces
                    )!
                      .districts.find(
                        (item: any) => item.name == values.districts
                      )!
                      .wards.map((item: any) => (item = item.name))
                  : [];
              return (
                <Form className="flex flex-col">
                  <div className="flex flex-col items-center justify-center gap-y-2">
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="avatar"
                    >
                      Ảnh đại diện
                    </label>
                    {
                      // Show avatar preview
                      values.avatar ? (
                        <Avatar
                          sx={{ width: "4rem", height: "4rem" }}
                          className="!size-16 rounded-full border border-primary-color"
                          src={values.avatar as string}
                        ></Avatar>
                      ) : (
                        <Avatar
                          sx={{ width: "4rem", height: "4rem" }}
                          className="!size-16"
                        >
                          {(values.fullname &&
                            values.fullname[0].toUpperCase()) ||
                            "T"}
                        </Avatar>
                      )
                    }
                    <Field name="avatar" innerRef={avatarFocusRef}>
                      {({ form }: FieldProps) => (
                        <InputFileUpload
                          name="avatar"
                          onChange={(event) => {
                            if (event.target.files) {
                              const files = event.target.files;
                              if (files && files.length > 0) {
                                const file = files[0];
                                setUserAvatar(file);
                                const reader = new FileReader();

                                reader.onload = (e) => {
                                  if (e.target && e.target.result) {
                                    const imageUrl = e.target.result;
                                    form.setFieldValue("avatar", imageUrl);
                                    setIsUpload(true);
                                  }
                                };

                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                          disabled={updateLoading}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="avatar" component="div">
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
                  </div>
                  <div className="flex flex-col mb-3">
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="gender"
                    >
                      Giới tính
                    </label>
                    <div className="flex gap-x-2">
                      <label
                        className="flex items-center py-1 px-0.5 text-sm font-semibold"
                        htmlFor="male"
                      >
                        <Field
                          disabled={updateLoading}
                          className="mr-1"
                          type="radio"
                          id="male"
                          name="gender"
                          value="MALE"
                        />
                        Nam
                      </label>
                      <label
                        className="flex items-center py-1 px-0.5 text-sm font-semibold"
                        htmlFor="female"
                      >
                        <Field
                          disabled={updateLoading}
                          className="mr-1"
                          type="radio"
                          id="female"
                          name="gender"
                          value="FEMALE"
                        />
                        Nữ
                      </label>
                      <label
                        className="flex items-center py-1 px-0.5 text-sm font-semibold"
                        htmlFor="other"
                      >
                        <Field
                          disabled={updateLoading}
                          className="mr-1"
                          type="radio"
                          id="other"
                          name="gender"
                          value="OTHER"
                        />
                        Khác
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-x-2">
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="fullname"
                    >
                      Họ và tên
                    </label>
                    <Field
                      disabled={updateLoading}
                      innerRef={fullNameFocusRef}
                      className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${updateLoading} && "opacity-55"
                    } ${errors.fullname && "border-red-500"} transition-all`}
                      type="text"
                      id="fullname"
                      name="fullname"
                    />
                    <ErrorMessage name="fullname" component="div">
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
                  </div>
                  <div className="flex flex-col gap-x-2">
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="phone"
                    >
                      Số điện thoại
                    </label>
                    <Field
                      disabled={updateLoading}
                      className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${updateLoading} && "opacity-55"
                    } ${errors.phone && "border-red-500"} transition-all`}
                      innerRef={phoneFocusRef}
                      type="text"
                      id="phone"
                      name="phone"
                    />
                    <ErrorMessage name="phone" component="div">
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
                  </div>
                  <div className="flex flex-col gap-x-2">
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="dob"
                    >
                      Ngày sinh
                    </label>
                    <Field
                      value={values.dob}
                      disabled={updateLoading}
                      innerRef={dobFocusRef}
                      className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${updateLoading} && "opacity-55"
                    } ${errors.dob && "border-red-500"} transition-all`}
                      type="date"
                      id="dob"
                      name="dob"
                    />
                    <ErrorMessage name="dob" component="div">
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
                  </div>
                  <label
                    className="py-1 px-0.5 text-sm font-semibold"
                    htmlFor="address"
                  >
                    Địa chỉ tổng quát
                  </label>
                  <div className="flex flex-col items-center gap-y-8 mb-6">
                    <Field
                      disabled={updateLoading}
                      innerRef={provincesFocusRef}
                      name="provinces"
                    >
                      {({ form }: FieldProps) => (
                        <div className="relative w-full">
                          <Autocomplete
                            sx={{
                              width: "100%",
                              "& input": {
                                // minHeight: "32px!important",
                                padding: "0!important",
                                borderRadius: "0.375rem!important",
                                // fontSize: "0.875rem!important",
                                // lineHeight: "1.25rem!important",
                                opacity: updateLoading ? "0.55!important" : "",
                                cursor:
                                  values.provinces == "" ||
                                  values.districts == ""
                                    ? "not-allowed!important"
                                    : "",
                              },
                            }}
                            isOptionEqualToValue={(option, value) =>
                              value == undefined ||
                              value == "" ||
                              option === value
                            }
                            value={values.provinces || ""}
                            onChange={(_event, newProvinces) => {
                              setFieldValue("provinces", newProvinces || "");
                              setFieldValue("districts", "");
                              setFieldValue("wards", "");
                              setFieldValue("defaultAddress", "");
                              setFieldError("defaultAddress", "");
                              setAddressSuggest([]);
                            }}
                            options={provinceList}
                            renderInput={(params) => (
                              <TextField
                                placeholder="Tỉnh/thành phố"
                                {...params}
                              />
                            )}
                            renderOption={(props, option) => {
                              return (
                                <li {...props} key={option}>
                                  <div className="px-2 py-1 text-sm whitespace-nowrap text-black w-full hover:opacity-55 transition-opacity">
                                    {option}
                                  </div>
                                </li>
                              );
                            }}
                          />
                          <ErrorMessage name="provinces" component="div">
                            {(msg) => (
                              <div className="flex items-center gap-x-0.5 text-ssm text-red-500 animate-appear absolute -bottom-6">
                                <ErrorIcon className="size-5" />
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </div>
                      )}
                    </Field>

                    <Field
                      disabled={updateLoading}
                      innerRef={districtsFocusRef}
                      name="districts"
                    >
                      {({ form }: FieldProps) => (
                        <div className="relative w-full">
                          <Autocomplete
                            sx={{
                              width: "100%",
                              "& input": {
                                // minHeight: "32px!important",
                                padding: "0!important",
                                borderRadius: "0.375rem!important",
                                // fontSize: "0.875rem!important",
                                // lineHeight: "1.25rem!important",
                                opacity: updateLoading ? "0.55!important" : "",
                                cursor:
                                  values.provinces == "" ||
                                  values.districts == ""
                                    ? "not-allowed!important"
                                    : "",
                              },
                            }}
                            value={values.districts}
                            onChange={(_event, newDistricts) => {
                              setFieldValue("districts", newDistricts || "");
                              setFieldValue("wards", "");
                              setFieldValue("defaultAddress", "");
                              setFieldError("defaultAddress", "");
                              setAddressSuggest([]);
                            }}
                            isOptionEqualToValue={(option, value) =>
                              value === undefined ||
                              value === "" ||
                              option === value
                            }
                            disabled={updateLoading || values.provinces == ""}
                            options={[...districtList, ""]}
                            renderInput={(params) => (
                              <TextField placeholder="Quận/Huyện" {...params} />
                            )}
                            renderOption={(props, option) => {
                              return (
                                <li {...props} key={option}>
                                  <div className="px-2 py-1 text-sm whitespace-nowrap text-black w-full hover:opacity-55 transition-opacity">
                                    {option}
                                  </div>
                                </li>
                              );
                            }}
                          />
                          <ErrorMessage name="districts" component="div">
                            {(msg) => (
                              <div className="flex items-center gap-x-0.5 text-ssm text-red-500 animate-appear absolute -bottom-6">
                                <ErrorIcon className="size-5" />
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </div>
                      )}
                    </Field>
                    <Field
                      disabled={updateLoading}
                      innerRef={wardsFocusRef}
                      name="wards"
                    >
                      {({ form }: FieldProps) => (
                        <div className="relative w-full">
                          <Autocomplete
                            sx={{
                              width: "100%",
                              "& input": {
                                // minHeight: "32px!important",
                                padding: "0!important",
                                borderRadius: "0.375rem!important",
                                // fontSize: "0.875rem!important",
                                // lineHeight: "1.25rem!important",
                                opacity: updateLoading ? "0.55!important" : "",
                                cursor:
                                  values.provinces == "" ||
                                  values.districts == ""
                                    ? "not-allowed!important"
                                    : "",
                              },
                            }}
                            value={values.wards}
                            onChange={(_event, newWards) => {
                              setFieldValue("wards", newWards || "");
                              setFieldValue("defaultAddress", "");
                              setFieldError("defaultAddress", "");
                              setAddressSuggest([]);
                            }}
                            isOptionEqualToValue={(option, value) =>
                              value === undefined ||
                              value === "" ||
                              option === value
                            }
                            disabled={
                              updateLoading ||
                              values.provinces == "" ||
                              values.districts == ""
                            }
                            options={wardList}
                            renderInput={(params) => (
                              <TextField placeholder="Phường/Xã" {...params} />
                            )}
                            renderOption={(props, option) => {
                              return (
                                <li {...props} key={option}>
                                  <div className="px-2 py-1 text-sm whitespace-nowrap text-black w-full hover:opacity-55 transition-opacity">
                                    {option}
                                  </div>
                                </li>
                              );
                            }}
                          />
                          <ErrorMessage name="wards" component="div">
                            {(msg) => (
                              <div className="flex items-center gap-x-0.5 text-ssm text-red-500 animate-appear absolute -bottom-6">
                                <ErrorIcon className="size-5" />
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </div>
                      )}
                    </Field>
                  </div>

                  <label
                    className="py-1 px-0.5 text-sm font-semibold"
                    htmlFor="defaultAddress"
                  >
                    Địa chỉ cụ thể
                  </label>
                  <div className="w-full relative">
                    <Field
                      disabled={
                        updateLoading ||
                        values.provinces.length == 0 ||
                        values.districts.length == 0 ||
                        values.wards.length == 0
                      }
                      innerRef={defaultAddressFocusRef}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const addressInput = e.target.value;
                        setFieldValue("defaultAddress", addressInput);
                        let addressAutocomplete;
                        if (addressInput.length > 0) {
                          addressAutocomplete = `${addressInput},${values.wards}, ${values.districts}, ${values.provinces}`;
                        } else addressAutocomplete = addressInput;
                        handlChangeAddressDebounced(addressAutocomplete);
                      }}
                      maxLength={40}
                      className={`rounded-md w-full px-3 py-1.5 flex-1 mb-3 text-sm ${
                        (updateLoading ||
                          values.provinces.length == 0 ||
                          values.districts.length == 0 ||
                          values.wards.length == 0) &&
                        "opacity-55 cursor-not-allowed"
                      } ${
                        errors.defaultAddress && "border-red-500"
                      } transition-all`}
                      type="text"
                      name="defaultAddress"
                    />
                    <Paper className="absolute top-9 z-[2] flex flex-col shadow-hd rounded-lg w-full">
                      <div className="max-h-[11rem] overflow-auto">
                        {!isHidden &&
                          addressSuggest &&
                          addressSuggest.length > 0 &&
                          addressSuggest.map((address, index) => {
                            return (
                              <div
                                onMouseDown={() => {
                                  setFieldValue(
                                    "defaultAddress",
                                    address.structured_formatting.main_text
                                  );
                                }}
                                className="p-3 text-sm hover:bg-primary-color hover:cursor-pointer hover:text-white outline outline-1 outline-border-color"
                                key={index}
                              >
                                {address.structured_formatting.main_text}
                              </div>
                            );
                          })}
                      </div>
                    </Paper>
                  </div>

                  <ErrorMessage name="defaultAddress" component="div">
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
                      opacity:
                        (!dirty && !isUpload) || updateLoading ? 0.55 : 1,
                      "&:hover": {
                        bgcolor: "#1a4845!important",
                        opacity: updateLoading ? 1 : 0.7,
                        color: "#white!important",
                      },
                    }}
                    type="submit"
                    size="small"
                    className={`mt-2 px-4 py-1 rounded-md
                    bg-primary-color text-white self-end  hover:opacity-70 ${
                      (!dirty && !isUpload) || updateLoading
                    } && "opacity-55"
                    } transition-all`}
                    loading={updateLoading}
                    loadingIndicator={
                      <CircularProgress
                        sx={{ color: "white" }}
                        className="text-white"
                        size={16}
                      />
                    }
                    disabled={(!dirty && !isUpload) || updateLoading}
                    variant="outlined"
                  >
                    <span
                      className={`${updateLoading && "text-primary-color"}`}
                    >
                      Cập nhật
                    </span>
                  </LoadingButton>
                </Form>
              );
            }}
          </Formik>
        }
      />
    </Container>
  );
}
