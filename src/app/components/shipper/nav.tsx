// import { useEffect } from "react";

// import Box from "@mui/material/Box";
// import Stack from "@mui/material/Stack";
// import Drawer from "@mui/material/Drawer";
// import Avatar from "@mui/material/Avatar";
// import { alpha } from "@mui/material/styles";
// import Typography from "@mui/material/Typography";
// import ListItemButton from "@mui/material/ListItemButton";

// import { useResponsive } from "../../hooks/use-responsive";

// import { NAV } from "./config-layout";
// import navConfig from "./nav-config";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import { product2 } from "@/src/assests";

// export const account = {
//   displayName: "Nguyễn Ngọc Thắng",
//   email: "admin@gmail.com",
//   photoURL: product2.src,
//   role: "ADMIN".toLocaleLowerCase(),
// };

// // ----------------------------------------------------------------------

// export default function Nav({
//   openNav,
//   onCloseNav,
// }: {
//   openNav: boolean;
//   onCloseNav: () => void;
// }) {
//   const pathname = usePathname();

//   const upLg = useResponsive("up", "lg");

//   useEffect(() => {
//     if (openNav) {
//       onCloseNav();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pathname]);

//   const renderAccount = (
//     <Box
//       sx={{
//         my: 2,
//         mx: 2.5,
//         py: 2,
//         px: 2.5,
//         display: "flex",
//         borderRadius: 1.5,
//         alignItems: "center",
//         bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
//       }}
//     >
//       <Avatar src={account.photoURL} alt="photoURL" />

//       <Box className="ml-2">
//         <Typography variant="subtitle2">{account.displayName}</Typography>

//         <Typography
//           className="capitalize"
//           variant="body2"
//           sx={{ color: "text.secondary", textTransform: "capitalize" }}
//         >
//           {account.role}
//         </Typography>
//       </Box>
//     </Box>
//   );

//   const renderMenu = (
//     <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
//       {navConfig.map((item) => (
//         <NavItem key={item.title} item={item} />
//       ))}
//     </Stack>
//   );

//   const renderContent = (
//     <Scrollbar
//       sx={{
//         height: 1,
//         "& .simplebar-content": {
//           height: 1,
//           display: "flex",
//           flexDirection: "column",
//         },
//       }}
//     >
//       <Logo sx={{ mt: 2, ml: 2 }} />

//       {renderAccount}

//       {renderMenu}

//       <Box sx={{ flexGrow: 1 }} />
//     </Scrollbar>
//   );

//   return (
//     <Box
//       sx={{
//         flexShrink: { lg: 0 },
//         width: { lg: NAV.WIDTH },
//       }}
//     >
//       {upLg ? (
//         <Box
//           sx={{
//             height: 1,
//             position: "fixed",
//             width: NAV.WIDTH,
//             borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
//           }}
//         >
//           {renderContent}
//         </Box>
//       ) : (
//         <Drawer
//           open={openNav}
//           onClose={onCloseNav}
//           PaperProps={{
//             sx: {
//               width: NAV.WIDTH,
//             },
//           }}
//         >
//           {renderContent}
//         </Drawer>
//       )}
//     </Box>
//   );
// }

// // ----------------------------------------------------------------------

// function NavItem({
//   item,
// }: {
//   item: {
//     title: string;
//     path: string;
//     icon: JSX.Element;
//   };
// }) {
//   const pathname = usePathname();

//   const active = item.path === pathname;

//   return (
//     <Link href={item.path}>
//       <ListItemButton
//         sx={{
//           minHeight: 44,
//           borderRadius: 0.75,
//           typography: "body2",
//           color: "text.secondary",
//           // textTransform: "capitalize",
//           fontWeight: "fontWeightMedium",
//           ...(active && {
//             color: "#1A4845",
//             fontWeight: "fontWeightSemiBold",
//             bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
//             "&:hover": {
//               bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
//             },
//           }),
//         }}
//       >
//         <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
//           {item.icon}
//         </Box>

//         <Box component="span">{item.title} </Box>
//       </ListItemButton>
//     </Link>
//   );
// }
