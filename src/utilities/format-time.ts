import dayjs, { Dayjs, extend } from "dayjs";
import "dayjs/locale/en"; // Import the locale you want to use
import relativeTime from "dayjs/plugin/relativeTime"; // Import the relativeTime plugin

extend(relativeTime); // Extend dayjs with the relativeTime plugin
// Optional: Import any plugins you need (e.g., timezone, relativeTime)

// ----------------------------------------------------------------------

type DateType = {
  date: string | number | Date | Dayjs | null | undefined;
  newFormat: string;
};

export function fDate({ date, newFormat }: DateType) {
  const fm = newFormat || "DD MMM YYYY";

  return date ? dayjs(date).format(fm) : "";
}

export function fDateTime({ date, newFormat }: DateType) {
  const fm = newFormat || "DD MMM YYYY h:mm A";

  return date ? dayjs(date).format(fm) : "";
}

export function fTimestamp({ date }: Pick<DateType, "date">) {
  return date ? dayjs(date).valueOf() : "";
}

export function fToNow({ date }: Pick<DateType, "date">) {
  return date ? dayjs(date).locale("en").fromNow() : "";
}
