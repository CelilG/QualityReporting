import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Button,
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import KpiCard from "../../components/dashboard/KpiCard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TodayIcon from "@mui/icons-material/Today";
import InventoryIcon from "@mui/icons-material/Inventory";
import Layout from "../../components/layout/Layout";

interface FaultyProduct {
  id: number;
  productName: string;
  barcodeNumber: string;
  defectDescription: string;
  faultCategoryName: string;
  imageFileName: string;
  createdDate: string;
  isResolved: boolean;
  reporterName: string;
}

interface MonthlyDefect {
  month: string;
  value: number;
}

interface DefectDistribution {
  name: string;
  value: number;
}

// Pasta grafik renk paleti
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c"];

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [products, setProducts] = useState<FaultyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFaultyProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(
          "/FaultyProducts/get-all",
        );

        console.log(
          "Dashboard API response:",
          response.data,
        );

        // Backend'den Kategori verisi gelmediği için metinden kategori çıkaran zeki filtre
        const inferCategory = (desc: string) => {
          if (!desc) return "Diğer";
          const d = desc.toLowerCase();
          
          if (d.includes("çizik") || d.includes("darbe")) return "Darbe / Çizik";
          if (d.includes("boya") || d.includes("leke")) return "Renk / Boya Hatası";
          if (d.includes("eksik") || d.includes("kırık")) return "Eksik / Hatalı Parça";
          if (d.includes("kablo") || d.includes("sigorta")) return "Kablo Hatası";
          if (d.includes("ısıtmıyor") || d.includes("soğutma") || d.includes("ışık") || d.includes("ateş") || d.includes("hız") || d.includes("ekran") || d.includes("aydınlatma")) return "Elektriksel Arıza";
          if (d.includes("kilit") || d.includes("kapanmıyor") || d.includes("yerinden")) return "Montaj Hatası";
          if (d.includes("motor") || d.includes("ses") || d.includes("boşa dönüyor") || d.includes("su akıtıyor") || d.includes("dönmüyor")) return "Mekanik Arıza";
          if (d.includes("çalışmıyor")) return "Çalışmıyor";
          
          return "Diğer";
        };

        const mappedProducts: FaultyProduct[] =
          response.data.map((product: any) => {
            const rawCatName = product.FaultCategoryName || product.faultCategoryName || product.CategoryName || product.categoryName;
            const defectDesc = product.DefectDescription || product.defectDescription || "";
            
            // Eğer API kategori gönderirse onu kullan, göndermezse açıklamadan otomatik tahmin et.
            const finalCategoryName = rawCatName ? rawCatName : inferCategory(defectDesc);

            return {
              id: product.Id || product.id || 0,
              productName: product.ProductName || product.productName || "",
              barcodeNumber: product.BarcodeNumber || product.barcodeNumber || "",
              defectDescription: defectDesc,
              faultCategoryName: finalCategoryName, 
              imageFileName: product.ImageFileName || product.imageFileName || "",
              createdDate: product.CreatedDate || product.createdDate || "",
              isResolved: product.IsResolved || product.isResolved || false,
              reporterName: product.ReporterName || product.reporterName || "",
            };
          });

        console.log(
          "Dashboard dönüştürülmüş veriler:",
          mappedProducts,
        );

        setProducts(mappedProducts);
      } catch (error) {
        console.error(
          "Dashboard veri hatası:",
          error,
        );

        setError(
          "Dashboard verileri alınamadı.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaultyProducts();
  }, []);

  // --------------------------------------------------
  // KPI HESAPLAMALARI
  // --------------------------------------------------

  const totalDefects = products.length;

  const unresolvedDefects = products.filter(
    (product) => !product.isResolved,
  ).length;

  const resolvedDefects = products.filter(
    (product) => product.isResolved,
  ).length;

  // --------------------------------------------------
  // BUGÜNKÜ HATALAR
  // --------------------------------------------------

  const today = new Date();

  const todayDefects = products.filter(
    (product) => {
      if (!product.createdDate) {
        return false;
      }

      const date = new Date(
        product.createdDate,
      );

      if (isNaN(date.getTime())) {
        return false;
      }

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },
  ).length;

  // --------------------------------------------------
  // SON 6 AYLIK HATA SAYISI
  // --------------------------------------------------

  const monthlyDefects: MonthlyDefect[] =
    Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date();

        date.setMonth(
          date.getMonth() - (5 - index),
        );

        const year = date.getFullYear();
        const month = date.getMonth();

        const value = products.filter(
          (product) => {
            if (!product.createdDate) {
              return false;
            }

            const productDate = new Date(
              product.createdDate,
            );

            if (
              isNaN(
                productDate.getTime(),
              )
            ) {
              return false;
            }

            return (
              productDate.getFullYear() ===
                year &&
              productDate.getMonth() ===
                month
            );
          },
        ).length;

        return {
          month:
            date.toLocaleDateString(
              "tr-TR",
              {
                month: "long",
              },
            ),
          value,
        };
      },
    );

  // --------------------------------------------------
  // HATA DAĞILIMI
  // --------------------------------------------------

  const defectMap: Record<
    string,
    number
  > = {};

  products.forEach((product) => {
    const defectType =
      product.faultCategoryName?.trim();

    if (!defectType) {
      return;
    }

    defectMap[defectType] =
      (defectMap[defectType] || 0) + 1;
  });

  const defectDistribution: DefectDistribution[] =
    Object.entries(defectMap)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) => b.value - a.value,
      );

  const mostCommonDefect =
    defectDistribution[0];

  return (
    <Layout>
      <Box
        sx={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* BAŞLIK */}
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
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
              Dashboard
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Üretim kalite durumuna genel
              bakış
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => {
              logout();

              navigate("/login", {
                replace: true,
              });
            }}
          >
            Çıkış Yap
          </Button>
        </Box>

        {/* LOADING */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <Typography color="text.secondary">
              Dashboard verileri
              yükleniyor...
            </Typography>
          </Box>
        ) : error ? (
          /* HATA */
          <Card>
            <CardContent>
              <Typography color="error">
                {error}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ==================================================
                KPI KARTLARI
            ================================================== */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
                marginBottom: 4,
              }}
            >
              <KpiCard
                title="Toplam Hatalı Ürün"
                value={totalDefects.toString()}
                description="Toplam kayıt"
                icon={<InventoryIcon />}
              />

              <KpiCard
                title="Çözülmemiş Hatalar"
                value={unresolvedDefects.toString()}
                description="Bekleyen kayıtlar"
                icon={<WarningAmberIcon />}
              />

              <KpiCard
                title="Çözülmüş Hatalar"
                value={resolvedDefects.toString()}
                description="Tamamlanan kayıtlar"
                icon={<CheckCircleIcon />}
              />

              <KpiCard
                title="Bugünkü Hatalar"
                value={todayDefects.toString()}
                description="Bugün kaydedilen"
                icon={<TodayIcon />}
              />
            </Box>

            {/* ==================================================
                GRAFİKLER
            ================================================== */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "2fr 1fr",
                },
                gap: 3,
              }}
            >
              {/* AYLIK HATALAR */}
              <Card>
                <CardContent
                  sx={{
                    padding: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Aylık Hatalı Ürün Sayısı
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      marginTop: 1,
                    }}
                  >
                    Son 6 aya göre hatalı
                    ürün dağılımı
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      height: {
                        xs: 250,
                        sm: 280,
                        md: 300,
                      },
                      marginTop: 2,
                    }}
                  >
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={
                          monthlyDefects
                        }
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="month"
                        />

                        <YAxis
                          allowDecimals={false}
                        />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Hatalı Ürün"
                          stroke="currentColor"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      marginTop: 2,
                    }}
                  >
                    Toplam hatalı ürün:{" "}
                    {totalDefects}
                  </Typography>
                </CardContent>
              </Card>

              {/* HATA DAĞILIMI */}
              <Card>
                <CardContent
                  sx={{
                    padding: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Hata Dağılımı
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      marginTop: 1,
                    }}
                  >
                    Hata türlerine göre
                    dağılım
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      height: {
                        xs: 250,
                        sm: 280,
                        md: 300,
                      },
                      marginTop: 2,
                    }}
                  >
                    {defectDistribution.length >
                    0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={
                              defectDistribution
                            }
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label
                          >
                            {defectDistribution.map(
                              (entry, index) => (
                                <Cell
                                  key={
                                    entry.name
                                  }
                                  fill={COLORS[index % COLORS.length]} 
                                />
                              ),
                            )}
                          </Pie>

                          <Tooltip />

                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          justifyContent:
                            "center",
                          alignItems:
                            "center",
                        }}
                      >
                        <Typography color="text.secondary">
                          Hata dağılımı için
                          veri bulunamadı.
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {mostCommonDefect && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        marginTop: 2,
                      }}
                    >
                      En sık hata:{" "}
                      {mostCommonDefect.name}{" "}
                      (
                      {
                        mostCommonDefect.value
                      }{" "}
                      kayıt)
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </>
        )}
      </Box>
    </Layout>
  );
}

export default Dashboard;