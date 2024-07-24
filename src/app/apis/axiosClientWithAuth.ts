import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { getCookie, setCookie } from "cookies-next";
import { accountApi } from "./accountApi";
import { AdaptAxiosRequestConfig } from "./axiosClient";
import { deleteTokens } from "@/src/utilities/tokenHandler";

// Set config defaults when creating the instance
const axiosClientWithAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // timeout: 5000,
  headers: new AxiosHeaders({
    Accept: "application/json",
    "Cache-Control": "no-cache",
  }),
});

// Alter defaults after instance has been created

axiosClientWithAuth.interceptors.request.use(
  function (config: AdaptAxiosRequestConfig) {
    // Get token from cookie
    let token = getCookie("accessToken");

    // If token exists, set it in the request header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClientWithAuth.interceptors.response.use(
  function (response: AxiosResponse) {
    return response.data;
  },
  async function (error: AxiosError) {
    const { response } = error;
    if (response?.status == 401 && response.config) {
      const refreshToken = getCookie("refreshToken");
      if (!refreshToken) {
        return;
      }
      const onRefreshToken = await accountApi.refreshAccessToken({
        refreshToken,
      });
      if (onRefreshToken.success) {
        const newAccessToken = onRefreshToken.result.accessToken;
        const newRefreshToken = onRefreshToken.result.refreshToken;

        // Save new access token to cookie
        setCookie("accessToken", newAccessToken);
        setCookie("refreshToken", newRefreshToken);
        // Resend the original request
        response.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return await axiosClientWithAuth(response.config);
      } else {
        deleteTokens();
      }
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default axiosClientWithAuth;
