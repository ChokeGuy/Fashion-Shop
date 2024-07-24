"use client";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import { alpha } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { product2 } from "@/src/assests";
import { getCookie } from "cookies-next";
import { userApi } from "@/src/app/apis/userApi";
import {
  getUserProfileAsync,
  selectUser,
  selectUserStatus,
} from "@/src/lib/features/user/userSlice";
import { showToast } from "@/src/lib/toastify";
import { deleteTokens } from "@/src/utilities/tokenHandler";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import Link from "next/link";
import { User } from "@/src/models";
import { getAllCartItemsAsync } from "@/src/lib/features/cart/cartSlice";

// export const account = {
//   displayName: "Nguyễn Ngọc Thắng",
//   email: "admin@gmail.com",
//   photoURL: product2.src,
//   role: "ADMIN".toLocaleLowerCase(),
// };
// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: "Thống kê",
    icon: "eva:home-fill",
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const account = useAppSelector(selectUser);
  const accountStatus = useAppSelector(selectUserStatus);
  const pathname = usePathname();
  const { replace } = useRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (accountStatus === "idle") {
      dispatch(getUserProfileAsync());
    }
  }, [dispatch, accountStatus]);

  const handleOpen = (event: any) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogoutAccount = async () => {
    const refreshToken = getCookie("refreshToken");
    if (refreshToken) {
      const result = await userApi.logout({ refreshToken });
      if (result?.success) {
        if (
          pathname.includes("/account") ||
          pathname.includes("/admin") ||
          pathname.includes("/shipper")
        ) {
          showToast("Đăng xuất thành công", "success");
        }
      }
    }
    dispatch(getUserProfileAsync());
    replace("/login");
    handleClose();
    deleteTokens();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) =>
            open
              ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
              : alpha(theme.palette.grey[500], 0.08),
        }}
      >
        <Avatar
          src={account.avatar as string}
          alt={account.fullname}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {account.fullname.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1,
            ml: 0.75,
            width: 200,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {account.fullname}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {account.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        {pathname.includes("/admin") &&
          MENU_OPTIONS.map((option) => (
            <Link replace={true} key={option.label} href={"/admin"}>
              <MenuItem onClick={handleClose}>{option.label}</MenuItem>
            </Link>
          ))}

        <Divider sx={{ borderStyle: "dashed", m: 0 }} />

        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={handleLogoutAccount}
          sx={{ typography: "body2", color: "error.main", py: 1.5 }}
        >
          Đăng xuất
        </MenuItem>
      </Popover>
    </>
  );
}
