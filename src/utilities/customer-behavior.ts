import { getCookie } from "cookies-next";
import { userApi } from "../app/apis/userApi";

const customerBehavior = async (productId: number) => {
  const accessToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");
  if (accessToken && refreshToken) {
    await userApi.saveCustomerBehavior(productId);
  }
};
export default customerBehavior;
