import { ListResponseContent, StyleValue } from "@/src/models";
import axiosClient from "./axiosClient";
import { handleError } from "@/src/utilities/handleError";

export const styleValuesApi = {
  async getStyleValues(): Promise<ListResponseContent<StyleValue> | undefined> {
    try {
      return await axiosClient.get(`/styleValues`);
    } catch (error: any) {
      handleError(error);
    }
  },
};
