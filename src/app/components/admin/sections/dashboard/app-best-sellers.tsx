import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import useChart from "../../chart/use-chart";
import { fNumber } from "@/src/utilities/format-number";
import Chart from "../../chart";
import { useEffect, useState } from "react";
import { Product, TopProduct } from "@/src/models";
import { adminProductApi } from "@/src/app/apis/admin/productApi";
import AppLoading from "./app-loading";
import { adminStaticSticsApi } from "@/src/app/apis/admin/staticsticApi";

// ----------------------------------------------------------------------

export default function AppConversionRates({
  title,
  subheader,
  ...other
}: {
  title?: string;
  subheader?: string;

  [key: string]: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const getTopProducts = async () => {
      setIsLoading(true);
      const response = await adminStaticSticsApi.getTopProducts();
      const newTopProducts = response?.result
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);
      setTopProducts(newTopProducts || []);
      setIsLoading(false);
    };
    getTopProducts();
  }, []);

  const {
    colors = [],
    series = {},
    options = {},
  } = {
    series: {
      data:
        topProducts && topProducts.length > 0
          ? topProducts.map((product) => ({
              label: product.productName,
              value: product.totalSold,
            }))
          : [],
    },
  };

  const chartSeries = series.data?.map((i) => i.value);

  const chartOptions = useChart({
    colors,
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value: number) => fNumber(value) + " sản phẩm đã bán",
        title: {
          formatter: () => "",
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "28%",
        borderRadius: 2,
      },
    },
    xaxis: {
      type: "category",
      categories: series.data?.map((i) => i.label),
    },
    ...options,
  });

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ mx: 3 }}>
        <Chart
          dir="ltr"
          type="bar"
          series={[{ data: chartSeries || [] }]}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}
