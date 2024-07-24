// "use client";
// import { LoadingButton } from "@mui/lab";
// import { CircularProgress } from "@mui/material";
// import ErrorIcon from "@mui/icons-material/Error";
// import { ErrorMessage, Field, FieldInputProps, Form, Formik } from "formik";
// import VerificationInput from "react-verification-input";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import Counter from "../Counter";
// import { accountApi } from "../../apis/accountApi";
// import { RegisterVerifyOTP } from "@/src/models";
// import { showToast } from "@/src/lib/toastify";
// import { account } from "@/src/assests";

// export default function VerifyEmailComponent() {
//   const [loading, setLoading] = useState(false);
//   const [isVerifying, setIsVerifying] = useState(true);
//   const [canResend, setCanResend] = useState(false);
//   const [tempInfo, setTempInfo] = useState<any>(null);
//   const otpFocusRef = useRef<HTMLInputElement | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       localStorage.removeItem("isVerifing");
//       localStorage.removeItem("temp_info");
//     }, 60 * 1000 * 5); // 5 minutes

//     // Cleanup function to clear the timeout if the component unmounts before 1 minutes
//     return () => {
//       clearTimeout(timer);
//     };
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setCanResend(true);
//     }, 60 * 1000 * 1); // 1 minutes

//     // Cleanup function to clear the timeout if the component unmounts before 1 minute
//     return () => {
//       // let info = localStorage.getItem("temp_info");
//       // if (info) {
//       //   accountApi
//       //     .deleteUnverifyAccount(JSON.parse(info || "").email)
//       //     .then((res) => console.log(res))
//       //     .catch((error) => console.log(error));
//       // }

//       clearTimeout(timer);
//     };
//   }, [canResend]);

//   useEffect(() => {
//     const verify = localStorage.getItem("isVerifing");
//     let info = localStorage.getItem("temp_info");
//     if (info) {
//       setTempInfo(JSON.parse(info));
//     }
//     if (!verify) {
//       router.push("/register");
//     } else {
//       setIsVerifying(false);
//     }
//   }, []);

//   if (isVerifying) {
//     return null; // or return a loading spinner
//   }

//   const handleResendClick = async () => {
//     // Disable the resend button
//     // Send the code again
//     // Your code to resend the code goes here
//     // Enable the resend button after 2 minutes
//     if (canResend && tempInfo && tempInfo.email) {
//       const resendEmail = await accountApi.sendVerifyEmail(tempInfo.email);
//       if (resendEmail?.success) {
//         showToast("Đã gửi lại mã xác thực", "success");
//       }
//     }
//     setCanResend(false);
//   };

//   return (
//     <>
//       <div className="bg-white shadow-md py-8 px-10 rounded-xl flex flex-col items-center relative z-10">
//         <div className="flex flex-col items-center gap-y-1 mb-6">
//           <h1 className="text-lg font-semibold">Xác thực tài khoản</h1>
//           <p className="font-medium text-sm text-gray-500">
//             Nhập mã xác thực đã được gửi đến email của bạn
//           </p>
//           <span className="text-sm text-gray-500">
//             {tempInfo && tempInfo.email}
//           </span>
//         </div>
//         <Formik<RegisterVerifyOTP>
//           initialValues={{
//             email: (tempInfo && tempInfo.email) || "",
//             otp: "",
//           }}
//           validateOnChange={false}
//           validateOnBlur={false}
//           validate={(values) => {
//             const errors: {
//               otp?: string;
//             } = {}; // Add type annotation for errors object
//             if (!values.otp) {
//               errors.otp = "Vui lòng nhập mã";
//               otpFocusRef.current?.focus();
//             } else if (values.otp.trim().length !== 6) {
//               errors.otp = "Mã không hợp lệ";
//               otpFocusRef.current?.focus();
//             }
//             return errors;
//           }}
//           onSubmit={async (values, { setFieldError }) => {
//             setLoading(true);

//             const result = await accountApi.verifyRegister(values);
//             if (result.success) {
//               showToast("Đăng ký thành công!", "success");
//               localStorage.removeItem("isVerifing");
//               localStorage.removeItem("temp_info");
//               router.push("/login");
//             } else if (result.message == "Invalid OTP or expired.") {
//               setFieldError("otp", "Mã OTP không chính xác");
//             }
//             setLoading(false);
//           }}
//         >
//           {({ isSubmitting, errors }) => (
//             <Form className="w-full flex flex-col ">
//               {/* OTP Field */}
//               <Field type="number" name="otp">
//                 {({ field }: { field: FieldInputProps<any> }) => (
//                   <VerificationInput
//                     {...field}
//                     ref={otpFocusRef}
//                     onBlur={() => {}}
//                     placeholder=""
//                     length={6}
//                     autoFocus={false}
//                     validChars="0-9"
//                     classNames={{
//                       container: "verify-container",
//                       character: "verify-character",
//                       characterInactive: "verify-character-inactive",
//                       characterSelected: "character--selected",
//                       characterFilled: "character--filled",
//                     }}
//                     inputProps={{
//                       inputMode: "numeric",
//                       name: field.name,
//                       onChange: (
//                         event: React.ChangeEvent<HTMLInputElement>
//                       ) => {
//                         const value = event.target.value;
//                         if (
//                           (!value || /^\d+$/.test(value)) &&
//                           value.length <= 6
//                         ) {
//                           field.onChange(event);
//                         }
//                       },
//                       onBlur: field.onBlur,
//                     }}
//                   />
//                 )}
//               </Field>
//               <ErrorMessage name="otp" component="div">
//                 {(msg) => (
//                   <div className="flex gap-x-1 items-center text-sm mb-4 justify-center text-red-500 animate-appear">
//                     <ErrorIcon className="size-5" />
//                     {msg}
//                   </div>
//                 )}
//               </ErrorMessage>
//               <div className="w-full grid place-items-center mb-6">
//                 <div
//                   onClick={canResend ? () => handleResendClick() : undefined}
//                   className={`text-[#8E71FF] ${
//                     canResend ? "hover:underline cursor-pointer" : "opacity-55"
//                   } font-medium
//                    text-sm text-center flex items-center justify-center`}
//                 >
//                   <span className="animate-appear">
//                     {canResend
//                       ? "Chưa nhận được mã? Gửi lại"
//                       : "Gửi lại mã sau "}
//                   </span>
//                   {canResend ? null : <Counter minute={1} />}
//                 </div>
//               </div>
//               <LoadingButton
//                 type="submit"
//                 size="small"
//                 className={`px-4 py-1 rounded-md
//          bg-[#8E71FF] text-white hover:opacity-70 ${
//            loading && "opacity-55"
//          } transition-all`}
//                 loading={isSubmitting}
//                 loadingIndicator={
//                   <CircularProgress className="text-white" size={16} />
//                 }
//                 disabled={loading}
//                 variant="outlined"
//               >
//                 <span className={`${isSubmitting && "text-[#8E71FF]"} pl-4`}>
//                   Xác nhận
//                 </span>
//               </LoadingButton>
//             </Form>
//           )}
//         </Formik>
//       </div>
//       <div className="w-full flex gap-x-2 items-center p-4 justify-center text-sm font-medium text-white">
//         <span>Đã có tài khoản?</span>
//         <Link href="/login">
//           <span className="text-base hover:opacity-70 font-semibold">
//             Đăng nhập
//           </span>
//         </Link>
//       </div>
//     </>
//   );
// }
