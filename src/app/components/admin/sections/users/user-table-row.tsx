import { Dispatch, SetStateAction, useState } from "react";
import React from "react";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Label from "../../label";
import Iconify from "../../iconify";
import { User } from "@/src/models";
import dayjs from "dayjs";
// ----------------------------------------------------------------------

export default function UserTableRow({
  userId,
  user,
  setActivateDialog,
  setUpdateDialog,
  setActivateUser,
  setUpdateUser,
}: {
  userId: number;
  user: User;
  setActivateDialog: Dispatch<SetStateAction<boolean>>;
  setUpdateDialog: Dispatch<SetStateAction<boolean>>;
  setActivateUser: Dispatch<SetStateAction<User | null>>;
  setUpdateUser: Dispatch<SetStateAction<User | null>>;
}) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenActivateDialog = () => {
    setActivateDialog(true);
    setActivateUser(user);
    setOpen(null);
  };

  const handleOpenUpdateDialog = () => {
    setUpdateDialog(true);

    const adminUser: User = {
      userId: user.userId,
      fullname: user.fullname,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      dob: dayjs(user.dob ?? null).format("YYYY-MM-DD"),
      gender: user.gender,
      addresses: [user.addresses.find((a) => a.defaultAddress === true)!],
      isVerified: true,
      role: "CUSTOMER",
    };
    console.log(adminUser);
    setUpdateUser(adminUser);
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">
        <TableCell width={400}>{userId}</TableCell>

        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={user.fullname} src={user.avatar as string} />
            <Typography variant="subtitle2" noWrap>
              {user.fullname}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{user.phone}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell width={400}>
          <div className="w-56">
            {(user.addresses &&
              user.addresses.length > 0 &&
              user.addresses.find((address) => address.defaultAddress) &&
              (user.addresses.find((address) => address.defaultAddress)
                ?.detail ||
                user.addresses[0].detail)) ||
              "Chưa có địa chỉ"}
          </div>
        </TableCell>

        <TableCell>
          <Label color={user.isActive ? "success" : "error"}>
            {user.isActive ? "Hoạt động" : "Vô hiệu"}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton
            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
              handleOpenMenu(event)
            }
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleOpenUpdateDialog}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Sửa
        </MenuItem>

        <MenuItem
          onClick={handleOpenActivateDialog}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="mdi:account-reactivate" sx={{ mr: 2 }} />
          {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
        </MenuItem>
      </Popover>
    </>
  );
}
