import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, Button, CircularProgress, Grid, IconButton, Paper, TextField, Typography, Alert, Chip, Fade, Drawer, useMediaQuery, Modal } from "@mui/material";
import { QrCodeScanner, Camera, Clear } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useTagContext } from "../../context/TagContext";
import ScanCard from "./ScanCard";
import SingleCard from "./SingleCard";
import debounce from "lodash.debounce";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import { Inventory2Outlined } from "@mui/icons-material"; // you can choose any icon


const StyledContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: process.env.NODE_ENV === "production" ? "calc(100vh - 53px)" : "100vh",
  backgroundColor: "#fafafa",
}));

const StickyScanner = styled(Paper)(({ theme }) => ({
  position: "sticky",
  top: 0,
  height: process.env.NODE_ENV === "production" ? "calc(100vh - 53px)" : "100vh",
  width: 450,
  minWidth: 450,
  padding: theme.spacing(3),
  backgroundColor: "#fff",
  borderRadius: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
  flex: 1,
  height: "100vh",
  overflowY: "auto",
  padding: theme.spacing(3),
  backgroundColor: "#fafafa",
}));

const ScannerInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: 12,
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: "none",
  fontWeight: 600,
  padding: "12px 24px",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
    transform: "translateY(-1px)",
  },
  transition: "all 0.2s ease",
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  fontSize: "0.75rem",
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  borderRadius: "50%",
  background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
  backdropFilter: "blur(6px)",
  transition: "all 0.2s ease",
  "&:hover": {
    background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)",
    transform: "scale(1.05)",
  },
  position: "fixed",
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 1300,
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

