import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
export const MyArrowNext = (clickHandler: () => void) => {
  return (
    <div
      onClick={clickHandler}
      className={`group hover:bg-primary-color myarrow right-12 translate-x-8`}
    >
      <KeyboardArrowRightIcon className="group-hover:text-white text-2xl text-text-light-color" />
    </div>
  );
};
export const MyArrowPrev = (clickHandler: () => void) => {
  return (
    <div
      onClick={clickHandler}
      className={`group hover:bg-primary-color myarrow z-[1] left-12 -translate-x-8`}
    >
      <KeyboardArrowLeftIcon className="group-hover:text-white text-2xl text-text-light-color" />
    </div>
  );
};

export const ArrowNextForProductDetail = (clickHandler: () => void) => {
  return (
    <div
      onClick={clickHandler}
      className={`group hover:opacity-70 myarrow !bg-inherit  right-6  translate-x-8`}
    >
      <KeyboardArrowRightIcon className="text-white text-5xl" />
    </div>
  );
};
export const ArrowPrevForProductDetail = (clickHandler: () => void) => {
  return (
    <div
      onClick={clickHandler}
      className={`group hover:opacity-70 myarrow !bg-inherit  z-[1] left-6 -translate-x-8`}
    >
      <KeyboardArrowLeftIcon className="text-white text-5xl" />
    </div>
  );
};
