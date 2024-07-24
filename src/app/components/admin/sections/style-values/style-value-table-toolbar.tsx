import Tooltip from "@mui/material/Tooltip";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

import Iconify from "../../iconify";
import { Dispatch, SetStateAction, useState } from "react";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import { Style, StyleValue } from "@/src/models";
import Button from "@mui/material/Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { adminStyleValueApi } from "@/src/app/apis/admin/styleValueApi";
// ----------------------------------------------------------------------

export default function BrandTableToolbar({
  styles,
  styleName,
  setStyleValues,
  setTotalStyleValues,
  setPage,
  setSize,
  setStyleName,
  numSelected,
  filterName,
  page,
  rowsPerPage,
  handleResetStyleValues,
  onFilterName,
}: {
  styles: Style[];
  styleName: string;
  setStyleValues: Dispatch<SetStateAction<StyleValue[]>>;
  setTotalStyleValues: Dispatch<SetStateAction<number>>;
  setPage: Dispatch<SetStateAction<number>>;
  setSize: Dispatch<SetStateAction<number>>;
  setStyleName: Dispatch<SetStateAction<string>>;
  numSelected: number;
  filterName: string;
  page: number;
  rowsPerPage: number;
  handleResetStyleValues: any;
  onFilterName: (event: { target: { value: string } }) => void;
}) {
  const [openEl, setOpenEl] = useState<HTMLButtonElement | null>(null);
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpenEl(event.currentTarget);
  };

  const handleSearchByStyleName = async (styleName: string) => {
    setOpenEl(null);
    await handleResetStyleValues(styleName);
    setStyleName(styleName);
  };

  const handleResetSearch = async () => {
    await handleResetStyleValues("");
    setStyleName("");
  };

  return (
    <Toolbar
      sx={{
        height: 96,
        display: "flex",
        justifyContent: "space-between",
        columnGap: 1,
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
          value={filterName}
          onChange={onFilterName}
          placeholder="Tìm kiếm giá trị..."
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
      <div className="flex items-center space-x-2">
        <Tooltip title="Tìm kiếm">
          <Button
            sx={{
              color: "white",
              backgroundColor: "#1A4845",
              "&:hover": {
                backgroundColor: "#1A4845",
                color: "white",
                opacity: 0.7,
              },
            }}
            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
              handleOpenMenu(event)
            }
          >
            <Iconify icon="ic:round-filter-list" />
            <span className="p-1 text-sm">Tìm kiếm theo</span>
          </Button>
        </Tooltip>
        {styleName.length > 0 && (
          <>
            <Tooltip title="Đặt lại">
              <Button
                sx={{
                  color: "white",
                  backgroundColor: "#1A4845",
                  "&:hover": {
                    backgroundColor: "#1A4845",
                    color: "white",
                    opacity: 0.7,
                  },
                }}
                onClick={handleResetSearch}
              >
                <Iconify icon="system-uicons:reset" />
                <span className="p-1 text-sm">Đặt lại</span>
              </Button>
            </Tooltip>
            <span className="p-1 text-sm">Đang tìm theo {styleName}</span>
          </>
        )}
      </div>
      <Popover
        open={!!openEl}
        anchorEl={openEl}
        onClose={() => setOpenEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 160 },
        }}
      >
        <div className="flex items-center justify-center flex-col">
          {styles &&
            styles.length > 0 &&
            styles.map((style, index) => {
              if (index == 0) {
                return (
                  <MenuItem
                    onClick={() => {
                      setStyleName(style.name);
                      handleSearchByStyleName(style.name);
                    }}
                    sx={{
                      width: "100%",
                      padding: 1,
                    }}
                    key={style.styleId}
                    value={style.name}
                  >
                    {style.name}
                  </MenuItem>
                );
              }
              return (
                <MenuItem
                  onClick={() => {
                    setStyleName(style.name);
                    handleSearchByStyleName(style.name);
                  }}
                  sx={{
                    width: "100%",
                    padding: 1,
                    borderTop: "1px solid #ccc",
                  }}
                  key={style.styleId}
                  value={style.name}
                >
                  {style.name}
                </MenuItem>
              );
            })}
          {/* <MenuItem>
            <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
            Sửa
          </MenuItem> */}
        </div>
      </Popover>
    </Toolbar>
  );
}
