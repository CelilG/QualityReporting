import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../api/axios";

interface User {
  id: number;
  fullName: string;
  username: string;
  role: string;
}

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Employee");

  // --------------------------------------------------
  // KULLANICILARI GETİR
  // --------------------------------------------------

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/User/Employee-listesi");

      console.log("Kullanıcı listesi:", response.data);

      setUsers(response.data.data);
    } catch (err) {
      console.error("Kullanıcılar alınamadı:", err);

      setError(
        "Kullanıcılar alınırken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --------------------------------------------------
  // YENİ KULLANICI DİYALOĞUNU KAPAT
  // --------------------------------------------------

  const handleCreateClose = () => {
    setIsCreateDialogOpen(false);

    setNewFirstName("");
    setNewLastName("");
    setNewUsername("");
    setNewPassword("");
    setNewRole("Employee");
  };

  // --------------------------------------------------
  // KULLANICI EKLE
  // --------------------------------------------------

  const handleCreateSave = async () => {
    if (
      !newFirstName.trim() ||
      !newLastName.trim() ||
      !newUsername.trim() ||
      !newPassword.trim()
    ) {
      return;
    }

    try {
      setError("");

      await api.post("/User/add-user", {
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        username: newUsername.trim(),
        password: newPassword,
        roleName: newRole,
      });

      await fetchUsers();

      handleCreateClose();
    } catch (err: any) {
      console.error("Kullanıcı eklenemedi:", err);

      setError(
        err?.response?.data ||
          "Kullanıcı eklenirken bir hata oluştu."
      );
    }
  };

  // --------------------------------------------------
  // KULLANICI SİL
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/User/delete-user/${userToDelete.id}`
      );

      setUserToDelete(null);

      await fetchUsers();
    } catch (err: any) {
      console.error("Kullanıcı silinemedi:", err);

      setError(
        err?.response?.data ||
          "Kullanıcı silinirken bir hata oluştu."
      );
    }
  };

  return (
    <Box>
      {/* ==================================================
          BAŞLIK
      ================================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
            }}
          >
            Kullanıcı Yönetimi
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              marginTop: 1,
            }}
          >
            Sistem kullanıcılarını görüntüle ve yönet.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      {/* ==================================================
          HATA
      ================================================== */}

      {error && (
        <Paper
          sx={{
            padding: 2,
            marginBottom: 3,
          }}
        >
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      )}

      {/* ==================================================
          KULLANICI TABLOSU
      ================================================== */}

      {loading ? (
        <Paper
          sx={{
            padding: 4,
          }}
        >
          <Typography align="center">
            Kullanıcılar yükleniyor...
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Ad Soyad
                </TableCell>

                <TableCell>
                  Kullanıcı Adı
                </TableCell>

                <TableCell>
                  Rol
                </TableCell>

                <TableCell>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                  >
                    <TableCell>
                      {user.fullName}
                    </TableCell>

                    <TableCell>
                      {user.username}
                    </TableCell>

                    <TableCell>
                      {user.role}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() =>
                          setUserToDelete(user)
                        }
                      >
                        Sil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                  >
                    Henüz kayıtlı kullanıcı bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ==================================================
          KULLANICI SİLME DİYALOĞU
      ================================================== */}

      <Dialog
        open={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
      >
        <DialogTitle>
          Kullanıcıyı Sil
        </DialogTitle>

        <DialogContent>
          {userToDelete && (
            <Typography>
              <strong>
                {userToDelete.fullName}
              </strong>{" "}
              adlı kullanıcıyı silmek istediğinize
              emin misiniz?
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setUserToDelete(null)
            }
          >
            Vazgeç
          </Button>

          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================
          YENİ KULLANICI DİYALOĞU
      ================================================== */}

      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCreateClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Yeni Kullanıcı
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Ad"
            value={newFirstName}
            onChange={(event) =>
              setNewFirstName(event.target.value)
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Soyad"
            value={newLastName}
            onChange={(event) =>
              setNewLastName(event.target.value)
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Kullanıcı Adı"
            value={newUsername}
            onChange={(event) =>
              setNewUsername(event.target.value)
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Şifre"
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
            margin="normal"
          />

          <Select
            fullWidth
            value={newRole}
            onChange={(event) =>
              setNewRole(event.target.value)
            }
            sx={{
              marginTop: 2,
            }}
          >
            <MenuItem value="Worker">
              Worker
            </MenuItem>

            <MenuItem value="Manager">
              Manager
            </MenuItem>

            <MenuItem value="Admin">
              Admin
            </MenuItem>
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCreateClose}>
            Vazgeç
          </Button>

          <Button
            onClick={handleCreateSave}
            variant="contained"
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminUsers;
