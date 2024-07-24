import { Role } from "../constants/role";
import { User } from "./user";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  role: Role;
  accessToken: string;
  refreshToken: string;
};

type RegisterRequest = {
  fullname: string;
  email: string;
  otp: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type RegisterResponse = User;

type RegisterVerifyOTP = {
  email: string;
  otp: string;
};

type Token = Omit<LoginResponse, "role">;

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterVerifyOTP,
  Token,
};
