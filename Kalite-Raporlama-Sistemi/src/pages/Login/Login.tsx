import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validateForm = () => {
    let isValid = true;

    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Kullanıcı adı zorunludur.");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Şifre zorunludur.");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setLoginError("");
    setIsLoading(true);

    try {
      const response = await api.post("/Auth/login", {
        username,
        password,
      });

      console.log("Login cevabı:", response.data);

      const role = response.data.role?.toLowerCase();

      login(
        response.data.token,
        response.data.role,
        response.data.fullName,
        username,
      );

      setIsLoading(false);

      // ROLE GÖRE YÖNLENDİRME
      if (role === "worker") {
        navigate("/worker", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login hatası:", error);

      setLoginError("Kullanıcı adı veya şifre hatalı.");
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 3,
        backgroundColor: "background.default",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        <CardContent
          sx={{
            padding: 4,
          }}
        >
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              handleLogin();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleLogin();
              }
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" align="center" gutterBottom>
                  Quality Reporting
                </Typography>

                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                >
                  Üretim Kalite Raporlama Sistemi
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Kullanıcı Adı"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setLoginError("");
                }}
                error={Boolean(usernameError)}
                helperText={usernameError}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Şifre"
                type={showPassword ? "text" : "password"}
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError("");
                }}
                error={Boolean(passwordError)}
                helperText={passwordError}
                disabled={isLoading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        edge="end"
                        aria-label={
                          showPassword
                            ? "Şifreyi gizle"
                            : "Şifreyi göster"
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    ),
                  },
                }}
              />

              {loginError && (
                <Alert severity="error">
                  {loginError}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading}
                sx={{
                  minHeight: 48,
                }}
              >
                {isLoading
                  ? "Giriş yapılıyor..."
                  : "Giriş Yap"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;