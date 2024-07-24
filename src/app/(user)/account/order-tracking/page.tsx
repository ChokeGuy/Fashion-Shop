import { orderServerApi } from "@/src/app/apis/orderServerApi";
import OrderTrackingPage from "@/src/app/components/user/order-tracking";
import { Order } from "@/src/models";

const OrderTracking = async ({
  searchParams,
}: {
  searchParams?: {
    orderKeyword: string;
  };
}) => {
  //Get search params from URL like orderKeyword
  let keyword = searchParams?.orderKeyword || "";

  let result: Order[] | undefined = undefined;

  //Get orders by keyword
  if (keyword.length > 0 && keyword) {
    // Check if keyword is a number
    const isNumeric = !isNaN(keyword as any);
    // Use different search strategies based on whether keyword is a number
    if (isNumeric) {
      // Search by product ID or other numeric field
      const response = await orderServerApi.getOrdersById({
        orderId: +keyword,
      });
      if (!response?.success) result = [];
      else result = [response?.result.order as Order];
    } else {
      // Search by productName
      const response = await orderServerApi.getOrdersByProductName({
        productName: keyword,
      });
      result = response?.result.content || [];
    }
  }

  return <OrderTrackingPage orderSearchs={result} />;
};

export default OrderTracking;
