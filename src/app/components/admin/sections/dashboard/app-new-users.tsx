import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { styled, useTheme } from "@mui/material/styles";

import { fNumber } from "@/src/utilities/format-number";

import Chart from "../../chart";
import useChart from "../../chart/use-chart";
import { useEffect, useState } from "react";
import { DateRange } from "@mui/x-date-pickers-pro";
import dayjs, { Dayjs } from "dayjs";
import { adminStaticSticsApi } from "@/src/app/apis/admin/staticsticApi";
import Button from "@mui/material/Button";
import SingleInputDateRangePickerWithAdornment from "../../common/single-page-range";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Iconify from "../../iconify";
import Popover from "@mui/material/Popover";
import AppLoading from "./app-loading";
// ----------------------------------------------------------------------

const CHART_HEIGHT = 400;

const LEGEND_HEIGHT = 72;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  "& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject": {
    height: `100% !important`,
  },
  "& .apexcharts-legend": {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function AppNewUsers({
  totalUsers,
  title,
  subheader,
  ...other
}: {
  totalUsers: number;
  title?: string;
  subheader?: string;
  [key: string]: any;
}) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [newUsers, setNewUsers] = useState<number>(0);

  const [filterDateRange, setFilterDateRange] = useState<DateRange<Dayjs>>([
    null,
    null,
  ]);
  const [openFilter, setOpenFilter] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const getNewUsersToday = async () => {
      setIsLoading(true);

      const datas = await adminStaticSticsApi.getUserByDateRange({
        dateFrom: dayjs(new Date()).subtract(6, "day").format("YYYY/MM/DD"),
        dateTo: dayjs(new Date()).format("YYYY/MM/DD"),
      });
      setNewUsers(datas?.result ?? 0);
      setIsLoading(false);
    };
    getNewUsersToday();
  }, []);

  useEffect(() => {
    const getNewUsersByDateRange = async () => {
      if (
        filterDateRange &&
        filterDateRange[0]?.isValid() &&
        filterDateRange[1]?.isValid()
      ) {
        const datas = await adminStaticSticsApi.getUserByDateRange({
          dateFrom: filterDateRange[0].format("YYYY/MM/DD"),
          dateTo: filterDateRange[1].format("YYYY/MM/DD"),
        });
        setNewUsers(datas?.result ?? 0);
      } else if (
        !filterDateRange[0]?.isValid() ||
        !filterDateRange[1]?.isValid()
      ) {
        const datas = await adminStaticSticsApi.getUserByDateRange({
          dateFrom: dayjs(new Date()).subtract(6, "day").format("YYYY/MM/DD"),
          dateTo: dayjs(new Date()).format("YYYY/MM/DD"),
        });
        setNewUsers(datas?.result ?? 0);
      }
    };
    getNewUsersByDateRange();
  }, [filterDateRange]);

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

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpenFilter(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenFilter(null);
  };

  const {
    colors = [],
    series = [],
    options = {},
  } = {
    series: [
      { label: "Khách hàng mới", value: newUsers },
      { label: "Khách hàng còn lại", value: totalUsers - newUsers },
    ],
  };

  const chartSeries = series.map((i) => i.value);

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors,
    labels: series.map((i) => i.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    legend: {
      floating: true,
      position: "bottom",
      horizontalAlign: "center",
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: any) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    ...options,
  });

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <Card {...other}>
      <CardHeader
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
                <span className="text-primary-color">Lọc theo thời gian:</span>
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
            : `Khách hàng mới từ ${dayjs(filterDateRange[0]).format(
                "DD/MM/YYYY"
              )} đến ${dayjs(filterDateRange[1]).format("DD/MM/YYYY")}`
        }
        sx={{ mb: "10px" }}
      />

      <StyledChart
        dir="ltr"
        type="pie"
        series={chartSeries}
        options={chartOptions}
        width="100%"
        height={280}
      />
    </Card>
  );
}
