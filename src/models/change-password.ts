type ChangePassword = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
type ChangePasswordRequest = ChangePassword;

export type { ChangePassword, ChangePasswordRequest };
