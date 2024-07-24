type ResetPassword = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

type ResetPasswordRequest = ResetPassword;
export type { ResetPassword, ResetPasswordRequest };
