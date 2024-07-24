import Tooltip from "@mui/material/Tooltip";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

import Iconify from "../../iconify";
// ----------------------------------------------------------------------

export default function ShipperTableToolbar({
  numSelected,
  filterName,
  onFilterName,
}: {
  numSelected: number;
  filterName: string;
  onFilterName: (event: { target: { value: string } }) => void;
}) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: "flex",
        justifyContent: "space-between",
        p: (theme) => theme.spacing(0, 1, 0, 3),
        // ...(numSelected > 0 && {
        //   color: "primary.main",
        //   bgcolor: "primary.lighter",
        // }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          sx={{ width: 240 }}
          value={filterName}
          onChange={onFilterName}
          placeholder="Tìm kiếm khách hàng..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{
                  color: "text.disabled",
                  width: 20,
                  height: 20,
                }}
              />
            </InputAdornment>
          }
        />
      )}

      {/* {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )} */}
    </Toolbar>
  );
}