"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { banner26 } from "@/src/assests";
import Image from "next/image";
import StarIcon from "@mui/icons-material/Star";
import Pagination from "@mui/material/Pagination";
import PaginationInfo from "./paginationInfo";
import ItemsSelect from "./Select";
import FilterListIcon from "@mui/icons-material/FilterList";
import Slider from "@mui/material/Slider";
import { CategoryFilter, ColorFilter, SizeFilter } from "./Filter";
import TemporaryDrawer from "../Drawer";
import { formatPrice } from "@/src/utilities/price-format";
import { Category, Product, StyleValue } from "@/src/models";
import { SelectChangeEvent } from "@mui/material/Select";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";

import CircleLoading from "../Loading";
import { getParentCategories } from "@/src/utilities/getUniqueItem";
import Rating from "@mui/material/Rating";
import { Paper } from "@mui/material";
import { debounce } from "lodash";
import { productApi } from "../../apis/productApi";
import CircularIndeterminate from "../Progress";
import { SortType } from "@/src/constants/sort-by";
import customerBehavior from "@/src/utilities/customer-behavior";

type MainProductProps = {
  products: Product[];
  categories: Category[];
  sizes: StyleValue[];
  colors: StyleValue[];
  totalElements: number;
};

let input: string = "";

const MainProducts = ({
  products,
  categories,
  totalElements,
  sizes,
  colors,
}: MainProductProps) => {
  const pathname = usePathname();
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();

  const parentCategories = getParentCategories(categories);
  const currentPage = Number(searchParams.get("page")) || 0;
  const currentSizePerPage = Number(searchParams.get("sizePerPage")) || 9;
  const currentSortBy = (searchParams.get("sortBy") as SortType) || "NEWEST";
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [page, setPage] = useState(0);
  // Default size per page is 9
  const [sizePerPage, setSizePerPage] = useState(9);

  // [1: Newest, 2: Popular, 3: Price low to high, 4: Price high to low]
  const [sortBy, setSortBy] = useState(1);
  //Default prices from 0 to 5.000.000
  const [prices, setPrices] = useState([0, 5000]);

  const [searchInput, setSearchInput] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchProducts, setSearchProducts] = useState<Product[] | undefined>(
    []
  ); // Set the initial state to an empty array
  const [showProducts, setShowProducts] = useState(false); //Show products when focused on search input
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const keywords = params.get("keyword");
    if (keywords) {
      input = keywords;
      setSearchInput(keywords);
      productApi.getAllProductsByName(keywords).then((value) => {
        setSearchProducts(value?.result.content);
      });
    }
    params.delete("sizePerPage");
    params.delete("page");
    replace(`${pathname}?${params.toString()}`);
  }, []);

  useEffect(() => {
    setIsLoading(false);
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setIsLoading(false);
    setSizePerPage(currentSizePerPage);
  }, [currentSizePerPage]);

  useEffect(() => {
    setIsLoading(false);
    const sortBy = getSortTypeFromEnum(currentSortBy);
    setSortBy(sortBy);
  }, [currentSortBy]);

  const handleChangePrice = (event: Event, newValue: number | number[]) => {
    setPrices(newValue as number[]);
  };

  const handleFocus = () => {
    setShowProducts(true);
  };

  const handleBlur = () => {
    setShowProducts(false);
  };

  //Handle change page event
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("page", value.toString());
    } else params.delete("page");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo(370, 275);
    setIsLoading(true);
    setPage(value);
  };

  const handleFilterByPrice = () => {
    const params = new URLSearchParams(searchParams);
    params.set("priceFrom", (prices[0] * 1000).toString());
    params.set("priceTo", (prices[1] * 1000).toString());
    replace(`${pathname}?${params.toString()}`);
    setIsLoading(true);
    setPage(0);
  };

  const getSortType = (sortBy: number): SortType => {
    switch (sortBy) {
      case 1:
        return "NEWEST";
      case 2:
        return "POPULAR";
      case 3:
        return "PRICE_ASC";
      case 4:
        return "PRICE_DESC";
      default:
        return "NEWEST";
    }
  };

  const getSortTypeFromEnum = (sortBy: SortType): number => {
    switch (sortBy) {
      case "NEWEST":
        return 1;
      case "POPULAR":
        return 2;
      case "PRICE_ASC":
        return 3;
      case "PRICE_DESC":
        return 4;
      default:
        return 1;
    }
  };

  const handleSortBy = (sortBy: number) => {
    const sortType = getSortType(sortBy);
    const params = new URLSearchParams(searchParams);
    if (sortBy) {
      params.set("sortBy", sortType);
    } else params.delete("sortBy");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
    setSortBy(sortBy);
    setIsLoading(true);
    setPage(0);
  };

  const handleChangeSelect = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    if (value >= 1 && value <= 4) {
      handleSortBy(value);
      return;
    } else {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("sizePerPage", value.toString());
        params.set("page", "1");
      } else params.delete("sizePerPage");

      replace(`${pathname}?${params.toString()}`);
      setPrices([0, 5000]);
      setIsLoading(true);
      setPage(0);
      setSizePerPage(value);
    }
  };

  const handleResetFilter = () => {
    push(`${pathname}`);
    setPage(0);
    setSizePerPage(9);
    setPrices([0, 5000]);
    setSortBy(1);
    setSearchInput("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSearchInput(name);

    if (name && name.length == 0) {
      setShowProducts(false);
    } else setShowProducts(true);
    handleSearch(name);
  };

  const handleSearch = useCallback(
    debounce(async (name: string) => {
      setIsSearchLoading(true); // Set isLoading to true before making the API call
      try {
        const params = new URLSearchParams(searchParams);
        if (name.length == 0) params.delete("keyword");
        const result = await productApi.getAllProductsByName(name);
        setSearchProducts(result?.result.content);
      } finally {
        input = name;
        setIsSearchLoading(false); // Set isLoading to false after the API call is complete
      }
    }, 300),
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputParams = new URLSearchParams();
      if (searchInput && searchInput.length > 0) {
        inputParams.set("keyword", searchInput);
        push(`/product?${inputParams.toString()}`, { scroll: false });
      } else inputParams.delete("keyword");
    }
  };

  const handleSearchByClick = () => {
    const inputParams = new URLSearchParams();
    if (searchInput && searchInput.length > 0) {
      inputParams.set("keyword", searchInput);
      push(`/product?${inputParams.toString()}`, { scroll: false });
    } else inputParams.delete("keyword");
  };

  return (
    <section className="lg:container max-md:px-0 lg:mt-12">
      <div className="grid grid-cols-12 gap-x-[1.875rem] relative">
        <div className="col-span-12 max-lg:hidden lg:col-span-3 relative">
          <div className="sticky top-10 space-y-5">
            <form className="w-full relative">
              <input
                type="text"
                value={searchInput}
                ref={searchInputRef}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full border-0 border-b-2 border-border-color focus:border-text-light-color
                   py-2 text-sm focus:outline-0 focus:ring-0"
                onKeyDown={(e) => handleKeyDown(e)}
                onChange={(e) => handleChange(e)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {showProducts && (
                <Paper
                  className={`absolute z-10 bg-white w-full border border-border-color`}
                >
                  <div className={`max-h-[120px] overflow-auto`}>
                    {searchProducts && searchProducts.length > 0
                      ? searchProducts.map((product) => (
                          <Link
                            onMouseDown={() => {
                              push(`/product/${product.productId}`);
                              setTimeout(() => {
                                setShowProducts(false);
                              }, 100);
                            }}
                            href={`/product/${product.productId}`}
                            className="p-2 flex items-center justify-between bg-white shadow-md"
                            key={product.productId}
                          >
                            <div className="flex items-center gap-x-4">
                              <div className="rounded-md p-0.5">
                                <Image
                                  width={40}
                                  height={40}
                                  className="size-10 rounded-md border border-primary-color p-0.5"
                                  src={product.image}
                                  alt={`product-image-${product.brandId}`}
                                ></Image>
                              </div>
                              <span className="font-bold text-base truncate w-24">
                                {product.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-text-color">
                              {product.priceMin &&
                                formatPrice(product.priceMin) + " VNĐ"}
                            </span>
                          </Link>
                        ))
                      : input &&
                        input.length > 0 && (
                          <p className="p-2">
                            Không tìm thấy sản phẩm với từ khóa {`"${input}"`}
                          </p>
                        )}
                  </div>
                </Paper>
              )}
              {!isSearchLoading ? (
                <div onClick={handleSearchByClick}>
                  <SearchIcon
                    sx={{ fill: "rgba(0,0,0,0.7)" }}
                    className="cursor-pointer text-[1.5rem] absolute right-2 top-[25%]"
                  />
                </div>
              ) : (
                <CircularIndeterminate size={16} />
              )}
            </form>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center w-full">
                <h1 className="font-medium text-lg capitalize">Danh mục</h1>
                <button
                  onClick={handleResetFilter}
                  className="bg-background px-4 py-1 hover:bg-primary-color hover:text-white transition-colors whitespace-nowrap
                text-center"
                >
                  Đặt lại
                </button>
              </div>
              <CategoryFilter
                setLoading={setIsLoading}
                categories={parentCategories}
              />
            </div>
            <div className="flex flex-col space-y-4">
              <h1 className="font-medium text-lg capitalize"> Lọc theo giá</h1>
              <div className="flex items-end justify-between">
                <div>
                  <p>
                    Giá:{" "}
                    {`${prices[0] == 0 ? "0" : prices[0] + "K"} - ${
                      prices[1]
                    }K`}
                  </p>
                </div>
                <button
                  onClick={handleFilterByPrice}
                  className="bg-background px-4 py-1 hover:bg-primary-color hover:text-white transition-colors
                text-center"
                >
                  Lọc
                </button>
              </div>
              <div className="px-1">
                <Slider
                  step={50} // Set step to 50
                  min={0}
                  max={5000}
                  size={"small"}
                  getAriaLabel={() => "Price range"}
                  value={prices}
                  onChange={handleChangePrice}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => (
                    <div className="p-1">{`${value}K`}</div>
                  )}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <h1 className="font-medium text-lg capitalize">
                {" "}
                Lọc theo màu sắc
              </h1>
              <ColorFilter colors={colors} setLoading={setIsLoading} />
            </div>
            <div className="flex flex-col space-y-4">
              <h1 className="font-medium text-lg capitalize">
                {" "}
                Lọc theo kích cỡ
              </h1>
              <SizeFilter sizes={sizes} setLoading={setIsLoading} />
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-9 px-4 relative flex flex-col">
          <div className="relative mb-[1.875rem] max-lg:order-2 max-lg:mt-[3.525rem]">
            <Image
              className="w-full h-56 md:w-full md:h-56 object-cover object-center"
              src={banner26}
              alt="banner"
            ></Image>
            <div
              className="absolute bottom-[45%] md:bottom-[20%] lg:bottom-[25%]
             left-[5.5%] flex flex-col items-start gap-y-4 text-text-color transition-all duration-300 ease-in-out"
            >
              <h1 className="text-2xl lg:text-4xl flex flex-col ">
                Nhiều sản phẩm với đủ kiểu dáng
                <span>cho mọi người</span>
              </h1>
              <p className="text-ssm md:text-base text-white capitalize flex flex-col text-left font-medium md:font-light max-w-96">
                Bạn có muốn thay đổi phong cách của mình không? Hãy thử ngay
              </p>
            </div>
          </div>
          <div
            className="flex items-center justify-between lg:mb-[1.875rem] max-lg:fixed 
          max-lg:left-0 max-lg:right-0 max-lg:border max-lg:border-border-color max-lg:border-t-0 max-lg:shadow-sm
          top-[126px] ssm:top-[151px] sm:top-[153px] smd:top-[136px] md:top-[140px] lg:top-[154px] max-lg:z-20 max-lg:p-4 bg-white max-lg:order-1"
          >
            <div className="flex items-center gap-x-3 text-sm max-lg:hidden">
              <div>
                <PaginationInfo
                  page={page}
                  itemsPerPage={sizePerPage}
                  totalItems={totalElements}
                />{" "}
              </div>
            </div>
            <div className="flex items-center gap-x-3 text-sm lg:hidden">
              <TemporaryDrawer
                closeMedia="(min-width:992px)"
                children={
                  <div className="flex gap-x-2 items-center cursor-pointer hover:opacity-55 transition-opacity">
                    <FilterListIcon />{" "}
                    <p className="font-semibold max-ssm:hidden">
                      Tìm kiếm sản phẩm
                    </p>
                  </div>
                }
                content={
                  <div className="p-4 overflow-hidden">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center w-full">
                        <h1 className="font-medium text-lg capitalize">
                          Danh mục sản phẩm
                        </h1>
                        <button
                          onClick={handleResetFilter}
                          className="bg-background px-4 py-1 hover:bg-primary-color hover:text-white transition-colors whitespace-nowrap text-center"
                        >
                          Đặt lại
                        </button>
                      </div>
                      <CategoryFilter
                        setLoading={setIsLoading}
                        categories={parentCategories}
                      />
                    </div>
                    <div className="flex flex-col space-y-4">
                      <h1 className="font-medium text-lg capitalize">
                        {" "}
                        Lọc theo giá
                      </h1>
                      <div className="flex items-end justify-between">
                        <div>
                          <p>
                            Giá:{" "}
                            {`${prices[0] == 0 ? "0" : prices[0] + "K"} - ${
                              prices[1]
                            }K`}
                          </p>
                        </div>
                        <button
                          onClick={handleFilterByPrice}
                          className="bg-background px-4 py-1 hover:bg-primary-color hover:text-white transition-colors
                text-center"
                        >
                          Lọc
                        </button>
                      </div>
                      <div className="px-1">
                        <Slider
                          step={50} // Set step to 50
                          min={0}
                          max={5000}
                          size={"small"}
                          getAriaLabel={() => "Price range"}
                          value={prices}
                          onChange={handleChangePrice}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => (
                            <div className="p-1">{`${value}K`}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <h1 className="font-medium text-lg capitalize">
                        {" "}
                        Lọc theo màu sắc
                      </h1>
                      <ColorFilter colors={colors} setLoading={setIsLoading} />
                    </div>
                    <div className="flex flex-col space-y-4">
                      <h1 className="font-medium text-lg capitalize">
                        {" "}
                        Lọc theo kích cỡ
                      </h1>
                      <SizeFilter sizes={sizes} setLoading={setIsLoading} />
                    </div>
                  </div>
                }
                anchor={"left"}
                drawerOpen={drawerOpen}
                toggleDrawerOpen={setDrawerOpen}
              />
            </div>
            <div className="flex items-center gap-x-3 text-sm">
              <div className="border-r border-border-color max-lg:hidden">
                <ItemsSelect
                  display={"Hiển thị"}
                  sizePerPage={sizePerPage}
                  handleChangeSelect={handleChangeSelect}
                  items={[
                    {
                      label: "09 sản phẩm",
                      value: 9,
                    },
                    {
                      label: "18 sản phẩm",
                      value: 18,
                    },
                    {
                      label: "36 sản phẩm",
                      value: 36,
                    },
                    {
                      label: "72 sản phẩm",
                      value: 72,
                    },
                  ]}
                />
              </div>
              <div>
                <ItemsSelect
                  display={"Sắp xếp theo"}
                  items={[
                    {
                      label: "Mới nhất",
                      value: 1,
                    },
                    {
                      label: "Phổ biến nhất",
                      value: 2,
                    },
                    {
                      label: "Giá thấp đến cao",
                      value: 3,
                    },
                    {
                      label: "Giá cao đến thấp",
                      value: 4,
                    },
                  ]}
                  sortBy={sortBy}
                  handleChangeSelect={handleChangeSelect}
                />
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="container h-[40vh] grid place-items-center pb-4 mt-8 max-lg:order-3">
              <CircleLoading />
            </div>
          ) : products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-4 border-b border-border-color max-lg:order-3">
                {products &&
                  products.map((p) => (
                    <Link
                      onClick={async () => {
                        await customerBehavior(p.productId);
                      }}
                      href={`/product/${p.productId}`}
                      className="relative hover:cursor-pointer group animate-fadeIn"
                      key={p.productId}
                    >
                      <div className="group-hover:shadow-md transition-all">
                        <div className="relative border border-border-color">
                          <Image
                            width={300}
                            height={400}
                            className="w-full h-56 ssm:h-64 sm:h-96 md:h-[480px] lg:h-96 object-cover object-center"
                            src={p.image}
                            alt="product"
                          />
                          {/* <div
                            className="absolute bottom-2 mx-3 left-0 right-0 group-hover:animate-appearFromBottom bg-background
                     p-2 opacity-0 rounded-lg text-center hover:bg-secondary-color hover:text-white transition-all"
                          >
                            Thêm vào giỏ hàng
                          </div> */}
                        </div>
                        <div className="bg-white bg-opacity-80 py-3 px-2 space-y-2">
                          {/* <div className="flex gap-x-2 items-center">
                            {["red", "pink", "green"].map((color, i) => {
                              return (
                                <div
                                  key={color}
                                  onClick={() => {}}
                                  className={`rounded-full border p-0.5`}
                                >
                                  <div
                                    className="rounded-full size-5"
                                    style={{ backgroundColor: `${color}` }}
                                  ></div>
                                </div>
                              );
                            })}
                          </div> */}
                          <div className="flex gap-x-2 items-center">
                            <Rating
                              name="read-only"
                              precision={0.2}
                              size="small"
                              value={
                                p && p.rating ? Number(p.rating.toFixed(1)) : 0
                              }
                              readOnly
                            />
                            <span className="text-sm font-medium">
                              {p.totalRatings} đánh giá
                            </span>
                          </div>
                          <h3 className="text-sm md:text-base font-normal truncate">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-x-2">
                            {p.priceMin !== p.promotionalPriceMin && (
                              <p className="text-base font-light line-through text-text-light-color">
                                {formatPrice(p.priceMin)}
                              </p>
                            )}
                            <p className={`text-base font-medium`}>
                              {formatPrice(p.promotionalPriceMin) + " VNĐ"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {p.priceMin !== p.promotionalPriceMin && (
                        <label
                          className="absolute top-2 left-2 text-white text-ssm 
              font-bold text-center bg-red-500 px-2 py-0.5 rounded-sm"
                        >
                          {(
                            -(
                              (p.priceMin - p.promotionalPriceMin) /
                              p.priceMin
                            ) * 100
                          ).toFixed(0)}
                          %
                        </label>
                      )}
                    </Link>
                  ))}
              </div>
              <div className="grid place-items-center mt-4 max-lg:order-4">
                <Pagination
                  count={Math.ceil(totalElements / sizePerPage)}
                  page={page == 0 ? 1 : page}
                  onChange={handleChangePage}
                  variant="outlined"
                  color="primary"
                  size="large"
                />
              </div>
            </>
          ) : (
            <div className="text-xl text-center font-semibold p-4 grid place-items-center w-full h-[15vh] text-primary-color">
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default MainProducts;
