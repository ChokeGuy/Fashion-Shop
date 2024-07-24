import { Delivery, Order } from "@/src/models";

export function applyFilter({
  inputData,
}: {
  inputData: Delivery[];
  filterName: string;
}) {
  return inputData;
}
