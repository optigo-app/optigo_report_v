import React, { createContext, useContext, useState, useEffect } from "react";
import ReportAPI from "../apis/ReportAPI";

const TagContext = createContext();
export const useTagContext = () => useContext(TagContext);

export const TagContextProvider = ({ children }) => {
  const [MasterData, setMasterData] = useState({ HSN: [], Tax: [] });
  const Report = ReportAPI;

  const GetTaxMaster = async () => {
    try {
      const cached = sessionStorage.getItem("MasterData");
      if (cached) {
        const parsed = JSON.parse(cached);
        setMasterData(parsed);
        return parsed;
      }

      const res = await Report.request("GetTaxMaster");
      const dt = res?.Data?.DT || [];
      const dt1 = res?.Data?.DT1 || [];

      const nextData = { HSN: [], Tax: [] };

      [dt, dt1]?.forEach((arr) => {
        if (Array.isArray(arr) && arr.length > 0) {
          const masterName = arr[0]?.MasterName;
          if (masterName === "Tax") nextData.Tax = arr;
          if (masterName === "HSN") nextData.HSN = arr;
        }
      });

      setMasterData(nextData);
      sessionStorage.setItem("MasterData", JSON.stringify(nextData));
      return nextData;
    } catch (error) {
      console.error("GetTaxMaster failed", error);
      const fallback = { HSN: [], Tax: [] };
      setMasterData(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    GetTaxMaster();
  }, []);

  const TaxCalculator = async (ToolItemId, data) => {
    try {
      const BASE_PRICE = Number(data?.priceMrp) || 0;

      const HSN = Array.isArray(MasterData.HSN) ? MasterData.HSN : [];
      const Tax = Array.isArray(MasterData.Tax) ? MasterData.Tax : [];
      const Find_IGST = HSN.find((item) => item?.id == ToolItemId);

      if (Find_IGST) {
        const IGST = (BASE_PRICE * (Find_IGST?.IGST || 0)) / 100;
        return { tax1: IGST, tax2: 0, tax3: 0, tax4: 0, tax5: 0, total: IGST };
      } else {
        const {
          tax1_value = 0,
          tax2_value = 0,
          tax3_value = 0,
          tax4_value = 0,
          tax5_value = 0,
        } = Tax[0] || {};

        const tax1 = (BASE_PRICE * tax1_value) / 100;
        const tax2 = (BASE_PRICE * tax2_value) / 100;
        const tax3 = (BASE_PRICE * tax3_value) / 100;
        const tax4 = (BASE_PRICE * tax4_value) / 100;
        const tax5 = (BASE_PRICE * tax5_value) / 100;
        const total = tax1 + tax2 + tax3 + tax4 + tax5;

        return { tax1, tax2, tax3, tax4, tax5, total };
      }
    } catch (error) {
      console.error("TaxCalculator error:", error);
      return { tax1: 0, tax2: 0, tax3: 0, tax4: 0, tax5: 0, total: 0 };
    }
  };

  const GetTagReport = async (jobNo) => {
    try {
      if (!MasterData.HSN.length && !MasterData.Tax.length) await GetTaxMaster();

      const res = await Report.request("GetScanJobData", { jobno: jobNo });
      if (res?.Status === 202 || res?.Message === "Data Not Found") {
        return {
          status: 202,
          message: "Data Not Found",
          data: [],
        };
      }
      const enrichedProducts = await Promise.all(
        (res?.Data?.DT || []).map(async (pd) => {
          const tax = await TaxCalculator(pd?.ToolItemId, pd);
          return { ...pd, tax };
        })
      );

      return enrichedProducts;
    } catch (error) {
      console.error("GetTagReport failed", error);
      return [];
    }
  };

  return (
    <TagContext.Provider value={{ GetTagReport, MasterData, TaxCalculator }}>
      {children}
    </TagContext.Provider>
  );
};
