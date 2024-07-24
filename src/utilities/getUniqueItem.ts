import { ProductItem } from "../models";
import { Category } from "../models/category";

function getUniqueProductItems(items: ProductItem[]): ProductItem[] {
  const uniqueProductItems: ProductItem[] = [];

  items.forEach((item) => {
    const isDuplicate = uniqueProductItems.some(
      (uniqueItem) =>
        uniqueItem.styleValueByStyles.Color === item.styleValueByStyles.Color
    );

    if (!isDuplicate) {
      uniqueProductItems.push(item);
    }
  });

  return uniqueProductItems;
}

function getUniqueColors(
  items: ProductItem[]
): { productItemId: number; color: string }[] {
  const uniqueProductItems: ProductItem[] = [];

  items.forEach((item) => {
    const isDuplicate = uniqueProductItems.some(
      (uniqueItem) =>
        uniqueItem.styleValueByStyles.Color === item.styleValueByStyles.Color
    );

    if (!isDuplicate) {
      uniqueProductItems.push(item);
    }
  });

  return uniqueProductItems
    .map((item) => ({
      productItemId: item.productItemId,
      color: item.styleValueByStyles.Color,
    }))
    .filter((item) => item.color !== undefined && item.color !== "");
}

function getUniqueSizes(
  items: ProductItem[]
): { productItemId: number; size: string }[] {
  const uniqueProductItems: ProductItem[] = [];

  items.forEach((item) => {
    const isDuplicate = uniqueProductItems.some(
      (uniqueItem) =>
        uniqueItem.styleValueByStyles.Size === item.styleValueByStyles.Size
    );
    if (!isDuplicate) {
      uniqueProductItems.push(item);
    }
  });

  return uniqueProductItems
    .map((item) => ({
      productItemId: item.productItemId,
      size: item.styleValueByStyles.Size,
    }))
    .filter((item) => item.size !== undefined && item.size !== "");
}

function getParentCategories(categories: Category[]) {
  return categories.filter((category) => category.parentName === null);
}

export {
  getUniqueColors,
  getUniqueSizes,
  getUniqueProductItems,
  getParentCategories,
};
