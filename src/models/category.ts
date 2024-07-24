type Category = {
  categoryId: number;
  name: string;
  parentName?: string;
  image: string;
  styleNames: string[];
  children: Omit<Category, "styleNames" | "image" | "children">[] | [];
  isActive?: boolean;
};

type CategoryRequest = Omit<Category, "categoryId">;
type CategoryResponse = Category;

export type { Category, CategoryRequest, CategoryResponse };
