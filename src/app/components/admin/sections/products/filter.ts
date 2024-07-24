import { Product, ProductItem, Tag } from "@/src/models";

export function applyFilter({
  inputData,
  comparator,
  filterName,
}: {
  inputData: Product[];
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
  //   inputData = inputData.filter(
  //     (product: Product) =>
  //       product.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
  //   );
  // }

  return inputData;
}

export function applyProductItemFilter({
  inputData,
  comparator,
}: {
  inputData: ProductItem[];
  comparator: any;
}) {
  const stabilizedThis = inputData.map((el: any, index: any) => [el, index]);

  stabilizedThis.sort((a: number[], b: number[]) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el: any[]) => el[0]);
  return inputData;
}

export function applyTagFilter({
  inputData,
  comparator,
}: {
  inputData: Tag[];
  comparator: any;
}) {
  const stabilizedThis = inputData.map((el: any, index: any) => [el, index]);

  stabilizedThis.sort((a: number[], b: number[]) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el: any[]) => el[0]);
  return inputData;
}
