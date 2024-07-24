import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { Dispatch, SetStateAction, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
type Anchor = "right" | "left";

interface DrawerProps {
  drawerOpen: boolean;
  toggleDrawerOpen: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
  content: React.ReactNode;
  anchor: Anchor;
  closeMedia?: string;
}

export default function TemporaryDrawer({
  drawerOpen,
  toggleDrawerOpen,
  children,
  content,
  anchor,
  closeMedia = "(min-width:576px)",
}: DrawerProps) {
  const handleDrawerClose = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    toggleDrawerOpen(!drawerOpen); // Fix: Pass `false` as an argument to `toggleDrawerOpen`
  };

  const matches = useMediaQuery(closeMedia);
  useEffect(() => {
    if (matches && drawerOpen) {
      toggleDrawerOpen(false);
    }
  }, [matches]);
  return (
    <React.Fragment key={anchor}>
      <div onClick={handleDrawerClose}>{children}</div>
      <Drawer
        className={``}
        anchor={anchor}
        open={drawerOpen}
        onClose={handleDrawerClose}
      >
        <Box sx={{ width: 250 }} role="presentation">
          {content}
        </Box>
      </Drawer>
    </React.Fragment>
  );
}
