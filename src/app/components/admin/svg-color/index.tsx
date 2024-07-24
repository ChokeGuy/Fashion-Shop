import Box from "@mui/material/Box";
import Image from "next/image";

// ----------------------------------------------------------------------

const SvgColor = ({ src }: { src: string }) => (
  <Image
    className="inline-block bg-current ml-2"
    width={18}
    height={18}
    src={src}
    alt={"svg-img"}
  />
);

export default SvgColor;
