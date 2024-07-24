import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";

import { visuallyHidden } from "@/src/utilities/visual";
import Typography from "@mui/material/Typography";
// ----------------------------------------------------------------------

export default function DeliveryTableHead({
  headLabel,
  numSelected,
}: {
  headLabel: any[];
  numSelected: number;
}) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || "left"}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            <TableSortLabel hideSortIcon>
              <Typography variant="subtitle2" noWrap>
                {headCell.label}
              </Typography>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
