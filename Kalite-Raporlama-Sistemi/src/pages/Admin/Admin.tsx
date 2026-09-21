import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
        }}
      >
        Yönetim
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          marginTop: 1,
          marginBottom: 4,
        }}
      >
        Kullanıcı yönetimi
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        <Card
          onClick={() => navigate("/admin/users")}
          sx={{
            cursor: "pointer",
            transition: "0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              Kullanıcı Yönetimi
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                marginTop: 1,
              }}
            >
              Sistemdeki kullanıcıları görüntüle ve yönet.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Admin;