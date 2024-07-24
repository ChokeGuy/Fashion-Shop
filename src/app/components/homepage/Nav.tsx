"use client";
import Image from "next/image";
import { emptyCart2, emptyNotify, logo } from "@/src/assests";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import List from "@mui/material/List";
import Link from "next/link";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Badge, { BadgeProps } from "@mui/material/Badge";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { styled } from "@mui/material/styles";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import TemporaryDrawer from "../Drawer";
import CircularIndeterminate from "../Progress";
import { productApi } from "../../apis/productApi";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Dropdown from "../Dropdown";
import Collapse from "@mui/material/Collapse";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import {
  getUserProfileAsync,
  resetUserProfile,
  selectUser,
  selectUserStatus,
} from "@/src/lib/features/user/userSlice";
import Avatar from "@mui/material/Avatar";
import { Category, Product, SingleResponse } from "@/src/models";
import { formatPrice } from "@/src/utilities/price-format";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { getParentCategories } from "@/src/utilities/getUniqueItem";
import { getCookie, hasCookie } from "cookies-next";
import { deleteTokens, setTokens } from "@/src/utilities/tokenHandler";
import { userApi } from "../../apis/userApi";
import { showToast } from "@/src/lib/toastify";
import {
  deleteOneCartItemAsync,
  getAllCartItemsAsync,
  selectCarts,
} from "@/src/lib/features/cart/cartSlice";
import Paper from "@mui/material/Paper";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { setPreviousUrl } from "@/src/lib/features/previous-url/previousUrlSlice";
import {
  getUserAddressAsync,
  selectAddressesStatus,
} from "@/src/lib/features/address/addressSlice";
import CustomPopover, { PopoverButton } from "../PopOver";
import {
  getUserNotifications,
  selectNotifications,
  selectNotifyStatus,
  updateAllNotificationsToWatch,
} from "@/src/lib/features/notification/notificationSlice";
import CircleLoading from "../Loading";

export const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 2,
    top: 2,
    border: `1px solid ${theme.palette.background.paper}`,
    padding: "0",
  },
}));

let input: string = "";

type NavProps = {
  categories: Category[];
};

