import React, { useState, useMemo } from "react";
import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQcReport } from "../../context/QcReport";
import QcRejectAnalytics from "../../analytics/QcReport";
import Header from "./Header";
import KpiCards from "./KpiCards";
import CategoryQCChart from "./CategoryQCChart";
import DefectsByTypeChart from "./DefectsByTypeChart";
import MonthlyTrendChart from "./MonthlyTrendChart";
import QCDispositionChart from "./QCDispositionChart";
import SkuBatchRejectionChart from "./SkuBatchRejectionChart";
import InspectionTrendChart from "./InspectionTrendChart";
import Loader from "../shared/Loader";

const RootContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  maxHeight: "100vh",
  overflow: "hidden",
  boxSizing: "border-box",
  padding: theme.spacing(2),
  // backgroundColor: "#f8fafc",
  backgroundColor: "#fff",
  display: "flex",
  borderRadius: "0px",
  flexDirection: "column",
}));

const SectionContainer = styled(Paper)(({ theme }) => ({
  borderRadius: "0px",
  backgroundColor: "#ffffff",
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  display: "flex",
  width: "100%",
}));

export default function QcAnalysisMain() {
  const { rawData, loading, refetch } = useQcReport();

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const analytics = useMemo(() => {
    return new QcRejectAnalytics(rawData, dateRange);
  }, [rawData, dateRange]);

  const kpis = useMemo(() => analytics.getKpiMetrics(), [analytics]);
  const categoryQCData = useMemo(
    () => analytics.getCategoryQCAnalysis(),
    [analytics],
  );
  const defectData = useMemo(() => analytics.getDefectsByType(), [analytics]);
  const monthlyData = useMemo(
    () => analytics.getMonthlyRejectionTrend(),
    [analytics],
  );
  const dispositionData = useMemo(
    () => analytics.getQCDisposition(),
    [analytics],
  );
  const skuData = useMemo(() => analytics.getSkuBatchAnalysis(), [analytics]);

  if (loading && (!rawData || rawData.length === 0)) {
    return <Loader msg="Loading QC Inspection Data..." />;
  }

  return (
    <RootContainer>
      {/* 1. Top Header with Title and RangeDatePicker */}
      <Header
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={refetch}
      />

      {/* 2. Unified Horizontal KPI Strip */}
      <Box
        flexShrink={0}
        sx={{
          borderRadius: "0px",
        }}
      >
        <KpiCards kpiData={kpis} />
      </Box>

      {/* 3. Non-scrolling Charts Container */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Middle Row: QC disposition (Left) + QC results by jewellery category (Right) */}
        <SectionContainer elevation={0} sx={{ flex: 1.15, minHeight: 0,
          borderTop:'none'
         }}>
          <Box
            sx={{
              flex: { xs: 1, md: 0.78 },
              minHeight: 0,
              minWidth: 0,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <QCDispositionChart
              dispositionData={dispositionData}
              totalCount={kpis.totalInspected}
              passRate={kpis.passRate}
              rejectionRatio={kpis.rejectionRatio}
              topDefect={kpis.topDefect}
            />
          </Box>
          <Box
            sx={{
              flex: { xs: 1, md: 1.22 },
              minHeight: 0,
              minWidth: 0,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <CategoryQCChart categoryData={categoryQCData} />
          </Box>
          <Box
            sx={{
              flex: { xs: 0.7, md: 0.8 },
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <InspectionTrendChart analytics={analytics} />
          </Box>
        </SectionContainer>

        {/* Bottom Row: Defects by Type + Monthly Trend + Sku/Batch Rejection */}
        <SectionContainer elevation={0} sx={{ flex: 0.85, minHeight: 0 ,
          borderTop:'none'
         }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <DefectsByTypeChart defectData={defectData} />
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <MonthlyTrendChart
              monthlyData={monthlyData}
              analytics={analytics}
            />
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
            <SkuBatchRejectionChart skuData={skuData} />
          </Box>
        </SectionContainer>
      </Box>
    </RootContainer>
  );
}
