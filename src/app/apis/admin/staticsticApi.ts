import {
  ListResponse,
  ListResponseFilterRevenue,
  ListResponseRevenue,
  Pagination,
  SingleResponse,
  TopProductRequest,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";
import { TransactionRequest } from "@/src/models/transaction";
import axiosClientExportWithAuth from "../axiosClientExportWithAuth";

export const adminStaticSticsApi = {
  async getTotalRevenue(
    request: Pagination = {
      page: 0,
      size: 5,
    }
  ): Promise<ListResponseRevenue<TransactionRequest> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/statistics/total-revenues?page=${request?.page}&size=${request?.size}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async exportTotalRevenue() {
    try {
      return await axiosClientExportWithAuth.get(
        `/users/admin/statistics/export-total-revenues`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  // YY/MM/DD Format
  async getRevenueByDateRange(
    request: {
      dateFrom: string;
      dateTo: string;
      pagination: Pagination;
    } = {
      dateFrom: "",
      dateTo: "",
      pagination: {
        page: 0,
        size: 5,
      },
    }
  ): Promise<ListResponseFilterRevenue<TransactionRequest> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/statistics/revenues?page=${request.pagination.page}&size=${request.pagination.size}&dateFrom=${request.dateFrom}&dateTo=${request.dateTo}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async exportRevenueByDateRange(
    request: {
      dateFrom: string;
      dateTo: string;
    } = {
      dateFrom: "",
      dateTo: "",
    }
  ) {
    try {
      return await axiosClientExportWithAuth.get(
        `/users/admin/statistics/export-revenues?dateFrom=${request.dateFrom}&dateTo=${request.dateTo}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getTotalUsers(): Promise<SingleResponse<number> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/statistics/total-users`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getTodayUsers(): Promise<SingleResponse<number> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/statistics/users-today`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  // YY/MM/DD Format
  async getUserByDateRange(request: {
    dateFrom: string;
    dateTo: string;
  }): Promise<SingleResponse<number> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/statistics/customers?dateFrom=${request.dateFrom}&dateTo=${request.dateTo}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  // YY/MM/DD Format
  async getTopProducts(
    request: {
      quantity: number;
    } = { quantity: 5 }
  ): Promise<ListResponse<TopProductRequest> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/statistics/products/top-selling-products?quantity=${request.quantity}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getTodayOrderAmount(): Promise<SingleResponse<number> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/statistics/orders-today`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};
