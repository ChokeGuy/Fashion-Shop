import { Order, OrderItem } from "./order";

export type PaginationParams = {
  page?: number;
  sizePerPage?: number;
};

export type Pagination = {
  page?: number;
  size?: number;
};

export type ListResponse<T> = {
  success: boolean;
  result: T[];
  totalElements?: number;
  statusCode: number;
  message: string;
};
export type ListResponseContent<T> = {
  success: boolean;
  result: {
    content: T[];
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};

export type SingleResponse<T> = {
  success: boolean;
  result: T;
  statusCode: number;
  message: string;
};
export type SingleResponseContent<T> = {
  success: boolean;
  result: {
    content: T;
  };
  statusCode: number;
  message: string;
};
export type ListResponseUser<T> = {
  success: boolean;
  result: {
    userList: T[];
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};
export type ListResponseOrder<T, O> = {
  success: boolean;
  result: {
    totalOrderItems?: number;
    orderItems: T[];
    order: O;
  };
  statusCode: number;
  message: string;
};

export type ListResponsePromotion<T> = {
  success: boolean;
  result: {
    promotionList: T[];
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};
export type ListResponseRevenue<T> = {
  success: boolean;
  result: {
    transactionList: T[];
    totalRevenues?: number;
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};
export type ListResponseFilterRevenue<T> = {
  success: boolean;
  result: {
    transactionList: T[];
    revenue?: number;
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};

export type SingleResponseDelivery<T> = {
  success: boolean;
  result: {
    delivery: T;
  };
  statusCode: number;
  message: string;
};
export type ListResponseDelivery<T> = {
  success: boolean;
  result: {
    deliveryList: T[];
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};

export type ListResponseRating<T> = {
  success: boolean;
  result: {
    ratingResponseList: T[];
    totalRatings?: number;
  };
  statusCode: number;
  message: string;
};
export type ListResponseAddress<T> = {
  success: boolean;
  result: {
    content: T[];
    email: string;
  };
  statusCode: number;
  message: string;
};
export type SingleResponseAddress<T> = {
  success: boolean;
  result: {
    content: T;
    email: string;
  };
  statusCode: number;
  message: string;
};
export type SingleResponseInstantBuy<T> = {
  success: boolean;
  result: {
    orderItem: OrderItem;
    content: T;
  };
  statusCode: number;
  message: string;
};
export type ListResponseCategories<T> = {
  success: boolean;
  result: {
    availableParents: T[];
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};

export type ListResponseVoucher<T> = {
  success: boolean;
  result: {
    availableVouchers: T[];
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};

export type ListResponseNotification<T> = {
  success: boolean;
  result: {
    newNotification: number;
    notificationPage: T[];
    totalElements?: number;
  };
  statusCode: number;
  message: string;
};
