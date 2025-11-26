import React, { createContext, useContext, useEffect, useState } from "react";
import { FactoryLossReportData } from "../data/data";
import ReportAPI from "../apis/ReportAPI";
const FactoryLossContext = createContext();

export const useFactoryLoss = () => useContext(FactoryLossContext);

export const FactoryLossProvider = ({ children }) => {
  const Report = ReportAPI;
  const [filters, setFilters] = useState({
    category: null,
    location: null,
    dateRange: [null, null],
  });

  const [rawData, setRawData] = useState([]);
  const [error, setError] = useState(null);


  const GetFFLossCompletionReport = async () => {
    try {
      const res = await Report.request("FactoryFloorLossAnalysis");
      const Parsed = res?.Data?.DT;
      setRawData(Parsed);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    GetFFLossCompletionReport();
  }, []);
  return (
    <FactoryLossContext.Provider
      value={{
        filters,
        setFilters,
        rawData,
        setRawData,
      }}
    >
      {children}
    </FactoryLossContext.Provider>
  );
};
