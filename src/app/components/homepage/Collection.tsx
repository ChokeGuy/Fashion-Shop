import { collection1, collection2 } from "@/src/assests";
import Image from "next/image";
import EastIcon from "@mui/icons-material/East";
import Link from "next/link";
import { setPreviousUrl } from "@/src/lib/features/previous-url/previousUrlSlice";

export default function Collection() {
  return (
    <section className="lg:container mt-0 md:mt-16 transition-all">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-8">
          <div className="flex flex-col xl:justify-between px-4 max-xl:gap-y-6">
            <Image
              src={collection1}
              alt="collection-img"
              className="w-full"
              width={620}
              height={780}
            />
            <div className="text-base space-y-4 xl:pl-28">
              <blockquote className="font-normal text-text-light-color">
                "Thể thao không chỉ là một hoạt động, mà còn là một phong cách
                sống. Đồ thể thao không chỉ là trang phục, mà còn là biểu tượng
                của sự tự tin và sức khỏe."
              </blockquote>
              <h2 className="font-medium">Bill Bowerman</h2>
            </div>
          </div>
          <div className="px-4">
            <div className="flex flex-col gap-y-6 justify-start">
              <h1 className="text-ssm uppercase font-semibold">
                Bộ sưu tập mới
              </h1>
              <h2 className="text-3xl font-medium">
                Áo nỉ và đồ thể thao tốt nhất cho mọi người!
              </h2>
              <p className="text-text-light-color text-sm lg:text-lg">
                Áo nỉ và đồ thể thao là những sản phẩm phổ biến trong thời trang
                hiện nay. Chúng không chỉ mang lại sự thoải mái và ấm áp mà còn
                thể hiện phong cách và cá nhân hóa cho người mặc.
              </p>
              <Link
                href={"/product"}
                className="w-fit hover:bg-primary-color hover:text-white border border-border-color
               py-2 px-4 flex items-center gap-x-4 transition-colors"
              >
                Mua ngay
                <EastIcon />
              </Link>
              <div className="mt-4">
                <Image
                  src={collection2}
                  alt="collection-img"
                  className="size-full"
                  width={500}
                  height={500}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
