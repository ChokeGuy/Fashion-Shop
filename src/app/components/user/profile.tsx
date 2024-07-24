"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import ErrorIcon from "@mui/icons-material/Error";
import InputFileUpload from "../FileUploadInput";
import Avatar from "@mui/material/Avatar";
import { KeyString, UserProfile } from "@/src/models";
import { selectUser, setUserProfile } from "@/src/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { userApi } from "../../apis/userApi";
import { showToast } from "@/src/lib/toastify";
import isLeapYear from "dayjs/plugin/isLeapYear"; // import plugin
import dayjs from "dayjs";
import { set } from "lodash";

dayjs.extend(isLeapYear); // use plugin
dayjs.locale("en"); // use locale

const ProfilePage = memo(() => {
  const [loading, setLoading] = useState(false);
  const userInfo = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [userAvatar, setUserAvatar] = useState<string | File>("");
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const fullNameFocusRef = useRef<HTMLInputElement | null>(null);
  const phoneFocusRef = useRef<HTMLInputElement | null>(null);
  const dobFocusRef = useRef<HTMLInputElement | null>(null);
  const avatarFocusRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    setUserAvatar(userInfo.avatar ?? "");
  }, [userInfo]);

  const getChangedUserInfo = (values: UserProfile & KeyString): UserProfile => {
    let updatedUserInfo: UserProfile & KeyString = {};
    let userForLoop: UserProfile & KeyString = {
      fullname: userInfo.fullname,
      phone: userInfo.phone,
      dob: userInfo.dob && dayjs(userInfo.dob).format("YYYY/MM/DD"),
      gender: userInfo.gender,
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
    return updatedUserInfo;
  };

  return (
    <div className="col-span-full border border-border-color md:col-span-8 lg:col-span-8 bg-white rounded-xl shadow-sm">
      <div className="w-full p-6">
        <h2 className="text-2xl font-semibold mb-4">Thông tin cá nhân</h2>
        <Formik<UserProfile>
          enableReinitialize={true}
          initialValues={{
            fullname: userInfo.fullname,
            phone: userInfo.phone,
            avatar: userAvatar,
            dob: dayjs(userInfo.dob ?? null).format("YYYY-MM-DD"),
            gender: userInfo.gender,
            addresses: userInfo.addresses,
          }}
          validateOnBlur={false}
          validateOnChange={false}
          validate={(values) => {
            const errors: Omit<UserProfile, "address"> = {
              fullname: "",
              phone: "",
              avatar: "",
              dob: undefined,
              gender: "",
            };
            //Validate fullname
            if (values.fullname!.length < 1) {
              errors.fullname = "Tên không được để trống";
              fullNameFocusRef.current?.focus();
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
          onSubmit={async (values, { setFieldError, setSubmitting }) => {
            setLoading(true);
            setSubmitting(true);
            //Get the values which was changed by user
            const changedValues = getChangedUserInfo(values);
            const response = await userApi.updateUserProfile(changedValues);
            if (response?.success) {
              showToast(
                "Cập nhật thông tin thành công",
                "success",
                "top-right"
              );
              setUserAvatar("");
              dispatch(setUserProfile(response.result));
            } else if (response?.message == "Phone number already in use") {
              showToast("Số điện thoại đã tồn tại", "error", "top-right");
              setTimeout(() => {
                setFieldError("phone", "Số điện thoại đã tồn tại");
                setUserAvatar(userInfo.avatar ?? "");
              }, 100);
              phoneFocusRef.current?.focus();
            } else {
              showToast(
                "Có lỗi xảy ra, vui lòng thử lại",
                "error",
                "top-right"
              );
              setUserAvatar(userInfo.avatar ?? "");
            }
            setIsUpload(false);
            setLoading(false);
            setSubmitting(false);
          }}
        >
          {({
            isSubmitting,
            errors,
            values,
            submitForm,
            dirty,
            resetForm,
            setFieldValue,
          }) => (
            <Form className="flex flex-col">
              <div className="flex flex-col items-center justify-center gap-y-4">
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
                      className="size-20 rounded-full border border-primary-color"
                      src={values.avatar as string}
                    ></Avatar>
                  ) : (
                    <Avatar className="size-20">
                      {(values.fullname && values.fullname[0].toUpperCase()) ||
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
                      disabled={loading}
                      ref={fileRef}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                  disabled={loading}
                  innerRef={fullNameFocusRef}
                  className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                    loading && "opacity-55"
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
                  htmlFor="email"
                >
                  Email
                </label>
                <Field
                  disabled={true}
                  readOnly={true}
                  value={userInfo.email}
                  innerRef={fullNameFocusRef}
                  className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm transition-all opacity-55`}
                  type="text"
                  id="email"
                  name="email"
                />
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
              <div className="flex flex-col gap-x-2">
                <label
                  className="py-1 px-0.5 text-sm font-semibold"
                  htmlFor="dob"
                >
                  Ngày sinh
                </label>
                <Field
                  value={values.dob}
                  disabled={loading}
                  innerRef={dobFocusRef}
                  className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                    loading && "opacity-55"
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
              <div className="flex gap-x-2 items-center justify-end">
                {dirty && (
                  <button
                    disabled={loading}
                    type="reset"
                    onClick={() => {
                      resetForm();
                      setFieldValue("avatar", userInfo.avatar ?? "");
                      setUserAvatar(userInfo.avatar ?? "");
                      setIsUpload(false);

                      // Thêm dòng này để "reset" input file
                      if (fileRef.current) {
                        fileRef.current.value = "";
                      }
                    }}
                    className={`mt-2 px-4 py-1 rounded-md
                      bg-primary-color text-white self-end  hover:opacity-70 ${
                        loading && "opacity-55"
                      } transition-all animate-appear`}
                  >
                    Đặt lại
                  </button>
                )}

                <LoadingButton
                  type="submit"
                  size="small"
                  className={`mt-2 px-4 py-1 rounded-md
                    bg-primary-color text-white self-end  hover:opacity-70 ${
                      ((!dirty && !isUpload) || loading) && "opacity-55"
                    } transition-all`}
                  loading={isSubmitting}
                  loadingIndicator={
                    <CircularProgress className="text-white" size={16} />
                  }
                  disabled={(!dirty && !isUpload) || loading}
                  variant="outlined"
                  onClick={submitForm}
                >
                  <span className={`${isSubmitting && "text-primary-color"}`}>
                    Cập nhật
                  </span>
                </LoadingButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
});

export default ProfilePage;
