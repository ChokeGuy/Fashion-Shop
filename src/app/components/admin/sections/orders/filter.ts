import { Order } from "@/src/models";

export function applyFilter({
  inputData,
  comparator,
  filterName,
}: {
  inputData: Order[];
  comparator: any;
  filterName: string;
}) {
  const stabilizedThis = inputData.map((el: any, index: any) => [el, index]);

  stabilizedThis.sort((a: number[], b: number[]) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el: any[]) => el[0]);

  // if (filterName) {
  //   console.log("Input data", inputData);
  //   inputData =
  //     inputData && inputData.length > 0
  //       ? inputData.filter((order: Order) => order.orderId === +filterName)
  //       : [];
  // }

  return inputData;
}
