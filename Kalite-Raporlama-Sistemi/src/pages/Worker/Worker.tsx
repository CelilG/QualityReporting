import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../../api/axios";

// ==================================================
// DROPDOWN TİPİ
// ==================================================

interface DropdownItem {
  id: number;
  name: string;
}

// ==================================================
// DB İLE BİREBİR EŞLEŞEN SABİT ÜRÜNLER
// ==================================================

const DEFAULT_PRODUCTS: DropdownItem[] = [
  { id: 1, name: "Ankastre Fırın" },
  { id: 2, name: "Solo Ocak" },
  { id: 3, name: "Davlumbaz" },
  { id: 4, name: "Buzdolabı" },
  { id: 5, name: "Çamaşır Makinesi" },
];

// ==================================================
// DB İLE BİREBİR EŞLEŞEN SABİT KATEGORİLER
// ==================================================

const DEFAULT_FAULT_CATEGORIES: DropdownItem[] = [
  { id: 1, name: "Elektriksel Arıza" },
  { id: 2, name: "Mekanik Hasar" },
  { id: 3, name: "Kozmetik Kusur" },
  { id: 4, name: "Montaj Hatası" },
];

function Worker() {
  // ==================================================
  // NAVIGATION
  // ==================================================

  const navigate = useNavigate();

  // ==================================================
  // FORM STATE
  // ==================================================

  const [barcodeNumber, setBarcodeNumber] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [defectDetail, setDefectDetail] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // ==================================================
  // BARKOD KAMERA
  // ==================================================

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scannerControlsRef = useRef<{ stop: () => void } | null>(null);

  // ==================================================
  // FOTOĞRAF KAMERASI
  // ==================================================

  const [photoCameraOpen, setPhotoCameraOpen] = useState(false);
  const [photoCameraError, setPhotoCameraError] = useState("");
  const photoVideoRef = useRef<HTMLVideoElement | null>(null);
  const photoStreamRef = useRef<MediaStream | null>(null);

  // ==================================================
  // GÖNDERME
  // ==================================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  // ==================================================
  // STATİK LİSTELERİ STATE'E AL
  // ==================================================

  const [products] = useState<DropdownItem[]>(DEFAULT_PRODUCTS);
  const [faultCategories] = useState<DropdownItem[]>(DEFAULT_FAULT_CATEGORIES);

  // ==================================================
  // COMPONENT KAPANIRKEN KAMERALARI KAPAT
  // ==================================================

  useEffect(() => {
    return () => {
      try {
        scannerControlsRef.current?.stop();
      } catch (error) {}
      
      scannerControlsRef.current = null;
      codeReaderRef.current = null;
      stopPhotoCameraStream();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==================================================
  // ÇIKIŞ YAP
  // ==================================================

  const handleLogout = () => {
    try {
      scannerControlsRef.current?.stop();
    } catch (error) {
      console.error("Barkod kamerası kapatma hatası:", error);
    }

    scannerControlsRef.current = null;
    codeReaderRef.current = null;
    stopPhotoCameraStream();

    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
  };

  // ==================================================
  // BARKOD KAMERASINI AÇ
  // ==================================================

  const startBarcodeScanner = async () => {
    setScannerError("");
    setScannerOpen(true);

    try {
      try {
        scannerControlsRef.current?.stop();
      } catch (error) {}

      scannerControlsRef.current = null;
      codeReaderRef.current = null;

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.ITF,
        BarcodeFormat.CODABAR,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.AZTEC,
        BarcodeFormat.PDF_417,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      codeReaderRef.current = reader;

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!videoRef.current) {
        throw new Error("Kamera görüntüsü başlatılamadı.");
      }

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (devices.length === 0) {
        throw new Error("Kullanılabilir kamera bulunamadı.");
      }

      const selectedDevice =
        devices.find((device) => {
          const label = device.label.toLowerCase();
          return (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment")
          );
        }) || devices[devices.length - 1];

      if (!videoRef.current) return;

      const controls = await reader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result) => {
          if (!result) return;
          const scannedBarcode = result.getText();
          setBarcodeNumber(scannedBarcode);
          stopBarcodeScanner();
        },
      );

      scannerControlsRef.current = controls;
    } catch (error) {
      console.error("Barkod kamera hatası:", error);
      setScannerError(
        "Kamera başlatılamadı. Kamera iznini kontrol edin veya barkodu elle girin.",
      );
      setScannerOpen(false);
    }
  };

  // ==================================================
  // BARKOD KAMERASINI KAPAT
  // ==================================================

  const stopBarcodeScanner = () => {
    try {
      scannerControlsRef.current?.stop();
    } catch (error) {
      console.error("Barkod kamera kapatma hatası:", error);
    }

    scannerControlsRef.current = null;
    codeReaderRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setTimeout(() => {
      setScannerOpen(false);
    }, 100);
  };

  // ==================================================
  // FOTOĞRAF KAMERASI STREAM'İNİ KAPAT
  // ==================================================

  const stopPhotoCameraStream = () => {
    if (photoStreamRef.current) {
      photoStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      photoStreamRef.current = null;
    }

    if (photoVideoRef.current) {
      photoVideoRef.current.pause();
      photoVideoRef.current.srcObject = null;
    }
  };

  // ==================================================
  // FOTOĞRAF KAMERASINI AÇ
  // ==================================================

  const startPhotoCamera = async () => {
    setPhotoCameraError("");
    setPhotoCameraOpen(true);

    try {
      stopPhotoCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      photoStreamRef.current = stream;
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!photoVideoRef.current) {
        throw new Error("Fotoğraf kamera görüntüsü bulunamadı.");
      }

      photoVideoRef.current.srcObject = stream;
      await photoVideoRef.current.play();
    } catch (error) {
      console.error("Fotoğraf kamerası başlatma hatası:", error);
      stopPhotoCameraStream();
      setPhotoCameraError(
        "Kamera açılamadı. Tarayıcı kamera iznini kontrol edin.",
      );
      setTimeout(() => setPhotoCameraOpen(false), 100);
    }
  };

  // ==================================================
  // FOTOĞRAF ÇEK
  // ==================================================

  const capturePhoto = () => {
    const video = photoVideoRef.current;
    if (!video) {
      setPhotoCameraError("Kamera görüntüsü bulunamadı.");
      return;
    }

    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setPhotoCameraError(
        "Kamera görüntüsü henüz hazır değil. Birkaç saniye bekleyin.",
      );
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setPhotoCameraError("Fotoğraf oluşturulamadı.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setPhotoCameraError("Fotoğraf dosyası oluşturulamadı.");
          return;
        }

        const fileName = `hatali-urun-${Date.now()}.jpg`;
        const file = new File([blob], fileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setImagePreview(previewUrl);
        stopPhotoCameraStream();

        setTimeout(() => {
          setPhotoCameraOpen(false);
          setPhotoCameraError("");
        }, 100);
      },
      "image/jpeg",
      0.9,
    );
  };

  // ==================================================
  // FOTOĞRAF KAMERASINI KAPAT
  // ==================================================

  const closePhotoCamera = () => {
    stopPhotoCameraStream();
    setTimeout(() => {
      setPhotoCameraOpen(false);
      setPhotoCameraError("");
    }, 100);
  };

  // ==================================================
  // DOSYA SEÇ
  // ==================================================

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    event.target.value = "";
  };

  // ==================================================
  // FOTOĞRAFI KALDIR
  // ==================================================

  const handleRemovePhoto = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview("");
  };

  // ==================================================
  // FORMU TEMİZLE
  // ==================================================

  const clearForm = () => {
    setBarcodeNumber("");
    setSelectedProductId("");
    setSelectedCategoryId("");
    setDefectDetail("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview("");
    setSubmitError("");
  };

  // ==================================================
  // BACKEND HATA MESAJI
  // ==================================================

  const getBackendErrorMessage = (error: any): string => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;

    if (data?.errors) {
      const validationErrors: string[] = [];
      Object.entries(data.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((message) => {
            validationErrors.push(`${field}: ${message}`);
          });
        }
      });
      if (validationErrors.length > 0) return validationErrors.join(" ");
    }

    if (data?.detail) return data.detail;
    if (data?.title) return data.title;
    if (error?.response?.status === 401) return "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
    
    return "Hatalı ürün sisteme gönderilemedi. Lütfen tekrar deneyin.";
  };

  // ==================================================
  // ÜRÜN DEĞİŞTİR
  // ==================================================

  const handleProductChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    setSelectedProductId(value === "" ? "" : Number(value));
  };

  // ==================================================
  // HATA KATEGORİSİ DEĞİŞTİR
  // ==================================================

  const handleCategoryChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    setSelectedCategoryId(value === "" ? "" : Number(value));
  };

  // ==================================================
  // SİSTEME GÖNDER
  // ==================================================

  const handleSubmit = async () => {
    setSubmitMessage("");
    setSubmitError("");

    if (!barcodeNumber.trim()) {
      setSubmitError("Lütfen barkod numarasını girin veya kameradan okutun.");
      return;
    }
    if (selectedProductId === "") {
      setSubmitError("Lütfen ürün adını seçin.");
      return;
    }
    if (selectedCategoryId === "") {
      setSubmitError("Lütfen hata türünü seçin.");
      return;
    }
    if (!defectDetail.trim()) {
      setSubmitError("Lütfen hatanın detayını açıklayın.");
      return;
    }
    if (!selectedFile) {
      setSubmitError("Lütfen hatalı ürünün fotoğrafını çekin veya yükleyin.");
      return;
    }

    const formData = new FormData();
    formData.append("BarcodeNumber", barcodeNumber.trim());
    formData.append("ProductId", selectedProductId.toString());
    formData.append("FaultCategoryId", selectedCategoryId.toString());
    formData.append("DefectDescription", defectDetail.trim());
    formData.append("File", selectedFile);

    try {
      setIsSubmitting(true);
      await api.post("/FaultyProducts/report-faulty-product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitMessage("Hatalı ürün başarıyla sisteme kaydedildi.");
      clearForm();
    } catch (error: any) {
      setSubmitError(getBackendErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* BAŞLIK */}
      <Box
        sx={{
          marginBottom: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, marginBottom: 1 }}>
            Hatalı Ürün Bildir
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hatalı ürünü sisteme kaydetmek için aşağıdaki bilgileri doldurun.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ minWidth: 130 }}
        >
          Çıkış Yap
        </Button>
      </Box>

      {/* MESAJLAR */}
      {submitMessage && (
        <Alert severity="success" sx={{ marginBottom: 3 }}>
          {submitMessage}
        </Alert>
      )}
      {submitError && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {submitError}
        </Alert>
      )}

      {/* BARKOD KAMERA */}
      {scannerOpen && (
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
            Barkod Okut
          </Typography>
          <Box
            sx={{
              width: "100%",
              maxWidth: 500,
              margin: "0 auto",
              overflow: "hidden",
              borderRadius: 2,
              backgroundColor: "#000",
            }}
          >
            <video
              ref={videoRef}
              style={{ width: "100%", display: "block" }}
              autoPlay
              muted
              playsInline
            />
          </Box>
          {scannerError && (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {scannerError}
            </Alert>
          )}
          <Button
            fullWidth
            variant="outlined"
            onClick={stopBarcodeScanner}
            sx={{ marginTop: 2 }}
          >
            Kamerayı Kapat
          </Button>
        </Paper>
      )}

      {/* FOTOĞRAF KAMERA DİYALOĞU */}
      <Dialog open={photoCameraOpen} onClose={closePhotoCamera} fullWidth maxWidth="md">
        <DialogTitle>Hatalı Ürün Fotoğrafı Çek</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              borderRadius: 2,
              backgroundColor: "#000",
              marginTop: 1,
            }}
          >
            <video
              ref={photoVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                maxHeight: 600,
                display: "block",
                objectFit: "contain",
              }}
            />
          </Box>
          {photoCameraError && (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {photoCameraError}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ marginTop: 2, textAlign: "center" }}>
            Ürünü kameranın kadrajına yerleştirin ve fotoğrafı çekin.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button onClick={closePhotoCamera} variant="outlined">
            Kamerayı Kapat
          </Button>
          <Button onClick={capturePhoto} variant="contained" startIcon={<CameraAltIcon />}>
            Fotoğrafı Çek
          </Button>
        </DialogActions>
      </Dialog>

      {/* HATALI ÜRÜN FORMU */}
      <Paper sx={{ padding: { xs: 2, sm: 4 }, marginBottom: 4 }}>
        <Box sx={{ display: "grid", gap: 3 }}>
          {/* BARKOD */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1 }}>
              Barkod Numarası
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Okutun veya yazın..."
                value={barcodeNumber}
                onChange={(event) => setBarcodeNumber(event.target.value)}
              />
              <Button
                variant="contained"
                onClick={startBarcodeScanner}
                startIcon={<QrCodeScannerIcon />}
                sx={{ minWidth: { xs: 100, sm: 150 } }}
              >
                Oku
              </Button>
            </Box>
          </Box>

          {/* ÜRÜN */}
          <FormControl fullWidth>
            <InputLabel>Ürün Adı</InputLabel>
            <Select<number | "">
              label="Ürün Adı"
              value={selectedProductId}
              onChange={handleProductChange}
            >
              <MenuItem value="" disabled>
                Ürün seçin
              </MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* HATA TÜRÜ */}
          <FormControl fullWidth>
            <InputLabel>Hata Türü</InputLabel>
            <Select<number | "">
              label="Hata Türü"
              value={selectedCategoryId}
              onChange={handleCategoryChange}
            >
              <MenuItem value="" disabled>
                Hata türü seçin
              </MenuItem>
              {faultCategories.map((defect) => (
                <MenuItem key={defect.id} value={defect.id}>
                  {defect.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* HATA DETAYI */}
          {selectedCategoryId !== "" && (
            <TextField
              fullWidth
              label="Hata Detayı"
              placeholder="Üründeki hatayı detaylı olarak açıklayın..."
              multiline
              minRows={4}
              value={defectDetail}
              onChange={(event) => setDefectDetail(event.target.value)}
            />
          )}

          {/* FOTOĞRAF */}
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              padding: { xs: 3, sm: 4 },
              textAlign: "center",
            }}
          >
            <CameraAltIcon sx={{ fontSize: 45, marginBottom: 1, color: "text.secondary" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1 }}>
              Ürün Fotoğrafı
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
              Hatalı ürünün fotoğrafını kameradan çekin veya bilgisayarınızdan seçin.
            </Typography>

            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={startPhotoCamera}
              sx={{ marginRight: 1, marginBottom: { xs: 1, sm: 0 } }}
            >
              Kamerayı Aç ve Fotoğraf Çek
            </Button>
            <Button variant="outlined" component="label" sx={{ marginBottom: { xs: 1, sm: 0 } }}>
              Bilgisayardan Fotoğraf Seç
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            </Button>

            {selectedFile && (
              <Box sx={{ marginTop: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 2 }}>
                  Fotoğraf hazır: {selectedFile.name}
                </Typography>
                {imagePreview && (
                  <Box>
                    <img
                      src={imagePreview}
                      alt="Hatalı ürün önizleme"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 350,
                        borderRadius: 8,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
                <Button
                  color="error"
                  variant="outlined"
                  onClick={handleRemovePhoto}
                  sx={{ marginTop: 2 }}
                >
                  Fotoğrafı Kaldır
                </Button>
              </Box>
            )}
          </Box>

          {/* GÖNDER */}
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{ minHeight: 50, marginTop: 1 }}
          >
            {isSubmitting ? "Sisteme Gönderiliyor..." : "Sisteme Gönder"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Worker;