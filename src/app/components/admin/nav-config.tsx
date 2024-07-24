import Image from "next/image";
// ----------------------------------------------------------------------
import {
  cartSvg,
  analyticsSvg,
  userSvg,
  categorySvg,
  brandSvg,
  styleSvg,
  styleValueSvg,
  couponSvg,
  bannerSvg,
  orderSvg,
  tagSvg,
} from "@/src/assests/icons/navbar";
const icon = (src: string) => (
  <Image
    className="inline-block bg-current ml-2"
    width={18}
    height={18}
    src={src}
    alt={"svg-img"}
  />
);

const navConfig = [
  {
    title: "Thống kê",
    path: "/admin",
    icon: icon(analyticsSvg),
  },
  {
    title: "Đơn hàng",
    path: "/admin/orders",
    icon: icon(orderSvg),
  },
  {
    title: "Người giao hàng",
    path: "/admin/shippers",
    icon: icon(userSvg),
  },
  {
    title: "Khách hàng",
    path: "/admin/users",
    icon: icon(userSvg),
  },
  {
    title: "Sản phẩm",
    path: "/admin/products",
    icon: icon(cartSvg),
  },
  {
    title: "Nhãn sản phẩm",
    path: "/admin/tags",
    icon: icon(tagSvg),
  },
  {
    title: "Danh mục sản phẩm",
    path: "/admin/categories",
    icon: icon(categorySvg),
  },
  {
    title: "Thương hiệu",
    path: "/admin/brands",
    icon: icon(brandSvg),
  },
  {
    title: "Thuộc tính",
    path: "/admin/styles",
    icon: icon(styleSvg),
  },
  {
    title: "Giá trị thuộc tính",
    path: "/admin/style-values",
    icon: icon(styleValueSvg),
  },
  {
    title: "Chương trình khuyến mãi",
    path: "/admin/promotions",
    icon: icon(couponSvg),
  },
  {
    title: "Banner quảng cáo",
    path: "/admin/banners",
    icon: icon(bannerSvg),
  },
];

export default navConfig;
