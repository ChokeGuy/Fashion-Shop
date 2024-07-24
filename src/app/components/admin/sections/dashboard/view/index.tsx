"use client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import AppNewUsers from "../app-new-users";
import AppWidgetSummary from "../app-widget-summary";
import AppCategory from "../app-category";
import AppBestSellers from "../app-best-sellers";
import AppWebsiteRevenues from "../app-website-revenues";
import Image from "next/image";
import {
  glassBag,
  glassBuy,
  glassMessage,
  glassUsers,
} from "@/src/assests/icons/glass";
import { useEffect, useState } from "react";
import { adminStaticSticsApi } from "@/src/app/apis/admin/staticsticApi";
import { adminOrderApi } from "@/src/app/apis/admin/orderApi";
import { Transaction } from "@/src/models/transaction";
import { formatPrice } from "@/src/utilities/price-format";
import AppTransactionList from "../app-transaction-list";
import CircleLoading from "@/src/app/components/Loading";
import dayjs from "dayjs";
// ----------------------------------------------------------------------

// const AppWidgetSummary = dynamic(() => import("../app-widget-summary"), {
//   ssr: false,
//   loading: () => <AppLoading />,
// });
// const AppWebsiteRevenues = dynamic(() => import("../app-website-revenues"), {
//   ssr: false,
//   loading: () => <AppLoading />,
// });
// const AppNewUsers = dynamic(() => import("../app-new-users"), {
//   ssr: false,
//   loading: () => <AppLoading />,
// });
// const AppBestSellers = dynamic(() => import("../app-best-sellers"), {
//   ssr: false,
//   loading: () => <AppLoading />,
// });
// const AppCategory = dynamic(() => import("../app-category"), {
//   ssr: false,
//   loading: () => <AppLoading />,
// });

export default function DashboardView() {
  const [isLoading, setIsLoading] = useState(false);
  const [staticstics, setStaticstics] = useState<{
    transactionList: Transaction[];
    totalTransactionList: number;
    totalUsers: number;
    todayUsers: number;
    todayOrders: number;
    totalOrders: number;
    todayProfit: number;
    sixMonthsProfit: number;
  }>({
    transactionList: [],
    totalTransactionList: 0,
    totalUsers: 0,
    todayUsers: 0,
    todayOrders: 0,
    totalOrders: 0,
    todayProfit: 0,
    sixMonthsProfit: 0,
  });

  useEffect(() => {
    const getAllStaticstics = async () => {
      setIsLoading(true);
      const [
        revenues,
        sixMonthsProfit,
        todayProfit,
        users,
        todayUsers,
        todayOrders,
        totalOrders,
      ] = await Promise.all([
        adminStaticSticsApi.getTotalRevenue(),
        adminStaticSticsApi.getRevenueByDateRange({
          dateFrom: dayjs().subtract(6, "month").format("YYYY/MM/DD"),
          dateTo: dayjs().format("YYYY/MM/DD"),
          pagination: {
            page: 0,
            size: 99999,
          },
        }),
        adminStaticSticsApi.getRevenueByDateRange({
          dateFrom: dayjs(new Date()).format("YYYY/MM/DD"),
          dateTo: dayjs(new Date()).format("YYYY/MM/DD"),
          pagination: {
            page: 0,
            size: 99999,
          },
        }),
        adminStaticSticsApi.getTotalUsers(),
        adminStaticSticsApi.getTodayUsers(),
        adminStaticSticsApi.getTodayOrderAmount(),
        adminOrderApi.getAllOrders(),
      ]);

      setStaticstics({
        transactionList: revenues?.result.transactionList || [],
        totalTransactionList: revenues?.result.transactionList.length || 0,
        totalUsers: users?.result || 0,
        todayUsers: todayUsers?.result || 0,
        todayOrders: todayOrders?.result || 0,
        totalOrders: totalOrders?.result.totalElements || 0,
        todayProfit: todayProfit?.result.revenue || 0,
        sixMonthsProfit: sixMonthsProfit?.result.revenue || 0,
      });
      setIsLoading(false);
    };
    getAllStaticstics();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] grid place-items-center">
        <CircleLoading />
      </div>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Chào mừng bạn trở lại 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Toàn bộ khách hàng"
            total={staticstics.totalUsers}
            color="info"
            icon={<Image width={64} height={64} alt="icon" src={glassUsers} />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Toàn bộ đơn hàng"
            total={staticstics.totalOrders}
            color="warning"
            icon={<Image width={64} height={64} alt="icon" src={glassBuy} />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Doanh thu 6 tháng gần nhất"
            total={formatPrice(staticstics.sixMonthsProfit) + " VNĐ"}
            color="error"
            icon={<Image width={64} height={64} alt="icon" src={glassBag} />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Khách hàng mới hôm nay"
            total={staticstics.todayUsers}
            color="info"
            icon={<Image width={64} height={64} alt="icon" src={glassUsers} />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Số lượng đơn hàng hôm nay"
            total={staticstics.todayOrders}
            color="error"
            icon={<Image width={64} height={64} alt="icon" src={glassBuy} />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Doanh thu hôm nay"
            total={formatPrice(staticstics.todayProfit) + " VNĐ"}
            color="success"
            icon={<Image width={64} height={64} alt="icon" src={glassBag} />}
            sx={undefined}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          {
            <AppWebsiteRevenues
              title="Doanh thu đạt được"
              subheader="Doanh thu 7 ngày gần nhất"
              // transactions={staticstics.transactionList}
            />
          }
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {staticstics &&
            staticstics.transactionList &&
            staticstics.transactionList.length > 0 && (
              <AppNewUsers
                title="Khách hàng mới"
                subheader="Khách hàng mới 7 ngày gần nhất"
                totalUsers={staticstics.totalUsers}
              />
            )}
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppBestSellers
            title="Sản phẩm bán chạy"
            subheader="Top 5 sản phẩm bán chạy nhất"
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCategory
            title="Danh mục sản phẩm"
            subheader="Toàn bộ các sản phẩm ứng theo danh mục"
          />
        </Grid>
        <Grid xs={12} md={12} lg={12}>
          <AppTransactionList
            transactions={staticstics.transactionList}
            totalTransactions={staticstics.totalTransactionList}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
