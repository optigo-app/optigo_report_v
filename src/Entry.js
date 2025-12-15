import { useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import FactoryLossReport from "./components/FactoryLossReport";
import OrderCompletionReport from "./components/OrderCompletionReport";
import QuoteAnalysisReport from "./components/QuoteAnalysisReport";
import SalesAnalysisReport from "./components/SalesAnalysisReport";
import TagInfoPriceReport from "./components/TagInfoPrice";
import ReportAPI from "./apis/ReportAPI";
import Loader from "./components/shared/Loader";
import { readAndDecodeCookie } from "./libs/CookieReader";

// utils/setUrlAndCookie.ts
export function setUrlAndCookie(CN, cookieName, cookieValue) {
  if (typeof window === "undefined" || !cookieValue) return;
  const url = new URL(window.location.href);
  url.searchParams.set("CN", CN);
  window.history.replaceState({}, "", url.toString()); 
  const expires = new Date();
  expires.setDate(expires.getDate() + 1); 
  document.cookie = `${cookieName}=${encodeURIComponent(
    cookieValue
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  // window.location.reload();
}


export default function Entry() {
  const Report = ReportAPI;
  const [searchParams] = useSearchParams();
  const [queryData, setQueryData] = useState(null);
  const [api, setApi] = useState(null);
  const [error, setError] = useState(null);

  // sales
  // http://nzen/R50B3/Dashboard/?CN=UkRTRF8yMDI1MDkwOTA0MzEzOV9hNWFkODYwOGFjNDU0MmRlOWU3Nzc1YTJiYjBmNmMwMg==
  // RDSD_20250909043139_a5ad8608ac4542de9e7775a2bb0f6c02
  // %7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18314%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22Mw%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22NQ%3d%3d%22%2c%22LUId%22%3a%22YWRtaW5Ab3JhaWwuY28uaW4%3d%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%7d
  // Quote report
  // quote report ?CN=UkRTRF8yMDI1MDgxOTEyMzE0N18yNjdkNDRhZTJmNjk0NzRjYWVkMTVjYWZjZjllODkwYw==
  // RDSD_20250819123147_267d44ae2f69474caed15cafcf9e890c
  // %7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18315%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22NQ%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22NQ%3d%3d%22%2c%22LUId%22%3a%22YWRtaW5Ab3JhaWwuY28uaW4%3d%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%7d
  // Order competion
  // ?CN=UkRTRF8yMDI1MDkwNTExMTkzNF84Njg1YWRiZWY1MTc0ZWVkYWFlMmY1YjMyYWZhMzcxMQ==
  // RDSD_20250905111934_8685adbef5174eedaae2f5b32afa3711 
  // %7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18300%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22NA%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22NQ%3d%3d%22%2c%22LUId%22%3a%22YWRtaW5Ab3JhaWwuY28uaW4%3d%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%7d
  // nine tag
  // /?CN=UkRTRF8yMDI1MDkwOTExMDM1NV9kODAxNWJmZmRkMDc0NDRiOGQzOTQ4NDVlNDg1OTZlNw==
  // RDSD_20250909110355_d8015bffdd07444b8d394845e48596e7
  // %7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18329%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22Ng%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22NQ%3d%3d%22%2c%22LUId%22%3a%22YWRtaW5Ab3JhaWwuY28uaW4%3d%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%7d
  //  order
  // CN=UkRTRF8yMDI1MTAyNzA5MDAwNV9iNTY2NDRmNjhiNjE0YzMyODNhYzI2OGJjZWIxNTk0NA==
  // RDSD_20251027090005_b56644f68b614c3283ac268bceb15944
  // %7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18300%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22NA%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22MTg5Mjk%3d%22%2c%22LUId%22%3a%22dnZrQG56ZW4uY29t%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%2c%22YearCode%22%3a%22e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19%22%2c%22cuVer%22%3a%22UjUwQjM%3d%22%2c%22rptapiurl%22%3a%22aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA%3d%3d%22%7d

  // useEffect(()=>{
  //   // Order Completion
  //   if(process.env.NODE_ENV === 'development'){
  //   setUrlAndCookie(
  //     "UkRTRF8yMDI1MTAyNzA5MDAwNV9iNTY2NDRmNjhiNjE0YzMyODNhYzI2OGJjZWIxNTk0NA==",
  //     "RDSD_20251027090005_b56644f68b614c3283ac268bceb15944",
  //     `%7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18300%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22NA%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22MTg5Mjk%3d%22%2c%22LUId%22%3a%22dnZrQG56ZW4uY29t%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%2c%22YearCode%22%3a%22e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19%22%2c%22cuVer%22%3a%22UjUwQjM%3d%22%2c%22rptapiurl%22%3a%22aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA%3d%3d%22%7d`
  //   )
  // }
  // },[])

  // useEffect(()=>{
  //   // fACTOREY FLOOR
  //   if(process.env.NODE_ENV === 'development'){
  //   setUrlAndCookie(
  //     "UkRTRF8yMDI1MTEyNjA3MTEzN19lMDhiYzM0ZDFjYWQ0N2JjYTM0OWUzMmZmMTA1MGY1MQ==",
  //     "RDSD_20251126071137_e08bc34d1cad47bca349e32ff1050f51",
  //     `%7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18301%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22Nw%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22NQ%3d%3d%22%2c%22LUId%22%3a%22YWRtaW5Ab3JhaWwuY28uaW4%3d%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%2c%22YearCode%22%3a%22e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19%22%2c%22cuVer%22%3a%22UjUwQjM%3d%22%2c%22rptapiurl%22%3a%22aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA%3d%3d%22%7d`
  //   )
  // }
  // },[])



  const decodeBase64 = (value) => {
    try {
      return atob(value);
    } catch {
      return value;
    }
  };

  const InitializeReport = async () => {
    try {
      const paramsObject = {};
      for (const [key, value] of searchParams.entries()) {
        paramsObject[key] = decodeBase64(value);
      }
      if (!paramsObject?.CN) {
        setError("Something went wrong.");
        setQueryData({});
        return;
      }

      const cookieData = await readAndDecodeCookie(paramsObject?.CN);

      if (!cookieData) {
        setError("Cookie not found or invalid.");
        setQueryData({});
        return;
      }

      setQueryData(cookieData);
      if (cookieData?.DAU) {
        Report.initialize({
          baseURL: cookieData?.DAU,
          defaultBody: {
            Token: cookieData?.tkn,
            SpNo: cookieData?.SpNo,
            SpVer: cookieData?.SpVer || "Live",
            ReqData: [
              {
                Token: cookieData?.tkn,
                SV: cookieData?.SV,
              },
            ],
          },
        });
        setApi(Report);
      }
    } catch (err) {
      console.error("Failed to load report:", err);
      setError("Unexpected error while loading report.");
      setQueryData({});
    }
  };

  useEffect(() => {
    // let interval;

    InitializeReport();
    // interval = setInterval(InitializeReport, 1 * 60 * 1000);
    // return () => clearInterval(interval);
  }, [searchParams]);

  const reportMap = useMemo(
    () => ({
      18301: FactoryLossReport,
      18300: OrderCompletionReport,
      18315: QuoteAnalysisReport,
      18314: SalesAnalysisReport,
      18329: TagInfoPriceReport,
    }),
    []
  );

  // Loader
  if (queryData === null && !error) {
    return <Loader msg="Setting up report" />;
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" gap={1}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please check your URL or cookie settings.
        </Typography>
      </Box>
    );
  }

  const SelectedReport = reportMap[queryData?.pid];

  if (!SelectedReport) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h6">Session expired or invalid.</Typography>
        <Typography variant="body2" color="text.secondary">
          Please reload the page or login again.
        </Typography>
      </Box>
    );
  }

  return <SelectedReport queryData={queryData} api={api} />;
}
