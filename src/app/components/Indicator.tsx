export const MyIndicator = (
  clickHandler: (e: React.MouseEvent | React.KeyboardEvent) => void,
  isSelected: boolean
) => {
  return (
    <div
      className={`${
        isSelected ? "bg-primary-color" : "bg-white"
      } rounded-full size-2.5 cursor-pointer shadow-[0_0_5px_rgba(0,0,0,0.3)]`}
      onClick={clickHandler}
    ></div>
  );
};
