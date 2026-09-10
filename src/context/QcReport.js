import React, { createContext, useContext, useEffect, useState } from "react";
import { QcReportSampleData } from "../data/QcReport";
import ReportAPI from "../apis/ReportAPI";
const QcReportContext = createContext();

export const useQcReport = () => useContext(QcReportContext);

export const QcReportProvider = ({ children }) => {
  const Report = ReportAPI;
  const [filters, setFilters] = useState({
    dateRange: { startDate: "", endDate: "" },
  });

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetQcReport = async () => {
    setLoading(true);
    try {
      const res = await Report.request("QcReport");
      const Parsed = res?.Data?.DT;
      if (Array.isArray(Parsed) && Parsed.length > 0) {
        setRawData(Parsed);
      } else {
        setRawData(QcReportSampleData || []);
      }
    } catch (err) {
      setError(err);
      setRawData(QcReportSampleData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetQcReport();
  }, []);

  return (
    <QcReportContext.Provider
      value={{
        filters,
        setFilters,
        rawData,
        setRawData,
        loading,
        error,
        refetch: GetQcReport,
      }}
    >
      {children}
    </QcReportContext.Provider>
  );
};
