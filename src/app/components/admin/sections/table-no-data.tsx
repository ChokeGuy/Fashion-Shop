import Paper from "@mui/material/Paper";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";

// ----------------------------------------------------------------------

export default function TableNoData({ query }: { query: string | number }) {
  return (
    <TableRow>
      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
        <Paper
          sx={{
            textAlign: "center",
          }}
        >
          <Typography variant="h6" paragraph>
            Không tìm thấy
          </Typography>

          <Typography variant="body2">
            Không có kết quả nào với từ khóa &nbsp;
            <strong>&quot;{query}&quot;</strong>.
            <br /> Hãy kiểm tra lại từ khóa hoặc thử lại với từ khóa khác.
          </Typography>
        </Paper>
      </TableCell>
    </TableRow>
  );
}