export const Nav = memo(({ categories }: NavProps) => {
  const pathname = usePathname();
  const { replace, push } = useRouter();
  const tokenParams = useSearchParams();

  const cart = useAppSelector(selectCarts);
  const addressStatus = useAppSelector(selectAddressesStatus);
  const notifications = useAppSelector(selectNotifications);
  const notifyStatus = useAppSelector(selectNotifyStatus);
  const parentCategories = getParentCategories(categories);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [notiAmount, setNotiAmount] = useState(1);
  const [notiLoading, setNotiLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [products, setProducts] = useState<Product[] | undefined>([]); // Set the initial state to an empty array

  const [openCollapse, setOpenCollapse] = useState<Record<string, boolean>>({});
  const [showProducts, setShowProducts] = useState(false); //Show products when focused on search input
  const [drawerOpen, setDrawerOpen] = useState(false); // Set the initial state to false
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const contents = [
    {
      name: "Search",
      link: null,
      icon: <SearchIcon />,
    },
    {
      name: userStatus === "succeeded" ? user.fullname : "Đăng nhập",
      link: userStatus === "succeeded" ? "/account/profile" : "/login",
      icon:
        userStatus === "succeeded" ? (
          <Avatar
            className="cursor-pointer"
            src={(user.avatar as string) || ""}
          >
            {user.fullname && user.fullname[0].toUpperCase()}
          </Avatar>
        ) : (
          <PersonOutlineIcon
            sx={{ fill: "rgba(0,0,0,0.5)" }}
            className="text-[1.75rem]"
          />
        ),
    },
    {
      name: "Favorite",
      link: "/favorite",
      icon: <FavoriteBorderIcon />,
    },
    {
      name: "Notification",
      link: "/account/notification",
      icon: (
        <StyledBadge
          badgeContent={notifications.newNotification}
          color="error"
          showZero
          max={999}
          className="cursor-pointer"
        >
          <NotificationsNoneIcon />
        </StyledBadge>
      ),
    },
    {
      name: "Cart",
      link: "/cart",
      icon: (
        <StyledBadge
          badgeContent={cart && cart.cartItems ? cart.cartItems.length : null}
          color="error"
          showZero
          max={999}
        >
          <ShoppingCartOutlinedIcon />
        </StyledBadge>
      ),
    },
  ];

  const observer = useRef<any>();
  const containerRef = useRef(null);

  useEffect(() => {
    const accessToken = hasCookie("accessToken");
    const refreshToken = hasCookie("refreshToken");
    if (accessToken || refreshToken) {
      if (notifyStatus === "idle") {
        dispatch(getUserNotifications({ page: 0, size: 6 }));
      }
    }

    return () => {
      // Đây là hàm cleanup, sẽ được gọi khi component unmount
      // Reset các trạng thái về giá trị mặc định
      if (accessToken || refreshToken) {
        dispatch(getUserNotifications({ page: 0, size: 6 }));
      }
      setNotiAmount(1); // Giả sử giá trị mặc định là 0
      setHasMore(true); // Giả sử giá trị mặc định là true
      // Bạn cũng có thể cần reset các trạng thái khác nếu cần
    };
  }, [userStatus]);

  const lastNotificationElementRef = useCallback(
    (node: any) => {
      if (notiLoading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const getNotifications = async () => {
            setNotiLoading(true);
            const newAmount = notiAmount + 1;
            setNotiAmount(newAmount);
            await dispatch(
              getUserNotifications({
                page: 0,
                size: newAmount * 6,
              })
            );
            setHasMore(newAmount * 6 < notifications.totalElements);
            setNotiLoading(false);
          };
          getNotifications();
        }
      });
      if (node) observer.current.observe(node);
    },
    // Xem xét lại các phụ thuộc nếu cần
    [notiLoading, hasMore, notifications]
  );

  useEffect(() => {
    const accessToken = tokenParams.get("accessToken");
    const refreshToken = tokenParams.get("refreshToken");
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      replace(`${pathname}`, { scroll: false });
    }
  }, []);

  useEffect(() => {
    dispatch(setPreviousUrl(pathname));

    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    const accessToken = hasCookie("accessToken");
    const refreshToken = hasCookie("refreshToken");
    if (accessToken || refreshToken) {
      if (userStatus === "idle") {
        dispatch(getUserProfileAsync());
      }
      if (addressStatus === "idle") {
        dispatch(getUserAddressAsync());
      }
      dispatch(getAllCartItemsAsync());
    } else dispatch(resetUserProfile());
    // setIsUserInfoLoading(false);
  }, [userStatus, addressStatus]);

  const [openSearch, setOpenSearch] = useState(false);
  const handleOpenSearch = () => {
    setOpenSearch(!openSearch);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    keyword?: string
  ) => {
    const name = e.target.value;
    setSearchInput(name);

    if (name && name.length == 0) {
      setShowProducts(false);
      return;
    }

    handleSearch(name);
    setShowProducts(true);
  };

  const handleSearchHistory = (keyword: string) => {
    setSearchInput(keyword);
    handleSearch(keyword);
    setShowProducts(true);
    searchInputRef.current?.focus();
  };

  const handleAddToSearchHistory = (keyword: string) => {
    // Lấy lịch sử tìm kiếm từ localStorage
    let searchHistory = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    );

    // Kiểm tra xem keyword có rỗng hay không, có độ dài tối thiểu là 2 ký tự, và chưa tồn tại trong lịch sử tìm kiếm
    if (keyword && keyword.length >= 2 && !searchHistory.includes(keyword)) {
      // Thêm từ khóa tìm kiếm mới vào lịch sử
      searchHistory.push(keyword);

      // Nếu lịch sử tìm kiếm có nhiều hơn 5 mục, xóa mục cũ nhất
      if (searchHistory.length > 5) {
        searchHistory.shift();
      }

      // Lưu lịch sử tìm kiếm trở lại localStorage
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputParams = new URLSearchParams();
      if (searchInput && searchInput.length > 0) {
        inputParams.set("keyword", searchInput);

        const keyword = inputParams.get("keyword");
        keyword && keyword.length >= 2 && handleAddToSearchHistory(keyword);

        push(`/product?${inputParams.toString()}`, { scroll: false });
        if (pathname.includes("/product") || pathname.includes("/category")) {
          setTimeout(() => {
            setOpenSearch(false);
            window.scrollTo(370, 275);
          }, 300);
        }
      } else inputParams.delete("keyword");
    }
  };

  const handleSearchByClick = () => {
    const inputParams = new URLSearchParams();
    if (searchInput && searchInput.length > 0) {
      inputParams.set("keyword", searchInput);

      const keyword = inputParams.get("keyword");
      keyword && keyword.length >= 2 && handleAddToSearchHistory(keyword);

      push(`/product?${inputParams.toString()}`, { scroll: false });
      if (pathname.includes("/product") || pathname.includes("/category")) {
        setTimeout(() => {
          setOpenSearch(false);
          window.scrollTo(370, 275);
        }, 300);
      }
    } else inputParams.delete("keyword");
  };

  const handleDeleteSearchHistory = (index: number) => {
    let searchHistory = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    );
    searchHistory.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    setSearchHistory(searchHistory);
  };

  const handleCollapse = (id: string) => {
    setOpenCollapse({ ...openCollapse, [id]: !openCollapse[id] });
  };

  const handleFocus = () => {
    setShowProducts(true);
  };

  const handleBlur = () => {
    setShowProducts(false);
  };

  const handleSearch = useCallback(
    debounce(async (name: string) => {
      setIsLoading(true); // Set isLoading to true before making the API call
      try {
        const result = await productApi.getAllProductsByName(name);
        setProducts(result?.result.content);
      } finally {
        setIsLoading(false); // Set isLoading to false after the API call is complete
      }
    }, 300),
    [products]
  );

  const handleWatchAllNotifications = () => {
    if (hasCookie("accessToken")) {
      dispatch(updateAllNotificationsToWatch());
    }
  };

  const handleLogoutAccount = async () => {
    const refreshToken = getCookie("refreshToken");
    if (refreshToken) {
      const result = await userApi.logout({ refreshToken });
      if (result?.success) {
        if (
          pathname.includes("/account") ||
          pathname.includes("/admin") ||
          pathname.includes("/shipper")
        ) {
          showToast("Đăng xuất thành công", "success");
        }
        dispatch(getUserProfileAsync());
        dispatch(getAllCartItemsAsync());
        dispatch(getUserAddressAsync());
        dispatch(getUserNotifications());
      }
    }
    replace("/login");
    deleteTokens();
  };

  return (
    <>
      <nav className="border border-border-color relative z-40 bg-white">
        <div className="flex items-center lg:h-[5.25rem] h-[4.25rem] container justify-between max-lg:gap-x-8">
          <div className="flex gap-x-12 max-md:flex-col max-md:gap-y-2 items-center">
            <div>
              <Link replace={true} href={"/"}>
                <Image className="w-[7.5rem]" src={logo} alt="Logo"></Image>
              </Link>
            </div>
            <div className="hidden items-center gap-x-8 justify-between lg:flex font-medium">
              {parentCategories &&
                parentCategories.slice(0, 5).map((category, index) => {
                  return (
                    <div key={category.categoryId || index}>
                      <Dropdown
                        hoverChildren={
                          <Link
                            href={`/category/${category.name || "/product"}`}
                          >
                            <div className="flex gap-x-1 items-center">
                              {category.name}
                              <div className="pb-1 max-md:hidden">
                                <KeyboardArrowDownIcon />
                              </div>
                            </div>
                          </Link>
                        }
                        children={
                          Array.isArray(category.children) &&
                          category.children.map((subCategory, subIndex) => (
                            <Link
                              key={
                                "desk-cate-" + subCategory.categoryId ||
                                subIndex
                              }
                              className="w-full"
                              href={`/category/${subCategory.name}`}
                            >
                              {subCategory.name}
                            </Link>
                          ))
                        }
                      />
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="flex gap-x-4 items-center max-sm:hidden">
            <div onClick={handleOpenSearch}>
              {!openSearch ? (
                <SearchIcon
                  sx={{ fill: "rgba(0,0,0,0.7)" }}
                  className="cursor-pointer text-[1.75rem]"
                />
              ) : (
                <CloseIcon
                  sx={{ fill: "rgba(0,0,0,0.7)" }}
                  className="cursor-pointer text-[1.75rem]"
                />
              )}
            </div>
            <div>
              {userStatus === "succeeded" ? (
                <Dropdown
                  hoverChildren={
                    <Link href={"/account/profile"}>
                      <Avatar
                        className="cursor-pointer"
                        src={(user.avatar as string) || ""}
                      >
                        {(user.fullname && user.fullname[0].toUpperCase()) ||
                          "T"}
                      </Avatar>
                    </Link>
                  }
                  children={
                    <>
                      {[
                        {
                          title: "Tài khoản của tôi",
                          link: "/profile",
                        },
                        {
                          title: "Đơn mua",
                          link: "/order-tracking",
                        },
                      ].map((item) => (
                        <Link
                          replace={true}
                          key={item.title}
                          className="font-medium w-full"
                          href={`/account/${item.link}`}
                        >
                          {item.title}
                        </Link>
                      ))}
                      <div
                        className="font-medium w-full cursor-pointer"
                        onClick={handleLogoutAccount}
                      >
                        Đăng xuất
                      </div>
                    </>
                  }
                  isLogin={userStatus === "succeeded"}
                />
              ) : (
                <Dropdown
                  hoverChildren={
                    <div onClick={() => replace("/login")}>
                      <PersonOutlineIcon
                        sx={{ fill: "rgba(0,0,0,0.7)" }}
                        className="text-[1.75rem]"
                      />
                    </div>
                  }
                  children={[
                    {
                      title: "Đăng nhập",
                      link: "/login",
                    },
                    {
                      title: "Đăng ký",
                      link: "/register",
                    },
                  ].map((item) => (
                    <div
                      onClick={() => replace(item.link)}
                      key={item.title}
                      className="font-medium w-full"
                      // href={`${item.link}`}
                    >
                      {item.title}
                    </div>
                  ))}
                  isLogin={userStatus == "failed" || userStatus == "idle"}
                />
              )}
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                //Must login to add item to cart
                if (!user.isVerified) {
                  showToast(
                    "Vui lòng đăng nhập để theo dõi sản phẩm yêu thích",
                    "warning"
                  );
                  push("/login");
                } else replace("/favorite");
              }}
            >
              <FavoriteBorderIcon
                sx={{ fill: "rgba(0,0,0,0.7)" }}
                className="cursor-pointer text-[1.75rem]"
              />
            </div>
            <div>
              <CustomPopover
                button={
                  <StyledBadge
                    onClick={handleWatchAllNotifications}
                    badgeContent={notifications.newNotification}
                    color="error"
                    showZero
                    max={999}
                    className="cursor-pointer"
                  >
                    <NotificationsNoneIcon
                      sx={{ fill: "rgba(0,0,0,0.7)" }}
                      className="text-[1.75rem]"
                    />
                  </StyledBadge>
                }
                content={
                  <div className="relative w-full max-h-72 overflow-hidden">
                    <div
                      className="w-60 h-fit max-h-[250px] overflow-auto"
                      ref={containerRef}
                    >
                      {notifications.value && notifications.value.length > 0 ? (
                        notifications.value.map((notification, index) => {
                          if (notifications.value.length === index + 1) {
                            return (
                              <div
                                key={notification.notificationId}
                                ref={lastNotificationElementRef}
                                className="flex items-center justify-between gap-x-2 p-2 border-b border-border-color
                           hover:bg-background transition-all"
                              >
                                <Link
                                  href={`/account/order-tracking?orderKeyword=${notification.orderId}`}
                                  key={notification.notificationId}
                                >
                                  <p className="text-sm">
                                    {notification.content}
                                  </p>
                                </Link>
                                <PopoverButton
                                  notificationId={notification.notificationId}
                                />
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={notification.notificationId}
                                className="flex items-center justify-between gap-x-2 p-2 border-b border-border-color
                           hover:bg-background transition-all"
                              >
                                <Link
                                  href={`/account/order-tracking?orderKeyword=${notification.orderId}`}
                                  key={notification.notificationId}
                                >
                                  <p className="text-sm">
                                    {notification.content}
                                  </p>
                                </Link>
                                <PopoverButton
                                  notificationId={notification.notificationId}
                                />
                              </div>
                            );
                          }
                        })
                      ) : (
                        <div className="p-2 size-full grid place-items-center text-primary-color">
                          <Image
                            className="object-cover object-center size-full"
                            alt="empty-notify"
                            src={emptyNotify}
                          ></Image>
                        </div>
                      )}
                    </div>
                    {notifications.value &&
                      notifications.value.length > 0 &&
                      notiLoading && (
                        <div className="absolute bottom-[5%] left-[42%] size-8">
                          <CircleLoading />
                        </div>
                      )}
                  </div>
                }
              ></CustomPopover>
            </div>
            <div>
              {" "}
              <Dropdown
                hoverChildren={
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      //Must login to add item to cart
                      if (!user.isVerified) {
                        showToast(
                          "Vui lòng đăng nhập để sử dụng giỏ hàng",
                          "warning"
                        );
                        push("/login");
                      } else replace("/cart");
                    }}
                    // href={"/cart"}
                  >
                    <StyledBadge
                      badgeContent={
                        cart && cart.cartItems ? cart.cartItems.length : null
                      }
                      color="error"
                      showZero
                      max={999}
                    >
                      <ShoppingCartOutlinedIcon
                        sx={{ fill: "rgba(0,0,0,0.7)" }}
                        className="text-[1.75rem]"
                      />
                    </StyledBadge>
                  </div>
                }
                children={<CartNav />}
                isLogin={userStatus == "succeeded" || userStatus === "idle"}
                isCart={userStatus == "succeeded" || userStatus === "idle"}
              ></Dropdown>
            </div>
          </div>
          <div className="hidden max-sm:block cursor-pointer">
            <TemporaryDrawer
              children={<MenuIcon className="text-[1.75rem]" />}
              content={
                <>
                  <List>
                    {contents.map((content) => {
                      if (content.name === "Search")
                        return (
                          <ListItem
                            key={content.name}
                            onClick={() => {
                              handleOpenSearch();
                              setDrawerOpen(!drawerOpen);
                            }}
                            disablePadding
                          >
                            <ListItemButton className="cursor-pointer px-4 py-2">
                              <ListItemIcon>{content.icon}</ListItemIcon>
                              <ListItemText primary={content.name} />
                            </ListItemButton>
                          </ListItem>
                        );

                      return (
                        <Link
                          replace={true}
                          key={content.name}
                          href={content.link || ""}
                        >
                          <ListItem disablePadding>
                            <ListItemButton className="cursor-pointer px-4 py-2">
                              <ListItemIcon>{content.icon}</ListItemIcon>
                              <ListItemText primary={content.name} />
                            </ListItemButton>
                          </ListItem>
                        </Link>
                      );
                    })}
                  </List>
                  <Divider />
                  <div className="max-ssm:block hidden p-4">
                    <div className="justify-between flex flex-col font-medium">
                      {parentCategories &&
                        parentCategories.length > 0 &&
                        parentCategories.slice(0, 5).map((category, index) => {
                          return (
                            <div
                              key={category.categoryId || "main-cate" + index}
                            >
                              <div
                                onClick={() =>
                                  parentCategories[index].children &&
                                  handleCollapse(
                                    parentCategories[
                                      index
                                    ].categoryId.toString()
                                  )
                                }
                                className="flex items-center justify-between py-1.5"
                              >
                                {category.name}
                                <div>
                                  <KeyboardArrowDownIcon />
                                </div>
                              </div>
                              {parentCategories[index].children && (
                                <Collapse
                                  in={
                                    openCollapse[
                                      parentCategories[index].categoryId
                                    ] || false
                                  }
                                >
                                  {parentCategories[index].children?.map(
                                    (subCategory) => {
                                      return (
                                        <Link
                                          key={
                                            "mobile-sub-cate" +
                                            subCategory.categoryId
                                          }
                                          className="pt-1 hover:text-primary-color transition-colors text-text-color"
                                          href={`/${subCategory.name}`}
                                        >
                                          {subCategory.name}
                                        </Link>
                                      );
                                    }
                                  )}
                                </Collapse>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              }
              anchor={"right"}
              drawerOpen={drawerOpen}
              toggleDrawerOpen={setDrawerOpen}
            />
          </div>
        </div>
        <div className="max-ssm:hidden lg:hidden items-center gap-x-4 md:gap-x-8  justify-center flex pb-1 font-medium">
          {parentCategories &&
            parentCategories.length > 0 &&
            parentCategories.slice(0, 5).map((category) => {
              return (
                <div key={category.categoryId}>
                  <Dropdown
                    hoverChildren={
                      <Link
                        href={`/category/${category.name}`}
                        className="flex gap-x-1 items-center"
                      >
                        {category.name}
                        <div className="pb-1 max-md:hidden">
                          <KeyboardArrowDownIcon />
                        </div>
                      </Link>
                    }
                    children={
                      category &&
                      category.children &&
                      category.children.map((subCategory) => (
                        <Link
                          key={"mobile-sub-cate-" + subCategory.categoryId}
                          href={`/category/${subCategory.name}`}
                        >
                          {subCategory.name}
                        </Link>
                      ))
                    }
                  />
                </div>
              );
            })}
        </div>
      </nav>
      {openSearch && (
        <div className="max-ssm:pt-[122px] pt-[142px] md:pt-[132px] bg-white absolute bottom-0 left-0 right-0 top-0 xl:top-[20%] z-10 h-screen animate-appear">
          <div className="container pt-7">
            <div>
              <p className="mb-2.5 flex justify-between items-center font-semibold">
                Bạn đang tìm kiếm gì?{" "}
                <span>
                  <CloseIcon
                    sx={{ fill: "rgba(0,0,0,0.7)" }}
                    onClick={handleOpenSearch}
                    className="cursor-pointer text-[1.25rem] animate-appear"
                  />
                </span>
              </p>
              <form className="w-full relative">
                <input
                  type="text"
                  value={searchInput}
                  ref={searchInputRef}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full border-0 border-b-2 border-border-color focus:border-text-light-color
                   py-4 text-sm focus:outline-0 focus:ring-0"
                  onKeyDown={(e) => handleKeyDown(e)}
                  onChange={(e) => handleChange(e)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {showProducts && (
                  <Paper
                    className={`absolute z-10 bg-white w-full ${
                      products &&
                      products.length > 0 &&
                      "border border-border-color"
                    }`}
                  >
                    <div className={`max-h-[200px] overflow-auto`}>
                      {products && products.length > 0
                        ? products.map((product) => (
                            <Link
                              onMouseDown={() => {
                                push(`/product/${product.productId}`);
                                setTimeout(() => {
                                  handleOpenSearch();
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
                                <span className="font-bold text-base w-[48rem]">
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
                {!isLoading ? (
                  <div onClick={handleSearchByClick}>
                    <SearchIcon
                      sx={{ fill: "rgba(0,0,0,0.7)" }}
                      className="cursor-pointer text-[2rem] absolute right-2 top-[25%]"
                    />
                  </div>
                ) : (
                  <CircularIndeterminate size={22} />
                )}
              </form>
              {searchHistory && searchHistory.length > 0 && (
                <>
                  <p className="mt-6 mb-2 font-semibold">Lịch sử tìm kiếm:</p>
                  <ul className="flex flex-col space-y-3">
                    {searchHistory.map((searchTerm, index) => (
                      <li key={index} className="flex items-center gap-x-2">
                        {/* Khi nhấp vào mục, đặt từ khóa tìm kiếm vào trường nhập liệu */}
                        <span
                          onClick={() => handleSearchHistory(searchTerm)}
                          className="cursor-pointer w-[8rem] truncate"
                        >
                          {searchTerm}
                        </span>

                        {/* Nút xóa từ khóa tìm kiếm khỏi lịch sử */}

                        <CancelIcon
                          className="fill-primary-color cursor-pointer hover:opacity-60 transition-opacity"
                          onClick={() => handleDeleteSearchHistory(index)}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

const CartNav = () => {
  const [isDeleteCartItems, setIsDeleteCartItems] = useState(false);
  const cart = useAppSelector(selectCarts);
  const dispatch = useAppDispatch();
  const getTotalPrice = () => {
    return cart.cartItems.reduce((total, item) => {
      return total + item.promotionalPrice * item.quantity;
    }, 0);
  };

  const handleDeleteCart = async (cartItemId: number) => {
    if (isDeleteCartItems) return;

    setIsDeleteCartItems(true);
    const result = await dispatch(deleteOneCartItemAsync(cartItemId));
    if (((result.payload as any).response as SingleResponse<any>).success) {
      showToast("Xóa sản phẩm thành công", "success");
    }
    setIsDeleteCartItems(false);
  };

  return (
    <div>
      {cart && cart.cartItems && cart.cartItems.length > 0 ? (
        <>
          {cart.cartItems.map((item) => (
            <div
              className="py-4 border-b border-border-color flex items-start gap-x-4"
              key={item.cartItemId}
            >
              <div className="border border-border-color">
                <Image
                  width={96}
                  height={112}
                  className="w-24 h-28 object-cover object-center p-0.5"
                  src={item.image}
                  alt="cart-img"
                ></Image>
              </div>
              <div className="text-base space-y-1">
                <div className="flex items-start gap-x-5">
                  <Link
                    href={`product/${item.productId}`}
                    className="text-text-color w-36 line-clamp-2 hover:underline hover:text-primary-color transition-colors"
                  >
                    {item.productName}
                  </Link>
                  <button
                    disabled={isDeleteCartItems}
                    onClick={() => handleDeleteCart(item.cartItemId)}
                    className="flex justify-center items-center
                   hover:opacity-60 transition-opacity"
                  >
                    <CancelIcon className="fill-primary-color" />
                  </button>
                </div>
                <span>Số lượng: {item.quantity} sản phẩm</span>
                <div className="w-full">
                  Phân loại: {item.styleValues.join(", ")}
                </div>
                <p className="text-secondary-color text-lg font-semibold">
                  Giá:{" "}
                  {item.promotionalPrice &&
                    formatPrice(item.promotionalPrice) + " VNĐ"}
                </p>
              </div>
            </div>
          ))}
          <div className="text-secondary-color text-xl font-semibold flex items-center justify-between py-4">
            <span>Tổng tiền:</span>
            <span>{formatPrice(getTotalPrice()) + " VNĐ"} </span>
          </div>
          <div className="w-full flex justify-end">
            <Link replace={true} href="/cart">
              <button className="bg-primary-color text-white p-2 rounded-md hover:opacity-60 transition-opacity">
                Xem giỏ hàng
              </button>
            </Link>
          </div>
        </>
      ) : (
        <div className="w-full h-48 grid place-items-center">
          <Image
            width={208}
            height={208}
            className="h-52 w-56"
            src={emptyCart2}
            alt="empty-cart-img-2"
          />
        </div>
      )}
    </div>
  );
};
