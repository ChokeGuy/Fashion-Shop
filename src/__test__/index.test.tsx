import { productApi } from "../app/apis/productApi";
import Banner from "../app/components/homepage/Banner";
import FeaturedProduct from "../app/components/homepage/FeaturedProduct";
import Accessories from "../app/components/homepage/Accessories";

const getFeaturedProducts = async () => {
  const result = await productApi.getAllProducts({
    page: 0,
    sizePerPage: 30,
    productName: "",
    brandName: "",
    categoryName: "",
    priceFrom: 0,
    priceTo: 5000000,
    colors: "",
    sizes: "",
    sortBy: "POPULAR",
  });
  return result?.result.content || [];
};

const getRecommendProducts = async () => {
  const result = await productApi.getAllProducts({
    page: 0,
    sizePerPage: 30,
    productName: "",
    brandName: "",
    categoryName: "",
    priceFrom: 0,
    priceTo: 5000000,
    colors: "",
    sizes: "",
    sortBy: "NEWEST",
  });
  return result?.result.content || [];
};

jest.mock("../app/apis/productApi", () => ({
  productApi: {
    getAllProducts: jest.fn(),
    getAllProductsByCategoryName: jest.fn(),
  },
}));

jest.mock("../app/components/homepage/Banner", () => () => (
  <Banner banners={[]} />
));
jest.mock("../app/components/homepage/FeaturedProduct", () => async () => {
  const products = await getFeaturedProducts();
  return <FeaturedProduct products={products} />;
});
jest.mock("../app/components/homepage/Accessories", () => async () => {
  return <Accessories />;
});
// Mock the rest of the components

describe("HomePage", () => {
  beforeEach(() => {
    (productApi.getAllProducts as jest.Mock).mockResolvedValue({
      result: { content: ["product1", "product2"] },
    });
    (productApi.getAllProductsByCategoryName as jest.Mock).mockResolvedValue({
      result: { content: ["accessories"] },
    });
  });

  it("fetches featured products", async () => {
    const products = await getFeaturedProducts();
    expect(products).toEqual(["product1", "product2"]);
  });

  it("fetches recommended products", async () => {
    const products = await getRecommendProducts();
    expect(products).toEqual(["product1", "product2"]);
  });
});
