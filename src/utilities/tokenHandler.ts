"use client";
import { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { accountApi } from "../app/apis/accountApi";
import axiosClientWithAuth from "../app/apis/axiosClientWithAuth";
import { tokenSessionOptions } from "../config/session";
import { Token } from "../models";
import {
  deleteCookie,
  getCookie,
  getCookies,
  hasCookie,
  setCookie,
} from "cookies-next";

// Function to get tokens
export function getTokens(): Token {
  const { accessToken, refreshToken } = getCookies();
  return {
    accessToken: accessToken!,
    refreshToken: refreshToken!,
  };
}
export const onRefreshToken = async (
  error: AxiosError,
  retryUrl: string,
  method: string = "GET"
) => {
  const refreshToken = getCookie("refreshToken");
  if (refreshToken) {
    const response = await accountApi.refreshAccessToken({
      refreshToken,
    });
    if (response.success) {
      const newAccessToken = response.result.accessToken;
      const newRefreshToken = response.result.refreshToken;

      // Save new access token to cookie
      setCookie(
        "accessToken",
        newAccessToken,
        tokenSessionOptions("accessToken")
      );
      setCookie(
        "refreshToken",
        newRefreshToken,
        tokenSessionOptions("refreshToken")
      );
      axiosClientWithAuth.defaults.method = method;
      // Resend the original request
      return await axiosClientWithAuth(retryUrl);
    }
    deleteCookie("refreshToken");
    redirect("/login");
  } else {
    redirect("/login");
  }
};

// Function to get tokens
export function hasTokens(): boolean {
  return hasCookie("accessToken") && hasCookie("refreshToken");
}

// Function to set tokens
export function setTokens(accessToken: string, refreshToken: string): void {
  setCookie("accessToken", accessToken, tokenSessionOptions("accessToken"));
  setCookie("refreshToken", refreshToken, tokenSessionOptions("refreshToken"));
}
export function deleteTokens(): void {
  deleteCookie("accessToken");
  deleteCookie("refreshToken");
}
