"use client";
import { showToast } from "@/src/lib/toastify";
import { LoadingButton } from "@mui/lab";
import { CircularProgress } from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import React, { useRef, useState } from "react";
import ErrorIcon from "@mui/icons-material/Error";
import ShowHidePassword from "../guest/ShowHidePassword";
import { ChangePassword, SingleResponse } from "@/src/models";
import { userApi } from "../../apis/userApi";
import { deleteTokens } from "@/src/utilities/tokenHandler";
import { useRouter } from "next/navigation";
import { replace } from "lodash";
import { getCookie } from "cookies-next";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { getUserProfileAsync } from "@/src/lib/features/user/userSlice";
import { getAllCartItemsAsync } from "@/src/lib/features/cart/cartSlice";
import { getUserAddressAsync } from "@/src/lib/features/address/addressSlice";
import { getUserNotifications } from "@/src/lib/features/notification/notificationSlice";

const ChangePasswordPage = () => {
  const { replace } = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const currentPasswordFocusRef = useRef<HTMLInputElement | null>(null);
  const newPasswordFocusRef = useRef<HTMLInputElement | null>(null);
  const confirmNewPasswordFocusRef = useRef<HTMLInputElement | null>(null);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="col-span-full border border-border-color md:col-span-8 lg:col-span-8 bg-white rounded-xl shadow-sm">
        <div className="w-full p-6 h-[587px]">
          <h2 className="text-2xl font-semibold mb-4">Địa chỉ liên lạc</h2>
          <Formik<ChangePassword>
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validateOnChange={false}
            validateOnBlur={false}
            validate={(values) => {
              const errors: {
                currentPassword?: string;
                newPassword?: string;
                confirmPassword?: string;
              } = {}; // Add type annotation for errors object
              if (!values.currentPassword || values.currentPassword === "") {
                errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
                currentPasswordFocusRef.current?.focus();
                return errors;
              }
              if (!values.newPassword) {
                errors.newPassword = "Vui lòng nhập mật khẩu mới";
                newPasswordFocusRef.current?.focus();
                return errors;
              } else {
                if (values.newPassword.length < 8) {
                  errors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
                  newPasswordFocusRef.current?.focus();
                  return errors;
                }
                if (!/[a-z]/.test(values.newPassword)) {
                  errors.newPassword =
                    "Mật khẩu phải chứa ít nhất 1 ký tự thường";
                  newPasswordFocusRef.current?.focus();
                  return errors;
                }
                if (!/[A-Z]/.test(values.newPassword)) {
                  errors.newPassword = "Mật khẩu phải chứa ít nhất 1 ký tự hoa";
                  newPasswordFocusRef.current?.focus();
                  return errors;
                }
                if (!/\d/.test(values.newPassword)) {
                  errors.newPassword = "Mật khẩu phải chứa ít nhất 1 chữ số";
                  newPasswordFocusRef.current?.focus();
                  return errors;
                }
                if (!/[@$!%*?&]/.test(values.newPassword)) {
                  errors.newPassword =
                    "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
                  newPasswordFocusRef.current?.focus();
                  return errors;
                }
              }
              if (!values.confirmPassword) {
                errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
                confirmNewPasswordFocusRef.current?.focus();
                return errors;
              } else if (values.confirmPassword !== values.newPassword) {
                errors.confirmPassword = "Mật khẩu không khớp";
                confirmNewPasswordFocusRef.current?.focus();
                return errors;
              }
            }}
            onSubmit={async (values, { setFieldError, setSubmitting }) => {
              setLoading(true);
              setSubmitting(true);
              const response = await userApi.changeUserPassword(values);
              if (
                ("message" in response! &&
                  response?.message ===
                    "You entered current password incorrectly") ||
                ("status" in response! && response?.status === 400)
              ) {
                setFieldError(
                  "currentPassword",
                  "Mật khẩu hiện tại không chính xác"
                );
                setSubmitting(false);
                setLoading(false);
                return;
              }
              setSubmitting(false);
              setLoading(false);
              const refreshToken = getCookie("refreshToken");
              if (refreshToken) {
                await userApi.logout({ refreshToken });
                dispatch(getUserProfileAsync());
                dispatch(getAllCartItemsAsync());
                dispatch(getUserAddressAsync());
                dispatch(getUserNotifications());
              }

              showToast("Đổi mật khẩu thành công", "success");

              deleteTokens();

              replace("/login");
            }}
          >
            {({ errors, dirty, isSubmitting }) => (
              <Form className="w-full flex flex-col ">
                {/* Current Password Field */}
                <label
                  className="py-1 px-0.5 text-sm font-semibold"
                  htmlFor="currentPassword"
                >
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Field
                    disabled={loading}
                    className={`rounded-md px-3 py-1.5 mb-3 text-sm  ${
                      loading && "opacity-55"
                    } ${
                      errors.newPassword && "border-red-500"
                    } w-full transition-all`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại"
                    name="currentPassword"
                    innerRef={currentPasswordFocusRef}
                  ></Field>
                  <div
                    className={`absolute right-2 top-1 ${
                      loading && "opacity-55"
                    } `}
                  >
                    <ShowHidePassword
                      disabled={loading}
                      showPassword={showPassword}
                      click={handleClickShowPassword}
                      mousedownPassword={handleMouseDownPassword}
                    />
                  </div>
                </div>
                <ErrorMessage name="currentPassword" component="div">
                  {(msg) => (
                    <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md mb-1">
                      <div
                        className="flex gap-x-2 items-center text-sm justify-start text-red-500 animate-appear
                    "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    </div>
                  )}
                </ErrorMessage>

                {/*New Password Field */}
                <label
                  className="py-1 px-0.5 text-sm font-semibold"
                  htmlFor="newPassword"
                >
                  Mật khẩu mới
                </label>
                <Field
                  disabled={loading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm  ${
                    loading && "opacity-55"
                  } ${
                    errors.newPassword && "border-red-500"
                  } w-full transition-all`}
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  innerRef={newPasswordFocusRef}
                />
                <ErrorMessage name="newPassword" component="div">
                  {(msg) => (
                    <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                      <div
                        className="flex gap-x-2 items-center text-sm justify-start text-red-500 animate-appear
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
                  disabled={loading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm  ${
                    loading && "opacity-55"
                  } ${
                    errors.confirmPassword && "border-red-500"
                  } w-full transition-all`}
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  innerRef={confirmNewPasswordFocusRef}
                />
                <ErrorMessage name="confirmPassword" component="div">
                  {(msg) => (
                    <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md mb-1">
                      <div
                        className="flex gap-x-2 items-center text-sm justify-start text-red-500 animate-appear
                    "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    </div>
                  )}
                </ErrorMessage>

                <LoadingButton
                  type="submit"
                  size="small"
                  className={`mt-2 px-4 py-1 rounded-md
                    bg-primary-color text-white self-end  hover:opacity-70 ${
                      (!dirty || loading) && "opacity-55"
                    } transition-all`}
                  loading={isSubmitting}
                  loadingIndicator={
                    <CircularProgress className="text-white" size={16} />
                  }
                  disabled={!dirty || loading}
                  variant="outlined"
                >
                  <span className={`${isSubmitting && "text-primary-color"}`}>
                    Đổi
                  </span>
                </LoadingButton>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPage;
