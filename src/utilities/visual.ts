export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: "1px",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  clip: "rect(0 0 0 0)",
};

export function emptyRows(
  page: number,
  rowsPerPage: number,
  arrayLength: number
) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function getValueByPath(obj: any, path: string) {
  return path.split(".").reduce((o, p) => (o || {})[p], obj);
}

function descendingComparator(a: any, b: any, orderBy: string) {
  const aValue = orderBy.includes(".")
    ? getValueByPath(a, orderBy)
    : a[orderBy];
  const bValue = orderBy.includes(".")
    ? getValueByPath(b, orderBy)
    : b[orderBy];

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

export function getComparator(
  order: "asc" | "desc",
  orderBy: string,
  orderStatus?: number
) {
  if (orderStatus === 2 || orderStatus == 1 || orderStatus == 3) {
    return order === "asc"
      ? (a: any, b: any) => descendingComparator(b, a, orderBy)
      : (a: any, b: any) => -descendingComparator(b, a, orderBy);
  }

  return order === "desc"
    ? (a: any, b: any) => descendingComparator(b, a, orderBy)
    : (a: any, b: any) => -descendingComparator(b, a, orderBy);
}
