import React from "react";
import { Nav } from "../components/homepage/Nav";
import Image from "next/image";
import Link from "next/link";
import { logo } from "@/src/assests";
import { Suspense } from "react";
import { categoryApi } from "../apis/categoryApi";
import NavLoading from "../components/homepage/NavLoading";

type Props = {
  children: React.ReactNode;
};

const HomePageLayout = async ({ children }: Props) => {
  const data = await categoryApi.getAllCategories();
  const categories = data?.result.content || [];

  return (
    //Nav section
    <section>
      <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
      {/* @ts-ignore */}
      <df-messenger
        intent="WELCOME"
        chat-title="AT Shop"
        agent-id="cb7012c3-fafd-44c6-a2ad-4c9edd070914"
        language-code="vi"
      />
      <div className="sticky top-0 z-20">
        <div className="bg-banner-color text-white text-center grid place-content-center relative z-20">
          <p className="text-ssm px-8 py-2.5 font-medium uppercase">
            Tưng bừng khai trương, giảm giá 30% cho toàn bộ sản phẩm
          </p>
        </div>
        <Suspense fallback={<NavLoading />}>
          <Nav categories={categories} />
        </Suspense>
      </div>
      {/* Main Section */}
      <main className="animate-appear">{children}</main>

      {/* Footer Section */}
      <footer className="lg:container sssm:px-4 animate-appear ">
        <div className="grid grid-cols-12 gap-x-8 xl:gap-x-[9rem] gap-y-8 border-b border-border-color py-[3.75rem]">
          <div className="col-span-full md:col-span-4 xl:col-span-3 text-sm flex flex-col gap-y-4">
            <Link href="/">
              <Image
                className="w-[9rem] aspect-[106/33]"
                src={logo}
                alt="Logo"
              />
            </Link>
            <p>
              Chào mừng bạn đến với cửa hàng thời trang này. Chúng tôi cung cấp
              một loạt trang phục thời trang chất lượng xứng đáng với giá tiền.
            </p>
            <span className="whitespace-nowrap">
              0376399721 – nguyenthang13a32020@gmail.com
            </span>
          </div>
          <div className="col-span-full md:col-span-3 xl:col-span-2 flex justify-between flex-col">
            <h3 className="text-lg font-bold mb-3">Thông tin</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/">Về chúng tôi</Link>
              </li>
              <li>
                <Link className="whitespace-nowrap" href="/-policy">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link href="/">Điều khoản dịch vụ</Link>
              </li>
            </ul>
          </div>
          <div className="col-span-full md:col-span-3 xl:col-span-2 flex justify-between flex-col">
            <h3 className="text-lg font-bold mb-3">Tài khoản</h3>
            <ul className="space-y-1">
              <li>
                <Link replace={true} href="/register">
                  Đăng ký
                </Link>
              </li>
              <li>
                <Link replace={true} href="/login">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link replace={true} href="/account/order-tracking">
                  Đơn hàng của tôi
                </Link>
              </li>
              <li>
                <Link replace={true} href="/account/profile">
                  Chi tiết tài khoản
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-full md:col-span-2 xl:col-span-2 flex justify-between flex-col">
            <h3 className="text-lg font-bold mb-3">Danh mục</h3>
            <ul className="space-y-1">
              {categories &&
                categories.slice(0, 4).map((category) => (
                  <li key={category.categoryId}>
                    <Link href={`/category/${category.name}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="py-8 text-center text-primary-color">
          &copy; 2024 Bản quyền thuộc về Ngô Thừa Ân và Nguyễn Ngọc Thắng. Vui
          lòng không sao chép dưới mọi hình thức
        </div>
      </footer>
    </section>
  );
};

export default HomePageLayout;
