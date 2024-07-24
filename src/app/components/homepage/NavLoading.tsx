"use client";
import { logo } from "@/src/assests";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import Dropdown from "../Dropdown";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TemporaryDrawer from "../Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Collapse from "@mui/material/Collapse";
import { StyledBadge } from "./Nav";
import { getParentCategories } from "@/src/utilities/getUniqueItem";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const NavLoading = () => {
  const parentCategories = getParentCategories([
    {
      categoryId: 1,
      name: "Quần Áo",
      parentName: undefined,
      children: [
        {
          name: "Quần Áo Nam",
          categoryId: 2,
        },
        {
          name: "Quần Áo Nữ",
          categoryId: 5,
        },
        {
          name: "Quần áo trẻ em",
          categoryId: 10,
        },
        {
          name: "Quần áo công sở",
          categoryId: 20,
        },
      ],
      image: "",
      styleNames: [],
    },
    {
      categoryId: 4,
      name: "Đồng hồ",
      parentName: undefined,
      children: [
        {
          name: "Đồng hồ nam",
          categoryId: 18,
        },
        {
          name: "Đồng hồ nữ",
          categoryId: 13,
        },
      ],
      image:
        "https://res.cloudinary.com/dhkkwz2fo/image/upload/v1700334729/FashionShop/Category/uyh3lsdc5xpegup77hfl.jpg",
      styleNames: ["Color"],
    },
    {
      categoryId: 3,
      name: "Giày Dép",
      parentName: undefined,
      children: [
        {
          name: "Giày dép nam",
          categoryId: 14,
        },
        {
          name: "Giày dép nữ",
          categoryId: 15,
        },
      ],
      image:
        "https://res.cloudinary.com/dhkkwz2fo/image/upload/v1700331565/FashionShop/Category/dga85f6njuz3mdvvwqva.png",
      styleNames: ["Size", "Color"],
    },
    {
      categoryId: 6,
      name: "Túi xách",
      parentName: undefined,
      children: [
        {
          name: "Túi xách nữ",
          categoryId: 17,
        },
      ],
      image:
        "https://res.cloudinary.com/dhkkwz2fo/image/upload/v1700958172/FashionShop/Category/viqxtr2jc6f1hnbkro27.jpg",
      styleNames: ["Color"],
    },
    {
      categoryId: 11,
      name: "Nón",
      parentName: undefined,
      children: [
        {
          name: "Nón nam",
          categoryId: 12,
        },
        {
          name: "Nón thể thao",
          categoryId: 19,
        },
      ],
      image:
        "https://res.cloudinary.com/dhkkwz2fo/image/upload/v1700994943/FashionShop/Category/i7owlynfh1mdnn7tnkz4.jpg",
      styleNames: ["Color"],
    },
  ]);

  const contents = [
    {
      name: "Đăng nhập",
      link: "/login",
      icon: (
        <PersonOutlineIcon
          sx={{ fill: "rgba(0,0,0,0.5)" }}
          className="text-[1.75rem]"
        />
      ),
    },
    {
      name: "Search",
      link: null,
      icon: <SearchIcon />,
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
          badgeContent={null}
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
        <StyledBadge badgeContent={null} color="error" showZero max={999}>
          <ShoppingCartOutlinedIcon />
        </StyledBadge>
      ),
    },
  ];

  return (
    <nav className="border border-border-color relative z-40 bg-white">
      <div className="flex items-center lg:h-[5.25rem] h-[4.25rem] container justify-between max-lg:gap-x-8">
        <div className="flex gap-x-12 max-md:flex-col max-md:gap-y-2 items-center">
          <div>
            <Link href={"/"}>
              <Image className="w-[7.5rem]" src={logo} alt="Logo"></Image>
            </Link>
          </div>
          <div className="hidden items-center gap-x-8 justify-between lg:flex font-medium">
            {parentCategories &&
              parentCategories.slice(0, 5).map((category, index) => {
                return (
                  <div key={category.categoryId || index}>
                    <Link href={`/category/${category.name || "/product"}`}>
                      <div className="flex gap-x-1 items-center">
                        {category.name}
                        <div className="pb-1 max-md:hidden">
                          <KeyboardArrowDownIcon />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="flex gap-x-4 items-center max-sm:hidden">
          <div>
            <SearchIcon
              sx={{ fill: "rgba(0,0,0,0.7)" }}
              className="cursor-pointer text-[1.75rem]"
            />
          </div>
          <div>
            {
              <Dropdown
                hoverChildren={
                  <Link href={"/login"}>
                    <PersonOutlineIcon
                      sx={{ fill: "rgba(0,0,0,0.7)" }}
                      className="text-[1.75rem]"
                    />
                  </Link>
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
                  <Link
                    key={item.title}
                    className="font-medium w-full"
                    href={`${item.link}`}
                  >
                    {item.title}
                  </Link>
                ))}
                isLogin={true}
              />
            }
          </div>
          <div className="cursor-pointer">
            <FavoriteBorderIcon
              sx={{ fill: "rgba(0,0,0,0.7)" }}
              className="cursor-pointer text-[1.75rem]"
            />
          </div>
          <div>
            <StyledBadge
              badgeContent={null}
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
          </div>
          <div>
            <Link href={"/cart"}>
              <StyledBadge badgeContent={null} color="error" showZero max={999}>
                <ShoppingCartOutlinedIcon
                  sx={{ fill: "rgba(0,0,0,0.7)" }}
                  className="text-[1.75rem]"
                />
              </StyledBadge>
            </Link>
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
                        <ListItem key={content.name} disablePadding>
                          <ListItemButton className="cursor-pointer px-4 py-2">
                            <ListItemIcon>{content.icon}</ListItemIcon>
                            <ListItemText primary={content.name} />
                          </ListItemButton>
                        </ListItem>
                      );
                    return (
                      <Link key={content.name} href={content.link || ""}>
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
                          <div key={category.categoryId || "main-cate" + index}>
                            <div className="flex items-center justify-between py-1.5">
                              {category.name}
                              <div>
                                <KeyboardArrowDownIcon />
                              </div>
                            </div>
                            {parentCategories[index].children && (
                              <Collapse in={false}>
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
            drawerOpen={false}
            toggleDrawerOpen={() => {}}
          />
        </div>
      </div>
      <div className="max-ssm:hidden lg:hidden items-center gap-x-4 md:gap-x-8  justify-center flex pb-1 font-medium">
        {parentCategories &&
          parentCategories.length > 0 &&
          parentCategories.slice(0, 5).map((category) => {
            return (
              <div key={category.categoryId}>
                <Link
                  href={`/category/${category.name}`}
                  className="flex gap-x-1 items-center"
                >
                  {category.name}
                  <div className="pb-1 max-md:hidden">
                    <KeyboardArrowDownIcon />
                  </div>
                </Link>
              </div>
            );
          })}
      </div>
    </nav>
  );
};

export default NavLoading;
