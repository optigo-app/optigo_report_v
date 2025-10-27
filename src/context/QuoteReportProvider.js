import React, { createContext, useContext, useState, useEffect } from "react";
import { QuoteReportData } from "../data/quote";
import ReportAPI from "../apis/ReportAPI";

const QuoteReportContext = createContext();

export const useQuoteReport = () => useContext(QuoteReportContext);

export const QuoteReportProvider = ({ children }) => {
  const [rawData, setRawData] = useState([]);
  const [topCustomersAmount, setTopCustomersAmount] = useState([]);
  const Report = ReportAPI;
  const [error, setError] = useState(null);

  const GetQuoteAnalysis = async () => {
    try {
      const res = await Report.request("QuoteAnalysis");
      const Parsed = res?.Data?.DT;
      const TopCustomersAmount = res?.Data?.DT1;
      setTopCustomersAmount(TopCustomersAmount)
      console.log("🚀 ~ GetQuoteAnalysis ~ Parsed:", Parsed);
      setRawData(Parsed);
    } catch (error) {
      console.log("🚀 ~ QuoteAnalysis ~ error:", error);
      setError(error);
    }
  };

  useEffect(() => {
    GetQuoteAnalysis();
  }, []);
  return (
    <QuoteReportContext.Provider
      value={{
        rawData,
        setRawData,
        topCustomersAmount,
        setTopCustomersAmount,
      }}
    >
      {children}
    </QuoteReportContext.Provider>
  );
};
