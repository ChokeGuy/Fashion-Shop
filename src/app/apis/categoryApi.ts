import { ListResponseContent } from "@/src/models";
import { Category } from "@/src/models/category";
import axiosClient from "./axiosClient";
import { handleError } from "@/src/utilities/handleError";

export const categoryApi = {
  async getAllCategories(): Promise<ListResponseContent<Category> | undefined> {
    try {
      return await axiosClient.get("/categories");
    } catch (error: any) {
      handleError(error);
    }
  },
};
