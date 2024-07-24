import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { styled, useTheme } from "@mui/material/styles";
import useChart from "../../chart/use-chart";
import Chart from "../../chart";
import { useEffect, useState } from "react";
import { Category } from "@/src/models";
import { adminCategoryApi } from "@/src/app/apis/admin/categoryApi";
import { adminProductApi } from "@/src/app/apis/admin/productApi";
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

export default function AppActiveUser({
  title,
  subheader,
  ...other
}: {
  title: string;
  subheader?: string;
  [key: string]: any;
}) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [productByCates, setProductByCates] = useState<number[]>([]);
  useEffect(() => {
    const getCategoriesAndProducts = async () => {
      setIsLoading(true);

      const response = await adminCategoryApi.getAllCategories({
        page: 0,
        size: 50,
      });
      const allCategories = response?.result.content.map(
        (category) => category.name
      );
      setCategories(allCategories || []);
      const response2 = await adminProductApi.getAllProducts({
        page: 0,
        size: 50,
        productName: "",
      });
      const products = response2?.result.content;
      const productByCates = allCategories?.map(
        (category) =>
          products?.filter((product) => product.categoryName === category)
            .length!
      );
      setProductByCates(productByCates || []);
      setIsLoading(false);
    };
    getCategoriesAndProducts();
  }, []);
  const {
    series,
    colors,
    options,
  }: {
    categories: string[];
    series: { name: string; data: number[] }[];
    colors: string[];
    options?: any;
  } = {
    categories,
    series: [{ name: "Sản phẩm", data: productByCates }],
    colors: [], // Add default value for colors
    options: undefined, // Add default value for options
  };

  const chartOptions = useChart({
    colors,
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.48,
    },
    legend: {
      floating: true,
      position: "bottom",
      horizontalAlign: "center",
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: [...Array(6)].map(() => theme.palette.text.secondary),
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
      <CardHeader title={title} subheader={subheader} sx={{ mb: "-20px" }} />

      <StyledChart
        dir="ltr"
        type="radar"
        series={series}
        options={chartOptions}
        width="100%"
        height={340}
      />
    </Card>
  );
}
