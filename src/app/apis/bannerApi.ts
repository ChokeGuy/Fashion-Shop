import { Banner, ListResponseContent } from "@/src/models";
import axiosClient from "./axiosClient";
import { handleError } from "@/src/utilities/handleError";

export const bannerApi = {
  async getAllBanners(): Promise<ListResponseContent<Banner> | undefined> {
    try {
      return await axiosClient.get("/banners");
    } catch (error: any) {
      handleError(error);
    }
  },
};