function Home() {
  const [zoomCap, setZoomCap] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scanningRef = useRef(false);
  const cooldownTime = 2000;
  const webcamRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const trackRef = useRef(null);
  const decodeTimerRef = useRef(null);
  const [scanValue, setScanValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanHistory, setScanHistory] = useState([]);
  const { GetTagReport } = useTagContext();
  const [showAll, setShowAll] = useState(false);
  const [SelectedJob, setSelectedJob] = useState(null);
  const scannerInputRef = useRef(null);
  const CANVAS_SIDE = 400;
  const SCAN_INTERVAL = 200;
  const hasBarcodeAPI = "BarcodeDetector" in window;
  const IsTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [openVolume, setOpenVolume] = useState(false);
  const [NoItem, setNoItem] = useState(null)

  const detectorRef = useRef(
    hasBarcodeAPI
      ? new window.BarcodeDetector({
        formats: ["qr_code", "ean_13", "code_128", "code_39", "upc_a", "upc_e", "ean_8"],
      })
      : null
  );

  useEffect(() => {
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, []);

  const fetchProductData = async (scannedCode) => {
    setLoading(true);
    setError("");

    try {
      const response = await GetTagReport(scannedCode);
      if (response?.status === 202) {
        setNoItem(response?.message);
        setLoading(false);
        setProducts([]);
        return;
      }
      setNoItem(null);
      //   const response = [
      //     {
      //         "ArticleId": 9059,
      //         "Design No": "EC124012",
      //         "autocode": "0000001",
      //         "Article No": "EC124012_9059G",
      //         "Metal Type": "GOLD 18K",
      //         "Metalquality": "18K",
      //         "Metal Color": "Y",
      //         "Metalwt": 4.676,
      //         "diajson": "[{ \"ctw\":0.120,\"shape\":\"ROUND\",\"size\":\"1\",\"Quality\":\"VS\",\"color\":\"GH\",\"pieces\":5}]",
      //         "stonejson": "[{ \"ctw\":0.250,\"shape\":\"round9\",\"size\":\"8mm\",\"Quality\":\"RUBY\",\"color\":\"GREEN\",\"pieces\":12}]",
      //         "miscjson": "[{ \"ctw\":2.000,\"shape\":\"BLACK BEADS\",\"size\":\"mix\",\"Quality\":\"A1\",\"color\":\"Brown\",\"pieces\":1}]",
      //         "Imagesrc": "http://nzen/R50B3/UFSImage/orail25TNBVD0LO2UFPRZ4YH_Image/Design_Image/Design_Thumb/EC124012~1.jpg",
      //         "Taxamount": "",
      //         "priceMrp": "5242.54",
      //         "ToolItemId": 3,
      //         "tax": {
      //             "tax1": 262.127,
      //             "tax2": 0,
      //             "tax3": 0,
      //             "tax4": 0,
      //             "tax5": 0,
      //             "total": 262.127
      //         }
      //     },
      //     {
      //         "ArticleId": 9060,
      //         "Design No": "EC124012",
      //         "autocode": "0000001",
      //         "Article No": "EC124012_9060G",
      //         "Metal Type": "GOLD 18K",
      //         "Metalquality": "18K",
      //         "Metal Color": "P-W",
      //         "Metalwt": 4.676,
      //         "diajson": "[{ \"ctw\":0.120,\"shape\":\"ROUND\",\"size\":\"1\",\"Quality\":\"VVS\",\"color\":\"GH\",\"pieces\":5}]",
      //         "stonejson": "[{ \"ctw\":0.250,\"shape\":\"round9\",\"size\":\"8mm\",\"Quality\":\"EMERALD\",\"color\":\"GREEN\",\"pieces\":12}]",
      //         "miscjson": "[{ \"ctw\":2.000,\"shape\":\"BLACK BEADS\",\"size\":\"mix\",\"Quality\":\"A1\",\"color\":\"Brown\",\"pieces\":1}]",
      //         "Imagesrc": "http://nzen/R50B3/UFSImage/orail25TNBVD0LO2UFPRZ4YH_Image/Design_Image/Design_Thumb/EC124012~1.jpg",
      //         "Taxamount": "",
      //         "priceMrp": "5242.54",
      //         "ToolItemId": 3,
      //         "tax": {
      //             "tax1": 262.127,
      //             "tax2": 0,
      //             "tax3": 0,
      //             "tax4": 0,
      //             "tax5": 0,
      //             "total": 262.127
      //         }
      //     },
      //     {
      //         "ArticleId": 9061,
      //         "Design No": "EC124012",
      //         "autocode": "0000001",
      //         "Article No": "EC124012_9061G",
      //         "Metal Type": "GOLD 14K",
      //         "Metalquality": "14K",
      //         "Metal Color": "Y",
      //         "Metalwt": 3.928,
      //         "diajson": "[{ \"ctw\":0.120,\"shape\":\"ROUND\",\"size\":\"1\",\"Quality\":\"VS\",\"color\":\"GH\",\"pieces\":5}]",
      //         "stonejson": "[{ \"ctw\":0.250,\"shape\":\"round9\",\"size\":\"8mm\",\"Quality\":\"RUBY\",\"color\":\"GREEN\",\"pieces\":12}]",
      //         "miscjson": "[{ \"ctw\":2.000,\"shape\":\"BLACK BEADS\",\"size\":\"mix\",\"Quality\":\"A1\",\"color\":\"Brown\",\"pieces\":1}]",
      //         "Imagesrc": "http://nzen/R50B3/UFSImage/orail25TNBVD0LO2UFPRZ4YH_Image/Design_Image/Design_Thumb/EC124012~1.jpg",
      //         "Taxamount": "",
      //         "priceMrp": "65773.74",
      //         "ToolItemId": 3,
      //         "tax": {
      //             "tax1": 3288.687,
      //             "tax2": 0,
      //             "tax3": 0,
      //             "tax4": 0,
      //             "tax5": 0,
      //             "total": 3288.687
      //         }
      //     },
      //     {
      //         "ArticleId": 9062,
      //         "Design No": "EC124012",
      //         "autocode": "0000001",
      //         "Article No": "EC124012_9062G",
      //         "Metal Type": "GOLD 22K",
      //         "Metalquality": "22K",
      //         "Metal Color": "Y",
      //         "Metalwt": 5.338,
      //         "diajson": "[{ \"ctw\":0.120,\"shape\":\"ROUND\",\"size\":\"1\",\"Quality\":\"VS\",\"color\":\"GH\",\"pieces\":5}]",
      //         "stonejson": "[{ \"ctw\":0.250,\"shape\":\"round9\",\"size\":\"8mm\",\"Quality\":\"RUBY\",\"color\":\"GREEN\",\"pieces\":12}]",
      //         "miscjson": "[{ \"ctw\":2.000,\"shape\":\"BLACK BEADS\",\"size\":\"mix\",\"Quality\":\"A1\",\"color\":\"Brown\",\"pieces\":1}]",
      //         "Imagesrc": "http://nzen/R50B3/UFSImage/orail25TNBVD0LO2UFPRZ4YH_Image/Design_Image/Design_Thumb/EC124012~1.jpg",
      //         "Taxamount": "",
      //         "priceMrp": "128465.96",
      //         "ToolItemId": 3,
      //         "tax": {
      //             "tax1": 6423.298000000001,
      //             "tax2": 0,
      //             "tax3": 0,
      //             "tax4": 0,
      //             "tax5": 0,
      //             "total": 6423.298000000001
      //         }
      //     },
      //     {
      //         "ArticleId": 9063,
      //         "Design No": "EC124012",
      //         "autocode": "0000001",
      //         "Article No": "EC124012_9063G",
      //         "Metal Type": "GOLD 10K",
      //         "Metalquality": "10K",
      //         "Metal Color": "P",
      //         "Metalwt": 3.646,
      //         "diajson": "[{ \"ctw\":0.120,\"shape\":\"ROUND\",\"size\":\"1\",\"Quality\":\"VS\",\"color\":\"GH\",\"pieces\":5}]",
      //         "stonejson": "[{ \"ctw\":0.250,\"shape\":\"round9\",\"size\":\"8mm\",\"Quality\":\"RUBY\",\"color\":\"GREEN\",\"pieces\":12}]",
      //         "miscjson": "[{ \"ctw\":2.000,\"shape\":\"BLACK BEADS\",\"size\":\"mix\",\"Quality\":\"A1\",\"color\":\"Brown\",\"pieces\":1}]",
      //         "Imagesrc": "http://nzen/R50B3/UFSImage/orail25TNBVD0LO2UFPRZ4YH_Image/Design_Image/Design_Thumb/EC124012~1.jpg",
      //         "Taxamount": "",
      //         "priceMrp": "46503.06",
      //         "ToolItemId": 3,
      //         "tax": {
      //             "tax1": 2325.153,
      //             "tax2": 0,
      //             "tax3": 0,
      //             "tax4": 0,
      //             "tax5": 0,
      //             "total": 2325.153
      //         }
      //     },
      //     {
      //         "ArticleId": 9064,
      //         "Design No": "EC124012",
      //         "autocode": "0000001",
      //         "Article No": "EC124012_9064G",
      //         "Metal Type": "GOLD 22K",
      //         "Metalquality": "22K",
      //         "Metal Color": "Y",
      //         "Metalwt": 5.338,
      //         "diajson": "[{ \"ctw\":0.120,\"shape\":\"ROUND\",\"size\":\"1\",\"Quality\":\"VVS\",\"color\":\"GH\",\"pieces\":5}]",
      //         "stonejson": "[{ \"ctw\":0.250,\"shape\":\"round9\",\"size\":\"8mm\",\"Quality\":\"RUBY\",\"color\":\"GREEN\",\"pieces\":12}]",
      //         "miscjson": "[{ \"ctw\":2.000,\"shape\":\"BLACK BEADS\",\"size\":\"mix\",\"Quality\":\"A1\",\"color\":\"Brown\",\"pieces\":1}]",
      //         "Imagesrc": "http://nzen/R50B3/UFSImage/orail25TNBVD0LO2UFPRZ4YH_Image/Design_Image/Design_Thumb/EC124012~1.jpg",
      //         "Taxamount": "",
      //         "priceMrp": "128465.96",
      //         "ToolItemId": 3,
      //         "tax": {
      //             "tax1": 6423.298000000001,
      //             "tax2": 0,
      //             "tax3": 0,
      //             "tax4": 0,
      //             "tax5": 0,
      //             "total": 6423.298000000001
      //         }
      //     },
      //     {
      //         "ArticleId": 9065,
      //         "Design No": "EC124012",
      //         "autocode": "0000001",
      //         "Article No": "EC124012_9065S",
      //         "Metal Type": "SILVER 92.5",
      //         "Metalquality": "92.5",
      //         "Metal Color": "Y",
      //         "Metalwt": 4.676,
      //         "diajson": "[{ \"ctw\":0.120,\"shape\":\"ROUND\",\"size\":\"1\",\"Quality\":\"VS\",\"color\":\"GH\",\"pieces\":5}]",
      //         "stonejson": "[{ \"ctw\":0.250,\"shape\":\"round9\",\"size\":\"8mm\",\"Quality\":\"RUBY\",\"color\":\"GREEN\",\"pieces\":12}]",
      //         "miscjson": "[{ \"ctw\":2.000,\"shape\":\"BLACK BEADS\",\"size\":\"mix\",\"Quality\":\"A1\",\"color\":\"Brown\",\"pieces\":1}]",
      //         "Imagesrc": "http://nzen/R50B3/UFSImage/orail25TNBVD0LO2UFPRZ4YH_Image/Design_Image/Design_Thumb/EC124012~1.jpg",
      //         "Taxamount": "",
      //         "priceMrp": "3733.47",
      //         "ToolItemId": 3,
      //         "tax": {
      //             "tax1": 186.6735,
      //             "tax2": 0,
      //             "tax3": 0,
      //             "tax4": 0,
      //             "tax5": 0,
      //             "total": 186.6735
      //         }
      //     }
      // ]
      setProducts(response);
      setSelectedJob(response[0]);
      setShowAll(false);
      setScanHistory((prev) => [
        {
          code: scannedCode,
          timestamp: new Date(),
          productCount: response.length || 1,
        },
        ...prev.slice(0, 4),
      ]);
      if (IsTablet) {
        setOpen(false)
      }
    } catch (err) {
      setError(err.message || "Failed to fetch product data");
      setProducts([]);
      setNoItem(null);
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const debouncedScan = useCallback(
    debounce((code) => {
      fetchProductData(code);
      setIsScanning(false);
    }, 300),
    []
  );

  const clearScanner = () => {
    setScanValue("");
    setProducts([]);
    setError("");
    setNoItem(null);
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  };

  const ClearHistory = () => {
    setScanHistory([]);
  };

  const handleUserMedia = (stream) => {
    const [track] = stream.getVideoTracks();
    trackRef.current = track;
    const caps = track.getCapabilities?.();
    if (caps?.zoom) {
      const { min, max, step = 0.1 } = caps.zoom;
      setZoomCap({ min, max, step });
      setZoomLevel(min ?? 1);
      track.applyConstraints({ advanced: [{ zoom: min }] }).catch(() => { });
    }
    canvasRef.current.width = CANVAS_SIDE;
    canvasRef.current.height = CANVAS_SIDE;
    decodeTimerRef.current = setInterval(decodeFrame, SCAN_INTERVAL);
  };

  const decodeFrame = useCallback(async () => {
    if (scanningRef.current) return;

    const video = webcamRef.current?.video;
    if (!video || video.readyState < 2) return;

    const { videoWidth: w, videoHeight: h } = video;
    const side = Math.min(w, h);
    const sx = (w - side) / 2;
    const sy = (h - side) / 2;
    const ctx = canvasRef.current.getContext("2d", {
      willReadFrequently: true,
    });
    ctx.drawImage(video, sx, sy, side, side, 0, 0, CANVAS_SIDE, CANVAS_SIDE);

    let result = null;
    if (hasBarcodeAPI) {
      const barcodes = await detectorRef.current.detect(canvasRef.current);
      if (barcodes.length) result = barcodes[0].rawValue;
    } else {
      const imgData = ctx.getImageData(0, 0, CANVAS_SIDE, CANVAS_SIDE);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      result = code?.data;
    }

    if (result) {
      scanningRef.current = true;
      setLoading(true);
      const jobNo = result.trim();
      fetchProductData(jobNo);
      setScanValue(jobNo);
      setTimeout(() => {
        scanningRef.current = false;
      }, cooldownTime);
    }
  }, [fetchProductData, hasBarcodeAPI]);

  const FocusScanner = () => {
    if (scannerInputRef.current) {
      scannerInputRef.current?.focus()
      if (IsTablet && !open) {
        setOpen(true); // only open on tablet if closed
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F2") {
        event.preventDefault();
        if (scannerInputRef.current) {
          scannerInputRef.current.focus();
        }
      }
      if (event.key === "Escape") {
        clearScanner();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      debouncedScan.cancel();
    };
  }, [debouncedScan]);

  return (
    <>
      <StyledContainer>
        {IsTablet && !open && (
          <CloseButton size="medium"
            onClick={() => setOpen(true)} // <-- OPEN drawer
          >
            <MenuOpenRoundedIcon fontSize="medium" />
          </CloseButton>
        )}
        <DrawerMain open={open} onClose={() => setOpen(false)} IsTablet={IsTablet}>
          <StickyScanner elevation={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                Barcode Scanner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scan or enter product barcode
              </Typography>
            </Box>

            {/* Scanner Input */}
            <Box sx={{ mb: 3 }}>
              <ScannerInput
                inputRef={scannerInputRef}
                fullWidth
                label="Scan Barcode"
                variant="outlined"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)} // only update value
                onKeyDown={(e) => {
                  if (e.key === "Enter" && scanValue.trim()) {
                    fetchProductData(scanValue?.trim());
                  }
                }}
                placeholder="Position barcode in scanner..."
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={clearScanner} size="small" sx={{ mr: 1 }}>
                      <Clear />
                    </IconButton>
                  ),
                }}
                autoComplete="off"
                autoFocus
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
              <ModernButton
                variant="contained"
                fullWidth
                startIcon={isScanning ? <CircularProgress size={18} /> : <QrCodeScanner />}
                onClick={() => {
                  if (scanValue.trim()) {
                    setIsScanning(true);
                    fetchProductData(scanValue.trim());
                  }
                }}
                disabled={isScanning || !scanValue.trim()}
              >
                {isScanning ? "Scanning..." : "Scan (F2)"}
              </ModernButton>

              <IconButton
                variant="outlined"
                onClick={() => {
                  if (scanValue.trim()) {
                    setIsScanning(true);
                    fetchProductData(scanValue.trim());
                  }
                }}
                disabled={isScanning}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <Camera />
              </IconButton>
            </Box>

            {/* Status Alerts */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{ mb: 2, borderRadius: 2 }}
                  action={
                    <IconButton size="small" onClick={() => setError("")}>
                      <Clear fontSize="small" />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {isScanning && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} />
                  Scanning product...
                </Box>
              </Alert>
            )}
            <Box
              sx={{
                width: "100%",
                height: 280,
                borderRadius: 4,
                overflow: "hidden",
                borderColor: "divider",
                mb: 2,
                position: "relative",
              }}
            >
              <Webcam
                ref={webcamRef}
                mirrored={false}
                audio={false}
                playsInline
                muted
                forceScreenshotSourceSize
                onUserMedia={handleUserMedia}
                onUserMediaError={(err) => IsTablet ? setOpen(true) : {}}
                videoConstraints={{
                  facingMode: { ideal: "environment" },
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                  advanced: zoomCap ? [{ zoom: zoomLevel }] : undefined,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <Box sx={{ mt: "auto" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recent Scans
                  </Typography>
                  {scanHistory.length > 0 && <Chip label="Clear" variant="filled" color="error" size="small" onClick={ClearHistory} />}
                </Box>
                <Box sx={{ maxHeight: 120, overflowY: "auto" }}>
                  {scanHistory?.map((scan, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1,
                        borderBottom: index < scanHistory.length - 1 ? 1 : 0,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {scan.code.slice(0, 10)}...
                      </Typography>
                      <StatusChip size="small" label={`${scan.productCount} items`} color="primary" variant="outlined" />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </StickyScanner>
        </DrawerMain>

        <ScrollableContent>
          {/* Empty State */}
          {!loading && !products?.length && !error && !NoItem && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 900,
                textAlign: "center",
                py: 8,
              }}
            >
              <QrCodeScanner sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Ready to Scan
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Position the barcode in front of the scanner or enter the code manually
              </Typography>
              <ModernButton variant="contained" startIcon={<QrCodeScanner />} onClick={FocusScanner}>
                Focus Scanner
              </ModernButton>
            </Box>
          )}

          {NoItem && <>
            <NoItemsContainer />
          </>}

          {/* Product Results */}
          {!loading && products?.length > 0 && (
            <Fade in>
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "#fff",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Scanned Job Information</Typography>

                    {scanValue && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Scanned Code:
                        </Typography>
                        <Chip label={scanValue} variant="outlined" size="small" />
                      </Box>
                    )}
                  </Box>
                  {isScanning && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        py: 6,
                        px: 2,
                        height: "100%",
                        minHeight: "800px",
                      }}
                    >
                      <CircularProgress size={50} thickness={4} color="primary" />
                      <Typography variant="h6" mt={2} fontWeight="500">
                        Scanning...
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Please wait while we detect the item.
                      </Typography>
                    </Box>
                  )}
                  {!showAll && SelectedJob && <SingleCard SelectedJob={SelectedJob} setShowAll={setShowAll} />}
                  {showAll && (
                    <>
                      <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Showing all available designs
                        </Typography>
                        <Button size="small" variant="outlined" sx={{ mt: 1, textTransform: "none" }} onClick={() => setShowAll(false)}>
                          Back to Scanned Item
                        </Button>
                      </Box>
                      <Grid container spacing={3}>
                        {products?.map((pd) => (
                          <ScanCard key={pd?.ArticleId} product={pd} />
                        ))}
                      </Grid>
                    </>
                  )}
                </Paper>
              </Grid>
            </Fade>
          )}
        </ScrollableContent>
      </StyledContainer>
    </>
  );
}

export default Home;

const DrawerMain = ({ open, onClose, IsTablet, children }) => {
  if (IsTablet) {
    return (
      <Drawer
        anchor="left"
        sx={{
          borderRadius: "0 !important",
          "& .MuiDrawer-paper": {
            borderRadius: "0 !important",
          },
        }}
        ModalProps={{ keepMounted: true }} // improves perf on mobile
        open={open}
        onClose={onClose}
      >
        {children}
      </Drawer>
    );
  } else {
    return children
  }
}

const NoItemsContainer = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        py: { xs: 4, sm: 6, md: 8 },
        px: 2,
        gap: 0,
      }}
    >
      <Box
        sx={{
          fontSize: { xs: 55, sm: 60, md: 80 },
          color: "primary.main",
          opacity: 0.25,
          transition: "transform 0.3s ease-in-out",
          "&:hover": { transform: "scale(1.05)" },
        }}
      >
        <Inventory2Outlined fontSize="inherit" />
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          mb: 1,
        }}
      >
        No products found
      </Typography>
    </Box>
  );
};
