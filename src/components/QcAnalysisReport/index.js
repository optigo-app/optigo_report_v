import React from "react";
import { QcReportProvider } from "../../context/QcReport";
import ThemeWrapper from "../shared/ThemeWrapper";

import Main from "./Main";

const QCAnalysisReport = () => {
  return (
    <ThemeWrapper>
      <QcReportProvider>
        <Main />
      </QcReportProvider>
    </ThemeWrapper>
  );
};

export default QCAnalysisReport;
