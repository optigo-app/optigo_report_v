import React, { createContext, useContext, useState, useEffect } from "react";
import ReportAPI from "../apis/ReportAPI";
const SalesReportContext = createContext();

export const useSalesReport = () => useContext(SalesReportContext);

export const SalesReportProvider = ({ children }) => {
  const [rawData, setRawData] = useState([]);
  const Report = ReportAPI;
  const [error, setError] = useState(null);

  const GetSalesReport = async () => {
    try {
      const res = await Report.request("SaleAnalysis");
      const Parsed = res?.Data?.DT;
      setRawData(Parsed);
    } catch (error) {
      console.log("🚀 ~ SalesReportProvider ~ error:", error);
      setError(error);
    }
  };

  useEffect(() => {
    GetSalesReport();
  }, []);

  return (
    <SalesReportContext.Provider
      value={{
        rawData,
        setRawData,
      }}
    >
      {children}
    </SalesReportContext.Provider>
  );
};
