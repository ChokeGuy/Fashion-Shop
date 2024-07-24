"use client";
import { logo } from "@/src/assests";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LoadingButton } from "@mui/lab";
import { ErrorMessage, Field, Form, Formik } from "formik";
import CircularProgress from "@mui/material/CircularProgress";
import HomeIcon from "@mui/icons-material/Home";
import ErrorIcon from "@mui/icons-material/Error";
import ShowHidePassword from "./ShowHidePassword";
import { fbImage, ggImage } from "@/src/constants/imageUrls";
import { LoginRequest, LoginResponse } from "@/src/models";
import { accountApi } from "../../apis/accountApi";
import { showToast } from "@/src/lib/toastify";
import { useRouter } from "next/navigation";
import { setTokens } from "@/src/utilities/tokenHandler";
import {
  FACEBOOK_AUTH_URL,
  GOOGLE_AUTH_URL,
} from "@/src/constants/oauth2-login";
import { Role } from "@/src/constants/role";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { selectUrl } from "@/src/lib/features/previous-url/previousUrlSlice";

const LoginComponent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitErrror, setSubmitError] = useState<string>("");
  const [fbLoading, setFbLoading] = useState(false);
  const [ggLoading, setGgLoading] = useState(false);
  const emailFocusRef = useRef<HTMLInputElement | null>(null);
  const passwordFocusRef = useRef<HTMLInputElement | null>(null);
  const previousUrl = useAppSelector(selectUrl);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setFbLoading(false);
        setGgLoading(false);
        setLoading(false);
        emailFocusRef.current?.focus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleSocialLogin = (name: string) => {
    if (name === "facebook") {
      setFbLoading(true);
      window.location.href = FACEBOOK_AUTH_URL;
    }
    // Add your social login logic here
    else {
      setGgLoading(true);
      window.location.href = GOOGLE_AUTH_URL;
    }

    setLoading(true);
  };

  const navigateByRole = (role: Role) => {
    return role == "CUSTOMER"
      ? previousUrl
      : role == "ADMIN"
      ? "/admin"
      : "/shipper";
  };

  return (
    <>
      <div className="bg-white shadow-md py-8 px-10 rounded-xl flex flex-col items-center justify-center gap-y-4 relative z-10">
        <Link
          replace={true}
          href="/"
          className="absolute top-6 left-6 size-10 p-2 grid place-content-center
           rounded-full bg-[#8E71FF] cursor-pointer hover:opacity-55"
        >
          <HomeIcon sx={{ fill: "white" }} className="fill-white size-6" />
        </Link>
        <div>
          <Link href="/">
            <Image
              width={60}
              height={60}
              className="size-full object-cover object-center z-0"
              src={logo}
              alt="logo"
            ></Image>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold">Đăng Nhập Tài Khoản</h1>
          <p className="font-medium text-base text-gray-500">
            Chào mừng quý khách quay trở lại !
          </p>
        </div>
        <div className="pt-4 flex gap-x-3 w-full">
          <div>
            <LoadingButton
              startIcon={
                <Image
                  blurDataURL={fbImage}
                  width={30}
                  height={30}
                  className="size-6 object-cover object-center z-0"
                  src={fbImage}
                  alt="fb-icon"
                ></Image>
              }
              disabled={loading}
              size="small"
              className={`border border-gray-300 px-4 py-1 space-x-2 rounded-md hover:bg-[rgba(0,0,0,0.1)] ${
                loading && "opacity-55"
              }`}
              onClick={() => handleSocialLogin("facebook")}
              loading={fbLoading}
              loadingPosition="start"
              variant="outlined"
            >
              <span className="text-sm w-24 text-left">Facebook</span>
            </LoadingButton>
          </div>

          <div>
            <LoadingButton
              startIcon={
                <Image
                  blurDataURL={ggImage}
                  width={30}
                  height={30}
                  className="size-6 object-cover object-center z-0"
                  src={ggImage}
                  alt="gg-icon"
                ></Image>
              }
              disabled={loading}
              size="small"
              className={`border border-gray-300 px-4 py-1 space-x-2 rounded-md hover:bg-[rgba(0,0,0,0.1)] ${
                loading && "opacity-55"
              }`}
              onClick={() => handleSocialLogin("google")}
              loading={ggLoading}
              loadingPosition="start"
              variant="outlined"
            >
              <span className="text-sm w-24 text-left">Google</span>
            </LoadingButton>
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <span className="left-right-line text-sm text-center w-full">
            Hoặc
          </span>
        </div>
        <Formik<LoginRequest & { general?: string }>
          initialValues={{
            email: "",
            password: "",
          }}
          validateOnChange={false}
          validateOnBlur={false}
          validate={(values) => {
            const errors: {
              email?: string;
              password?: string;
              general?: string;
            } = {}; // Add type annotation for errors object
            if (!values.email) {
              errors.email = "Vui lòng nhập email";
              emailFocusRef.current?.focus();
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = "email không hợp lệ";
              emailFocusRef.current?.focus();
            } else if (!values.password) {
              errors.password = "Vui lòng nhập mật khẩu";
              passwordFocusRef.current?.focus();
            }
            return errors;
          }}
          onSubmit={async (values, { setFieldError }) => {
            setLoading(true);
            const result = await accountApi.login(values);
            if (
              result?.message === "Account does not exist" ||
              result?.statusCode == 404
            ) {
              setLoading(false);
              setFieldError(
                "email",
                "Tài khoản này không tồn tại hoặc bị khóa"
              );
              return;
            } else if (
              result?.message === "Invalid input data" ||
              result?.statusCode === 500
            ) {
              setLoading(false);
              setSubmitError("Tài khoản hoặc mật khẩu chưa chính xác");
              return;
            }
            const { accessToken, refreshToken, role } =
              result?.result as LoginResponse;
            // Add your login logic here
            setSubmitError("");
            setTokens(accessToken, refreshToken);
            showToast("Đăng nhập thành công", "success");

            //Navigate user to the correct route based on their role
            const route = navigateByRole(role);
            router.replace(route);
            setLoading(false);
          }}
        >
          {({ isSubmitting, errors }) => (
            <Form className="w-full flex flex-col">
              {submitErrror.length > 0 && (
                <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                  <div
                    className="flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                    "
                  >
                    <ErrorIcon className="size-5" />
                    {submitErrror}
                  </div>
                </div>
              )}
              {/* email Field */}
              <label
                className="py-1 px-0.5 text-sm font-semibold"
                htmlFor="email"
              >
                Tài khoản email
              </label>
              <Field
                disabled={loading}
                className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                  loading && "opacity-55"
                } ${errors.email && "border-red-500"} transition-all`}
                type="email"
                name="email"
                placeholder="Nhập tài khoản email của bạn..."
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

              {/* Password Field */}
              <label
                className="py-1 px-0.5 text-sm font-semibold"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Field
                  disabled={loading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                    loading && "opacity-55"
                  } ${
                    errors.password && "border-red-500"
                  } w-full transition-all`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu của bạn..."
                  innerRef={passwordFocusRef}
                />
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
              <ErrorMessage className="mb-3" name="password" component="div">
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
                className={`mt-2 px-4 py-1 rounded-md
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
                <span className={`${isSubmitting && "text-[#8E71FF]"}`}>
                  Đăng Nhập
                </span>
              </LoadingButton>
            </Form>
          )}
        </Formik>
      </div>
      <div className="bg-[#F7F7F7] shadow-md absolute top-0 bottom-[-96px] flex items-end right-0 left-0 rounded-xl">
        <div className="w-full flex flex-col items-center justify-center text-sm font-medium">
          <div className="w-full p-3 text-center border-b border-border-color">
            <span>Quên mật khẩu? </span>
            <Link replace={true} href="/forgot-password">
              <span className="text-[#8E71FF] text-base hover:opacity-70 font-semibold">
                Tại đây
              </span>
            </Link>
          </div>
          <div className="w-full p-3 text-center">
            <span>Chưa có tài khoản? </span>
            <Link replace={true} href="/register">
              <span className="text-[#8E71FF] text-base hover:opacity-70 font-semibold">
                Đăng ký
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginComponent;
