import React from "react";
import SalesAnalysisReport from "./Main";
import ThemeWrapper from "../shared/ThemeWrapper";
import { SalesReportProvider } from "../../context/SalesAnalysisReport";

const index = () => {
  return (
    <>
      <SalesReportProvider>
        <ThemeWrapper>
          <SalesAnalysisReport />
        </ThemeWrapper>
      </SalesReportProvider>
    </>
  );
};

export default index;
