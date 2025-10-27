import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css/navigation";
import "swiper/css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "@fontsource/poppins";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1", // Indigo-500, modern and classy
      light: "#a5b4fc", // Indigo-300
      dark: "#4f46e5", // Indigo-600
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10b981", // Emerald-500
      light: "#6ee7b7",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f9fafb", // soft gray background
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937", // neutral-800
      secondary: "#6b7280", // neutral-500
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#ef4444",
    },
    success: {
      main: "#22c55e",
    },
    info: {
      main: "#3b82f6",
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: " rgba(90, 90, 90, 0.048) 0px 0px 0px 0.5px",
          border: "1px solid rgba(90, 90, 90, 0.055)",
          scrollbarColor: "rgba(90, 90, 90, 0.055) transparent",
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 25,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(90, 90, 90, 0.055)",
          },
          "&::-webkit-scrollbar-button": {
            display: "none",
          },
        },
      },
    },
  },
});

const Main = () => {
  function getBaseName() {
    const path = window.location.pathname;
    const match = path.match(/^\/([^/]+\/[^/]+)/);
    return match ? `/${match[1]}` : "/";
  }

  return (
    <>
      <Suspense fallback={<div></div>}>
        <BrowserRouter basename={getBaseName()}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <Router />
            </LocalizationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Suspense>
    </>
  );
};


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Main />);

