import React, { useMemo, useState } from "react";
import { Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import MonthWiseSalesArearChart from "./MonthWiseSales";
import LocationWiesSales from "./LocationWiesSales";
import Top10Customers from "./Top10Customers";
import Top10Category from "./Top10Category";
import SalesByVendor from "./SalesByVendor";
import SalesRepwise from "./SalesRepwise";
import Header from "./Header";
import { useSalesReport } from "../../context/SalesAnalysisReport";
import SalesAnalyticsReport from "../../analytics/SalesAnalysisReport";
import Loader from "../shared/Loader";
import { ChartCard, ChartSkeleton, Root } from "../../styled/Customstyled";

export default function SalesAnalysisReport() {
  const { rawData } = useSalesReport();
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedValue, setSelectedValue] = useState("all");

  const dateFilter = useMemo(
    () => ({
      currentYear,
      currentMonth: currentMonth,
    }),
    [currentYear, currentMonth]
  );

  const SalesAnalytics = useMemo(() => {
    return new SalesAnalyticsReport(rawData, dateFilter);
  }, [rawData, dateFilter]);

  const YearlySalesData = useMemo(() => {
    return SalesAnalytics.GetGroupByYear(selectedValue);
  }, [SalesAnalytics, selectedValue]);

  const LocationWieseSalesData = useMemo(() => {
    return SalesAnalytics.GetLocationWieseSale();
  }, [SalesAnalytics]);

  const Top10CustomersData = useMemo(() => {
    return SalesAnalytics.GetTop10CustomersByYear();
  }, [SalesAnalytics]);

  const Top10CategoryData = useMemo(() => {
    return SalesAnalytics.GetTop10Category();
  }, [SalesAnalytics]);

  const TopVendorData = useMemo(() => {
    return SalesAnalytics.GetTopVendorBySales();
  }, [SalesAnalytics]);

  const SalesRepWiseData = useMemo(() => {
    return SalesAnalytics.GetSalesRepWise();
  }, [SalesAnalytics]);

  if (!Array.isArray(rawData)) {
    return <Loader msg="Loading Sales Data" />;
  }

  return (
    <Root marginBottom={process.env.NODE_ENV === "production" ? "3rem" : "0"}>
      <Header CurrentMonth={currentMonth} CurrentYear={currentYear} setCurrentMonth={setCurrentMonth} setCurrentYear={setCurrentYear} />
      <Grid container spacing={3}>
        <Grid item md={12} xs={12}>
          <ChartCard>
            <MonthWiseSalesArearChart currentMonth={currentMonth} currentYear={currentYear} selectedValue={selectedValue} setSelectedValue={setSelectedValue} YearlySalesData={YearlySalesData} />
          </ChartCard>
        </Grid>
        <Grid item md={5} xs={12}>
          <ChartCard>
            <LocationWiesSales LocationWieseSalesData={LocationWieseSalesData} />
          </ChartCard>
        </Grid>
        <Grid item md={7} xs={12}>
          <ChartCard>
            <Top10Customers Top10CustomersData={Top10CustomersData} month={currentMonth} />
          </ChartCard>
        </Grid>
        <Grid item md={4} xs={12}>
          <ChartCard>
            <Top10Category Top10CategoryData={Top10CategoryData} />
          </ChartCard>
        </Grid>
        <Grid item md={4} xs={12}>
          <ChartCard>
            <SalesByVendor TopVendorData={TopVendorData} />
          </ChartCard>
        </Grid>
        <Grid item md={4} xs={12}>
          <ChartCard>
            <SalesRepwise SalesRepWiseData={SalesRepWiseData} />
          </ChartCard>
        </Grid>
      </Grid>
    </Root>
  );
}
