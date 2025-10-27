import React, { createContext, useContext, useState, useEffect } from "react";
import { OrderDelayData } from "../data/data";
import ReportAPI from "../apis/ReportAPI";

const OrderCompletionContext = createContext();

export const useOrderCompletion = () => useContext(OrderCompletionContext);

export const OrderCompletionProvider = ({ children }) => {
  const [rawData, setRawData] = useState([]);
  const Report = ReportAPI;
  const [error, setError] = useState(null);

  const GetOrderCompletionReport = async () => {
    try {
      const res = await Report.request("OrderCompletion");
      const Parsed = res?.Data?.DT;
      setRawData(Parsed);
    } catch (error) {
      console.log("🚀 ~ OrderCompletionProvider ~ error:", error);
      setError(error);
    }
  };

  useEffect(() => {
    GetOrderCompletionReport();
  }, []);

  return (
    <OrderCompletionContext.Provider
      value={{
        rawData,
        setRawData,
      }}
    >
      {children}
    </OrderCompletionContext.Provider>
  );
};
