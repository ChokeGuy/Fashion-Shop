import axios, {
  AxiosHeaders,
  AxiosRequestHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
// Set config defaults when creating the instance
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  //   timeout: 1000,
  headers: new AxiosHeaders({
    "Content-Type": "application/json",
  }),
});

// Alter defaults after instance has been created
// axiosClient.defaults.headers.common["Authorization"] = "AUTH_TOKEN";

export interface AdaptAxiosRequestConfig extends AxiosRequestConfig {
  headers: AxiosRequestHeaders;
}

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config: AdaptAxiosRequestConfig) {
    // Do something before request is sent
    return config;
  },
  function (error: any) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response: AxiosResponse) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error: any) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default axiosClient;
