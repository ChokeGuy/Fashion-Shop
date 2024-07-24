import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterVerifyOTP,
  SingleResponse,
} from "@/src/models";
import axiosClient from "./axiosClient";
import { handleError } from "@/src/utilities/handleError";
import { ResetPasswordRequest } from "@/src/models/reset-password";

export const accountApi = {
  async login(
    request: LoginRequest
  ): Promise<SingleResponse<LoginResponse> | undefined> {
    try {
      return await axiosClient.post("/auth/login", request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async register(
    request: RegisterRequest
  ): Promise<SingleResponse<RegisterResponse> | undefined> {
    try {
      return await axiosClient.post("/auth/register", request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async sendVerifyEmail(
    request: string
  ): Promise<SingleResponse<String> | undefined> {
    try {
      return await axiosClient.post("/auth/send-otp-verify-email", {
        email: request,
      });
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async verifyRegister(
    request: RegisterVerifyOTP
  ): Promise<SingleResponse<string>> {
    try {
      return await axiosClient.post("/auth/verify-otp-register", request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async refreshAccessToken(request: {
    refreshToken: string;
  }): Promise<SingleResponse<LoginResponse>> {
    try {
      return await axiosClient.post(`/auth/refresh-access-token`, request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async forgotPassword(request: {
    email: string;
  }): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClient.post(`/auth/forgot-password`, request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClient.post(`/auth/reset-password`, request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};
