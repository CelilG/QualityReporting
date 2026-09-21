import { Box, Button, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AddBoxIcon from "@mui/icons-material/AddBox";
import TodayIcon from "@mui/icons-material/Today";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isWorker = user?.role === "worker";
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  return (
    <Box
      sx={{
        width: 260,
        height: "calc(100vh - 32px)",
        margin: 2,
        padding: 3,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        Quality Reporting
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {/* ==================================================
            DASHBOARD
            ADMIN + MANAGER
        ================================================== */}

        {(isAdmin || isManager) && (
          <Button
            fullWidth
            variant={
              location.pathname === "/dashboard"
                ? "contained"
                : "text"
            }
            onClick={() => navigate("/dashboard")}
            startIcon={<DashboardIcon />}
            sx={{
              justifyContent: "flex-start",
              padding: "10px 16px",
              borderRadius: 2,
            }}
          >
            Dashboard
          </Button>
        )}

        {/* ==================================================
            RAPORLAR
            ADMIN + MANAGER
        ================================================== */}

        {(isAdmin || isManager) && (
          <Button
            fullWidth
            variant={
              location.pathname === "/reports"
                ? "contained"
                : "text"
            }
            onClick={() => navigate("/reports")}
            startIcon={<AssessmentIcon />}
            sx={{
              justifyContent: "flex-start",
              padding: "10px 16px",
              borderRadius: 2,
            }}
          >
            Raporlar
          </Button>
        )}

        {/* ==================================================
            YÖNETİM
            SADECE ADMIN
        ================================================== */}

        {isAdmin && (
          <Button
            fullWidth
            variant={
              location.pathname === "/admin"
                ? "contained"
                : "text"
            }
            onClick={() => navigate("/admin")}
            startIcon={<AdminPanelSettingsIcon />}
            sx={{
              justifyContent: "flex-start",
              padding: "10px 16px",
              borderRadius: 2,
            }}
          >
            Yönetim
          </Button>
        )}

        {/* ==================================================
            HATALI ÜRÜN BİLDİR
            ADMIN + MANAGER + WORKER
        ================================================== */}

        {(isAdmin || isManager || isWorker) && (
          <Button
            fullWidth
            variant={
              location.pathname === "/worker"
                ? "contained"
                : "text"
            }
            onClick={() => navigate("/worker")}
            startIcon={<AddBoxIcon />}
            sx={{
              justifyContent: "flex-start",
              padding: "10px 16px",
              borderRadius: 2,
            }}
          >
            Hatalı Ürün Bildir
          </Button>
        )}

        {/* ==================================================
            BUGÜNKÜ BİLDİRİMLER
            ADMIN + MANAGER + WORKER
        ================================================== */}

        {(isAdmin || isManager || isWorker) && (
          <Button
            fullWidth
            variant={
              location.pathname === "/worker/today"
                ? "contained"
                : "text"
            }
            onClick={() => navigate("/worker/today")}
            startIcon={<TodayIcon />}
            sx={{
              justifyContent: "flex-start",
              padding: "10px 16px",
              borderRadius: 2,
            }}
          >
            Bugünkü Bildirimler
          </Button>
        )}
      </Box>

      {/* ==================================================
          KULLANICI BİLGİSİ
      ================================================== */}

      <Box
        sx={{
          marginTop: "auto",
          paddingTop: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Kullanıcı
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            marginTop: 0.5,
          }}
        >
          {user?.username}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {user?.role}
        </Typography>
      </Box>
    </Box>
  );
}

export default Sidebar;