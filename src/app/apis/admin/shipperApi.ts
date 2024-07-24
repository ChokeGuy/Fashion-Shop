import { ListResponseUser, User } from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminShipperApi = {
  async getAllShippersByAddress(
    address: string
  ): Promise<ListResponseUser<User> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/user-management/users/address?address=${address}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
};
