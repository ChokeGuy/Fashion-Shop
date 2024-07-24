"use client";

import { LoadingButton } from "@mui/lab";
import { CircularProgress } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorIcon from "@mui/icons-material/Error";
import { accountApi } from "../../apis/accountApi";
import Link from "next/link";

export default function ForgotPasswordComponent() {
  const [loading, setLoading] = useState(false);
  const emailFocusRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    emailFocusRef.current?.focus();
  }, []);

  return (
    <div className="bg-white shadow-md py-8 px-10 rounded-xl flex flex-col items-center relative z-10">
      <Link
        replace={true}
        href="/login"
        className="absolute top-4 left-4 size-10 p-2 grid place-content-center
           rounded-full bg-[#8E71FF] cursor-pointer hover:opacity-55"
      >
        <ArrowBackIcon sx={{ fill: "white" }} className="fill-white size-6" />
      </Link>
      <div className="flex flex-col items-center gap-y-1 mb-6">
        <h1 className="text-lg font-semibold">Quên mật khẩu</h1>
        <p className="font-medium text-sm text-gray-500">
          Bạn quên mật khẩu? Làm mới mật khẩu ngay
        </p>
      </div>
      <Formik
        initialValues={{
          email: "",
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validate={(values) => {
          const errors: {
            email?: string;
          } = {}; // Add type annotation for errors object
          if (!values.email) {
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
        }}
        onSubmit={async (values, { setFieldError }) => {
          setLoading(true);
          const response = await accountApi.forgotPassword({
            email: values.email,
          });

          //Not found account in application
          if (response?.statusCode === 404) {
            setLoading(false);
            setFieldError("email", "Tài khoản không tồn tại");
            return;
          }
          setLoading(false);
          localStorage.setItem("sendTime-reset", Date.now().toString());
          localStorage.setItem("isNewPasswordVerifing", "true");
          localStorage.setItem("temp_email", JSON.stringify(values.email));
          router.push("/forgot-password/verify");
        }}
      >
        {({ isSubmitting, errors }) => (
          <Form className="w-full flex flex-col ">
            {/* Email Field */}
            <Field
              disabled={loading}
              className={`rounded-md px-3 py-1.5 mb-2 text-sm ${
                loading && "opacity-55"
              } ${errors.email && "border-red-500"} transition-all`}
              type="email"
              name="email"
              placeholder="Nhập tài khoản email của bạn"
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
            <LoadingButton
              type="submit"
              size="small"
              className={`px-4 py-1 rounded-md mt-3
              bg-[#8E71FF] text-white hover:opacity-70 ${
                loading && "opacity-55"
              } transition-all`}
              loading={isSubmitting}
              loadingIndicator={
                <CircularProgress className="text-white" size={16} />
              }
              disabled={loading}
              variant="outlined"
            >
              <span className={`${isSubmitting && "text-[#8E71FF]"} pl-4`}>
                Xác nhận
              </span>
            </LoadingButton>
          </Form>
        )}
      </Formik>
    </div>
  );
}
