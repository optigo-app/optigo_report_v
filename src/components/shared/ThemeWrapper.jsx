import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MuithemeR } from "../../constants/Theme";
import "@fontsource/poppins";
import "../../index.css";
import { GlobalStyles } from "@mui/material";

const ThemeWrapper = ({ children }) => {
  return (
    <>
      <ThemeProvider theme={MuithemeR}>
        <GlobalStyles
          styles={{
            // ".recharts-wrapper:focus, .recharts-surface:focus": {
            //   outline: "none !important",
            //   border: "none !important",
            // },
            ".recharts-wrapper *:focus": {
              outline: "2px solid rgba(0, 123, 255, 0.4)",
              outlineOffset: "2px",
              borderRadius: "4px",
            },
          }}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </>
  );
};

export default ThemeWrapper;
