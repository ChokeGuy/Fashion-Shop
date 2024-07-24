"use client";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import ErrorIcon from "@mui/icons-material/Error";
import { CreateAddress, Prediction } from "@/src/models";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { debounce, set } from "lodash";
import Paper from "@mui/material/Paper";
import { addressApi } from "../../apis/addressApi";
import Popup from "../Popup";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { PROVINCES } from "@/src/constants/provine";
import { replaceSubstring } from "@/src/utilities/replace-sub-string";
import {
  createUserAddressAsync,
  deleteUserAddressAsync,
  getUserAddressAsync,
  selectAddresses,
  selectAddressesStatus,
  setDefaultAddressAsync,
  updateUserAddressAsync,
} from "@/src/lib/features/address/addressSlice";
const AddressPage = () => {
  const [loading, setLoading] = useState(false);
  const addresses = useAppSelector(selectAddresses);
  const dispatch = useAppDispatch();
  const [addressSuggest, setAddressSuggest] = useState<Prediction[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateAddress, setUpdateAddress] = useState<CreateAddress | null>(
    null
  );
  const [addressDetail, setAddressDetail] = useState<string[]>([]);
  const [updateId, setUpdateId] = useState(-1);
  const [isHidden, setIsHidden] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [isDelele, setIsDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(-1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const addressFocusRef = useRef<HTMLInputElement | null>(null);
  const provincesFocusRef = useRef<HTMLInputElement | null>(null);
  const districtsFocusRef = useRef<HTMLInputElement | null>(null);
  const wardsFocusRef = useRef<HTMLInputElement | null>(null);
  const recipientNameFocusRef = useRef<HTMLInputElement | null>(null);
  const phoneFocusRef = useRef<HTMLInputElement | null>(null);

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
  const openDeleteDialog = (address: CreateAddress) => {
    setIsDelete(true);
    setDeleteId(address.addressId);
  };

  const handleDeleteAddress = async () => {
    setDeleteLoading(true);
    await dispatch(deleteUserAddressAsync(deleteId));
    setDeleteLoading(false);
    setIsDelete(false);
    setDeleteId(-1);
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    dispatch(setDefaultAddressAsync(addressId));

    // dispatch(getUserAddressAsync());
  };

  const handleUpdateAddress = async (request: {
    addressId: number;
    address: string;
    phone: string;
    recipientName: string;
  }) => {
    await dispatch(updateUserAddressAsync(request));
    setTimeout(() => {
      setIsUpdate(false);
      setUpdateAddress(null);
      setUpdateId(-1);
      setAddressSuggest([]);
    }, 200);
  };

  const handleOpenDialog = (isUpdate?: boolean, address?: any) => {
    if (isUpdate) {
      const addressParts = address.detail.split(",");
      console.log(addressParts);
      setUpdateId(address.addressId);
      setAddressDetail(addressParts);
      setUpdateAddress(address);
      setOpenDialog(true);
      setIsUpdate(true);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setUpdateAddress(null);
      setUpdateId(-1);
      setAddressSuggest([]);
      setIsUpdate(false);
    }, 100);
  };

  return (
    <>
      <div className="col-span-full md:col-span-8 lg:col-span-8 bg-white rounded-xl shadow-sm">
        <div className="w-full pt-6">
          <h2 className="w-full flex items-center justify-between text-2xl font-semibold pb-4 px-4 border-b border-border-color">
            <span>Địa chỉ liên lạc</span>
            <button onClick={(e: any) => handleOpenDialog()}>
              <span
                className="text-white text-sm font-medium hover:opacity-60
               transition-opacity rounded-md bg-secondary-color px-4 py-2"
              >
                Thêm địa chỉ
              </span>
            </button>
          </h2>
          <div className="w-full h-[470px] overflow-auto mt-6">
            <div className="flex flex-col">
              {addresses && addresses.length > 0 && (
                <div className="w-full px-4 text-xl">Địa chỉ</div>
              )}
              {addresses && addresses.length > 0 ? (
                addresses.map((address: CreateAddress, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between gap-x-1 p-4 rounded-md ${
                      index != addresses.length - 1 &&
                      "border-b border-border-color"
                    }`}
                  >
                    <div className="flex flex-col w-full max-xl:flex-col max-xl:space-y-2 max-xl:justify-start max-xl:items-start">
                      <div className="flex space-x-2">
                        <p className="text-base font-semibold text-primary-color pr-2 border-r border-[#ccc]">
                          {address.recipientName ?? "Chưa đặt tên"}
                        </p>
                        <p className="text-base font-semibold text-primary-color">
                          {address.phone ?? "Chưa đặt số điện thoại"}
                        </p>
                      </div>
                      <p className="text-base font-medium text-primary-color w-[80%]">
                        {address.detail}
                      </p>
                    </div>
                    <div className="flex items-end flex-col gap-y-2">
                      <div className="flex gap-x-2">
                        <button
                          className={`text-sm text-primary-color hover:opacity-60 transition-opacity`}
                          onClick={() => openDeleteDialog(address)}
                        >
                          <DeleteIcon />
                        </button>
                        <button
                          onClick={(event: any) =>
                            handleOpenDialog(true, address)
                          }
                          className="text-sm text-primary-color hover:opacity-60 transition-opacity"
                        >
                          <EditIcon />
                        </button>
                      </div>
                      {address.defaultAddress ? (
                        <div
                          className="border border-secondary-color text-secondary-color px-3 py-1.5 text-ssm h-fit
                                whitespace-nowrap"
                        >
                          Mặc định
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleSetDefaultAddress(address.addressId)
                          }
                          className=" text-white bg-secondary-color px-3 py-1.5 rounded-md text-ssm whitespace-nowrap
                                 hover:opacity-55 transition-opacity"
                        >
                          Thiết lập mặc định
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-lg font-medium px-4">Chưa có địa chỉ nào</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Popup
        padding={true}
        closeButton={{
          top: "5px",
          right: "5px",
        }}
        open={isDelele}
        onClose={() => setIsDelete(false)}
        type="alert"
        title={"Bạn có chắc chắn muốn xóa địa chỉ này?"}
        content={undefined}
        actions={
          <>
            <button
              type="button"
              className="mt-2 px-4 py-1 rounded-md w-24
                      bg-red-500 text-white self-end  hover:opacity-70 mr-3"
              onClick={() => {
                setIsDelete(false);
                setDeleteId(-1);
              }}
            >
              Hủy
            </button>
            <LoadingButton
              onClick={handleDeleteAddress}
              type="button"
              size="small"
              className={`mt-2 px-4 py-1 rounded-md w-24
            bg-red-500 text-white self-end ${
              deleteLoading && "opacity-55"
            }  hover:opacity-70`}
              loading={deleteLoading}
              loadingIndicator={
                <CircularProgress className="text-white" size={16} />
              }
              disabled={loading}
              variant="outlined"
            >
              <span className={`${deleteLoading && "text-red-500"}`}>
                Đồng ý
              </span>
            </LoadingButton>
          </>
        }
      />
      <Popup
        closeButton={{
          top: "10px",
          right: "12px",
        }}
        open={openDialog}
        onClose={handleCloseDialog}
        title={updateId == -1 ? "Tạo mới địa chỉ" : "Cập nhật địa chỉ"}
        content={
          <Formik<{
            recipientName: string;
            phone: string;
            address: string;
            provinces: string;
            districts: string;
            wards: string;
          }>
            initialValues={
              updateAddress
                ? {
                    recipientName: updateAddress?.recipientName ?? "",
                    phone: updateAddress?.phone ?? "",
                    address: addressDetail[0].trim() ?? "",
                    provinces: addressDetail[3].trim() ?? "",
                    districts: addressDetail[2].trim() ?? "",
                    wards: addressDetail[1].trim() ?? "",
                  }
                : {
                    recipientName: "",
                    phone: "",
                    address: "",
                    provinces: "",
                    districts: "",
                    wards: "",
                  }
            }
            validateOnBlur={false}
            validateOnChange={false}
            validate={(values) => {
              const errors: {
                recipientName: string;
                phone: string;
                address: string;
                provinces: string;
                districts: string;
                wards: string;
              } = {
                recipientName: "",
                phone: "",
                address: "",
                provinces: "",
                districts: "",
                wards: "",
              };

              //Validate recipientName
              if (values.recipientName!.length < 1) {
                errors.recipientName = "Tên không được để trống";
                recipientNameFocusRef.current?.focus();
                return errors;
              }

              // Validate phone
              if (values.phone == null || values.phone == "") {
                errors.phone = "Vui lòng nhập số điện thoại";
                phoneFocusRef.current?.focus();
                return errors;
              } else if (!/^(0)\d{9}$/i.test(values.phone)) {
                errors.phone = "Số điện thoại không hợp lệ";
                phoneFocusRef.current?.focus();
                return errors;
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

              if (!values.address || values.address.length == 0) {
                errors.address = "Địa chỉ không được bỏ trống";
                addressFocusRef.current?.focus();
                return errors;
              } else if (values.address.length < 5) {
                errors.address = "Địa chỉ này quá ngắn";
                addressFocusRef.current?.focus();

                return errors;
              } else if (
                /phường|xã|huyện|quận|tỉnh|thành phố/i.test(
                  values.address.toLowerCase()
                )
              ) {
                errors.address =
                  "Địa chỉ cụ thể không bao gồm các hậu tố phường, xã, thành phố";
                addressFocusRef.current?.focus();
                return errors;
              } else if (
                !/^(\d+[A-Za-z]*(\/\d+[A-Za-z]*)*)*\s+.+$/.test(values.address)
              ) {
                errors.address = "Địa chỉ phải bao gồm số nhà và tên đường";
                // addressFocusRef.current?.focus();
                return errors;
              }
            }}
            onSubmit={async (values, { resetForm }) => {
              setLoading(true);

              let finalAddress = values.address;
              const addressParts = [values.provinces, values.districts];

              for (let part of addressParts) {
                finalAddress = replaceSubstring(finalAddress, part, "").replace(
                  ",",
                  " "
                );
              }
              finalAddress = `${finalAddress}, ${values.wards}, ${values.districts}, ${values.provinces}`;

              const payload = {
                address: finalAddress,
                recipientName: values.recipientName,
                phone: values.phone,
              };
              // if (
              //   addresses.find((item) => item.detail.includes(finalAddress))
              // ) {
              //   setFieldError("address", "Địa chỉ này đã tồn tại");
              //   setLoading(false);
              //   return;
              // }

              if (isUpdate) {
                await handleUpdateAddress({
                  addressId: updateId,
                  ...payload,
                });
              } else {
                await dispatch(createUserAddressAsync(payload));
              }
              setLoading(false);
              setOpenDialog(false);
              resetForm();
            }}
          >
            {({
              errors,
              submitForm,
              resetForm,
              dirty,
              setFieldValue,
              setFieldError,
              values,
            }) => {
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
                <>
                  <Form className="flex flex-col gap-y-1 p-4 border-b border-border-color">
                    <div className="flex flex-col gap-x-2">
                      <label
                        className="py-1 px-0.5 text-sm font-semibold"
                        htmlFor="recipientName"
                      >
                        Họ và tên
                      </label>
                      <Field
                        disabled={loading}
                        innerRef={recipientNameFocusRef}
                        className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                          loading && "opacity-55"
                        } ${
                          errors.recipientName && "border-red-500"
                        } transition-all`}
                        type="text"
                        id="recipientName"
                        name="recipientName"
                      />
                      <ErrorMessage name="recipientName" component="div">
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
                        disabled={loading}
                        className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                          loading && "opacity-55"
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
                    <label
                      className="py-1 px-0.5 text-sm font-semibold"
                      htmlFor="address"
                    >
                      Địa chỉ tổng quát
                    </label>
                    <div className="flex items-center gap-x-4 mb-2">
                      <Field
                        disabled={loading}
                        innerRef={provincesFocusRef}
                        name="provinces"
                      >
                        {({ form }: FieldProps) => (
                          <div className="relative w-full">
                            <Autocomplete
                              sx={{
                                width: "100%",
                                "& input": {
                                  minHeight: "32px!important",
                                  padding: "0.75rem 0.75rem!important",
                                  borderRadius: "0.375rem!important",
                                  fontSize: "0.875rem!important",
                                  lineHeight: "1.25rem!important",
                                  opacity: loading ? "0.55!important" : "",
                                  border:
                                    errors.provinces &&
                                    "1px solid red!important",
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
                                setFieldValue("address", "");
                                setFieldError("address", "");
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
                                <div
                                  className="flex gap-x-1 text-ssm text-red-500 animate-appear absolute -bottom-[1.25rem]
                                  whitespace-nowrap"
                                >
                                  <ErrorIcon className="size-5" />
                                  {msg}
                                </div>
                              )}
                            </ErrorMessage>
                          </div>
                        )}
                      </Field>

                      <Field
                        disabled={loading}
                        innerRef={districtsFocusRef}
                        name="districts"
                      >
                        {({ form }: FieldProps) => (
                          <div className="relative w-full">
                            <Autocomplete
                              sx={{
                                width: "100%",
                                "& input": {
                                  minHeight: "32px!important",
                                  padding: "0.75rem 0.75rem!important",
                                  borderRadius: "0.375rem!important",
                                  fontSize: "0.875rem!important",
                                  lineHeight: "1.25rem!important",
                                  opacity: loading ? "0.55!important" : "",
                                  border:
                                    errors.districts &&
                                    "1px solid red!important",
                                  cursor:
                                    values.provinces == ""
                                      ? "not-allowed!important"
                                      : "",
                                },
                              }}
                              value={values.districts}
                              onChange={(_event, newDistricts) => {
                                setFieldValue("districts", newDistricts || "");
                                setFieldValue("wards", "");
                                setFieldValue("address", "");
                                setFieldError("address", "");
                                setAddressSuggest([]);
                              }}
                              isOptionEqualToValue={(option, value) =>
                                value === undefined ||
                                value === "" ||
                                option === value
                              }
                              disabled={loading || values.provinces == ""}
                              options={[...districtList, ""]}
                              renderInput={(params) => (
                                <TextField
                                  placeholder="Quận/Huyện"
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
                            <ErrorMessage name="districts" component="div">
                              {(msg) => (
                                <div
                                  className="flex gap-x-1 text-ssm text-red-500 animate-appear absolute -bottom-[1.25rem]
                                whitespace-nowrap"
                                >
                                  <ErrorIcon className="size-5" />
                                  {msg}
                                </div>
                              )}
                            </ErrorMessage>
                          </div>
                        )}
                      </Field>
                      <Field
                        disabled={loading}
                        innerRef={wardsFocusRef}
                        name="wards"
                      >
                        {({ form }: FieldProps) => (
                          <div className="relative w-full">
                            <Autocomplete
                              sx={{
                                width: "100%",
                                "& input": {
                                  minHeight: "32px!important",
                                  padding: "0.75rem 0.75rem!important",
                                  borderRadius: "0.375rem!important",
                                  fontSize: "0.875rem!important",
                                  lineHeight: "1.25rem!important",
                                  opacity: loading ? "0.55!important" : "",
                                  border:
                                    errors.wards && "1px solid red!important",
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
                                setFieldValue("address", "");
                                setFieldError("address", "");
                                setAddressSuggest([]);
                              }}
                              isOptionEqualToValue={(option, value) =>
                                value === undefined ||
                                value === "" ||
                                option === value
                              }
                              disabled={
                                loading ||
                                values.provinces == "" ||
                                values.districts == ""
                              }
                              options={wardList}
                              renderInput={(params) => (
                                <TextField
                                  placeholder="Phường/Xã"
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
                            <ErrorMessage name="wards" component="div">
                              {(msg) => (
                                <div
                                  className="flex gap-x-1 text-ssm text-red-500 animate-appear absolute -left-[1.25rem] -bottom-[1.25rem]
                                  whitespace-nowrap"
                                >
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
                      htmlFor="address"
                    >
                      Địa chỉ cụ thể
                    </label>
                    <div className="w-full relative">
                      <Field
                        disabled={
                          loading ||
                          values.provinces.length == 0 ||
                          values.districts.length == 0 ||
                          values.wards.length == 0
                        }
                        innerRef={addressFocusRef}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const addressInput = e.target.value;
                          setFieldValue("address", addressInput);
                          let addressAutocomplete;
                          if (addressInput.length > 0) {
                            addressAutocomplete = `${addressInput},${values.wards}, ${values.districts}, ${values.provinces}`;
                          } else addressAutocomplete = addressInput;
                          handlChangeAddressDebounced(addressAutocomplete);
                        }}
                        maxLength={40}
                        className={`rounded-md w-full px-3 py-1.5 flex-1 mb-3 text-sm ${
                          (loading ||
                            values.provinces.length == 0 ||
                            values.districts.length == 0 ||
                            values.wards.length == 0) &&
                          "opacity-55 cursor-not-allowed"
                        } ${errors.address && "border-red-500"} transition-all`}
                        type="text"
                        name="address"
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
                                      "address",
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

                    <ErrorMessage name="address" component="div">
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
                    <div className="flex gap-x-2 justify-end">
                      <LoadingButton
                        type="submit"
                        size="small"
                        className={`mt-2 px-4 py-1 rounded-md
                  bg-primary-color text-white self-end  hover:opacity-70 ${
                    (!dirty || loading) && "opacity-55"
                  } transition-all`}
                        loading={loading}
                        loadingIndicator={
                          <CircularProgress className="text-white" size={16} />
                        }
                        disabled={!dirty || loading}
                        variant="outlined"
                        onClick={submitForm}
                      >
                        <span className={`${loading && "text-primary-color"}`}>
                          {isUpdate ? "Cập nhật" : "Tạo mới"}
                        </span>
                      </LoadingButton>
                    </div>
                  </Form>
                </>
              );
            }}
          </Formik>
        }
      />
    </>
  );
};

export default AddressPage;
