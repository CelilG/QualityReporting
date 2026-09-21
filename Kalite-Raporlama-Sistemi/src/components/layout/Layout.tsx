import { Box } from "@mui/material";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flex: 1,
          padding: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;