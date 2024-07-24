"use client";
import { LoadingButton } from "@mui/lab";
import { CircularProgress } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Link from "next/link";
import ShowHidePassword from "./ShowHidePassword";
import { fbImage, ggImage } from "@/src/constants/imageUrls";
import { useRouter } from "next/navigation";
import { RegisterRequest } from "@/src/models";
import { accountApi } from "../../apis/accountApi";
import HomeIcon from "@mui/icons-material/Home";
import {
  FACEBOOK_AUTH_URL,
  GOOGLE_AUTH_URL,
} from "@/src/constants/oauth2-login";
import { showToast } from "@/src/lib/toastify";
import Counter from "../Counter";

interface RegisterProps {
  // Add any props you need for the LoginComponent
}

const RESEND_TIMEOUT = 60 * 1000; // 1 minute

const RegisterComponent: React.FC<RegisterProps> = () => {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [ggLoading, setGgLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendOTPLoading, setSendOTPLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [localEmail, setLocalEmail] = useState("");
  const [countdown, setCountdown] = useState(1);
  const emailFocusRef = useRef<HTMLInputElement | null>(null);
  const passwordFocusRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordFocusRef = useRef<HTMLInputElement | null>(null);
  const fullnameFocusRef = useRef<HTMLInputElement | null>(null);
  const phoneFocusRef = useRef<HTMLInputElement | null>(null);
  const otpFocusRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setFbLoading(false);
        setGgLoading(false);
        setLoading(false);
        fullnameFocusRef.current?.focus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // debugger;
    const sendTime = localStorage.getItem("sendTime");
    const email = localStorage.getItem("email");
    if (sendTime) {
      const remainingTimeInMinutes = Number(
        ((RESEND_TIMEOUT - (Date.now() - Number(sendTime))) / 60000).toFixed(1)
      );
      // console.log(remainingTimeInMinutes);
      if (remainingTimeInMinutes > 0) {
        setCanResend(false);
        setLocalEmail(email || "");
        startCountdown(remainingTimeInMinutes);
      } else {
        setCanResend(true);
      }
    }
  }, []);

  // useEffect(() => {
  //   if (canResend) {
  //     startCountdown(1);
  //   }
  // }, [canResend]);

  const startCountdown = (duration: number) => {
    setCountdown(duration);
    const timer = setTimeout(() => {
      setCanResend(true);
      localStorage.removeItem("email");
      localStorage.removeItem("sendTime");
    }, duration * 60000);

    return () => {
      clearTimeout(timer);
    };
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);
  const handleMouseDownConfirmPassword = (
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

  const handleSendOTP = async (
    email: string,
    setFieldError: (field: string, message: string | undefined) => void
  ) => {
    setFieldError("otp", "");
    if (!email || email === "") {
      setFieldError("email", "Vui lòng nhập email");
      emailFocusRef.current?.focus();
      return;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      emailFocusRef.current?.focus();
      setFieldError("email", "Email không hợp lệ");
      return;
    }

    setSendOTPLoading(true);
    const sendEmail = await accountApi.sendVerifyEmail(email);
    if (
      sendEmail?.message ==
      "This email is already authenticated, you do not need to authenticate it"
    ) {
      setFieldError("email", "Email này đã được sử dụng");
      // setCanResend(false);
      setSendOTPLoading(false);
      return;
    } else if (sendEmail?.statusCode === 400) {
      setFieldError(
        "email",
        `Email này đã gửi xác thực, vui lòng thử lại sau ${sendEmail.result} giây`
      );
      setCanResend(false);
      setSendOTPLoading(false);
      return;
    }

    if (sendEmail?.success) {
      setFieldError("email", "");

      localStorage.setItem("email", email);
      localStorage.setItem("sendTime", Date.now().toString());
      setCanResend(false);
      setCountdown(1);
      startCountdown(1);
      showToast("Gửi mã xác thực thành công", "success", "top-right");
      setSendOTPLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow-md py-8 px-10 rounded-xl flex flex-col items-center relative z-10">
        <Link
          href="/"
          className="absolute top-4 left-4 size-10 p-2 grid place-content-center
           rounded-full bg-[#8E71FF] cursor-pointer hover:opacity-55"
        >
          <HomeIcon sx={{ fill: "white" }} className="fill-white size-6" />
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold">Đăng Ký Tài Khoản</h1>
          <p className="font-medium text-base text-gray-500">
            Chào mừng! Điền thông tin để tạo tài khoản.
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
          </div>{" "}
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
              className={`w-full border border-gray-300 px-4 py-1 space-x-2 rounded-md hover:bg-[rgba(0,0,0,0.1)] ${
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
        <div className="pt-4 w-full flex justify-center items-center">
          <span className="left-right-line text-sm text-center w-full">
            Hoặc
          </span>
        </div>
        <Formik<RegisterRequest>
          initialValues={{
            fullname: "",
            phone: "",
            email: localEmail,
            otp: "",
            password: "",
            confirmPassword: "",
          }}
          enableReinitialize={true}
          validateOnChange={false}
          validateOnBlur={false}
          validate={(values) => {
            const errors: {
              fullname?: string;
              phone?: string;
              email?: string;
              otp?: string;
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

            if (values.otp.length == 0) {
              errors.otp = "Vui lòng gửi mã xác thực";
              otpFocusRef.current?.focus();
              return errors;
            } else if (values.otp.length < 6) {
              errors.otp = "Mã xác thực không hợp lệ";
              otpFocusRef.current?.focus();
              return errors;
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
                errors.password = "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
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
            setLoading(true);
            setSubmitLoading(true);

            const request = await accountApi.register(values);
            if (request?.message == "Email already in use") {
              setLoading(false);
              setSubmitLoading(false);
              setFieldError("email", "Email này đã tồn tại");
              return;
            }
            if (
              request?.message ==
              "This email is already authenticated, you do not need to authenticate it"
            ) {
              setLoading(false);
              setSubmitLoading(false);
              setFieldError("email", "Email này đã được sử dụng");
              return;
            } else if (request?.message == "Phone number already in use") {
              setLoading(false);
              setSubmitLoading(false);
              setFieldError("phone", "Số điện thoại này đã tồn tại");
              return;
            } else if (request?.message == "Invalid OTP or expired.") {
              setLoading(false);
              setSubmitLoading(false);
              setFieldError("otp", "Mã xác thực không hợp lệ hoặc đã hết hạn");
              return;
            }
            showToast("Đăng ký thành công", "success", "top-right");
            setLoading(false);
            setSubmitLoading(false);
            router.replace("/login");
          }}
        >
          {({ values, errors, setFieldValue, setFieldError }) => (
            <Form className="w-full flex flex-col ">
              {/* fullname Field */}
              <label
                className="py-1 px-0.5 text-sm font-semibold"
                htmlFor="fullname"
              >
                Họ và Tên
              </label>
              <Field
                disabled={loading}
                className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                  loading && "opacity-55"
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
                disabled={loading}
                className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                  loading && "opacity-55"
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
                disabled={loading}
                className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                  loading && "opacity-55"
                } ${errors.email && "border-red-500"} transition-all`}
                type="text"
                name="email"
                placeholder="Nhập tài khoản email"
                innerRef={emailFocusRef}
              />
              <ErrorMessage className="mb-3" name="email" component="div">
                {(msg) => (
                  <div className="border border-red-500 bg-red-100 px-4 py-1 rounded-md">
                    <div
                      className="w-[19rem] flex gap-x-2 items-center text-sm justify-center text-red-500 animate-appear
                    "
                    >
                      <ErrorIcon className="size-5" />
                      {msg}
                    </div>
                  </div>
                )}
              </ErrorMessage>

              {/* OTP Field */}
              <div className="relative">
                <label
                  className="py-1 px-0.5 text-sm font-semibold"
                  htmlFor="otp"
                >
                  Mã xác thực
                </label>
                <Field
                  disabled={loading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm ${
                    loading && "opacity-55"
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
                  } top-[1.75rem] ${loading && "opacity-55"} `}
                >
                  <LoadingButton
                    type="button"
                    size="small"
                    onClick={() => handleSendOTP(values.email, setFieldError)}
                    className={`text-[#8E71FF] hover:opacity-70 ${
                      loading && "opacity-55"
                    } transition-all`}
                    loading={sendOTPLoading}
                    loadingIndicator={
                      <CircularProgress className="text-text-color" size={16} />
                    }
                    disabled={loading || sendOTPLoading || !canResend}
                    variant="outlined"
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className={`${sendOTPLoading && "text-white"} ${
                          !canResend && countdown > 0 && "opacity-55"
                        }`}
                      >
                        Gửi{" "}
                        {!canResend && countdown > 0 && (
                          <> lại({<Counter minute={countdown} />})</>
                        )}
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
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm  ${
                    loading && "opacity-55"
                  } ${
                    errors.password && "border-red-500"
                  } w-full transition-all`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
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
              <div className="relative">
                <Field
                  disabled={loading}
                  className={`rounded-md px-3 py-1.5 mb-3 text-sm  ${
                    loading && "opacity-55"
                  } ${
                    errors.confirmPassword && "border-red-500"
                  } w-full transition-all`}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  innerRef={confirmPasswordFocusRef}
                />

                <div
                  className={`absolute right-2 top-1 ${
                    loading && "opacity-55"
                  } `}
                >
                  <ShowHidePassword
                    disabled={loading}
                    showPassword={showConfirmPassword}
                    click={handleClickShowConfirmPassword}
                    mousedownPassword={handleMouseDownConfirmPassword}
                  />
                </div>
              </div>

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

              <LoadingButton
                type="submit"
                size="small"
                className={`mt-2 px-4 py-1 rounded-md
               bg-[#8E71FF] text-white hover:opacity-70 ${
                 loading && "opacity-55"
               } transition-all`}
                loading={submitLoading}
                loadingIndicator={
                  <CircularProgress className="text-white" size={16} />
                }
                disabled={loading}
                variant="outlined"
              >
                <div className="flex items-center justify-center">
                  <span className={`${submitLoading && "text-[#8E71FF]"} pl-4`}>
                    Đăng Ký
                  </span>
                  <ArrowRightIcon
                    className={`text-white size-5 ${
                      submitLoading && "hidden"
                    } transition-all`}
                  />
                </div>
              </LoadingButton>
            </Form>
          )}
        </Formik>
      </div>
      <div className="w-full flex gap-x-2 items-center p-4 justify-center text-sm font-medium text-white">
        <span>Đã có tài khoản?</span>
        <Link replace={true} href="/login">
          <span className="text-base hover:opacity-70 font-semibold">
            Đăng nhập
          </span>
        </Link>
      </div>
    </>
  );
};

export default RegisterComponent;
