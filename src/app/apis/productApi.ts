import {
  ListResponse,
  ListResponseContent,
  ListResponseRating,
  ProductItemResponse,
  ProductRequest,
  ProductResponse,
  RatingResponse,
  SingleResponse,
} from "@/src/models";
import axiosClient from "./axiosClient";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "./axiosClientWithAuth";

export const productApi = {
  async getAllProducts(
    request: ProductRequest = {
      page: 0,
      sizePerPage: 9,
      productName: "",
      brandName: "",
      categoryName: "",
      priceFrom: 0,
      priceTo: 5000000,
      colors: "",
      sizes: "",
      sortBy: "NEWEST",
    }
  ): Promise<ListResponseContent<ProductResponse> | undefined> {
    try {
      const {
        page,
        sizePerPage,
        productName,
        brandName,
        categoryName,
        priceFrom,
        priceTo,
        colors,
        sizes,
        sortBy,
      } = request;
      const queryParams = `page=${page}&sizePerPage=${sizePerPage}&productName=${productName}&brandName=${brandName}&categoryName=${categoryName}&priceFrom=${priceFrom}&priceTo=${priceTo}&colors=${colors}&sizes=${sizes}&sortBy=${sortBy}`;
      return await axiosClient.get(`/products?${queryParams}`);
    } catch (error: any) {
      handleError(error);
    }
  },
  async getAllProductsByName(
    name: string
  ): Promise<ListResponseContent<ProductResponse> | undefined> {
    try {
      if (name && name != "") {
        return await axiosClient.get(`/products?productName=${name}`);
      }
    } catch (error: any) {
      handleError(error);
    }
  },

  async getAllProductsByCategoryName(
    name: string
  ): Promise<ListResponseContent<ProductResponse> | undefined> {
    try {
      if (name && name != "") {
        return await axiosClient.get(`/products?categoryName=${name}`);
      }
    } catch (error: any) {
      handleError(error);
    }
  },

  async getProductById(
    productId: string
  ): Promise<SingleResponse<ProductResponse> | undefined> {
    try {
      return await axiosClient.get(`/products/${productId}`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getProductItemsById(
    productId: string
  ): Promise<ListResponseContent<ProductItemResponse> | undefined> {
    try {
      return await axiosClient.get(`/productItems/parent/${productId}`);
    } catch (error: any) {
      handleError(error);
    }
  },

  async getRelatedProducts(
    productId: string
  ): Promise<ListResponse<ProductResponse> | undefined> {
    try {
      return await axiosClient.get(`/products/${productId}/related-products`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getFashionAccessories(
    quantity: number = 8
  ): Promise<ListResponseContent<ProductResponse> | undefined> {
    try {
      return await axiosClient.get(
        `/products/fashion-accessories?quantity=${quantity}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getAllRatings(
    productId: string,
    size: number = 3
  ): Promise<ListResponseRating<RatingResponse> | undefined> {
    try {
      return await axiosClient.get(
        `/products/${productId}/ratings?size=${size}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async followProduct(productId: number): Promise<SingleResponse<String>> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/products/follow-product/${productId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async unFollowProduct(productId: number): Promise<SingleResponse<String>> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/products/unfollow-product/${productId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async countFollowProducts(
    productId: string
  ): Promise<SingleResponse<number>> {
    try {
      return await axiosClient.get(`/products/${productId}/count-follows`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async checkFollowProduct(
    productId: number
  ): Promise<SingleResponse<boolean>> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/products/check-follow/${productId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getRecommentProducts(): Promise<ListResponseContent<ProductResponse>> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/products/recommend`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getDefaultRecommentProducts(): Promise<
    ListResponseContent<ProductResponse>
  > {
    try {
      return await axiosClient.get(`/products/default-recommend-products`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};
