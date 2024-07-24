import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

import Chart from "../../chart";
import useChart from "../../chart/use-chart";
import dayjs, { Dayjs } from "dayjs";
import { formatPrice } from "@/src/utilities/price-format";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Iconify from "../../iconify";
import { useEffect, useState } from "react";
import { DateRange } from "@mui/x-date-pickers-pro";
import { adminStaticSticsApi } from "@/src/app/apis/admin/staticsticApi";
import SingleInputDateRangePickerWithAdornment from "../../common/single-page-range";
import { Transaction } from "@/src/models/transaction";
import Button from "@mui/material/Button";
// ----------------------------------------------------------------------

export default function AppWebsiteRevenues({
  title,
  subheader,
  ...other
}: {
  title: string;
  subheader: string;
  [key: string]: any;
}) {
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);

  const [filterDateRange, setFilterDateRange] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);
  const [openFilter, setOpenFilter] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const getTransactionsByDateRange = async () => {
      if (
        filterDateRange &&
        filterDateRange[0]?.isValid() &&
        filterDateRange[1]?.isValid()
      ) {
        const datas = await adminStaticSticsApi.getRevenueByDateRange({
          dateFrom: filterDateRange[0].format("YYYY/MM/DD"),
          dateTo: filterDateRange[1].format("YYYY/MM/DD"),
          pagination: {
            page: 0,
            size: 999999,
          },
        });
        setTransactionList(datas?.result.transactionList ?? []);
      } else if (
        !filterDateRange[0]?.isValid() ||
        !filterDateRange[1]?.isValid()
      ) {
        const datas = await adminStaticSticsApi.getTotalRevenue({
          page: 0,
          size: 9999999,
        });
        setTransactionList(datas?.result.transactionList.slice(0, 7) ?? []);
      }
    };
    getTransactionsByDateRange();
  }, [filterDateRange]);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpenFilter(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenFilter(null);
  };

  const handleFilterPastDateRange = (type: string) => {
    let dateTo = dayjs().subtract(1, "day");
    let dateFrom;

    if (type === "day") {
      dateFrom = dateTo.clone().subtract(1, "day");
    } else if (type === "week") {
      dateFrom = dateTo.clone().subtract(6, "day");
    } else if (type === "month") {
      dateFrom = dateTo.clone().add(1, "day").subtract(1, "month");
    }
    if (dateFrom && dateTo) setFilterDateRange([dateFrom, dateTo]);
  };

  const handleResetDateRange = () => {
    setFilterDateRange([null, null]);
  };

  const revenuesLabels = (): string[] => {
    const dates = new Set<string>();
    transactionList.forEach((i) => {
      const date = dayjs(i.createdAt).format("MM/DD/YYYY");
      dates.add(date);
    });
    return Array.from(dates).toSorted();
  };
  const totalRevenues = (): number[] => {
    const labels = revenuesLabels();
    const revenues = labels.map((label) => {
      const transactionsOnDate = transactionList.filter(
        (i) => dayjs(i.createdAt).format("MM/DD/YYYY") === label
      );
      const total = transactionsOnDate.reduce((sum, i) => sum + i.amount, 0);
      return total;
    });
    return revenues;
  };

  const numberOfOrders = (): number[] => {
    const labels = revenuesLabels();
    const orders = labels.map((label) => {
      const transactionsOnDate = transactionList.filter(
        (i) => dayjs(i.createdAt).format("MM/DD/YYYY") === label
      );
      const total = transactionsOnDate.length;
      return total;
    });
    return orders;
  };

  const {
    labels,
    colors = [],
    series,
    options = {},
  } = {
    labels: revenuesLabels(),
    colors: [] as string[],
    series: [
      {
        name: "tổng doanh thu",
        type: "column",
        fill: "solid",
        data: totalRevenues(),
      },
      {
        name: "số đơn hàng",
        type: "line",
        fill: "solid",
        data: numberOfOrders(),
      },
    ],
  };

  const chartOptions = useChart({
    colors,
    plotOptions: {
      bar: {
        columnWidth: "25%",
      },
    },
    fill: {
      type: series.map((i) => i.fill),
    },
    labels,
    markers: {
      size: 0,
    },
    xaxis: {
      type: "line",
      rotate: -30,
      showDuplicates: false,
      labels: {
        formatter: function (val: any) {
          return dayjs(val).format("DD/MM/YYYY");
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Tổng doanh thu",
        },
        labels: {
          formatter: function (value: number) {
            return `${formatPrice(value)} VNĐ`;
          },
        },
      },
      {
        opposite: true,
        stepSize: 1,
        title: {
          text: "Số đơn hàng",
        },
        labels: {
          formatter: function (value: number) {
            return `${formatPrice(value)} đơn hàng`;
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      yaxis: [
        {
          formatter: (value: number) => {
            if (typeof value !== "undefined") {
              return `${formatPrice(value)} VNĐ`;
            }
            return value;
          },
        },
        {
          formatter: (value: number) => {
            if (typeof value !== "undefined") {
              return `${formatPrice(value)} đơn hàng`;
            }
            return value;
          },
        },
      ],
    },
    ...options,
  });

  return (
    <Card {...other}>
      <div className="flex items-center">
        <CardHeader
          sx={{ paddingRight: 0 }}
          title={
            <>
              <span>{title}</span>
              <Tooltip title="Lọc giao dịch">
                <IconButton
                  onClick={(
                    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
                  ) => handleOpenMenu(event)}
                >
                  <Iconify icon="ic:round-filter-list" />
                </IconButton>
              </Tooltip>
              <Popover
                open={!!openFilter}
                anchorEl={openFilter}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    padding: 1.5,
                    minHeight: "6rem",
                    border: "1px solid #ccc",
                  },
                }}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-primary-color">
                    Lọc theo thời gian:
                  </span>
                  <SingleInputDateRangePickerWithAdornment
                    value={filterDateRange}
                    setValue={setFilterDateRange}
                  />
                </div>
                <div className="flex items-center space-x-6 mt-4">
                  <span className="text-primary-color">Thời điểm trước:</span>
                  <div className="space-x-8 pl-2">
                    {["day", "week", "month"].map((item) => (
                      <Button
                        onClick={() => handleFilterPastDateRange(item)}
                        sx={{
                          bgcolor: "#1A4845",
                          color: "#fff",
                          "&:hover": {
                            bgcolor: "#1A4845",
                            opacity: 0.55,
                          },
                          transition: "all",
                        }}
                        key={item}
                        variant="contained"
                      >
                        1{" "}
                        {item == "day"
                          ? "ngày"
                          : item == "week"
                          ? "tuần"
                          : "tháng"}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="w-full flex justify-end mt-4">
                  <Button
                    onClick={handleResetDateRange}
                    sx={{
                      bgcolor: "#1A4845",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "#1A4845",
                        opacity: 0.55,
                      },
                      transition: "all",
                    }}
                    variant="contained"
                  >
                    Đặt lại
                  </Button>
                </div>
              </Popover>
            </>
          }
          subheader={
            filterDateRange[0] == null || filterDateRange[1] == null
              ? subheader
              : `Doanh thu từ ${dayjs(filterDateRange[0]).format(
                  "DD/MM/YYYY"
                )} đến ${dayjs(filterDateRange[1]).format("DD/MM/YYYY")}`
          }
        />
      </div>
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart
          dir="ltr"
          type="line"
          series={series}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}
