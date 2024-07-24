import {
  Address,
  Cordinate,
  CreateAddressResponse,
  Distance,
  ForwardGeocoding,
  ListResponseAddress,
  SingleResponseAddress,
  SingleResponseContent,
} from "@/src/models";
import axiosClient from "./axiosClient";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "./axiosClientWithAuth";

export const addressApi = {
  async getAddressSuggest(input: string): Promise<Address | undefined> {
    try {
      return await axiosClient.get(
        `${process.env.NEXT_PUBLIC_MAP_API_KEY}&input=${input}&more_compound=true`
      );
    } catch (error: any) {
      handleError(error);
    }
    return;
  },
  async getCordinate(address: string): Promise<Cordinate | undefined> {
    try {
      const result: ForwardGeocoding = await axiosClient.get(
        `${process.env.NEXT_PUBLIC_CORDINATE_API_KEY}${address}`
      );
      const currCornidate = result.results[0].geometry.location;
      return currCornidate;
    } catch (error: any) {
      handleError(error);
    }
  },

  async getShippingKm(currCornidate: Cordinate): Promise<number | undefined> {
    try {
      const result: Distance = await axiosClient.get(
        `${process.env.NEXT_PUBLIC_SHIPPING_COST_API_KEY}${currCornidate.lat},${currCornidate.lng}`
      );
      if (result.rows[0].elements[0].distance.text.includes("km")) {
        return result.rows[0].elements[0].distance.value / 1000;
      } else return result.rows[0].elements[0].distance.value / 1000;
    } catch (error: any) {
      handleError(error);
    }
  },
  async createUserAddress(request: {
    address: string;
    phone: string;
    recipientName: string;
  }): Promise<SingleResponseAddress<CreateAddressResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post(`/users/addresses`, request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getAllUserAddresses(): Promise<
    ListResponseAddress<CreateAddressResponse> | undefined
  > {
    try {
      return await axiosClientWithAuth.get(`/users/addresses`);
    } catch (error: any) {
      handleError(error);
    }
  },
  async updateUserAddress(request: {
    addressId: number;
    address: string;
    phone: string;
    recipientName: string;
  }): Promise<SingleResponseAddress<CreateAddressResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/addresses/${request.addressId}`,
        {
          address: request.address,
          phone: request.phone,
          recipientName: request.recipientName,
        }
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async deleteUserAddress(
    addressId: number
  ): Promise<SingleResponseAddress<string> | undefined> {
    try {
      return await axiosClientWithAuth.delete(`/users/addresses/${addressId}`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async setDefaultAddress(
    addressId: number
  ): Promise<SingleResponseAddress<string> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/addresses/${addressId}/setup-default-address`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};
