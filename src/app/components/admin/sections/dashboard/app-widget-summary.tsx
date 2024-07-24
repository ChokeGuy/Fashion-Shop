import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// ----------------------------------------------------------------------

export default function AppWidgetSummary({
  title,
  total,
  icon,
  color = "primary",
  sx,
  ...other
}: {
  title: string;
  total: number | string;
  icon: React.ReactNode;
  color?: string;
  sx?: object;
  [key: string]: any;
}) {
  return (
    <Card
      component={Stack}
      spacing={3}
      direction="row"
      sx={{
        px: 3,
        py: 5,
        height: 140,
        borderRadius: 2,
        ...sx,
      }}
      {...other}
    >
      {icon && <Box sx={{ width: 80, height: 80 }}>{icon}</Box>}

      <Stack spacing={0.5}>
        <Typography variant="h5">{total}</Typography>

        <Typography variant="subtitle2" sx={{ color: "text.disabled" }}>
          <div className="text-sm">{title}</div>
        </Typography>
      </Stack>
    </Card>
  );
}
