"use client";
import { LoadingButton } from "@mui/lab";
import { CircularProgress } from "@mui/material";
import { ErrorMessage, Field, FieldInputProps, Form, Formik } from "formik";
import { useState, useRef, useEffect } from "react";
import ErrorIcon from "@mui/icons-material/Error";
import ShowHidePassword from "./ShowHidePassword";
import { redirect, useRouter } from "next/navigation";
import VerificationInput from "react-verification-input";
import Counter from "../Counter";
import { accountApi } from "../../apis/accountApi";
import { showToast } from "@/src/lib/toastify";
import { ResetPassword } from "@/src/models";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";

const RESEND_TIMEOUT = 60 * 1000; // 1 minute

const ResetPasswordComponent = () => {
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(true);
  const [tempEmail, setTempEmail] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(1);
  const otpFocusRef = useRef<HTMLInputElement | null>(null);
  const newPasswordFocusRef = useRef<HTMLInputElement | null>(null);
  const confirmNewPasswordFocusRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem("isNewPasswordVerifing");
      localStorage.removeItem("temp_email");
    }, 60 * 1000 * 5); // 5 minutes

    // Cleanup function to clear the timeout if the component unmounts before 3 minutes
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const verify = localStorage.getItem("isNewPasswordVerifing");
    let email = localStorage.getItem("temp_email");
    if (email) {
      setTempEmail(JSON.parse(email));
    }
    if (!verify) {
      router.push("/forgot-password");
      return;
    } else {
      setIsResetting(false);
    }
  }, []);

  useEffect(() => {
    // debugger;
    const sendTime = localStorage.getItem("sendTime-reset");
    if (sendTime) {
      const remainingTimeInMinutes = Number(
        ((RESEND_TIMEOUT - (Date.now() - Number(sendTime))) / 60000).toFixed(1)
      );
      // console.log(remainingTimeInMinutes);
      if (remainingTimeInMinutes > 0) {
        setCanResend(false);
        startCountdown(remainingTimeInMinutes);
      } else {
        setCanResend(true);
      }
    }
  }, []);

  const startCountdown = (duration: number) => {
    setCountdown(duration);
    const timer = setTimeout(() => {
      setCanResend(true);
      localStorage.removeItem("email");
      localStorage.removeItem("sendTime-reset");
    }, duration * 60000);

    return () => {
      clearTimeout(timer);
    };
  };

  if (isResetting) {
    return null; // or return a loading spinner
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleResendClick = async () => {
    if (isResending) return;
    // Disable the resend button
    // Send the code again
    // Your code to resend the code goes here
    // Enable the resend button after 1 minute
    setIsResending(true);
    if (canResend && tempEmail && tempEmail) {
      const resendEmail = await accountApi.forgotPassword({ email: tempEmail });
      if (resendEmail?.success) {
        localStorage.setItem("sendTime-reset", Date.now().toString());
        showToast("Đã gửi lại mã xác thực", "success");
      }
    }
    setCanResend(false);
    startCountdown(1);
    setIsResending(false);
  };

  return (
    <>
      <div className="bg-white shadow-md py-8 px-10 rounded-xl flex flex-col items-center relative z-10">
        <Link
          replace={true}
          href="/"
          className="absolute top-4 left-4 size-10 p-2 grid place-content-center
           rounded-full bg-[#8E71FF] cursor-pointer hover:opacity-55"
        >
          <HomeIcon sx={{ fill: "white" }} className="fill-white size-6" />
        </Link>
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-lg font-semibold">Đặt lại mật khẩu</h1>
        </div>
        <Formik<ResetPassword>
          initialValues={{
            email: tempEmail,
            otp: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validateOnChange={false}
          validateOnBlur={false}
          validate={(values) => {
            const errors: {
              otp?: string;
              newPassword?: string;
              confirmPassword?: string;
            } = {}; // Add type annotation for errors object
            if (!values.otp) {
              errors.otp = "Vui lòng nhập mã";
              if (otpFocusRef.current) {
                otpFocusRef.current.focus();
              }
              return errors;
            } else if (values.otp.trim().length !== 6) {
              errors.otp = "Mã không hợp lệ";
              if (otpFocusRef.current) {
                otpFocusRef.current.focus();
              }
              return errors;
            }
            if (!values.newPassword) {
              errors.newPassword = "Vui lòng nhập mật khẩu";
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
          onSubmit={async (values, { setFieldError }) => {
            setLoading(true);

            const result = await accountApi.resetPassword(values);
            if (result?.success) {
              showToast("Đổi mật khẩu thành công!", "success");
              localStorage.removeItem("isNewPasswordVerifing");
              localStorage.removeItem("temp_email");
            } else if (result?.message == "Invalid OTP or expired.") {
              setFieldError("otp", "Mã OTP không chính xác");
            }
            setLoading(false);
            router.push("/login");
          }}
        >
          {({ isSubmitting, errors }) => (
            <Form className="w-full flex flex-col ">
              {/* OTP Field */}
              <Field type="number" name="otp">
                {({ field }: { field: FieldInputProps<any> }) => (
                  <VerificationInput
                    {...field}
                    ref={otpFocusRef}
                    onBlur={() => {}}
                    placeholder=""
                    length={6}
                    autoFocus
                    validChars="0-9"
                    classNames={{
                      container: "verify-container",
                      character: "verify-character",
                      characterInactive: "verify-character-inactive",
                      characterSelected: "character--selected",
                      characterFilled: "character--filled",
                    }}
                    inputProps={{
                      inputMode: "numeric",
                      name: field.name,
                      onChange: (
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const value = event.target.value;
                        if (
                          (!value || /^\d+$/.test(value)) &&
                          value.length <= 6
                        ) {
                          field.onChange(event);
                        }
                      },
                      onBlur: field.onBlur,
                    }}
                  />
                )}
              </Field>
              <ErrorMessage name="otp" component="div">
                {(msg) => (
                  <div className="flex gap-x-1 items-center text-sm mb-4 justify-center text-red-500 animate-appear">
                    <ErrorIcon className="size-5" />
                    {msg}
                  </div>
                )}
              </ErrorMessage>
              <div className="w-full grid place-items-center mb-6">
                <button
                  type="button"
                  disabled={isResending}
                  onClick={canResend ? () => handleResendClick() : undefined}
                  className={`text-[#8E71FF] ${
                    canResend ? "hover:underline cursor-pointer" : "opacity-55"
                  } font-medium ${isResending ? "opacity-55" : ""}
                   text-sm text-center flex items-center justify-center`}
                >
                  <span className="animate-appear">
                    {canResend
                      ? "Chưa nhận được mã? Gửi lại"
                      : "Gửi lại mã sau"}
                  </span>
                  {!canResend && (
                    <>
                      <Counter minute={countdown} />
                    </>
                  )}
                </button>
              </div>

              {/*New Password Field */}
              <label
                className="py-1 px-0.5 text-sm font-semibold"
                htmlFor="newPassword"
              >
                Mật khẩu mới
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
                  name="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  innerRef={newPasswordFocusRef}
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
              <ErrorMessage name="newPassword" component="div">
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
                <div className="flex items-center justify-center">
                  <span className={`${isSubmitting && "text-[#8E71FF]"} pl-4`}>
                    Tạo mới
                  </span>
                </div>
              </LoadingButton>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default ResetPasswordComponent;
