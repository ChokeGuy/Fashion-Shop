interface PaginationInfoProps {
  page: number;
  itemsPerPage: number;
  totalItems: number;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  page,
  itemsPerPage,
  totalItems,
}) => {
  const firstItemIndex = page - 1 < 0 ? 1 : (page - 1) * itemsPerPage + 1;
  const lastItemIndex = Math.min(
    page - 1 < 0 ? itemsPerPage : page * itemsPerPage,
    totalItems
  );

  return (
    <p className="text-sm font-semibold  flex gap-x-2">
      <span className="xl:block hidden">Hiển thị</span>
      {totalItems == 0
        ? null
        : `${firstItemIndex} - ${lastItemIndex} trên`}{" "}
      {totalItems} kết quả
    </p>
  );
};
export default PaginationInfo;
