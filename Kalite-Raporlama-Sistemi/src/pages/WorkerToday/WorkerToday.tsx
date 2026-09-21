import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/axios";

interface FaultyProduct {
  id: number;
  productName: string;
  defectDescription: string;
  createdDate: string;
  isResolved: boolean;
  barcodeNumber: string;
  reporterName: string;
}

function WorkerToday() {
  const [todayProducts, setTodayProducts] = useState<FaultyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get("/FaultyProducts/get-all");

        // API'den gelen verileri map'liyoruz
        const mappedProducts: FaultyProduct[] = response.data.map(
          (product: any) => ({
            id: product.Id ?? product.id,
            productName: product.ProductName ?? product.productName,
            defectDescription:
              product.DefectDescription ?? product.defectDescription,
            createdDate: product.CreatedDate ?? product.createdDate,
            isResolved: product.IsResolved ?? product.isResolved,
            barcodeNumber: product.BarcodeNumber ?? product.barcodeNumber,
            reporterName: product.ReporterName ?? product.reporterName,
          })
        );

        // Bugünün tarihini alıyoruz
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        
        const isoDate = `${yyyy}-${mm}-${dd}`;
        const trDate = `${dd}.${mm}.${yyyy}`;

        // SADECE GÜNÜN VERİLERİ (Tarih formatı ne olursa olsun yakalar)
        const filtered = mappedProducts.filter((p) => {
          if (!p.createdDate) return false;

          const parsedDate = new Date(p.createdDate);
          
          if (!isNaN(parsedDate.getTime())) {
            // Standart tarih formatı ise
            return (
              parsedDate.getDate() === today.getDate() &&
              parsedDate.getMonth() === today.getMonth() &&
              parsedDate.getFullYear() === today.getFullYear()
            );
          } else {
            // String (02.09.2026 15:30) şeklinde geldiyse
            return p.createdDate.includes(isoDate) || p.createdDate.includes(trDate);
          }
        });

        // En son eklenen en üstte gözüksün diye tarihe göre ters sıralıyoruz
        filtered.sort(
          (a, b) => {
            const dateA = new Date(a.createdDate).getTime();
            const dateB = new Date(b.createdDate).getTime();
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
          }
        );

        setTodayProducts(filtered);
      } catch (error) {
        console.error("Bugünün hatalı ürünleri alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayProducts();
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          marginBottom: 1,
        }}
      >
        Bugünkü Bildirimler
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          marginBottom: 4,
        }}
      >
        Bugün sisteme eklediğiniz hatalı ürünler.
      </Typography>

      {/* BUGÜNÜN ÖZETİ */}

      <Paper
        sx={{
          padding: 3,
          marginBottom: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Bugün Bildirdiğim Hatalı Ürün
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
            marginTop: 1,
          }}
        >
          {loading ? <CircularProgress size={30} /> : todayProducts.length}
        </Typography>
      </Paper>

      {/* TABLO */}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Saat</TableCell>
              <TableCell>Ürün</TableCell>
              <TableCell>Barkod</TableCell>
              <TableCell>Hata</TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} sx={{ margin: 2 }} />
                </TableCell>
              </TableRow>
            ) : todayProducts.length > 0 ? (
              todayProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    {(() => {
                      const d = new Date(product.createdDate);
                      if (!isNaN(d.getTime())) {
                        return d.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                      // Eğer backend '02.09.2026 15:30:25' stringi gönderiyorsa saati ayıkla
                      const parts = product.createdDate.split(" ");
                      if (parts.length > 1) {
                        return parts[1].substring(0, 5); // '15:30'
                      }
                      return product.createdDate;
                    })()}
                  </TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.barcodeNumber}</TableCell>
                  <TableCell>{product.defectDescription}</TableCell>
                  <TableCell>
                    {product.isResolved ? (
                      <Chip label="Çözüldü" color="success" size="small" />
                    ) : (
                      <Chip label="Çözülmedi" color="error" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography
                    color="text.secondary"
                    sx={{
                      padding: 3,
                    }}
                  >
                    Bugün henüz hatalı ürün bildirimi bulunmuyor.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default WorkerToday;