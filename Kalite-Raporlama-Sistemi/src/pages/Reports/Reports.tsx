import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
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
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import api from "../../api/axios";

interface FaultyProduct {
  id: number;
  productName: string;
  defectDescription: string;
  imageFileName: string;
  createdDate: string;
  isResolved: boolean;
  barcodeNumber: string;
  reporterName: string;
  resolvedDate: string | null;
  resolverName: string | null;
  resolutionDetails: string | null;
}

interface ImageResponse {
  temporaryUrl: string;
}

function Reports() {
  const [products, setProducts] = useState<FaultyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<FaultyProduct | null>(
    null,
  );

  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  // --------------------------------------------------
  // ÇÖZME MODALI STATE'LERİ
  // --------------------------------------------------

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [productToResolve, setProductToResolve] =
    useState<FaultyProduct | null>(null);
  const [resolutionDetails, setResolutionDetails] = useState("");

  // --------------------------------------------------
  // FİLTRELER
  // --------------------------------------------------

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [dateError, setDateError] = useState("");

  // --------------------------------------------------
  // API'DEN HATALI ÜRÜNLERİ GETİR
  // --------------------------------------------------

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/FaultyProducts/get-all");

      console.log("Reports API response:", response.data);

      const mappedProducts: FaultyProduct[] = response.data.map(
        (product: any) => {
          let resolverName =
            product.ResolvedByName ??
            product.resolvedByName ??
            product.ResolvedByUserName ??
            product.resolvedByUserName ??
            product.ResolvedByUser?.FullName ??
            product.resolvedByUser?.fullName ??
            product.ResolvedByUser?.UserName ??
            product.resolvedByUser?.userName ??
            null;

          if (!resolverName) {
            const firstName =
              product.ResolvedByUser?.FirstName ??
              product.resolvedByUser?.firstName ??
              "";

            const lastName =
              product.ResolvedByUser?.LastName ??
              product.resolvedByUser?.lastName ??
              "";

            const fullName = `${firstName} ${lastName}`.trim();

            if (fullName) {
              resolverName = fullName;
            }
          }

          return {
            id: product.Id ?? product.id,
            productName: product.ProductName ?? product.productName,
            defectDescription:
              product.DefectDescription ?? product.defectDescription,
            imageFileName: product.ImageFileName ?? product.imageFileName,
            createdDate: product.CreatedDate ?? product.createdDate,
            isResolved: product.IsResolved ?? product.isResolved,
            barcodeNumber: product.BarcodeNumber ?? product.barcodeNumber,
            reporterName: product.ReporterName ?? product.reporterName,
            resolvedDate: product.ResolvedDate ?? product.resolvedDate,
            resolverName,
            resolutionDetails:
              product.ResolutionDetails ?? product.resolutionDetails ?? null,
          };
        },
      );

      console.log("Reports mapped products:", mappedProducts);

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Hatalı ürünler alınamadı:", err);

      setError("Hatalı ürünler alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --------------------------------------------------
  // ÜRÜN DROPDOWN SEÇENEKLERİ
  // --------------------------------------------------

  const productOptions = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.productName)),
    ).sort();
  }, [products]);

  // --------------------------------------------------
  // FİLTRELEME
  // --------------------------------------------------

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productDate = product.createdDate
        ? product.createdDate.substring(0, 10)
        : "";

      const matchesStartDate = !startDate || productDate >= startDate;
      const matchesEndDate = !endDate || productDate <= endDate;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "resolved" && product.isResolved) ||
        (statusFilter === "unresolved" && !product.isResolved);

      const matchesProduct =
        productFilter === "all" || product.productName === productFilter;

      const normalizedSearch = searchText.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        (product.productName &&
          product.productName.toLowerCase().includes(normalizedSearch)) ||
        (product.barcodeNumber &&
          product.barcodeNumber.toLowerCase().includes(normalizedSearch));

      return (
        matchesStartDate &&
        matchesEndDate &&
        matchesStatus &&
        matchesProduct &&
        matchesSearch
      );
    });
  }, [products, startDate, endDate, statusFilter, productFilter, searchText]);

  // --------------------------------------------------
  // RAPORU GETİR
  // --------------------------------------------------

  const handleApplyFilters = () => {
    if (startDate && endDate && startDate > endDate) {
      setDateError("Başlangıç tarihi, bitiş tarihinden sonra olamaz.");
      return;
    }

    setDateError("");
  };

  // --------------------------------------------------
  // FİLTRELERİ TEMİZLE
  // --------------------------------------------------

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setProductFilter("all");
    setSearchText("");
    setDateError("");
  };

  // --------------------------------------------------
  // GERÇEK EXCEL (.XLSX) İNDİRME İŞLEMİ
  // --------------------------------------------------

  const handleExportExcel = () => {
    const excelData = filteredProducts.map((p) => ({
      Tarih: p.createdDate
        ? new Date(p.createdDate).toLocaleDateString("tr-TR")
        : "",
      "Ürün Adı": p.productName || "",
      "Barkod Numarası": p.barcodeNumber || "",
      "Hata Açıklaması": p.defectDescription || "",
      Bildiren: p.reporterName || "",
      Durum: p.isResolved ? "Çözüldü" : "Çözülmedi",
      "Çözülme Tarihi": p.resolvedDate
        ? new Date(p.resolvedDate).toLocaleString("tr-TR")
        : "",
      "Çözen Kişi": p.resolverName || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hatalı Ürünler");

    const fileName = `hatali_urun_raporu_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // --------------------------------------------------
  // RAPOR ÖZETLERİ
  // --------------------------------------------------

  const totalProducts = filteredProducts.length;

  const resolvedProducts = filteredProducts.filter(
    (product) => product.isResolved,
  ).length;

  const unresolvedProducts = filteredProducts.filter(
    (product) => !product.isResolved,
  ).length;

  // --------------------------------------------------
  // GRAFİK 1 - DURUM DAĞILIMI
  // --------------------------------------------------

  const statusChartData = [
    {
      name: "Çözüldü",
      value: resolvedProducts,
    },
    {
      name: "Çözülmedi",
      value: unresolvedProducts,
    },
  ];

  // --------------------------------------------------
  // GRAFİK 2 - ÜRÜN BAZINDA HATA SAYISI
  // --------------------------------------------------

  const productChartData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredProducts.forEach((product) => {
      counts[product.productName] = (counts[product.productName] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, valueA], [, valueB]) => valueB - valueA)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [filteredProducts]);

  // --------------------------------------------------
  // GRAFİK 3 - TARİHE GÖRE HATA SAYISI
  // --------------------------------------------------

  const dateChartData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredProducts.forEach((product) => {
      const date = product.createdDate
        ? product.createdDate.substring(0, 10)
        : "";

      if (!date) return;

      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString("tr-TR"),
        value,
      }));
  }, [filteredProducts]);

  // --------------------------------------------------
  // ÇÖZME MODALINI AÇ
  // --------------------------------------------------

  const handleOpenResolveDialog = (product: FaultyProduct) => {
    setProductToResolve(product);
    setResolutionDetails("");
    setResolveDialogOpen(true);
  };

  // --------------------------------------------------
  // ÇÖZME MODALINI KAPAT
  // --------------------------------------------------

  const handleCloseResolveDialog = () => {
    setResolveDialogOpen(false);
    setProductToResolve(null);
    setResolutionDetails("");
  };

  // --------------------------------------------------
  // ÜRÜNÜ ÇÖZÜLDÜ OLARAK KAYDET
  // --------------------------------------------------

  const handleConfirmResolve = async () => {
    if (!productToResolve) return;

    try {
      const details = resolutionDetails.trim() || "Çözüldü olarak işaretlendi.";

      await api.put("/FaultyProducts/resolve", {
        id: productToResolve.id,
        resolutionDetails: details,
      });

      handleCloseResolveDialog();
      await fetchProducts();
    } catch (err: any) {
      console.error("Arıza çözülemedi:", err);

      if (err?.response?.data) {
        console.error("Backend hata mesajı:", err.response.data);
      }

      setError("Arıza çözülemedi. Lütfen tekrar deneyin.");
    }
  };

  // --------------------------------------------------
  // ÜRÜN DETAYI AÇILDIĞINDA GÖRSELİ GETİR
  // --------------------------------------------------
  const handleProductDetail = async (product: FaultyProduct) => {
    setSelectedProduct(product);
    setImageUrl("");
    setImageError("");
    setImageLoading(true);

    try {
      // API'ye gidip resmi binary (blob) formatında indiriyoruz
      const response = await api.get(
        `/FaultyProducts/download-image/${encodeURIComponent(product.imageFileName)}`,
        {
          responseType: "blob",
        },
      );

      // İnen binary veriyi tarayıcıda gösterilebilecek yerel bir URL'ye çeviriyoruz
      const localUrl = URL.createObjectURL(response.data);
      setImageUrl(localUrl);
    } catch (err) {
      console.error("Ürün görseli alınamadı:", err);
      setImageError("Ürün görseli yüklenemedi.");
    } finally {
      setImageLoading(false);
    }
  };

  // --------------------------------------------------
  // DETAY DİYALOĞU KAPAT
  // --------------------------------------------------
  const handleCloseDetail = () => {
    setSelectedProduct(null);
    // Yeni bir ürün seçildiğinde RAM'de şişme yapmaması için eski linki temizliyoruz
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl("");
    setImageError("");
  };

  return (
    <Box
      sx={{
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      {/* ==================================================
          BAŞLIK
      ================================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
            }}
          >
            Raporlar
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              marginTop: 1,
            }}
          >
            Hatalı ürün kayıtlarını incele ve raporla.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            color="success"
            onClick={handleExportExcel}
            disabled={loading || filteredProducts.length === 0}
          >
            Excel'e Aktar
          </Button>
        </Box>
      </Box>

      {/* ==================================================
          ÖZET KARTLARI
      ================================================== */}

      {!loading && !error && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 3,
            marginBottom: 4,
          }}
        >
          <Paper sx={{ padding: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Toplam Hatalı Ürün
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {totalProducts}
            </Typography>
          </Paper>

          <Paper sx={{ padding: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Çözülmüş
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {resolvedProducts}
            </Typography>

            <Chip
              label="Çözüldü"
              color="success"
              size="small"
              sx={{
                marginTop: 1,
              }}
            />
          </Paper>

          <Paper sx={{ padding: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Çözülmemiş
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {unresolvedProducts}
            </Typography>

            <Chip
              label="Çözülmedi"
              color="error"
              size="small"
              sx={{
                marginTop: 1,
              }}
            />
          </Paper>
        </Box>
      )}

      {/* ==================================================
          FİLTRELER
      ================================================== */}

      <Paper
        sx={{
          padding: 3,
          marginBottom: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            marginBottom: 3,
          }}
        >
          Rapor Filtreleri
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          <TextField
            fullWidth
            label="Başlangıç Tarihi"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setDateError("");
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            fullWidth
            label="Bitiş Tarihi"
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setDateError("");
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Durum</InputLabel>

            <Select
              label="Durum"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="all">Tüm Durumlar</MenuItem>

              <MenuItem value="resolved">Çözüldü</MenuItem>

              <MenuItem value="unresolved">Çözülmedi</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Ürün</InputLabel>

            <Select
              label="Ürün"
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
            >
              <MenuItem value="all">Tüm Ürünler</MenuItem>

              {productOptions.map((productName) => (
                <MenuItem key={productName} value={productName}>
                  {productName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Ürün / Barkod Ara"
            placeholder="Ürün adı veya barkod..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </Box>

        {dateError && (
          <Typography
            color="error"
            variant="body2"
            sx={{
              marginTop: 2,
            }}
          >
            {dateError}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            marginTop: 3,
          }}
        >
          <Button variant="outlined" onClick={handleClearFilters}>
            Filtreleri Temizle
          </Button>

          <Button variant="contained" onClick={handleApplyFilters}>
            Raporu Getir
          </Button>
        </Box>
      </Paper>

      {/* ==================================================
          API HATASI
      ================================================== */}

      {error && (
        <Paper
          sx={{
            padding: 3,
            marginBottom: 3,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* ==================================================
          GRAFİKLER
      ================================================== */}

      {!loading && !error && filteredProducts.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1fr 1fr",
            },
            gap: 3,
            marginBottom: 4,
          }}
        >
          <Paper sx={{ padding: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              Hata Durumu Dağılımı
            </Typography>

            <Box
              sx={{
                width: "100%",
                height: 320,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    <Cell fill="#4caf50" />
                    <Cell fill="#f44336" />
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ padding: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              Ürün Bazında Hata Sayısı
            </Typography>

            <Box
              sx={{
                width: "100%",
                height: 320,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Bar dataKey="value" name="Hata Sayısı" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper
            sx={{
              padding: 3,
              gridColumn: {
                xs: "auto",
                lg: "1 / -1",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              Tarihe Göre Hata Sayısı
            </Typography>

            <Box
              sx={{
                width: "100%",
                height: 320,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dateChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Bar dataKey="value" name="Hata Sayısı" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ==================================================
          SONUÇ SAYISI
      ================================================== */}

      {!loading && !error && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Toplam <strong>{filteredProducts.length}</strong> kayıt
            gösteriliyor.
          </Typography>
        </Box>
      )}

      {/* ==================================================
          TABLO
      ================================================== */}

      {loading ? (
        <Paper sx={{ padding: 4 }}>
          <Typography align="center">Veriler yükleniyor...</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>

                <TableCell>Ürün</TableCell>

                <TableCell>Hata Açıklaması</TableCell>

                <TableCell>Barkod</TableCell>

                <TableCell>Çözen Kişi</TableCell>

                <TableCell>Durum</TableCell>

                <TableCell>İşlem</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      {new Date(product.createdDate).toLocaleDateString(
                        "tr-TR",
                      )}
                    </TableCell>

                    <TableCell>{product.productName}</TableCell>

                    <TableCell>{product.defectDescription}</TableCell>

                    <TableCell>{product.barcodeNumber}</TableCell>

                    <TableCell>
                      {product.isResolved ? product.resolverName || "-" : "-"}
                    </TableCell>

                    <TableCell>
                      {product.isResolved ? (
                        <Chip label="Çözüldü" color="success" size="small" />
                      ) : (
                        <Chip label="Çözülmedi" color="error" size="small" />
                      )}
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleProductDetail(product)}
                        >
                          Detay
                        </Button>

                        {!product.isResolved && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleOpenResolveDialog(product)}
                          >
                            Çözüldü
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Seçilen filtrelere uygun kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ==================================================
          ÇÖZME MODALI
      ================================================== */}

      <Dialog
        open={resolveDialogOpen}
        onClose={handleCloseResolveDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Arızayı Çözüldü Olarak İşaretle</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              marginTop: 1,
            }}
          >
            <TextField
              fullWidth
              label="Çözüm Detayı / Notu"
              multiline
              minRows={3}
              value={resolutionDetails}
              onChange={(e) => setResolutionDetails(e.target.value)}
              placeholder="Arızanın nasıl çözüldüğünü açıklayın..."
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseResolveDialog} color="inherit">
            İptal
          </Button>

          <Button
            onClick={handleConfirmResolve}
            variant="contained"
            color="success"
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================
          DETAY DİYALOĞU
      ================================================== */}

      <Dialog
        open={selectedProduct !== null}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Hatalı Ürün Detayı</DialogTitle>

        <DialogContent>
          {selectedProduct && (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                marginTop: 1,
              }}
            >
              <Typography>
                <strong>Ürün:</strong> {selectedProduct.productName}
              </Typography>

              <Typography>
                <strong>Hata Açıklaması:</strong>{" "}
                {selectedProduct.defectDescription}
              </Typography>

              <Typography>
                <strong>Barkod:</strong> {selectedProduct.barcodeNumber}
              </Typography>

              <Typography>
                <strong>Bildirim Tarihi:</strong>{" "}
                {new Date(selectedProduct.createdDate).toLocaleString("tr-TR")}
              </Typography>

              <Typography>
                <strong>Bildiren Kullanıcı:</strong>{" "}
                {selectedProduct.reporterName}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography>
                  <strong>Durum:</strong>
                </Typography>

                {selectedProduct.isResolved ? (
                  <Chip label="Çözüldü" color="success" size="small" />
                ) : (
                  <Chip label="Çözülmedi" color="error" size="small" />
                )}
              </Box>

              {selectedProduct.isResolved && (
                <>
                  <Typography>
                    <strong>Çözülme Tarihi:</strong>{" "}
                    {selectedProduct.resolvedDate
                      ? new Date(selectedProduct.resolvedDate).toLocaleString(
                          "tr-TR",
                        )
                      : "-"}
                  </Typography>

                  <Typography>
                    <strong>Çözen Kişi:</strong>{" "}
                    {selectedProduct.resolverName || "-"}
                  </Typography>

                  <Typography>
                    <strong>Çözüm Detayı:</strong>{" "}
                    {selectedProduct.resolutionDetails || "-"}
                  </Typography>
                </>
              )}

              <Box
                sx={{
                  marginTop: 1,
                }}
              >
                <Typography
                  sx={{
                    marginBottom: 1,
                  }}
                >
                  <strong>Resim:</strong>
                </Typography>

                {imageLoading ? (
                  <Typography color="text.secondary">
                    Görsel yükleniyor...
                  </Typography>
                ) : imageError ? (
                  <Typography color="error">{imageError}</Typography>
                ) : imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={selectedProduct.productName}
                    sx={{
                      display: "block",
                      width: "100%",
                      maxHeight: 400,
                      objectFit: "contain",
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <Typography color="text.secondary">
                    Görsel bulunamadı.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetail}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Reports;
