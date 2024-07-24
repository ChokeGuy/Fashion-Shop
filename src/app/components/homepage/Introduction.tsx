import { logo } from "@/src/assests";
import Image from "next/image";

export default function Introduction() {
  return (
    <section className="mt-12 transition-all bg-background">
      <div className="container  flex justify-center items-center flex-col gap-y-6 py-12 md:py-24 xl:py-36 transition-all">
        <div>
          <Image src={logo} alt="logo"></Image>
        </div>
        <p className="max-w-[700px] text-center text-lg md:text-2xl">
          Chào mừng bạn đến với thế giới thời trang của chúng tôi. Chúng tôi đam
          mê những điều thời trang và trendy. Cho dù bạn đang tìm kiếm xu hướng
          thời trang mới nhất, cảm hứng trang phục hoặc gợi ý thời trang, bạn đã
          đến đúng nơi.
        </p>
        <div className="text-lg md:text-3xl font-bold text-center  md:whitespace-nowrap">
          Chúng tôi xin chân thành cảm ơn quý khách!
        </div>
      </div>
    </section>
  );
}
