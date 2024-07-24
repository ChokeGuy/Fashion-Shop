import {
  AddStyleValueRequest,
  KeyString,
  ListResponseContent,
  Pagination,
  SingleResponse,
  StyleValueResponse,
} from "@/src/models";
import { StyleResponse } from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminStyleValueApi = {
  async getAllStyles(
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/styles?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getStylesByName(
    styleName: string,
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/styles?styleName=${styleName}&page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getStyleById(
    styleId: number
  ): Promise<SingleResponse<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/admin/styles/${styleId}`);
    } catch (error: any) {
      handleError(error);
    }
  },

  async changeStyleActivation(
    styleId: number
  ): Promise<SingleResponse<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/styles/${styleId}/toggle-style-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },

  async getAllStyleValues(
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<StyleValueResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/styleValues?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getStyleValuesByStyleValueName(
    styleValueName: string,
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<StyleValueResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/styleValues?styleValueName=${styleValueName}&page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async createNewStyle(
    request: { name: string } & KeyString
  ): Promise<ListResponseContent<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post("/users/admin/styles", request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateStyle(
    styleId: number,
    request: { name: string } & KeyString
  ): Promise<ListResponseContent<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/styles/${styleId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async changeStyleValueActivation(
    styleValueId: number
  ): Promise<SingleResponse<StyleValueResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/styleValues/${styleValueId}/toggle-style-value-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },

  async getStyleValuesByStyleName(
    request: {
      styleName: string;
      page: number;
      size: number;
    } = {
      styleName: "",
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<StyleValueResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/styleValues/styleNames?styleName=${request.styleName}&size=${request.size}&page=${request.page}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },

  async getStyleValueById(
    styleValueId: number
  ): Promise<SingleResponse<StyleValueResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/styleValues/${styleValueId}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },

  async createNewStyleValue(
    request: AddStyleValueRequest & KeyString
  ): Promise<ListResponseContent<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        "/users/admin/styleValues",
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateStyleValue(
    styleValueId: number,
    request: AddStyleValueRequest & KeyString
  ): Promise<ListResponseContent<StyleResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/styleValues/${styleValueId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};
